<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import type { SpotlightMode } from '@/types/database'

const siteSettingsStore = useSiteSettingsStore()

const form = reactive({
  organization_name: '',
  organization_abbr: '',
  tagline: '',
  cabinet_name: '',
  cabinet_period: '',
  contact_email: '',
  secretariat_address: '',
  gmaps_embed_url: '',
  spotlight_mode: 'showcase' as SpotlightMode,
})

const isSaving = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)

const syncForm = () => {
  const current = siteSettingsStore.value
  form.organization_name = current.organization_name || ''
  form.organization_abbr = current.organization_abbr || ''
  form.tagline = current.tagline || ''
  form.cabinet_name = current.cabinet_name || ''
  form.cabinet_period = current.cabinet_period || ''
  form.contact_email = current.contact_email || ''
  form.secretariat_address = current.secretariat_address || ''
  form.gmaps_embed_url = current.gmaps_embed_url || ''
  form.spotlight_mode = current.spotlight_mode || 'showcase'
}

onMounted(() => {
  syncForm()
})

watch(() => siteSettingsStore.value, () => {
  syncForm()
}, { deep: true })

const handleSave = async () => {
  isSaving.value = true
  saveSuccess.value = false
  saveError.value = null

  try {
    const ok = await siteSettingsStore.updateSettings({
      organization_name: form.organization_name,
      organization_abbr: form.organization_abbr,
      tagline: form.tagline,
      cabinet_name: form.cabinet_name,
      cabinet_period: form.cabinet_period,
      contact_email: form.contact_email,
      secretariat_address: form.secretariat_address,
      gmaps_embed_url: form.gmaps_embed_url,
      spotlight_mode: form.spotlight_mode,
    })

    if (ok) {
      saveSuccess.value = true
      setTimeout(() => {
        saveSuccess.value = false
      }, 4000)
    } else {
      saveError.value = siteSettingsStore.errorMessage || 'Gagal menyimpan perubahan.'
    }
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
  } finally {
    isSaving.value = false
  }
}

const setMode = (mode: SpotlightMode) => {
  form.spotlight_mode = mode
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <span class="eyebrow">CMS</span>
        <h1>Pengaturan Situs & Spotlight</h1>
        <p class="muted">Kelola identitas organisasi dan mode musiman Spotlight tanpa perlu deploy ulang.</p>
      </div>
      <button class="btn btn-primary" :disabled="isSaving" @click="handleSave">
        {{ isSaving ? 'Menyimpan…' : 'Simpan Perubahan' }}
      </button>
    </div>

    <div v-if="saveSuccess" class="alert alert-success">
      Pengaturan berhasil disimpan dan langsung aktif!
    </div>
    <div v-if="saveError" class="alert alert-error">
      {{ saveError }}
    </div>

    <!-- Spotlight Mode Switcher Card -->
    <div class="card spotlight-control-card">
      <div class="card-header">
        <div>
          <h2>Mode Musiman Spotlight</h2>
          <p class="muted small">Tentukan konten apa yang tampil pada rute <code>/spotlight</code> publik.</p>
        </div>
        <span :class="['badge', form.spotlight_mode === 'ospek' ? 'badge-highlight' : 'badge-accent']">
          Mode Aktif: {{ form.spotlight_mode === 'ospek' ? 'PKKMB / Ospek' : 'Showcase Proyek' }}
        </span>
      </div>

      <div class="mode-options">
        <div
          class="mode-card"
          :class="{ selected: form.spotlight_mode === 'showcase' }"
          @click="setMode('showcase')"
        >
          <div class="mode-icon">🚀</div>
          <div class="mode-content">
            <h3>Showcase Mahasiswa (Default)</h3>
            <p class="small muted">
              Menampilkan portofolio karya, proyek inovasi, dan prestasi mahasiswa Teknik Informatika UNESA.
            </p>
          </div>
          <input
            type="radio"
            name="spotlight_mode"
            value="showcase"
            :checked="form.spotlight_mode === 'showcase'"
          />
        </div>

        <div
          class="mode-card"
          :class="{ selected: form.spotlight_mode === 'ospek' }"
          @click="setMode('ospek')"
        >
          <div class="mode-icon">🎓</div>
          <div class="mode-content">
            <h3>Pusat Informasi Ospek / PKKMB (Musiman)</h3>
            <p class="small muted">
              Menampilkan jadwal, buku panduan, pengumuman, dan tautan gugus untuk mahasiswa baru.
            </p>
          </div>
          <input
            type="radio"
            name="spotlight_mode"
            value="ospek"
            :checked="form.spotlight_mode === 'ospek'"
          />
        </div>
      </div>
    </div>

    <!-- Organization Identity Form -->
    <form class="card settings-form" @submit.prevent="handleSave">
      <h2>Identitas Organisasi & Kabinet</h2>

      <div class="form-grid">
        <div class="field">
          <label>Nama Organisasi</label>
          <input v-model="form.organization_name" type="text" required />
        </div>

        <div class="field">
          <label>Singkatan Organisasi</label>
          <input v-model="form.organization_abbr" type="text" required />
        </div>

        <div class="field">
          <label>Nama Kabinet Aktif</label>
          <input v-model="form.cabinet_name" type="text" required />
        </div>

        <div class="field">
          <label>Periode Kepengurusan</label>
          <input v-model="form.cabinet_period" type="text" placeholder="2025/2026" required />
        </div>

        <div class="field field-full">
          <label>Tagline / Semboyan</label>
          <input v-model="form.tagline" type="text" />
        </div>
      </div>

      <hr class="divider" />

      <h2>Kontak & Sekretariat</h2>

      <div class="form-grid">
        <div class="field field-full">
          <label>Email Resmi Organisasi</label>
          <input v-model="form.contact_email" type="email" />
        </div>

        <div class="field field-full">
          <label>Alamat Sekretariat</label>
          <textarea v-model="form.secretariat_address" rows="2"></textarea>
        </div>

        <div class="field field-full">
          <label>Google Maps Embed URL</label>
          <input v-model="form.gmaps_embed_url" type="url" placeholder="https://www.google.com/maps/embed?..." />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="isSaving">
          {{ isSaving ? 'Menyimpan…' : 'Simpan Semua Pengaturan' }}
        </button>
      </div>
    </form>
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

.alert {
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}
.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}
.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.spotlight-control-card {
  border: 2px solid var(--brand-accent-soft);
  background: linear-gradient(to bottom, #ffffff, #f8faff);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.card-header h2 {
  font-size: 1.25rem;
  margin: 0 0 0.25rem;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface-card);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-card:hover {
  border-color: var(--brand-accent);
  box-shadow: var(--shadow-sm);
}

.mode-card.selected {
  border-color: var(--brand-accent);
  background: var(--brand-accent-soft);
}

.mode-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.mode-content {
  flex: 1;
}

.mode-content h3 {
  font-size: 1rem;
  margin: 0 0 0.25rem;
}

.settings-form h2 {
  font-size: 1.25rem;
  margin: 0 0 1.25rem;
  color: var(--brand-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
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
.field textarea {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--surface-card);
  color: var(--text-primary);
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px rgba(59, 108, 244, 0.15);
}

.divider {
  border: none;
  border-top: 1px solid var(--border-subtle);
  margin: 1.75rem 0 1.25rem;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
