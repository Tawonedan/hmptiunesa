<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useEvents } from '@/composables/useEvents'
import { useProjects } from '@/composables/useProjects'
import { useSiteSettings } from '@/composables/useSiteSettings'

const { organizationName, cabinetName, cabinetPeriod, tagline, stats } = useSiteSettings()
const { upcomingEvents, fetchUpcoming } = useEvents()
const { fetchFeatured } = useProjects()

const featured = ref<Awaited<ReturnType<typeof fetchFeatured>>>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchUpcoming(), fetchFeatured(3)])
  featured.value = await fetchFeatured(3)
  loading.value = false
})

const heroStats = computed(() => [
  { label: 'Departemen', value: stats.value.department_count ?? 0, icon: '🏛️' },
  { label: 'Program Terlaksana', value: stats.value.completed_programs ?? 0, icon: '🚀' },
  { label: 'Pengurus Aktif', value: stats.value.active_committee_count ?? 0, icon: '👥' },
])

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const posterGradients: Record<string, string> = {
  workshop: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  seminar: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  competition: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  social: 'linear-gradient(135deg, #16a34a 0%, #84cc16 100%)',
  general: 'linear-gradient(135deg, #0a2540 0%, #3b6cf4 100%)',
}
</script>

<template>
  <!-- ── HERO ────────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero-orb hero-orb-1" aria-hidden="true"></div>
    <div class="hero-orb hero-orb-2" aria-hidden="true"></div>
    <div class="hero-grid" aria-hidden="true"></div>

    <div class="container hero-inner">
      <span class="hero-badge">
        <span class="dot"></span>
        {{ organizationName }}
      </span>
      <h1 class="hero-title">
        {{ cabinetName }}
        <span class="hero-period">— {{ cabinetPeriod }}</span>
      </h1>
      <p v-if="tagline" class="hero-tagline">"{{ tagline }}"</p>
      <p class="hero-lead">
        Wadah aspirasi, kolaborasi, dan inovasi mahasiswa Teknik Informatika
        Universitas Negeri Surabaya.
      </p>
      <div class="hero-cta">
        <RouterLink to="/events" class="btn btn-highlight">Jelajahi Kegiatan →</RouterLink>
        <RouterLink to="/about" class="btn btn-outline-light">Tentang Kami</RouterLink>
        <RouterLink to="/spotlight" class="btn btn-outline-light">Spotlight</RouterLink>
      </div>
    </div>

    <div class="hero-stats-bar">
      <div class="container hero-stats">
        <div v-for="s in heroStats" :key="s.label" class="hero-stat">
          <span class="hero-stat-icon">{{ s.icon }}</span>
          <div>
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── UPCOMING EVENTS ────────────────────────────────────────── -->
  <section class="section">
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Sorotan</span>
        <h2>Kegiatan Mendatang</h2>
        <p>Jangan lewatkan kegiatan terbaru dari HMPTI. Pendaftaran terbuka untuk mahasiswa.</p>
      </div>

      <div v-if="loading" class="grid-3">
        <div v-for="i in 3" :key="i" class="card skeleton-card"></div>
      </div>
      <div v-else-if="upcomingEvents.length === 0" class="empty">
        <span class="empty-icon">📅</span>
        Belum ada kegiatan mendatang. Pantau terus halaman ini!
      </div>
      <div v-else class="grid-3">
        <article
          v-for="ev in upcomingEvents.slice(0, 3)"
          :key="ev.id"
          class="card card-hover event-card"
        >
          <div class="event-poster" :style="{ background: posterGradients[ev.category] ?? posterGradients.general }">
            <span :class="['badge', `badge-${ev.status}`]">{{ ev.status }}</span>
            <span class="event-icon">🎯</span>
          </div>
          <span class="event-category">{{ ev.category }}</span>
          <h3>{{ ev.title }}</h3>
          <p class="event-meta">
            <span>📅 {{ formatDate(ev.start_date) }}</span>
            <span>📍 {{ ev.location ?? '—' }}</span>
          </p>
          <p class="event-summary">{{ ev.summary }}</p>
          <RouterLink :to="`/events/${ev.slug}`" class="event-link">
            Detail kegiatan →
          </RouterLink>
        </article>
      </div>
    </div>
  </section>

  <!-- ── FEATURED SHOWCASE ─────────────────────────────────────── -->
  <section v-if="featured.length" class="section section-alt">
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Spotlight</span>
        <h2>Showcase Unggulan</h2>
        <p>Proyek mahasiswa TI yang berdampak dan inovatif.</p>
      </div>

      <div class="grid-3">
        <article v-for="p in featured" :key="p.id" class="card card-hover project-card">
          <div class="project-thumb-wrap">
            <img
              v-if="p.thumbnail_url"
              :src="p.thumbnail_url"
              :alt="p.title"
              class="project-thumb"
            />
            <div v-else class="project-thumb placeholder">No Preview</div>
            <span class="project-badge">{{ p.category }}</span>
          </div>
          <h3>{{ p.title }}</h3>
          <div class="tag-row">
            <span v-for="t in p.tags.slice(0, 3)" :key="t" class="tag">{{ t }}</span>
          </div>
          <p class="project-desc">{{ p.description }}</p>
          <RouterLink to="/spotlight" class="event-link">Lihat di Spotlight →</RouterLink>
        </article>
      </div>
    </div>
  </section>

  <!-- ── CTA BAND ──────────────────────────────────────────────── -->
  <section class="section">
    <div class="container">
      <div class="cta-band">
        <div class="cta-content">
          <span class="eyebrow eyebrow-on-dark">Kolaborasi</span>
          <h2>Punya pertanyaan atau ingin berkolaborasi?</h2>
          <p>Hubungi kami melalui kanal resmi atau kirim pesan lewat formulir kontak.</p>
        </div>
        <RouterLink to="/contact" class="btn btn-highlight">Hubungi Kami →</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── HERO ────────────────────────────────────────────────────────── */

