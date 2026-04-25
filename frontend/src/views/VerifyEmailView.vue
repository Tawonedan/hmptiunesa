<template>
  <div class="verify-container">
    <div class="verify-form">
      <div class="logo-container">
        <img class="logo" src="@/assets/logo.svg" alt="Logo HMPTI" width="80" height="80" />
        <h2 class="organization-name">HMP TI UNESA</h2>
      </div>
      <h1>Verifikasi Email</h1>
      <p class="subtitle">Silakan masukkan 6 digit kode OTP yang telah dikirimkan ke email Anda.</p>
      
      <div v-if="errorMessage" class="error-alert">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-alert">
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleVerify">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="contoh@email.com" required disabled>
        </div>
        
        <div class="form-group">
          <label for="otp">Kode OTP</label>
          <input type="number" id="otp" v-model="otp" placeholder="123456" maxlength="6" pattern="\\d{6}" required>
        </div>

        <button type="submit" class="verify-btn" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : 'Verifikasi' }}
        </button>

        <div class="resend-link">
          Belum menerima kode? 
          <button type="button" class="resend-btn" @click="handleResend" :disabled="isResending">
            {{ isResending ? 'Mengirim...' : 'Kirim Ulang OTP' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const email = ref('')
const otp = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email
  }
})

const handleVerify = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await axios.post('http://localhost:5000/api/users/verify-email', {
      email: email.value,
      otp: otp.value
    })

    successMessage.value = 'Verifikasi berhasil! Anda akan dialihkan...'
    
    const { token, user } = response.data

    // Simpan token dan data user (Auto Login)
    if (token && user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('isLoggedIn', 'true')
      window.dispatchEvent(new Event('storage'))
      
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }

  } catch (error) {
    console.error('Verify error:', error)
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal memverifikasi. Periksa koneksi Anda.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleResend = async () => {
  if (!email.value) {
    errorMessage.value = 'Email tidak ditemukan.'
    return
  }

  isResending.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await axios.post('http://localhost:5000/api/users/resend-otp', {
      email: email.value
    })

    successMessage.value = 'Kode OTP baru telah dikirim ke email Anda.'
  } catch (error) {
    console.error('Resend error:', error)
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal mengirim ulang OTP.'
    }
  } finally {
    isResending.value = false
  }
}
</script>

<style scoped>
.verify-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--vt-c-white-soft);
}

.verify-form {
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
  margin-bottom: 0.5rem;
  color: var(--vt-c-indigo);
  font-weight: 600;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
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

input:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

input:focus {
  outline: none;
  border-color: #00A0E3;
  box-shadow: 0 0 0 2px rgba(0, 160, 227, 0.1);
}

.verify-btn {
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

.verify-btn:hover {
  background-color: #0088c7;
}

.verify-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.resend-link {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.resend-btn {
  background: none;
  border: none;
  color: #00A0E3;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.resend-btn:hover {
  text-decoration: underline;
}

.resend-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
  text-decoration: none;
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
