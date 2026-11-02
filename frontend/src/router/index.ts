import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from "@/stores/auth"
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import EventsView from '@/views/EventsView.vue'
import EventDetailView from '@/views/EventDetailView.vue'
import ContactView from '@/views/ContactView.vue'
import SpotlightView from '@/views/SpotlightView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

// Admin views
import AdminLoginView from '@/views/admin/AdminLoginView.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminEventsView from '@/views/admin/AdminEventsView.vue'
import AdminNewsView from '@/views/admin/AdminNewsView.vue'
import AdminProjectsView from '@/views/admin/AdminProjectsView.vue'
import AdminOspekView from '@/views/admin/AdminOspekView.vue'
import AdminCabinetView from '@/views/admin/AdminCabinetView.vue'
import AdminSettingsView from '@/views/admin/AdminSettingsView.vue'
import AdminAccountsView from '@/views/admin/AdminAccountsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public 5-Pillar Portal ───────────────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView,
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: EventDetailView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/spotlight',
      name: 'spotlight',
      component: SpotlightView,
    },

    // ── Admin Portal ───────────────────────────────────────────────────────
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLoginView,
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboardView,
        },
        {
          path: 'events',
          name: 'admin-events',
          component: AdminEventsView,
        },
        {
          path: 'news',
          name: 'admin-news',
          component: AdminNewsView,
        },
        {
          path: 'projects',
          name: 'admin-projects',
          component: AdminProjectsView,
        },
        {
          path: 'ospek',
          name: 'admin-ospek',
          component: AdminOspekView,
        },
        {
          path: 'cabinet',
          name: 'admin-cabinet',
          component: AdminCabinetView,
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: AdminSettingsView,
        },
        {
          path: 'accounts',
          name: 'admin-accounts',
          component: AdminAccountsView,
        },
      ],
    },

    // ── 404 — all retired public routes land here ────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0)
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      next(`/admin/login?redirect=${to.path}`)
      return
    }

    const requiredRole = to.meta.role as string | undefined
    if (requiredRole && authStore.role !== requiredRole && authStore.role !== 'admin') {
      next('/admin/login')
      return
    }
  }

  next()
})

export default router
