<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useOspek } from '@/composables/useOspek'
import { useProjects } from '@/composables/useProjects'
import { useSiteSettings } from '@/composables/useSiteSettings'
import type { OspekContent, Project } from '@/types/database'

const { settings, refresh: refreshSettings } = useSiteSettings()
const mode = computed(() => settings.value.spotlight_mode)
const { projects, fetchAll } = useProjects()
const { items: ospekItems, fetchAll: fetchOspek } = useOspek()

const loading = ref(false)
const selectedProject = ref<Project | null>(null)

onMounted(async () => {
  loading.value = true
  await Promise.all([refreshSettings(), fetchAll(), fetchOspek()])
  loading.value = false
})

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateOnly = (iso: string | null): string => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const sectionedOspek = computed(() => {
  const groups: Record<string, OspekContent[]> = {}
  for (const item of ospekItems.value) {
    if (!groups[item.section_type]) groups[item.section_type] = []
    groups[item.section_type]!.push(item)
  }
  return groups
})

const sectionLabels: Record<string, { title: string; icon: string }> = {
  schedule: { title: 'Jadwal', icon: '📅' },
  announcement: { title: 'Pengumuman', icon: '📣' },
  handbook: { title: 'Buku Panduan', icon: '📖' },
  group_info: { title: 'Info Kelompok', icon: '👥' },
  task_link: { title: 'Tugas', icon: '📝' },
  resource_link: { title: 'Sumber Daya', icon: '🔗' },
}

const openProject = (p: Project) => {
  selectedProject.value = p
  document.body.style.overflow = 'hidden'
}
const closeProject = () => {
  selectedProject.value = null
  document.body.style.overflow = ''
}
</script>