.hero {
  position: relative;
  padding: 7rem 0 0;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(135deg, #0a2540 0%, #1e4a8c 45%, #3b6cf4 100%);
  isolation: isolate;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 90%);
  pointer-events: none;
}
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.hero-orb-1 {
  width: 520px;
  height: 520px;
  background: #3b6cf4;
  top: -180px;
  right: -120px;
  opacity: 0.55;
}
.hero-orb-2 {
  width: 380px;
  height: 380px;
  background: #ff7a59;
  bottom: -100px;
  left: -100px;
  opacity: 0.4;
}

.hero-inner {
  text-align: center;
  padding-bottom: 6rem;
  position: relative;
  z-index: 1;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1.1rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-on-brand);
  margin-bottom: 1.5rem;
}
.hero-badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 12px #4ade80;
}
.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  margin: 0 0 1rem;
  color: var(--text-on-brand);
  line-height: 1.05;
}
.hero-period {
  display: block;
  font-size: 0.4em;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.6rem;
  letter-spacing: 0;
}
.hero-tagline {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  color: var(--brand-gold);
  font-style: italic;
  margin: 0.75rem 0 1.25rem;
  font-weight: 500;
}
.hero-lead {
  max-width: 640px;
  margin: 0 auto 2.5rem;
  color: rgba(255, 255, 255, 0.88);
  font-size: 1.075rem;
  line-height: 1.65;
}
.hero-cta {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* ── Hero stats bar (overlapping the bottom of the hero) ─────── */

.hero-stats-bar {
  position: relative;
  margin-top: -3rem;
  padding-bottom: 4rem;
  z-index: 2;
}
.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.hero-stat {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-subtle);
  transition: transform 0.25s var(--ease-out);
}
.hero-stat:hover {
  transform: translateY(-4px);
}
.hero-stat-icon {
  font-size: 1.75rem;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-accent-soft);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.hero-stat strong {
  display: block;
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--brand-primary);
  line-height: 1.1;
}
.hero-stat span {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* ── Sections ──────────────────────────────────────────────────── */

.section {
  padding: 5rem 0;
}
.section-alt {
  background: linear-gradient(180deg, var(--surface-page) 0%, var(--surface-muted) 100%);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

/* ── Event cards ──────────────────────────────────────────────── */

.event-card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0;
  overflow: hidden;
}
.event-poster {
  position: relative;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 1rem;
  color: var(--text-on-brand);
}
.event-poster .badge {
  background: rgba(255, 255, 255, 0.95);
}
.event-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}
.event-card > *:not(.event-poster) {
  padding: 0 1.5rem;
}
.event-card > h3 {
  padding: 1rem 1.5rem 0;
  font-size: 1.125rem;
  line-height: 1.35;
}
.event-card > .event-link {
  padding: 0.5rem 1.5rem 1.5rem;
}
.event-category {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-accent);
  background: var(--brand-accent-soft);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-pill);
  align-self: flex-start;
}
.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}
.event-summary {
  color: var(--text-secondary);
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.event-link {
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--brand-accent);
}

