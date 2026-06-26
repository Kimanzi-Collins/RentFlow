// ═══════════════════════════════════════════════════════════════════════════════
// RentFlow — Type Definitions
// Complete type system for the RentFlow rental management platform MVP.
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Enums (exported as type aliases to match Supabase string enums)
// ═══════════════════════════════════════════════════════════════════════════════

/** Role assigned to a user profile. */
export type UserRole = 'landlord' | 'caretaker';

/** Physical classification of a property. */
export type PropertyType = 'apartment' | 'house' | 'commercial' | 'mixed';

/** Current occupancy/availability status of a unit. */
export type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'reserved';

/** Lifecycle status of a tenant record. */
export type TenantStatus = 'active' | 'inactive' | 'pending' | 'evicted';

/** Lifecycle status of a lease agreement. */
export type LeaseStatus = 'active' | 'expired' | 'terminated' | 'pending';

/** Status of a billing invoice. */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

/** Method used to submit a payment. */
export type PaymentMethod = 'mpesa' | 'cash' | 'bank_transfer' | 'cheque' | 'other';

/** Processing status of a payment transaction. */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'reversed';

/** How a late-payment penalty is calculated. */
export type PenaltyType = 'percentage' | 'fixed';

/** Government-issued identification document type. */
export type IdType = 'national_id' | 'passport' | 'alien_id';

/** Category of an in-app notification. */
export type NotificationType = 'reminder' | 'penalty' | 'payment' | 'lease' | 'system';

/** Delivery channel for a notification. */
export type NotificationChannel = 'sms' | 'email' | 'push';

/** Urgency level for a maintenance request. */
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

/** Workflow status of a maintenance request. */
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/** Category tag for a tenant note. */
export type NoteType = 'general' | 'payment' | 'complaint' | 'maintenance';

// ═══════════════════════════════════════════════════════════════════════════════
// Base Entity
// ═══════════════════════════════════════════════════════════════════════════════

