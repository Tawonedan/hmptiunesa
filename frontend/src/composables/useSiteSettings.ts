// =============================================================================
// Site Settings Composable
// Loads the singleton site_settings row from Supabase. Provides reactive
// branding, social links, stats, and spotlight_mode used across the public
// portal. Falls back to default branding if Supabase is not configured.
// =============================================================================

import { ref, computed, type Ref, type ComputedRef } from 'vue'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { buildFallbackSiteSettings } from '@/config/site'
import { seedSiteSettings } from '@/mock/seed'
import type { SiteSettings, SpotlightMode } from '@/types/database'

// ── Module-scoped State ──────────────────────────────────────────────────────

const settings = ref<SiteSettings>(buildFallbackSiteSettings())
const loading = ref(false)
const error = ref<string | null>(null)
let loadedOnce = false

const fetchSettings = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    // Without Supabase, surface the seed fixture so the public portal has
    // realistic branding during development.
    settings.value = seedSiteSettings
    return
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (fetchError) {
      error.value = fetchError.message
      // Keep fallback settings; don't blow up the UI.
      return
    }
    settings.value = (data as SiteSettings | null) ?? buildFallbackSiteSettings()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat site settings.'
  } finally {
    loading.value = false
    loadedOnce = true
  }
}

const updateSettings = async (patch: Partial<SiteSettings>): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    settings.value = { ...settings.value, ...patch, updated_at: new Date().toISOString() }
    return true
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()
    const { error: updateError } = await client
      .from('site_settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (updateError) {
      error.value = updateError.message
      return false
    }
    await fetchSettings()
    return true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memperbarui setelan.'
    return false
  } finally {
    loading.value = false
  }
}

export interface UseSiteSettingsReturn {
  settings: Ref<SiteSettings>
  loading: Ref<boolean>
  error: Ref<string | null>
  spotlightMode: ComputedRef<SpotlightMode>
  organizationName: ComputedRef<string>
  organizationAbbr: ComputedRef<string>
  cabinetName: ComputedRef<string>
  cabinetPeriod: ComputedRef<string>
  tagline: ComputedRef<string>
  contactEmail: ComputedRef<string>
  socialLinks: ComputedRef<SiteSettings['social_links']>
  stats: ComputedRef<SiteSettings['stats']>
  refresh: () => Promise<void>
  updateSettings: (patch: Partial<SiteSettings>) => Promise<boolean>
}

export function useSiteSettings(): UseSiteSettingsReturn {
  if (!loadedOnce) {
    void fetchSettings()
  }

  const spotlightMode = computed<SpotlightMode>(() => settings.value.spotlight_mode)
  const organizationName = computed(() => settings.value.organization_name)
  const organizationAbbr = computed(() => settings.value.organization_abbr)
  const cabinetName = computed(() => settings.value.cabinet_name ?? '—')
  const cabinetPeriod = computed(() => settings.value.cabinet_period ?? '—')
  const tagline = computed(() => settings.value.tagline ?? '')
  const contactEmail = computed(() => settings.value.contact_email ?? '')
  const socialLinks = computed(() => settings.value.social_links ?? {})
  const stats = computed(() => settings.value.stats ?? {})

  return {
    settings,
    loading,
    error,
    spotlightMode,
    organizationName,
    organizationAbbr,
    cabinetName,
    cabinetPeriod,
    tagline,
    contactEmail,
    socialLinks,
    stats,
    refresh: fetchSettings,
    updateSettings,
  }
}
