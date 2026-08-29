import { z } from 'zod'

export const addToWatchlistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  director: z.string().max(255, 'Director/Creator must be less than 255 characters'),
  year: z
    .number()
    .int('Year must be an integer')
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 5, 'Year is too far in the future')
    .nullable(),
  genre: z.string().max(100, 'Genre must be less than 100 characters'),
})

export type AddToWatchlistSchemaData = z.infer<typeof addToWatchlistSchema>
