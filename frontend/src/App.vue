<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { useSiteSettings } from '@/composables/useSiteSettings'
import { primaryNavLinks } from '@/config/site'

const route = useRoute()
const { settings, organizationAbbr, cabinetName, tagline, socialLinks } = useSiteSettings()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const isMenuOpen = ref(false)

const toggleMenu = (): void => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : ''
}

const closeMenu = (): void => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const currentYear = new Date().getFullYear()

// Close mobile menu on route change
const stopRouteWatch = () => {
  // noop; route is reactive so we just close when path changes via watch below
}

onMounted(() => {
  // Auto-close drawer whenever navigation happens
  const unwatch = () => closeMenu()
  // Use a small reactive subscription via the route object
  // (vue-router does not expose watch here; we use a click delegation fallback)
  document.addEventListener('click', unwatch)
  onBeforeUnmount(() => document.removeEventListener('click', unwatch))
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  stopRouteWatch()
})

const socialItems = computed(() => {
  const s = socialLinks.value
  const items: { label: string; href: string; icon: string }[] = []
  if (s.instagram) items.push({ label: 'Instagram', href: s.instagram, icon: 'instagram' })
  if (s.linkedin) items.push({ label: 'LinkedIn', href: s.linkedin, icon: 'linkedin' })
  if (s.youtube) items.push({ label: 'YouTube', href: s.youtube, icon: 'youtube' })
  if (s.github) items.push({ label: 'GitHub', href: s.github, icon: 'github' })
  if (s.tiktok) items.push({ label: 'TikTok', href: s.tiktok, icon: 'tiktok' })
  return items
})
</script>

