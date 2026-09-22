import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';
import { UserModel } from '../models/user.model';
import { AppError } from './error.middleware';

import { CacheService } from '../services/cache.service';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;

  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookies.access_token) {
    token = cookies.access_token;
  }

  if (!token) {
    return next(new AppError('Authentication required. Missing Bearer token or session cookie.', 401));
  }

  try {
    const payload = verifyAccessToken(token);

    // Fast-path: Check in-memory cache first (< 0.01ms)
    let currentVersion = CacheService.getTokenVersion(payload.userId);

    // Cache-miss fallback: Fetch from DB and populate cache
    if (currentVersion === null) {
      const user = await UserModel.findById(payload.userId).select('tokenVersion').lean();
      if (!user) {
        return next(new AppError('User belonging to this token no longer exists.', 401));
      }
      currentVersion = user.tokenVersion;
      CacheService.setTokenVersion(payload.userId, currentVersion);
    }

    if (currentVersion !== payload.tokenVersion) {
      return next(new AppError('Session has been revoked. Please log in again.', 401));
    }

    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired. Please refresh your token.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
}
