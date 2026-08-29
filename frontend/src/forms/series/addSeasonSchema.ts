import { z } from 'zod'

export const addSeasonSchema = z.object({
  season_number: z.number().int().min(1, 'Season number is required'),
  title: z.string().optional(),
  year: z.number().int().min(1900).max(2030).optional(),
  episode_count: z.number().int().min(0).optional(),
  notes: z.string().optional(),
})

export type AddSeasonSchemaData = z.infer<typeof addSeasonSchema>
