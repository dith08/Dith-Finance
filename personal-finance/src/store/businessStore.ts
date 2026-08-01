import { create } from 'zustand';
import { supabase } from '../config/supabase';

export type Business = {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  created_at?: string;
};

export type BusinessMetric = {
  id: string;
  business_id: string;
  user_id: string;
  record_date: string;
  gross_revenue: number;
  operational_cost: number;
  burn_rate: number;
  cash_balance: number;
  evaluation_note: string | null;
  created_at?: string;
};

interface BusinessState {
  businesses: Business[];
  currentMetrics: BusinessMetric[];
  selectedBusinessId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchBusinesses: () => Promise<void>;
  addBusiness: (name: string, imageUrl?: string) => Promise<boolean>;
  updateBusiness: (id: string, name: string, imageUrl?: string) => Promise<boolean>;
  deleteBusiness: (id: string) => Promise<boolean>;
  setSelectedBusiness: (id: string) => void;

  fetchMetricsByBusiness: (businessId: string) => Promise<void>;
  addMetric: (metric: Omit<BusinessMetric, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateMetric: (id: string, metric: Omit<BusinessMetric, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;

  getAllBusinessMetrics: () => Promise<BusinessMetric[]>;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  currentMetrics: [],
  selectedBusinessId: null,
  isLoading: false,
  error: null,

  fetchBusinesses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal.');

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const fetchedBusinesses = data as Business[];
      set({ businesses: fetchedBusinesses, isLoading: false });

      if (fetchedBusinesses.length > 0 && !get().selectedBusinessId) {
        get().setSelectedBusiness(fetchedBusinesses[0].id);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addBusiness: async (name, imageUrl) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal.');

      const { error } = await supabase
        .from('businesses')
        .insert([{ name, image_url: imageUrl || null, user_id: userData.user.id }]);

      if (error) throw error;
      await get().fetchBusinesses();
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateBusiness: async (id, name, imageUrl) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ name, image_url: imageUrl || null })
        .eq('id', id);

      if (error) throw error;
      await get().fetchBusinesses();
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteBusiness: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ selectedBusinessId: null, currentMetrics: [] });
      await get().fetchBusinesses();
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  setSelectedBusiness: (id) => {
    set({ selectedBusinessId: id });
    get().fetchMetricsByBusiness(id);
  },

  fetchMetricsByBusiness: async (businessId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('business_id', businessId)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ currentMetrics: data as BusinessMetric[], isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addMetric: async (newMetric) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal.');

      const { error: insertError } = await supabase
        .from('business_metrics')
        .insert([{ ...newMetric, user_id: userData.user.id }]);

      if (insertError) throw insertError;

      const { data, error: fetchError } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('business_id', newMetric.business_id)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      set({ currentMetrics: data as BusinessMetric[], isLoading: false });
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateMetric: async (id, newMetric) => {
    set({ isLoading: true, error: null });
    try {
      const { error: updateError } = await supabase
        .from('business_metrics')
        .update(newMetric)
        .eq('id', id);

      if (updateError) throw updateError;

      const { data, error: fetchError } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('business_id', newMetric.business_id)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      set({ currentMetrics: data as BusinessMetric[], isLoading: false });
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  getAllBusinessMetrics: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Otorisasi gagal.');

      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessMetric[];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil semua metrik bisnis';
      console.error(errorMessage);
      return [];
    }
  }
}));