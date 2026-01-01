import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Handle missing DATABASE_URL during build time
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('DATABASE_URL not set - database operations will fail');
    }
    // secretlint-disable-next-line
    return 'postgresql://dummy:dummy@localhost:5432/dummy';
  }
  return url;
};

const sql: NeonQueryFunction<false, false> = neon(getDatabaseUrl());

export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

export * from './schema';
