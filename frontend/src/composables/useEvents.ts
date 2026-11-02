// =============================================================================
// Events Composable
// Fetches published events for the public portal.
// Two flavours:
//   - fetchUpcoming() → status IN ('upcoming','ongoing'), ordered by start_date
//   - fetchArchive()  → status = 'completed',        ordered by start_date desc
//   - fetchBySlug()   → single event by slug (for /events/:id page)
// =============================================================================

import { ref, type Ref } from 'vue'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { seedEvents } from '@/mock/seed'
import type { Event } from '@/types/database'

const upcomingEvents = ref<Event[]>([])
const archivedEvents = ref<Event[]>([])
const currentEvent = ref<Event | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchUpcoming = async (): Promise<Event[]> => {
  if (!isSupabaseConfigured()) {
    upcomingEvents.value = seedEvents.filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
    return upcomingEvents.value
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('events')
      .select('*')
      .in('status', ['upcoming', 'ongoing'])
      .eq('is_published', true)
      .order('start_date', { ascending: true })

    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    upcomingEvents.value = (data as Event[]) ?? []
    return upcomingEvents.value
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat kegiatan.'
    return []
  } finally {
    loading.value = false
  }
}

const fetchArchive = async (): Promise<Event[]> => {
  if (!isSupabaseConfigured()) {
    archivedEvents.value = seedEvents.filter((e) => e.status === 'completed')
    return archivedEvents.value
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('events')
      .select('*')
      .eq('status', 'completed')
      .eq('is_published', true)
      .order('start_date', { ascending: false })

    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    archivedEvents.value = (data as Event[]) ?? []
    return archivedEvents.value
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat arsip.'
    return []
  } finally {
    loading.value = false
  }
}

const fetchBySlug = async (slug: string): Promise<Event | null> => {
  if (!isSupabaseConfigured()) {
    currentEvent.value = seedEvents.find((e) => e.slug === slug) ?? null
    return currentEvent.value
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()
    const { data, error: fetchError } = await client
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (fetchError) {
      error.value = fetchError.message
      currentEvent.value = null
      return null
    }
    currentEvent.value = (data as Event | null) ?? null
    return currentEvent.value
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat detail kegiatan.'
    currentEvent.value = null
    return null
  } finally {
    loading.value = false
  }
}

export interface UseEventsReturn {
  upcomingEvents: Ref<Event[]>
  archivedEvents: Ref<Event[]>
  currentEvent: Ref<Event | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchUpcoming: () => Promise<Event[]>
  fetchArchive: () => Promise<Event[]>
  fetchBySlug: (slug: string) => Promise<Event | null>
}

export function useEvents(): UseEventsReturn {
  return {
    upcomingEvents,
    archivedEvents,
    currentEvent,
    loading,
    error,
    fetchUpcoming,
    fetchArchive,
    fetchBySlug,
  }
}
