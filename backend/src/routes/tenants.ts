import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

const tenantSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  national_id: z.string().min(1, 'National ID is required'),
  emergency_contact: z.string().min(1, 'Emergency contact is required'),
});

// GET /api/tenants — list tenants with lease info
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        leases (
          id,
          unit_id,
          start_date,
          end_date,
          monthly_rent,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tenants/:id — get single tenant with payment history
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        *,
        leases (
          id,
          unit_id,
          start_date,
          end_date,
          monthly_rent,
          status,
          units (
            id,
            unit_number,
            property_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (tenantError) {
      if (tenantError.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Tenant not found' });
        return;
      }
      res.status(500).json({ error: 'Database error', message: tenantError.message });
      return;
    }

    // Fetch payment history
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', id)
      .order('payment_date', { ascending: false })
      .limit(24);

    if (paymentsError) {
      res.status(500).json({ error: 'Database error', message: paymentsError.message });
      return;
    }

    res.json({ data: { ...tenant, payment_history: payments } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tenants — create a new tenant
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = tenantSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('tenants')
      .insert({ ...parsed.data, status: 'active' })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tenants/:id — update tenant
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = tenantSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('tenants')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Tenant not found' });
        return;
      }
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tenants/:id — deactivate tenant (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tenants')
      .update({ status: 'inactive' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Tenant not found' });
        return;
      }
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    res.json({ message: 'Tenant deactivated successfully', data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
