import { create } from 'zustand';
import { supabase } from '../config/supabase';

export type SavingGoal = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  created_at?: string;
};

export type SavingTransaction = {
  id: string;
  saving_id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  note: string;
  created_at: string;
};

interface SavingState {
  savings: SavingGoal[];
  currentHistory: SavingTransaction[];
  isLoading: boolean;
  error: string | null;

  fetchSavings: () => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, 'id' | 'user_id' | 'current_amount' | 'created_at'>) => Promise<boolean>;
  topUpSaving: (id: string, additionalAmount: number, note: string) => Promise<boolean>;
  deleteSavingGoal: (id: string) => Promise<boolean>;
  fetchSavingHistory: (savingId: string) => Promise<void>;
}

export const useSavingStore = create<SavingState>((set, get) => ({
  savings: [],
  currentHistory: [],
  isLoading: false,
  error: null,

  fetchSavings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal.');

      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ savings: data as SavingGoal[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addSavingGoal: async (newGoal) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal.');

      const { error } = await supabase
        .from('savings')
        .insert([{ ...newGoal, current_amount: 0, user_id: userData.user.id }]);

      if (error) throw error;
      await get().fetchSavings();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  topUpSaving: async (id, additionalAmount, note) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal.');

      const targetSaving = get().savings.find(s => s.id === id);
      if (!targetSaving) throw new Error('Target tabungan tidak ditemukan.');

      const updatedAmount = Number(targetSaving.current_amount) + Number(additionalAmount);

      const { error: updateError } = await supabase
        .from('savings')
        .update({ current_amount: updatedAmount })
        .eq('id', id);
      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('saving_transactions')
        .insert([{
          saving_id: id,
          user_id: userData.user.id,
          amount: additionalAmount,
          type: 'income',
          note: note
        }]);
      if (insertError) throw insertError;

      await get().fetchSavings();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteSavingGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from('savings').delete().eq('id', id);
      if (error) throw error;
      await get().fetchSavings();
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  fetchSavingHistory: async (savingId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('saving_transactions')
        .select('*')
        .eq('saving_id', savingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ currentHistory: data as SavingTransaction[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  }
}));