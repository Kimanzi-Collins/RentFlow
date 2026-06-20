import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// Comprehensive utilities for formatting, validation, and helpers
// Kenyan market context: KES currency, +254 phone format
// ═══════════════════════════════════════════════════════════════════════════


// ── Class Name Utility ──────────────────────────────────────────────────────

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// ── Currency & Number Formatting ────────────────────────────────────────────

const kesFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const kesFormatterWithDecimals = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format amount as KES currency */
export function formatCurrency(amount: number, decimals = false): string {
  if (isNaN(amount)) return 'KES 0';
  return decimals ? kesFormatterWithDecimals.format(amount) : kesFormatter.format(amount);
}

/** Format amount in compact notation (K, M) */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
  return formatCurrency(amount);
}

/** Format a number with locale-aware separators */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format as percentage */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}


// ── Date Formatting ─────────────────────────────────────────────────────────

type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'relative' | 'time';

/** Format a date string or Date object */
export function formatDate(
  date: string | Date | undefined | null,
  format: DateFormat = 'medium'
): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
    case 'medium':
      return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
    case 'full':
      return d.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    case 'relative':
      return formatRelativeTime(d);
    case 'time':
      return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    default:
      return d.toLocaleDateString('en-KE');
  }
}

/** Format relative time (e.g., "2 hours ago", "just now") */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return formatDate(date, 'medium');
}

/** Get current month name */
export function getCurrentMonth(): string {
  return new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
}

/** Check if a date is overdue (past the given date) */
export function isOverdue(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/** Get days difference between two dates */
export function getDaysDiff(from: string | Date, to: string | Date = new Date()): number {
  const a = typeof from === 'string' ? new Date(from) : from;
  const b = typeof to === 'string' ? new Date(to) : to;
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}


// ── Phone Formatting ────────────────────────────────────────────────────────

/** Format phone number for display (Kenyan format) */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/** Normalize phone to international format (254XXXXXXXXX) */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('+254')) return cleaned.slice(1);
  if (cleaned.startsWith('254')) return cleaned;
  return cleaned;
}


// ── String Utilities ────────────────────────────────────────────────────────

/** Get initials from a full name */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Convert to title case */
export function titleCase(str: string): string {
  if (!str) return '';
  return str.split(/[\s_-]+/).map(capitalize).join(' ');
}

/** Convert to URL-friendly slug */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


// ── Validation ──────────────────────────────────────────────────────────────

/** Validate Kenyan phone number */
export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^(0[17]\d{8}|254[17]\d{8})$/.test(cleaned);
}

/** Validate email address */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate Kenyan national ID (7-8 digits) */
export function isValidKenyanId(id: string): boolean {
  return /^\d{7,8}$/.test(id.replace(/\s/g, ''));
}


// ── Calculations ────────────────────────────────────────────────────────────

/** Calculate water bill from consumption and rate */
export function calculateWaterBill(consumption: number, ratePerUnit: number): number {
  return Math.round(consumption * ratePerUnit * 100) / 100;
}

/** Calculate late payment penalty */
export function calculatePenalty(
  amount: number,
  rate: number,
  type: 'percentage' | 'fixed'
): number {
  if (type === 'percentage') return Math.round((amount * rate) / 100);
  return rate;
}

/** Calculate occupancy rate */
export function calculateOccupancyRate(occupied: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((occupied / total) * 1000) / 10;
}

/** Calculate collection rate */
export function calculateCollectionRate(collected: number, expected: number): number {
  if (expected === 0) return 0;
  return Math.round((collected / expected) * 1000) / 10;
}


// ── Status Mapping ──────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

const STATUS_MAP: Record<string, StatusVariant> = {
  active: 'success',
  completed: 'success',
  paid: 'success',
  resolved: 'success',
  occupied: 'success',
  vacant: 'warning',
  pending: 'warning',
  partial: 'warning',
  in_progress: 'info',
  reserved: 'info',
  draft: 'info',
  sent: 'info',
  open: 'info',
  overdue: 'danger',
  danger: 'danger',
  failed: 'danger',
  evicted: 'danger',
  terminated: 'danger',
  cancelled: 'danger',
  reversed: 'danger',
  closed: 'default',
  inactive: 'default',
  expired: 'default',
  maintenance: 'warning',
};

/** Map a status string to a variant for styling */
export function getStatusVariant(status: string): StatusVariant {
  return STATUS_MAP[status?.toLowerCase()] || 'default';
}

/** Get human-readable status label */
export function getStatusLabel(status: string): string {
  return titleCase(status?.replace(/_/g, ' ') || '');
}


// ── ID Generation ───────────────────────────────────────────────────────────

/** Generate an invoice number (INV-YYMM-XXXX) */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `INV-${yy}${mm}-${rand}`;
}

/** Generate a simple unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}


// ── Async Utilities ─────────────────────────────────────────────────────────

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/** Sleep for a given duration */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Retry an async function with exponential backoff */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < maxAttempts - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}


// ── Storage Wrapper ─────────────────────────────────────────────────────────

export const storage = {
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to save to localStorage: ${key}`);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`Failed to remove from localStorage: ${key}`);
    }
  },
};


// ── Array Utilities ─────────────────────────────────────────────────────────

/** Group an array by a key */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    return { ...groups, [group]: [...(groups[group] || []), item] };
  }, {} as Record<string, T[]>);
}

/** Sort array by a key */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/** Get unique items by a key */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}


// ── Payment Method Helpers ──────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mpesa: 'M-PESA',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  other: 'Other',
};

/** Get human-readable payment method label */
export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] || titleCase(method);
}

/** Get priority color class */
export function getPriorityVariant(priority: string): StatusVariant {
  const map: Record<string, StatusVariant> = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
  };
  return map[priority] || 'default';
}
