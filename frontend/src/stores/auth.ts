// =============================================================================
// Auth Pinia Store
// Thin Pinia wrapper around the useAuth composable so global consumers
// (router guards, admin layouts, toasts) can subscribe to a single reactive
// auth source via `useAuthStore()`.
// =============================================================================

import { defineStore } from 'pinia'
import { computed } from 'vue'

import { useAuth } from '@/composables/useAuth'
import type { Profile, UserRole } from '@/types/database'

export const useAuthStore = defineStore('auth', () => {
  const auth = useAuth()

  const profile = computed<Profile | null>(() => auth.profile.value)
  const role = computed<UserRole | null>(() => auth.role.value)
  const isAuthenticated = computed<boolean>(() => auth.isAuthenticated.value)
  const isAdmin = computed<boolean>(() => auth.isAdmin.value)
  const isEditor = computed<boolean>(() => auth.isEditor.value)
  const loading = computed<boolean>(() => auth.loading.value)
  const error = computed<string | null>(() => auth.error.value)

  const login = async (email: string, password: string): Promise<boolean> =>
    auth.login(email, password)

  const logout = async (): Promise<void> => auth.logout()

  const refresh = async (): Promise<void> => auth.refresh()

  return {
    profile,
    role,
    isAuthenticated,
    isAdmin,
    isEditor,
    loading,
    error,
    login,
    logout,
    refresh,
  }
})
