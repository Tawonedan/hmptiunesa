-- =============================================================================
-- Migration 011: Row Level Security — events
-- =============================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public visitors can only see published events
CREATE POLICY "Public: read published events"
  ON public.events FOR SELECT
  USING (is_published = TRUE);

-- Admins and editors can see all events (including drafts)
CREATE POLICY "Admin+Editor: read all events"
  ON public.events FOR SELECT
  USING (public.current_user_role() IN ('admin', 'editor'));

-- Admins and editors can create events
CREATE POLICY "Admin+Editor: insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

-- Admins and editors can update events
CREATE POLICY "Admin+Editor: update events"
  ON public.events FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'editor'));

-- Only admins can permanently delete events
CREATE POLICY "Admin: delete events"
  ON public.events FOR DELETE
  USING (public.current_user_role() = 'admin');
