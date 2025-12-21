<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { name: 'Dosen', icon: '👨‍🏫', path: '/admin/dosen' },
  { name: 'Events', icon: '📅', path: '/admin/events' },
  { name: 'Fungsionaris', icon: '👥', path: '/admin/fungsionaris' },
  { name: 'Gallery', icon: '🖼️', path: '/admin/gallery' },
  { name: 'Home Content', icon: '🏠', path: '/admin/home' },
  { name: 'Members', icon: '👤', path: '/admin/members' },
  { name: 'News', icon: '📰', path: '/admin/news' },
  { name: 'Organization', icon: '🏢', path: '/admin/organization' },
  { name: 'Projects', icon: '💼', path: '/admin/projects' },
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="title">Admin HMP TI</h2>
      <p class="subtitle">Sistem Manajemen Website</p>
    </div>

    <nav class="nav-menu">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <RouterLink
            :to="item.path"
            class="nav-link"
            :class="{ 'active': isActive(item.path) }"
          >
            <span class="icon">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="footer-label">Login sebagai:</div>
      <div class="user-info">
        <div class="avatar">A</div>
        <div class="details">
          <div class="username">Admin</div>
          <div class="email">admin@hmptiunesa.ac.id</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  background-color: #1f2937; /* gray-800 */
  color: white;
  height: 100vh;
  width: 16rem; /* 64 */
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #374151; /* gray-700 */
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
}

.subtitle {
  font-size: 0.75rem;
  color: #9ca3af; /* gray-400 */
}

.nav-menu {
  margin-top: 1rem;
  flex: 1;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  transition: background-color 0.2s;
  color: white;
  text-decoration: none;
}

.nav-link:hover {
  background-color: #374151; /* gray-700 */
}

.nav-link.active {
  background-color: #2563eb; /* blue-600 */
}

.icon {
  margin-right: 0.75rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #374151; /* gray-700 */
}

.footer-label {
  font-size: 0.75rem;
  color: #9ca3af; /* gray-400 */
  margin-bottom: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: #3b82f6; /* blue-500 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

.details .username {
  font-weight: 500;
}

.details .email {
  font-size: 0.75rem;
  color: #9ca3af; /* gray-400 */
}
</style>
