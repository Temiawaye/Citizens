import { useEffect } from 'react';

import { queryClient } from '@/lib/query-client';
import { supabase } from '@/lib/supabase';
import { unregisterPushToken } from '@/lib/notifications';
import { useAuthStore } from '@/store/auth-store';

export function useAuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setInitialized(true); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [setInitialized, setSession]);
}

export function useAuth() {
  const state = useAuthStore();
  const signOut = async () => {
    await unregisterPushToken();
    const result = await supabase.auth.signOut();
    queryClient.clear();
    return result;
  };
  return { ...state, signOut };
}
