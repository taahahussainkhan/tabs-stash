import { z } from 'zod';

export const quickMediaTypeSchema = z.enum(['movie', 'series', 'book']);

export const createQuickRecordSchema = z.object({
  body: z.object({
    id: z.string().min(1).optional(), // client-generated UUID; server mints one if absent
    mediaType: quickMediaTypeSchema,
    title: z.string().trim().min(1, 'Title cannot be empty').max(300),
  }),
});

export const updateQuickRecordSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(300).optional(),
    mediaType: quickMediaTypeSchema.optional(),
  }),
});

export const createQuickLogSchema = z.object({
  body: z.object({
    id: z.string().min(1).optional(),
    note: z.string().max(5000).optional().default(''),
    // If the phone captured a stamp time (offline), send it; else server uses now.
    stampedAt: z.number().optional(),
  }),
});

export type CreateQuickRecordInput = z.infer<typeof createQuickRecordSchema>['body'];
export type UpdateQuickRecordInput = z.infer<typeof updateQuickRecordSchema>['body'];
export type CreateQuickLogInput = z.infer<typeof createQuickLogSchema>['body'];
