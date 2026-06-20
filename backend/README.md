# RentFlow API

Backend REST API for the RentFlow property management application. Built with Node.js, Express, TypeScript, and Supabase.

## Setup

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Copy the example environment file and fill in your values:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` with your Supabase credentials and desired configuration.**

## Environment Variables

| Variable              | Description                                      | Example                      |
|-----------------------|--------------------------------------------------|------------------------------|
| `PORT`                | Port the API server listens on                   | `3001`                       |
| `SUPABASE_URL`        | Your Supabase project URL                        | `https://xyz.supabase.co`    |
| `SUPABASE_SERVICE_KEY`| Supabase service role secret key (server-side)   | `eyJhbGciOiJIUzI1NiIs...`    |
| `FRONTEND_URL`        | Allowed CORS origin (your frontend URL)          | `http://localhost:5173`      |

> **Note:** Use the **service role key** (not the anon key) for `SUPABASE_SERVICE_KEY`. This key bypasses Row Level Security and should never be exposed to the client.

## Running the Server

### Development (with hot reload)
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Available Endpoints

### Auth — `/api/auth`
| Method | Endpoint        | Description                       | Auth Required |
|--------|-----------------|-----------------------------------|---------------|
| POST   | `/sign-in`      | Sign in with email and password   | No            |
| POST   | `/sign-out`     | Sign out current session          | No            |
| GET    | `/me`           | Get current authenticated user    | Yes           |

### Properties — `/api/properties`
| Method | Endpoint  | Description                            | Auth Required |
|--------|-----------|----------------------------------------|---------------|
| GET    | `/`       | List all properties for current user   | Yes           |
| GET    | `/:id`    | Get property details with stats        | Yes           |
| POST   | `/`       | Create a new property                  | Yes           |
| PUT    | `/:id`    | Update property by ID                  | Yes           |
| DELETE | `/:id`    | Delete property by ID                  | Yes           |

### Units — `/api/units`
| Method | Endpoint  | Description                            | Auth Required |
|--------|-----------|----------------------------------------|---------------|
| GET    | `/`       | List units (filter by `?property_id=`) | Yes           |
| GET    | `/:id`    | Get unit with tenant info              | Yes           |
| POST   | `/`       | Create a new unit                      | Yes           |
| PUT    | `/:id`    | Update unit by ID                      | Yes           |
| DELETE | `/:id`    | Delete unit by ID                      | Yes           |

### Tenants — `/api/tenants`
| Method | Endpoint  | Description                            | Auth Required |
|--------|-----------|----------------------------------------|---------------|
| GET    | `/`       | List tenants with lease info           | Yes           |
| GET    | `/:id`    | Get tenant with payment history        | Yes           |
| POST   | `/`       | Create a new tenant                    | Yes           |
| PUT    | `/:id`    | Update tenant by ID                    | Yes           |
| DELETE | `/:id`    | Deactivate tenant (soft delete)        | Yes           |

### Payments — `/api/payments`
| Method | Endpoint   | Description                                         | Auth Required |
|--------|------------|-----------------------------------------------------|---------------|
| GET    | `/`        | List payments (filter by `?month&year&status&tenant_id`) | Yes      |
| GET    | `/summary` | Monthly summary stats (total collected, pending)    | Yes           |
| POST   | `/`        | Record a new payment                                | Yes           |
| PUT    | `/:id`     | Update payment status or details                    | Yes           |

### Meter Readings — `/api/meter-readings`
| Method | Endpoint  | Description                                      | Auth Required |
|--------|-----------|--------------------------------------------------|---------------|
| GET    | `/`       | List readings (filter by `?month&unit_id&type`)  | Yes           |
| POST   | `/`       | Create a new meter reading                       | Yes           |
| PUT    | `/:id`    | Update meter reading by ID                       | Yes           |

### Health Check
| Method | Endpoint  | Description              |
|--------|-----------|--------------------------|
| GET    | `/health` | API health status check  |

## Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <supabase_access_token>
```

The token is obtained from the `/api/auth/sign-in` response (`session.access_token`).

## Rate Limiting

The API enforces a limit of **100 requests per 15 minutes** per IP address.
