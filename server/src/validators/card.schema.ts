import { z } from 'zod';

export const cardColorSchema = z.enum(['charcoal', 'terracotta', 'ochre', 'sage', 'cyan', 'purple']).default('charcoal');

export const createCardSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    content: z.string().min(1, 'Card content cannot be empty'),
    title: z.string().optional().default(''),
    color: cardColorSchema.optional().default('charcoal'),
    tags: z.array(z.string()).optional().default([]),
    isPinned: z.boolean().optional().default(false),
    sourceUrl: z.string().optional().default(''),
  }),
});

export const updateCardSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Card content cannot be empty').optional(),
    title: z.string().optional(),
    color: cardColorSchema.optional(),
    tags: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
    sourceUrl: z.string().optional(),
  }),
});

export const cardChangeSchema = z.object({
  id: z.string().min(1, 'Card ID is required'),
  content: z.string().optional().default(''),
  title: z.string().optional().default(''),
  color: cardColorSchema.optional().default('charcoal'),
  tags: z.array(z.string()).optional().default([]),
  isPinned: z.boolean().optional().default(false),
  sourceUrl: z.string().optional().default(''),
  savedAt: z.number().optional().default(() => Date.now()),
  clientUpdatedAt: z.number().optional().default(() => Date.now()),
  deletedAt: z.number().nullable().optional(),
});

export const cardsDeltaSyncSchema = z.object({
  body: z.object({
    lastSyncedTimestamp: z.number().min(0).default(0),
    clientChanges: z.array(cardChangeSchema).default([]),
  }),
});

export type CreateCardInput = z.infer<typeof createCardSchema>['body'];
export type UpdateCardInput = z.infer<typeof updateCardSchema>['body'];
export type CardChangeInput = z.infer<typeof cardChangeSchema>;
