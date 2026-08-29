import { z } from 'zod';

export const createBookSchema = z.object({
  body: z.object({
    // Work details
    title: z.string().min(1, 'Book title is required').max(255),
    subtitle: z.string().max(500).nullable().optional(),
    originalYear: z.number().int().min(0).max(2100).nullable().optional(),
    seriesName: z.string().max(255).nullable().optional(),
    seriesPosition: z.number().int().nullable().optional(),
    description: z.string().nullable().optional(),
    authors: z.array(z.string()).default([]), // Author IDs or Names
    genres: z.array(z.string()).default([]), // Genre IDs or Slugs
    tags: z.array(z.string()).default([]),

    // Edition details
    publisherName: z.string().nullable().optional(),
    isbn: z.string().max(20).nullable().optional(),
    isbn13: z.string().max(20).nullable().optional(),
    publishYear: z.number().int().min(0).max(2100).nullable().optional(),
    pageCount: z.number().int().min(1).nullable().optional(),
    coverImage: z.string().nullable().optional(),
    language: z.string().default('English'),
    originalLanguage: z.string().nullable().optional(),
    isTranslated: z.boolean().default(false),
    translator: z.string().nullable().optional(),
    translatorNotes: z.string().nullable().optional(),
    format: z.enum(['Paperback', 'Hardcover', 'E-book', 'Audiobook', 'Mass Market']).default('Paperback'),
    editionNumber: z.number().int().nullable().optional(),
    editionNotes: z.string().nullable().optional(),

    // Item details
    storeName: z.string().nullable().optional(),
    storeType: z.enum(['OnlineOnly', 'PhysicalOnly', 'Hybrid']).optional(),
    purchaseChannel: z.string().nullable().optional(),
    orderPlacedDate: z.string().datetime().or(z.date()).nullable().optional(),
    orderReceivedDate: z.string().datetime().or(z.date()).nullable().optional(),
    paymentMethod: z.string().nullable().optional(),
    paymentPlatform: z.string().nullable().optional(),
    purchaseCurrency: z.string().default('USD'),
    listPrice: z.number().min(0).nullable().optional(),
    paidPrice: z.number().min(0).nullable().optional(),
    discountInfo: z.string().nullable().optional(),
    condition: z.string().default('Good'),
    isPirated: z.boolean().default(false),
    isSigned: z.boolean().default(false),
    signedBy: z.string().nullable().optional(),
    dedication: z.string().nullable().optional(),
    ownershipStatus: z.enum(['Owned', 'Wishlist', 'Sold', 'Lent', 'Donated']).default('Owned'),
    isLent: z.boolean().default(false),
    lentTo: z.string().nullable().optional(),
    lentDate: z.string().datetime().or(z.date()).nullable().optional(),
    expectedReturnDate: z.string().datetime().or(z.date()).nullable().optional(),
    personalNotes: z.string().nullable().optional(),
    acquisitionStory: z.string().nullable().optional(),
    linkedTabSessions: z.array(z.string()).optional(),
  }),
});

export const updateBookSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    subtitle: z.string().max(500).nullable().optional(),
    originalYear: z.number().int().min(0).max(2100).nullable().optional(),
    seriesName: z.string().max(255).nullable().optional(),
    seriesPosition: z.number().int().nullable().optional(),
    description: z.string().nullable().optional(),
    pageCount: z.number().int().min(1).nullable().optional(),
    coverImage: z.string().nullable().optional(),
    ownershipStatus: z.enum(['Owned', 'Wishlist', 'Sold', 'Lent', 'Donated']).optional(),
    condition: z.string().optional(),
    isPirated: z.boolean().optional(),
    isSigned: z.boolean().optional(),
    signedBy: z.string().nullable().optional(),
    dedication: z.string().nullable().optional(),
    orderPlacedDate: z.string().datetime().or(z.date()).nullable().optional(),
    orderReceivedDate: z.string().datetime().or(z.date()).nullable().optional(),
    paymentMethod: z.string().nullable().optional(),
    paymentPlatform: z.string().nullable().optional(),
    purchaseCurrency: z.string().optional(),
    listPrice: z.number().min(0).nullable().optional(),
    paidPrice: z.number().min(0).nullable().optional(),
    discountInfo: z.string().nullable().optional(),
    personalNotes: z.string().nullable().optional(),
    acquisitionStory: z.string().nullable().optional(),
  }),
});

export const readingProgressSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    page: z.number().int().min(1, 'Page must be greater than 0'),
  }),
});

export const lendBookSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    lentTo: z.string().min(1, 'Recipient name is required'),
    expectedReturnDate: z.string().datetime().or(z.date()).nullable().optional(),
  }),
});
