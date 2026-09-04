# HMPTI UNESA Website Refactor — Product Requirements Document

**Status:** Draft  
**Product:** HMPTI UNESA public website and internal content-management system  
**Primary release:** HMPTI only  
**Source repository:** `web\_hmptiunesa`  
**Last updated:** 2026-08-26

\---

## 1\. Product Summary

Refactor the existing student-organization website into a maintainable public portfolio and information hub for **Himpunan Mahasiswa Prodi Teknik Informatika (HMPTI) UNESA**. The product must present the organization, active cabinet, activities, documentation, student work, and official contact channels while giving authorized administrators a small, practical CMS to keep content current.

The release intentionally removes university-directory and general-student-account features. HMPTI is the only organization in scope for this release. The implementation must keep organization identity concentrated in a small configuration/content boundary so that a future HMPSI or HMPPTI deployment can reuse the codebase without prematurely implementing multi-tenancy.

## 2\. Problem Statement

The existing repository contains a Vue 3/Vite frontend and Express/MongoDB backend, but its product scope is too broad for an organization committee to maintain. It currently includes:

* public routes for members, lecturers, lecturer detail, user login, registration, email verification, and user dashboards;
* backend `User`, `Member`, `Lecturer`, and `LecturerExpertise` surfaces;
* general-user auth using NIM, verification tokens, and OTP/email verification;
* separate public sections for organization/profile, functionaries, events, news, gallery, and projects.

These features create privacy, content, and operational overhead without supporting the core organizational purpose. Some existing resource write routes, including functionary management, also need a consistent authorization policy before they can serve as an admin CMS.

## 3\. Goals

1. Make the public website an authoritative, mobile-first HMPTI portfolio and information hub.
2. Reduce public navigation to five primary information areas.
3. Retire public student, lecturer, and general-user-account features completely.
4. Provide admin/pengurus users with secure CMS workflows for core content.
5. Support a seasonal **Spotlight** mode: student showcase normally, PKKMB/Ospek information when activated by an authorized admin without a frontend rebuild.
6. Preserve a clean extension boundary for future organization-specific deployments, without building HMPSI/HMPPTI functionality now.

## 4\. Non-Goals

* A multi-tenant product with runtime organization switching.
* HMPSI or HMPPTI content, themes, domain mappings, databases, or admin users in this release.
* A directory of all students or lecturers.
* Public student registration, NIM-based authentication, OTP/email verification, or user dashboards.
* Event ticketing, payment handling, or participant-registration data collection.
* A custom rich-text editor, analytics platform, or complex workflow engine.

## 5\. Users and Roles

### Public visitor

A student, prospective student, collaborator, alumnus, or general visitor who can browse public content without an account.

### Admin

A designated organization administrator who can manage all CMS content, site settings, Spotlight mode, media, and staff accounts.

### Pengurus / editor

An authorized committee member who can create and update assigned content such as events, news, projects, cabinet members, and Ospek information. Destructive actions and account/settings management remain admin-only unless explicitly granted later.

### Authorization principle

All write endpoints must require a valid JWT and an explicit permitted role. The frontend route guard is only UX; the backend remains the security boundary.

## 6\. Public Information Architecture

The primary navbar contains exactly five items. Detail pages are allowed as child routes and do not count as additional primary navigation.

|Primary area|Required route(s)|Purpose|
|-|-|-|
|Home|`/`|Cabinet identity, highlights, statistics, latest activity, and calls to action.|
|About|`/about`|HMPTI story, vision/mission, active cabinet, departments, and cabinet history.|
|Events \& Activities|`/events`, `/events/:id`|Upcoming/ongoing activity information and archived documentation, releases, outcomes, and gallery assets.|
|Reach Us|`/contact`|Official social links, contact form, secretariat/location details, and map embed.|
|Spotlight|`/spotlight`|Student-project showcase by default; PKKMB/Ospek hub while seasonal mode is active.|

### 6.1 Home

