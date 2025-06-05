import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  integer,
  decimal,
  text,
  date,
  timestamp,
} from 'drizzle-orm/pg-core';

import { groups } from './groups.schema';
import { users } from './users.schema';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  paidBy: integer('paid_by')
    .notNull()
    .references(() => users.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  transactionDate: date('transaction_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  group: one(groups, {
    fields: [transactions.groupId],
    references: [groups.id],
  }),
  paidBy: one(users, {
    fields: [transactions.paidBy],
    references: [users.id],
  }),
}));
