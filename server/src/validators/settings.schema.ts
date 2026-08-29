import { z } from 'zod';

export const updateUserSettingsSchema = z.object({
  body: z.object({
    cardLayout: z.enum(['grid', 'list', 'compact']).optional(),
    cardsPerRow: z.number().int().min(1).max(12).nullable().optional(),
    cardSize: z.enum(['small', 'medium', 'large']).optional(),
    dashboardWidgets: z.record(z.boolean()).optional(),
    dashboardOrder: z.array(z.string()).optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    accentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).nullable().optional(),
    fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    density: z.enum(['compact', 'comfortable', 'spacious']).optional(),
    defaultSort: z.record(z.string()).optional(),
    defaultFilters: z.record(z.any()).optional(),
    itemsPerPage: z.number().int().min(5).max(100).optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
    maxConcurrentWatchingMovies: z.number().int().min(1).nullable().optional(),
    maxConcurrentWatchingSeries: z.number().int().min(1).nullable().optional(),
  }),
});

export const updateLayoutSettingsSchema = z.object({
  body: z.object({
    cardLayout: z.enum(['grid', 'list', 'compact']),
    cardSize: z.enum(['small', 'medium', 'large']),
    cardsPerRow: z.number().int().min(1).max(12).nullable().optional(),
  }),
});

export const updateDashboardSettingsSchema = z.object({
  body: z.object({
    dashboardWidgets: z.record(z.boolean()).optional(),
    dashboardOrder: z.array(z.string()).optional(),
  }),
});

export const userPreferenceRequestSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    isEnabled: z.boolean(),
  }),
});
