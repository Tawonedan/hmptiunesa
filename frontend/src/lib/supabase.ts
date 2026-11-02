// =============================================================================
// Supabase Browser Client
// Initialized from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
// The anon key is safe to ship to the browser — RLS policies enforce access.
// =============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const PLACEHOLDER_TOKENS = ['your-project-id', 'your-supabase-anon-key', 'xxxxx']

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const looksConfigured = (value: string | undefined, placeholderFragment: string): boolean => {
  if (!value) return false
  if (value.trim() === '') return false
  // Reject obvious placeholder values left from .env.example
  return !PLACEHOLDER_TOKENS.some((tok) =>
    value.toLowerCase().includes(tok.toLowerCase()),
  )
}

/**
 * Returns true only when both Supabase environment variables are configured
 * with real-looking values (not the placeholders from .env.example).
 * Components and composables should call this before issuing any query so the
 * site can still render with safe fallback content in development without a
 * Supabase project wired up.
 */
export const isSupabaseConfigured = (): boolean =>
  looksConfigured(supabaseUrl, 'your-project-id') &&
  looksConfigured(supabaseAnonKey, 'your-supabase-anon-key')

/**
 * Lazy Supabase client getter. Throws when called without env vars so that
 * misuse is loud rather than silently failing with a broken client.
 */
export const getSupabase = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
        'in frontend/.env before using Supabase-backed features.',
    )
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Persist session in localStorage so refreshes keep the user signed in.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

// Convenience singleton for code paths that always assume a configured client
// (e.g. composables used after a guard already verified configuration).
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? getSupabase()
  : null
