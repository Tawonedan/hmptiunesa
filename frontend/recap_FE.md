# Frontend Architecture & Views Recap - HMP TI UNESA

## 1. Overview & Technology Stack
The frontend of **HMP TI UNESA** is a modern Single Page Application (SPA) built using **Vue.js 3** with the **Composition API** (`<script setup>`) and **TypeScript**. It delivers a dynamic UI with a public-facing organization portal, authenticated student area, and an administration dashboard (CMS).

### Tech Stack
* **Framework**: Vue.js 3 (Composition API / `<script setup>`)
* **Language**: TypeScript (`~5.8.0`)
* **Build Tool & Dev Server**: Vite (`^6.2.4`)
* **Routing**: Vue Router 4 (`^4.5.0`)
* **State Management**: Pinia (`^3.0.1`)
* **HTTP Client**: Axios (`^1.9.0`)
* **Styling**: Vanilla CSS & modern utility classes (`src/assets/main.css`, `src/assets/base.css`)
* **Code Quality & Tooling**: ESLint 9 (`@vue/eslint-config-typescript`), Prettier, `vue-tsc`

---

## 2. Directory Structure Breakdown

```
frontend/
├── public/                       # Static public assets (favicons, icons)
├── src/
│   ├── assets/                   # Global CSS stylesheets and static media
│   │   ├── base.css              # Base color variables and typography
│   │   ├── main.css              # Global styling & layout resets
│   │   ├── hero/                 # Hero section imagery
│   │   ├── kahim/                # Leadership photos
│   │   └── kegiatan/             # Event graphics
│   ├── components/               # Shared, reusable UI components
│   │   ├── admin/                # Admin CMS components (Sidebar, Uploader)
│   │   │   ├── AdminSidebar.vue
│   │   │   ├── FileUploader.jsx
│   │   │   └── Sidebar.jsx
│   │   └── icons/                # SVG vector icon components
│   ├── composables/              # Reusable stateful logic
│   │   └── useAuth.ts            # Authentication state & helper functions
│   ├── data/                     # Local fallback / mock JSON datasets
│   │   ├── dosen.json            # Mock faculty data
│   │   ├── events.json           # Mock event listings
│   │   ├── fungsionaris.json     # Mock cabinet structure
│   │   ├── gallery.json          # Mock media items
│   │   ├── home.json             # Mock landing page statistics & copy
│   │   ├── members.json          # Mock member roster
│   │   ├── news.json             # Mock news articles
│   │   ├── organization.json     # Mock organizational profile
│   │   └── projects.json         # Mock student showcase
│   ├── layouts/                  # Layout wrappers
│   │   ├── AdminLayout.vue       # Admin sidebar & header shell
│   │   └── AdminLayout.jsx       # Alternative/legacy JSX layout wrapper
│   ├── router/                   # Client-side routing configuration
│   │   └── index.ts              # Route definitions & navigation hooks
│   ├── scripts/                  # Helper scripts
│   │   └── update_photos.py      # Batch photo processing utility
│   ├── stores/                   # Pinia state stores
│   │   └── counter.ts            # Example/template Pinia store
│   ├── views/                    # View pages mapped to routes
│   │   ├── admin/                # Admin CMS pages
│   │   ├── user/                 # Authenticated student pages
│   │   └── *.vue                 # Public view pages
│   ├── App.vue                   # Root Vue component with Navbar & Footer
│   ├── env.d.ts                  # Vite client type declarations
│   ├── main.ts                   # Application bootstrap & plugin mounting
│   └── shims-vue.d.ts            # Vue SFC TypeScript shim
├── .env                          # Frontend environment variables
├── index.html                    # HTML entry template
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build and plugin configuration
```

---

## 3. Key Features & Architecture

1. **Public Information Portal**:
   - **Hero & Organization Profile**: Comprehensive vision, mission, and cabinet history.
   - **Events Hub**: Listing of upcoming and past workshops, seminars, and organizational events with full detail pages.
   - **Newsroom**: Searchable news feed with categories and detail views.
   - **Galleries & Showcases**: Photo/video gallery and student project portfolios.
   - **Academic Directory**: Faculty and student member listings with expertise search.

2. **User Area & Authentication**:
   - Authentication flows: Student registration, JWT login, OTP email verification.
   - Student Dashboard & Profile settings for managing participation and personal info.

3. **Admin CMS Panel (`/admin`)**:
   - Dedicated management shell with sidebar navigation.
   - Complete CRUD management for Dosen, Events, Functionaries, Gallery, Members, News, and Projects.