<template>
  <section class="hero-band">
    <div class="container">
      <span class="eyebrow">Spotlight</span>
      <h1>
        <template v-if="mode === 'showcase'">Showcase Mahasiswa TI</template>
        <template v-else>Hub Ospek & PKKMB</template>
      </h1>
      <p class="hero-lead">
        <template v-if="mode === 'showcase'">
          Karya, inovasi, dan proyek pilihan mahasiswa Teknik Informatika UNESA.
        </template>
        <template v-else>
          Informasi Ospek / PKKMB: jadwal, panduan, info kelompok, dan sumber daya.
        </template>
      </p>
      <p class="mode-note">
        Mode saat ini:
        <code>{{ mode }}</code> ·
        <span class="muted">diubah dari CMS tanpa rebuild</span>
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <!-- ── SHOWCASE MODE ───────────────────────────────────────────── -->
      <template v-if="mode === 'showcase'">
        <div v-if="loading" class="grid-3">
          <div v-for="i in 6" :key="i" class="card skeleton-card"></div>
        </div>
        <div v-else-if="projects.length === 0" class="empty">
          Belum ada proyek showcase yang dipublikasikan.
        </div>
        <div v-else class="grid-3">
          <article
            v-for="p in projects"
            :key="p.id"
            class="card card-hover project-card"
          >
            <img
              v-if="p.thumbnail_url"
              :src="p.thumbnail_url"
              :alt="p.title"
              class="thumb"
            />
            <div v-else class="thumb placeholder">No Preview</div>
            <h3>{{ p.title }}</h3>
            <p class="muted small">
              {{ p.category }} · {{ p.tags.join(' · ') }}
            </p>
            <p class="desc">{{ p.description }}</p>
            <div class="actions">
              <button class="btn btn-outline" @click="openProject(p)">Detail</button>
              <a v-if="p.repo_url" :href="p.repo_url" target="_blank" rel="noopener" class="btn btn-ghost">
                Repo ↗
              </a>
            </div>
          </article>
        </div>
      </template>

      <!-- ── OSPEK MODE ──────────────────────────────────────────────── -->
      <template v-else>
        <div v-if="loading" class="loading-state">Memuat konten…</div>
        <div v-else-if="ospekItems.length === 0" class="empty">
          Belum ada konten Ospek yang dipublikasikan.
        </div>
        <div v-else class="ospek-sections">
          <section
            v-for="(group, type) in sectionedOspek"
            :key="type"
            class="ospek-section"
          >
            <h2 class="section-title">
              <span class="section-icon">{{ sectionLabels[type]?.icon ?? '•' }}</span>
              {{ sectionLabels[type]?.title ?? type }}
            </h2>
            <div class="ospek-grid">
              <article
                v-for="item in group"
                :key="item.id"
                class="card card-hover ospek-card"
              >
                <h3>{{ item.title }}</h3>
                <p v-if="item.scheduled_at" class="muted small">
                  🕒 {{ formatDate(item.scheduled_at) }}
                </p>
                <p v-if="item.location" class="muted small">📍 {{ item.location }}</p>
                <p v-if="item.description" class="desc">{{ item.description }}</p>
                <a
                  v-if="item.link_url"
                  :href="item.link_url"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-outline"
                >
                  {{ item.link_label ?? 'Lihat' }} ↗
                </a>
                <a
                  v-else-if="item.file_url"
                  :href="item.file_url"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-outline"
                >
                  Unduh Berkas
                </a>
              </article>
            </div>
          </section>
        </div>
      </template>
    </div>
  </section>

  <!-- Project detail modal -->
  <div v-if="selectedProject" class="modal-backdrop" @click="closeProject">
    <div class="modal-card" @click.stop>
      <button class="modal-close" aria-label="Tutup" @click="closeProject">×</button>
      <img
        v-if="selectedProject.thumbnail_url"
        :src="selectedProject.thumbnail_url"
        :alt="selectedProject.title"
        class="modal-thumb"
      />
      <h2>{{ selectedProject.title }}</h2>
      <p class="muted">
        {{ selectedProject.category }} ·
        {{ selectedProject.tags.join(' · ') }}
      </p>
      <p class="prose">{{ selectedProject.description }}</p>

      <div v-if="selectedProject.contributors.length" class="contributors">
        <h4>Kontributor</h4>
        <ul>
          <li v-for="(c, i) in selectedProject.contributors" :key="i">
            <strong>{{ c.name }}</strong>
            <span class="muted" v-if="c.role"> · {{ c.role }}</span>
          </li>
        </ul>
      </div>

      <div v-if="selectedProject.achievements" class="achievement">
        🏆 {{ selectedProject.achievements }}
      </div>

      <div class="modal-actions">
        <a v-if="selectedProject.demo_url" :href="selectedProject.demo_url" target="_blank" rel="noopener" class="btn btn-primary">
          Live Demo
        </a>
        <a v-if="selectedProject.repo_url" :href="selectedProject.repo_url" target="_blank" rel="noopener" class="btn btn-outline">
          Repository
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-band {
  position: relative;
  padding: 6rem 0 4rem;
  background:
    radial-gradient(circle at 80% 20%, rgba(59, 108, 244, 0.12), transparent 50%),
    radial-gradient(circle at 10% 80%, rgba(255, 122, 89, 0.08), transparent 50%),
    linear-gradient(180deg, #ffffff 0%, var(--surface-page) 100%);
  border-bottom: 1px solid var(--border-subtle);
  overflow: hidden;
}
.hero-band::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.025) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 70% 80% at 50% 50%, #000 30%, transparent 90%);
  pointer-events: none;
}
.hero-band h1 {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0.5rem 0 1rem;
  letter-spacing: -0.03em;
  color: var(--brand-primary);
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}
.hero-lead {
  max-width: 640px;
  color: var(--text-secondary);
  font-size: 1.075rem;
  line-height: 1.65;
  position: relative;
}
.mode-note {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.mode-note code {
  background: var(--surface-muted);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  color: var(--brand-accent);
}

.section {
  padding: 4rem 0 5rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.thumb {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius-md);
}
.thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-muted);
  color: var(--text-muted);
}
.project-card h3 {
  margin: 0;
  font-size: 1.1rem;
}
.small {
  font-size: 0.85rem;
}
.desc {
  color: var(--text-secondary);
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.ospek-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  color: var(--brand-primary);
}
.section-icon {
  font-size: 1.5rem;
}
.ospek-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.ospek-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ospek-card h3 {
  margin: 0;
  font-size: 1.05rem;
}

.empty,
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  background: var(--surface-card);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
}

.skeleton-card {
  height: 280px;
  background: linear-gradient(
    90deg,
    var(--surface-muted) 0%,
    var(--border-subtle) 50%,
    var(--surface-muted) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Modal ──────────────────────────────────────────────────────────── */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1.5rem;
  animation: fade-in 0.2s ease;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
}
.modal-card {
  background: var(--surface-card);
  border-radius: var(--radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  box-shadow: var(--shadow-lg);
}
.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-muted);
}
.modal-close:hover {
  color: var(--text-primary);
}
.modal-thumb {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  margin-bottom: 1rem;
}
.modal-card h2 {
  margin: 0 0 0.5rem;
  color: var(--brand-primary);
}
.prose {
  color: var(--text-primary);
  line-height: 1.65;
  margin: 1rem 0;
}
.contributors h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 1rem 0 0.5rem;
}
.contributors ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.achievement {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: var(--radius-md);
  font-weight: 500;
}
.modal-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

@media (max-width: 860px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
