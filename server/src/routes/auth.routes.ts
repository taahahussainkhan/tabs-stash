import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rate-limiter.middleware';
import { registerSchema, loginSchema } from '../validators/auth.schema';

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  AuthController.register
);

authRouter.post(
  '/signup',
  authLimiter,
  validate(registerSchema),
  AuthController.register
);

authRouter.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  AuthController.login
);

authRouter.post(
  '/refresh',
  AuthController.refresh
);

authRouter.post(
  '/logout',
  AuthController.logout
);

authRouter.get(
  '/me',
  authenticate,
  AuthController.getMe
);
