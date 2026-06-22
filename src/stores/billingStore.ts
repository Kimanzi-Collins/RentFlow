import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantConfig {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number: string;
  unit: string;
  property: string;
  status: 'active' | 'inactive';
  rent_amount: number;
  water_rate: number;            // KES per m³ consumed
  initial_water_reading: number; // reading recorded at move-in
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
  tenant_id: number;
  period: string;     // "June 2026"
  period_key: string; // "2026-06"
  rent_due: number;
  amount_paid: number;
  balance: number;    // rent_due - amount_paid
  status: 'paid' | 'partial' | 'unpaid';
  transactions: RentTransaction[];
}

export interface WaterReading {
  id: string;
  tenant_id: number;
  unit: string;
  period: string;
  period_key: string;
  prev_reading: number;
  curr_reading: number;
  units_consumed: number;
  rate: number;
  amount: number;
  status: 'billed' | 'paid';
  billed_date: string;
}

// ─── Period helpers ───────────────────────────────────────────────────────────

export function makePeriodKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function makePeriodLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-KE', {
    month: 'long', year: 'numeric',
  });
}

export function parsePeriodKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m };
}

/** Generates every billing period from Jan 2026 up to and including the current month. */
export function getAvailablePeriods(): { label: string; key: string }[] {
  const now        = new Date();
  const curYear    = now.getFullYear();
  const curMonth   = now.getMonth() + 1; // 1-based
  const startYear  = 2026;
  const startMonth = 1;

  const result: { label: string; key: string }[] = [];
  let y = startYear, m = startMonth;

  while (y < curYear || (y === curYear && m <= curMonth)) {
    result.push({ label: makePeriodLabel(y, m), key: makePeriodKey(y, m) });
    m++;
    if (m > 12) { m = 1; y++; }
  }

  return result.reverse(); // most recent first
}

/** The billing period matching today's calendar month — updates automatically. */
export const CURRENT_PERIOD_KEY = (() => {
  const now = new Date();
  return makePeriodKey(now.getFullYear(), now.getMonth() + 1);
})();

// ─── Seed data helpers ────────────────────────────────────────────────────────

function mkTxn(id: string, amount: number, method: string, date: string): RentTransaction {
  return { id, amount, method, date, reference: `MP${id.replace(/\D/g, '').slice(-8).padStart(8, '0')}` };
}

function mkRent(
  tenantId: number, year: number, month: number, rentDue: number, paid: number,
): RentRecord {
  const key = makePeriodKey(year, month);
  const balance = Math.max(0, rentDue - paid);
  const status: RentRecord['status'] = paid >= rentDue ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  const transactions: RentTransaction[] = paid > 0
    ? [mkTxn(`t${tenantId}-${key}`, paid, 'M-PESA', `${year}-${String(month).padStart(2, '0')}-05`)]
    : [];
  return { id: `r-${tenantId}-${key}`, tenant_id: tenantId, period: makePeriodLabel(year, month), period_key: key, rent_due: rentDue, amount_paid: paid, balance, status, transactions };
}

function mkWater(
  tenantId: number, unit: string, year: number, month: number,
  prev: number, curr: number, rate: number,
): WaterReading {
  const key = makePeriodKey(year, month);
  const consumed = curr - prev;
  return {
    id: `w-${tenantId}-${key}`, tenant_id: tenantId, unit,
    period: makePeriodLabel(year, month), period_key: key,
    prev_reading: prev, curr_reading: curr, units_consumed: consumed,
    rate, amount: consumed * rate,
    status: month < 6 ? 'paid' : 'billed',
    billed_date: `${year}-${String(month).padStart(2, '0')}-28`,
  };
}

// ─── Seed tenants ─────────────────────────────────────────────────────────────

const SEED_TENANTS: TenantConfig[] = [
  { id: 1, first_name: 'James',  last_name: 'Mwangi',  email: 'james@example.com',  phone: '0712 345 678', id_number: '12345678', unit: 'A-104', property: 'Serra Apartments',  status: 'active',   rent_amount: 18000, water_rate: 150, initial_water_reading: 1200, move_in_date: '2026-01-01' },
  { id: 2, first_name: 'Fatuma', last_name: 'Hassan',  email: 'fatuma@example.com', phone: '0723 456 789', id_number: '87654321', unit: 'C-301', property: 'SOJAG Head Office', status: 'active',   rent_amount: 25000, water_rate: 150, initial_water_reading: 800,  move_in_date: '2026-01-01' },
  { id: 3, first_name: 'Peter',  last_name: 'Ochieng', email: 'peter@example.com',  phone: '0734 567 890', id_number: '11223344', unit: 'B-204', property: 'Serra Apartments',  status: 'active',   rent_amount: 45000, water_rate: 150, initial_water_reading: 2100, move_in_date: '2026-01-01' },
  { id: 4, first_name: 'Grace',  last_name: 'Wanjiku', email: 'grace@example.com',  phone: '0745 678 901', id_number: '44332211', unit: 'A-101', property: 'Serra Apartments',  status: 'active',   rent_amount: 35000, water_rate: 150, initial_water_reading: 1500, move_in_date: '2026-03-01' },
  { id: 5, first_name: 'Samuel', last_name: 'Njoroge', email: 'samuel@example.com', phone: '0756 789 012', id_number: '99887766', unit: 'B-102', property: 'Serra Apartments',  status: 'inactive', rent_amount: 30000, water_rate: 150, initial_water_reading: 900,  move_in_date: '2026-01-01' },
];

