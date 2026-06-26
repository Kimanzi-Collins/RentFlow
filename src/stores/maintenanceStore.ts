import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface Ticket {
  id: string;
  title: string;
  unit: string;
  property: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'resolved';
  description: string;
  assignee: string;
}

interface MaintenanceState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;

  fetchTickets: () => Promise<void>;
  addTicket: (t: Omit<Ticket, 'id' | 'date'>) => Promise<{ error?: string }>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<{ error?: string }>;
  deleteTicket: (id: string) => Promise<{ error?: string }>;
}

export const useMaintenanceStore = create<MaintenanceState>()((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    const { isDemoMode } = useAuthStore.getState();
    if (isDemoMode) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          units (
            unit_number,
            properties (name)
          )
        `);

      if (error) {
        console.error('[maintenanceStore] fetch error:', error);
        throw error;
      }

      const tickets: Ticket[] = (data || []).map(t => ({
        id: t.id,
        title: t.issue_description.split('\n')[0] || 'Maintenance Request',
        unit: t.units?.unit_number || 'Unknown Unit',
        property: t.units?.properties?.name || 'Unknown Property',
        date: t.created_at.split('T')[0],
        priority: t.priority === 'high' ? 'High' : t.priority === 'low' ? 'Low' : 'Medium',
        status: t.status === 'open' ? 'pending' : t.status === 'in_progress' ? 'in-progress' : 'resolved',
        description: t.issue_description,
        assignee: t.assigned_to || 'Unassigned',
      }));

      set({ tickets, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addTicket: async (t) => {
    try {
      // Find unit_id somehow? The UI only gives us 'unit' string.
      // This is a common issue when forms only return strings instead of IDs.
      // We'll need to look it up in Supabase if we don't have the ID, or
      // maybe the caller is passing the unit_id in the 'unit' field.
      // For now, let's assume 'unit' field contains the unit_id from the dropdown.
      
      const payload = {
        unit_id: t.unit, 
        issue_description: `${t.title}\n\n${t.description}`,
        priority: t.priority.toLowerCase(),
        status: t.status === 'pending' ? 'open' : t.status === 'in-progress' ? 'in_progress' : 'resolved'
      };

      const { error } = await supabase
        .from('maintenance_requests')
        .insert(payload);

      if (error) {
        console.error('[maintenanceStore] add error:', error);
        throw error;
      }
      
      await get().fetchTickets();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  updateTicket: async (id, updates) => {
    try {
      const payload: any = {};
      if (updates.status) {
        payload.status = updates.status === 'pending' ? 'open' : updates.status === 'in-progress' ? 'in_progress' : 'resolved';
      }
      if (updates.priority) {
        payload.priority = updates.priority.toLowerCase();
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchTickets();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  deleteTicket: async (id) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchTickets();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },
}));
