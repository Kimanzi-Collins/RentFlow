import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

const propertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  property_type: z.string().min(1, 'Property type is required'),
  water_rate: z.number().positive('Water rate must be positive'),
  billing_day: z.number().int().min(1).max(31),
  grace_period_days: z.number().int().min(0),
});

// GET /api/properties — list all properties for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', req.user.id)
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

// GET /api/properties/:id — get single property with basic stats
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Property not found' });
        return;
      }
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    // Fetch basic stats: total units, occupied units
    const { data: unitsData } = await supabase
      .from('units')
      .select('id, status')
      .eq('property_id', id);

    const stats = {
      total_units: unitsData?.length ?? 0,
      occupied_units: unitsData?.filter((u) => u.status === 'occupied').length ?? 0,
      vacant_units: unitsData?.filter((u) => u.status === 'vacant').length ?? 0,
    };

    res.json({ data: { ...property, stats } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/properties — create a new property
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = propertySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('properties')
      .insert({ ...parsed.data, user_id: req.user.id })
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

// PUT /api/properties/:id — update property
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = propertySchema.partial().safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { data, error } = await supabase
      .from('properties')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Not found', message: 'Property not found' });
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

// DELETE /api/properties/:id — delete property
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      res.status(500).json({ error: 'Database error', message: error.message });
      return;
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
