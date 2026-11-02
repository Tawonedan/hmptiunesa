# HMPTI UNESA Website

A public portfolio and information hub for **Himpunan Mahasiswa Prodi Teknik Informatika (HMPTI) Universitas Negeri Surabaya**.

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite + Pinia |
| Database | Supabase (Postgres + RLS) |
| Authentication | Supabase Auth (CMS accounts only — no public sign-up) |
| Storage | Supabase Storage (`public-media`, `documents` buckets) |
| Email | Supabase Edge Function + Resend API |

> The original Express/MongoDB backend is **deprecated**. See [`backend/ARCHIVE_NOTICE.md`](./backend/ARCHIVE_NOTICE.md) for details.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier is sufficient for development)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional for local dev)

### 1. Clone & Install

```bash
git clone <repo-url>
cd web_hmptiunesa/frontend
npm install
```

### 2. Configure Environment Variables

```bash
# In /frontend:
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> ⚠️ **Never use the `service_role` key** in the frontend — only the `anon` publishable key.

### 3. Apply Database Migrations

In your Supabase Dashboard → SQL Editor, run the migration files in order:

```
supabase/migrations/001_create_profiles.sql
supabase/migrations/002_create_site_settings.sql
supabase/migrations/003_create_cabinets.sql
supabase/migrations/004_create_events.sql
supabase/migrations/005_create_news.sql
supabase/migrations/006_create_projects.sql
supabase/migrations/007_create_ospek_content.sql
supabase/migrations/008_rls_profiles.sql
supabase/migrations/009_rls_site_settings.sql
supabase/migrations/010_rls_cabinets.sql
supabase/migrations/011_rls_events.sql
supabase/migrations/012_rls_news.sql
supabase/migrations/013_rls_projects.sql
supabase/migrations/014_rls_ospek_content.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 4. Seed Development Data (Optional)

Run seed files in the Supabase Dashboard SQL Editor:

```
supabase/seed/seed_site_settings.sql
supabase/seed/seed_sample_cabinet.sql
supabase/seed/seed_sample_events.sql
supabase/seed/seed_sample_projects.sql
```

### 5. Configure Storage Buckets

Run in the Supabase Dashboard SQL Editor:

```
supabase/storage/buckets.sql
supabase/storage/policies.sql
```

### 6. Deploy Edge Function (Contact Form)

```bash
supabase functions deploy contact-submit
```

Set the required secrets in Supabase Dashboard → Edge Functions → Secrets:

```
RESEND_API_KEY    — your Resend API key
SMTP_FROM         — "HMPTI UNESA <noreply@hmptiunesa.ac.id>"
CONTACT_TO        — organization inbox email
ALLOWED_ORIGIN    — your frontend domain
```

### 7. Create First Admin Account

In the Supabase Dashboard:
1. Go to **Authentication → Users → Invite User**
2. After the user sets their password, run:

```sql
INSERT INTO public.profiles (id, full_name, role)
VALUES ('<user-uuid-from-auth>', 'Admin HMPTI', 'admin');
```

### 8. Run Frontend

```bash
cd frontend
npm run dev
```

---

## Project Structure

```
web_hmptiunesa/
├── frontend/          # Vue 3 + TypeScript SPA
├── supabase/
│   ├── migrations/    # Postgres DDL (run in order)
│   ├── storage/       # Bucket defs & object policies
│   ├── functions/     # Supabase Edge Functions
│   │   └── contact-submit/
│   └── seed/          # Dev placeholder data
├── backend/           # DEPRECATED — Express/Mongoose (archived)
│   └── ARCHIVE_NOTICE.md
├── .env.example       # Environment variables reference
└── prd.md             # Product Requirements Document
```

---

## Public Information Architecture

| Page | Route | Description |
|---|---|---|
| Home | `/` | HMPTI branding, highlights, stats, latest updates |
| About | `/about` | History, vision, mission, cabinet, departments |
| Events & Activities | `/events`, `/events/:id` | Upcoming/archived activities with documentation |
| Reach Us | `/contact` | Official channels, contact form, location |
| Spotlight | `/spotlight` | Student showcase (default) or Ospek hub (seasonal) |

Spotlight mode is controlled via **Admin CMS → Site Settings** without a frontend rebuild.

---

## Deployment Notes

- The frontend SPA requires a **rewrite rule** on your hosting provider so all routes serve `index.html`.
- The Supabase `anon` key is safe to include in the Vite build — access is enforced by RLS.
- The `service_role` key must **never** be included in the frontend build.
- Legacy MongoDB credentials must be excluded from the new production environment.
