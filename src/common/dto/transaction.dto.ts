import { z } from 'zod';

// Request DTOs
export const CreateTransactionSchema = z.object({
  groupId: z.number(),
  paidBy: z.number(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'), // decimal as string
  description: z.string().optional(),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  participants: z
    .array(
      z.object({
        userId: z.number(),
        shareAmount: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
      }),
    )
    .min(1),
});

export const CreateQuickSplitSchema = z.object({
  groupId: z.number(),
  paidBy: z.number(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  description: z.string().optional(),
  transactionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  participantIds: z.array(z.number()).min(1), // Equal split among these users
});

// Response DTOs
export const TransactionResponseSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  groupName: z.string(),
  paidBy: z.number(),
  paidByName: z.string(),
  totalAmount: z.string(),
  description: z.string().nullable(),
  transactionDate: z.string(),
  createdAt: z.date(),
  participants: z.array(
    z.object({
      userId: z.number(),
      userName: z.string(),
      shareAmount: z.string(),
    }),
  ),
});

export const TransactionSummarySchema = z.object({
  id: z.number(),
  totalAmount: z.string(),
  description: z.string().nullable(),
  transactionDate: z.string(),
  paidByName: z.string(),
  participantCount: z.number(),
});

// Settlement DTOs
export const SettleBalancesSchema = z.object({
  groupId: z.number(),
  description: z.string().optional(),
});

export const SettlementResponseSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  groupName: z.string(),
  settledBy: z.number(),
  settledByName: z.string(),
  description: z.string().nullable(),
  settledAt: z.date(),
});

// Types
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export type CreateQuickSplitDto = z.infer<typeof CreateQuickSplitSchema>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type TransactionSummary = z.infer<typeof TransactionSummarySchema>;
export type SettleBalancesDto = z.infer<typeof SettleBalancesSchema>;
export type SettlementResponse = z.infer<typeof SettlementResponseSchema>;