// ─── Seed rent records (Jan–Jun 2026) ────────────────────────────────────────

const SEED_RENT: RentRecord[] = [
  // James Mwangi — A-104, KSh 18,000
  mkRent(1,2026,1,18000,18000), mkRent(1,2026,2,18000,18000), mkRent(1,2026,3,18000,18000),
  mkRent(1,2026,4,18000,10000), mkRent(1,2026,5,18000,18000), mkRent(1,2026,6,18000,0),

  // Fatuma Hassan — C-301, KSh 25,000
  mkRent(2,2026,1,25000,25000), mkRent(2,2026,2,25000,25000), mkRent(2,2026,3,25000,25000),
  mkRent(2,2026,4,25000,25000), mkRent(2,2026,5,25000,20000), mkRent(2,2026,6,25000,0),

  // Peter Ochieng — B-204, KSh 45,000
  mkRent(3,2026,1,45000,45000), mkRent(3,2026,2,45000,45000), mkRent(3,2026,3,45000,45000),
  mkRent(3,2026,4,45000,30000), mkRent(3,2026,5,45000,30000), mkRent(3,2026,6,45000,0),

  // Grace Wanjiku — A-101, KSh 35,000 (moved in March)
  mkRent(4,2026,3,35000,35000), mkRent(4,2026,4,35000,35000),
  mkRent(4,2026,5,35000,35000), mkRent(4,2026,6,35000,35000),
];

// ─── Seed water readings (Jan–Jun 2026) ──────────────────────────────────────

