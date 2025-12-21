<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import AdminSidebar from '../components/admin/AdminSidebar.vue'

const router = useRouter()

onMounted(() => {
  // Check admin authentication
  const isLoggedIn = localStorage.getItem('adminLoggedIn')
  if (isLoggedIn !== 'true') {
    router.push('/admin/login')
  }
})
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="main-content">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6; /* gray-100 */
}

.main-content {
  flex: 1;
  margin-left: 16rem; /* Match sidebar width */
}

.content-wrapper {
  padding: 2rem;
}
</style>
