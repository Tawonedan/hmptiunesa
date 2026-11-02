<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = reactive({
  email: '',
  password: '',
})

const submitting = ref(false)
const submitted = ref(false)
const submitError = ref<string | null>(null)

// Login handler
const handleLogin = async () => {
  submitError.value = null
  submitted.value = false
  submitting.value = true

  try {
    const success = await authStore.login(form.email, form.password)
    if (success) {
      submitted.value = true
      // Redirect to previous page or dashboard
      const from = router.currentRoute.value.query.redirect as string | null
      const target = from ? `/${from}` : '/admin/dashboard'
      router.push(target)
    }
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Login gagal.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="hero-band">
    <div class="container">
      <span class="eyebrow">Admin</span>
      <h1>Masuk ke CMS</h1>
      <p class="hero-lead">
        Silakan login untuk mengakses panel administrasi HMPTI.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <form class="card contact-form" @submit.prevent="handleLogin">
        <h2>Login Admin</h2>
        <p class="muted">
          Masuk dengan akun CMS untuk mengelola website HMPTI.
        </p>

        <div v-if="submitError" class="alert error">{{ submitError }}</div>
        <div v-else-if="submitted" class="alert success">
          Login berhasil! Sedang memuat dashboard...
        </div>

        <div class="field">
          <span>Email</span>
          <input v-model="form.email" type="email" required />
        </div>
        <div class="field">
          <span>Password</span>
          <input v-model="form.password" type="password" required />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="submitting"
        >
          {{ submitting ? 'Mengirim…' : 'Masuk' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.hero-band {
  padding: 5rem 0 3rem;
  background: var(--brand-primary);
  color: var(--text-on-brand);
}
.hero-band h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  margin: 0.5rem 0 0.75rem;
  color: var(--text-on-brand);
}
.hero-lead {
  max-width: 600px;
  color: rgba(255, 255, 255, 0.85);
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
.field input {
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--surface-card);
  color: var(--text-primary);
  transition: border-color 0.15s ease;
}
.field input:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px rgba(59, 108, 244, 0.15);
}
.alert {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}
.alert.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.alert.success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
</style>