import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

const paymentSchema = z.object({
  tenant_id: z.string().uuid('Invalid tenant ID'),
  unit_id: z.string().uuid('Invalid unit ID'),
  amount: z.number().positive('Amount must be positive'),
  payment_method: z.enum(['cash', 'bank_transfer', 'mpesa', 'cheque', 'other']),
  payment_date: z.string().min(1, 'Payment date is required'),
  reference_number: z.string().optional(),
});

// IMPORTANT: /summary must be mounted before /:id to avoid param conflict

// GET /api/payments/summary — monthly summary stats
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    const currentDate = new Date();
    const targetYear = year ? parseInt(year as string) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount, status')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate);

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    const totalCollected = payments
      ?.filter((p) => p.status === 'completed' || p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

    const totalPending = payments
      ?.filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

    const summary = {
      month: targetMonth,
      year: targetYear,
      total_collected: totalCollected,
      total_pending: totalPending,
      total_payments: payments?.length ?? 0,
      completed_count: payments?.filter((p) => p.status === 'completed' || p.status === 'paid').length ?? 0,
      pending_count: payments?.filter((p) => p.status === 'pending').length ?? 0,
    };

    res.json({ data: summary });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/payments — list payments with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { month, year, status, tenant_id } = req.query;

    let query = supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id as string);
    }

    if (status) {
      query = query.eq('status', status as string);
    }

    if (month && year) {
      const m = parseInt(month as string);
      const y = parseInt(year as string);
      const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
      const endDate = new Date(y, m, 0).toISOString().split('T')[0];
      query = query.gte('payment_date', startDate).lte('payment_date', endDate);
    } else if (year) {
      const y = parseInt(year as string);
      query = query.gte('payment_date', `${y}-01-01`).lte('payment_date', `${y}-12-31`);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payments — record a payment
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = paymentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({ ...parsed.data, status: 'completed' })
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

// PUT /api/payments/:id — update payment status
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateSchema = z.object({
      status: z.enum(['pending', 'completed', 'paid', 'overdue', 'cancelled']).optional(),
      amount: z.number().positive().optional(),
      payment_method: z.enum(['cash', 'bank_transfer', 'mpesa', 'cheque', 'other']).optional(),
      payment_date: z.string().optional(),
      reference_number: z.string().optional(),
    });

    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Payment not found' });
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

export default router;
