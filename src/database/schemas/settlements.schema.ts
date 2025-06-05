import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

import { groups } from './groups.schema';
import { users } from './users.schema';

export const settlements = pgTable('settlements', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  settledBy: integer('settled_by')
    .notNull()
    .references(() => users.id),
  description: text('description'),
  settledAt: timestamp('settled_at').defaultNow().notNull(),
});

export const settlementsRelations = relations(settlements, ({ one }) => ({
  group: one(groups, {
    fields: [settlements.groupId],
    references: [groups.id],
  }),
  settledBy: one(users, {
    fields: [settlements.settledBy],
    references: [users.id],
  }),
}));
