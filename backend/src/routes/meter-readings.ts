import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

const meterReadingSchema = z.object({
  unit_id: z.string().uuid('Invalid unit ID'),
  reading_type: z.enum(['water', 'electricity', 'gas']),
  previous_reading: z.number().min(0, 'Previous reading must be >= 0'),
  current_reading: z.number().min(0, 'Current reading must be >= 0'),
  rate_per_unit: z.number().positive('Rate per unit must be positive'),
  reading_date: z.string().min(1, 'Reading date is required'),
}).refine(
  (data) => data.current_reading >= data.previous_reading,
  {
    message: 'Current reading must be >= previous reading',
    path: ['current_reading'],
  }
);

// GET /api/meter-readings — list readings with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { month, unit_id, type } = req.query;

    let query = supabase
      .from('meter_readings')
      .select('*')
      .order('reading_date', { ascending: false });

    if (unit_id) {
      query = query.eq('unit_id', unit_id as string);
    }

    if (type) {
      query = query.eq('reading_type', type as string);
    }

    if (month) {
      // month expected as YYYY-MM string e.g. "2024-06"
      const [year, mon] = (month as string).split('-');
      if (year && mon) {
        const startDate = `${year}-${mon}-01`;
        const endDate = new Date(parseInt(year), parseInt(mon), 0).toISOString().split('T')[0];
        query = query.gte('reading_date', startDate).lte('reading_date', endDate);
      }
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    // Compute usage and total cost for each reading
    const enriched = (data ?? []).map((r) => ({
      ...r,
      units_consumed: r.current_reading - r.previous_reading,
      total_cost: (r.current_reading - r.previous_reading) * r.rate_per_unit,
    }));

    res.json({ data: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/meter-readings — create a new reading
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = meterReadingSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('meter_readings')
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    const enriched = {
      ...data,
      units_consumed: data.current_reading - data.previous_reading,
      total_cost: (data.current_reading - data.previous_reading) * data.rate_per_unit,
    };

    res.status(201).json({ data: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/meter-readings/:id — update a reading
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = meterReadingSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('meter_readings')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Meter reading not found' });
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
