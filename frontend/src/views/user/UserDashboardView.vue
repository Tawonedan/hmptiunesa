<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('Anggota') // In a real app, get this from store/auth

onMounted(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (isLoggedIn !== 'true') {
    router.push('/login')
  }
})

const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <div class="welcome-section">
        <h1>Selamat Datang, <span>{{ username }}</span>! 👋</h1>
        <p>Akses berbagai layanan dan informasi khusus anggota HMP TI UNESA di sini.</p>
      </div>

      <div class="dashboard-grid">
        <!-- Card 1: Profil -->
        <div class="dashboard-card" @click="router.push('/profil')">
          <div class="card-icon">👤</div>
          <h3>Profil Saya</h3>
          <p>Lihat dan atur informasi profil anggota Anda.</p>
        </div>

        <!-- Card 2: Kegiatan -->
        <div class="dashboard-card" @click="router.push('/kegiatan')">
          <div class="card-icon">📅</div>
          <h3>Kegiatan Saya</h3>
          <p>Cek riwayat kepanitiaan dan kegiatan yang Anda ikuti.</p>
        </div>

        <!-- Card 3: Forum -->
        <div class="dashboard-card">
          <div class="card-icon">💬</div>
          <h3>Forum Diskusi</h3>
          <p>Berdiskusi dengan sesama anggota HMP TI.</p>
          <span class="badge">Segera Hadir</span>
        </div>

        <!-- Card 4: Dokumen -->
        <div class="dashboard-card">
          <div class="card-icon">📂</div>
          <h3>Arsip Dokumen</h3>
          <p>Akses bank soal, materi kuliah, dan dokumen organisasi.</p>
          <span class="badge">Segera Hadir</span>
        </div>
      </div>

      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn">Keluar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 80vh;
  padding: 4rem 2rem;
  background-color: var(--background-light);
  display: flex;
  justify-content: center;
}

.dashboard-content {
  max-width: 1000px;
  width: 100%;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.welcome-section h1 span {
  color: var(--secondary-color);
}

.welcome-section p {
  color: var(--text-light);
  font-size: 1.1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.dashboard-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: var(--secondary-color);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.dashboard-card h3 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.dashboard-card p {
  color: var(--text-light);
  font-size: 0.9rem;
  line-height: 1.5;
}

.badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #fce7f3;
  color: #be185d;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 600;
}

.logout-section {
  text-align: center;
}

.logout-btn {
  background-color: transparent;
  border: 2px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #ef4444;
  color: white;
}

@media (max-width: 768px) {
  .welcome-section h1 {
    font-size: 2rem;
  }
}
</style>
