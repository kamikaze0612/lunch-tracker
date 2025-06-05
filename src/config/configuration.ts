import { ENV, Schemas } from './schema';

export const configuration = (overrides?: Partial<ENV>) => {
  const env: ENV = { ...ENV.parse(process.env), ...overrides };

  return {
    app: {
      env: env.APP_ENV,
      port: env.APP_PORT,
    },
    database: {
      url: env.DATABASE_URL,
    },
  };
};

export const validate = (env: Record<string, any>) => {
  const result = Schemas.schema.safeParse(env);

  if (result.success === false) {
    console.log(result.error);
    throw Error('ENV_VALIDATION_FAILED');
  }

  return result.data;
};
