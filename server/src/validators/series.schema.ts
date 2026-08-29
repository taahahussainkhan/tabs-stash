import { z } from 'zod';

export const seasonStructureSchema = z.object({
  seasonNumber: z.number().int().min(1),
  title: z.string().nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  episodeCount: z.number().int().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const createSeriesSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    creator: z.string().max(255).nullable().optional(),
    year: z.number().int().min(1900).max(2100).nullable().optional(),
    genre: z.string().max(100).nullable().optional(),
    posterImage: z.string().nullable().optional(),
    platform: z.string().max(100).nullable().optional(),

    // Initial session info
    status: z.enum(['watching', 'completed', 'paused', 'rewatching']).default('watching'),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).nullable().optional(),
    currentTimestamp: z.number().int().min(0).nullable().optional(),
    stopReason: z.string().nullable().optional(),
    isRewatch: z.boolean().default(false),
    rating: z.number().min(0).max(10).nullable().optional(),
    notes: z.string().nullable().optional(),

    isFavorite: z.boolean().default(false),
    isWatchlist: z.boolean().default(false),
    seasons: z.array(seasonStructureSchema).optional(),
    linkedTabSessions: z.array(z.string()).optional(),
    referenceUrls: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
      icon: z.string().optional(),
    })).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateSeriesSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    creator: z.string().max(255).nullable().optional(),
    year: z.number().int().min(1900).max(2100).nullable().optional(),
    genre: z.string().max(100).nullable().optional(),
    posterImage: z.string().nullable().optional(),
    platform: z.string().max(100).nullable().optional(),
    isFavorite: z.boolean().optional(),
    isWatchlist: z.boolean().optional(),

    // Session updates
    status: z.enum(['watching', 'completed', 'paused', 'rewatching']).optional(),
    startDate: z.string().datetime().or(z.date()).optional(),
    endDate: z.string().datetime().or(z.date()).nullable().optional(),
    currentTimestamp: z.number().int().min(0).nullable().optional(),
    stopReason: z.string().nullable().optional(),
    isRewatch: z.boolean().optional(),
    rating: z.number().min(0).max(10).nullable().optional(),
    notes: z.string().nullable().optional(),
    linkedTabSessions: z.array(z.string()).optional(),
    referenceUrls: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
      icon: z.string().optional(),
    })).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateEpisodeSchema = z.object({
  params: z.object({
    id: z.string().min(1), // seriesId
    episodePublicId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().optional(),
    duration: z.number().int().min(0).nullable().optional(),
    isWatched: z.boolean().optional(),
    watchedDate: z.string().datetime().or(z.date()).nullable().optional(),
    currentTimestamp: z.number().int().min(0).nullable().optional(),
    rating: z.number().min(0).max(10).nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
});
