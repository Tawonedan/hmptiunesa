<template>
  <div class="register-container">
    <div class="register-form">
      <div class="logo-container">
        <img class="logo" src="@/assets/logo.svg" alt="Logo HMPTI" width="80" height="80" />
        <h2 class="organization-name">HMP TI UNESA</h2>
      </div>
      <h1>Daftar Akun Anggota</h1>
      
      <div v-if="errorMessage" class="error-alert">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-alert">
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="nama">Nama Lengkap</label>
          <input type="text" id="nama" v-model="formData.nama" placeholder="Nama sesuai KTM" required>
        </div>

        <div class="form-group">
          <label for="nim">NIM</label>
          <input type="text" id="nim" v-model="formData.nim" placeholder="Nomor Induk Mahasiswa" required>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="formData.email" placeholder="email@mahasiswa.unesa.ac.id" required>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="formData.password" required>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Konfirmasi Password</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required>
        </div>

        <button type="submit" class="register-btn" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : 'Daftar' }}
        </button>

        <div class="login-link">
          Sudah punya akun? <router-link to="/login">Login di sini</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const formData = reactive({
  nama: '',
  nim: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  // Reset messages
  errorMessage.value = ''
  successMessage.value = ''

  // Client-side validation
  if (formData.password !== formData.confirmPassword) {
    errorMessage.value = 'Password dan konfirmasi password tidak cocok'
    return
  }

  isLoading.value = true

  try {
    const response = await axios.post('http://localhost:5000/api/users/register', {
      nama: formData.nama,
      nim: formData.nim,
      email: formData.email,
      password: formData.password
    })

    successMessage.value = 'Registrasi berhasil! Mengalihkan ke halaman login...'
    
    // Auto redirect after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal mendaftar. Terjadi kesalahan pada server.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
  background-color: var(--vt-c-white-soft);
}

.register-form {
  background-color: white;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 500px;
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
  font-size: 1.5rem;
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
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
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

.register-btn {
  width: 100%;
  padding: 0.875rem;
  margin-top: 1rem;
  background-color: #00A0E3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register-btn:hover {
  background-color: #0088c7;
}

.register-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.login-link {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.login-link a {
  color: #00A0E3;
  font-weight: 600;
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

.success-alert {
  background-color: #dcfce7;
  color: #15803d;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: left;
  border: 1px solid #bbf7d0;
}
</style>
