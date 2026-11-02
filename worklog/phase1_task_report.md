# Phase 1 Task List: Database & Backend (Supabase Migration)

## 1.1 Project Structure Setup
- [x] Create `supabase/` directory with standard layout (`migrations/`, `functions/`, `seed/`, `storage/`)
- [x] Create `supabase/config.toml` for local dev configuration reference
- [x] Create root `.env.example` documenting all required Supabase env vars

## 1.2 Postgres Schema Migrations
- [x] `001_create_profiles.sql` — CMS user profiles & roles
- [x] `002_create_site_settings.sql` — Singleton site config with spotlight_mode
- [x] `003_create_cabinets.sql` — Cabinet periods, departments, members
- [x] `004_create_events.sql` — Events with upcoming/ongoing/completed lifecycle
- [x] `005_create_news.sql` — News/releases with optional event linkage
- [x] `006_create_projects.sql` — Showcase projects with media & contributors
- [x] `007_create_ospek_content.sql` — Ospek schedule, handbooks, resources

## 1.3 Row Level Security (RLS) Policies
- [x] `008_rls_profiles.sql` — Profiles RLS (admin self-manage only)
- [x] `009_rls_site_settings.sql` — Public read-all, admin-only write
- [x] `010_rls_cabinets.sql` — Public read published, admin/editor write
- [x] `011_rls_events.sql` — Public read published, admin/editor write
- [x] `012_rls_news.sql` — Public read published, admin/editor write
- [x] `013_rls_projects.sql` — Public read published, admin/editor write
- [x] `014_rls_ospek_content.sql` — Public read published, admin/editor write

## 1.4 Storage Buckets & Policies
- [x] `supabase/storage/buckets.sql` — Create `public-media` and `documents` buckets
- [x] `supabase/storage/policies.sql` — RLS-style policies for authenticated upload/delete

## 1.5 Edge Functions
- [x] `supabase/functions/contact-submit/index.ts` — Contact form handler (validation, honeypot, rate limit, SMTP)

## 1.6 Seed Scripts
- [x] `supabase/seed/seed_site_settings.sql` — Placeholder site settings row
- [x] `supabase/seed/seed_sample_cabinet.sql` — Sample cabinet, departments, and member cards
- [x] `supabase/seed/seed_sample_events.sql` — Sample events (1 upcoming, 1 archived)
- [x] `supabase/seed/seed_sample_projects.sql` — Sample showcase projects

## 1.7 Legacy Backend Deprecation
- [x] `backend/ARCHIVE_NOTICE.md` — Document why Express/Mongoose BE is retired
- [x] Update `backend/.env.example` removing SMTP credentials (kept only for reference)
