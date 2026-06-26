<div align="center">

<!-- Animated wave header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:000000,100:4338ca&height=250&section=header&text=RentFlow&fontSize=90&fontColor=ffffff&fontAlignY=38&desc=Premium%20Property%20Management%20for%20Kenya&descAlignY=58&descSize=18&descColor=e0e7ff&animation=scaleIn" width="100%"/>

<!-- Typing animation -->
[![Typing SVG](https://readme-typing-svg.demolab.com?font=Outfit&weight=600&size=24&pause=1000&color=4338ca&center=true&vCenter=true&multiline=true&repeat=true&width=650&height=60&lines=Collect+Rent+via+M-PESA+%F0%9F%8F%A0;Track+Water+%26+Utilities+%F0%9F%92%A7;Manage+Tenants+%26+Leases+%F0%9F%93%8B;Generate+PDF+Reports+%F0%9F%93%8A)](https://git.io/typing-svg)

<br/>

<!-- Tech stack badges -->
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

<br/>

[![License](https://img.shields.io/badge/License-Proprietary-dc2626?style=flat-square)](./LICENSE)
[![Built with ♥](https://img.shields.io/badge/Built%20with-%E2%99%A5%20in%20Kenya-059669?style=flat-square)](https://github.com/Coll0)

</div>

---

## ✨ What is RentFlow?

> **RentFlow** is a modern, full-featured property management platform built specifically for Kenyan landlords and property managers. It handles the entire rental lifecycle — from onboarding tenants and collecting rent via M-PESA, to tracking water meter readings and generating branded PDF statements.

The app runs entirely in **demo mode** without a backend, and switches seamlessly to live Supabase data once credentials are provided.

---

## 🚀 Features at a Glance

<table>
<tr>
<td width="50%" valign="top">

**🏘 Portfolio Management**
- Multi-property, multi-unit dashboard
- Occupancy tracking with live KPIs
- Property profile pages with revenue charts
- Units auto-marked vacant on tenant removal

**👥 Tenant Lifecycle**
- Add tenants with unit + billing setup in one form
- Custom rent & water rate per tenant
- Per-tenant detail pages with full history
- Delete with pre-download confirmation modal

**💧 Water Billing**
- Monthly meter reading entry
- Auto-resolves previous reading (or move-in reading)
- Partial payment support with balance tracking
- Outstanding vs Paid status per reading

</td>
<td width="50%" valign="top">

**💳 Rent Payments**
- Monthly rent tracking — expected / paid / balance
- M-PESA, Bank Transfer, Cash, Cheque
- Partial payments with transaction log
- Move-in date respected — no phantom past records

**📊 Live Dashboard**
- Animated KPI counters (properties, revenue, occupancy)
- Weekly collection bar chart from real transactions
- Revenue trend area chart (6-month rolling)
- Collection rate donut chart

**📄 PDF Reports**
- Branded tenant statements (rent + water combined)
- Monthly rent collection reports per period
- Property portfolio exports
- Water billing history per tenant

</td>
</tr>
</table>

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 5.9 |
| **Build** | Vite 7 · `vite-plugin-singlefile` (single-file bundle) |
| **Styling** | Tailwind CSS 4 + custom CSS design tokens |
| **Animations** | GSAP 3 + `@gsap/react` |
| **Charts** | Recharts |
| **State** | Zustand 5 (persisted with `zustand/middleware`) |
| **Backend** | Supabase — Auth · PostgreSQL · Row Level Security |
| **PDF** | jsPDF + jsPDF-AutoTable |
| **Routing** | React Router 7 |
| **Deploy** | Netlify |

---

## ⚡ Quick Start

### 1 — Clone & install

```bash
git clone https://github.com/Coll0/rentflow.git
cd rentflow
npm install
```

### 2 — Environment variables

Create `.env.local` at the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

> **Without these keys the app runs in full demo mode** — any credentials accepted, all data lives in localStorage.

### 3 — Database setup

Run these statements in **Supabase → SQL Editor**:

```sql
-- Core schema: profiles, properties, units, tenants, leases,
-- rent_records, rent_transactions, meter_readings, maintenance_requests
-- (See Supabase setup section in project docs for full DDL)

-- Required additional column for water payment tracking:
ALTER TABLE public.meter_readings
ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;
```

### 4 — Run

```bash
npm run dev        # development server
npm run build      # production bundle → dist/index.html
npm run preview    # preview production build
```

---

## 📁 Project Structure

```
rentflow/
├── public/
│   ├── favicon.svg          # Custom SVG favicon
│   └── _redirects           # Netlify SPA routing rule
├── src/
│   ├── components/
│   │   ├── layout/          # AppShell · Sidebar (collapsible) · Topbar
│   │   └── ui/              # Modal · Toast · Badge
│   ├── pages/               # Dashboard · Properties · PropertyDetail
│   │                        # Tenants · TenantDetail · Units
│   │                        # Payments · WaterBilling · Maintenance · Settings
│   ├── stores/              # billingStore · propertyStore · unitStore
│   │                        # maintenanceStore · authStore
│   ├── lib/                 # supabase.ts · export.ts (PDF) · animations.ts
│   └── index.css            # Design tokens + global utilities
├── index.html               # Single entry point
└── vite.config.ts
```

---

## 🗄 Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User accounts linked to Supabase Auth (landlord / caretaker) |
| `properties` | Real estate properties per landlord |
| `units` | Rentable units within properties |
| `tenants` | Tenant records |
| `leases` | Links tenant ↔ unit · stores rent amount, water rate, initial meter reading |
| `rent_records` | Monthly rent tracking — due / paid / balance |
| `rent_transactions` | Individual payment transactions with method + reference |
| `meter_readings` | Water meter readings with billing and partial payment tracking |
| `maintenance_requests` | Repair / maintenance tickets |

---

## 🚢 Deploy to Netlify

1. Push repo to GitHub
2. Connect to Netlify → **New site from Git**
3. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy** — the `public/_redirects` file handles SPA routing

> Supabase keys are baked into the bundle at build time. Changing them requires triggering a new deploy.

---

## 🗺 Roadmap

- [ ] M-PESA Daraja API — live STK push payment collection
- [ ] SMS reminders via Africa's Talking — automated overdue alerts
- [ ] Lease document generator — PDF with e-signature field
- [ ] Caretaker role — limited-access portal for building managers
- [ ] Mobile app — React Native with offline-first sync

---

## 👤 Author

<div align="center">

**Collins Mwandikwa**

[![GitHub](https://img.shields.io/badge/GitHub-@Coll0-181717?style=for-the-badge&logo=github)](https://github.com/Coll0)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/collins-mwandikwa/)

</div>

---

## 📜 License

© 2026 Collins Mwandikwa. All rights reserved.

This software and its source code may not be copied, modified, distributed, or used in any form without explicit written permission from the author.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0a,50:1a1a2e,100:16213e&height=120&section=footer" width="100%"/>

*Built with precision in Nairobi, Kenya 🇰🇪*

</div>
