-- RentFlow Supabase SQL Schema
-- Covers all app entities: Landlords, Caretakers, Properties, Units, Tenants, Leases, Payments, Maintenance, and Meter Readings.
-- Accounts for synchronizing caretaker with landlord's data via RLS and data structures.

-- Enable required extensions
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
  assigned_to uuid references profiles(id) on delete set null, -- Can be assigned to a caretaker
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
-- Goal: Caretakers can access data belonging to their associated landlord.

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table payments enable row level security;
alter table meter_readings enable row level security;
alter table maintenance_requests enable row level security;

-- Function to get the current user's effective landlord_id
create or replace function get_effective_landlord_id() returns uuid as $$
  select coalesce(landlord_id, id) from profiles where id = auth.uid();
$$ language sql stable security definer;

-- Profiles: Landlords can see themselves and their caretakers. Caretakers can see themselves and their landlord.
create policy "Profiles access" on profiles
  for all
  using (
    id = auth.uid() or 
    landlord_id = auth.uid() or 
    id = (select landlord_id from profiles where id = auth.uid())
  );

-- Properties: Accessible by landlord or caretaker of that landlord
create policy "Properties access" on properties
  for all
  using (landlord_id = get_effective_landlord_id());

-- Units: Accessible if the property is accessible
create policy "Units access" on units
  for all
  using (
    property_id in (select id from properties where landlord_id = get_effective_landlord_id())
  );

-- Tenants: Accessible by landlord or caretaker
create policy "Tenants access" on tenants
  for all
  using (landlord_id = get_effective_landlord_id());

-- Leases: Accessible if tenant is accessible
create policy "Leases access" on leases
  for all
  using (
    tenant_id in (select id from tenants where landlord_id = get_effective_landlord_id())
  );

-- Payments: Accessible if lease is accessible
create policy "Payments access" on payments
  for all
  using (
    lease_id in (select id from leases where tenant_id in (select id from tenants where landlord_id = get_effective_landlord_id()))
  );

-- Meter Readings: Accessible if unit is accessible
create policy "Meter Readings access" on meter_readings
  for all
  using (
    unit_id in (select id from units where property_id in (select id from properties where landlord_id = get_effective_landlord_id()))
  );

-- Maintenance Requests: Accessible if unit is accessible
create policy "Maintenance Requests access" on maintenance_requests
  for all
  using (
    unit_id in (select id from units where property_id in (select id from properties where landlord_id = get_effective_landlord_id()))
  );

-- Setup Avatars Storage Bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
