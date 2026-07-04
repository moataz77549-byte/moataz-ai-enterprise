import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// SECURITY / RELIABILITY: silently falling back to a placeholder URL/key hides
// misconfiguration until something fails mysteriously at runtime (or worse, appears
// to "work" while pointed at a non-existent project). Fail fast at startup instead.
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set. ' +
      'Copy .env.example to .env.local and fill in your Supabase project credentials.'
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
