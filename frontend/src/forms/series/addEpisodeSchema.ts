import { z } from 'zod'

export const addEpisodeSchema = z.object({
  episode_number: z.number().int().min(1, 'Episode number is required'),
  title: z.string().optional(),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute').optional(),
})

export type AddEpisodeSchemaData = z.infer<typeof addEpisodeSchema>
