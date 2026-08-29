import { z } from 'zod';

export const userProfileUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    name: z.string().max(100).optional(),
    username: z.string().min(2).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and dashes').optional(),
    dateOfBirth: z.string().datetime().nullable().optional(),
    phoneNumber: z.string().max(20).optional(),
    profileImage: z.string().url().or(z.literal('')).optional(),
  }),
});

export const passwordChangeSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  }),
});
