<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  seedActiveCabinet,
  seedDepartments,
  seedMembers,
} from '@/mock/seed'
import type {
  Cabinet,
  CabinetDepartment,
  CabinetMemberWithDepartment,
  MemberLevel,
} from '@/types/database'

const activeTab = ref<'cabinet' | 'departments' | 'members'>('cabinet')
const isLoading = ref(true)
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// Cabinet State
const cabinet = ref<Cabinet | null>(null)
const departments = ref<CabinetDepartment[]>([])
const members = ref<CabinetMemberWithDepartment[]>([])

// Modals
const isDeptModalOpen = ref(false)
const deptForm = ref<{ id?: string; name: string; code: string; description: string }>({
  name: '',
  code: '',
  description: '',
})

const isMemberModalOpen = ref(false)
const memberForm = ref<{
  id?: string
  name: string
  role_title: string
  level: MemberLevel
  department_id: string
  display_order: number
  photo_url: string
  linkedin: string
  github: string
}>({
  name: '',
  role_title: '',
  level: 'bph',
  department_id: '',
  display_order: 1,
  photo_url: '',
  linkedin: '',
  github: '',
})

const fetchData = async () => {
  isLoading.value = true
  error.value = null

  if (!isSupabaseConfigured()) {
    cabinet.value = { ...seedActiveCabinet }
    departments.value = [...seedDepartments]
    members.value = [...seedMembers]
    isLoading.value = false
    return
  }

  try {
    const client = getSupabase()
    const { data: cabData } = await client
      .from('cabinets')
      .select('*')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (cabData) {
      cabinet.value = cabData as Cabinet
      const { data: deptData } = await client
        .from('cabinet_departments')
        .select('*')
        .eq('cabinet_id', cabinet.value.id)
        .order('sort_order', { ascending: true })

      departments.value = (deptData as CabinetDepartment[]) || []

      const { data: memData } = await client
        .from('cabinet_members')
        .select('*, cabinet_departments (name, code)')
        .eq('cabinet_id', cabinet.value.id)
        .order('display_order', { ascending: true })

      members.value = (memData as unknown as CabinetMemberWithDepartment[]) || []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat struktur kabinet.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const saveCabinet = async () => {
  if (!cabinet.value) return
  error.value = null
  successMsg.value = null

  if (!isSupabaseConfigured()) {
    successMsg.value = 'Data kabinet berhasil diperbarui!'
    return
  }

  try {
    const client = getSupabase()
    const { error: updErr } = await client
      .from('cabinets')
      .update({
        name: cabinet.value.name,
        period: cabinet.value.period,
        vision: cabinet.value.vision,
        mission: cabinet.value.mission,
        history_text: cabinet.value.history_text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cabinet.value.id)

    if (updErr) throw updErr
    successMsg.value = 'Perubahan profil kabinet berhasil disimpan!'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan profil kabinet.'
  }
}

const openAddDept = () => {
  deptForm.value = { name: '', code: '', description: '' }
  isDeptModalOpen.value = true
}

const saveDept = async () => {
  if (!cabinet.value) return
  if (!isSupabaseConfigured()) {
    departments.value.push({
      id: 'mock-dept-' + Date.now(),
      cabinet_id: cabinet.value.id,
      name: deptForm.value.name,
      code: deptForm.value.code,
      description: deptForm.value.description,
      icon_url: null,
      sort_order: departments.value.length + 1,
      created_at: new Date().toISOString(),
    })
    isDeptModalOpen.value = false
    return
  }

  try {
    const client = getSupabase()
    const { error: insErr } = await client.from('cabinet_departments').insert([
      {
        cabinet_id: cabinet.value.id,
        name: deptForm.value.name,
        code: deptForm.value.code,
        description: deptForm.value.description,
        sort_order: departments.value.length + 1,
      },
    ])
    if (insErr) throw insErr
    await fetchData()
    isDeptModalOpen.value = false
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal menyimpan departemen.')
  }
}

const openAddMember = () => {
  memberForm.value = {
    name: '',
    role_title: '',
    level: 'staff_muda',
    department_id: departments.value[0]?.id || '',
    display_order: members.value.length + 1,
    photo_url: '',
    linkedin: '',
    github: '',
  }
  isMemberModalOpen.value = true
}

const saveMember = async () => {
  if (!cabinet.value) return
  const payload = {
    cabinet_id: cabinet.value.id,
    department_id: memberForm.value.department_id || null,
    name: memberForm.value.name,
    role_title: memberForm.value.role_title,
    level: memberForm.value.level,
    display_order: memberForm.value.display_order,
    photo_url: memberForm.value.photo_url || null,
    social_links: {
      linkedin: memberForm.value.linkedin || undefined,
      github: memberForm.value.github || undefined,
    },
  }

  if (!isSupabaseConfigured()) {
    const matchedDept = departments.value.find((d) => d.id === payload.department_id)
    const newMem: CabinetMemberWithDepartment = {
      ...payload,
      id: 'mock-mem-' + Date.now(),
      created_by: null,
      updated_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      department: matchedDept || null,
    }
    members.value.push(newMem)
    isMemberModalOpen.value = false
    return
  }

  try {
    const client = getSupabase()
    const { error: insErr } = await client.from('cabinet_members').insert([payload])
    if (insErr) throw insErr
    await fetchData()
    isMemberModalOpen.value = false
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal menambahkan fungsionaris.')
  }
}

const deleteMember = async (mem: CabinetMemberWithDepartment) => {
  if (!confirm(`Hapus anggota "${mem.name}"?`)) return
  if (!isSupabaseConfigured()) {
    members.value = members.value.filter((m) => m.id !== mem.id)
    return
  }

  try {
    const client = getSupabase()
    const { error: delErr } = await client.from('cabinet_members').delete().eq('id', mem.id)
    if (delErr) throw delErr
    members.value = members.value.filter((m) => m.id !== mem.id)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal menghapus anggota.')
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">CMS</span>
        <h1>Manajemen Kabinet & Kepengurusan</h1>
        <p class="muted">Kelola profil kabinet, departemen, serta daftar fungsionaris publik.</p>
      </div>
      <div class="tab-pills">
        <button
          :class="['tab-btn', activeTab === 'cabinet' ? 'active' : '']"
          @click="activeTab = 'cabinet'"
        >
          Profil Kabinet
        </button>
        <button
          :class="['tab-btn', activeTab === 'departments' ? 'active' : '']"
          @click="activeTab = 'departments'"
        >
          Departemen ({{ departments.length }})
        </button>
        <button
          :class="['tab-btn', activeTab === 'members' ? 'active' : '']"
          @click="activeTab = 'members'"
        >
          Fungsionaris ({{ members.length }})
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

    <!-- Tab 1: Profile & Visi Misi -->
    <div v-if="activeTab === 'cabinet'" class="card">
      <form v-if="cabinet" @submit.prevent="saveCabinet">
        <h2>Identitas & Visi Misi Kabinet</h2>
        <div class="form-grid">
          <div class="field">
            <label>Nama Kabinet</label>
            <input v-model="cabinet.name" type="text" required />
          </div>

          <div class="field">
            <label>Periode Jabatan</label>
            <input v-model="cabinet.period" type="text" required />
          </div>

          <div class="field field-full">
            <label>Visi Kabinet</label>
            <textarea v-model="cabinet.vision" rows="3"></textarea>
          </div>

          <div class="field field-full">
            <label>Misi Kabinet (Tulis tiap poin dalam baris baru)</label>
            <textarea v-model="cabinet.mission" rows="5"></textarea>
          </div>

          <div class="field field-full">
            <label>Latar Belakang / Sejarah Singkat</label>
            <textarea v-model="cabinet.history_text" rows="4"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Simpan Profil Kabinet</button>
        </div>
      </form>
      <div v-else class="empty-state">Belum ada kabinet aktif.</div>
    </div>

    <!-- Tab 2: Departments -->
    <div v-if="activeTab === 'departments'" class="card table-card">
      <div class="card-toolbar">
        <h2>Daftar Departemen</h2>
        <button class="btn btn-primary btn-sm" @click="openAddDept">+ Tambah Departemen</button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Departemen</th>
              <th>Deskripsi Tugas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in departments" :key="d.id">
              <td><span class="badge badge-accent">{{ d.code || 'DEPT' }}</span></td>
              <td><strong>{{ d.name }}</strong></td>
              <td class="small muted">{{ d.description || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 3: Members -->
    <div v-if="activeTab === 'members'" class="card table-card">
      <div class="card-toolbar">
        <h2>Daftar Fungsionaris</h2>
        <button class="btn btn-primary btn-sm" @click="openAddMember">+ Tambah Fungsionaris</button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Urutan</th>
              <th>Nama Lengkap</th>
              <th>Jabatan / Role</th>
              <th>Hierarki</th>
              <th>Departemen</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in members" :key="m.id">
              <td class="small font-mono">{{ m.display_order }}</td>
              <td><strong>{{ m.name }}</strong></td>
              <td class="small">{{ m.role_title }}</td>
              <td><span class="badge badge-primary">{{ m.level }}</span></td>
              <td class="small">{{ m.department?.name || 'BPH Inti' }}</td>
              <td>
                <button class="btn-icon btn-danger" title="Hapus" @click="deleteMember(m)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Dept Modal -->
    <div v-if="isDeptModalOpen" class="modal-backdrop" @click.self="isDeptModalOpen = false">
      <div class="modal card">
        <div class="modal-header">
          <h2>Tambah Departemen</h2>
          <button class="close-btn" @click="isDeptModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="saveDept">
          <div class="field">
            <label>Kode Singkatan (Misal: KOMINFO, PSDM)</label>
            <input v-model="deptForm.code" type="text" required />
          </div>
          <div class="field">
            <label>Nama Lengkap Departemen</label>
            <input v-model="deptForm.name" type="text" required />
          </div>
          <div class="field">
            <label>Deskripsi Tugas & Program</label>
            <textarea v-model="deptForm.description" rows="3"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="isDeptModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Departemen</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="isMemberModalOpen" class="modal-backdrop" @click.self="isMemberModalOpen = false">
      <div class="modal card">
        <div class="modal-header">
          <h2>Tambah Fungsionaris</h2>
          <button class="close-btn" @click="isMemberModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="saveMember">
          <div class="form-grid">
            <div class="field field-full">
              <label>Nama Lengkap (Tanpa NIM/Email Pribadi) *</label>
              <input v-model="memberForm.name" type="text" required />
            </div>

            <div class="field">
              <label>Jabatan (Role Title) *</label>
              <input v-model="memberForm.role_title" type="text" placeholder="Misal: Ketua Himpunan" required />
            </div>

            <div class="field">
              <label>Tingkat Hierarki *</label>
              <select v-model="memberForm.level" required>
                <option value="bph">BPH (Badan Pengurus Harian)</option>
                <option value="coordinator">Koordinator Departemen</option>
                <option value="staff_ahli">Staff Ahli</option>
                <option value="staff_muda">Staff Muda</option>
              </select>
            </div>

            <div class="field">
              <label>Departemen</label>
              <select v-model="memberForm.department_id">
                <option value="">BPH Inti / Non-Departemen</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>

            <div class="field">
              <label>Urutan Tampil (Sort)</label>
              <input v-model.number="memberForm.display_order" type="number" />
            </div>

            <div class="field field-full">
              <label>URL Foto Formal (Transparan / Square)</label>
              <input v-model="memberForm.photo_url" type="url" placeholder="https://..." />
            </div>

            <div class="field">
              <label>LinkedIn Profil URL (Publik)</label>
              <input v-model="memberForm.linkedin" type="url" placeholder="https://linkedin.com/in/..." />
            </div>

            <div class="field">
              <label>GitHub Profil URL (Publik)</label>
              <input v-model="memberForm.github" type="url" placeholder="https://github.com/..." />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="isMemberModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary">Tambahkan Anggota</button>
          </div>
        </form>
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

.tab-pills {
  display: flex;
  gap: 0.5rem;
  background: var(--surface-muted);
  padding: 0.25rem;
  border-radius: var(--radius-pill);
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: var(--brand-primary);
  color: #ffffff;
}

.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.card-toolbar h2 {
  font-size: 1.2rem;
  margin: 0;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.field-full {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.field input,
.field select,
.field textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
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

.btn-icon {
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.5rem;
  cursor: pointer;
}

.btn-danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 37, 64, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1.5rem;
}

.modal {
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--surface-card);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
