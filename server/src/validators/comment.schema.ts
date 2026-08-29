import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    loggableType: z.enum(['session', 'movie', 'series', 'episode', 'book']).optional(),
    loggableId: z.string().optional(),
    content: z.string().min(1, 'Comment content cannot be empty'),
    timestamp: z.number().int().min(0).nullable().optional(),
    chapterOrEpisode: z.string().nullable().optional(),
    isSpoiler: z.boolean().default(false),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    content: z.string().min(1).optional(),
    timestamp: z.number().int().min(0).nullable().optional(),
    chapterOrEpisode: z.string().nullable().optional(),
    isSpoiler: z.boolean().optional(),
  }),
});

export const replaceSessionCommentsSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1),
  }),
  body: z.object({
    comments: z.array(
      z.object({
        content: z.string().min(1),
        timestamp: z.number().int().nullable().optional(),
        chapterOrEpisode: z.string().nullable().optional(),
        isSpoiler: z.boolean().default(false),
      })
    ),
  }),
});
