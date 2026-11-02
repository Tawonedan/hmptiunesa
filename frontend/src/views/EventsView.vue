<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useEvents } from '@/composables/useEvents'
import { eventStatusLabel } from '@/config/site'

type TabKey = 'upcoming' | 'archive'

const { upcomingEvents, archivedEvents, fetchUpcoming, fetchArchive, loading } = useEvents()

const activeTab = ref<TabKey>('upcoming')

onMounted(async () => {
  await Promise.all([fetchUpcoming(), fetchArchive()])
})

const visibleEvents = computed(() =>
  activeTab.value === 'upcoming' ? upcomingEvents.value : archivedEvents.value,
)

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <section class="hero-band">
    <div class="container">
      <span class="eyebrow">Kegiatan & Dokumentasi</span>
      <h1>Aktivitas HMPTI</h1>
      <p class="hero-lead">
        Jelajahi kegiatan mendatang dan arsip dokumentasi program kerja kami.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="tabs" role="tablist">
        <button
          :class="['tab', { 'is-active': activeTab === 'upcoming' }]"
          role="tab"
          @click="activeTab = 'upcoming'"
        >
          Mendatang & Berlangsung
          <span class="tab-count">{{ upcomingEvents.length }}</span>
        </button>
        <button
          :class="['tab', { 'is-active': activeTab === 'archive' }]"
          role="tab"
          @click="activeTab = 'archive'"
        >
          Arsip & Dokumentasi
          <span class="tab-count">{{ archivedEvents.length }}</span>
        </button>
      </div>

      <div v-if="loading" class="grid-3">
        <div v-for="i in 6" :key="i" class="card skeleton-card"></div>
      </div>
      <div v-else-if="visibleEvents.length === 0" class="empty">
        {{
          activeTab === 'upcoming'
            ? 'Belum ada kegiatan yang akan datang.'
            : 'Belum ada arsip dokumentasi kegiatan.'
        }}
      </div>
      <div v-else class="grid-3">
        <article
          v-for="ev in visibleEvents"
          :key="ev.id"
          class="card card-hover event-card"
        >
          <div class="event-poster" :class="`poster-${ev.category}`">
            <span :class="['badge', `badge-${ev.status}`]">
              {{ eventStatusLabel[ev.status] ?? ev.status }}
            </span>
          </div>
          <h3>{{ ev.title }}</h3>
          <p class="muted small">
            📅 {{ formatDate(ev.start_date) }} · 📍 {{ ev.location ?? '—' }}
          </p>
          <p class="event-summary">{{ ev.summary }}</p>
          <div class="event-foot">
            <RouterLink :to="`/events/${ev.slug}`" class="btn btn-outline">
              Lihat Detail
            </RouterLink>
            <a
              v-if="ev.registration_url"
              :href="ev.registration_url"
              target="_blank"
              rel="noopener"
              class="btn btn-accent"
            >
              Daftar
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
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

.section {
  padding: 3rem 0 5rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 2rem;
}
.tab {
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.tab.is-active {
  color: var(--brand-primary);
}
.tab.is-active::after {
  content: '';
  position: absolute;
  left: 1.25rem;
  right: 1.25rem;
  bottom: -1px;
  height: 2px;
  background: var(--brand-accent);
}
.tab-count {
  background: var(--surface-muted);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.event-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.event-poster {
  position: relative;
  height: 140px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
  display: flex;
  align-items: flex-end;
  padding: 0.85rem;
}
.event-poster .badge {
  background: rgba(255, 255, 255, 0.95);
}
.poster-workshop {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
}
.poster-seminar {
  background: linear-gradient(135deg, #7c3aed, #db2777);
}
.poster-competition {
  background: linear-gradient(135deg, #f97316, #ef4444);
}
.poster-social {
  background: linear-gradient(135deg, #16a34a, #84cc16);
}
.poster-general {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
}

.event-card h3 {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.4;
}
.small {
  font-size: 0.85rem;
}
.event-summary {
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.event-foot {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  flex-wrap: wrap;
}

.empty {
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

@media (max-width: 860px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>
