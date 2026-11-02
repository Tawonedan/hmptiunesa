# Phase 4 Task List: Admin CMS Portal Refactoring

## 4.1 Admin Auth & Navigation Guard
- [x] Dedicated login page at `/admin/login` using Supabase Auth ([AdminLoginView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminLoginView.vue))
- [x] Navigation guard in [router/index.ts](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/router/index.ts) verifying `useAuthStore().isAuthenticated` and role permissions
- [x] Modern admin layout shell with responsive sidebar and link back to public portal ([AdminLayout.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/layouts/AdminLayout.vue))

## 4.2 CMS Modules
- [x] **Dashboard (`/admin/dashboard`)**: Summary metrics for upcoming activities, showcase projects, and ospek content ([AdminDashboardView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminDashboardView.vue))
- [x] **Site Settings & Spotlight Switcher (`/admin/settings`)**: Organization identity, cabinet period, contact information, and **Spotlight Mode Switcher** (`showcase` vs `ospek`) live database toggle ([AdminSettingsView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminSettingsView.vue))
- [x] **Events & Activities (`/admin/events`)**: Complete CRUD, publish toggle, and category/status management replacing legacy Axios/MongoDB calls ([AdminEventsView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminEventsView.vue))
- [x] **News & Releases (`/admin/news`)**: Independent article publication, edit modal, and status management ([AdminNewsView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminNewsView.vue))
- [x] **Showcase Projects (`/admin/projects`)**: Student innovation curation, tags, featured status toggle for homepage highlights ([AdminProjectsView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminProjectsView.vue))
- [x] **PKKMB / Ospek Content (`/admin/ospek`)**: Schedule, handbook, announcements, and group link management with sort ordering ([AdminOspekView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminOspekView.vue))
- [x] **Cabinet & Members (`/admin/cabinet`)**: Multi-tab management for active cabinet vision/mission, departments, and public member roster ([AdminCabinetView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminCabinetView.vue))
- [x] **CMS Accounts (`/admin/accounts`)**: User roles and access management (`admin` / `editor`) ([AdminAccountsView.vue](file:///d:/Neo_Newie/Projects/web_hmptiunesa/frontend/src/views/admin/AdminAccountsView.vue))

## 4.3 Verification
- [x] All Phase 4 admin components compile with zero TypeScript errors.
- [x] `vite build` succeeds with zero errors and zero warnings (`✓ built in 4.53s`).
