import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, decimal } from 'drizzle-orm/pg-core';

import { transactions } from './transactions.schema';
import { users } from './users.schema';

export const transactionParticipants = pgTable('transaction_participants', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  shareAmount: decimal('share_amount', { precision: 10, scale: 2 }).notNull(),
});

export const transactionParticipantsRelations = relations(
  transactionParticipants,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionParticipants.transactionId],
      references: [transactions.id],
    }),
    user: one(users, {
      fields: [transactionParticipants.userId],
      references: [users.id],
    }),
  }),
);
