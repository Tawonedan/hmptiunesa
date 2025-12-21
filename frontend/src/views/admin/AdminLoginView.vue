<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = () => {
  // Demo credentials (in production, use proper authentication)
  if (username.value === 'admin' && password.value === 'hmptiunesa2025') {
    localStorage.setItem('adminLoggedIn', 'true')
    router.push('/admin/dashboard')
  } else {
    error.value = 'Username atau password salah'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="header">
        <h2 class="title">Login Admin</h2>
        <p class="subtitle">Sistem Manajemen Website Himpunan</p>
      </div>
      
      <div v-if="error" class="error-alert">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            v-model="username"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            required
            class="form-input"
          />
        </div>
        
        <button type="submit" class="submit-btn">
          Masuk
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #f3f4f6; /* gray-100 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 28rem;
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827; /* gray-900 */
}

.subtitle {
  color: #4b5563; /* gray-600 */
}

.error-alert {
  background-color: #fee2e2; /* red-100 */
  border: 1px solid #f87171; /* red-400 */
  color: #b91c1c; /* red-700 */
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left; /* Ensure labels align left */
}

.form-group:last-of-type {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: #374151; /* gray-700 */
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.375rem;
  outline: none;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); /* blue-500 with opacity */
}

.submit-btn {
  width: 100%;
  background-color: #3b82f6; /* blue-500 */
  color: white;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #2563eb; /* blue-600 */
}
</style>
