import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js'; 

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setAuth: (user: User | null, session: Session | null) => void;
  setLoading: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true, 
  setAuth: (user, session) => set({ user, session, isLoading: false }),
  setLoading: (status) => set({ isLoading: status }),
}));