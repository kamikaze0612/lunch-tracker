export * from './users.schema';
export * from './groups.schema';
export * from './user-groups.schema';
export * from './transactions.schema';
export * from './transaction-participants.schema';
export * from './balances.schema';
export * from './settlements.schema';

import * as users from './users.schema';
import * as groups from './groups.schema';
import * as userGroups from './user-groups.schema';
import * as transactions from './transactions.schema';
import * as transactionParticipants from './transaction-participants.schema';
import * as balances from './balances.schema';
import * as settlements from './settlements.schema';

export const schema = {
  ...users,
  ...groups,
  ...userGroups,
  ...transactions,
  ...transactionParticipants,
  ...balances,
  ...settlements,
};
export type Schema = typeof schema;
