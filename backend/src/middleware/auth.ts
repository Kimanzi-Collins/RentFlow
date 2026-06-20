import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';

// Augment Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token is empty',
    });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error?.message ?? 'Invalid or expired token',
      });
      return;
    }

    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed',
    });
  }
}
