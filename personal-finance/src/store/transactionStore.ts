import { create } from 'zustand';
import { supabase } from '../config/supabase';

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  type: 'income' | 'expense';
  created_at?: string;
};

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal. Sesi tidak ditemukan.');

      const { data, error } = await supabase
        .from('personal_transactions')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      set({ transactions: data as Transaction[], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error("Gagal menarik data:", error.message);
    }
  },

  addTransaction: async (newTx) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal. Sesi tidak ditemukan.');

      const { data, error } = await supabase
        .from('personal_transactions')
        .insert([{ ...newTx, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ 
        transactions: [data as Transaction, ...state.transactions], 
        isLoading: false 
      }));
      
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error("Gagal menambah data:", error.message);
      return false;
    }
  },

  updateTransaction: async (id, newTx) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal. Sesi tidak ditemukan.');

      const { error } = await supabase
        .from('personal_transactions')
        .update(newTx)
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.map((t) => t.id === id ? { ...t, ...newTx } : t),
        isLoading: false
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error("Gagal update data:", error.message);
      return false;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal. Sesi tidak ditemukan.');

      const { error } = await supabase
        .from('personal_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error("Gagal menghapus data:", error.message);
      return false;
    }
  }
}));
