import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';
import { useUnitStore } from './unitStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantConfig {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number: string;
  unit: string;
  property: string;
  status: 'active' | 'inactive';
  rent_amount: number;
  water_rate: number;
  initial_water_reading: number;
  move_in_date: string;
}

export interface RentTransaction {
  id: string;
  amount: number;
  method: string;
  date: string;
  reference: string;
  note?: string;
}

export interface RentRecord {
  id: string;
  tenant_id: string;
  period: string;
  period_key: string;
  rent_due: number;
  amount_paid: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
  transactions: RentTransaction[];
}

export interface WaterReading {
  id: string;
  tenant_id: string;
  unit: string;
  period: string;
  period_key: string;
  prev_reading: number;
  curr_reading: number;
  units_consumed: number;
  rate: number;
  amount: number;      // total bill (consumed × rate)
  amount_paid: number; // how much has been paid so far
  balance: number;     // amount - amount_paid
  status: 'outstanding' | 'partial' | 'paid';
  billed_date: string;
}

// ─── Period helpers ───────────────────────────────────────────────────────────

export function makePeriodKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function makePeriodLabel(year: number, month: number): string {
  const d = new Date(year, month - 1);
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function parsePeriodKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m };
}

export function getAvailablePeriods(): { key: string; label: string; year: number; month: number }[] {
  const periods = [];
  const startYear = 2026;
  const startMonth = 1;
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  for (let y = startYear; y <= endYear; y++) {
    for (let m = (y === startYear ? startMonth : 1); m <= (y === endYear ? endMonth : 12); m++) {
      periods.push({
        key: makePeriodKey(y, m),
        label: makePeriodLabel(y, m),
        year: y,
        month: m,
      });
    }
  }
  return periods.reverse();
}

export const CURRENT_PERIOD_KEY = (() => {
  const now = new Date();
  return makePeriodKey(now.getFullYear(), now.getMonth() + 1);
})();

// ─── Store ────────────────────────────────────────────────────────────────────

interface BillingState {
  tenants: TenantConfig[];
  rentRecords: RentRecord[];
  waterReadings: WaterReading[];
  loading: boolean;
  error: string | null;

  fetchBillingData: () => Promise<void>;

  addTenant: (t: Omit<TenantConfig, 'id'>) => Promise<void>;
  updateTenant: (id: string, updates: Partial<TenantConfig>) => Promise<void>;
  removeTenant: (id: string) => Promise<void>;

  ensureRentRecord: (tenantId: string, year: number, month: number) => void;
  recordPayment: (tenantId: string, periodKey: string, amount: number, method: string, note?: string) => void;

  recordWaterReading: (tenantId: string, unit: string, year: number, month: number, currReading: number, rateOverride?: number) => void;
  getLastWaterReading: (tenantId: string) => WaterReading | null;

  getRentForPeriod: (pKey: string) => Array<RentRecord & { tenant: TenantConfig }>;
  getWaterForPeriod: (pKey: string) => Array<WaterReading & { tenant: TenantConfig }>;
  getTenantRentHistory: (tenantId: string) => RentRecord[];
  getTenantWaterHistory: (tenantId: string) => WaterReading[];
  getTenantOutstanding: (tenantId: string) => number;
  /** Record a (partial or full) payment against a specific water reading. */
  recordWaterPayment: (readingId: string, amount: number) => Promise<{ error?: string }>;
  /** Convenience: marks the full outstanding balance of a tenant's period reading as paid. */
  markWaterPaid: (tenantId: string, periodKey: string) => Promise<void>;
}