const SEED_WATER: WaterReading[] = [
  // James — A-104, initial 1200
  mkWater(1,'A-104',2026,1,1200,1247,150), mkWater(1,'A-104',2026,2,1247,1294,150),
  mkWater(1,'A-104',2026,3,1294,1342,150), mkWater(1,'A-104',2026,4,1342,1389,150),
  mkWater(1,'A-104',2026,5,1389,1436,150), mkWater(1,'A-104',2026,6,1436,1484,150),

  // Fatuma — C-301, initial 800
  mkWater(2,'C-301',2026,1,800,842,150),   mkWater(2,'C-301',2026,2,842,886,150),
  mkWater(2,'C-301',2026,3,886,928,150),   mkWater(2,'C-301',2026,4,928,971,150),
  mkWater(2,'C-301',2026,5,971,1015,150),  mkWater(2,'C-301',2026,6,1015,1059,150),

  // Peter — B-204, initial 2100
  mkWater(3,'B-204',2026,1,2100,2168,150), mkWater(3,'B-204',2026,2,2168,2235,150),
  mkWater(3,'B-204',2026,3,2235,2304,150), mkWater(3,'B-204',2026,4,2304,2372,150),
  mkWater(3,'B-204',2026,5,2372,2440,150), mkWater(3,'B-204',2026,6,2440,2509,150),

  // Grace — A-101, initial 1500, from March
  mkWater(4,'A-101',2026,3,1500,1543,150), mkWater(4,'A-101',2026,4,1543,1587,150),
  mkWater(4,'A-101',2026,5,1587,1630,150), mkWater(4,'A-101',2026,6,1630,1674,150),
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface BillingState {
  tenants: TenantConfig[];
  rentRecords: RentRecord[];
  waterReadings: WaterReading[];

  // ── Tenant actions ──────────────────────────────────────────────────────────
  addTenant: (t: TenantConfig) => void;
  updateTenant: (id: number, updates: Partial<TenantConfig>) => void;
  removeTenant: (id: number) => void;

  // ── Rent actions ────────────────────────────────────────────────────────────
  /** Create a rent record for the period if it doesn't exist yet. */
  ensureRentRecord: (tenantId: number, year: number, month: number) => void;
  /** Add a payment transaction and update balance / status. */
  recordPayment: (tenantId: number, periodKey: string, amount: number, method: string, note?: string) => void;

  // ── Water actions ───────────────────────────────────────────────────────────
  /**
   * Record a water reading for a tenant/period.
   * - Previous reading is auto-resolved from last recorded curr_reading, or initial_water_reading.
   * - If a reading already exists for the period it is overwritten.
   */
  recordWaterReading: (tenantId: number, unit: string, year: number, month: number, currReading: number, rateOverride?: number) => void;
  /** Returns the most recent water reading for a tenant, or null. */
  getLastWaterReading: (tenantId: number) => WaterReading | null;

  // ── Derived queries ─────────────────────────────────────────────────────────
  /** All rent records for a period, joined with their tenant. */
  getRentForPeriod: (pKey: string) => Array<RentRecord & { tenant: TenantConfig }>;
  /** All water readings for a period, joined with their tenant. */
  getWaterForPeriod: (pKey: string) => Array<WaterReading & { tenant: TenantConfig }>;
  /** All rent records for a tenant, newest first. */
  getTenantRentHistory: (tenantId: number) => RentRecord[];
  /** All water readings for a tenant, newest first. */
  getTenantWaterHistory: (tenantId: number) => WaterReading[];
  /** Sum of all outstanding balances for a tenant. */
  getTenantOutstanding: (tenantId: number) => number;
  /** Mark a water reading as paid for a given tenant/period. */
  markWaterPaid: (tenantId: number, periodKey: string) => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      tenants:       SEED_TENANTS,
      rentRecords:   SEED_RENT,
      waterReadings: SEED_WATER,

      // ── Tenants ──────────────────────────────────────────────────────────────
      addTenant: (t) => set(s => ({ tenants: [...s.tenants, t] })),

      updateTenant: (id, updates) =>
        set(s => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, ...updates } : t) })),

      removeTenant: (id) =>
        set(s => ({ tenants: s.tenants.filter(t => t.id !== id) })),

      // ── Rent ─────────────────────────────────────────────────────────────────
      ensureRentRecord: (tenantId, year, month) => {
        const key = makePeriodKey(year, month);
        const { rentRecords, tenants } = get();
        if (rentRecords.find(r => r.tenant_id === tenantId && r.period_key === key)) return;
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant) return;
        const rec = mkRent(tenantId, year, month, tenant.rent_amount, 0);
        set(s => ({ rentRecords: [...s.rentRecords, rec] }));
      },

      recordPayment: (tenantId, pKey, amount, method, note) => {
        const { year, month } = parsePeriodKey(pKey);
        get().ensureRentRecord(tenantId, year, month);
        set(s => ({
          rentRecords: s.rentRecords.map(r => {
            if (r.tenant_id !== tenantId || r.period_key !== pKey) return r;
            const newPaid    = r.amount_paid + amount;
            const newBalance = Math.max(0, r.rent_due - newPaid);
            const newStatus: RentRecord['status'] =
              newPaid >= r.rent_due ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
            const txn: RentTransaction = {
              id: `txn-${Date.now()}`,
              amount, method,
              date: new Date().toISOString().split('T')[0],
              reference: `MP${Date.now().toString().slice(-8)}`,
              note,
            };
            return { ...r, amount_paid: newPaid, balance: newBalance, status: newStatus, transactions: [...r.transactions, txn] };
          }),
        }));
      },

      // ── Water ─────────────────────────────────────────────────────────────────
      recordWaterReading: (tenantId, unit, year, month, currReading, rateOverride) => {
        const { waterReadings, tenants } = get();
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant) return;

        const rate = rateOverride ?? tenant.water_rate;

        // Find the most recent previous reading (any period before this one)
        const key = makePeriodKey(year, month);
        const prior = waterReadings
          .filter(r => r.tenant_id === tenantId && r.period_key < key)
          .sort((a, b) => b.period_key.localeCompare(a.period_key))[0];
        const prevReading = prior?.curr_reading ?? tenant.initial_water_reading;

        const consumed = Math.max(0, currReading - prevReading);
        const existing = waterReadings.find(r => r.tenant_id === tenantId && r.period_key === key);

        const newReading: WaterReading = {
          id: existing?.id ?? `w-${tenantId}-${key}`,
          tenant_id: tenantId, unit,
          period: makePeriodLabel(year, month), period_key: key,
          prev_reading: prevReading, curr_reading: currReading,
          units_consumed: consumed, rate, amount: consumed * rate,
          status: 'billed',
          billed_date: new Date().toISOString().split('T')[0],
        };

        set(s => ({
          waterReadings: existing
            ? s.waterReadings.map(r => r.id === existing.id ? newReading : r)
            : [...s.waterReadings, newReading],
        }));
      },

      getLastWaterReading: (tenantId) => {
        const sorted = get().waterReadings
          .filter(r => r.tenant_id === tenantId)
          .sort((a, b) => b.period_key.localeCompare(a.period_key));
        return sorted[0] ?? null;
      },

      // ── Queries ───────────────────────────────────────────────────────────────
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

      markWaterPaid: (tenantId, pKey) =>
        set(s => ({
          waterReadings: s.waterReadings.map(r =>
            r.tenant_id === tenantId && r.period_key === pKey
              ? { ...r, status: 'paid' as const }
              : r
          ),
        })),
    }),
    { name: 'rentflow-billing-v1' },
  ),
);
