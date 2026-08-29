import { z } from 'zod';

export const createAuthorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Author name is required').max(255),
    bio: z.string().nullable().optional(),
    country: z.string().max(100).nullable().optional(),
    language: z.string().max(50).nullable().optional(),
    birthYear: z.number().int().nullable().optional(),
    deathYear: z.number().int().nullable().optional(),
    website: z.string().url().or(z.literal('')).nullable().optional(),
    imageUrl: z.string().nullable().optional(),
  }),
});

export const updateAuthorSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    bio: z.string().nullable().optional(),
    country: z.string().max(100).nullable().optional(),
    language: z.string().max(50).nullable().optional(),
    birthYear: z.number().int().nullable().optional(),
    deathYear: z.number().int().nullable().optional(),
    website: z.string().url().or(z.literal('')).nullable().optional(),
    imageUrl: z.string().nullable().optional(),
  }),
});
