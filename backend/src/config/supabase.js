import { createClient } from '@supabase/supabase-js';

// One server-side Supabase client for the whole backend. It uses the secret key,
// so it must never be imported by frontend code.
const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    'Supabase is not configured: set SUPABASE_URL and SUPABASE_SECRET_KEY in backend/.env (see .env.example).'
  );
}

let origin;
try {
  // Accept a URL copied with a path (e.g. https://<ref>.supabase.co/rest/v1/); the client needs only the origin.
  origin = new URL(SUPABASE_URL).origin;
} catch {
  throw new Error('SUPABASE_URL in backend/.env is not a valid URL (expected https://<project>.supabase.co).');
}

export const supabase = createClient(origin, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
