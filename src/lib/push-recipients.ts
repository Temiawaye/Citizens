export interface PushRecipient { id: string; user_id: string; token: string }
export function excludeReporterDevices(tokens: PushRecipient[], reporterId: string) { return tokens.filter((token) => token.user_id !== reporterId); }
