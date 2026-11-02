<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { seedProjects } from '@/mock/seed'
import type { Project } from '@/types/database'

const projects = ref<Project[]>([])
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
  tagsString: string
  description: string
  thumbnail_url: string
  demo_url: string
  repo_url: string
  achievements: string
  is_featured: boolean
  is_published: boolean
}>({
  title: '',
  slug: '',
  category: 'web',
  tagsString: 'Vue, TypeScript',
  description: '',
  thumbnail_url: '',
  demo_url: '',
  repo_url: '',
  achievements: '',
  is_featured: false,
  is_published: true,
})

const fetchProjects = async () => {
  isLoading.value = true
  error.value = null

  if (!isSupabaseConfigured()) {
    projects.value = [...seedProjects]
    isLoading.value = false
    return
  }

  try {
    const client = getSupabase()
    const { data, error: fetchErr } = await client
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchErr) {
      error.value = fetchErr.message
    } else {
      projects.value = (data as Project[]) || []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal memuat proyek showcase.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})

const openAddModal = () => {
  modalMode.value = 'add'
  currentId.value = null
  form.value = {
    title: '',
    slug: '',
    category: 'web',
    tagsString: 'Vue.js, TypeScript',
    description: '',
    thumbnail_url: '',
    demo_url: '',
    repo_url: '',
    achievements: '',
    is_featured: false,
    is_published: true,
  }
  isModalOpen.value = true
}

