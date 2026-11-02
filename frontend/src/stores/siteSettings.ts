// =============================================================================
// Site Settings Pinia Store
// Single source of truth for the singleton site_settings row across the app.
// Components subscribe via `useSiteSettingsStore()` instead of calling the
// composable directly when they only need read access (e.g. header, footer).
// =============================================================================

import { defineStore } from 'pinia'
import { computed } from 'vue'

import { useSiteSettings } from '@/composables/useSiteSettings'
import type { SiteSettings, SpotlightMode } from '@/types/database'

export const useSiteSettingsStore = defineStore('siteSettings', () => {
  const { settings, loading, error, spotlightMode, updateSettings } = useSiteSettings()

  const value = computed<SiteSettings>(() => settings.value)
  const mode = computed<SpotlightMode>(() => spotlightMode.value)
  const isLoading = computed<boolean>(() => loading.value)
  const hasError = computed<boolean>(() => error.value !== null)
  const errorMessage = computed<string | null>(() => error.value)

  const setSpotlightMode = async (spotlight_mode: SpotlightMode): Promise<boolean> => {
    return updateSettings({ spotlight_mode })
  }

  return {
    value,
    mode,
    isLoading,
    hasError,
    errorMessage,
    updateSettings,
    setSpotlightMode,
  }
})
