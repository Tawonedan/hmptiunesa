-- =============================================================================
-- Migration 009: Row Level Security — site_settings
-- =============================================================================

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public (anonymous) visitors can read site settings (needed for org name, logo,
-- social links, spotlight_mode, stats, etc.)
CREATE POLICY "Public: read site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

-- Only admins can update site settings (including spotlight_mode switch)
CREATE POLICY "Admin: update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- No inserts or deletes are allowed (singleton row managed by migration seed)
-- INSERT and DELETE are intentionally blocked — no policy = implicit DENY.
