import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_API_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_ANON_KEY
); 