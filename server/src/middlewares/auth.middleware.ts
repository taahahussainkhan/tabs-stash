import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';
import { UserModel } from '../models/user.model';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Verify user still exists and tokenVersion matches
    const user = await UserModel.findById(payload.userId).select('tokenVersion');
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    if (user.tokenVersion !== payload.tokenVersion) {
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
