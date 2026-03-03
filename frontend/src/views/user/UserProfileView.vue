<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const successMessage = ref('')

// User data from auth
const currentUser = ref<any>(null)

// Member data from database
const memberData = ref<any>(null)

// Form fields
const linkedinUrl = ref('')
const instagramUrl = ref('')
const githubUrl = ref('')

onMounted(async () => {
  // Check auth
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  const userStr = localStorage.getItem('user')
  
  if (isLoggedIn !== 'true' || !userStr) {
    router.push('/login')
    return
  }
  
  currentUser.value = JSON.parse(userStr)
  await fetchMemberData()
})

const fetchMemberData = async () => {
  try {
    loading.value = true
    // Search member by NIM (studentId)
    // We assume the user's NIM matches the member's studentId
    if (!currentUser.value.nim) {
      error.value = 'Data akun tidak memiliki NIM. Hubungi admin.'
      loading.value = false
      return
    }

    const response = await axios.get(`/api/members/search?keyword=${currentUser.value.nim}`)
    const members = response.data.data

    // Find exact match
    const exactMatch = members.find((m: any) => m.studentId === currentUser.value.nim)
    
    if (exactMatch) {
      memberData.value = exactMatch
      // Populate form
      linkedinUrl.value = exactMatch.socialMedia?.linkedin || ''
      instagramUrl.value = exactMatch.socialMedia?.instagram || ''
      githubUrl.value = exactMatch.socialMedia?.github || ''
    } else {
      error.value = 'Data keanggotaan tidak ditemukan. Pastikan Anda terdaftar sebagai anggota.'
    }
  } catch (err) {
    console.error('Error fetching member data:', err)
    error.value = 'Gagal memuat data profil.'
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  if (!memberData.value) return
  
  try {
    saving.value = true
    error.value = ''
    successMessage.value = ''

    // Prepare update payload
    // We receive the existing socialMedia object and update fields
    // This ensures we don't accidentally wipe other fields if the backend replaces the whole object
    const updatedSocialMedia = {
      ...memberData.value.socialMedia,
      linkedin: linkedinUrl.value,
      instagram: instagramUrl.value,
      github: githubUrl.value
    }

    const payload = {
      socialMedia: updatedSocialMedia
    }

    await axios.put(`/api/members/${memberData.value._id}`, payload)
    
    successMessage.value = 'Profil berhasil diperbarui!'
    
    // Update local state
    memberData.value.socialMedia = updatedSocialMedia
    
  } catch (err) {
    console.error('Error updating profile:', err)
    error.value = 'Gagal menyimpan perubahan.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="profile-container">
    <div class="profile-content">
      <div class="header-section">
        <button @click="router.push('/user/dashboard')" class="back-btn">← Kembali</button>
        <h1>Edit Profil</h1>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data...</p>
      </div>

      <div v-else-if="error" class="error-alert">
        {{ error }}
      </div>

      <div v-else class="form-card">
        <div class="user-info">
          <div class="avatar-circle">
            {{ currentUser?.nama?.charAt(0) || 'U' }}
          </div>
          <div class="info-text">
            <h2>{{ memberData?.name || currentUser?.nama }}</h2>
            <p>{{ memberData?.studentId || currentUser?.nim }}</p>
            <span class="status-badge" :class="memberData?.membership?.isActive ? 'active' : 'inactive'">
              {{ memberData?.membership?.isActive ? 'Aktif' : 'Tidak Aktif' }}
            </span>
          </div>
        </div>

        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="form-section">
            <h3>Media Sosial</h3>
            <p class="section-desc">Tautan ini akan ditampilkan pada halaman Anggota.</p>
            
            <div class="form-group">
              <label for="linkedin">LinkedIn URL</label>
              <div class="input-with-icon">
                <span class="icon">👔</span>
                <input 
                  type="url" 
                  id="linkedin" 
                  v-model="linkedinUrl" 
                  placeholder="https://linkedin.com/in/username"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="instagram">Instagram URL</label>
              <div class="input-with-icon">
                <span class="icon">📸</span>
                <input 
                  type="url" 
                  id="instagram" 
                  v-model="instagramUrl" 
                  placeholder="https://instagram.com/username"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="github">GitHub URL</label>
              <div class="input-with-icon">
                <span class="icon">💻</span>
                <input 
                  type="url" 
                  id="github" 
                  v-model="githubUrl" 
                  placeholder="https://github.com/username"
                >
              </div>
            </div>
          </div>

          <div v-if="successMessage" class="success-alert">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  min-height: 90vh;
  background-color: var(--background-light, #f8fafc);
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.profile-content {
  max-width: 800px;
  width: 100%;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--primary-color, #004680);
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}

.header-section h1 {
  font-size: 2rem;
  color: var(--text-color, #1e293b);
  margin: 0;
}

.form-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background-color: var(--primary-color, #004680);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
}

.info-text h2 {
  margin: 0 0 0.25rem 0;
  color: var(--text-color, #1e293b);
}

.info-text p {
  margin: 0 0 0.5rem 0;
  color: #64748b;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color, #1e293b);
}

.section-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color, #1e293b);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .icon {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  pointer-events: none;
}

.input-with-icon input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-with-icon input:focus {
  outline: none;
  border-color: var(--primary-color, #004680);
  box-shadow: 0 0 0 3px rgba(0, 70, 128, 0.1);
}

.save-btn {
  background-color: var(--primary-color, #004680);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.save-btn:hover:not(:disabled) {
  background-color: #003366;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-alert {
  background-color: #dcfce7;
  color: #166534;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.error-alert {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color, #004680);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
