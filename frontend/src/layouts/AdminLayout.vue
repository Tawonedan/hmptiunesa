<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSiteSettingsStore } from '@/stores/siteSettings'

const authStore = useAuthStore()
// Store is initialized lazily; no need to call fetch at setup
// Data loads reactively when composables are used in components
</script>

<template>
  <div class="admin-container">
    <!-- Top Bar -->
    <header class="admin-header">
      <div class="admin-logo">
        <img alt="Logo HMPTI" src="@/assets/logo.svg" />
        <span>HMPTI UNESA</span>
      </div>

      <div class="admin-user">
        <span class="muted">{{ authStore.profile?.full_name || 'Admin' }}</span>
        <button @click="authStore.logout" class="btn btn-outline btn-sm">Keluar</button>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <img alt="Logo HMPTI" src="@/assets/logo.svg" class="sidebar-logo" />
        <span>HMPTI UNESA</span>
      </div>
      <ul class="sidebar-nav">
        <li>
          <router-link to="/admin/dashboard" active-class="active">Dashboard</router-link>
        </li>
        <li>
          <router-link to="/admin/events" active-class="active">Kegiatan</router-link>
        </li>
        <li>
          <router-link to="/admin/news" active-class="active">Berita</router-link>
        </li>
        <li>
          <router-link to="/admin/projects" active-class="active">Proyek</router-link>
        </li>
        <li>
          <router-link to="/admin/ospek" active-class="active">Ospek</router-link>
        </li>
        <li>
          <router-link to="/admin/cabinet" active-class="active">Kabinet</router-link>
        </li>
        <li>
          <router-link to="/admin/settings" active-class="active">Setelan</router-link>
        </li>
        <li>
          <router-link to="/admin/accounts" active-class="active">Akun</router-link>
        </li>
        <li class="sidebar-divider"></li>
        <li>
          <router-link to="/" target="_blank" class="public-preview-link">
            <span>Lihat Portal Publik ↗</span>
          </router-link>
        </li>
      </ul>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}
.admin-header {
  background: var(--brand-primary);
  color: var(--text-on-brand);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}
.admin-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.admin-logo img {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
}
.admin-logo span {
  font-weight: 700;
  font-size: 1rem;
}
.admin-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.admin-user .muted {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}
.admin-user button {
  margin-top: 0;
}

.admin-sidebar {
  width: 240px;
  background: var(--surface-dark);
  color: var(--text-on-brand);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  padding: 1rem 0.75rem;
  z-index: 90;
  overflow-y: auto;
}
.sidebar-brand {
  padding: 0.5rem 0 1rem;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1rem;
}
.sidebar-brand img {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
}
.sidebar-brand span {
  font-weight: 700;
  font-size: 1.1rem;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar-nav li {
  margin-bottom: 0.25rem;
}
.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  color: var(--text-on-brand);
  font-size: 0.9rem;
  transition: all 0.15s ease;
  text-decoration: none;
}
.sidebar-nav a:hover,
.sidebar-nav a.active {
  background: var(--brand-primary);
  color: var(--text-on-brand);
}
.sidebar-nav .nav-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}
.sidebar-divider {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}
.public-preview-link {
  color: var(--brand-accent) !important;
  font-weight: 600;
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  padding: 2rem 2rem 1rem;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-sidebar {
    position: relative;
    width: 100%;
    height: auto;
    padding: 1rem;
  }
  .admin-main {
    margin-left: 0;
  }
}
</style>