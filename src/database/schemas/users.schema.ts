import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';

import { balances } from './balances.schema';
import { groups } from './groups.schema';
import { settlements } from './settlements.schema';
import { transactions } from './transactions.schema';
import { transactionParticipants } from './transaction-participants.schema';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatar: text('avatar'), // Optional avatar URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  groups: many(groups),
  transactions: many(transactions),
  transactionParticipants: many(transactionParticipants),
  balances: many(balances),
  settlements: many(settlements),
}));
