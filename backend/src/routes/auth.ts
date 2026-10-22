import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAnon } from '../lib/supabase.js';
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

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Generic message: do not reveal whether the email exists or what failed
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
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

// POST /api/auth/sign-out — this API is stateless (the client holds the JWT), so signing
// out means the client discarding its token. Nothing shared on the server is touched.
router.post('/sign-out', authenticateUser, (_req: Request, res: Response) => {
  res.json({ message: 'Signed out successfully' });
});

// GET /api/auth/me — get current authenticated user (protected)
router.get('/me', authenticateUser, (req: Request, res: Response) => {
  res.json({ data: { user: req.user } });
});

export default router;
