-- =============================================================================
-- Migration 002: Site Settings (Singleton)
-- Purpose: Stores all organization-level configuration for HMPTI UNESA.
--          One row per deployment. Includes spotlight_mode so the public
--          Spotlight page can switch between 'showcase' and 'ospek' via
--          the CMS without touching environment variables or rebuilding.
-- =============================================================================

CREATE TABLE public.site_settings (
  id                  SERIAL      PRIMARY KEY,

  -- Organization Identity
  organization_name   TEXT        NOT NULL DEFAULT 'Himpunan Mahasiswa Prodi Teknik Informatika',
  organization_abbr   TEXT        NOT NULL DEFAULT 'HMPTI UNESA',
  cabinet_name        TEXT,                         -- e.g. "Kabinet Cakrawala"
  cabinet_period      TEXT,                         -- e.g. "2025/2026"
  tagline             TEXT,                         -- Hero tagline / motto
  logo_url            TEXT,                         -- Storage URL for org logo
  hero_image_url      TEXT,                         -- Homepage hero background

  -- Contact Channels (JSON object)
  -- Keys: instagram, linkedin, youtube, github, tiktok, email, address
  social_links        JSONB       NOT NULL DEFAULT '{}',
  contact_email       TEXT,                         -- Official reply-to email
  secretariat_address TEXT,                         -- Physical address string
  gmaps_embed_url     TEXT,                         -- Google Maps embed src URL

  -- Homepage Stats
  -- Keys: department_count, completed_programs, active_committee_count
  stats               JSONB       NOT NULL DEFAULT '{}',

  -- Spotlight Mode: controls what /spotlight renders
  -- 'showcase' → student project showcase
  -- 'ospek'    → PKKMB/Ospek information hub
  spotlight_mode      TEXT        NOT NULL DEFAULT 'showcase'
                      CHECK (spotlight_mode IN ('showcase', 'ospek')),

  -- CMS Audit Fields
  updated_by          UUID        REFERENCES auth.users(id),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Enforce singleton: only one row may ever exist
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

COMMENT ON TABLE public.site_settings IS
  'Singleton configuration for HMPTI UNESA. Exactly one row (id=1). '
  'spotlight_mode controls /spotlight page layout without requiring a frontend rebuild.';

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Insert the initial singleton row with safe defaults
INSERT INTO public.site_settings (id, organization_name, organization_abbr, spotlight_mode)
VALUES (1, 'Himpunan Mahasiswa Prodi Teknik Informatika', 'HMPTI UNESA', 'showcase')
ON CONFLICT (id) DO NOTHING;
