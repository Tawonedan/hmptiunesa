-- =============================================================================
-- Migration 005: News / Releases
-- Purpose: Optional independently-published news articles or press releases.
--          Can optionally reference a parent event for context.
--          If editorial value is low, news may be deprecated post-launch in
--          favour of event documentation only (per PRD Open Decision #3).
-- =============================================================================

CREATE TABLE public.news (
  id              UUID        NOT NULL DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,      -- URL-safe identifier for /news/:slug (if added)
  category        TEXT        NOT NULL DEFAULT 'announcement',
                              -- e.g. 'announcement', 'achievement', 'press-release', 'internal'

  excerpt         TEXT,                             -- Short teaser (1-2 sentences)
  content         TEXT,                             -- Full article body (markdown-friendly)
  cover_image_url TEXT,                             -- Hero image

  -- Optional: links this article as a release/documentation for a specific event
  event_id        UUID        REFERENCES public.events(id) ON DELETE SET NULL,

  -- Publication status
  is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,                      -- Set when first published

  -- CMS Audit
  created_by      UUID        REFERENCES auth.users(id),
  updated_by      UUID        REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT news_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.news IS
  'News articles and press releases. Optionally linked to an event via event_id. '
  'Per PRD Open Decision #3, this model may be merged into events.press_release in a future release.';

CREATE TRIGGER news_set_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Set published_at when is_published flips to TRUE for the first time
CREATE OR REPLACE FUNCTION public.set_news_published_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_published = TRUE AND OLD.is_published = FALSE AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER news_set_published_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.set_news_published_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX news_is_published_idx ON public.news(is_published);
CREATE INDEX news_published_at_idx ON public.news(published_at DESC);
CREATE INDEX news_slug_idx         ON public.news(slug);
CREATE INDEX news_event_id_idx     ON public.news(event_id);
