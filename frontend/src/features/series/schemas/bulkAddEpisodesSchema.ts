import { z } from 'zod'

export const bulkAddEpisodesSchema = z
  .object({
    start_episode: z.number().int().min(1, 'Start episode is required'),
    end_episode: z.number().int().min(1, 'End episode is required'),
  })
  .superRefine((value, ctx) => {
    if (value.start_episode > value.end_episode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start episode must be less than or equal to end episode',
        path: ['end_episode'],
      })
    }
  })

export type BulkAddEpisodesSchemaData = z.infer<typeof bulkAddEpisodesSchema>
