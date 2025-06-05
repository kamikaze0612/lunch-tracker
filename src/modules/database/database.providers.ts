import { ConfigModule, ConfigService } from '@nestjs/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import type { Schema } from '@/database/schemas';
import { schema } from '@/database/schemas';

import {
  databaseClientProviderToken,
  databaseProviderToken,
} from '@/common/constants/provider_tokens.constants';

export const databaseProviders = [
  {
    imports: [ConfigModule],
    inject: [ConfigService],
    provide: databaseClientProviderToken,
    useFactory: (configService: ConfigService) => {
      const url = configService.get<string>('database.url')!;

      const client = postgres(url, { prepare: false });

      return client;
    },
  },
  {
    inject: [databaseClientProviderToken],
    provide: databaseProviderToken,
    useFactory: async (client: Sql) => {
      const db = drizzle(client, { schema });

      return db;
    },
  },
];
export type Database = PostgresJsDatabase<Schema>;
