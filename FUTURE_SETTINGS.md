# Future Settings to Implement

The following settings are deferred until the core database and data flow are fully validated in production:

## 1. Two-Factor Authentication (2FA)
- Requires integration with Supabase Auth MFA (Multi-Factor Authentication).
- Needs setup for Authenticator apps (TOTP) or SMS fallback.

## 2. Automated Monthly Reports
- A cron job or background worker (e.g., Supabase Edge Functions or a separate Node.js server) to automatically generate and email the PDF property reports and tenant statements at the end of each month.
- Needs PDF generation to run server-side (using Puppeteer or similar, or converting the jsPDF logic to work in an Edge Function).
