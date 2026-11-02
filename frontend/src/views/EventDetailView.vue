<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useEvents } from '@/composables/useEvents'
import { eventStatusLabel } from '@/config/site'

const route = useRoute()
const { currentEvent, fetchBySlug, loading } = useEvents()

const slug = computed(() => String(route.params.id ?? ''))
const error = ref<string | null>(null)

const fetchCurrent = async () => {
  error.value = null
  const ev = await fetchBySlug(slug.value)
  if (!ev) error.value = 'Kegiatan tidak ditemukan.'
}

onMounted(fetchCurrent)
watch(slug, fetchCurrent)

const formatDateTime = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Convert raw markdown-ish content (\n\n) into paragraphs. Cheap, no deps.
const descriptionParagraphs = computed<string[]>(() => {
  const raw = currentEvent.value?.description ?? ''
  return raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
})
</script>

<template>
  <div class="container event-detail">
    <div v-if="loading" class="state">Memuat kegiatan…</div>
    <div v-else-if="error || !currentEvent" class="state error">
      {{ error ?? 'Kegiatan tidak ditemukan.' }}
      <RouterLink to="/events" class="btn btn-outline back-btn">
        ← Kembali ke daftar kegiatan
      </RouterLink>
    </div>

    <template v-else>
      <RouterLink to="/events" class="back-link">← Kembali</RouterLink>

      <header class="detail-head">
        <span :class="['badge', `badge-${currentEvent.status}`]">
          {{ eventStatusLabel[currentEvent.status] ?? currentEvent.status }}
        </span>
        <h1>{{ currentEvent.title }}</h1>
        <div class="meta-row">
          <div><strong>📅 Mulai</strong> {{ formatDateTime(currentEvent.start_date) }}</div>
          <div v-if="currentEvent.end_date">
            <strong>🏁 Selesai</strong> {{ formatDateTime(currentEvent.end_date) }}
          </div>
          <div><strong>📍 Lokasi</strong> {{ currentEvent.location ?? '—' }}</div>
          <div v-if="currentEvent.contact_person">
            <strong>📞 CP</strong> {{ currentEvent.contact_person }}
          </div>
        </div>
        <p class="summary">{{ currentEvent.summary }}</p>
        <div class="cta-row">
          <a
            v-if="currentEvent.registration_url"
            :href="currentEvent.registration_url"
            target="_blank"
            rel="noopener"
            class="btn btn-accent"
          >
            Daftar Sekarang
          </a>
        </div>
      </header>

      <section v-if="descriptionParagraphs.length" class="content-block">
        <h2>Deskripsi</h2>
        <div class="prose">
          <p v-for="(p, i) in descriptionParagraphs" :key="i">{{ p }}</p>
        </div>
      </section>

      <section v-if="currentEvent.documentation_images.length" class="content-block">
        <h2>Dokumentasi</h2>
        <div class="gallery">
          <img
            v-for="(src, i) in currentEvent.documentation_images"
            :key="i"
            :src="src"
            :alt="`Dokumentasi ${i + 1}`"
          />
        </div>
      </section>

      <section v-if="currentEvent.outcome_notes" class="content-block">
        <h2>Hasil & Dampak</h2>
        <p class="prose">{{ currentEvent.outcome_notes }}</p>
      </section>

      <section v-if="currentEvent.press_release" class="content-block">
        <h2>Press Release</h2>
        <div class="prose">
          <p v-for="(p, i) in currentEvent.press_release.split(/\n{2,}/)" :key="i">{{ p }}</p>
        </div>
      </section>

      <section v-if="currentEvent.public_documents.length" class="content-block">
        <h2>Berkas Publik</h2>
        <ul class="docs-list">
          <li v-for="(d, i) in currentEvent.public_documents" :key="i">
            <a :href="d.url" target="_blank" rel="noopener">{{ d.label }}</a>
          </li>
        </ul>
      </section>

      <footer class="content-block meta-footer muted">
        Diperbarui {{ formatDate(currentEvent.updated_at) }}
      </footer>
    </template>
  </div>
</template>

<style scoped>
.event-detail {
  padding: 2.5rem 1.25rem 5rem;
  max-width: 900px;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--text-muted);
  font-weight: 500;
}
.back-link:hover {
  color: var(--brand-accent);
}

.state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}
.state.error {
  color: var(--status-error);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.back-btn {
  margin-top: 1rem;
}

.detail-head {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}
.detail-head .badge {
  margin-bottom: 1rem;
}
.detail-head h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
  color: var(--brand-primary);
}
.meta-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin: 1rem 0;
  font-size: 0.92rem;
  color: var(--text-secondary);
}
.meta-row strong {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}
.summary {
  font-size: 1.05rem;
  color: var(--text-primary);
  margin: 1rem 0 1.5rem;
}
.cta-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.content-block {
  margin-bottom: 2.5rem;
}
.content-block h2 {
  font-size: 1.3rem;
  margin: 0 0 1rem;
  color: var(--brand-primary);
}
.prose p {
  margin: 0 0 0.85rem;
  line-height: 1.7;
  color: var(--text-primary);
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
.gallery img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.docs-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.docs-list li a {
  display: block;
  padding: 0.75rem 1rem;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-weight: 500;
}
.docs-list li a:hover {
  border-color: var(--brand-accent);
}

.meta-footer {
  text-align: center;
  font-size: 0.85rem;
}
</style>
