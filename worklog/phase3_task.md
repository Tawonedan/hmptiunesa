# Phase 3 Task List: Public Portal (5 Pillars)

## 3.1 Global Shell & Navigation (`App.vue` + `pillars.css`)
- [x] Create `frontend/src/assets/pillars.css` — design tokens, button/card/section/badge utility classes
- [x] Rewrite `frontend/src/App.vue` — public header with exactly 5 links (`/`, `/about`, `/events`, `/contact`, `/spotlight`), mobile drawer with hamburger toggle + backdrop, premium footer with social chips
- [x] Remove student login/register/user-dropdown from public navbar (now admin-only at `/admin/login`)
- [x] Register `pillars.css` in `main.ts`

## 3.2 Home Page (`HomeView.vue`)
- [x] Hero with organization name, cabinet name, period, tagline
- [x] Primary CTAs (`Jelajahi Kegiatan`, `Tentang Kami`, `Spotlight`)
- [x] Stats strip (departments, completed programs, active committee)
- [x] Upcoming events highlights (up to 3 cards)
- [x] Featured showcase projects (up to 3 cards)
- [x] CTA band → `/contact`

## 3.3 About Page (`AboutView.vue`)
- [x] Hero band with cabinet name + history
- [x] Vision & Mission cards (parsed from multi-line mission text)
- [x] Cabinet structure grid with department + hierarchy level filters
- [x] Member cards (avatar placeholder, name, role, level, dept, LinkedIn/GitHub links only — no PII)
- [x] Departments grid (5 cards with code + description)
- [x] Cabinet history list (archived periods)

## 3.4 Events & Activities (`EventsView.vue` + `EventDetailView.vue`)
- [x] Dual-tab view: `Mendatang & Berlangsung` vs `Arsip & Dokumentasi` with live counts
- [x] Category-tinted poster gradient (workshop/seminar/competition/social/general)
- [x] Status badge (upcoming/ongoing/completed/cancelled)
- [x] Event detail page at `/events/:id` — full schedule, location, contact, registration CTA, description, gallery, outcome notes, press release, public docs
- [x] Back-navigation + 404 fallback

## 3.5 Reach Us (`ContactView.vue`)
- [x] Channels list (Instagram, LinkedIn, YouTube, GitHub, TikTok, Email)
- [x] Secretariat address + responsive Google Maps embed
- [x] Contact form with client-side validation matching `contact-submit` edge function
- [x] Honeypot field (`website`, visually hidden, screen-reader-hidden)
- [x] Client-side rate-limit cooldown (30s mirror of server)
- [x] Success / error feedback alerts
- [x] Posts to `${VITE_SUPABASE_FUNCTIONS_URL}/contact-submit`

## 3.6 Spotlight (`SpotlightView.vue`)
- [x] Reactive `mode` computed from `site_settings.spotlight_mode`
- [x] `showcase` mode: project grid with category/tags + click-through modal (description, contributors, achievements, demo/repo links)
- [x] `ospek` mode: sectioned groups (schedule, announcement, handbook, group_info, task_link, resource_link) with section icons
- [x] Visible mode indicator noting CMS can switch without rebuild

## 3.7 Router Overhaul (`router/index.ts`)
- [x] 6 public routes (`/`, `/about`, `/events`, `/events/:id`, `/contact`, `/spotlight`)
- [x] Admin routes preserved (`/admin/login` + 4 admin children) for Phase 4
- [x] Catch-all 404 handler at `/:pathMatch(.*)*` → `NotFoundView.vue`
- [x] Retired public routes (`/profil`, `/dosen`, `/kegiatan`, `/galeri`, `/berita`, `/fungsionaris`, `/anggota`, `/projects`, `/login`, `/register`, `/verify-email`, `/user/*`) all fall through to 404
- [x] `scrollBehavior` + `beforeEach` to ensure scroll-to-top

## 3.8 Data Layer: Mock Seed Adapter
- [x] Create `frontend/src/mock/seed.ts` mirroring `supabase/seed/*.sql` fixtures
- [x] Wire composables (`useSiteSettings`, `useEvents`, `useCabinet`, `useProjects`, `useOspek`) to fall back to seed data when Supabase is not configured

## 3.9 New View: NotFound (`NotFoundView.vue`)
- [x] Friendly 404 page with branding, CTA back home + to contact

## 3.10 Verification
- [x] `vue-tsc --build` → 0 errors in any Phase 3 file (3 pre-existing errors remain in retired legacy files `DosenDetailView.vue` + `OrganizationView.vue` + `EventsView.vue` — slated for Phase 5 purge)

## Notes / Trade-offs
- Public shell currently re-uses a small subset of legacy global CSS variables from `App.vue`. Full visual polish / motion library / dark mode can land in Phase 5.
- Contact form's edge-function URL is read from `VITE_SUPABASE_FUNCTIONS_URL` (auto-derived from project URL). Without Supabase, the form will surface a network error — that's expected and signals wiring.
- Spotlight `mode` is a derived `computed` from `settings.spotlight_mode`; no Phase 4 work needed to make the toggle live — it already reactively swaps on the next site_settings fetch.