export const useBillingStore = create<BillingState>()((set, get) => ({
  tenants: [],
  rentRecords: [],
  waterReadings: [],
  loading: false,
  error: null,

  fetchBillingData: async () => {
    const { isDemoMode } = useAuthStore.getState();
    console.log('[billingStore] fetchBillingData called, isDemoMode:', isDemoMode);
    if (isDemoMode) {
      console.warn('[billingStore] Skipping fetch because isDemoMode is true. If you are logged in with a real account, clear localStorage key "rentflow-auth" and reload.');
      return;
    }

    set({ loading: true, error: null });
    try {
      // 0. Auto-generate missing rent bills for the current period
      const now = new Date();
      const pKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const pName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      await supabase.rpc('generate_monthly_bills', { target_period_key: pKey, target_period_name: pName });

      // 1. Fetch Tenants & Leases
      const { data: tenantsData, error: tErr } = await supabase
        .from('tenants')
        .select(`
          id, full_name, email, phone, national_id,
          leases (
            id, start_date, rent_amount, is_active, water_rate, initial_water_reading,
            units (
              unit_number,
              properties (name)
            )
          )
        `);

      if (tErr) throw tErr;

      const tenants: TenantConfig[] = (tenantsData || []).map(t => {
        const lease = t.leases?.[0] || {};
        const unit = lease.units || {};
        const property = unit.properties || {};

        const [first_name, ...lastNameParts] = (t.full_name || '').split(' ');
        const last_name = lastNameParts.join(' ');

        return {
          id: t.id,
          first_name: first_name || 'Unknown',
          last_name: last_name || '',
          email: t.email || '',
          phone: t.phone || '',
          id_number: t.national_id || '',
          unit: unit.unit_number || 'Unassigned',
          property: property.name || 'Unknown Property',
          status: (lease.is_active === false) ? 'inactive' : 'active',
          rent_amount: Number(lease.rent_amount) || 0,
          water_rate: lease.water_rate !== undefined ? Number(lease.water_rate) : 150,
          initial_water_reading: lease.initial_water_reading !== undefined ? Number(lease.initial_water_reading) : 0,
          move_in_date: lease.start_date || '',
        };
      });

      // 2. Fetch Rent Records & Transactions
      const { data: rentData, error: rErr } = await supabase
        .from('rent_records')
        .select(`
          id, tenant_id, period, period_key, rent_due, amount_paid, status,
          rent_transactions (
            id, amount, payment_method, payment_date, reference_number, note
          )
        `);
      if (rErr) throw rErr;

      const rentRecords: RentRecord[] = (rentData || []).map(r => ({
        id: r.id,
        tenant_id: r.tenant_id,
        period: r.period,
        period_key: r.period_key,
        rent_due: Number(r.rent_due),
        amount_paid: Number(r.amount_paid),
        balance: Number(r.rent_due) - Number(r.amount_paid),
        status: r.status as 'paid' | 'partial' | 'unpaid',
        transactions: (r.rent_transactions || []).map((txn: any) => ({
          id: txn.id,
          amount: Number(txn.amount),
          method: txn.payment_method,
          date: txn.payment_date,
          reference: txn.reference_number || '',
          note: txn.note || '',
        })),
      })).filter(r => r.tenant_id);

      // 3. Fetch Water Readings
      const { data: waterData, error: wErr } = await supabase
        .from('meter_readings')
        .select(`
          id, reading_date, previous_reading, current_reading, consumption, rate, total_amount, is_billed, amount_paid, period, period_key,
          units ( unit_number, leases ( tenant_id ) )
        `)
        .eq('meter_type', 'water');
      if (wErr) throw wErr;

      const waterReadings: WaterReading[] = (waterData || []).map(w => {
        const date = new Date(w.reading_date || new Date());
        const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const periodName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        const tenantId  = w.units?.leases?.[0]?.tenant_id || 'unknown';
        const totalAmt  = Number(w.total_amount   || 0);
        const paidAmt   = Number(w.amount_paid    || 0);
        const balance   = Math.max(0, totalAmt - paidAmt);

        return {
          id: w.id,
          tenant_id: tenantId,
          unit: w.units?.unit_number || 'Unknown',
          period: periodName,
          period_key: periodKey,
          prev_reading: Number(w.previous_reading),
          curr_reading: Number(w.current_reading),
          units_consumed: Number(w.consumption),
          rate: Number(w.rate),
          amount:      totalAmt,
          amount_paid: paidAmt,
          balance,
          status: balance <= 0 ? 'paid' : (paidAmt > 0 ? 'partial' : 'outstanding'),
          billed_date: w.reading_date || '',
        };
      });

      set({ tenants, rentRecords, waterReadings, loading: false });
    } catch (err) {
      console.error('Error fetching billing data:', err);
      set({ error: (err as Error).message, loading: false });
    }
  },

  addTenant: async (t) => {
    const { profile } = useAuthStore.getState();
    if (!profile) return;
    const landlord_id = profile.role === 'caretaker' ? profile.landlord_id : profile.id;

    try {
      // 1. Insert tenant
      const { data: tenantData, error: tErr } = await supabase.from('tenants').insert({
        landlord_id,
        full_name: `${t.first_name} ${t.last_name}`.trim(),
        email: t.email,
        phone: t.phone,
        national_id: t.id_number
      }).select('id').single();
      if (tErr) throw tErr;

      // 2. Find unit ID to create lease
      if (t.unit) {
        const { units } = useUnitStore.getState();
        const unit = units.find(u => u.unit_number === t.unit);
        if (unit) {
          const { error: lErr } = await supabase.from('leases').insert({
            tenant_id: tenantData.id,
            unit_id: unit.id,
            start_date: t.move_in_date || new Date().toISOString().split('T')[0],
            rent_amount: t.rent_amount,
            deposit_amount: 0,
            is_active: t.status === 'active',
            water_rate: t.water_rate || 150,
            initial_water_reading: t.initial_water_reading || 0
          });
          if (lErr) throw lErr;
          
          await supabase.from('units').update({ status: 'occupied' }).eq('id', unit.id);
        }
      }
      await get().fetchBillingData();
      return {};
    } catch (err) {
      console.error('Failed to add tenant:', err);
      return { error: (err as Error).message };
    }
  },

  updateTenant: async (id, updates) => {
    try {
      // 1. Update tenants table if relevant fields provided
      if (updates.first_name !== undefined || updates.last_name !== undefined || updates.email !== undefined || updates.phone !== undefined || updates.id_number !== undefined) {
        const tenantToUpdate = get().tenants.find(t => t.id === id);
        if (tenantToUpdate) {
          const fn = updates.first_name !== undefined ? updates.first_name : tenantToUpdate.first_name;
          const ln = updates.last_name !== undefined ? updates.last_name : tenantToUpdate.last_name;
          const { error: tErr } = await supabase.from('tenants').update({
            full_name: `${fn} ${ln}`.trim(),
            email: updates.email !== undefined ? updates.email : tenantToUpdate.email,
            phone: updates.phone !== undefined ? updates.phone : tenantToUpdate.phone,
            national_id: updates.id_number !== undefined ? updates.id_number : tenantToUpdate.id_number
          }).eq('id', id);
          if (tErr) { console.error(tErr); return { error: tErr.message }; }
        }
      }

      // 2. Update leases table if rent_amount, status, water_rate, or initial_water_reading provided
      if (updates.rent_amount !== undefined || updates.status !== undefined || updates.water_rate !== undefined || updates.initial_water_reading !== undefined) {
        const leaseUpdates: any = {};
        if (updates.rent_amount !== undefined) leaseUpdates.rent_amount = updates.rent_amount;
        if (updates.status !== undefined) leaseUpdates.is_active = updates.status === 'active';
        if (updates.water_rate !== undefined) leaseUpdates.water_rate = updates.water_rate;
        if (updates.initial_water_reading !== undefined) leaseUpdates.initial_water_reading = updates.initial_water_reading;

        // Note: The UI just gives us tenant ID. We need to update the active lease for this tenant.
        const { error: lErr } = await supabase.from('leases').update(leaseUpdates).eq('tenant_id', id).eq('is_active', true);
        if (lErr) { console.error(lErr); return { error: lErr.message }; }
      }

      await get().fetchBillingData();
      return {};
    } catch (err) {
      console.error('Failed to update tenant:', err);
      return { error: (err as Error).message };
    }
  },

  removeTenant: async (id) => {
    try {
      // Cascade: must delete child rows before the parent tenant row.
      // Order: rent_transactions → rent_records → leases → tenant

      // 1. Capture unit_id from lease so we can mark it vacant afterwards
      const { data: leases } = await supabase
        .from('leases').select('unit_id').eq('tenant_id', id);

      // 2. Delete rent_transactions → rent_records
      const { data: records } = await supabase
        .from('rent_records').select('id').eq('tenant_id', id);
      if (records?.length) {
        await supabase.from('rent_transactions')
          .delete().in('rent_record_id', records.map(r => r.id));
      }
      await supabase.from('rent_records').delete().eq('tenant_id', id);

      // 3. Delete leases then mark the unit vacant
      await supabase.from('leases').delete().eq('tenant_id', id);
      if (leases?.length) {
        for (const lease of leases) {
          await supabase.from('units').update({ status: 'vacant' }).eq('id', lease.unit_id);
        }
      }

      // 4. Finally delete the tenant
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;

      await get().fetchBillingData();
      return {};
    } catch (err) {
      console.error('Failed to remove tenant:', err);
      return { error: (err as Error).message };
    }
  },

  ensureRentRecord: async (tenantId, year, month) => {
    try {
      const periodKey = `${year}-${String(month).padStart(2, '0')}`;
      const periodLabel = makePeriodLabel(year, month);

      const { rentRecords, tenants } = get();
      const exists = rentRecords.some(r => r.tenant_id === tenantId && r.period_key === periodKey);

      if (!exists) {
        const tenant = tenants.find(t => t.id === tenantId);
        if (tenant) {
          // Never create a rent record for a period before the tenant's move-in date
          if (tenant.move_in_date) {
            const moveInKey = tenant.move_in_date.slice(0, 7); // "2026-05"
            if (periodKey < moveInKey) return;
          }
          await supabase.from('rent_records').insert({
            tenant_id: tenantId,
            period: periodLabel,
            period_key: periodKey,
            rent_due: tenant.rent_amount,
            amount_paid: 0,
            status: 'unpaid'
          });
          await get().fetchBillingData();
        }
      }
    } catch (err) {
      console.error('Failed to ensure rent record:', err);
    }
  },

  recordPayment: async (tenantId, periodKey, amount, method, note) => {
    try {
      const { rentRecords } = get();
      const record = rentRecords.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
      
      if (record) {
        const newPaid = record.amount_paid + amount;
        let newStatus = record.status;
        if (newPaid >= record.rent_due) newStatus = 'paid';
        else if (newPaid > 0) newStatus = 'partial';
        
        await supabase.from('rent_records').update({
          amount_paid: newPaid,
          status: newStatus
        }).eq('id', record.id);
        
        await supabase.from('rent_transactions').insert({
          rent_record_id: record.id,
          amount: amount,
          payment_method: method,
          payment_date: new Date().toISOString().split('T')[0],
          note: note
        });
        
        await get().fetchBillingData();
        return {};
      }
      return { error: 'Rent record not found' };
    } catch (err) {
      console.error('Failed to record payment:', err);
      return { error: (err as Error).message };
    }
  },
  recordWaterReading: async (tenantId, unitNumber, year, month, currReading, rate) => {
    try {
      const periodKey = `${year}-${String(month).padStart(2, '0')}`;
      const periodLabel = makePeriodLabel(year, month);
      
      const { units } = useUnitStore.getState();
      const unit = units.find(u => u.unit_number === unitNumber);
      if (!unit) throw new Error('Unit not found');

      // Get previous reading or initial
      const { waterReadings, tenants } = get();
      const lastR = waterReadings
        .filter(r => r.tenant_id === tenantId && r.period_key < periodKey)
        .sort((a, b) => b.period_key.localeCompare(a.period_key))[0];
      
      const tenant = tenants.find(t => t.id === tenantId);
      const prevReading = lastR?.curr_reading ?? (tenant?.initial_water_reading || 0);

      // meter_readings has no tenant_id column — link is unit_id → leases → tenants
      const payload = {
        unit_id: unit.id,
        period: periodLabel,
        period_key: periodKey,
        reading_date: new Date().toISOString().split('T')[0],
        meter_type: 'water',
        previous_reading: prevReading,
        current_reading: currReading,
        rate: rate,
      };
      const existing = waterReadings.find(r => r.tenant_id === tenantId && r.period_key === periodKey);
      
      let error = null;
      if (existing) {
        const { error: updateErr } = await supabase.from('meter_readings').update(payload).eq('id', existing.id);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase.from('meter_readings').insert(payload);
        error = insertErr;
      }

      if (error) {
        console.error('Failed to record water reading:', error);
        return { error: error.message };
      }

      await get().fetchBillingData();
      return {};
    } catch (err) {
      console.error('Failed to record water reading:', err);
      return { error: (err as Error).message };
    }
  },
  
  getLastWaterReading: (tenantId) => {
    const sorted = get().waterReadings
      .filter(r => r.tenant_id === tenantId)
      .sort((a, b) => b.period_key.localeCompare(a.period_key));
    return sorted[0] ?? null;
  },

  getRentForPeriod: (pKey) => {
    const { rentRecords, tenants } = get();
    return rentRecords
      .filter(r => r.period_key === pKey)
      .map(r => ({ ...r, tenant: tenants.find(t => t.id === r.tenant_id)! }))
      .filter(r => r.tenant);
  },

  getWaterForPeriod: (pKey) => {
    const { waterReadings, tenants } = get();
    return waterReadings
      .filter(r => r.period_key === pKey)
      .map(r => ({ ...r, tenant: tenants.find(t => t.id === r.tenant_id)! }))
      .filter(r => r.tenant);
  },

  getTenantRentHistory: (tenantId) =>
    get().rentRecords
      .filter(r => r.tenant_id === tenantId)
      .sort((a, b) => b.period_key.localeCompare(a.period_key)),

  getTenantWaterHistory: (tenantId) =>
    get().waterReadings
      .filter(r => r.tenant_id === tenantId)
      .sort((a, b) => b.period_key.localeCompare(a.period_key)),

  getTenantOutstanding: (tenantId) =>
    get().rentRecords
      .filter(r => r.tenant_id === tenantId)
      .reduce((sum, r) => sum + r.balance, 0),

  recordWaterPayment: async (readingId, amount) => {
    try {
      const reading = get().waterReadings.find(r => r.id === readingId);
      if (!reading) return { error: 'Water reading not found' };

      const newPaid    = reading.amount_paid + amount;
      const newBalance = Math.max(0, reading.amount - newPaid);
      const { error }  = await supabase
        .from('meter_readings')
        .update({ amount_paid: newPaid, is_billed: newBalance <= 0 })
        .eq('id', readingId);

      if (error) throw error;
      await get().fetchBillingData();
      return {};
    } catch (err) {
      return { error: (err as Error).message };
    }
  },

  markWaterPaid: async (tenantId, pKey) => {
    const reading = get().waterReadings.find(r => r.tenant_id === tenantId && r.period_key === pKey);
    if (reading && reading.balance > 0) {
      await get().recordWaterPayment(reading.id, reading.balance);
    }
  },
}));
