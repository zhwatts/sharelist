import { createClient } from '@supabase/supabase-js'

const url = process.env['SUPABASE_URL']
const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!url || !serviceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
}

// accessToken pins the Authorization header to the service role key on every
// PostgREST request, bypassing supabase-js's auth.getSession() call. Without
// this, any in-memory session set by auth client methods (e.g. signInWithOtp)
// would cause PostgREST calls to send a user JWT instead of the service role
// key, making Postgres execute as `authenticated` and triggering RLS.
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  accessToken: async () => serviceKey,
})
