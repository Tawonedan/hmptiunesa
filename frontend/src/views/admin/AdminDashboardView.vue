<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import { useEvents } from '@/composables/useEvents'
import { useProjects } from '@/composables/useProjects'
import { useOspek } from '@/composables/useOspek'
import type { Project } from '@/types/database'

const authStore = useAuthStore()
const siteSettingsStore = useSiteSettingsStore()
const { upcomingEvents, fetchUpcoming } = useEvents()
const { projects, fetchAll: fetchProjects } = useProjects()
const { items: ospekItems, fetchAll: fetchOspek } = useOspek()

const featuredProjects = computed(() => projects.value.filter((p: Project) => p.is_featured))

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

onMounted(() => {
  fetchUpcoming()
  fetchProjects()
  fetchOspek()
})
</script>

<template>
  <div class="admin-dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">📅</span>
        <div>
          <strong>{{ upcomingEvents.length }}</strong>
          <span>Kegiatan Mendatang</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">💼</span>
        <div>
          <strong>{{ featuredProjects.length }}</strong>
          <span>Proyek Unggulan</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📋</span>
        <div>
          <strong>{{ ospekItems.filter(i => i.is_published).length }}</strong>
          <span>Ospek Terbit</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-heading">
        <span class="eyebrow">Kegiatan Mendatang</span>
        <h2>Ringkasan</h2>
      </div>
      <div class="grid-3">
        <article v-for="ev in upcomingEvents.slice(0, 3)" :key="ev.id" class="card stat-card">
          <span :class="['badge', `badge-${ev.status}`]">{{ ev.status }}</span>
          <h3>{{ ev.title }}</h3>
          <p class="muted">{{ formatDate(ev.start_date) }} · {{ ev.location }}</p>
        </article>
      </div>
    </div>

    <div class="section section-alt">
      <div class="section-heading">
        <span class="eyebrow">Showcase</span>
        <h2>Proyek Terbatas</h2>
      </div>
      <div class="grid-3">
        <article v-for="p in featuredProjects.slice(0, 3)" :key="p.id" class="card stat-card">
          <div class="stat-icon">{{ p.tags?.[0] ? p.tags[0].charAt(0) : '💼' }}</div>
          <h3>{{ p.title }}</h3>
          <p class="muted small">{{ p.category }}</p>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 2rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}
.stat-card strong {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-primary);
}
.stat-card span {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
  display: block;
}

.section {
  padding: 2rem 0;
}
.section-alt {
  background: var(--surface-muted);
}
.section-heading {
  margin-bottom: 1.5rem;
}
.section-heading .eyebrow {
  background: var(--brand-accent-soft);
  color: var(--brand-accent);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.section-heading h2 {
  margin: 0.5rem 0 0;
  font-size: 1.25rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 1024px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
</style>