import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rate-limiter.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.schema';

export const authRouter = Router();

authRouter.post(
  '/register',
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
  validate(refreshSchema),
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
