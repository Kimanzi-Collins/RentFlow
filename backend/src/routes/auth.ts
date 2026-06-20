import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST /api/auth/sign-in — authenticate user and return session
router.post('/sign-in', async (req: Request, res: Response) => {
  try {
    const parsed = signInSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parsed.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
      });
      return;
    }

    res.json({
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/sign-out — sign out the current user
router.post('/sign-out', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      res.status(500).json({ error: 'Sign out failed', message: error.message });
      return;
    }

    res.json({ message: 'Signed out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me — get current authenticated user (protected)
router.get('/me', authenticateUser, (req: Request, res: Response) => {
  res.json({ data: { user: req.user } });
});

export default router;
