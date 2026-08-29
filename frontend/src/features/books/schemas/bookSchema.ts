import { z } from 'zod'

export const bookSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    subtitle: z.string().max(255).optional(),
    authors: z.array(z.object({
      id: z.number(),
      label: z.string(),
      sublabel: z.string().optional(),
    })).optional(),
    new_author_names: z.array(z.string().min(1)).optional(),
    genre_names: z.array(z.string().min(1)),
    tags: z.array(z.object({
      id: z.number(),
      label: z.string(),
      color: z.string().optional(),
    })).optional(),
    original_year: z.number().int().min(1000).max(2100).optional(),
    series_name: z.string().max(100).optional(),
    series_position: z.number().optional(),
    description: z.string().max(2000).optional(),

    isbn: z.string().max(20).optional(),
    isbn13: z.string().max(20).optional(),
    publisher: z.object({
      id: z.number(),
      label: z.string(),
      sublabel: z.string().optional(),
    }).nullable().optional(),
    new_publisher_name: z.string().max(100).optional(),
    publish_year: z.number().int().min(1000).max(2100).optional(),
    page_count: z.number().int().min(1).optional(),
    cover_image: z.string().max(500).optional(),
    language: z.string().max(50).optional(),
    original_language: z.string().max(50).optional(),
    is_translated: z.boolean().optional(),
    translator: z.string().max(100).optional(),
    translator_notes: z.string().max(500).optional(),
    format: z.string().max(50).optional(),
    edition_number: z.number().int().optional(),
    edition_notes: z.string().max(500).optional(),
    dimensions: z.string().max(100).optional(),
    weight: z.string().max(100).optional(),

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
    signed_by: z.string().max(255).optional(),
    dedication: z.string().max(500).optional(),
    personal_notes: z.string().max(2000).optional(),
    acquisition_story: z.string().max(2000).optional(),
    ownership_status: z.string().min(1, 'Ownership status is required').max(50),
  })
  .superRefine((value, ctx) => {
    const hasAuthor = (value.authors && value.authors.length > 0) || (value.new_author_names && value.new_author_names.length > 0)
    if (!hasAuthor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one author is required',
        path: ['authors'],
      })
    }

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
