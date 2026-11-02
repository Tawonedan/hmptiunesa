# Phase 2 Task List: Frontend Data Layer & Architecture

## 2.1 Dependencies & Supabase Client
- [x] Add `@supabase/supabase-js` to `frontend/package.json`
- [x] Create `frontend/src/lib/supabase.ts` — typed client + `isSupabaseConfigured()` guard
- [x] Update `frontend/.env` to expose `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_FUNCTIONS_URL`

## 2.2 Centralized Site Config & TypeScript Definitions
- [x] Create `frontend/src/types/database.ts` — strongly-typed schemas for all Supabase entities (profiles, site_settings, cabinets, events, news, projects, ospek_content) plus composite joined views
- [x] Create `frontend/src/config/site.ts` — default organization branding, 5-pillar nav links, `memberLevelOrder` / `memberLevelLabel` / `eventStatusLabel` helpers, `buildFallbackSiteSettings()`

## 2.3 Composables
- [x] Refactor `frontend/src/composables/useAuth.ts` → Supabase Auth (session, profile, role, login, logout, refresh; auth-state listener)
- [x] Create `frontend/src/composables/useSiteSettings.ts` — singleton site settings loader with reactive computed helpers (`spotlightMode`, `socialLinks`, `stats`, etc.)
- [x] Create `frontend/src/composables/useEvents.ts` — `fetchUpcoming()` / `fetchArchive()` / `fetchBySlug()`
- [x] Create `frontend/src/composables/useCabinet.ts` — active cabinet + departments + members (joined with department)
- [x] Create `frontend/src/composables/useProjects.ts` — `fetchAll()` + `fetchFeatured(limit)`
- [x] Create `frontend/src/composables/useOspek.ts` — `fetchAll()` + `fetchBySection(sectionType)`

## 2.4 Pinia Stores
- [x] Create `frontend/src/stores/auth.ts` — Pinia wrapper exposing `useAuthStore()` (profile, role, isAdmin, login, logout, refresh)
- [x] Create `frontend/src/stores/siteSettings.ts` — Pinia wrapper exposing `useSiteSettingsStore()` (value, mode, isLoading)

## 2.5 Verification
- [x] `vue-tsc --build` → zero errors in any Phase 2 file (5 pre-existing type errors remain in retired views `DosenDetailView.vue`, `EventsView.vue`, `OrganizationView.vue` — slated for Phase 5 purge)
- [~] `npm run build` → currently blocked by pre-existing broken legacy files (empty `src/data/dosen.json`, retired `DosenView.vue`). Phase 5 will purge these legacy surfaces; once removed, build will succeed.
