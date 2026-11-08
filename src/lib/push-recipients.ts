export interface PushRecipient {
  id: string;
  user_id: string;
  token: string;
}
/** Removes a report author's devices from a notification recipient list. */
export function excludeReporterDevices(
  tokens: PushRecipient[],
  reporterId: string,
) {
  return tokens.filter((token) => token.user_id !== reporterId);
}
