import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { syncLimiter } from '../middlewares/rate-limiter.middleware';
import { validate } from '../middlewares/validate.middleware';
import { deltaSyncSchema, singleSessionUpsertSchema } from '../validators/sync.schema';

export const syncRouter = Router();

// All sync routes require valid JWT authentication
syncRouter.use(authenticate);

syncRouter.post(
  '/',
  syncLimiter,
  validate(deltaSyncSchema),
  SyncController.deltaSync
);

syncRouter.get(
  '/sessions',
  SyncController.getSessions
);

syncRouter.post(
  '/sessions',
  validate(singleSessionUpsertSchema),
  SyncController.upsertSession
);

syncRouter.delete(
  '/sessions/:id',
  SyncController.deleteSession
);

syncRouter.delete(
  '/clear-all',
  SyncController.clearAll
);