<template>
  <div class="app-shell">
    <!-- Public Header (hidden on /admin/*) -->
    <header v-if="!isAdminRoute" class="public-header">
      <div class="container header-inner">
        <RouterLink to="/" class="brand" @click="closeMenu">
          <img alt="Logo HMPTI" class="brand-logo" src="@/assets/logo.svg" />
          <div class="brand-text">
            <strong>{{ organizationAbbr }}</strong>
            <span>{{ cabinetName }}</span>
          </div>
        </RouterLink>

        <nav class="primary-nav" aria-label="Navigasi utama">
          <RouterLink
            v-for="link in primaryNavLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            active-class="is-active"
            exact-active-class="is-exact"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <button
          class="hamburger"
          :class="{ 'is-active': isMenuOpen }"
          aria-label="Buka menu"
          @click.stop="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile drawer -->
      <div class="drawer-backdrop" :class="{ 'is-open': isMenuOpen }" @click="closeMenu"></div>
      <aside class="drawer" :class="{ 'is-open': isMenuOpen }" aria-label="Menu mobile">
        <RouterLink
          v-for="link in primaryNavLinks"
          :key="link.to"
          :to="link.to"
          class="drawer-link"
          @click="closeMenu"
        >
          {{ link.label }}
        </RouterLink>
      </aside>
    </header>

    <main :class="['public-main', { 'with-nav': !isAdminRoute }]">
      <RouterView />
    </main>

    <!-- Public Footer (hidden on /admin/*) -->
    <footer v-if="!isAdminRoute" class="public-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="footer-brand-row">
            <img alt="Logo HMPTI" class="footer-logo" src="@/assets/logo.svg" />
            <h3>{{ settings.organization_name }}</h3>
          </div>
          <p class="footer-tagline" v-if="tagline">"{{ tagline }}"</p>
          <p class="footer-address" v-if="settings.secretariat_address">
            {{ settings.secretariat_address }}
          </p>
        </div>

        <div class="footer-col">
          <h4>Navigasi</h4>
          <ul>
            <li v-for="link in primaryNavLinks" :key="link.to">
              <RouterLink :to="link.to">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Kontak</h4>
          <ul class="contact-list">
            <li v-if="settings.contact_email">
              <span class="muted">Email</span>
              <a :href="`mailto:${settings.contact_email}`">{{ settings.contact_email }}</a>
            </li>
            <li v-if="socialLinks.email && socialLinks.email !== settings.contact_email">
              <span class="muted">Email Alt.</span>
              <a :href="`mailto:${socialLinks.email}`">{{ socialLinks.email }}</a>
            </li>
          </ul>

          <div v-if="socialItems.length" class="social-row">
            <a
              v-for="s in socialItems"
              :key="s.icon"
              :href="s.href"
              target="_blank"
              rel="noopener"
              :aria-label="s.label"
              :title="s.label"
              class="social-chip"
            >
              {{ s.label[0] }}
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <span>© {{ currentYear }} {{ settings.organization_name }}.</span>
          <span class="muted">All rights reserved.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.public-main {
  flex: 1;
}
.public-main.with-nav {
  padding-top: var(--nav-height);
}

/* ── Header ────────────────────────────────────────────────────────────── */

.public-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border-subtle);
  z-index: 50;
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
}
.brand-logo {
  width: 38px;
  height: 38px;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.brand-text strong {
  font-size: 1rem;
  letter-spacing: -0.01em;
  color: var(--brand-primary);
}
.brand-text span {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.primary-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nav-link {
  position: relative;
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.15s ease;
}
.nav-link:hover {
  color: var(--text-primary);
  background: var(--surface-muted);
}
.nav-link.is-active {
  color: var(--brand-primary);
}
.nav-link.is-active::after {
  content: '';
  position: absolute;
  left: 0.85rem;
  right: 0.85rem;
  bottom: 0.25rem;
  height: 2px;
  background: var(--brand-accent);
  border-radius: 1px;
}

.hamburger {
  display: none;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
}
.hamburger span {
  position: absolute;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition:
    transform 0.25s ease,
    opacity 0.2s ease;
}
.hamburger span:nth-child(1) {
  top: 13px;
}
.hamburger span:nth-child(2) {
  top: 19px;
}
.hamburger span:nth-child(3) {
  top: 25px;
}
.hamburger.is-active span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.hamburger.is-active span:nth-child(2) {
  opacity: 0;
}
.hamburger.is-active span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* ── Mobile drawer ─────────────────────────────────────────────────────── */

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
  z-index: 49;
}
.drawer-backdrop.is-open {
  opacity: 1;
  pointer-events: auto;
}
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(320px, 85vw);
  background: var(--surface-card);
  z-index: 60;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  padding: calc(var(--nav-height) + 1rem) 1.5rem 1.5rem;
  gap: 0.25rem;
  box-shadow: var(--shadow-lg);
}
.drawer.is-open {
  transform: translateX(0);
}
.drawer-link {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-weight: 500;
}
.drawer-link:hover {
  background: var(--surface-muted);
}

/* ── Footer ────────────────────────────────────────────────────────────── */

.public-footer {
  background: var(--brand-primary);
  color: #cbd5e1;
  margin-top: 4rem;
}
.public-footer h3,
.public-footer h4 {
  color: var(--text-on-brand);
  margin: 0 0 0.75rem;
}
.public-footer h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1.2fr;
  gap: 2.5rem;
  padding: 3rem 1.25rem 2rem;
}
.footer-brand-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.footer-logo {
  width: 44px;
  height: 44px;
}
.footer-tagline {
  margin-top: 0.75rem;
  color: #e2e8f0;
  font-style: italic;
}
.footer-address {
  margin-top: 0.75rem;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
}
.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.footer-col li {
  font-size: 0.92rem;
}
.footer-col a {
  color: #cbd5e1;
}
.footer-col a:hover {
  color: var(--text-on-brand);
}
.contact-list li {
  display: flex;
  flex-direction: column;
}
.contact-list .muted {
  color: #64748b;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.social-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
.social-chip {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-on-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}
.social-chip:hover {
  background: var(--brand-accent);
  color: var(--text-on-brand);
}
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 0;
  font-size: 0.85rem;
  color: #94a3b8;
}
.footer-bottom .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* ── Responsive ────────────────────────────────────────────────────────── */

@media (max-width: 860px) {
  .primary-nav {
    display: none;
  }
  .hamburger {
    display: inline-flex;
  }
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .brand-text span {
    display: none;
  }
}
</style>
