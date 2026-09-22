import cors from 'cors';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with any origin or without origin (mobile, curl, extension)
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Api-Key',
    'X-Client-Version',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
});
