import { z } from 'zod';

const schema = z.object({
  APP_ENV: z.enum(['development', 'production', 'staging']),
  APP_PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
});

export const Schemas = {
  schema: schema,
};

export const ENV = schema;
export type ENV = z.infer<typeof ENV>;
