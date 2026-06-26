import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface Property {
  id: string;
  landlord_id: string;
  name: string;
  address: string;
  total_units: number;
  type?: string;
  description?: string;
  occupied?: number; // Derived/Joined field
}

interface PropertyState {
  properties: Property[];
  loading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  addProperty: (p: Omit<Property, 'id' | 'landlord_id'>) => Promise<{ error?: string }>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<{ error?: string }>;
  removeProperty: (id: string) => Promise<{ error?: string }>;
}

export const usePropertyStore = create<PropertyState>()((set, get) => ({
  properties: [],
  loading: false,
  error: null,

  fetchProperties: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`*, units(count)`); // we could join to get occupied count, but for now we'll just fetch properties

      if (error) throw error;
      
      // Calculate occupied units locally or just map it
      const mapped = (data || []).map(p => ({
        ...p,
        occupied: p.units?.[0]?.count || 0
      }));

      set({ properties: mapped as Property[] });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addProperty: async (p) => {
    const { profile } = useAuthStore.getState();
    if (!profile) return { error: 'Not authenticated' };

    try {
      const landlord_id = profile.role === 'caretaker' ? profile.landlord_id : profile.id;

      // Only send columns that exist in the Supabase properties table
      const dbPayload = {
        name: p.name,
        address: p.address,
        total_units: p.total_units,
      };

      const { error } = await supabase
        .from('properties')
        .insert({ ...dbPayload, landlord_id });

      if (error) {
        console.error('[propertyStore] addProperty error:', error);
        throw error;
      }
      await get().fetchProperties();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  updateProperty: async (id, updates) => {
    try {
      // Only send columns that exist in the Supabase properties table
      const dbPayload: any = {};
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.address !== undefined) dbPayload.address = updates.address;
      if (updates.total_units !== undefined) dbPayload.total_units = updates.total_units;

      const { error } = await supabase
        .from('properties')
        .update(dbPayload)
        .eq('id', id);

      if (error) {
        console.error('[propertyStore] updateProperty error:', error);
        throw error;
      }
      await get().fetchProperties();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  removeProperty: async (id) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchProperties();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  }
}));
