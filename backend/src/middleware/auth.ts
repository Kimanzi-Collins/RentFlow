import { Request, Response, NextFunction } from 'express';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createUserClient } from '../lib/supabase.js';

// Augment Express Request with the authenticated user and their RLS-scoped client
declare global {
  namespace Express {
    interface Request {
      user?: User;
      /** Supabase client bound to the caller's JWT — all queries run under their RLS policies. */
      supabase?: SupabaseClient;
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
    const userClient = createUserClient(token);
    const { data, error } = await userClient.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      return;
    }

    req.user = data.user;
    req.supabase = userClient;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed',
    });
  }
}
