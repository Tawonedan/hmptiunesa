-- =============================================================================
-- Migration 008: Row Level Security — profiles
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admins can read any profile (for account management dashboard)
CREATE POLICY "Admin: read all profiles"
  ON public.profiles FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Users can always read their own profile
CREATE POLICY "Self: read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Only admins can create new CMS accounts
CREATE POLICY "Admin: insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.current_user_role() = 'admin');

-- Admins can update any profile; users can update their own name only
CREATE POLICY "Admin: update any profile"
  ON public.profiles FOR UPDATE
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Self: update own profile name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Only admins can deactivate (delete) accounts
CREATE POLICY "Admin: delete profiles"
  ON public.profiles FOR DELETE
  USING (public.current_user_role() = 'admin');
