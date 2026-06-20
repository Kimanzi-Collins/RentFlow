import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

const unitSchema = z.object({
  unit_number: z.string().min(1, 'Unit number is required'),
  property_id: z.string().uuid('Invalid property ID'),
  unit_type: z.string().min(1, 'Unit type is required'),
  rent_amount: z.number().positive('Rent amount must be positive'),
  bedrooms: z.number().int().min(0),
});

// GET /api/units — list units, optionally filtered by property_id
router.get('/', async (req: Request, res: Response) => {
  try {
    let query = supabase.from('units').select('*').order('created_at', { ascending: false });

    if (req.query.property_id) {
      query = query.eq('property_id', req.query.property_id as string);
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

// GET /api/units/:id — get single unit with tenant info
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        tenants (
          id,
          full_name,
          email,
          phone,
          status
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Unit not found' });
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

// POST /api/units — create a new unit
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = unitSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('units')
      .insert(parsed.data)
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

// PUT /api/units/:id — update unit
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = unitSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('units')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Unit not found' });
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

// DELETE /api/units/:id — delete unit
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('units').delete().eq('id', id);

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    res.json({ message: 'Unit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
