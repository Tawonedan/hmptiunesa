<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { seedOspekContent } from '@/mock/seed'
import type { OspekContent, OspekSectionType } from '@/types/database'

const items = ref<OspekContent[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref<string | null>(null)
const isSubmitting = ref(false)

const form = ref<{
  section_type: OspekSectionType
  title: string
  description: string
  link_url: string
  file_url: string
  scheduled_at: string
  sort_order: number
  is_published: boolean
}>({
  section_type: 'announcement',
  title: '',
  description: '',
  link_url: '',
  file_url: '',
  scheduled_at: '',
  sort_order: 1,
  is_published: true,
})

const fetchItems = async () => {
  isLoading.value = true
  error.value = null

  if (!isSupabaseConfigured()) {
    items.value = [...seedOspekContent]
    isLoading.value = false
    return
  }

  try {
    const client = getSupabase()
    const { data, error: fetchErr } = await client
      .from('ospek_content')
      .select('*')
      .order('sort_order', { ascending: true })

    if (fetchErr) {
      error.value = fetchErr.message
    } else {
      items.value = (data as OspekContent[]) || []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat konten Ospek.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchItems()
})

const openAddModal = () => {
  modalMode.value = 'add'
  currentId.value = null
  form.value = {
    section_type: 'announcement',
    title: '',
    description: '',
    link_url: '',
    file_url: '',
    scheduled_at: '',
    sort_order: (items.value.length + 1) * 10,
    is_published: true,
  }
  isModalOpen.value = true
}

const openEditModal = (item: OspekContent) => {
  modalMode.value = 'edit'
  currentId.value = item.id
  form.value = {
    section_type: item.section_type,
    title: item.title,
    description: item.description || '',
    link_url: item.link_url || '',
    file_url: item.file_url || '',
    scheduled_at: item.scheduled_at || '',
    sort_order: item.sort_order,
    is_published: item.is_published,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async () => {
  isSubmitting.value = true
  error.value = null

  const payload = {
    section_type: form.value.section_type,
    title: form.value.title,
    description: form.value.description || null,
    link_url: form.value.link_url || null,
    file_url: form.value.file_url || null,
    scheduled_at: form.value.scheduled_at || null,
    sort_order: form.value.sort_order,
    is_published: form.value.is_published,
  }

  if (!isSupabaseConfigured()) {
    if (modalMode.value === 'add') {
      const newItem: OspekContent = {
        ...payload,
        id: 'mock-ospek-' + Date.now(),
        location: null,
        link_label: null,
        group_identifier: null,
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      items.value.push(newItem)
    } else if (currentId.value) {
      const idx = items.value.findIndex((i) => i.id === currentId.value)
      if (idx !== -1) {
        items.value[idx] = {
          ...items.value[idx],
          ...payload,
          updated_at: new Date().toISOString(),
        }
      }
    }
    isSubmitting.value = false
    closeModal()
    return
  }

  try {
    const client = getSupabase()
    if (modalMode.value === 'add') {
      const { error: insErr } = await client.from('ospek_content').insert([payload])
      if (insErr) throw insErr
    } else if (currentId.value) {
      const { error: updErr } = await client.from('ospek_content').update(payload).eq('id', currentId.value)
      if (updErr) throw updErr
    }
    await fetchItems()
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan konten Ospek.'
  } finally {
    isSubmitting.value = false
  }
}

const togglePublish = async (item: OspekContent) => {
  const nextPublished = !item.is_published

  if (!isSupabaseConfigured()) {
    item.is_published = nextPublished
    return
  }

  try {
    const client = getSupabase()
    const { error: err } = await client
      .from('ospek_content')
      .update({ is_published: nextPublished })
      .eq('id', item.id)

    if (err) throw err
    item.is_published = nextPublished
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal memperbarui status.')
  }
}

const deleteItem = async (item: OspekContent) => {
  if (!confirm(`Hapus entri Ospek "${item.title}"?`)) return

  if (!isSupabaseConfigured()) {
    items.value = items.value.filter((i) => i.id !== item.id)
    return
  }

  try {
    const client = getSupabase()
    const { error: delErr } = await client.from('ospek_content').delete().eq('id', item.id)
    if (delErr) throw delErr
    items.value = items.value.filter((i) => i.id !== item.id)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal menghapus konten.')
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">CMS</span>
        <h1>Manajemen Konten PKKMB / Ospek</h1>
        <p class="muted">Kelola jadwal, pengumuman, buku saku, dan informasi gugus mahasiswa baru.</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        + Tambah Konten Ospek
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="card table-card">
      <div v-if="isLoading" class="loading-state">Memuat materi Ospek...</div>
      <div v-else-if="items.length === 0" class="empty-state">Belum ada konten Ospek yang ditambahkan.</div>
      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Urutan</th>
              <th>Judul Materi</th>
              <th>Tipe Bagian</th>
              <th>Waktu / Jadwal</th>
              <th>Publikasi</th>
              <th>Tautan / Berkas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="small font-mono">{{ item.sort_order }}</td>
              <td>
                <strong>{{ item.title }}</strong>
                <div class="small muted" v-if="item.description">{{ item.description }}</div>
              </td>
              <td><span class="badge badge-accent">{{ item.section_type }}</span></td>
              <td class="small">{{ item.scheduled_at || '—' }}</td>
              <td>
                <button
                  :class="['status-pill', item.is_published ? 'published' : 'draft']"
                  @click="togglePublish(item)"
                >
                  {{ item.is_published ? 'Terbit' : 'Draf' }}
                </button>
              </td>
              <td class="small">
                <a v-if="item.link_url" :href="item.link_url" target="_blank" rel="noopener" class="link-chip">Link</a>
                <a v-if="item.file_url" :href="item.file_url" target="_blank" rel="noopener" class="link-chip">File</a>
                <span v-if="!item.link_url && !item.file_url" class="muted">—</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit" @click="openEditModal(item)">✏️</button>
                  <button class="btn-icon btn-danger" title="Hapus" @click="deleteItem(item)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal card">
        <div class="modal-header">
          <h2>{{ modalMode === 'add' ? 'Tambah Materi Ospek' : 'Edit Materi Ospek' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="field">
              <label>Tipe Bagian *</label>
              <select v-model="form.section_type" required>
                <option value="schedule">Jadwal & Agenda (Schedule)</option>
                <option value="announcement">Pengumuman (Announcement)</option>
                <option value="handbook">Buku Panduan / Saku (Handbook)</option>
                <option value="group_info">Informasi Gugus (Group Info)</option>
                <option value="task_link">Tugas / Penugasan (Task Link)</option>
                <option value="resource_link">Sumber Belajar (Resource Link)</option>
              </select>
            </div>

            <div class="field">
              <label>Urutan Tampil (Sort Order) *</label>
              <input v-model.number="form.sort_order" type="number" required />
            </div>

            <div class="field field-full">
              <label>Judul Materi *</label>
              <input v-model="form.title" type="text" required />
            </div>

            <div class="field field-full">
              <label>Keterangan / Deskripsi</label>
              <textarea v-model="form.description" rows="3"></textarea>
            </div>

            <div class="field">
              <label>Tanggal / Waktu (Opsional)</label>
              <input v-model="form.scheduled_at" type="text" placeholder="Misal: 25 Agustus 2026, 08:00 WIB" />
            </div>

            <div class="field">
              <label>Tautan Link URL (Opsional)</label>
              <input v-model="form.link_url" type="url" placeholder="https://chat.whatsapp.com/..." />
            </div>

            <div class="field field-full">
              <label>Tautan Berkas Unduhan / PDF (Opsional)</label>
              <input v-model="form.file_url" type="url" placeholder="https://.../buku-panduan.pdf" />
            </div>

            <div class="field field-full checkbox-field">
              <label>
                <input v-model="form.is_published" type="checkbox" />
                Terbitkan ke publik
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan…' : 'Simpan Konten' }}
            </button>
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

.status-pill {
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.status-pill.published {
  background: #dcfce7;
  color: #166534;
}

.status-pill.draft {
  background: #f1f5f9;
  color: #64748b;
}

.link-chip {
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  background: var(--brand-accent-soft);
  color: var(--brand-accent);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-icon:hover {
  background: var(--surface-muted);
}

.btn-danger:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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

.checkbox-field label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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
