import type { TenantConfig, RentRecord, WaterReading } from '@/stores/billingStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BalanceStatus = 'paid' | 'partial' | 'unpaid';

export interface RentLine {
  due: number;
  paid: number;
  balance: number;
  status: BalanceStatus;
  /** true when no rent record exists yet for the month (treated as fully unpaid). */
  unbilled: boolean;
}

export interface WaterLine {
  prev: number;
  curr: number;
  consumed: number;
  rate: number;
  billed: number;
  paid: number;
  balance: number;
  status: BalanceStatus;
}

export interface PeriodBalance {
  period_key: string;
  period: string;
  rent: RentLine | null;
  water: WaterLine | null;
  rentBalance: number;
  waterBalance: number;
  balance: number;
  status: BalanceStatus;
}

export interface TenantBalance {
  tenant: TenantConfig;
  rentBalance: number;
  waterBalance: number;
  total: number;
  rentPaid: number;
  waterPaid: number;
  /** All months from move-in to today, newest first. */
  periods: PeriodBalance[];
  /** Subset of `periods` that still owe something, newest first. */
  unpaidPeriods: PeriodBalance[];
  /** "overdue" = owes for a month before the current one, "due" = only the current month. */
  state: 'cleared' | 'due' | 'overdue';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Round to cents so repeated float arithmetic never leaves 0.0000001 balances. */
const money = (n: number) => Math.round(n * 100) / 100;

function statusOf(due: number, paid: number): BalanceStatus {
  if (due - paid <= 0) return 'paid';
  return paid > 0 ? 'partial' : 'unpaid';
}

/**
 * Status of a month that may have both rent and water. It is "partial" only when a
 * component that still owes money has received a payment — settling the water bill
 * must not make an entirely unpaid rent look partially paid.
 */
export function combinedStatus(
  rent: { balance: number; paid: number } | null,
  water: { balance: number; paid: number } | null,
): BalanceStatus {
  const owing = [rent, water].filter((c): c is { balance: number; paid: number } => !!c && c.balance > 0);
  if (!owing.length) return 'paid';
  return owing.some(c => c.paid > 0) ? 'partial' : 'unpaid';
}

/** Format an amount as "KSh 12,345" (whole shillings unless there are cents). */
export function formatKES(n: number): string {
  const hasCents = Math.abs(n % 1) > 0;
  return `KSh ${n.toLocaleString('en-KE', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Core calculation ─────────────────────────────────────────────────────────

/**
 * Builds the month-by-month balance sheet for one tenant.
 *
 * Mirrors the Payments page: a month between move-in and today with no rent record
 * is counted as fully unpaid at the tenant's current rent, so arrears for months
 * that were never billed in the database are not silently dropped.
 *
 * @param periods Every billing month up to today (see getAvailablePeriods).
 */
export function computeTenantBalance(
  tenant: TenantConfig,
  rentRecords: RentRecord[],
  waterReadings: WaterReading[],
  periods: { key: string; label: string }[],
  currentPeriodKey: string,
): TenantBalance {
  const moveInKey = tenant.move_in_date ? tenant.move_in_date.slice(0, 7) : '';
  const rentByKey  = new Map(rentRecords.filter(r => r.tenant_id === tenant.id).map(r => [r.period_key, r]));
  const waterByKey = new Map(waterReadings.filter(w => w.tenant_id === tenant.id).map(w => [w.period_key, w]));

  // Union of the standard months and any month that already has data (e.g. before 2026).
  const labels = new Map<string, string>(periods.map(p => [p.key, p.label]));
  rentByKey.forEach((r, k) => { if (!labels.has(k)) labels.set(k, r.period); });
  waterByKey.forEach((w, k) => { if (!labels.has(k)) labels.set(k, w.period); });

  const rows: PeriodBalance[] = [];
  labels.forEach((label, key) => {
    const rec = rentByKey.get(key);
    const wat = waterByKey.get(key);
    const beforeMoveIn = !!moveInKey && key < moveInKey;
    // Skip months before move-in unless real data exists for them.
    if (beforeMoveIn && !rec && !wat) return;

    let rent: RentLine | null = null;
    if (rec) {
      const due = money(rec.rent_due);
      const paid = money(rec.amount_paid);
      rent = { due, paid, balance: money(Math.max(0, due - paid)), status: statusOf(due, paid), unbilled: false };
    } else if (tenant.status === 'active' && !beforeMoveIn && key <= currentPeriodKey && tenant.rent_amount > 0) {
      // Only active tenants accrue unbilled rent; a former tenant must not be charged for months after leaving.
      const due = money(tenant.rent_amount);
      rent = { due, paid: 0, balance: due, status: 'unpaid', unbilled: true };
    }

    const water: WaterLine | null = wat
      ? {
          prev: wat.prev_reading,
          curr: wat.curr_reading,
          consumed: wat.units_consumed,
          rate: wat.rate,
          billed: money(wat.amount),
          paid: money(wat.amount_paid),
          balance: money(Math.max(0, wat.amount - wat.amount_paid)),
          status: statusOf(wat.amount, wat.amount_paid),
        }
      : null;

    const rentBalance = rent?.balance ?? 0;
    const waterBalance = water?.balance ?? 0;
    const balance = money(rentBalance + waterBalance);

    rows.push({
      period_key: key,
      period: label,
      rent,
      water,
      rentBalance,
      waterBalance,
      balance,
      status: combinedStatus(rent, water),
    });
  });

  rows.sort((a, b) => b.period_key.localeCompare(a.period_key));

  const rentBalance = money(rows.reduce((s, r) => s + r.rentBalance, 0));
  const waterBalance = money(rows.reduce((s, r) => s + r.waterBalance, 0));
  const unpaidPeriods = rows.filter(r => r.balance > 0);
  const owesBeforeCurrent = unpaidPeriods.some(r => r.period_key < currentPeriodKey);

  return {
    tenant,
    rentBalance,
    waterBalance,
    total: money(rentBalance + waterBalance),
    rentPaid: money(rows.reduce((s, r) => s + (r.rent?.paid ?? 0), 0)),
    waterPaid: money(rows.reduce((s, r) => s + (r.water?.paid ?? 0), 0)),
    periods: rows,
    unpaidPeriods,
    state: unpaidPeriods.length === 0 ? 'cleared' : owesBeforeCurrent ? 'overdue' : 'due',
  };
}

/** Balance sheets for every tenant, owing tenants first (largest balance on top). */
export function computeAllBalances(
  tenants: TenantConfig[],
  rentRecords: RentRecord[],
  waterReadings: WaterReading[],
  periods: { key: string; label: string }[],
  currentPeriodKey: string,
): TenantBalance[] {
  return tenants
    .map(t => computeTenantBalance(t, rentRecords, waterReadings, periods, currentPeriodKey))
    .sort((a, b) => b.total - a.total || a.tenant.first_name.localeCompare(b.tenant.first_name));
}
