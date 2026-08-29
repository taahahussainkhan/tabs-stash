import { z } from 'zod'

export const updateProgressSchema = z.object({
  status: z.enum(['watching', 'completed', 'paused', 'rewatching']),
  current_timestamp: z.number().min(0, 'Current timestamp must be positive').nullable(),
  stop_reason: z.string().max(500, 'Stop reason must be less than 500 characters'),
})

export type UpdateProgressSchemaData = z.infer<typeof updateProgressSchema>
