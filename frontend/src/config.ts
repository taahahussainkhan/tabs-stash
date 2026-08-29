import { z } from 'zod';

const configSchema = z.object({
  API_URL: z.string().url(),
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
};

export const config = configSchema.parse(_config);
