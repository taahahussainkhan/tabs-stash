import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { LinkController } from '../controllers/link.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { syncLimiter } from '../middlewares/rate-limiter.middleware';
import { validate } from '../middlewares/validate.middleware';
import { deltaSyncSchema, singleSessionUpsertSchema } from '../validators/sync.schema';
import { createLinkSchema, updateLinkReadSchema, linksDeltaSyncSchema } from '../validators/link.schema';

export const syncRouter = Router();

// All sync routes require valid JWT authentication
syncRouter.use(authenticate);

// --- Sessions Sync Routes ---
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

// --- Saved Reading Links Sync Routes ---
syncRouter.get(
  '/links',
  LinkController.getLinks
);

syncRouter.post(
  '/links',
  validate(createLinkSchema),
  LinkController.saveLink
);

syncRouter.patch(
  '/links/:id',
  validate(updateLinkReadSchema),
  LinkController.toggleRead
);

syncRouter.delete(
  '/links/:id',
  LinkController.deleteLink
);

syncRouter.post(
  '/links/delta',
  syncLimiter,
  validate(linksDeltaSyncSchema),
  LinkController.deltaSync
);
