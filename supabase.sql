-- RentFlow Supabase SQL Schema
-- Covers all app entities: Landlords, Caretakers, Properties, Units, Tenants, Leases, Payments, Maintenance, and Meter Readings.
-- Accounts for synchronizing caretaker with landlord's data via RLS.

create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Landlords and Caretakers)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('landlord', 'caretaker')),
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  landlord_id uuid references profiles(id) on delete cascade, -- Caretakers belong to a landlord
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure a landlord_id is present if role is caretaker
alter table profiles add constraint chk_caretaker_landlord check (
  (role = 'caretaker' and landlord_id is not null) or (role = 'landlord' and landlord_id is null)
);

-- 2. Properties
create table properties (
  id uuid default uuid_generate_v4() primary key,
  landlord_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  address text not null,
  total_units integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Units
create table units (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid not null references properties(id) on delete cascade,
  unit_number text not null,
  rent_amount numeric not null,
  bedrooms integer default 1,
  status text not null check (status in ('vacant', 'occupied', 'maintenance')) default 'vacant',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tenants
create table tenants (
  id uuid default uuid_generate_v4() primary key,
  landlord_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  national_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Leases
create table leases (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null references tenants(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  start_date date not null,
  end_date date,
  rent_amount numeric not null,
  deposit_amount numeric not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Payments
create table payments (
  id uuid default uuid_generate_v4() primary key,
  lease_id uuid not null references leases(id) on delete cascade,
  amount numeric not null,
  payment_date date not null,
  payment_method text not null,
  reference_number text,
  status text not null check (status in ('pending', 'completed', 'failed')) default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Meter Readings
create table meter_readings (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid not null references units(id) on delete cascade,
  reading_date date not null,
  meter_type text not null check (meter_type in ('water', 'electricity')),
  previous_reading numeric not null,
  current_reading numeric not null,
  consumption numeric generated always as (current_reading - previous_reading) stored,
  rate numeric not null,
  total_amount numeric generated always as ((current_reading - previous_reading) * rate) stored,
  is_billed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Maintenance Requests
create table maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid not null references units(id) on delete cascade,
  reported_by uuid references tenants(id) on delete set null,
  issue_description text not null,
  priority text check (priority in ('low', 'medium', 'high', 'emergency')) default 'medium',
  status text check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Goal: 
-- Landlords can do EVERYTHING for their own data.
-- Caretakers can SELECT everything belonging to their landlord, but can only
-- INSERT/UPDATE Payments, Meter Readings, and Maintenance.
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table payments enable row level security;
alter table meter_readings enable row level security;
alter table maintenance_requests enable row level security;

-- Function to get the current user's effective landlord_id (themselves if landlord, or their landlord's ID if caretaker)
create or replace function get_effective_landlord_id() returns uuid as $$
  select coalesce(landlord_id, id) from profiles where id = auth.uid();
$$ language sql stable security definer;

-- Profiles: Landlords can see themselves and their caretakers. Caretakers can see themselves and their landlord.
create policy "Profiles access" on profiles
  for all
  using (id = auth.uid() or landlord_id = auth.uid() or id = (select landlord_id from profiles where id = auth.uid()));

-- Properties: Caretakers can SELECT. Landlords can ALL.
create policy "Properties select" on properties for select using (landlord_id = get_effective_landlord_id());
create policy "Properties all" on properties for all using (landlord_id = auth.uid());

-- Units: Caretakers can SELECT. Landlords can ALL.
create policy "Units select" on units for select using (property_id in (select id from properties where landlord_id = get_effective_landlord_id()));
create policy "Units all" on units for all using (property_id in (select id from properties where landlord_id = auth.uid()));

-- Tenants: Caretakers can SELECT. Landlords can ALL.
create policy "Tenants select" on tenants for select using (landlord_id = get_effective_landlord_id());
create policy "Tenants all" on tenants for all using (landlord_id = auth.uid());

-- Leases: Caretakers can SELECT. Landlords can ALL.
create policy "Leases select" on leases for select using (tenant_id in (select id from tenants where landlord_id = get_effective_landlord_id()));
create policy "Leases all" on leases for all using (tenant_id in (select id from tenants where landlord_id = auth.uid()));

-- Payments: Landlord & Caretaker can ALL
create policy "Payments all" on payments for all using (
  lease_id in (select id from leases where tenant_id in (select id from tenants where landlord_id = get_effective_landlord_id()))
);

-- Meter Readings: Landlord & Caretaker can ALL
create policy "Meter Readings all" on meter_readings for all using (
  unit_id in (select id from units where property_id in (select id from properties where landlord_id = get_effective_landlord_id()))
);

-- Maintenance Requests: Landlord & Caretaker can ALL
create policy "Maintenance Requests all" on maintenance_requests for all using (
  unit_id in (select id from units where property_id in (select id from properties where landlord_id = get_effective_landlord_id()))
);

-- Setup Avatars Storage Bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'avatars' );


-- ─────────────────────────────────────────────────────────────────────────────
-- SETUP INSTRUCTIONS (How to create the Landlord & Caretaker)
-- ─────────────────────────────────────────────────────────────────────────────
/*
1. Run this SQL in your Supabase SQL Editor.
2. Go to Authentication -> Add User -> Create New User (create the Landlord email/password).
3. Grab the Landlord's `auth.uid` from the users table.
4. Go to Authentication -> Add User -> Create New User (create the Caretaker email/password).
5. Grab the Caretaker's `auth.uid`.

6. Insert the Landlord Profile:
   insert into profiles (id, role, full_name, email)
   values ('<LANDLORD_UUID>', 'landlord', 'Main Landlord', 'landlord@demo.com');

7. Insert the Caretaker Profile (linking them to the landlord):
   insert into profiles (id, role, full_name, email, landlord_id)
   values ('<CARETAKER_UUID>', 'caretaker', 'Property Caretaker', 'caretaker@demo.com', '<LANDLORD_UUID>');

8. Insert your first empty property (no tenants signed up yet!):
   insert into properties (landlord_id, name, address, total_units)
   values ('<LANDLORD_UUID>', 'Sunset Apartments', 'Nairobi, Kenya', 10);
*/