/* ── Project cards ────────────────────────────────────────────── */

.project-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  overflow: hidden;
}
.project-thumb-wrap {
  position: relative;
  height: 180px;
  overflow: hidden;
}
.project-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--ease-out);
}
.project-card:hover .project-thumb {
  transform: scale(1.05);
}
.project-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-muted);
  color: var(--text-muted);
}
.project-badge {
  position: absolute;
  top: 0.85rem;
  left: 0.85rem;
  background: rgba(10, 37, 64, 0.85);
  backdrop-filter: blur(8px);
  color: var(--text-on-brand);
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.project-card > *:not(.project-thumb-wrap) {
  padding: 0 1.5rem;
}
.project-card > h3 {
  padding: 1rem 1.5rem 0;
  font-size: 1.1rem;
}
.project-card > .event-link {
  padding: 0.25rem 1.5rem 1.5rem;
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0 1.5rem;
}
.tag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  background: var(--surface-muted);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}
.project-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.55;
  margin: 0;
  padding: 0 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Empty state ─────────────────────────────────────────────── */

.empty {
  text-align: center;
  padding: 3.5rem 1rem;
  color: var(--text-muted);
  background: var(--surface-card);
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.empty-icon {
  font-size: 2rem;
}

.skeleton-card {
  height: 360px;
  background: linear-gradient(
    90deg,
    var(--surface-muted) 0%,
    var(--border-subtle) 50%,
    var(--surface-muted) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
  border-radius: var(--radius-lg);
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── CTA Band ─────────────────────────────────────────────────── */

.cta-band {
  background: var(--brand-primary);
  background-image:
    radial-gradient(circle at 0% 50%, rgba(59, 108, 244, 0.35), transparent 60%),
    radial-gradient(circle at 100% 0%, rgba(255, 122, 89, 0.25), transparent 50%),
    linear-gradient(135deg, #0a2540 0%, #0d3160 100%);
  border-radius: var(--radius-xl);
  padding: 3rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}
.cta-content {
  color: var(--text-on-brand);
  flex: 1;
  max-width: 560px;
}
.cta-content h2 {
  color: var(--text-on-brand);
  margin: 0.5rem 0 0.75rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1.2;
}
.cta-content p {
  margin: 0;
  color: var(--text-on-dark);
  font-size: 1.05rem;
}
.eyebrow-on-dark {
  background: rgba(255, 255, 255, 0.12);
  color: var(--brand-gold);
}

/* ── Responsive ───────────────────────────────────────────────── */

@media (max-width: 860px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
  .hero-stats {
    grid-template-columns: 1fr;
  }
  .cta-band {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }
  .hero {
    padding-top: 5rem;
  }
}
</style>
