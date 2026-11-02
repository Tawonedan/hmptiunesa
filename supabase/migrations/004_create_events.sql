-- =============================================================================
-- Migration 004: Events & Activities
-- Purpose: Manages organizational events with a full content lifecycle:
--          upcoming → ongoing → completed/archived.
--          Also handles gallery documentation and press releases.
-- =============================================================================

CREATE TABLE public.events (
  id                    UUID        NOT NULL DEFAULT uuid_generate_v4(),
  title                 TEXT        NOT NULL,
  slug                  TEXT        NOT NULL UNIQUE,        -- URL-safe identifier for /events/:slug
  category              TEXT        NOT NULL DEFAULT 'general',  -- e.g. 'seminar', 'competition', 'social'

  -- Lifecycle status
  status                TEXT        NOT NULL DEFAULT 'upcoming'
                        CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),

  -- Scheduling
  start_date            TIMESTAMPTZ,
  end_date              TIMESTAMPTZ,
  location              TEXT,                               -- Venue name/address or 'Online'

  -- Public-facing content
  summary               TEXT        NOT NULL,               -- Short teaser (1-2 sentences)
  description           TEXT,                               -- Full detail (markdown-friendly)
  poster_url            TEXT,                               -- Event poster/banner image

  -- Optional public links
  registration_url      TEXT,                               -- External registration (e.g. Google Form)
  contact_person        TEXT,                               -- Approved contact info (not personal)

  -- Post-event documentation (populated after completion)
  outcome_notes         TEXT,                               -- Outcome/summary paragraph
  press_release         TEXT,                               -- Press release article (markdown)
  -- Array of Storage URLs for documentation/gallery images
  documentation_images  JSONB       NOT NULL DEFAULT '[]',
  -- Array of public downloadable links {label, url}
  public_documents      JSONB       NOT NULL DEFAULT '[]',

  -- CMS publication flag
  is_published          BOOLEAN     NOT NULL DEFAULT FALSE,

  -- CMS Audit
  created_by            UUID        REFERENCES auth.users(id),
  updated_by            UUID        REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.events IS
  'Organizational events/activities with full lifecycle (upcoming→ongoing→completed). '
  'documentation_images and press_release populate after completion.';

COMMENT ON COLUMN public.events.slug IS
  'URL-safe slug used in /events/:slug route. Must be unique. Auto-generate from title.';

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX events_status_idx      ON public.events(status);
CREATE INDEX events_is_published_idx ON public.events(is_published);
CREATE INDEX events_start_date_idx  ON public.events(start_date DESC);
CREATE INDEX events_slug_idx        ON public.events(slug);
