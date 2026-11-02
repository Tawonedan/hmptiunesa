-- =============================================================================
-- Migration 010: Row Level Security — cabinets, cabinet_departments, cabinet_members
-- =============================================================================

-- ── Cabinets ──────────────────────────────────────────────────────────────────
ALTER TABLE public.cabinets ENABLE ROW LEVEL SECURITY;

-- Anyone can read cabinet info (needed to display About page)
CREATE POLICY "Public: read cabinets"
  ON public.cabinets FOR SELECT
  USING (TRUE);

-- Admins and editors can create new cabinets
CREATE POLICY "Admin+Editor: insert cabinets"
  ON public.cabinets FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

-- Admins and editors can update cabinets
CREATE POLICY "Admin+Editor: update cabinets"
  ON public.cabinets FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'editor'));

-- Only admins can delete cabinet records
CREATE POLICY "Admin: delete cabinets"
  ON public.cabinets FOR DELETE
  USING (public.current_user_role() = 'admin');

-- ── Cabinet Departments ───────────────────────────────────────────────────────
ALTER TABLE public.cabinet_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: read cabinet departments"
  ON public.cabinet_departments FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin+Editor: insert cabinet departments"
  ON public.cabinet_departments FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: update cabinet departments"
  ON public.cabinet_departments FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin: delete cabinet departments"
  ON public.cabinet_departments FOR DELETE
  USING (public.current_user_role() = 'admin');

-- ── Cabinet Members ───────────────────────────────────────────────────────────
ALTER TABLE public.cabinet_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public: read cabinet members"
  ON public.cabinet_members FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin+Editor: insert cabinet members"
  ON public.cabinet_members FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin+Editor: update cabinet members"
  ON public.cabinet_members FOR UPDATE
  USING (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin: delete cabinet members"
  ON public.cabinet_members FOR DELETE
  USING (public.current_user_role() = 'admin');
