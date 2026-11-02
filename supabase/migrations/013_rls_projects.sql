-- =============================================================================
-- Migration 013: Row Level Security — projects
-- =============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public visitors can only see published showcase projects
CREATE POLICY "Public: read published projects"
  ON public.projects FOR SELECT
  USING (is_published = TRUE);

-- CMS users see all projects including unpublished
CREATE POLICY "Admin+Editor: read all projects"
  ON public.projects FOR SELECT
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: update projects"
  ON public.projects FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin: delete projects"
  ON public.projects FOR DELETE
  USING (public.current_user_role() = 'admin');
