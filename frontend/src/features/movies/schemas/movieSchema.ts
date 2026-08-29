import { z } from 'zod'
import type { MovieLog } from '../../features/movies/types/movie'

const commentSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  duration: z.number().optional(),
  text: z.string(),
  created_at: z.string().optional(),
})

export const movieSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  director: z.string().max(255, 'Director must be less than 255 characters').optional(),
    year: z.number().min(1900, 'Year must be 1900 or later').max(2030, 'Year must be 2030 or earlier').optional().nullable(),
    genre: z.string().max(100, 'Genre must be less than 100 characters').optional(),
    poster_image: z.string().max(500, 'Image URL must be less than 500 characters').url('Invalid URL format').optional().or(z.literal('')),
    platform: z.string().max(100, 'Platform must be less than 100 characters').optional(),
  rating: z.number().min(0, 'Rating must be at least 0').max(10, 'Rating must be at most 10').optional().nullable(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.enum(['watching', 'completed', 'paused', 'rewatching']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  current_timestamp: z.number().min(0, 'Current timestamp must be positive').optional().nullable(),
  stop_reason: z.string().max(500, 'Stop reason must be less than 500 characters').optional(),
  is_rewatch: z.boolean().optional(),
  comments: z.array(commentSchema).optional(),
})

export type MovieSchemaData = z.infer<typeof movieSchema>

export function getDefaultMovieValues(editingMovie?: MovieLog | null): MovieSchemaData {
  return {
    title: editingMovie?.title || '',
    director: editingMovie?.director || '',
    year: editingMovie?.year ?? null,
    genre: editingMovie?.genre || '',
    poster_image: editingMovie?.poster_image || '',
    platform: editingMovie?.platform || '',
    rating: editingMovie?.rating ?? null,
    notes: editingMovie?.notes || '',
    status: editingMovie?.status || 'watching',
    start_date: editingMovie?.start_date
      ? new Date(editingMovie.start_date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    end_date: editingMovie?.end_date
      ? new Date(editingMovie.end_date).toISOString().slice(0, 16)
      : '',
    current_timestamp: editingMovie?.current_timestamp ?? null,
    stop_reason: editingMovie?.stop_reason || '',
    is_rewatch: editingMovie?.is_rewatch || false,
    comments: [],
  }
}
