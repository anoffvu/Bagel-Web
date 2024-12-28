import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL,
  },
  tablesFilter: ["messages"],
  strict: true,
  verbose: true,
} satisfies Config;
