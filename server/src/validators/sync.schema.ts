import { z } from 'zod';

export const tabItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().default('Untitled Tab'),
  url: z.string().min(1),
  favIconUrl: z.string().optional().default(''),
  hostname: z.string().optional().default('local'),
  pinned: z.boolean().optional().default(false),
  isPopped: z.boolean().optional().default(false),
  poppedAt: z.number().int().nullable().optional().default(null),
  stashedAt: z.number().int().positive(),
});

export const deviceInfoSchema = z.object({
  deviceId: z.string().optional().default(''),
  deviceName: z.string().optional().default('My PC'),
  platform: z.string().optional().default('Unknown'),
  browser: z.string().optional().default('Browser'),
  windowId: z.union([z.number(), z.string()]).optional().default(1),
}).optional();

export const clientSessionChangeSchema = z.object({
  id: z.string().min(1, 'Session ID is required'),
  title: z.string().min(1, 'Title is required'),
  timestamp: z.number().int().positive(),
  isPinned: z.boolean().default(false),
  isArchived: z.boolean().optional().default(false),
  archivedAt: z.number().int().nullable().optional().default(null),
  tags: z.array(z.string()).default([]),
  tabs: z.array(tabItemSchema).default([]),
  deviceInfo: deviceInfoSchema,
  clientUpdatedAt: z.number().int().positive(),
  deletedAt: z.number().int().nullable().default(null),
});

export const deltaSyncSchema = z.object({
  body: z.object({
    lastSyncedTimestamp: z.number().int().nonnegative().default(0),
    clientChanges: z.array(clientSessionChangeChangeSchemaFallback()).max(200, 'Batch size limit exceeded'),
  }),
});

function clientSessionChangeChangeSchemaFallback() {
  return clientSessionChangeSchema;
}

export const singleSessionUpsertSchema = z.object({
  body: clientSessionChangeSchema,
});
