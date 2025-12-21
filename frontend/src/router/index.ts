import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EventDetailView from '../views/EventDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profil',
      name: 'profile',
      component: () => import('../views/OrganizationView.vue'),
    },
    {
      path: '/galeri',
      name: 'gallery',
      component: () => import('../views/GalleryView.vue'),
    },
    {
      path: '/kegiatan',
      name: 'events',
      component: () => import('../views/EventsView.vue'),
    },
    {
      path: '/kegiatan/:id',
      name: 'event-detail',
      component: EventDetailView,
    },
    {
      path: '/berita',
      name: 'news',
      component: () => import('../views/NewsView.vue'),
    },
    {
      path: '/berita/:id',
      name: 'news-detail',
      component: () => import('../views/NewsDetailView.vue'),
    },
    {
      path: '/fungsionaris',
      name: 'fungsionaris',
      component: () => import('../views/FungsionarisView.vue'),
    },
    {
      path: '/anggota',
      name: 'members',
      component: () => import('../views/MemberView.vue'),
    },
    {
      path: '/dosen',
      name: 'dosen',
      component: () => import('../views/DosenView.vue'),
    },
    {
      path: '/dosen/:id',
      name: 'dosen-detail',
      component: () => import('../views/DosenDetailView.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/user/dashboard',
      name: 'user-dashboard',
      component: () => import('../views/user/UserDashboardView.vue'),
    },
    // Admin Routes
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue'),
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true }, // Add meta field if needed for global guard
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue'),
        },
        // Placeholder for other admin routes
        {
          path: 'dosen',
          name: 'admin-dosen',
          component: () => import('../views/admin/AdminDashboardView.vue'), // Temporary placeholder
        },
        {
          path: 'events',
          name: 'admin-events',
          component: () => import('../views/admin/AdminDashboardView.vue'), // Temporary placeholder
        },
        {
          path: 'fungsionaris',
          name: 'admin-fungsionaris',
          component: () => import('../views/admin/AdminDashboardView.vue'), // Temporary placeholder
        },
        {
          path: 'gallery',
          name: 'admin-gallery',
          component: () => import('../views/admin/AdminDashboardView.vue'), // Temporary placeholder
        },
        {
          path: 'members',
          name: 'admin-members',
          component: () => import('../views/admin/AdminDashboardView.vue'), // Temporary placeholder
        },
        {
          path: 'news',
          name: 'admin-news',
          component: () => import('../views/admin/AdminDashboardView.vue'), // Temporary placeholder
        },
        {
          path: 'projects',
          name: 'admin-projects',
          component: () => import('../views/admin/AdminDashboardView.vue'), // Temporary placeholder
        },
      ]
    }
  ],
})

// Navigation guard untuk route yang memerlukan autentikasi
router.beforeEach((to, from, next) => {
  // Scroll to top pada setiap navigasi
  window.scrollTo(0, 0)
  next()
})

export default router
