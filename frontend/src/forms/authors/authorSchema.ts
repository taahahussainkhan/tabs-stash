import { z } from 'zod'

export const authorSchema = z.object({
  name: z.string().trim().min(1, 'Author name is required'),
  bio: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  birth_year: z
    .number()
    .int('Birth year must be a whole number')
    .min(1000, 'Birth year must be between 1000 and 2030')
    .max(2030, 'Birth year must be between 1000 and 2030')
    .optional(),
})

export type AuthorSchemaData = z.infer<typeof authorSchema>
