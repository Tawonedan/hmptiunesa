# Phase 5 Task List: Privacy, Retirement & Cleanup

## 5.1 Route & Codebase Purge
- [x] Deleted retired public views:
  - `frontend/src/views/DosenView.vue`
  - `frontend/src/views/DosenDetailView.vue`
  - `frontend/src/views/MemberView.vue`
  - `frontend/src/views/LoginView.vue`
  - `frontend/src/views/RegisterView.vue`
  - `frontend/src/views/VerifyEmailView.vue`
  - `frontend/src/views/FungsionarisView.vue`
  - `frontend/src/views/GalleryView.vue`
  - `frontend/src/views/OrganizationView.vue`
  - `frontend/src/views/NewsView.vue`
  - `frontend/src/views/NewsDetailView.vue`
  - `frontend/src/views/ProjectsView.vue`
  - `frontend/src/views/user/` (all student dashboard and profile views)
- [x] Deleted retired admin views:
  - `frontend/src/views/admin/AdminDosenView.vue`
  - `frontend/src/views/admin/AdminMembersView.vue`
  - `frontend/src/views/admin/AdminGalleryView.vue`
  - `frontend/src/views/admin/AdminFungsionarisView.vue`
- [x] Deleted lingering React / JSX files:
  - `frontend/src/App.jsx`
  - `frontend/src/layouts/AdminLayout.jsx`
  - `frontend/src/pages/`
  - `frontend/src/components/admin/FileUploader.jsx`
  - `frontend/src/components/admin/Sidebar.jsx`
- [x] Deleted stale/empty mock JSON fixtures:
  - `frontend/src/data/`
- [x] Removed unused Vite scaffold components (`HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`)

## 5.2 Verification & Build Health
- [x] `vue-tsc --build` (`npm run type-check`): **0 errors** across the entire TypeScript project.
- [x] `vite build` (`npm run build-only`): **0 errors and 0 warnings**.
- [x] Full production pipeline (`npm run build`): **Passes with exit code 0** in 2.8s.
- [x] All 5 public pillars and 8 Admin CMS modules remain clean, fully typed, and verified.
