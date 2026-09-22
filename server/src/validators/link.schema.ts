import { z } from 'zod';

export const createLinkSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    url: z.string().min(1, 'A valid URL string is required'),
    title: z.string().optional().default(''),
    hostname: z.string().optional().default('link'),
    pageUrl: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const updateLinkReadSchema = z.object({
  body: z.object({
    isRead: z.boolean(),
  }),
});

export const linkChangeSchema = z.object({
  id: z.string().min(1, 'Link ID is required'),
  url: z.string().min(1, 'URL string is required'),
  title: z.string().optional().default('Saved Link'),
  hostname: z.string().optional().default('link'),
  pageUrl: z.string().optional().default(''),
  savedAt: z.number().optional().default(() => Date.now()),
  isRead: z.boolean().optional().default(false),
  readAt: z.number().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  clientUpdatedAt: z.number().optional().default(() => Date.now()),
  deletedAt: z.number().nullable().optional(),
});

export const linksDeltaSyncSchema = z.object({
  body: z.object({
    lastSyncedTimestamp: z.number().min(0).default(0),
    clientChanges: z.array(linkChangeSchema).default([]),
  }),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>['body'];
export type UpdateLinkReadInput = z.infer<typeof updateLinkReadSchema>['body'];
export type LinkChangeInput = z.infer<typeof linkChangeSchema>;
