// ═══════════════════════════════════════════════════════════════════════════
// RENTFLOW TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'landlord' | 'caretaker';

export interface Profile {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// ─── Property ───────────────────────────────────────────────────────────────

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  county?: string;
  description?: string;
  property_type: 'apartment' | 'house' | 'commercial' | 'mixed';
  water_rate: number; // KES per unit
  penalty_rate: number; // Percentage or fixed amount
  penalty_type: 'percentage' | 'fixed';
  billing_day: number; // Day of month rent is due
  grace_period_days: number;
  image_url?: string;
  total_units: number;
  occupied_units: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  county?: string;
  description?: string;
  property_type: Property['property_type'];
  water_rate: number;
  penalty_rate: number;
  penalty_type: 'percentage' | 'fixed';
  billing_day: number;
  grace_period_days: number;
}

// ─── Unit ───────────────────────────────────────────────────────────────────

export type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'reserved';

export interface Unit {
  id: string;
  property_id: string;
  property_name?: string;
  unit_number: string;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  size_sqm?: number;
  rent_amount: number;
  deposit_amount: number;
  status: UnitStatus;
  description?: string;
  amenities: string[];
  image_url?: string;
  current_tenant_id?: string;
  current_tenant_name?: string;
  meter_number?: string;
  last_meter_reading?: number;
  created_at: string;
  updated_at: string;
}

export interface UnitFormData {
  property_id: string;
  unit_number: string;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  size_sqm?: number;
  rent_amount: number;
  deposit_amount: number;
  description?: string;
  amenities: string[];
  meter_number?: string;
}

// ─── Tenant ─────────────────────────────────────────────────────────────────

export type TenantStatus = 'active' | 'inactive' | 'pending' | 'evicted';

export interface Tenant {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  id_number?: string;
  id_type?: 'national_id' | 'passport' | 'alien_id';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  photo_url?: string;
  status: TenantStatus;
  current_unit_id?: string;
  current_unit_number?: string;
  current_property_name?: string;
  balance: number; // Positive = owes money, negative = overpaid
  total_paid: number;
  move_in_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantFormData {
  full_name: string;
  phone: string;
  email?: string;
  id_number?: string;
  id_type?: Tenant['id_type'];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

// ─── Lease ──────────────────────────────────────────────────────────────────

export type LeaseStatus = 'active' | 'expired' | 'terminated' | 'pending';

export interface Lease {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  unit_id: string;
  unit_number?: string;
  property_id: string;
  property_name?: string;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  deposit_amount: number;
  deposit_paid: number;
  status: LeaseStatus;
  terms?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaseFormData {
  tenant_id: string;
  unit_id: string;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  deposit_amount: number;
  terms?: string;
}

// ─── Invoice ────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  item_type: 'rent' | 'water' | 'penalty' | 'deposit' | 'other';
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tenant_id: string;
  tenant_name?: string;
  tenant_phone?: string;
  unit_id: string;
  unit_number?: string;
  property_id: string;
  property_name?: string;
  period_start: string;
  period_end: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

// ─── Payment ────────────────────────────────────────────────────────────────

export type PaymentMethod = 'mpesa' | 'cash' | 'bank_transfer' | 'cheque' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface Payment {
  id: string;
  invoice_id?: string;
  tenant_id: string;
  tenant_name?: string;
  tenant_phone?: string;
  property_id: string;
  property_name?: string;
  unit_id?: string;
  unit_number?: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  mpesa_receipt_number?: string;
  payment_date: string;
  description?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  tenant_id: string;
  invoice_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  description?: string;
}

// ─── Penalty ────────────────────────────────────────────────────────────────

export interface Penalty {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  invoice_id?: string;
  amount: number;
  reason: string;
  applied_date: string;
  is_waived: boolean;
  waived_by?: string;
  waived_date?: string;
  waive_reason?: string;
  created_at: string;
}

// ─── Meter Reading ──────────────────────────────────────────────────────────

export interface MeterReading {
  id: string;
  unit_id: string;
  unit_number?: string;
  property_id: string;
  property_name?: string;
  tenant_id?: string;
  tenant_name?: string;
  previous_reading: number;
  current_reading: number;
  consumption: number;
  reading_date: string;
  photo_url?: string;
  recorded_by: string;
  recorder_name?: string;
  notes?: string;
  is_billed: boolean;
  created_at: string;
}

export interface MeterReadingFormData {
  unit_id: string;
  current_reading: number;
  reading_date: string;
  notes?: string;
}

// ─── MPESA ──────────────────────────────────────────────────────────────────

export interface MpesaTransaction {
  id: string;
  transaction_type: 'paybill' | 'till' | 'stk_push';
  transaction_id: string;
  trans_time: string;
  trans_amount: number;
  bill_ref_number?: string;
  msisdn: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  org_account_balance?: number;
  raw_payload: Record<string, unknown>;
  is_reconciled: boolean;
  reconciled_at?: string;
  reconciled_payment_id?: string;
  created_at: string;
}

// ─── Notification ───────────────────────────────────────────────────────────

export type NotificationType = 'reminder' | 'penalty' | 'payment' | 'lease' | 'system';

export interface Notification {
  id: string;
  recipient_type: 'tenant' | 'user';
  recipient_id: string;
  recipient_phone?: string;
  notification_type: NotificationType;
  channel: 'sms' | 'email' | 'push';
  title: string;
  message: string;
  is_sent: boolean;
  sent_at?: string;
  is_read: boolean;
  read_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  collectionRate: number;
  overdueAmount: number;
  overdueCount: number;
}

export interface RevenueData {
  month: string;
  collected: number;
  pending: number;
  total: number;
}

export interface OccupancyData {
  month: string;
  occupied: number;
  vacant: number;
  rate: number;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'lease' | 'tenant' | 'meter' | 'invoice';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Caretaker Assignment ───────────────────────────────────────────────────

export interface CaretakerAssignment {
  id: string;
  caretaker_id: string;
  caretaker_name?: string;
  property_id: string;
  property_name?: string;
  assigned_at: string;
  assigned_by: string;
  is_active: boolean;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ─── Filter & Sort Types ────────────────────────────────────────────────────

export interface FilterOptions {
  search?: string;
  status?: string;
  property_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ─── Form State Types ───────────────────────────────────────────────────────

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ─── App State ──────────────────────────────────────────────────────────────

export interface AppState {
  user: Profile | null;
  selectedPropertyId: string | null;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  isLoading: boolean;
}
