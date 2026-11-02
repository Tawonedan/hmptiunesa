<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useCabinet } from '@/composables/useCabinet'
import { memberLevelLabel, memberLevelOrder } from '@/config/site'
import type { CabinetMemberWithDepartment, MemberLevel } from '@/types/database'

const {
  activeCabinet,
  departments,
  members,
  cabinetHistory,
  refresh,
} = useCabinet()

const selectedDepartmentId = ref<string>('all')
const selectedLevel = ref<MemberLevel | 'all'>('all')

onMounted(() => {
  void refresh()
})

const filteredMembers = computed<CabinetMemberWithDepartment[]>(() => {
  let result = [...members.value]
  if (selectedDepartmentId.value !== 'all') {
    result = result.filter((m) => m.department_id === selectedDepartmentId.value)
  }
  if (selectedLevel.value !== 'all') {
    result = result.filter((m) => m.level === selectedLevel.value)
  }
  return result.sort(
    (a, b) =>
      (memberLevelOrder[a.level] ?? 9) - (memberLevelOrder[b.level] ?? 9) ||
      a.display_order - b.display_order,
  )
})

const levels: Array<MemberLevel | 'all'> = ['all', 'bph', 'coordinator', 'staff_ahli', 'staff_muda']

const levelLabel = (level: MemberLevel | 'all'): string => {
  if (level === 'all') return 'Semua'
  return memberLevelLabel[level] ?? level
}

const visionPoints = computed<string[]>(() =>
  activeCabinet.value?.vision
    ? [activeCabinet.value.vision]
    : [],
)
const missionPoints = computed<string[]>(() => {
  const raw = activeCabinet.value?.mission ?? ''
  return raw
    .split(/\r?\n/)
    .map((s) => s.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
})
</script>

<template>
  <section class="hero-band">
    <div class="container">
      <span class="eyebrow">Tentang Kami</span>
      <h1>{{ activeCabinet?.name ?? 'HMPTI UNESA' }}</h1>
      <p v-if="activeCabinet?.history_text" class="hero-lead">
        {{ activeCabinet.history_text }}
      </p>
    </div>
  </section>

  <section v-if="visionPoints.length || missionPoints.length" class="section">
    <div class="container vm-grid">
      <div class="card vm-card">
        <span class="eyebrow">Visi</span>
        <p>{{ visionPoints[0] }}</p>
      </div>
      <div class="card vm-card">
        <span class="eyebrow">Misi</span>
        <ol>
          <li v-for="(m, i) in missionPoints" :key="i">{{ m }}</li>
        </ol>
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Struktur</span>
        <h2>Kabinet Aktif</h2>
        <p>Kenali para pengurus yang mengemban amanah untuk periode ini.</p>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <label>Departemen</label>
          <select v-model="selectedDepartmentId">
            <option value="all">Semua Departemen</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Hierarki</label>
          <div class="chip-row">
            <button
              v-for="lvl in levels"
              :key="lvl"
              :class="['chip', { 'is-active': selectedLevel === lvl }]"
              @click="selectedLevel = lvl"
            >
              {{ levelLabel(lvl) }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredMembers.length === 0" class="empty">
        Belum ada anggota yang cocok dengan filter.
      </div>
      <div v-else class="member-grid">
        <article
          v-for="m in filteredMembers"
          :key="m.id"
          class="card card-hover member-card"
        >
          <div class="member-avatar">
            <img v-if="m.photo_url" :src="m.photo_url" :alt="m.name" />
            <div v-else class="avatar-placeholder">
              {{ m.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <h3>{{ m.name }}</h3>
          <p class="role">{{ m.role_title }}</p>
          <p class="muted small">
            {{ memberLevelLabel[m.level] ?? m.level }} ·
            {{ m.department?.code ?? '—' }}
          </p>
          <div v-if="m.social_links.linkedin || m.social_links.github" class="social-mini">
            <a
              v-if="m.social_links.linkedin"
              :href="m.social_links.linkedin"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
            >in</a>
            <a
              v-if="m.social_links.github"
              :href="m.social_links.github"
              target="_blank"
              rel="noopener"
              aria-label="GitHub"
            >gh</a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section v-if="departments.length" class="section">
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Departemen</span>
        <h2>Divisi & Fokus Kerja</h2>
      </div>
      <div class="grid-3">
        <article v-for="d in departments" :key="d.id" class="card card-hover">
          <span class="dept-code">{{ d.code ?? '—' }}</span>
          <h3>{{ d.name }}</h3>
          <p class="muted">{{ d.description ?? '' }}</p>
        </article>
      </div>
    </div>
  </section>

  <section v-if="cabinetHistory.length" class="section section-alt">
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Arsip</span>
        <h2>Sejarah Kabinet</h2>
      </div>
      <ol class="history-list">
        <li v-for="h in cabinetHistory" :key="h.id">
          <strong>{{ h.name }}</strong>
          <span class="muted">{{ h.period }}</span>
        </li>
      </ol>
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
  max-width: 720px;
  color: var(--text-secondary);
  font-size: 1.075rem;
  line-height: 1.65;
  position: relative;
}

.section {
  padding: 4rem 0;
}
.section-alt {
  background: var(--surface-muted);
}

.vm-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1.25rem;
}
.vm-card p {
  font-size: 1.05rem;
  margin: 0.75rem 0 0;
  color: var(--text-primary);
}
.vm-card ol {
  margin: 0.75rem 0 0;
  padding-left: 1.25rem;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-bar {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.filter-group label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.filter-group select {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--surface-card);
  font-size: 0.95rem;
  min-width: 200px;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface-card);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.chip:hover {
  border-color: var(--brand-accent);
}
.chip.is-active {
  background: var(--brand-primary);
  color: var(--text-on-brand);
  border-color: var(--brand-primary);
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.member-card {
  text-align: center;
  padding: 1.25rem;
}
.member-avatar {
  margin: 0 auto 0.75rem;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  font-size: 2rem;
  font-weight: 800;
  color: var(--brand-primary);
}
.member-card h3 {
  margin: 0;
  font-size: 1.05rem;
}
.member-card .role {
  margin: 0.25rem 0;
  font-weight: 600;
  color: var(--brand-accent);
  font-size: 0.9rem;
}
.member-card .small {
  font-size: 0.8rem;
  margin: 0;
}
.social-mini {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.75rem;
}
.social-mini a {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--surface-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: background 0.15s ease;
}
.social-mini a:hover {
  background: var(--brand-accent);
  color: var(--text-on-brand);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}
.dept-code {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--brand-accent);
  margin-bottom: 0.5rem;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 640px;
  margin: 0 auto;
}
.history-list li {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  background: var(--surface-card);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
}

@media (max-width: 860px) {
  .vm-grid {
    grid-template-columns: 1fr;
  }
  .grid-3 {
    grid-template-columns: 1fr;
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-group select {
    min-width: 0;
    width: 100%;
  }
}
</style>
