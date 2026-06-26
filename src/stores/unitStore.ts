import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { usePropertyStore } from './propertyStore';

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  property?: string; // Derived name for UI mapping
  type?: string;     // Derived for UI
  tenant?: string;   // Derived for UI
}

interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
  fetchUnits: () => Promise<void>;
  addUnit: (u: Omit<Unit, 'id' | 'property' | 'type' | 'tenant'>) => Promise<{ error?: string }>;
  updateUnit: (id: string, updates: Partial<Unit>) => Promise<{ error?: string }>;
  removeUnit: (id: string) => Promise<{ error?: string }>;
}

export const useUnitStore = create<UnitState>()((set, get) => ({
  units: [],
  loading: false,
  error: null,

  fetchUnits: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          properties(name),
          leases(tenants(full_name))
        `);

      if (error) {
        console.error('[unitStore] fetchUnits error:', error);
        throw error;
      }

      const mapped = (data || []).map(u => {
        // Find the active lease, or just the first lease if none specified
        const lease = u.leases?.[0];
        const tenantName = lease?.tenants?.full_name || undefined;

        return {
          ...u,
          property: u.properties?.name || 'Unknown',
          type: 'Residential', // Defaulting since we don't have this in schema yet
          tenant: tenantName,
        };
      });

      set({ units: mapped as Unit[] });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addUnit: async (u) => {
    try {
      const { error } = await supabase
        .from('units')
        .insert(u);

      if (error) throw error;
      await get().fetchUnits();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  updateUnit: async (id, updates) => {
    try {
      // Strip derived fields before sending to DB
      const { property, type, tenant, ...dbUpdates } = updates;
      
      const { error } = await supabase
        .from('units')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchUnits();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  removeUnit: async (id) => {
    try {
      // Block deletion if there is an active lease on this unit
      const { data: activeLeases } = await supabase
        .from('leases').select('id').eq('unit_id', id).eq('is_active', true);
      if (activeLeases?.length) {
        return { error: 'Cannot delete: unit has an active tenant. Remove the tenant\'s lease first.' };
      }

      // Cascade: maintenance requests → inactive leases → unit
      await supabase.from('maintenance_requests').delete().eq('unit_id', id);
      await supabase.from('leases').delete().eq('unit_id', id);

      const { error } = await supabase.from('units').delete().eq('id', id);
      if (error) throw error;

      await get().fetchUnits();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  }
}));