/** Fields shared by every database row. */
export interface BaseEntity {
  /** Primary key (UUID). */
  id: string;
  /** ISO-8601 timestamp of row creation. */
  created_at: string;
  /** ISO-8601 timestamp of the most recent update. */
  updated_at?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Database Row Types
// ═══════════════════════════════════════════════════════════════════════════════

/** User profile linked to a Supabase Auth account. */
export interface Profile extends BaseEntity {
  /** Email address (unique). */
  email: string;
  /** Display name. */
  full_name: string;
  /** Phone number in E.164 format. */
  phone?: string;
  /** Company or organization name. */
  company_name?: string;
  /** Application-level role. */
  role: UserRole;
  /** URL to the user's avatar image. */
  avatar_url?: string;
}

/** A rental property managed on the platform. */
export interface Property extends BaseEntity {
  /** Profile ID of the property owner (landlord). */
  owner_id: string;
  /** Human-readable property name. */
  name: string;
  /** Street address. */
  address: string;
  /** City or town. */
  city: string;
  /** County or administrative region. */
  county?: string;
  /** Freeform description. */
  description?: string;
  /** Classification of the property. */
  property_type: PropertyType;
  /** Per-unit water rate (KES). */
  water_rate: number;
  /** Late-payment penalty rate (percentage or fixed amount). */
  penalty_rate: number;
  /** How the penalty rate is applied. */
  penalty_type: PenaltyType;
  /** Day of the month invoices are generated (1-31). */
  billing_day: number;
  /** Number of days after due date before penalties apply. */
  grace_period_days: number;
  /** URL to the property cover image. */
  image_url?: string;
  /** Total number of rentable units. */
  total_units: number;
  /** Current number of occupied units (denormalized). */
  occupied_units: number;
}

/** A single rentable unit within a property. */
export interface Unit extends BaseEntity {
  /** Parent property ID. */
  property_id: string;
  /** Unit identifier (e.g. "A1", "101"). */
  unit_number: string;
  /** Floor number (0 = ground). */
  floor?: number;
  /** Number of bedrooms. */
  bedrooms: number;
  /** Number of bathrooms. */
  bathrooms: number;
  /** Unit area in square metres. */
  size_sqm?: number;
  /** Monthly rent amount (KES). */
  rent_amount: number;
  /** Required deposit amount (KES). */
  deposit_amount: number;
  /** Current occupancy status. */
  status: UnitStatus;
  /** Freeform description. */
  description?: string;
  /** List of amenity tags. */
  amenities: string[];
  /** URL to a unit image. */
  image_url?: string;
  /** Utility meter number for billing. */
  meter_number?: string;
  /** Most recent water/electricity meter reading. */
  last_meter_reading?: number;
}

/** A tenant (person renting a unit). */
export interface Tenant extends BaseEntity {
  /** Tenant's full legal name. */
  full_name: string;
  /** Primary phone number. */
  phone: string;
  /** Email address. */
  email?: string;
  /** Government ID number. */
  id_number?: string;
  /** Type of government-issued ID. */
  id_type?: IdType;
  /** Emergency contact person's name. */
  emergency_contact_name?: string;
  /** Emergency contact person's phone. */
  emergency_contact_phone?: string;
  /** URL to the tenant's photo. */
  photo_url?: string;
  /** Current tenant lifecycle status. */
  status: TenantStatus;
  /** Outstanding balance (positive = owes money). */
  balance: number;
  /** Lifetime total payments made (KES). */
  total_paid: number;
  /** Freeform notes. */
  notes?: string;
}

/** A lease agreement binding a tenant to a unit. */
export interface Lease extends BaseEntity {
  /** Tenant party to the lease. */
  tenant_id: string;
  /** Unit being leased. */
  unit_id: string;
  /** Property the unit belongs to. */
  property_id: string;
  /** Lease commencement date (ISO-8601). */
  start_date: string;
  /** Lease expiry date (ISO-8601). Null for month-to-month. */
  end_date?: string;
  /** Agreed monthly rent (KES). */
  rent_amount: number;
  /** Required deposit (KES). */
  deposit_amount: number;
  /** Amount of deposit actually paid (KES). */
  deposit_paid: number;
  /** Current lease status. */
  status: LeaseStatus;
  /** Additional terms and conditions (markdown or plain text). */
  terms?: string;
}

/** A billing invoice sent to a tenant. */
export interface Invoice extends BaseEntity {
  /** Human-readable invoice number (e.g. "INV-2026-001"). */
  invoice_number: string;
  /** Tenant the invoice is addressed to. */
  tenant_id: string;
  /** Unit the charges relate to. */
  unit_id: string;
  /** Property the unit belongs to. */
  property_id: string;
  /** Billing period start (ISO-8601). */
  period_start: string;
  /** Billing period end (ISO-8601). */
  period_end: string;
  /** Payment due date (ISO-8601). */
  due_date: string;
  /** Sum of line items before tax (KES). */
  subtotal: number;
  /** Tax amount (KES). */
  tax_amount: number;
  /** Total amount due (KES). */
  total_amount: number;
  /** Amount already paid against this invoice (KES). */
  amount_paid: number;
  /** Remaining balance (KES). */
  balance: number;
  /** Current invoice status. */
  status: InvoiceStatus;
  /** Additional notes. */
  notes?: string;
}

/** A single line item on an invoice. */
export interface InvoiceItem extends BaseEntity {
  /** Parent invoice ID. */
  invoice_id: string;
  /** Line item description. */
  description: string;
  /** Charge category (e.g. "rent", "water", "penalty"). */
  item_type: string;
  /** Quantity billed. */
  quantity: number;
  /** Price per unit (KES). */
  unit_price: number;
  /** Total amount for this line item (KES). */
  amount: number;
}

/** A payment recorded against a tenant's account. */
export interface Payment extends BaseEntity {
  /** Invoice this payment is applied to (optional for advance payments). */
  invoice_id?: string;
  /** Tenant who made the payment. */
  tenant_id: string;
  /** Property the payment relates to. */
  property_id: string;
  /** Unit the payment relates to. */
  unit_id?: string;
  /** Payment amount (KES). */
  amount: number;
  /** How the payment was made. */
  payment_method: PaymentMethod;
  /** Processing status. */
  payment_status: PaymentStatus;
  /** External transaction reference. */
  transaction_id?: string;
  /** M-Pesa confirmation code. */
  mpesa_receipt_number?: string;
  /** Date/time the payment was made (ISO-8601). */
  payment_date: string;
  /** Freeform description. */
  description?: string;
  /** Profile ID of the user who recorded this payment. */
  recorded_by?: string;
}

/** A late-payment penalty applied to a tenant's invoice. */
export interface Penalty extends BaseEntity {
  /** Tenant the penalty is charged to. */
  tenant_id: string;
  /** Invoice the penalty relates to. */
  invoice_id?: string;
  /** Penalty amount (KES). */
  amount: number;
  /** Reason the penalty was applied. */
  reason: string;
  /** Date the penalty was applied (ISO-8601). */
  applied_date: string;
  /** Whether this penalty has been waived. */
  is_waived: boolean;
  /** Profile ID of the user who waived the penalty. */
  waived_by?: string;
  /** Date the penalty was waived (ISO-8601). */
  waived_date?: string;
  /** Reason the penalty was waived. */
  waive_reason?: string;
}

/** A water or electricity meter reading for a unit. */
export interface MeterReading extends BaseEntity {
  /** Unit the reading was taken for. */
  unit_id: string;
  /** Property the unit belongs to. */
  property_id: string;
  /** Tenant currently occupying the unit at reading time. */
  tenant_id?: string;
  /** Previous meter value. */
  previous_reading: number;
  /** Current meter value. */
  current_reading: number;
  /** Computed consumption (current − previous). */
  consumption: number;
  /** Date the reading was taken (ISO-8601). */
  reading_date: string;
  /** URL to a photo of the meter. */
  photo_url?: string;
  /** Profile ID of the user who recorded the reading. */
  recorded_by: string;
  /** Additional notes. */
  notes?: string;
  /** Whether this reading has been included in an invoice. */
  is_billed: boolean;
}

/** A maintenance / repair request filed for a unit. */
export interface MaintenanceRequest extends BaseEntity {
  /** Unit the request relates to. */
  unit_id: string;
  /** Property the unit belongs to. */
  property_id: string;
  /** Profile ID of the person who reported the issue. */
  reported_by: string;
  /** Short summary of the issue. */
  title: string;
  /** Detailed description. */
  description?: string;
  /** Urgency level. */
  priority: MaintenancePriority;
  /** Current workflow status. */
  status: MaintenanceStatus;
  /** When the request was marked as resolved (ISO-8601). */
  resolved_at?: string;
  /** Profile ID of the user who resolved the request. */
  resolved_by?: string;
  /** Internal notes. */
  notes?: string;
}

/** A note attached to a tenant's record. */
export interface TenantNote extends BaseEntity {
  /** Tenant this note is about. */
  tenant_id: string;
  /** Profile ID of the note author. */
  created_by: string;
  /** Note body text. */
  content: string;
  /** Category tag. */
  note_type: NoteType;
}

/** An in-app or external notification sent to a user. */
export interface Notification extends BaseEntity {
  /** Type of recipient (e.g. "tenant", "landlord", "caretaker"). */
  recipient_type: string;
  /** Profile or tenant ID of the recipient. */
  recipient_id: string;
  /** Recipient's phone for SMS delivery. */
  recipient_phone?: string;
  /** Notification category. */
  notification_type: NotificationType;
  /** Delivery channel. */
  channel: NotificationChannel;
  /** Notification title / subject. */
  title: string;
  /** Notification body. */
  message: string;
  /** Whether the notification has been dispatched. */
  is_sent: boolean;
  /** Timestamp of successful dispatch (ISO-8601). */
  sent_at?: string;
  /** Whether the recipient has read the notification. */
  is_read: boolean;
  /** Timestamp the notification was read (ISO-8601). */
  read_at?: string;
  /** Arbitrary key-value metadata. */
  metadata?: Record<string, unknown>;
}

/** Links a caretaker profile to a property they manage. */
export interface CaretakerAssignment extends BaseEntity {
  /** Profile ID of the caretaker. */
  caretaker_id: string;
  /** Property being managed. */
  property_id: string;
  /** Profile ID of the landlord who created the assignment. */
  assigned_by: string;
  /** When the assignment was created (ISO-8601). */
  assigned_at: string;
  /** Whether the assignment is currently active. */
  is_active: boolean;
}

/** Raw M-Pesa C2B callback data stored for reconciliation. */
export interface MpesaTransaction extends BaseEntity {
  /** M-Pesa transaction type (e.g. "Pay Bill"). */
  transaction_type: string;
  /** M-Pesa transaction ID. */
  transaction_id: string;
  /** Transaction timestamp from M-Pesa (ISO-8601). */
  trans_time: string;
  /** Transaction amount (KES). */
  trans_amount: number;
  /** Bill reference / account number entered by the payer. */
  bill_ref_number?: string;
  /** Payer's phone number (MSISDN). */
  msisdn: string;
  /** Payer's first name. */
  first_name?: string;
  /** Payer's middle name. */
  middle_name?: string;
  /** Payer's last name. */
  last_name?: string;
  /** Organisation account balance after the transaction. */
  org_account_balance?: number;
  /** Full raw JSON payload from the M-Pesa callback. */
  raw_payload: Record<string, unknown>;
  /** Whether this transaction has been matched to a Payment record. */
  is_reconciled: boolean;
  /** Timestamp of reconciliation (ISO-8601). */
  reconciled_at?: string;
  /** Payment ID this transaction was reconciled to. */
  reconciled_payment_id?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Extended Types (with joined relations)
// ═══════════════════════════════════════════════════════════════════════════════

/** Property with related aggregate stats and child units. */
export type PropertyWithStats = Property & {
  units?: Unit[];
  activeLeases?: number;
  monthlyRevenue?: number;
};

/** Unit with its current tenant, active lease, and parent property. */
export type UnitWithTenant = Unit & {
  tenant?: Tenant;
  lease?: Lease;
  property?: Property;
};

/** Tenant with their active lease, unit, and property details. */
export type TenantWithLease = Tenant & {
  lease?: Lease;
  unit?: Unit;
  property?: Property;
};

/** Payment with fully resolved foreign-key relations. */
export type PaymentWithDetails = Payment & {
  tenant?: Tenant;
  property?: Property;
  unit?: Unit;
  recorded_by_profile?: Profile;
};

/** Meter reading with resolved relations. */
export type MeterReadingWithDetails = MeterReading & {
  unit?: Unit;
  property?: Property;
  tenant?: Tenant;
  recorded_by_profile?: Profile;
};

/** Maintenance request with resolved relations. */
export type MaintenanceRequestWithDetails = MaintenanceRequest & {
  unit?: Unit;
  property?: Property;
  reported_by_profile?: Profile;
  resolved_by_profile?: Profile;
};

/** Tenant note with the author's profile. */
export type TenantNoteWithAuthor = TenantNote & {
  author?: Profile;
};

/** Lease with fully resolved foreign-key relations. */
export type LeaseWithDetails = Lease & {
  tenant?: Tenant;
  unit?: Unit;
  property?: Property;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard Types
// ═══════════════════════════════════════════════════════════════════════════════

/** Aggregated KPIs displayed on the main dashboard. */
export interface DashboardStats {
  /** Total number of properties. */
  total_properties: number;
  /** Total number of units across all properties. */
  total_units: number;
  /** Number of currently occupied units. */
  occupied_units: number;
  /** Occupancy as a percentage (0–100). */
  occupancy_rate: number;
  /** Total expected revenue for the current period (KES). */
  total_revenue: number;
  /** Revenue actually collected for the current period (KES). */
  collected_revenue: number;
  /** Collection percentage (0–100). */
  collection_rate: number;
  /** Total overdue balance (KES). */
  overdue_amount: number;
  /** Number of overdue invoices. */
  overdue_count: number;
  /** Number of tenants with active leases. */
  active_tenants: number;
  /** Number of unresolved maintenance requests. */
  pending_maintenance: number;
}

/** Monthly revenue data point for charts. */
export interface RevenueData {
  /** Month label (e.g. "Jan 2026"). */
  month: string;
  /** Billed revenue (KES). */
  revenue: number;
  /** Collected revenue (KES). */
  collected: number;
  /** Target / budgeted revenue (KES). */
  target: number;
}

/** Per-property occupancy data point for charts. */
export interface OccupancyData {
  /** Property name. */
  property_name: string;
  /** Total units in the property. */
  total_units: number;
  /** Currently occupied units. */
  occupied_units: number;
  /** Occupancy rate as a percentage (0–100). */
  rate: number;
}

/** A single item in the recent activity feed. */
export interface RecentActivity {
  /** Unique activity ID. */
  id: string;
  /** Category of the activity. */
  type: 'payment' | 'lease' | 'meter_reading' | 'maintenance' | 'tenant' | 'overdue';
  /** Short human-readable title. */
  title: string;
  /** Longer description of the activity. */
  description: string;
  /** When the activity occurred (ISO-8601). */
  timestamp: string;
  /** Optional icon identifier for the UI. */
  icon?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Form Types
// ═══════════════════════════════════════════════════════════════════════════════

/** Data required to create or update a property. */
export type PropertyFormData = Pick<
  Property,
  'name' | 'address' | 'city'
> &
  Partial<
    Pick<
      Property,
      | 'county'
      | 'property_type'
      | 'water_rate'
      | 'billing_day'
      | 'grace_period_days'
      | 'penalty_rate'
      | 'penalty_type'
      | 'description'
    >
  >;

/** Data required to create or update a unit. */
export type UnitFormData = Pick<
  Unit,
  'property_id' | 'unit_number' | 'rent_amount' | 'deposit_amount'
> &
  Partial<
    Pick<
      Unit,
      'bedrooms' | 'bathrooms' | 'size_sqm' | 'meter_number' | 'floor' | 'description'
    >
  >;

/** Data required to create or update a tenant. */
export type TenantFormData = Pick<Tenant, 'full_name' | 'phone'> &
  Partial<
    Pick<
      Tenant,
      | 'email'
      | 'id_number'
      | 'id_type'
      | 'emergency_contact_name'
      | 'emergency_contact_phone'
      | 'notes'
    >
  >;

/** Data required to record a payment. */
export type PaymentFormData = Pick<
  Payment,
  'tenant_id' | 'property_id' | 'amount' | 'payment_method'
> &
  Partial<
    Pick<
      Payment,
      'unit_id' | 'transaction_id' | 'mpesa_receipt_number' | 'payment_date' | 'description'
    >
  >;

/** Data required to submit a meter reading. */
export type MeterReadingFormData = Pick<
  MeterReading,
  'unit_id' | 'property_id' | 'current_reading'
> &
  Partial<Pick<MeterReading, 'reading_date' | 'notes'>>;

/** Data required to create or update a lease. */
export type LeaseFormData = Pick<
  Lease,
  'tenant_id' | 'unit_id' | 'property_id' | 'start_date' | 'rent_amount' | 'deposit_amount'
> &
  Partial<Pick<Lease, 'end_date' | 'terms'>>;

/** Data required to file a maintenance request. */
export type MaintenanceFormData = Pick<
  MaintenanceRequest,
  'unit_id' | 'property_id' | 'title'
> &
  Partial<Pick<MaintenanceRequest, 'description' | 'priority'>>;

// ═══════════════════════════════════════════════════════════════════════════════
// API Types
// ═══════════════════════════════════════════════════════════════════════════════

/** Standard API response wrapper. */
export interface ApiResponse<T> {
  /** Payload on success, null on failure. */
  data: T | null;
  /** Error message on failure, null on success. */
  error: string | null;
  /** Optional total count (useful for list endpoints). */
  count?: number;
}

/** Paginated list response. */
export interface PaginatedResponse<T> {
  /** Array of items for the current page. */
  data: T[];
  /** Total number of matching records. */
  total: number;
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items per page. */
  pageSize: number;
  /** Total number of pages. */
  totalPages: number;
}

/** Common query parameters for list/search endpoints. */
export interface FilterOptions {
  /** Full-text search query. */
  search?: string;
  /** Filter by status value. */
  status?: string;
  /** Filter by property ID. */
  property_id?: string;
  /** Filter by start date (ISO-8601). */
  date_from?: string;
  /** Filter by end date (ISO-8601). */
  date_to?: string;
  /** Column to sort by. */
  sort_by?: string;
  /** Sort direction. */
  sort_order?: 'asc' | 'desc';
  /** Page number (1-indexed). */
  page?: number;
  /** Number of items per page. */
  page_size?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI Component Types
// ═══════════════════════════════════════════════════════════════════════════════

/** A single tab in a tab bar component. */
export interface TabItem {
  /** Unique tab identifier. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional badge count. */
  count?: number;
  /** Optional icon component. */
  icon?: React.ComponentType;
}

/** Column definition for a data table. */
export interface Column<T> {
  /** Property key or dot-path to render. */
  key: keyof T | string;
  /** Column header text. */
  header: string;
  /** Custom cell renderer. */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Whether the column supports sorting. */
  sortable?: boolean;
  /** CSS width value (e.g. "200px", "20%"). */
  width?: string;
  /** Horizontal alignment. */
  align?: 'left' | 'center' | 'right';
}

/** An option in a select / dropdown component. */
export interface SelectOption {
  /** Option value submitted with forms. */
  value: string;
  /** Display label. */
  label: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
}

/** A single segment in a breadcrumb trail. */
export interface BreadcrumbItem {
  /** Display label. */
  label: string;
  /** Navigation target (omit for the current page). */
  href?: string;
}

/** Toast notification severity. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** A toast notification displayed to the user. */
export interface Toast {
  /** Unique toast ID. */
  id: string;
  /** Severity / colour. */
  type: ToastType;
  /** Primary text. */
  title: string;
  /** Optional secondary text. */
  description?: string;
  /** Auto-dismiss duration in milliseconds. */
  duration?: number;
}

/** Props accepted by the reusable Modal component. */
export interface ModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
  /** Optional modal title. */
  title?: string;
  /** Modal width preset. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Modal body content. */
  children: React.ReactNode;
}
