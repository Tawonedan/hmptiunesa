<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import { useSiteSettings } from '@/composables/useSiteSettings'

const { settings, socialLinks, contactEmail } = useSiteSettings()

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
  // Honeypot field — hidden from real users, bots auto-fill it
  website: string
}

const form = reactive<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
})

const submitting = ref(false)
const submitted = ref(false)
const submitError = ref<string | null>(null)

// Simple client-side rate limiter mirror (real rate limit is in the edge function)
const clientCooldown = ref(false)

const socialItems = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'github', label: 'GitHub' },
  { key: 'tiktok', label: 'TikTok' },
] as const

const validate = (): string | null => {
  if (form.website.trim() !== '') return 'Spam terdeteksi.'
  if (form.name.trim().length < 2) return 'Nama harus diisi minimal 2 karakter.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Alamat email tidak valid.'
  if (form.subject.trim().length < 3) return 'Subjek harus diisi minimal 3 karakter.'
  if (form.message.trim().length < 10) return 'Pesan harus diisi minimal 10 karakter.'
  return null
}

const submit = async (): Promise<void> => {
  submitError.value = null
  submitted.value = false

  const validationError = validate()
  if (validationError) {
    submitError.value = validationError
    return
  }
  if (clientCooldown.value) {
    submitError.value = 'Mohon tunggu sebentar sebelum mengirim lagi.'
    return
  }

  submitting.value = true
  clientCooldown.value = true
  setTimeout(() => (clientCooldown.value = false), 30_000)

  try {
    const functionsBase =
      (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined) ??
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

    const res = await fetch(`${functionsBase}/contact-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        website: form.website,
      }),
    })

    const data: { success?: boolean; message?: string; error?: string } = await res
      .json()
      .catch(() => ({}))

    if (!res.ok || !data.success) {
      throw new Error(data.error ?? `Gagal mengirim pesan (status ${res.status}).`)
    }

    submitted.value = true
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    form.website = ''
  } catch (err) {
    submitError.value =
      err instanceof Error
        ? err.message
        : 'Gagal mengirim pesan. Periksa koneksi Anda dan coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="hero-band">
    <div class="container">
      <span class="eyebrow">Hubungi Kami</span>
      <h1>Kami senang mendengar dari Anda</h1>
      <p class="hero-lead">
        Punya pertanyaan, ide kolaborasi, atau ingin mengundang HMPTI untuk suatu
        kegiatan? Kirimkan pesan melalui formulir di bawah atau gunakan kanal
        resmi kami.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container contact-grid">
      <div class="contact-info">
        <h2>Kanal Resmi</h2>
        <ul class="channel-list">
          <li v-for="s in socialItems" :key="s.key" v-show="socialLinks[s.key]">
            <span class="channel-label">{{ s.label }}</span>
            <a :href="socialLinks[s.key]" target="_blank" rel="noopener">
              {{ socialLinks[s.key] }}
            </a>
          </li>
          <li v-show="contactEmail">
            <span class="channel-label">Email</span>
            <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          </li>
        </ul>

        <div v-if="settings.secretariat_address" class="address">
          <h3>Sekretariat</h3>
          <p>{{ settings.secretariat_address }}</p>
        </div>

        <div v-if="settings.gmaps_embed_url" class="map-wrap">
          <iframe
            :src="settings.gmaps_embed_url"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
            title="Lokasi Sekretariat HMPTI"
          ></iframe>
        </div>
      </div>

      <form class="card contact-form" @submit.prevent="submit">
        <h2>Kirim Pesan</h2>
        <p class="muted">
          Isi formulir di bawah. Tim kami akan membalas ke email Anda.
        </p>

        <!-- Honeypot field — hidden from real users via aria + CSS -->
        <div class="honeypot" aria-hidden="true">
          <label>
            Website (biarkan kosong)
            <input v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
          </label>
        </div>

        <label class="field">
          <span>Nama</span>
          <input v-model="form.name" type="text" required maxlength="100" />
        </label>
        <label class="field">
          <span>Email</span>
          <input v-model="form.email" type="email" required maxlength="200" />
        </label>
        <label class="field">
          <span>Subjek</span>
          <input v-model="form.subject" type="text" required maxlength="200" />
        </label>
        <label class="field">
          <span>Pesan</span>
          <textarea
            v-model="form.message"
            required
            rows="5"
            maxlength="5000"
          ></textarea>
        </label>

        <div v-if="submitError" class="alert error">{{ submitError }}</div>
        <div v-else-if="submitted" class="alert success">
          Pesan berhasil dikirim! Kami akan segera membalas.
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="submitting || clientCooldown"
        >
          {{ submitting ? 'Mengirim…' : 'Kirim Pesan' }}
        </button>
      </form>
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
  padding: 4rem 0 5rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 2.5rem;
}

.contact-info h2 {
  margin: 0 0 1rem;
  font-size: 1.3rem;
  color: var(--brand-primary);
}

.channel-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.channel-list li {
  background: var(--surface-card);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}
.channel-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}
.channel-list a {
  font-weight: 500;
  word-break: break-all;
}

.address {
  margin-bottom: 1.5rem;
}
.address h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem;
  color: var(--brand-primary);
}
.address p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.map-wrap {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
}
.map-wrap iframe {
  width: 100%;
  height: 280px;
  border: 0;
  display: block;
}

.contact-form h2 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  color: var(--brand-primary);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 1rem;
}
.field span {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.field input,
.field textarea {
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--surface-card);
  color: var(--text-primary);
  transition: border-color 0.15s ease;
}
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px rgba(59, 108, 244, 0.15);
}
.field textarea {
  resize: vertical;
  min-height: 120px;
}

.honeypot {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.alert {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}
.alert.error {
  background: #fef2f2;
  color: var(--status-error);
  border: 1px solid #fecaca;
}
.alert.success {
  background: #f0fdf4;
  color: var(--status-success);
  border: 1px solid #bbf7d0;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 860px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
