-- =============================================================================
-- Migration 007: Ospek / PKKMB Content
-- Purpose: Seasonal PKKMB/Ospek content hub. Only visible on /spotlight when
--          site_settings.spotlight_mode = 'ospek'. Each row represents one
--          content section (schedule entry, announcement, handbook, group info,
--          or resource link).
-- =============================================================================

CREATE TABLE public.ospek_content (
  id            UUID        NOT NULL DEFAULT uuid_generate_v4(),

  -- Type of content block determines how the frontend renders it
  section_type  TEXT        NOT NULL
                CHECK (section_type IN (
                  'schedule',       -- Timeline entry with date/time
                  'announcement',   -- General notice / bulletin
                  'handbook',       -- Downloadable handbook/guide
                  'group_info',     -- Group assignment or kelompok info
                  'task_link',      -- Task/tugas requirements with link
                  'resource_link'   -- External approved resource
                )),

  title         TEXT        NOT NULL,
  description   TEXT,                              -- Body/details (markdown-friendly)

  -- Date/time used for schedule entries
  scheduled_at  TIMESTAMPTZ,

  -- Location / venue (for schedule entries)
  location      TEXT,

  -- External link (for handbook, task, resource types)
  link_url      TEXT,
  link_label    TEXT,                              -- Display text for the link

  -- Storage URL (for uploaded handbooks or downloadable files)
  file_url      TEXT,

  -- Group/batch identifier (for group_info type)
  group_identifier TEXT,                           -- e.g. "Kelompok 1", "Angkatan 2025"

  -- Ordering and visibility
  sort_order    INT         NOT NULL DEFAULT 0,
  is_published  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- CMS Audit
  created_by    UUID        REFERENCES auth.users(id),
  updated_by    UUID        REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ospek_content_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.ospek_content IS
  'Seasonal Ospek/PKKMB content blocks. Rendered on /spotlight only when '
  'site_settings.spotlight_mode = ''ospek''. section_type controls card layout.';

CREATE TRIGGER ospek_content_set_updated_at
  BEFORE UPDATE ON public.ospek_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX ospek_content_section_type_idx  ON public.ospek_content(section_type);
CREATE INDEX ospek_content_is_published_idx  ON public.ospek_content(is_published);
CREATE INDEX ospek_content_sort_order_idx    ON public.ospek_content(sort_order);
CREATE INDEX ospek_content_scheduled_at_idx  ON public.ospek_content(scheduled_at);
