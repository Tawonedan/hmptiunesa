// =============================================================================
// Ospek Composable
// Fetches published ospek_content rows for /spotlight (ospek mode).
// Supports filtering by section_type so the view can render different
// layouts (schedule, announcement, handbook, group_info, task_link, resource).
// =============================================================================

import { ref, type Ref } from 'vue'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { seedOspekContent } from '@/mock/seed'
import type { OspekContent, OspekSectionType } from '@/types/database'

const items = ref<OspekContent[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchAll = async (): Promise<OspekContent[]> => {
  if (!isSupabaseConfigured()) {
    items.value = seedOspekContent
    return items.value
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('ospek_content')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    items.value = (data as OspekContent[]) ?? []
    return items.value
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat konten Ospek.'
    return []
  } finally {
    loading.value = false
  }
}

const fetchBySection = async (sectionType: OspekSectionType): Promise<OspekContent[]> => {
  if (!isSupabaseConfigured()) {
    return seedOspekContent.filter((o) => o.section_type === sectionType)
  }
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('ospek_content')
      .select('*')
      .eq('is_published', true)
      .eq('section_type', sectionType)
      .order('sort_order', { ascending: true })

    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    return (data as OspekContent[]) ?? []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat konten Ospek.'
    return []
  }
}

export interface UseOspekReturn {
  items: Ref<OspekContent[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchAll: () => Promise<OspekContent[]>
  fetchBySection: (sectionType: OspekSectionType) => Promise<OspekContent[]>
}

export function useOspek(): UseOspekReturn {
  return {
    items,
    loading,
    error,
    fetchAll,
    fetchBySection,
  }
}
