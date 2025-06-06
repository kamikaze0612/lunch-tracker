import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { databaseProviderToken } from '@/common/constants/provider_tokens.constants';
import { CreateUserDto, UpdateUserDto } from '@/common/dto/user.dto';
import { users } from '@/database/schemas/users.schema';
import type { Database } from '@/modules/database/database.providers';

@Injectable()
export class UsersService {
  constructor(
    @Inject(databaseProviderToken)
    private readonly db: Database,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const [user] = await this.db
        .insert(users)
        .values({
          name: createUserDto.name,
          email: createUserDto.email,
          avatar: createUserDto.avatar,
        })
        .returning();

      return user;
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAllUsers() {
    return await this.db.select().from(users);
  }

  async findUserById(id: number) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const [user] = await this.db
      .update(users)
      .set({
        name: updateUserDto.name,
        avatar: updateUserDto.avatar,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUser(id: number) {
    const [user] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}
