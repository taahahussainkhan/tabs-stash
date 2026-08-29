import { z } from 'zod'

export const episodeTrackingSchema = z.object({
  status: z.enum(['watching', 'completed']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  current_position: z.number().min(0, 'Current position must be positive'),
  rating: z.number().min(0).max(10),
  notes: z.string().optional(),
  title: z.string().optional(),
  duration: z.number().min(0),
})

export type EpisodeTrackingSchemaData = z.infer<typeof episodeTrackingSchema>