The home page must show:

* HMPTI logo, organization name, active cabinet name/tagline, and a primary CTA;
* up to three current or upcoming activity highlights;
* concise organization statistics: department count, completed programs, and active committee count;
* latest news/release previews;
* links to About, Events, and Spotlight.

### 6.2 About

The page must show:

* short HMPTI history;
* vision and mission;
* active cabinet identity and period;
* hierarchy/listing for BPH, coordinators, staff ahli, and staff muda;
* department descriptions and responsibilities;
* a historical list of cabinet names/periods.

Public profiles must expose only information expressly approved for publication. NIM, personal email, phone number, and private social accounts are excluded by default.

### 6.3 Events \& Activities

The page must provide two user-visible content modes/tabs:

* **Upcoming / Ongoing:** title, date/time, location, poster/thumbnail, summary, official registration URL if applicable, and approved contact information.
* **Archive \& Documentation:** completed activities, description/outcome, press release or article, selected documentation images, and optional public links/documents.

An event detail page must be shareable by URL and show a clear status. News may remain a separate CMS content type if it has independent editorial value; otherwise, it must appear within an event/activity archive rather than create a separate top-level navigation item.

### 6.4 Reach Us

The page must show official HMPTI channels, including only configured links: Instagram, LinkedIn, YouTube, GitHub, TikTok, email, and address/location. It must embed or link to the secretariat location.

The contact form must include name, reply email, subject, and message. It must validate input, rate-limit submissions, include a spam mitigation mechanism (honeypot and/or CAPTCHA), and send only to an organization-controlled inbox. No mail credentials may be sent to the browser.

### 6.5 Spotlight

Spotlight has one active mode controlled from the CMS:

|Mode|Public experience|
|-|-|
|`showcase` (default)|Curated student TI projects, achievements, competitions, open-source tools, games, web applications, or other approved work.|
|`ospek`|PKKMB/Ospek hub: schedule, handbook, group information, announcements, task links, and approved resources.|

Mode changes must take effect through backend-managed settings and must not require changing `VITE\_\*` values or redeploying the frontend. The CMS displays the current mode and requires explicit admin confirmation before switching it.

## 7\. Admin CMS Requirements

### 7.1 Authentication

* Public registration, verification, resend OTP, profile routes, and member dashboards are removed.
* Authentication is restricted to pre-provisioned admin/pengurus accounts at `/admin/login`.
* Admin users can create, deactivate, and reset authorized CMS accounts according to an agreed operational process.
* Passwords are hashed; JWT expiry and secret configuration are environment-controlled.
* Unauthorized API responses use consistent 401/403 behavior.

### 7.2 CMS modules

|Module|Required operations|Access|
|-|-|-|
|Site settings|Active cabinet, public contact channels, location, branding/content settings, Spotlight mode|Admin|
|Organization/About|History, vision, mission, department descriptions|Admin; editor if granted|
|Cabinet|Create/update/archive periods, departments, public member cards, display order|Admin; editor if granted|
|Events/activities|Create, edit, publish, archive, and remove activities/documentation|Admin and authorized editor|
|News/releases|Create, edit, publish, archive, and remove posts|Admin and authorized editor|
|Showcase projects|Curate projects, media, categories, links, and achievements|Admin and authorized editor|
|Ospek content|Manage schedule, guidance, group notices, task/resource links while applicable|Admin and authorized editor|
|Media|Upload/select/delete approved images and documents with type/size validation|Admin and authorized editor|
|CMS accounts|Provision/deactivate roles and credentials|Admin only|

### 7.3 Dashboard

The dashboard shows only meaningful management counts: active cabinet, published upcoming events, archived activities, published projects, and the active Spotlight mode. It must not retain lecturer/member counts.

## 8\. Content and Data Requirements

### 8.1 Required content at launch

Use representative placeholders during development. Before production, an HMPTI content owner must provide and approve:

