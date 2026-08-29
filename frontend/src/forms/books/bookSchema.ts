import { z } from 'zod'

export const bookSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    author_name: z.string().min(1, 'Author is required').max(255, 'Author must be less than 255 characters'),
    genre_names: z.array(z.string().min(1)),
    original_year: z.number().int().min(1000).max(2100).optional(),

    isbn: z.string().max(20).optional(),
    publisher: z.string().max(100).optional(),
    publish_year: z.number().int().min(1000).max(2100).optional(),
    page_count: z.number().int().min(1).optional(),
    cover_image: z.string().max(500).optional(),
    language: z.string().max(50).optional(),
    original_language: z.string().max(50).optional(),
    translator: z.string().max(100).optional(),
    format: z.string().max(50).optional(),

    store_name: z.string().max(255).optional(),
    store_type: z.string().max(50).optional(),
    purchase_channel: z.string().max(50).optional(),

    order_placed_date: z.string().optional(),
    order_received_date: z.string().optional(),
    payment_method: z.string().max(50).optional(),
    payment_platform: z.string().max(50).optional(),
    purchase_currency: z.string().max(3).optional(),
    list_price: z.number().min(0).optional(),
    paid_price: z.number().min(0).optional(),
    discount_info: z.string().max(500).optional(),

    condition: z.string().max(50).optional(),
    is_pirated: z.boolean().optional(),
    is_signed: z.boolean().optional(),
    ownership_status: z.string().min(1, 'Ownership status is required').max(50),
  })
  .superRefine((value, ctx) => {
    const needsStore = value.purchase_channel === 'Online' || value.purchase_channel === 'In-Store'

    if (needsStore && !value.store_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Store is required when purchase channel is selected',
        path: ['store_name'],
      })
    }
  })

export type BookSchemaData = z.infer<typeof bookSchema>
