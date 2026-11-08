import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env } from '@/lib/env';
import { secureStorage } from '@/lib/secure-storage';
import type { Database } from '@/types/database';

export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { storage: secureStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