* official name, logo, palette, cabinet name, and period;
* history, vision, mission, and department descriptions;
* public cabinet structure, names, roles, display photos, and consent for publication;
* official social URLs, email inbox, secretariat address, and map location with embedded gmaps element;
* at least three activities or documented programs;
* at least three Spotlight showcase entries or an approved empty-state message;
* current Spotlight mode and, if Ospek mode is active, schedule, handbook/resource URLs, and announcement copy.

### 8.2 Data-model direction

Existing `Organization`, `Functionary`, `Event`, `News`, `Gallery`, and `Project` models can be refactored or consolidated. The target model set is:

* `User`: CMS account only; name, email, password hash, role, active state, timestamps. No NIM, OTP, or verification fields.
* `SiteSettings`: singleton HMPTI configuration; active cabinet reference, contact/social links, location, homepage settings, and `spotlightMode`.
* `Cabinet`: period, cabinet name, status, departments, public roles/member entries, media, and display order.
* `Event`: planned/ongoing/completed activity content, dates, location, registration URL, documents, outcome, and gallery/media references.
* `News`: optional independently published release/article with publish status and linked event reference when relevant.
* `Project`: publicly approved showcase item, contributors as display-only data, category, media, external links, and achievements.
* `OspekContent`: schedule, announcements, resources, group/task information, visibility, and sort order.

Audit fields (`createdBy`, `updatedBy`, timestamps) are required on CMS-managed records. Sensitive fields must never be returned by public APIs.

## 9. Retirement and Privacy Requirements

The following must be removed from the product, API surface, public navigation, admin navigation, client stores, seeders, and documentation:

- lecturer and lecturer-expertise features (`/dosen`, lecturer APIs/models/seeders);
- general member directory (`/anggota`, member APIs/models/seeders);
- public registration, verification/OTP, `/user/*` views, and general-user profile flows;
- any NIM, personal email, phone number, or other personal data not explicitly approved for a public cabinet card.

The existing MongoDB collections are **not in scope for deletion, export, or migration**. They remain legacy data outside the new HMPTI product. The implementation must not copy them into Supabase or expose them through any deployed route, frontend bundle, service credential, or admin workflow.

Verification requirements:

1. Remove product code and public access paths for the retired features.
2. Verify retired frontend routes return the designed not-found experience and retired API routes return `404` or `410`.
3. Search the deployed public API and generated frontend assets for retired sensitive fields.
4. Keep legacy MongoDB credentials and network access separate from the new production environment; do not include them in the new application deployment.

## 10\. Technical Constraints and Future-Reuse Boundary

### Current repository baseline

* Frontend: Vue 3, TypeScript, Vite, Vue Router, Pinia, Axios.
* Existing backend: Node.js, Express, MongoDB/Mongoose, JWT, Multer, Nodemailer.
* Current API is mounted under `/api/\*`; frontend uses history routing.

### Target architecture: Supabase

The refactor replaces the Express/MongoDB runtime for the new product with Supabase:

* **Postgres:** CMS tables (`site_settings`, `cabinet`, `cabinet_members`, `events`, `news`, `projects`, `ospek_content`) and their relationships.
* **Supabase Auth:** pre-provisioned CMS user accounts only; no public sign-up. A `profiles`/role table maps authenticated users to `admin` or `editor` permissions.
* **Row Level Security (RLS):** enabled on every exposed table. Public/anonymous visitors can select only published public rows; authenticated editors receive explicit select/insert/update policies; destructive or settings/account actions remain admin-only.
* **Supabase Storage:** organization media and documents. Storage policies restrict uploads to authorized CMS users; public assets use a deliberately public bucket only when intended for public display.
* **Edge Functions:** contact-form delivery and other actions requiring secrets or server-side abuse protection. Mail credentials and any Supabase secret/service-role key remain server-side only.

The Vue frontend may call Supabase directly using `@supabase/supabase-js` with `VITE_SUPABASE_URL` and the publishable key. This is safe only because RLS and minimal grants enforce access. The secret/service-role key must never be included in the Vite build.

