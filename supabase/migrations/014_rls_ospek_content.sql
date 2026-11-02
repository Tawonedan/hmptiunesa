-- =============================================================================
-- Migration 014: Row Level Security — ospek_content
-- =============================================================================

ALTER TABLE public.ospek_content ENABLE ROW LEVEL SECURITY;

-- Public visitors can read published Ospek content (when spotlight_mode = 'ospek')
CREATE POLICY "Public: read published ospek content"
  ON public.ospek_content FOR SELECT
  USING (is_published = TRUE);

-- CMS users see all ospek content including unpublished drafts
CREATE POLICY "Admin+Editor: read all ospek content"
  ON public.ospek_content FOR SELECT
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: insert ospek content"
  ON public.ospek_content FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: update ospek content"
  ON public.ospek_content FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin: delete ospek content"
  ON public.ospek_content FOR DELETE
  USING (public.current_user_role() = 'admin');
