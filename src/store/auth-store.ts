import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  session: Session | null;
  initialized: boolean;
  pendingRoute: string | null;
  setSession: (session: Session | null) => void;
  setInitialized: (initialized: boolean) => void;
  setPendingRoute: (route: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  pendingRoute: null,
  setSession: (session) => set({ session }),
  setInitialized: (initialized) => set({ initialized }),
  setPendingRoute: (pendingRoute) => set({ pendingRoute }),
}));
