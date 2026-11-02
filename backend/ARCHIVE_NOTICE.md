# Backend Archive Notice

> **Status: DEPRECATED — Superseded by Supabase**
> Date: 2026-09-04

---

## Summary

The Express.js / Mongoose / MongoDB backend in this directory has been **retired** and replaced by **Supabase** as the new data and authentication platform for the HMPTI UNESA website.

This directory is preserved in the repository for historical reference **only**. It must **not** be deployed to any production or staging environment alongside the new Supabase-backed frontend.

---

## Why It Was Retired

| Problem | Resolution |
|---|---|
| Scope too broad — included student directory, lecturer directory, public registration, OTP, and email verification | All retired features removed; CMS-only authentication via Supabase Auth |
| Insecure write endpoints — functionary write routes lacked consistent authorization | Replaced by Supabase RLS policies enforced at the database level |
| Privacy issues — Member NIM, personal email, phone numbers exposed via public API | Retired feature; no PII stored in the new data model |
| Operational overhead — required maintaining MongoDB Atlas, Nodemailer/Mailtrap, and Express runtime | Replaced by Supabase managed infrastructure |
| File storage via local `/uploads/` disk | Replaced by Supabase Storage with RLS-enforced upload policies |

---

## What Replaced It

| Old Component | New Component |
|---|---|
| MongoDB / Mongoose | Supabase Postgres with typed migrations |
| Express Auth (JWT + OTP) | Supabase Auth (pre-provisioned CMS accounts only) |
| Local `/uploads/` disk storage | Supabase Storage (public-media & documents buckets) |
| Nodemailer contact email | Supabase Edge Function `contact-submit` using Resend API |
| Role middleware (`authMiddleware.js`) | Row Level Security (RLS) policies on every table |

---

## Legacy MongoDB Data

The existing MongoDB collections (`users`, `members`, `lecturers`, `lecturerExpertise`, etc.) are **not in scope for migration**. They remain as legacy data outside the new HMPTI product and must:

- **NOT** be copied into Supabase
- **NOT** be exposed through any deployed route, frontend bundle, or service credential
- Have their connection credentials kept **separate** from the new production environment

---

## New Infrastructure

All new backend infrastructure lives in `/supabase/`:

```
supabase/
├── migrations/     # Postgres schema DDL — applied in order
├── storage/        # Bucket definitions and object-level RLS policies
├── functions/      # Deno-based Edge Functions
│   └── contact-submit/   # Contact form handler
└── seed/           # Development placeholder data
```

See the root `README.md` and `supabase/config.toml` for setup instructions.

---

## Sensitive Credentials

The `.env` file in this directory contains:
- `MONGODB_URI` — legacy MongoDB Atlas connection string
- `SMTP_EMAIL` / `SMTP_PASSWORD` — legacy Mailtrap credentials

**These must never be included in the new application deployment.** Rotate or revoke them if they were ever committed to version control.
