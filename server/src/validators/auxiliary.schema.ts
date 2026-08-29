import { z } from 'zod';

export const createGenreSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Genre name is required').max(100),
    slug: z.string().min(1).max(100).optional(),
  }),
});

export const updateGenreSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
  }),
});

export const createPublisherSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Publisher name is required').max(255),
    country: z.string().max(100).nullable().optional(),
    foundedYear: z.number().int().nullable().optional(),
    website: z.string().url().or(z.literal('')).nullable().optional(),
    description: z.string().nullable().optional(),
  }),
});

export const updatePublisherSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    country: z.string().max(100).nullable().optional(),
    foundedYear: z.number().int().nullable().optional(),
    website: z.string().url().or(z.literal('')).nullable().optional(),
    description: z.string().nullable().optional(),
  }),
});

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Store name is required').max(255),
    type: z.enum(['OnlineOnly', 'PhysicalOnly', 'Hybrid']).default('Hybrid'),
  }),
});

export const updateStoreSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.enum(['OnlineOnly', 'PhysicalOnly', 'Hybrid']).optional(),
  }),
});
