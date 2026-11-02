<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { News } from '@/types/database'

const articles = ref<News[]>([])
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
  excerpt: string
  content: string
  cover_image_url: string
  is_published: boolean
}>({
  title: '',
  slug: '',
  category: 'announcement',
  excerpt: '',
  content: '',
  cover_image_url: '',
  is_published: true,
})

const fetchNews = async () => {
  isLoading.value = true
  error.value = null

  if (!isSupabaseConfigured()) {
    articles.value = [
      {
        id: 'news-mock-1',
        title: 'Pembukaan Pendaftaran Staff Muda HMPTI 2026',
        slug: 'pembukaan-pendaftaran-staff-muda-2026',
        category: 'announcement',
        excerpt: 'HMPTI UNESA membuka kesempatan bagi mahasiswa aktif TI untuk bergabung.',
        content: 'Informasi lengkap pendaftaran dan alur seleksi staff muda kabinet terkini.',
        cover_image_url: null,
        event_id: null,
        is_published: true,
        published_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
    isLoading.value = false
    return
  }

  try {
    const client = getSupabase()
    const { data, error: fetchErr } = await client
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchErr) {
      error.value = fetchErr.message
    } else {
      articles.value = (data as News[]) || []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat berita.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchNews()
})

const openAddModal = () => {
  modalMode.value = 'add'
  currentId.value = null
  form.value = {
    title: '',
    slug: '',
    category: 'announcement',
    excerpt: '',
    content: '',
    cover_image_url: '',
    is_published: true,
  }
  isModalOpen.value = true
}

const openEditModal = (item: News) => {
  modalMode.value = 'edit'
  currentId.value = item.id
  form.value = {
    title: item.title,
    slug: item.slug,
    category: item.category,
    excerpt: item.excerpt || '',
    content: item.content || '',
    cover_image_url: item.cover_image_url || '',
    is_published: item.is_published,
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
    excerpt: form.value.excerpt || null,
    content: form.value.content || null,
    cover_image_url: form.value.cover_image_url || null,
    is_published: form.value.is_published,
    published_at: form.value.is_published ? new Date().toISOString() : null,
  }

  if (!isSupabaseConfigured()) {
    if (modalMode.value === 'add') {
      const newArticle: News = {
        ...payload,
        id: 'mock-' + Date.now(),
        event_id: null,
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      articles.value.unshift(newArticle)
    } else if (currentId.value) {
      const idx = articles.value.findIndex((a) => a.id === currentId.value)
      if (idx !== -1) {
        articles.value[idx] = {
          ...articles.value[idx],
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
      const { error: insErr } = await client.from('news').insert([payload])
      if (insErr) throw insErr
    } else if (currentId.value) {
      const { error: updErr } = await client.from('news').update(payload).eq('id', currentId.value)
      if (updErr) throw updErr
    }
    await fetchNews()
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan berita.'
  } finally {
    isSubmitting.value = false
  }
}

const togglePublish = async (item: News) => {
  const nextPublished = !item.is_published

  if (!isSupabaseConfigured()) {
    item.is_published = nextPublished
    return
  }

  try {
    const client = getSupabase()
    const { error: err } = await client
      .from('news')
      .update({
        is_published: nextPublished,
        published_at: nextPublished ? new Date().toISOString() : item.published_at,
      })
      .eq('id', item.id)

    if (err) throw err
    item.is_published = nextPublished
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal mengubah status publikasi.')
  }
}

const deleteNews = async (item: News) => {
  if (!confirm(`Hapus berita "${item.title}"?`)) return

  if (!isSupabaseConfigured()) {
    articles.value = articles.value.filter((a) => a.id !== item.id)
    return
  }

  try {
    const client = getSupabase()
    const { error: delErr } = await client.from('news').delete().eq('id', item.id)
    if (delErr) throw delErr
    articles.value = articles.value.filter((a) => a.id !== item.id)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal menghapus berita.')
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">CMS</span>
        <h1>Manajemen Berita & Pengumuman</h1>
        <p class="muted">Publikasikan rilis resmi dan kabar terbaru HMPTI UNESA.</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        + Buat Berita
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="card table-card">
      <div v-if="isLoading" class="loading-state">Memuat rilis berita...</div>
      <div v-else-if="articles.length === 0" class="empty-state">Belum ada rilis berita yang dibuat.</div>
      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Judul Berita</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Tanggal Rilis</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in articles" :key="item.id">
              <td>
                <strong>{{ item.title }}</strong>
                <div class="small muted">{{ item.slug }}</div>
              </td>
              <td><span class="badge badge-accent">{{ item.category }}</span></td>
              <td>
                <button
                  :class="['status-pill', item.is_published ? 'published' : 'draft']"
                  @click="togglePublish(item)"
                >
                  {{ item.is_published ? 'Terbit' : 'Draf' }}
                </button>
              </td>
              <td class="small">{{ item.published_at ? item.published_at.slice(0, 10) : '—' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit" @click="openEditModal(item)">✏️</button>
                  <button class="btn-icon btn-danger" title="Hapus" @click="deleteNews(item)">🗑️</button>
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
          <h2>{{ modalMode === 'add' ? 'Tulis Berita Baru' : 'Edit Berita' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="field field-full">
              <label>Judul Berita *</label>
              <input v-model="form.title" type="text" required @blur="generateSlug" />
            </div>

            <div class="field">
              <label>Slug URL *</label>
              <input v-model="form.slug" type="text" required />
            </div>

            <div class="field">
              <label>Kategori</label>
              <select v-model="form.category">
                <option value="announcement">Pengumuman (Announcement)</option>
                <option value="press_release">Siaran Pers (Press Release)</option>
                <option value="achievement">Prestasi (Achievement)</option>
                <option value="general">Kabar Umum (General)</option>
              </select>
            </div>

            <div class="field field-full">
              <label>URL Gambar Sampul</label>
              <input v-model="form.cover_image_url" type="url" placeholder="https://..." />
            </div>

            <div class="field field-full">
              <label>Kutipan Singkat (Excerpt)</label>
              <textarea v-model="form.excerpt" rows="2"></textarea>
            </div>

            <div class="field field-full">
              <label>Isi Berita Lengkap *</label>
              <textarea v-model="form.content" rows="6" required></textarea>
            </div>

            <div class="field field-full checkbox-field">
              <label>
                <input v-model="form.is_published" type="checkbox" />
                Terbitkan langsung ke publik
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan…' : 'Simpan Berita' }}
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
