# Supabase Setup Guide

This guide walks you through setting up your Supabase project as the backend for RentFlow. The schema ensures that your Caretaker accounts are tightly linked to the Landlord accounts via Row Level Security (RLS).

## Access Controls
* **Landlord**: Full access to all records (Create, Read, Update, Delete).
* **Caretaker**: Can **view** (SELECT) properties, units, tenants, and leases. Can **add/edit** (INSERT/UPDATE) payments, water readings, and maintenance requests.

---

## Step 1: Run the Database Schema
1. Open your Supabase project dashboard.
2. Go to the **SQL Editor** on the left menu.
3. Open the `supabase.sql` file from this project.
4. Copy everything inside `supabase.sql` and run it in the SQL Editor. 
   *(This creates all tables, functions, triggers, and strict RLS policies).*

## Step 2: Create the User Accounts
1. Go to **Authentication** -> **Users** in Supabase.
2. Click **Add User** -> **Create New User** and enter the **Landlord's** email and password.
3. Click **Create New User** again to add the **Caretaker's** email and password.
4. Copy the **User UID** (UUID) for both the Landlord and Caretaker accounts. You will need these for the next step.

## Step 3: Link Accounts and Create the First Property
To officially link the Caretaker to the Landlord and set up the first property, run the following SQL queries in the SQL Editor. 

**IMPORTANT**: Replace `<LANDLORD_UUID>` and `<CARETAKER_UUID>` with the actual UIDs you copied in Step 2.

```sql
-- 1. Create the Landlord profile
insert into profiles (id, role, full_name, email)
values ('<LANDLORD_UUID>', 'landlord', 'Main Landlord', 'landlord@demo.com');

-- 2. Create the Caretaker profile (Linked to the Landlord)
insert into profiles (id, role, full_name, email, landlord_id)
values ('<CARETAKER_UUID>', 'caretaker', 'Property Caretaker', 'caretaker@demo.com', '<LANDLORD_UUID>');

-- 3. Create your first empty property
insert into properties (landlord_id, name, address, total_units)
values ('<LANDLORD_UUID>', 'Sunset Apartments', 'Nairobi, Kenya', 10);
```

## Step 4: Wire the Frontend (Next Session)
Once the database is set up and the initial accounts are created, the frontend needs to be connected to Supabase.

1. Create a `.env.local` file in the root of your project.
2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart your local development server.

When you're ready to pick up from here, let me know, and we'll proceed with hooking the React frontend state to your live Supabase database!