const openEditModal = (p: Project) => {
  modalMode.value = 'edit'
  currentId.value = p.id
  form.value = {
    title: p.title,
    slug: p.slug,
    category: p.category,
    tagsString: (p.tags || []).join(', '),
    description: p.description,
    thumbnail_url: p.thumbnail_url || '',
    demo_url: p.demo_url || '',
    repo_url: p.repo_url || '',
    achievements: p.achievements || '',
    is_featured: p.is_featured,
    is_published: p.is_published,
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

  const tagsArray = form.value.tagsString
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  const payload = {
    title: form.value.title,
    slug: form.value.slug || form.value.title.toLowerCase().replace(/\s+/g, '-'),
    category: form.value.category,
    tags: tagsArray,
    description: form.value.description,
    thumbnail_url: form.value.thumbnail_url || null,
    demo_url: form.value.demo_url || null,
    repo_url: form.value.repo_url || null,
    achievements: form.value.achievements || null,
    is_featured: form.value.is_featured,
    is_published: form.value.is_published,
  }

  if (!isSupabaseConfigured()) {
    if (modalMode.value === 'add') {
      const newProj: Project = {
        ...payload,
        id: 'mock-' + Date.now(),
        screenshots: [],
        contributors: [],
        other_links: [],
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      projects.value.unshift(newProj)
    } else if (currentId.value) {
      const idx = projects.value.findIndex((p) => p.id === currentId.value)
      if (idx !== -1) {
        projects.value[idx] = {
          ...projects.value[idx],
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
      const { error: insErr } = await client.from('projects').insert([payload])
      if (insErr) throw insErr
    } else if (currentId.value) {
      const { error: updErr } = await client.from('projects').update(payload).eq('id', currentId.value)
      if (updErr) throw updErr
    }
    await fetchProjects()
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menyimpan proyek.'
  } finally {
    isSubmitting.value = false
  }
}

const toggleFeatured = async (p: Project) => {
  const nextFeatured = !p.is_featured

  if (!isSupabaseConfigured()) {
    p.is_featured = nextFeatured
    return
  }

  try {
    const client = getSupabase()
    const { error: err } = await client
      .from('projects')
      .update({ is_featured: nextFeatured })
      .eq('id', p.id)

    if (err) throw err
    p.is_featured = nextFeatured
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal mengubah status unggulan.')
  }
}

const togglePublish = async (p: Project) => {
  const nextPublished = !p.is_published

  if (!isSupabaseConfigured()) {
    p.is_published = nextPublished
    return
  }

  try {
    const client = getSupabase()
    const { error: err } = await client
      .from('projects')
      .update({ is_published: nextPublished })
      .eq('id', p.id)

    if (err) throw err
    p.is_published = nextPublished
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal mengubah status terbit.')
  }
}

const deleteProject = async (p: Project) => {
  if (!confirm(`Hapus proyek "${p.title}"?`)) return

  if (!isSupabaseConfigured()) {
    projects.value = projects.value.filter((item) => item.id !== p.id)
    return
  }

  try {
    const client = getSupabase()
    const { error: delErr } = await client.from('projects').delete().eq('id', p.id)
    if (delErr) throw delErr
    projects.value = projects.value.filter((item) => item.id !== p.id)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Gagal menghapus proyek.')
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">CMS</span>
        <h1>Manajemen Showcase Proyek</h1>
        <p class="muted">Kurasi karya dan inovasi mahasiswa untuk mode Spotlight.</p>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        + Tambah Proyek
      </button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="card table-card">
      <div v-if="isLoading" class="loading-state">Memuat karya proyek...</div>
      <div v-else-if="projects.length === 0" class="empty-state">Belum ada karya showcase terdaftar.</div>
      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Judul Proyek</th>
              <th>Kategori & Tags</th>
              <th>Unggulan</th>
              <th>Publikasi</th>
              <th>Demo / Repo</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in projects" :key="p.id">
              <td>
                <strong>{{ p.title }}</strong>
                <div class="small muted">{{ p.slug }}</div>
              </td>
              <td>
                <span class="badge badge-accent">{{ p.category }}</span>
                <div class="tags-row" v-if="p.tags && p.tags.length">
                  <span v-for="t in p.tags" :key="t" class="small-tag">{{ t }}</span>
                </div>
              </td>
              <td>
                <button
                  :class="['star-btn', p.is_featured ? 'starred' : '']"
                  :title="p.is_featured ? 'Unggulan (tampil di Beranda)' : 'Jadikan Unggulan'"
                  @click="toggleFeatured(p)"
                >
                  {{ p.is_featured ? '⭐ Unggulan' : '☆ Normal' }}
                </button>
              </td>
              <td>
                <button
                  :class="['status-pill', p.is_published ? 'published' : 'draft']"
                  @click="togglePublish(p)"
                >
                  {{ p.is_published ? 'Terbit' : 'Draf' }}
                </button>
              </td>
              <td class="links-cell">
                <a v-if="p.demo_url" :href="p.demo_url" target="_blank" rel="noopener" class="link-chip">Demo</a>
                <a v-if="p.repo_url" :href="p.repo_url" target="_blank" rel="noopener" class="link-chip">Repo</a>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit" @click="openEditModal(p)">✏️</button>
                  <button class="btn-icon btn-danger" title="Hapus" @click="deleteProject(p)">🗑️</button>
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
          <h2>{{ modalMode === 'add' ? 'Tambah Proyek Mahasiswa' : 'Edit Proyek' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="field field-full">
              <label>Judul Proyek / Aplikasi *</label>
              <input v-model="form.title" type="text" required @blur="generateSlug" />
            </div>

            <div class="field">
              <label>Slug URL *</label>
              <input v-model="form.slug" type="text" required />
            </div>

            <div class="field">
              <label>Kategori</label>
              <select v-model="form.category">
                <option value="web">Web Application</option>
                <option value="mobile">Mobile Application</option>
                <option value="ai">AI / Data Science</option>
                <option value="iot">IoT & Hardware</option>
                <option value="game">Game Development</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div class="field field-full">
              <label>Tech Stack / Tags (pisahkan koma)</label>
              <input v-model="form.tagsString" type="text" placeholder="Vue.js, Supabase, Tailwind, Python" />
            </div>

            <div class="field field-full">
              <label>Deskripsi Proyek *</label>
              <textarea v-model="form.description" rows="3" required></textarea>
            </div>

            <div class="field">
              <label>URL Demo / Live</label>
              <input v-model="form.demo_url" type="url" placeholder="https://..." />
            </div>

            <div class="field">
              <label>URL Repository (GitHub/GitLab)</label>
              <input v-model="form.repo_url" type="url" placeholder="https://github.com/..." />
            </div>

            <div class="field field-full">
              <label>URL Thumbnail Gambar</label>
              <input v-model="form.thumbnail_url" type="url" placeholder="https://..." />
            </div>

            <div class="field field-full">
              <label>Prestasi / Penghargaan (Opsional)</label>
              <input v-model="form.achievements" type="text" placeholder="Juara 1 Gemastik 2025" />
            </div>

            <div class="field checkbox-field">
              <label>
                <input v-model="form.is_featured" type="checkbox" />
                Jadikan Proyek Unggulan (Tampil di Beranda)
              </label>
            </div>

            <div class="field checkbox-field">
              <label>
                <input v-model="form.is_published" type="checkbox" />
                Terbitkan ke publik
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan…' : 'Simpan Proyek' }}
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

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.small-tag {
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 0.7rem;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm);
}

.star-btn {
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-muted);
}

.star-btn.starred {
  background: #fef9c3;
  color: #854d0e;
  border-color: #fde047;
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

.links-cell {
  display: flex;
  gap: 0.35rem;
}

.link-chip {
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  background: var(--brand-accent-soft);
  color: var(--brand-accent);
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
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
