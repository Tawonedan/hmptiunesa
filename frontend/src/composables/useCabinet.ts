// =============================================================================
// Cabinet Composable
// Fetches the active cabinet with its departments and members for the public
// /about page. Returns a flat list of members joined with their department so
// the view can group by hierarchy level and department.
// =============================================================================

import { ref, type Ref } from 'vue'

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  seedActiveCabinet,
  seedCabinetHistory,
  seedDepartments,
  seedMembers,
} from '@/mock/seed'
import type {
  Cabinet,
  CabinetDepartment,
  CabinetMemberWithDepartment,
} from '@/types/database'

const activeCabinet = ref<Cabinet | null>(null)
const departments = ref<CabinetDepartment[]>([])
const members = ref<CabinetMemberWithDepartment[]>([])
const cabinetHistory = ref<Cabinet[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let loadedOnce = false

const fetchActiveCabinet = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    activeCabinet.value = seedActiveCabinet
    departments.value = seedDepartments
    members.value = seedMembers
    cabinetHistory.value = seedCabinetHistory
    return
  }
  loading.value = true
  error.value = null
  try {
    const client = getSupabase()

    // 1. Active cabinet (single row expected)
    const { data: cabinetRow, error: cabinetError } = await client
      .from('cabinets')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (cabinetError) {
      error.value = cabinetError.message
      return
    }

    activeCabinet.value = (cabinetRow as Cabinet | null) ?? null

    if (!activeCabinet.value) {
      departments.value = []
      members.value = []
      return
    }

    const cabinetId = activeCabinet.value.id

    // 2. Departments under this cabinet
    const { data: deptRows, error: deptError } = await client
      .from('cabinet_departments')
      .select('*')
      .eq('cabinet_id', cabinetId)
      .order('sort_order', { ascending: true })

    if (deptError) {
      error.value = deptError.message
      return
    }
    departments.value = (deptRows as CabinetDepartment[]) ?? []

    // 3. Members under this cabinet, joined with department
    const { data: memberRows, error: memberError } = await client
      .from('cabinet_members')
      .select('*, department: cabinet_departments!department_id(*)')
      .eq('cabinet_id', cabinetId)
      .order('display_order', { ascending: true })

    if (memberError) {
      error.value = memberError.message
      return
    }
    members.value = (memberRows as CabinetMemberWithDepartment[]) ?? []

    // 4. Archived cabinet history (excluding the active one)
    const { data: historyRows, error: historyError } = await client
      .from('cabinets')
      .select('*')
      .eq('status', 'archived')
      .order('sort_order', { ascending: true })

    if (historyError) {
      error.value = historyError.message
      return
    }
    cabinetHistory.value = (historyRows as Cabinet[]) ?? []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat data kabinet.'
  } finally {
    loading.value = false
    loadedOnce = true
  }
}

export interface UseCabinetReturn {
  activeCabinet: Ref<Cabinet | null>
  departments: Ref<CabinetDepartment[]>
  members: Ref<CabinetMemberWithDepartment[]>
  cabinetHistory: Ref<Cabinet[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  refresh: () => Promise<void>
}

export function useCabinet(): UseCabinetReturn {
  if (!loadedOnce) {
    void fetchActiveCabinet()
  }
  return {
    activeCabinet,
    departments,
    members,
    cabinetHistory,
    loading,
    error,
    refresh: fetchActiveCabinet,
  }
}
