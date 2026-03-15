import { createClient } from '@supabase/supabase-js';
import { Russo_One } from 'next/font/google';

import { Database } from '@/../supabase/database.types';

export const russoOne = Russo_One({
  subsets: ['latin'],
  weight: ['400'],
});

export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
);
