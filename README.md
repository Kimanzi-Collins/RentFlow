# RentFlow - Property Management Platform for Kenya

A premium, production-ready SaaS platform for rental property management, designed specifically for the Kenyan market. Built with modern technologies and featuring an iOS 18 "Liquid Glass" inspired design.

![RentFlow Dashboard](https://via.placeholder.com/1200x600?text=RentFlow+Dashboard)

## 🌟 Features

### Core Functionality
- **Property Management**: Create and manage multiple properties
- **Unit Management**: Track individual rental units with details
- **Tenant Management**: Complete tenant lifecycle management
- **Payment Tracking**: Record and track rent payments
- **MPESA Integration**: Automated payment reconciliation (ready for integration)
- **Water Billing**: Meter readings and consumption-based billing
- **SMS Notifications**: Automated reminders and alerts (provider-agnostic)
- **Real-time Updates**: Live data synchronization

### User Roles
- **Admin**: Full system access, user management
- **Landlord**: Property and tenant management
- **Caretaker**: Meter readings and basic maintenance

### Design System
- Premium "Liquid Glass" UI inspired by iOS 18
- Dark/Light mode support
- GSAP animations for smooth interactions
- Fully responsive design
- Accessible components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- Clerk account (free tier)

### Local Development

1. **Clone and Install**
```bash
git clone https://github.com/your-org/rentflow.git
cd rentflow
npm install
```

2. **Environment Setup**
Create a `.env.local` file:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk (for production)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Access the App**
Open http://localhost:5173 and sign in with any email/password (demo mode)

## 📁 Project Structure

```
rentflow/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.tsx      # Main layout with sidebar
│   │   └── ui/
│   │       └── index.tsx         # All UI components
│   ├── lib/
│   │   ├── utils.ts              # Utility functions
│   │   └── animations.ts         # GSAP animation utilities
│   ├── pages/
│   │   ├── SignIn.tsx            # Authentication page
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Properties.tsx        # Property management
│   │   ├── Units.tsx             # Unit management
│   │   ├── Tenants.tsx           # Tenant management
│   │   ├── Payments.tsx          # Payment tracking
│   │   ├── MeterReadings.tsx     # Water meter readings
│   │   └── Settings.tsx          # App settings
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── App.tsx                   # Main app with routing
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles & design tokens
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and anon key

### 2. Run Database Migrations

Execute this SQL in your Supabase SQL Editor:

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- RENTFLOW DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('admin', 'landlord', 'caretaker');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'commercial', 'mixed');
CREATE TYPE unit_status AS ENUM ('vacant', 'occupied', 'maintenance', 'reserved');
CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'pending', 'evicted');
CREATE TYPE lease_status AS ENUM ('active', 'expired', 'terminated', 'pending');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('mpesa', 'cash', 'bank_transfer', 'cheque', 'other');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
CREATE TYPE penalty_type AS ENUM ('percentage', 'fixed');
CREATE TYPE id_type AS ENUM ('national_id', 'passport', 'alien_id');
CREATE TYPE notification_type AS ENUM ('reminder', 'penalty', 'payment', 'lease', 'system');
CREATE TYPE notification_channel AS ENUM ('sms', 'email', 'push');

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles (linked to Clerk users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'landlord',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT,
  description TEXT,
  property_type property_type NOT NULL DEFAULT 'apartment',
  water_rate DECIMAL(10,2) NOT NULL DEFAULT 50,
  penalty_rate DECIMAL(10,2) NOT NULL DEFAULT 10,
  penalty_type penalty_type NOT NULL DEFAULT 'percentage',
  billing_day INTEGER NOT NULL DEFAULT 1 CHECK (billing_day >= 1 AND billing_day <= 28),
  grace_period_days INTEGER NOT NULL DEFAULT 5,
  image_url TEXT,
  total_units INTEGER NOT NULL DEFAULT 0,
  occupied_units INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  size_sqm DECIMAL(10,2),
  rent_amount DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2) NOT NULL,
  status unit_status NOT NULL DEFAULT 'vacant',
  description TEXT,
  amenities JSONB DEFAULT '[]',
  image_url TEXT,
  meter_number TEXT,
  last_meter_reading DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, unit_number)
);

-- Tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  id_number TEXT,
  id_type id_type,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  status tenant_status NOT NULL DEFAULT 'pending',
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leases
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2) NOT NULL,
  deposit_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  status lease_status NOT NULL DEFAULT 'pending',
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  item_type TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  mpesa_receipt_number TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Penalties
CREATE TABLE penalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT NOT NULL,
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_waived BOOLEAN NOT NULL DEFAULT FALSE,
  waived_by UUID REFERENCES profiles(id),
  waived_date DATE,
  waive_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meter Readings
CREATE TABLE meter_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  previous_reading DECIMAL(12,2) NOT NULL,
  current_reading DECIMAL(12,2) NOT NULL,
  consumption DECIMAL(12,2) NOT NULL,
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  notes TEXT,
  is_billed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MPESA Transactions (raw data from callbacks)
CREATE TABLE mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  trans_time TIMESTAMPTZ NOT NULL,
  trans_amount DECIMAL(12,2) NOT NULL,
  bill_ref_number TEXT,
  msisdn TEXT NOT NULL,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  org_account_balance DECIMAL(12,2),
  raw_payload JSONB NOT NULL,
  is_reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  reconciled_at TIMESTAMPTZ,
  reconciled_payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_type TEXT NOT NULL,
  recipient_id UUID NOT NULL,
  recipient_phone TEXT,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'sms',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caretaker Assignments
CREATE TABLE caretaker_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caretaker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(caretaker_id, property_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_tenants_phone ON tenants(phone);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_mpesa_trans_id ON mpesa_transactions(transaction_id);
CREATE INDEX idx_mpesa_msisdn ON mpesa_transactions(msisdn);
CREATE INDEX idx_meter_readings_unit ON meter_readings(unit_id);
CREATE INDEX idx_meter_readings_date ON meter_readings(reading_date);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE caretaker_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example - adjust based on your auth setup)
-- In production, these would check auth.uid() against profile.clerk_user_id

-- Properties: Owners can manage their own properties
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (owner_id IN (
    SELECT id FROM profiles WHERE clerk_user_id = current_setting('app.current_user_id', true)
  ));

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- ENABLE REALTIME
-- ═══════════════════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE meter_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### 3. Enable Storage

In Supabase Dashboard → Storage:

1. Create bucket `tenants` (for tenant photos)
2. Create bucket `units` (for unit images)
3. Create bucket `meters` (for meter reading photos)

Set appropriate policies for authenticated uploads.

## 🔐 Authentication Setup (Clerk)

### 1. Create Clerk Application
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Configure allowed sign-in methods (Email, Phone)

### 2. Configure Webhooks
Set up webhook to sync users with Supabase profiles:

Webhook URL: `https://your-api.com/api/clerk/webhook`

Events:
- `user.created`
- `user.updated`
- `user.deleted`

### 3. Environment Variables
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

## 💳 MPESA Integration

### Configuration
1. Register for Safaricom Daraja API
2. Create application in Daraja Portal
3. Get Consumer Key and Secret

### Environment Variables
```env
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_SHORTCODE=123456
MPESA_PASSKEY=xxx
MPESA_CALLBACK_URL=https://your-api.com/api/mpesa/confirmation
```

### Webhook Endpoints
Register these URLs in Daraja portal:

- **Confirmation URL**: `/api/mpesa/confirmation`
- **Validation URL**: `/api/mpesa/validation`

## 📱 SMS Integration

Supports multiple providers through adapter pattern:

- Africa's Talking
- Twilio
- Infobip

### SMS Templates

```
Reminder (1st of month):
"Dear {name}, your balance is Kes {balance}. Please pay by 5th."

Due Today (5th):
"Dear {name}, your rent of Kes {amount} is due today. Please pay to avoid penalties."

Overdue (6th+):
"Dear {name}, your rent is overdue. A penalty of Kes {penalty} has been applied. New balance: Kes {balance}."
```

## 🚀 Deployment

### Frontend (Netlify)

1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

### Backend API (Render)

1. Create new Web Service
2. Connect GitHub repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

### Production Checklist

- [ ] Supabase database migrated
- [ ] RLS policies enabled
- [ ] Storage buckets created
- [ ] Clerk application configured
- [ ] Environment variables set
- [ ] MPESA webhooks registered
- [ ] SMS provider configured
- [ ] Custom domain configured
- [ ] SSL certificates active

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests
npm test
```

## 📊 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS 4, CSS Variables |
| Animations | GSAP |
| State | Zustand |
| Routing | React Router 7 |
| Backend | Node.js, Express/Fastify |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk |
| Payments | MPESA Daraja API |
| SMS | Africa's Talking / Twilio |
| Hosting | Netlify + Render |

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

For questions or support, contact:
- Email: support@rentflow.co.ke
- Documentation: https://docs.rentflow.co.ke

---

Built with ❤️ for Kenyan landlords and property managers.
