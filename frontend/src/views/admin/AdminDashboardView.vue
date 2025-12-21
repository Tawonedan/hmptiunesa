<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Define interface for stats
interface Stats {
  dosen: number
  events: number
  fungsionaris: number
  gallery: number
  members: number
  news: number
  projects: number
}

const stats = ref<Stats>({
  dosen: 0,
  events: 0,
  fungsionaris: 0,
  gallery: 0,
  members: 0,
  news: 0,
  projects: 0
})

const menuItems = [
  { name: 'Dosen', icon: '👨‍🏫', path: '/admin/dosen', key: 'dosen' },
  { name: 'Events', icon: '📅', path: '/admin/events', key: 'events' },
  { name: 'Fungsionaris', icon: '👥', path: '/admin/fungsionaris', key: 'fungsionaris' },
  { name: 'Gallery', icon: '🖼️', path: '/admin/gallery', key: 'gallery' },
  { name: 'Members', icon: '👤', path: '/admin/members', key: 'members' },
  { name: 'News', icon: '📰', path: '/admin/news', key: 'news' },
  { name: 'Projects', icon: '💼', path: '/admin/projects', key: 'projects' }
]

const recentActivity = [
  { icon: '✓', color: 'text-green-500', text: 'Event baru ditambahkan: LKMM TD', time: '1 jam yang lalu' },
  { icon: '✎', color: 'text-blue-500', text: 'Data dosen diperbarui: Dr. Yuni Yamasari', time: '3 jam yang lalu' },
  { icon: '✕', color: 'text-red-500', text: 'Foto dihapus dari galeri: Workshop UI/UX', time: '1 hari yang lalu' }
]

const handleLogout = () => {
  localStorage.removeItem('adminLoggedIn')
  router.push('/admin/login')
}

onMounted(() => {
  // Simulate fetching stats
  // In production, replace with actual API call
  stats.value = {
    dosen: 12,
    events: 2,
    fungsionaris: 34,
    gallery: 16,
    members: 120,
    news: 10,
    projects: 5
  }
})
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="page-title">Admin Dashboard HMP TI</h1>
      <button @click="handleLogout" class="logout-btn">
        Logout
      </button>
    </div>

    <h2 class="welcome-text">Selamat Datang di Panel Admin</h2>
    
    <!-- Stats Grid -->
    <div class="stats-grid">
      <RouterLink
        v-for="item in menuItems"
        :key="item.name"
        :to="item.path"
        class="stat-card"
      >
        <div class="card-content">
          <div class="card-header">
            <div class="card-icon">{{ item.icon }}</div>
            <div class="card-count">{{ stats[item.key as keyof Stats] }}</div>
          </div>
          <h3 class="card-title">{{ item.name }}</h3>
          <p class="card-subtitle">Kelola {{ item.name }}</p>
        </div>
      </RouterLink>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <h3 class="section-title">Aktivitas Terbaru</h3>
      <div class="activity-list">
        <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
          <span :class="['activity-icon', activity.color]">{{ activity.icon }}</span>
          <span class="activity-text">{{ activity.text }}</span>
          <span class="activity-time">{{ activity.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.logout-btn {
  background-color: #1d4ed8; /* blue-700 */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #1e40af; /* blue-800 */
}

.welcome-text {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #374151;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.card-content {
  padding: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-icon {
  font-size: 1.875rem;
}

.card-count {
  font-size: 1.5rem;
  font-weight: 700;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #4b5563; /* gray-600 */
  margin-top: 0.25rem;
}

.activity-section {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  margin-right: 0.75rem;
  font-weight: 700;
}

.text-green-500 { color: #22c55e; }
.text-blue-500 { color: #3b82f6; }
.text-red-500 { color: #ef4444; }

.activity-text {
  flex: 1;
}

.activity-time {
  font-size: 0.875rem;
  color: #6b7280; /* gray-500 */
  margin-left: auto;
}
</style>
