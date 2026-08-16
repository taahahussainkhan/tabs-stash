import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsMiddleware } from './middlewares/cors.middleware';
import { generalLimiter } from './middlewares/rate-limiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { apiRouter } from './routes';
import { env } from './config/env';

export const app = express();

// Security Middlewares
app.use(helmet());
app.use(corsMiddleware);

// Rate Limiting
app.use(generalLimiter);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers with strict size limits (prevents payload DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// API Root
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint ${req.method} ${req.path} not found.`,
    },
  });
});

// Centralized Error Handling
app.use(errorHandler);
