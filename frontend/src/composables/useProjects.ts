// =============================================================================
// Projects Composable
// Fetches published showcase projects for /spotlight (showcase mode).
// Supports category filtering and a featured-only query for the homepage
// highlights section.
// =============================================================================

import { ref, type Ref } from 'vue'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { seedProjects } from '@/mock/seed'
import type { Project } from '@/types/database'

const projects = ref<Project[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchAll = async (): Promise<Project[]> => {
  if (!isSupabaseConfigured()) {
    projects.value = seedProjects
    return projects.value
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    projects.value = (data as Project[]) ?? []
    return projects.value
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat showcase.'
    return []
  } finally {
    loading.value = false
  }
}

const fetchFeatured = async (limit = 3): Promise<Project[]> => {
  if (!isSupabaseConfigured()) {
    return seedProjects.filter((p) => p.is_featured).slice(0, limit)
  }
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    return (data as Project[]) ?? []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat showcase.'
    return []
  }
}

export interface UseProjectsReturn {
  projects: Ref<Project[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchAll: () => Promise<Project[]>
  fetchFeatured: (limit?: number) => Promise<Project[]>
}

export function useProjects(): UseProjectsReturn {
  return {
    projects,
    loading,
    error,
    fetchAll,
    fetchFeatured,
  }
}
