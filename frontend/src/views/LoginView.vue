<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo-container">
        <img class="logo" src="@/assets/logo.svg" alt="Logo HMPTI" width="80" height="80" />
        <h2 class="organization-name">HMP TI UNESA</h2>
      </div>
      <h1>Login Anggota</h1>
      
      <div v-if="errorMessage" class="error-alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="contoh@email.com" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : 'Masuk' }}
        </button>

        <div class="register-link">
          Belum punya akun? <router-link to="/register">Daftar sekarang</router-link>
        </div>
      </form>
      <div class="tagline">Berdaya, Berkarya, dan Bermanfaat</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('http://localhost:5000/api/users/login', {
      email: email.value,
      password: password.value
    })

    const { token, user } = response.data

    // Simpan token dan data user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isLoggedIn', 'true') // Backward compatibility if needed
    
    // Redirect ke halaman utama
    router.push('/')
    
    // Trigger event agar komponen lain tau ada perubahan auth (optional hack for non-pinia apps)
    window.dispatchEvent(new Event('storage'))

  } catch (error) {
    console.error('Login error:', error)
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal login. Periksa koneksi atau kredensial Anda.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--vt-c-white-soft);
}

.login-form {
  background-color: white;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.organization-name {
  margin-top: 0.75rem;
  color: #00A0E3;
  font-weight: 600;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--vt-c-indigo);
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--vt-c-indigo);
}

input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  outline: none;
  border-color: #00A0E3;
  box-shadow: 0 0 0 2px rgba(0, 160, 227, 0.1);
}

.login-btn {
  width: 100%;
  padding: 0.875rem;
  margin-top: 1.5rem;
  background-color: #00A0E3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #0088c7;
}

.tagline {
  margin-top: 1.5rem;
  font-style: italic;
  color: #777;
  font-size: 0.9rem;
}
.error-alert {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: left;
  border: 1px solid #fecaca;
}
.register-link {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.register-link a {
  color: #00A0E3;
  font-weight: 600;
}
</style> 