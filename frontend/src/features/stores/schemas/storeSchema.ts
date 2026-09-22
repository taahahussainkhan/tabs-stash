import { z } from 'zod'

export const storeSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required'),
  type: z.string().trim().min(1, 'Store type is required'),
  website: z.string().trim().optional().or(z.literal('')),
  physical_address: z.string().trim().optional().or(z.literal('')),
  country: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
})

export type StoreSchemaData = z.infer<typeof storeSchema>
