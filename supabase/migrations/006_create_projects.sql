-- =============================================================================
-- Migration 006: Showcase Projects
-- Purpose: Curated student TI project showcase visible on /spotlight when
--          spotlight_mode = 'showcase'. Contributors are stored as display-only
--          text — no PII (NIM, personal email, phone) is collected.
-- =============================================================================

CREATE TABLE public.projects (
  id              UUID        NOT NULL DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,

  -- Categorization
  category        TEXT        NOT NULL DEFAULT 'web',
                              -- e.g. 'web', 'mobile', 'game', 'iot', 'ai-ml', 'open-source', 'other'
  tags            JSONB       NOT NULL DEFAULT '[]',  -- String array for tech stack tags

  -- Content
  description     TEXT        NOT NULL,
  thumbnail_url   TEXT,                              -- Primary showcase image
  -- Array of additional screenshot/demo Storage URLs
  screenshots     JSONB       NOT NULL DEFAULT '[]',

  -- Contributors: display-only text entries — NOT linked to any user/member record
  -- Structure: [{ "name": "Budi Santoso", "role": "Developer" }]
  contributors    JSONB       NOT NULL DEFAULT '[]',

  -- External links
  demo_url        TEXT,
  repo_url        TEXT,
  other_links     JSONB       NOT NULL DEFAULT '[]', -- [{label, url}]

  -- Achievements / awards (text entries)
  achievements    TEXT,

  -- CMS flags
  is_featured     BOOLEAN     NOT NULL DEFAULT FALSE,  -- Pinned to top
  is_published    BOOLEAN     NOT NULL DEFAULT FALSE,

  -- CMS Audit
  created_by      UUID        REFERENCES auth.users(id),
  updated_by      UUID        REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.projects IS
  'Student TI showcase projects for /spotlight?mode=showcase. '
  'contributors is display-only text — no PII (NIM/email/phone) stored here.';

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX projects_is_published_idx ON public.projects(is_published);
CREATE INDEX projects_is_featured_idx  ON public.projects(is_featured);
CREATE INDEX projects_category_idx     ON public.projects(category);
CREATE INDEX projects_slug_idx         ON public.projects(slug);
