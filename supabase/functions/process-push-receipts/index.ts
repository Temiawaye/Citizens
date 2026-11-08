import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async (request) => {
  if (request.headers.get('authorization') !== `Bearer ${Deno.env.get('RECEIPT_PROCESSOR_SECRET')}`) return new Response('Unauthorized', { status: 401 });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: due } = await db.from('push_receipts').select('ticket_id,token_id,attempts').lte('next_attempt_at', new Date().toISOString()).limit(1000);
  if (!due?.length) return Response.json({ processed: 0 });
  const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: due.map((row) => row.ticket_id) }) });
  if (!response.ok) return new Response('Expo receipt request failed', { status: 502 });
  const { data } = await response.json() as { data: Record<string, { status: string; details?: { error?: string } }> };
  for (const row of due) {
    const receipt = data[row.ticket_id];
    if (receipt?.details?.error === 'DeviceNotRegistered') await db.from('push_tokens').delete().eq('id', row.token_id);
    if (receipt || row.attempts >= 5) await db.from('push_receipts').delete().eq('ticket_id', row.ticket_id);
    else await db.from('push_receipts').update({ attempts: row.attempts + 1, next_attempt_at: new Date(Date.now() + Math.min(3600, 30 * 2 ** row.attempts) * 1000).toISOString() }).eq('ticket_id', row.ticket_id);
  }
  return Response.json({ processed: due.length });
});
