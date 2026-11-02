-- =============================================================================
-- Migration 012: Row Level Security — news
-- =============================================================================

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Public visitors can only see published articles
CREATE POLICY "Public: read published news"
  ON public.news FOR SELECT
  USING (is_published = TRUE);

-- CMS users see all articles including drafts
CREATE POLICY "Admin+Editor: read all news"
  ON public.news FOR SELECT
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: insert news"
  ON public.news FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: update news"
  ON public.news FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin: delete news"
  ON public.news FOR DELETE
  USING (public.current_user_role() = 'admin');