4. **Resilient Data Strategy (Hybrid API / Mock Fallback)**:
   - Views are designed to fetch from the Express backend via Axios, but also bundle pre-configured JSON datasets in `src/data/` as fallback data during offline development or API downtime.

---

## 4. Complete Views & Route Inventory

### 🌐 4.1 Public Routes
| Route Path | Route Name | Component | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `home` | `HomeView.vue` | Public | Landing page with highlights, stats, events, news & gallery preview |
| `/profil` | `profile` | `OrganizationView.vue` | Public | Organization history, vision, mission, and structure |
| `/galeri` | `gallery` | `GalleryView.vue` | Public | Media gallery with categorized photos and activity documentation |
| `/kegiatan` | `events` | `EventsView.vue` | Public | Event catalog with category filters and registration links |
| `/kegiatan/:id` | `event-detail` | `EventDetailView.vue` | Public | Detailed event info, schedules, and registration form |
| `/berita` | `news` | `NewsView.vue` | Public | News index with search bar and category filters |
| `/berita/:id` | `news-detail` | `NewsDetailView.vue` | Public | Full news article reading view with view counter |
| `/fungsionaris` | `fungsionaris` | `FungsionarisView.vue` | Public | Cabinet board hierarchy, departments, and officer profiles |
| `/anggota` | `members` | `MemberView.vue` | Public | Student member directory with batch and department filters |
| `/dosen` | `dosen` | `DosenView.vue` | Public | Informatics faculty directory with research expertise |
| `/dosen/:id` | `dosen-detail` | `DosenDetailView.vue` | Public | In-depth lecturer academic profile, courses, and publications |
| `/projects` | `projects` | `ProjectsView.vue` | Public | Showcase of student-built applications, repos, and tech stacks |

### 🔐 4.2 Authentication & User Routes
| Route Path | Route Name | Component | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | `login` | `LoginView.vue` | Public | Student / User login form |
| `/register` | `register` | `RegisterView.vue` | Public | Account registration form with NIM validation |
| `/verify-email` | `verify-email` | `VerifyEmailView.vue` | Public | Email OTP verification screen |
| `/user/dashboard` | `user-dashboard` | `UserDashboardView.vue` | Authenticated | Registered student dashboard and registered event list |
| `/user/profil` | `user-profile` | `UserProfileView.vue` | Authenticated | Profile information and password update interface |

### 🛠️ 4.3 Admin CMS Routes (`/admin/*`)
All admin routes are nested under the `AdminLayout.vue` layout wrapper.

| Route Path | Route Name | Component | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/admin/login` | `admin-login` | `AdminLoginView.vue` | Public/Admin | Dedicated administration login screen |
| `/admin/dashboard` | `admin-dashboard` | `AdminDashboardView.vue` | Admin / Pengurus | High-level statistics, quick actions, recent logs |
| `/admin/dosen` | `admin-dosen` | `AdminDosenView.vue` | Admin / Pengurus | CRUD management for faculty members and expertise tags |
| `/admin/events` | `admin-events` | `AdminEventsView.vue` | Admin / Pengurus | Event creation, editing, scheduling, and registrant list |
| `/admin/fungsionaris`| `admin-fungsionaris` | `AdminFungsionarisView.vue` | Admin / Pengurus | Cabinet member roster & department structure manager |
| `/admin/gallery` | `admin-gallery` | `AdminGalleryView.vue` | Admin / Pengurus | Photo/video uploader and featured highlight manager |
| `/admin/members` | `admin-members` | `AdminMembersView.vue` | Admin / Pengurus | Student member database management |
| `/admin/news` | `admin-news` | `AdminNewsView.vue` | Admin / Pengurus | Rich article editor, publication status, category manager |
| `/admin/projects` | `admin-projects` | `AdminProjectsView.vue` | Admin / Pengurus | Student project showcase management & approval |

---

## 5. Environment Variables & Run Commands

### Required `.env` Keys
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### NPM Scripts
* `npm run dev`: Starts the Vite local development server (defaults to `http://localhost:5173`).
* `npm run build`: Type-checks with `vue-tsc` and bundles production assets into `dist/`.
* `npm run preview`: Previews the production build locally.
* `npm run type-check`: Validates TypeScript typing across all `.vue` and `.ts` files.
* `npm run lint`: Runs ESLint with auto-fix enabled.
* `npm run format`: Formats code across `src/` using Prettier.