### Required refactor constraints

* Keep organization-specific strings, logos, colors, social links, categories, and feature settings centralized rather than scattered in Vue components.
* Use relative internal routes so links work on the deployment domain without hardcoding a hostname.
* Implement the first release as a single HMPTI Supabase project and a singleton `site_settings` record; do not add an `organization_id` or domain host resolver yet.
* Store Spotlight mode in `site_settings`, not in a `VITE_*` feature flag.
* Treat every Supabase schema, grant, RLS policy, Storage policy, and Edge Function as version-controlled deployment infrastructure.
* Validate upload type/size in the frontend for UX and enforce authorization/visibility through Storage policies.
* Add a production SPA rewrite rule so direct requests to child routes such as `/events/:id` do not 404.

### Future expansion — deployment reuse, not multi-tenancy

There is deliberate **reuse preparation**, but no multi-tenancy implementation. HMPTI centralizes branding/content settings and uses relative URLs. When a second organization is ready, deploy the same codebase as a separate instance with its own domain, Supabase project, Storage bucket, and environment variables. Each deployment then has its own `VITE_SUPABASE_URL` and publishable key.

This avoids cross-organization data leakage and keeps the first release simple. Domain-to-site host mappings, a tenant selector, an `organization_id` column, and shared-database RLS tenant filters are explicitly deferred until a real second organization needs them.

## 11\. Functional Acceptance Criteria

The release is acceptable only when all criteria below are met.

1. The public navbar exposes exactly Home, About, Events \& Activities, Reach Us, and Spotlight.
2. The five public areas and shareable event detail routes work on mobile and desktop.
3. No public route, navbar/footer link, API endpoint, or admin menu exposes lecturer, all-member, public-registration, OTP, verification, or user-dashboard functionality.
4. Public visitors can view only explicitly public organization, cabinet, event, news, project, and Ospek data.
5. Admin login works for provisioned CMS users; public registration is unavailable.
6. Unauthorized users cannot create, modify, or delete Cabinet, Event, News, Project, Ospek, Settings, or Media records through the API.
7. Admins can switch Spotlight between `showcase` and `ospek`; the public site reflects the new mode without a frontend rebuild.
8. Events support upcoming/ongoing and archived/documented experiences, and the CMS can publish the content needed by both.
9. Contact submission is validated, rate-limited, spam-protected, and delivered only to the official configured destination.
10. Image/document uploads reject unsupported file types and oversized files.
11. Production build, Supabase connectivity, RLS policy checks, Storage-policy checks, responsive review, and direct-load routing checks pass in the target hosting environment.
12. Sensitive legacy data is not exposed by the new deployment, and legacy MongoDB credentials are absent from the new production environment.

## 12\. Release Checklist

* [ ] HMPTI content owner approves public information and media rights.
* [ ] Legacy MongoDB data is neither exposed nor connected to the new production deployment.
* [ ] Retired routes, models, controllers, seeders, services, stores, and navigation removed.
* [ ] Supabase schema migrations, grants, RLS policies, and Storage policies are reviewed and deployed.
* [ ] Contact Edge Function delivery and spam prevention tested using a non-production destination.
* [ ] Mobile verification completed at 360px, 768px, and desktop widths.
* [ ] Frontend production build succeeds.
* [ ] Supabase Auth, RLS, Storage, and direct deep links are verified in staging.
* [ ] Production environment variables, Supabase backups, and rollback procedure are documented.
* [ ] Stakeholder signs off on content and public launch.

## 13. Open Decisions

1. Which hosting provider and domain/subdomain will HMPTI use?
2. Which organization-controlled mailbox/provider will the contact Edge Function use?
3. Should news remain a standalone CMS model, or be represented as activity documentation/releases only?
4. What exact role permissions should an `editor` have versus an `admin`?
5. Which public/private Supabase Storage buckets are needed for images and downloadable documents?
