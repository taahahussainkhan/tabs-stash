import { z } from 'zod'

export const signUpSchema = z.object({
  first_name: z.string().max(255, 'First name is too long'),
  last_name: z.string().max(255, 'Last name is too long'),
  username: z.string().max(255, 'Username is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export type SignUpSchemaData = z.infer<typeof signUpSchema>
