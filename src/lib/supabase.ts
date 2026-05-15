import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-side Supabase client.
 * Uses @supabase/ssr createBrowserClient which automatically
 * handles cookie-based session storage for SSR compatibility.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Create a Supabase browser client configured for session-only storage.
 * When "Remember Me" is unchecked, session is stored in sessionStorage
 * so it is cleared when the browser closes.
 */
export function createSessionOnlyClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      // Setting maxAge to 0 makes the cookie a session cookie
      maxAge: 0,
    },
  })
}
