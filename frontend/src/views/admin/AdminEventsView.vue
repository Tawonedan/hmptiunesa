<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { seedEvents } from '@/mock/seed'
import type { Event, EventStatus } from '@/types/database'

const events = ref<Event[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref<string | null>(null)
const isSubmitting = ref(false)

const form = ref<{
  title: string
  slug: string
  category: string
  status: EventStatus
  start_date: string
  end_date: string
  location: string
  summary: string
  description: string
  poster_url: string
  registration_url: string
  contact_person: string
  is_published: boolean
}>({
  title: '',
  slug: '',
  category: 'general',
  status: 'upcoming',
  start_date: '',
  end_date: '',
  location: '',
  summary: '',
  description: '',
  poster_url: '',
  registration_url: '',
  contact_person: '',
  is_published: true,
})

const fetchEvents = async () => {
  isLoading.value = true
  error.value = null

  if (!isSupabaseConfigured()) {
    events.value = [...seedEvents]
    isLoading.value = false
    return
  }

  try {
    const client = getSupabase()
    const { data, error: fetchErr } = await client
      .from('events')
      .select('*')
      .order('start_date', { ascending: false })

    if (fetchErr) {
      error.value = fetchErr.message
    } else {
      events.value = (data as Event[]) || []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat kegiatan.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEvents()
})

const openAddModal = () => {
  modalMode.value = 'add'
  currentId.value = null
  form.value = {
    title: '',
    slug: '',
    category: 'workshop',
    status: 'upcoming',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    location: '',
    summary: '',
    description: '',
    poster_url: '',
    registration_url: '',
    contact_person: '',
    is_published: true,
  }
  isModalOpen.value = true
}

const openEditModal = (ev: Event) => {
  modalMode.value = 'edit'
  currentId.value = ev.id
  form.value = {
    title: ev.title,
    slug: ev.slug,
    category: ev.category,
    status: ev.status,
    start_date: ev.start_date ? ev.start_date.slice(0, 10) : '',
    end_date: ev.end_date ? ev.end_date.slice(0, 10) : '',
    location: ev.location || '',
    summary: ev.summary || '',
    description: ev.description || '',
    poster_url: ev.poster_url || '',
    registration_url: ev.registration_url || '',
    contact_person: ev.contact_person || '',
    is_published: ev.is_published,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const generateSlug = () => {
  if (modalMode.value === 'add' && !form.value.slug && form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  error.value = null

  const payload = {
    title: form.value.title,
    slug: form.value.slug || form.value.title.toLowerCase().replace(/\s+/g, '-'),
    category: form.value.category,
    status: form.value.status,
    start_date: form.value.start_date || null,
    end_date: form.value.end_date || null,
    location: form.value.location || null,
    summary: form.value.summary,
    description: form.value.description || null,
    poster_url: form.value.poster_url || null,
    registration_url: form.value.registration_url || null,
    contact_person: form.value.contact_person || null,
    is_published: form.value.is_published,
  }

  if (!isSupabaseConfigured()) {
    if (modalMode.value === 'add') {
      const newEv: Event = {
        ...payload,
        id: 'mock-' + Date.now(),
        outcome_notes: null,
        press_release: null,
        documentation_images: [],
        public_documents: [],
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      events.value.unshift(newEv)
    } else if (currentId.value) {
      const idx = events.value.findIndex((e) => e.id === currentId.value)
      if (idx !== -1) {
        events.value[idx] = {
          ...events.value[idx],
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
      const { error: insErr } = await client.from('events').insert([payload])
      if (insErr) throw insErr
    } else if (currentId.value) {
      const { error: updErr } = await client.from('events').update(payload).eq('id', currentId.value)
      if (updErr) throw updErr
    }
    await fetchEvents()
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan kegiatan.'
  } finally {
    isSubmitting.value = false
  }
}

const togglePublish = async (ev: Event) => {
  const nextPublished = !ev.is_published

  if (!isSupabaseConfigured()) {
    ev.is_published = nextPublished
    return
  }

  try {
    const client = getSupabase()
    const { error: err } = await client
      .from('events')
      .update({ is_published: nextPublished })
      .eq('id', ev.id)

    if (err) throw err
    ev.is_published = nextPublished
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal mengubah status terbit.')
  }
}

const deleteEvent = async (ev: Event) => {
  if (!confirm(`Hapus kegiatan "${ev.title}"?`)) return

  if (!isSupabaseConfigured()) {
    events.value = events.value.filter((e) => e.id !== ev.id)
    return
  }

  try {
    const client = getSupabase()
    const { error: delErr } = await client.from('events').delete().eq('id', ev.id)
    if (delErr) throw delErr
    events.value = events.value.filter((e) => e.id !== ev.id)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal menghapus kegiatan.')
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">CMS</span>
        <h1>Manajemen Kegiatan & Acara</h1>
        <p class="muted">Kelola kegiatan mendatang, berlangsung, serta arsip dokumentasi publik.</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        + Tambah Kegiatan
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="card table-card">
      <div v-if="isLoading" class="loading-state">Memuat kegiatan...</div>
      <div v-else-if="events.length === 0" class="empty-state">Belum ada kegiatan yang terdaftar.</div>
      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Judul Kegiatan</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Lokasi</th>
              <th>Publikasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in events" :key="ev.id">
              <td>
                <strong>{{ ev.title }}</strong>
                <div class="small muted">{{ ev.slug }}</div>
              </td>
              <td><span class="badge badge-accent">{{ ev.category }}</span></td>
              <td><span :class="['badge', `badge-${ev.status}`]">{{ ev.status }}</span></td>
              <td class="small">{{ ev.start_date ? ev.start_date.slice(0, 10) : '—' }}</td>
              <td class="small">{{ ev.location || '—' }}</td>
              <td>
                <button
                  :class="['status-pill', ev.is_published ? 'published' : 'draft']"
                  @click="togglePublish(ev)"
                >
                  {{ ev.is_published ? 'Terbit' : 'Draf' }}
                </button>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit" @click="openEditModal(ev)">✏️</button>
                  <button class="btn-icon btn-danger" title="Hapus" @click="deleteEvent(ev)">🗑️</button>
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
          <h2>{{ modalMode === 'add' ? 'Tambah Kegiatan Baru' : 'Edit Kegiatan' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="field field-full">
              <label>Judul Kegiatan *</label>
              <input v-model="form.title" type="text" required @blur="generateSlug" />
            </div>

            <div class="field">
              <label>Slug URL *</label>
              <input v-model="form.slug" type="text" required />
            </div>

            <div class="field">
              <label>Kategori</label>
              <select v-model="form.category">
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="competition">Kompetisi</option>
                <option value="social">Sosial / Pengabdian</option>
                <option value="general">Umum</option>
              </select>
            </div>

            <div class="field">
              <label>Status</label>
              <select v-model="form.status">
                <option value="upcoming">Mendatang (Upcoming)</option>
                <option value="ongoing">Sedang Berlangsung (Ongoing)</option>
                <option value="completed">Selesai / Arsip (Completed)</option>
                <option value="cancelled">Dibatalkan (Cancelled)</option>
              </select>
            </div>

            <div class="field">
              <label>Tanggal Mulai</label>
              <input v-model="form.start_date" type="date" />
            </div>

            <div class="field">
              <label>Tanggal Selesai</label>
              <input v-model="form.end_date" type="date" />
            </div>

            <div class="field field-full">
              <label>Lokasi Pelaksanaan</label>
              <input v-model="form.location" type="text" placeholder="Misal: Gedung A9 / Zoom Meeting" />
            </div>

            <div class="field field-full">
              <label>Ringkasan Singkat *</label>
              <textarea v-model="form.summary" rows="2" required></textarea>
            </div>

            <div class="field field-full">
              <label>Deskripsi Lengkap</label>
              <textarea v-model="form.description" rows="4"></textarea>
            </div>

            <div class="field">
              <label>URL Poster Kegiatan</label>
              <input v-model="form.poster_url" type="url" placeholder="https://..." />
            </div>

            <div class="field">
              <label>URL Pendaftaran</label>
              <input v-model="form.registration_url" type="url" placeholder="https://forms.gle/..." />
            </div>

            <div class="field field-full">
              <label>Kontak Penanggung Jawab</label>
              <input v-model="form.contact_person" type="text" placeholder="08123456789 (Humas)" />
            </div>

            <div class="field field-full checkbox-field">
              <label>
                <input v-model="form.is_published" type="checkbox" />
                Langsung terbitkan di portal publik
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan…' : 'Simpan Kegiatan' }}
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

/* Modal */
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
  max-width: 680px;
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
