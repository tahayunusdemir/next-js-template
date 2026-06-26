import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, types } from 'pg';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import * as schema from '@/models/Schema';

// `pg` parses `timestamp without time zone` (OID 1114) using the Node process's local
// timezone, but the columns are stored as UTC wall-clocks. On a non-UTC host this skews
// every relative time (e.g. a fresh row reads as the future), so parse these values as UTC.
types.setTypeParser(types.builtins.TIMESTAMP, (value) => new Date(`${value.replace(' ', 'T')}Z`));

export const createDbConnection = () => {
  const pool = new Pool({
    connectionString: Env.DATABASE_URL,
    // One connection per serverless instance, so a Supabase transaction pooler (6543) is not
    // overwhelmed by many cold lambdas. Harmless locally (PGlite is single-connection anyway).
    max: 1,
  });

  pool.on('error', (error) => {
    logger.error(`Database pool error: ${error.message}`);
  });

  return drizzle({
    client: pool,
    schema,
  });
};
