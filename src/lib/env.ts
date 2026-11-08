export const env = {
  get supabaseUrl() { const value = process.env.EXPO_PUBLIC_SUPABASE_URL; if (!value) throw new Error('EXPO_PUBLIC_SUPABASE_URL is missing. Copy .env.example to .env.'); return value; },
  get supabaseAnonKey() {
    const value = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY;
    if (!value) throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. Copy .env.example to .env.');
    return value;
  },
};
