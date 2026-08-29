import { z } from 'zod'

export const storeSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required'),
  type: z.string().trim().min(1, 'Store type is required'),
})

export type StoreSchemaData = z.infer<typeof storeSchema>
