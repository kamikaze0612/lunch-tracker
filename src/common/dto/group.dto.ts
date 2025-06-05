import { z } from 'zod';

// Request DTOs
export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  createdBy: z.number(),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const AddUserToGroupSchema = z.object({
  userIds: z.array(z.number()).min(1),
});

// Response DTOs
export const GroupResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  createdBy: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GroupWithMembersSchema = GroupResponseSchema.extend({
  members: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      joinedAt: z.date(),
    }),
  ),
});

export const GroupBalanceSheetSchema = z.object({
  groupId: z.number(),
  groupName: z.string(),
  members: z.array(
    z.object({
      userId: z.number(),
      userName: z.string(),
      balance: z.string(), // positive means they should receive, negative means they owe
    }),
  ),
  totalTransactions: z.number(),
  lastUpdated: z.date().nullable(),
});

// Types
export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupDto = z.infer<typeof UpdateGroupSchema>;
export type AddUserToGroupDto = z.infer<typeof AddUserToGroupSchema>;
export type GroupResponse = z.infer<typeof GroupResponseSchema>;
export type GroupWithMembers = z.infer<typeof GroupWithMembersSchema>;
export type GroupBalanceSheet = z.infer<typeof GroupBalanceSheetSchema>;
