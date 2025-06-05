import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@/modules/database/database.module';
import { UsersModule } from '@/modules/users/users.module';
import { GroupsModule } from '@/modules/groups/groups.module';
import { TransactionsModule } from '@/modules/transactions/transactions.module';
import { configuration, validate } from '@/config/configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    DatabaseModule,
    UsersModule,
    GroupsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
