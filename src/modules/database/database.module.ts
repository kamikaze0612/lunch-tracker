import { Global, Inject, Module } from '@nestjs/common';
import type { Sql } from 'postgres';

import { databaseClientProviderToken } from '@/constants/provider_tokens.constants';

import { databaseProviders } from './database.providers';

@Global()
@Module({
  exports: [...databaseProviders],
  providers: [...databaseProviders],
})
export class DatabaseModule {
  constructor(@Inject(databaseClientProviderToken) private database: Sql) {}

  async onModuleDestroy() {
    await this.database.end();
  }
}
