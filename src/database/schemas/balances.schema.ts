import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  integer,
  decimal,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

import { groups } from './groups.schema';
import { users } from './users.schema';

export const balances = pgTable(
  'balances',
  {
    id: serial('id').primaryKey(),
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    balance: decimal('balance', { precision: 10, scale: 2 })
      .notNull()
      .default('0.00'),
    lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserGroup: unique().on(table.groupId, table.userId),
  }),
);

export const balancesRelations = relations(balances, ({ one }) => ({
  group: one(groups, {
    fields: [balances.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [balances.userId],
    references: [users.id],
  }),
}));
