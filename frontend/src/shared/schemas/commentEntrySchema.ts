import { z } from 'zod'

export const commentEntrySchema = z.object({
  timestamp: z
    .string()
    .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Timestamp must be a positive number'),
  duration: z
    .string()
    .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Duration must be a positive number'),
  text: z.string().min(1, 'Comment is required').max(1000, 'Comment must be less than 1000 characters'),
})

export type CommentEntrySchemaData = z.infer<typeof commentEntrySchema>
