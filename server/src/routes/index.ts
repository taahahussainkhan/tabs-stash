import { Router } from 'express';
import { authRouter } from './auth.routes';
import { syncRouter } from './sync.routes';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TabVault Sync API',
    version: '1.0.0',
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/sync', syncRouter);
