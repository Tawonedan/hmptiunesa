// =============================================================================
// Database Type Definitions
// Mirrors the Postgres schema in supabase/migrations/.
// Keep these in sync when migrations change column shape or enums.
// =============================================================================

// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor'

export type SpotlightMode = 'showcase' | 'ospek'

export type CabinetStatus = 'active' | 'archived'

export type MemberLevel = 'bph' | 'coordinator' | 'staff_ahli' | 'staff_muda'

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export type OspekSectionType =
  | 'schedule'
  | 'announcement'
  | 'handbook'
  | 'group_info'
  | 'task_link'
  | 'resource_link'

// ── Social / Link Helpers ────────────────────────────────────────────────────

/** Public-safe social links shown on member/project cards. No PII. */
export interface SocialLinks {
  linkedin?: string
  github?: string
  instagram?: string
  youtube?: string
  tiktok?: string
  website?: string
}

/** Site-level social / contact channel collection. */
export interface SiteSocialLinks extends SocialLinks {
  email?: string
}

/** Homepage stat block. */
export interface SiteStats {
  department_count?: number
  completed_programs?: number
  active_committee_count?: number
}

/** Display-only project contributor. Stored as JSON text, never linked to auth. */
export interface ProjectContributor {
  name: string
  role?: string
}

/** Public document link entry (used in events and ospek). */
export interface DocumentLink {
  label: string
  url: string
}

// ── Row Types ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: 1
  organization_name: string
  organization_abbr: string
  cabinet_name: string | null
  cabinet_period: string | null
  tagline: string | null
  logo_url: string | null
  hero_image_url: string | null
  social_links: SiteSocialLinks
  contact_email: string | null
  secretariat_address: string | null
  gmaps_embed_url: string | null
  stats: SiteStats
  spotlight_mode: SpotlightMode
  updated_by: string | null
  updated_at: string
}

export interface Cabinet {
  id: string
  name: string
  period: string
  status: CabinetStatus
  vision: string | null
  mission: string | null
  history_text: string | null
  logo_url: string | null
  hero_image_url: string | null
  sort_order: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface CabinetDepartment {
  id: string
  cabinet_id: string
  name: string
  code: string | null
  description: string | null
  icon_url: string | null
  sort_order: number
  created_at: string
}

export interface CabinetMember {
  id: string
  cabinet_id: string
  department_id: string | null
  name: string
  role_title: string
  level: MemberLevel
  photo_url: string | null
  display_order: number
  social_links: SocialLinks
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  slug: string
  category: string
  status: EventStatus
  start_date: string | null
  end_date: string | null
  location: string | null
  summary: string
  description: string | null
  poster_url: string | null
  registration_url: string | null
  contact_person: string | null
  outcome_notes: string | null
  press_release: string | null
  documentation_images: string[]
  public_documents: DocumentLink[]
  is_published: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface News {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  event_id: string | null
  is_published: boolean
  published_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  category: string
  tags: string[]
  description: string
  thumbnail_url: string | null
  screenshots: string[]
  contributors: ProjectContributor[]
  demo_url: string | null
  repo_url: string | null
  other_links: DocumentLink[]
  achievements: string | null
  is_featured: boolean
  is_published: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface OspekContent {
  id: string
  section_type: OspekSectionType
  title: string
  description: string | null
  scheduled_at: string | null
  location: string | null
  link_url: string | null
  link_label: string | null
  file_url: string | null
  group_identifier: string | null
  sort_order: number
  is_published: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

// ── Composite / Joined Views ─────────────────────────────────────────────────

/** Cabinet member joined with its department for grouped rendering. */
export interface CabinetMemberWithDepartment extends CabinetMember {
  department: CabinetDepartment | null
}

/** Active cabinet bundled with its departments and members. */
export interface ActiveCabinetView {
  cabinet: Cabinet
  departments: CabinetDepartment[]
  members: CabinetMemberWithDepartment[]
}
