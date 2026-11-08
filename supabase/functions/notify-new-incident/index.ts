import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebhookPayload { type: 'INSERT'; table: 'incidents'; schema: 'public'; record: { id: string; user_id: string } }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.headers.get('x-webhook-secret') !== Deno.env.get('INCIDENT_WEBHOOK_SECRET')) return json({ error: 'Unauthorized' }, 401);
  const payload = await request.json() as WebhookPayload;
  if (payload.type !== 'INSERT' || payload.table !== 'incidents' || payload.schema !== 'public' || !payload.record?.id) return json({ error: 'Invalid payload' }, 400);
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const claim = await supabase.from('notification_deliveries').insert({ incident_id: payload.record.id });
  if (claim.error?.code === '23505') return json({ duplicate: true });
  if (claim.error) return json({ error: claim.error.message }, 500);
  const { data: incident, error: incidentError } = await supabase.from('incidents').select('id,user_id,title,category').eq('id', payload.record.id).single();
  if (incidentError || !incident || incident.user_id !== payload.record.user_id) return json({ error: 'Incident verification failed' }, 400);
  const { data: tokens, error: tokenError } = await supabase.from('push_tokens').select('id,token').neq('user_id', incident.user_id);
  if (tokenError) return json({ error: tokenError.message }, 500);
  for (let index = 0; index < (tokens?.length ?? 0); index += 100) {
    const batch = tokens!.slice(index, index + 100);
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(batch.map(({ token }) => ({ to: token, sound: 'default', title: incident.category, body: incident.title, data: { incidentId: incident.id } }))) });
      if (response.ok || response.status < 500) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
    if (!response?.ok) return json({ error: `Expo rejected batch: ${response?.status}` }, 502);
    const result = await response.json() as { data: Array<{ status: string; id?: string; details?: { error?: string } }> };
    const receipts = result.data.flatMap((ticket, i) => ticket.status === 'ok' && ticket.id ? [{ ticket_id: ticket.id, token_id: batch[i].id }] : []);
    const invalidIds = result.data.flatMap((ticket, i) => ticket.details?.error === 'DeviceNotRegistered' ? [batch[i].id] : []);
    if (receipts.length) await supabase.from('push_receipts').upsert(receipts);
    if (invalidIds.length) await supabase.from('push_tokens').delete().in('id', invalidIds);
  }
  await supabase.from('notification_deliveries').update({ completed_at: new Date().toISOString() }).eq('incident_id', incident.id);
  return json({ sent: tokens?.length ?? 0 });
});
