import { z } from 'zod';

// Request DTOs
export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  avatar: z.string().url().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

// Response DTOs
export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserWithBalanceSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  balance: z.string(), // decimal as string
});

// Types
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserWithBalance = z.infer<typeof UserWithBalanceSchema>;
