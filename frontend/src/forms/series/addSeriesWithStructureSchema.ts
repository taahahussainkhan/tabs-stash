import { z } from 'zod'

const seasonStructureSchema = z.object({
  season_number: z.number().int().min(1, 'Season number is required'),
  episode_count: z.number().int().min(1, 'Episode count must be at least 1'),
  title: z.string().optional(),
  year: z.number().int().min(1900).max(2030).optional(),
})

export const addSeriesWithStructureSchema = z.object({
  title: z.string().min(1, 'Series title is required'),
  creator: z.string().optional(),
  year: z.number().int().min(1900).max(2030).optional(),
  genre: z.string().optional(),
  seasons: z.array(seasonStructureSchema).min(1, 'At least one season is required'),
})

export type AddSeriesWithStructureSchemaData = z.infer<typeof addSeriesWithStructureSchema>
