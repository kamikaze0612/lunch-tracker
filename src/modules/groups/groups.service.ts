import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';

import { databaseProviderToken } from '@/constants/provider_tokens.constants';
import {
  CreateGroupDto,
  UpdateGroupDto,
  AddUserToGroupDto,
} from '@/modules/groups/dto/group.dto';
import { groups, users, userGroups, balances } from '@/database/schemas';
import type { Database } from '@/modules/database/database.providers';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(databaseProviderToken)
    private readonly db: Database,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto) {
    const { createdBy } = createGroupDto;

    const [creator] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, createdBy));

    if (!creator) {
      throw new NotFoundException('Creator user not found');
    }

    return await this.db.transaction(async (tx) => {
      const [group] = await tx
        .insert(groups)
        .values({
          name: createGroupDto.name,
          description: createGroupDto.description,
          createdBy: createdBy,
        })
        .returning();

      await tx.insert(userGroups).values({
        userId: createdBy,
        groupId: group.id,
      });

      await tx.insert(balances).values({
        userId: createdBy,
        groupId: group.id,
        balance: '0.00',
      });

      return group;
    });
  }

  async findAllGroups() {
    return await this.db.select().from(groups);
  }

  async findGroupById(id: number) {
    const [group] = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, id));

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async findGroupWithMembers(id: number) {
    const group = await this.findGroupById(id);

    const members = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        joinedAt: userGroups.joinedAt,
      })
      .from(userGroups)
      .innerJoin(users, eq(userGroups.userId, users.id))
      .where(eq(userGroups.groupId, id));

    return {
      ...group,
      members,
    };
  }

  async getUserGroups(userId: number) {
    const userGroupsList = await this.db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdBy: groups.createdBy,
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt,
        joinedAt: userGroups.joinedAt,
      })
      .from(userGroups)
      .innerJoin(groups, eq(userGroups.groupId, groups.id))
      .where(eq(userGroups.userId, userId));

    return userGroupsList;
  }

  async addUsersToGroup(groupId: number, addUserToGroupDto: AddUserToGroupDto) {
    await this.findGroupById(groupId);

    console.log({ addUserToGroupDto });

    return await this.db.transaction(async (tx) => {
      const results: Array<{
        userId: number;
        userName: string;
        joinedAt: Date;
      }> = [];

      for (const userId of addUserToGroupDto.userIds) {
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, userId));

        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const [existingMember] = await tx
          .select()
          .from(userGroups)
          .where(
            and(eq(userGroups.userId, userId), eq(userGroups.groupId, groupId)),
          );

        if (existingMember) {
          throw new BadRequestException(
            `User ${user.name} is already in this group`,
          );
        }

        const [userGroup] = await tx
          .insert(userGroups)
          .values({
            userId: userId,
            groupId: groupId,
          })
          .returning();

        await tx.insert(balances).values({
          userId: userId,
          groupId: groupId,
          balance: '0.00',
        });

        results.push({
          userId: userId,
          userName: user.name,
          joinedAt: userGroup.joinedAt,
        });
      }

      return results;
    });
  }

  async removeUserFromGroup(groupId: number, userId: number) {
    await this.findGroupById(groupId);

    const [userGroup] = await this.db
      .select()
      .from(userGroups)
      .where(
        and(eq(userGroups.userId, userId), eq(userGroups.groupId, groupId)),
      );

    if (!userGroup) {
      throw new NotFoundException('User is not a member of this group');
    }

    // Check if user has outstanding balance
    const [balance] = await this.db
      .select()
      .from(balances)
      .where(and(eq(balances.userId, userId), eq(balances.groupId, groupId)));

    if (balance && parseFloat(balance.balance) !== 0) {
      throw new BadRequestException(
        'Cannot remove user with outstanding balance',
      );
    }

    await this.db
      .delete(userGroups)
      .where(
        and(eq(userGroups.userId, userId), eq(userGroups.groupId, groupId)),
      );

    return { message: 'User removed from group successfully' };
  }

  async updateGroup(id: number, updateGroupDto: UpdateGroupDto) {
    const [group] = await this.db
      .update(groups)
      .set({
        name: updateGroupDto.name,
        description: updateGroupDto.description,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, id))
      .returning();

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async deleteGroup(id: number) {
    const [group] = await this.db
      .delete(groups)
      .where(eq(groups.id, id))
      .returning();

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return { message: 'Group deleted successfully' };
  }
}
