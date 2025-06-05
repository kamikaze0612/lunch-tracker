import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, desc, count } from 'drizzle-orm';

import { databaseProviderToken } from '@/common/constants/provider_tokens.constants';
import {
  CreateTransactionDto,
  CreateQuickSplitDto,
  SettleBalancesDto,
} from '@/common/dto/transaction.dto';
import {
  transactions,
  transactionParticipants,
  users,
  groups,
  userGroups,
  balances,
  settlements,
} from '@/database/schemas';
import type { Database } from '@/modules/database/database.providers';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(databaseProviderToken)
    private readonly db: Database,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    // Validate group exists
    const [group] = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, createTransactionDto.groupId));

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Validate payer is in group
    const [payerInGroup] = await this.db
      .select()
      .from(userGroups)
      .where(
        and(
          eq(userGroups.userId, createTransactionDto.paidBy),
          eq(userGroups.groupId, createTransactionDto.groupId),
        ),
      );

    if (!payerInGroup) {
      throw new BadRequestException('Payer is not a member of this group');
    }

    // Validate all participants are in group
    for (const participant of createTransactionDto.participants) {
      const [participantInGroup] = await this.db
        .select()
        .from(userGroups)
        .where(
          and(
            eq(userGroups.userId, participant.userId),
            eq(userGroups.groupId, createTransactionDto.groupId),
          ),
        );

      if (!participantInGroup) {
        throw new BadRequestException(
          `Participant with ID ${participant.userId} is not in this group`,
        );
      }
    }

    // Validate total amounts match
    const totalParticipantAmount = createTransactionDto.participants.reduce(
      (sum, p) => sum + parseFloat(p.shareAmount),
      0,
    );
    const totalAmount = parseFloat(createTransactionDto.totalAmount);

    if (Math.abs(totalParticipantAmount - totalAmount) > 0.01) {
      throw new BadRequestException(
        'Participant shares do not match total amount',
      );
    }

    return await this.db.transaction(async (tx) => {
      // Create transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          groupId: createTransactionDto.groupId,
          paidBy: createTransactionDto.paidBy,
          totalAmount: createTransactionDto.totalAmount,
          description: createTransactionDto.description,
          transactionDate: createTransactionDto.transactionDate,
        })
        .returning();

      // Create transaction participants
      const participantData = createTransactionDto.participants.map((p) => ({
        transactionId: transaction.id,
        userId: p.userId,
        shareAmount: p.shareAmount,
      }));

      await tx.insert(transactionParticipants).values(participantData);

      // Update balances
      await this.updateBalances(tx, createTransactionDto);

      return await this.getTransactionById(transaction.id);
    });
  }

  async createQuickSplit(createQuickSplitDto: CreateQuickSplitDto) {
    const participantCount = createQuickSplitDto.participantIds.length;
    const shareAmount = (
      parseFloat(createQuickSplitDto.totalAmount) / participantCount
    ).toFixed(2);

    const participants = createQuickSplitDto.participantIds.map((userId) => ({
      userId,
      shareAmount,
    }));

    const createTransactionDto: CreateTransactionDto = {
      ...createQuickSplitDto,
      participants,
    };

    return await this.createTransaction(createTransactionDto);
  }

  private async updateBalances(
    tx: Database,
    transactionData: CreateTransactionDto,
  ) {
    // Update payer's balance (they get positive amount minus their share)
    const payerShare = transactionData.participants.find(
      (p) => p.userId === transactionData.paidBy,
    );
    const payerBalance =
      parseFloat(transactionData.totalAmount) -
      parseFloat(payerShare?.shareAmount || '0');

    await tx
      .update(balances)
      .set({
        balance: `(balance::numeric + ${payerBalance})::text`,
        lastUpdated: new Date(),
      })
      .where(
        and(
          eq(balances.userId, transactionData.paidBy),
          eq(balances.groupId, transactionData.groupId),
        ),
      );

    // Update all participants' balances (they get negative amounts)
    for (const participant of transactionData.participants) {
      if (participant.userId !== transactionData.paidBy) {
        await tx
          .update(balances)
          .set({
            balance: `(balance::numeric - ${participant.shareAmount})::text`,
            lastUpdated: new Date(),
          })
          .where(
            and(
              eq(balances.userId, participant.userId),
              eq(balances.groupId, transactionData.groupId),
            ),
          );
      }
    }
  }

  async getTransactionById(id: number) {
    const [transaction] = await this.db
      .select({
        id: transactions.id,
        groupId: transactions.groupId,
        groupName: groups.name,
        paidBy: transactions.paidBy,
        paidByName: users.name,
        totalAmount: transactions.totalAmount,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(groups, eq(transactions.groupId, groups.id))
      .innerJoin(users, eq(transactions.paidBy, users.id))
      .where(eq(transactions.id, id));

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const participants = await this.db
      .select({
        userId: transactionParticipants.userId,
        userName: users.name,
        shareAmount: transactionParticipants.shareAmount,
      })
      .from(transactionParticipants)
      .innerJoin(users, eq(transactionParticipants.userId, users.id))
      .where(eq(transactionParticipants.transactionId, id));

    return {
      ...transaction,
      participants,
    };
  }

  async getGroupTransactions(groupId: number, limit = 50, offset = 0) {
    const transactionsList = await this.db
      .select({
        id: transactions.id,
        totalAmount: transactions.totalAmount,
        description: transactions.description,
        transactionDate: transactions.transactionDate,
        paidByName: users.name,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.paidBy, users.id))
      .where(eq(transactions.groupId, groupId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    // Get participant count for each transaction
    const enrichedTransactions = await Promise.all(
      transactionsList.map(async (transaction) => {
        const [{ count: participantCount }] = await this.db
          .select({ count: count() })
          .from(transactionParticipants)
          .where(eq(transactionParticipants.transactionId, transaction.id));

        return {
          ...transaction,
          participantCount: participantCount,
        };
      }),
    );

    return enrichedTransactions;
  }

  async getGroupBalanceSheet(groupId: number) {
    // Validate group exists
    const [group] = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId));

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const members = await this.db
      .select({
        userId: balances.userId,
        userName: users.name,
        balance: balances.balance,
        lastUpdated: balances.lastUpdated,
      })
      .from(balances)
      .innerJoin(users, eq(balances.userId, users.id))
      .where(eq(balances.groupId, groupId));

    const [{ count: transactionCount }] = await this.db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.groupId, groupId));

    const latestUpdate = members.reduce((latest, member) => {
      return member.lastUpdated > latest ? member.lastUpdated : latest;
    }, new Date(0));

    return {
      groupId,
      groupName: group.name,
      members,
      totalTransactions: transactionCount,
      lastUpdated: latestUpdate > new Date(0) ? latestUpdate : null,
    };
  }

  async settleBalances(
    settleBalancesDto: SettleBalancesDto,
    settledBy: number,
  ) {
    // Validate group exists
    const [group] = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, settleBalancesDto.groupId));

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Validate settler is in group
    const [settlerInGroup] = await this.db
      .select()
      .from(userGroups)
      .where(
        and(
          eq(userGroups.userId, settledBy),
          eq(userGroups.groupId, settleBalancesDto.groupId),
        ),
      );

    if (!settlerInGroup) {
      throw new BadRequestException('You are not a member of this group');
    }

    return await this.db.transaction(async (tx) => {
      // Reset all balances to 0
      await tx
        .update(balances)
        .set({
          balance: '0.00',
          lastUpdated: new Date(),
        })
        .where(eq(balances.groupId, settleBalancesDto.groupId));

      // Create settlement record
      const [settlement] = await tx
        .insert(settlements)
        .values({
          groupId: settleBalancesDto.groupId,
          settledBy: settledBy,
          description: settleBalancesDto.description,
        })
        .returning();

      // Get settlement with user and group names
      const [enrichedSettlement] = await tx
        .select({
          id: settlements.id,
          groupId: settlements.groupId,
          groupName: groups.name,
          settledBy: settlements.settledBy,
          settledByName: users.name,
          description: settlements.description,
          settledAt: settlements.settledAt,
        })
        .from(settlements)
        .innerJoin(groups, eq(settlements.groupId, groups.id))
        .innerJoin(users, eq(settlements.settledBy, users.id))
        .where(eq(settlements.id, settlement.id));

      return enrichedSettlement;
    });
  }

  async getGroupSettlements(groupId: number) {
    return await this.db
      .select({
        id: settlements.id,
        settledByName: users.name,
        description: settlements.description,
        settledAt: settlements.settledAt,
      })
      .from(settlements)
      .innerJoin(users, eq(settlements.settledBy, users.id))
      .where(eq(settlements.groupId, groupId))
      .orderBy(desc(settlements.settledAt));
  }
}
