import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL is not defined in environment variables");
}

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

export const db = drizzle(pool, { schema });
