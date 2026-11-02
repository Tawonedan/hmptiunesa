-- =============================================================================
-- Migration 003: Cabinets, Departments & Members
-- Purpose: Represents the active (and historical) cabinet structure.
--          Public member cards expose ONLY approved information — NIM, personal
--          email, phone, and private social accounts are never stored here.
-- =============================================================================

-- ── Cabinets ─────────────────────────────────────────────────────────────────
CREATE TABLE public.cabinets (
  id             UUID        NOT NULL DEFAULT uuid_generate_v4(),
  name           TEXT        NOT NULL,              -- e.g. "Kabinet Cakrawala"
  period         TEXT        NOT NULL,              -- e.g. "2025/2026"
  status         TEXT        NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'archived')),
  vision         TEXT,
  mission        TEXT,
  history_text   TEXT,                              -- Short description/intro
  logo_url       TEXT,                              -- Cabinet-specific logo (optional)
  hero_image_url TEXT,                              -- Cabinet banner/hero
  sort_order     INT         NOT NULL DEFAULT 0,
  created_by     UUID        REFERENCES auth.users(id),
  updated_by     UUID        REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cabinets_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.cabinets IS
  'Cabinet periods (kepengurusan). Exactly one row should have status=active at any time.';

CREATE TRIGGER cabinets_set_updated_at
  BEFORE UPDATE ON public.cabinets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Cabinet Departments ───────────────────────────────────────────────────────
CREATE TABLE public.cabinet_departments (
  id           UUID        NOT NULL DEFAULT uuid_generate_v4(),
  cabinet_id   UUID        NOT NULL REFERENCES public.cabinets(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,              -- e.g. "Departemen MEDKOMINFO"
  code         TEXT,                             -- Short code, e.g. "MEDKOMINFO"
  description  TEXT,
  icon_url     TEXT,
  sort_order   INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cabinet_departments_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.cabinet_departments IS
  'Departments within a cabinet period.';

-- ── Cabinet Members (Public Display Cards) ────────────────────────────────────
CREATE TABLE public.cabinet_members (
  id              UUID        NOT NULL DEFAULT uuid_generate_v4(),
  cabinet_id      UUID        NOT NULL REFERENCES public.cabinets(id) ON DELETE CASCADE,
  department_id   UUID        REFERENCES public.cabinet_departments(id) ON DELETE SET NULL,

  name            TEXT        NOT NULL,
  role_title      TEXT        NOT NULL,           -- e.g. "Ketua Umum", "Bendahara I"

  -- Hierarchy level for display ordering on /about
  level           TEXT        NOT NULL DEFAULT 'staff_muda'
                  CHECK (level IN ('bph', 'coordinator', 'staff_ahli', 'staff_muda')),

  photo_url       TEXT,                           -- Storage URL — publicly approved only
  display_order   INT         NOT NULL DEFAULT 0,

  -- Public-safe social links only (e.g. LinkedIn, GitHub) — NO NIM/email/phone
  -- Structure: { "linkedin": "url", "github": "url" }
  social_links    JSONB       NOT NULL DEFAULT '{}',

  created_by      UUID        REFERENCES auth.users(id),
  updated_by      UUID        REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cabinet_members_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.cabinet_members IS
  'Public display cards for cabinet members. '
  'NIM, personal email, phone, and private social accounts must NEVER be stored here.';

CREATE TRIGGER cabinet_members_set_updated_at
  BEFORE UPDATE ON public.cabinet_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX cabinet_departments_cabinet_idx ON public.cabinet_departments(cabinet_id);
CREATE INDEX cabinet_members_cabinet_idx     ON public.cabinet_members(cabinet_id);
CREATE INDEX cabinet_members_department_idx  ON public.cabinet_members(department_id);
CREATE INDEX cabinet_members_level_idx       ON public.cabinet_members(level);
