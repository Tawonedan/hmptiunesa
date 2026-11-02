// =============================================================================
// Auth Composable
// Supabase Auth wrapper for the CMS portal.
//
// Exposes a reactive auth state (session, profile, role) plus login / logout
// / refresh helpers. The composable is a thin façade over supabase.auth so
// components stay decoupled from the underlying client.
// =============================================================================

import { ref, computed, type Ref, type ComputedRef } from 'vue'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types/database'

// ── Reactive State ───────────────────────────────────────────────────────────
// Module-scoped so every component using useAuth() shares the same refs.

const session = ref<Awaited<ReturnType<ReturnType<typeof getSupabase>['auth']['getSession']>>['data']['session']>(null)
const profile = ref<Profile | null>(null)
const authLoading = ref(false)
const authError = ref<string | null>(null)

let authListenerRegistered = false

// ── Helpers ──────────────────────────────────────────────────────────────────

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  if (!isSupabaseConfigured()) return null
  try {
    const client = getSupabase()
    const { data, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (profileError) {
      console.warn('[useAuth] profile lookup failed:', profileError.message)
      return null
    }
    return (data as Profile | null) ?? null
  } catch (err) {
    console.warn('[useAuth] profile lookup threw:', err)
    return null
  }
}

const refreshSessionAndProfile = async () => {
  if (!isSupabaseConfigured()) return
  const client = getSupabase()
  try {
    const { data } = await client.auth.getSession()
    session.value = data.session
    profile.value = data.session?.user
      ? await fetchProfile(data.session.user.id)
      : null
  } catch (err) {
    console.warn('[useAuth] refresh failed:', err)
    session.value = null
    profile.value = null
  }
}

const ensureAuthListener = () => {
  if (authListenerRegistered || !isSupabaseConfigured()) return
  const client = getSupabase()
  client.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
    if (newSession?.user) {
      void fetchProfile(newSession.user.id).then((p) => {
        profile.value = p
      })
    } else {
      profile.value = null
    }
  })
  authListenerRegistered = true
}

// ── Composable ───────────────────────────────────────────────────────────────

export interface UseAuthReturn {
  session: Ref<typeof session.value>
  profile: Ref<Profile | null>
  user: ComputedRef<typeof session.value extends null ? null : { id: string; email: string | null } | null>
  isAuthenticated: ComputedRef<boolean>
  role: ComputedRef<UserRole | null>
  isAdmin: ComputedRef<boolean>
  isEditor: ComputedRef<boolean>
  loading: Ref<boolean>
  error: Ref<string | null>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  ensureAuthListener()
  // Trigger an initial session hydration on first use.
  if (session.value === null && isSupabaseConfigured()) {
    void refreshSessionAndProfile()
  }

  const user = computed(() =>
    session.value?.user
      ? { id: session.value.user.id, email: session.value.user.email ?? null }
      : null,
  )

  const isAuthenticated = computed(() => Boolean(session.value && profile.value))

  const role = computed<UserRole | null>(() => profile.value?.role ?? null)

  const isAdmin = computed(() => role.value === 'admin')
  const isEditor = computed(() => role.value === 'editor')

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      authError.value =
        'Supabase belum dikonfigurasi. Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
      return false
    }
    authLoading.value = true
    authError.value = null
    try {
      const client = getSupabase()
      const { data, error: signInError } = await client.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError || !data.session) {
        authError.value = signInError?.message ?? 'Login gagal.'
        return false
      }
      session.value = data.session
      profile.value = await fetchProfile(data.user.id)
      // If profile row is missing, the user has authenticated but is not a
      // pre-provisioned CMS account.
      if (!profile.value) {
        authError.value =
          'Akun tidak memiliki akses CMS. Hubungi administrator.'
        await client.auth.signOut()
        session.value = null
        profile.value = null
        return false
      }
      return true
    } catch (err) {
      authError.value = err instanceof Error ? err.message : 'Login gagal.'
      return false
    } finally {
      authLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      session.value = null
      profile.value = null
      return
    }
    try {
      const client = getSupabase()
      await client.auth.signOut()
    } finally {
      session.value = null
      profile.value = null
    }
  }

  const refresh = async (): Promise<void> => {
    await refreshSessionAndProfile()
  }

  return {
    session: session as UseAuthReturn['session'],
    profile,
    user,
    isAuthenticated,
    role,
    isAdmin,
    isEditor,
    loading: authLoading,
    error: authError,
    login,
    logout,
    refresh,
  }
}
