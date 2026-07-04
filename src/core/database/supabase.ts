import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

// During build time, Next.js may execute some code. We shouldn't crash if variables are missing.
// However, we should log a warning if they are missing in production runtime.
if (process.env.NODE_ENV === 'production' && (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)) {
  console.warn(
    'WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is not set. ' +
    'The application may not function correctly.'
  );
}

/**
 * Global Supabase Client Instance
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
