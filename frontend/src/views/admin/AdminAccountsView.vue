<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Profile, UserRole } from '@/types/database'

const authStore = useAuthStore()
const profiles = ref<Profile[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const isInviteModalOpen = ref(false)
const inviteForm = ref({
  email: '',
  full_name: '',
  role: 'editor' as UserRole,
})

const fetchProfiles = async () => {
  isLoading.value = true
  error.value = null

  if (!isSupabaseConfigured()) {
    profiles.value = [
      {
        id: 'usr-admin-1',
        full_name: 'Administrator HMPTI',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'usr-editor-1',
        full_name: 'Pengurus Humas & Kominfo',
        role: 'editor',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
    isLoading.value = false
    return
  }

  try {
    const client = getSupabase()
    const { data, error: err } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) throw err
    profiles.value = (data as Profile[]) || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat daftar akun CMS.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProfiles()
})

const updateRole = async (user: Profile, newRole: UserRole) => {
  if (user.role === newRole) return
  if (!confirm(`Ubah peran ${user.full_name || 'pengguna'} menjadi ${newRole}?`)) return

  if (!isSupabaseConfigured()) {
    user.role = newRole
    return
  }

  try {
    const client = getSupabase()
    const { error: updErr } = await client
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updErr) throw updErr
    user.role = newRole
    successMsg.value = `Peran ${user.full_name} berhasil diperbarui.`
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal memperbarui peran.')
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">CMS</span>
        <h1>Manajemen Akun Pengurus</h1>
        <p class="muted">Kelola hak akses pengurus (Admin & Editor) panel CMS HMPTI UNESA.</p>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

    <div class="card table-card">
      <div v-if="isLoading" class="loading-state">Memuat akun pengurus...</div>
      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Pengurus</th>
              <th>ID Pengguna</th>
              <th>Peran Saat Ini</th>
              <th>Ubah Hak Akses</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in profiles" :key="user.id">
              <td>
                <strong>{{ user.full_name || 'Pengguna CMS' }}</strong>
                <span v-if="authStore.profile?.id === user.id" class="badge badge-accent ml-2">Anda</span>
              </td>
              <td class="small font-mono text-muted">{{ user.id }}</td>
              <td>
                <span :class="['badge', user.role === 'admin' ? 'badge-primary' : 'badge-highlight']">
                  {{ user.role === 'admin' ? 'Administrator' : 'Editor / Pengurus' }}
                </span>
              </td>
              <td>
                <select
                  :value="user.role"
                  :disabled="authStore.profile?.id === user.id"
                  @change="updateRole(user, ($event.target as HTMLSelectElement).value as UserRole)"
                  class="role-select"
                >
                  <option value="admin">Administrator (Akses Penuh)</option>
                  <option value="editor">Editor (Kelola Konten)</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 1.75rem;
  margin: 0.25rem 0;
  color: var(--brand-primary);
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.data-table th {
  background: var(--surface-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.role-select {
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  font-size: 0.85rem;
  background: var(--surface-card);
}

.ml-2 {
  margin-left: 0.5rem;
}

.alert {
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}
.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}
.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}
</style>
