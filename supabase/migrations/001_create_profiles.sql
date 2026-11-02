-- =============================================================================
-- Migration 001: CMS User Profiles & Roles
-- Purpose: Extends Supabase Auth with organization-level role metadata.
--          Only pre-provisioned admin/pengurus accounts can access the CMS.
--          Public registration is disabled at the Auth config level.
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- profiles table: maps auth.users → CMS role
CREATE TABLE public.profiles (
  id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT        NOT NULL,
  role         TEXT        NOT NULL CHECK (role IN ('admin', 'editor')),
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.profiles IS
  'CMS user profiles. All accounts are pre-provisioned by an admin — no public sign-up.';

COMMENT ON COLUMN public.profiles.role IS
  'admin: full CMS control including settings and accounts. editor: content CRUD only.';

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Convenience function: returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
