// =============================================================================
// Site Configuration
// Static fallback branding and navigation used when Supabase is not yet
// configured (local dev without env vars) or while site_settings is loading.
// The CMS-managed site_settings row is the source of truth once available.
// =============================================================================

import type { SiteSettings, SpotlightMode, UserRole } from '@/types/database'

// ── Default Organization Branding ─────────────────────────────────────────────

export const defaultOrganization = {
  name: 'Himpunan Mahasiswa Prodi Teknik Informatika',
  abbreviation: 'HMPTI UNESA',
  cabinetName: 'Kabinet Cakrawala',
  cabinetPeriod: '2025/2026',
  tagline: 'Bergerak, Berinovasi, Berdampak.',
  contactEmail: 'hmpti@unesa.ac.id',
  secretariatAddress:
    'Sekretariat HMPTI, Gedung A9, Universitas Negeri Surabaya, ' +
    'Jl. Ketintang, Surabaya 60231',
  gmapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.7543' +
    '!2d112.7311!3d-7.3149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768' +
    '!4f13.1!3m3!1m2!1s0x2dd7fb7c3f3b!2sUniversitas+Negeri+Surabaya' +
    '!5e0!3m2!1sen!2sid',
  socialLinks: {
    instagram: 'https://instagram.com/hmptiunesa',
    linkedin: 'https://linkedin.com/company/hmptiunesa',
    youtube: 'https://youtube.com/@hmptiunesa',
    github: 'https://github.com/hmptiunesa',
    tiktok: 'https://tiktok.com/@hmptiunesa',
    email: 'hmpti@unesa.ac.id',
  },
  stats: {
    department_count: 5,
    completed_programs: 20,
    active_committee_count: 60,
  },
}

// ── Primary 5-Pillar Public Navigation ───────────────────────────────────────

export interface NavLink {
  label: string
  to: string
  /** Optional flag for navigation entries that are still in development. */
  external?: boolean
  href?: string
}

export const primaryNavLinks: NavLink[] = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang Kami', to: '/about' },
  { label: 'Kegiatan & Dokumentasi', to: '/events' },
  { label: 'Hubungi Kami', to: '/contact' },
  { label: 'Spotlight', to: '/spotlight' },
]

// ── Spotlight Mode Helpers ───────────────────────────────────────────────────

export const SPOTLIGHT_MODES: readonly SpotlightMode[] = ['showcase', 'ospek'] as const

export const isSpotlightMode = (value: unknown): value is SpotlightMode =>
  value === 'showcase' || value === 'ospek'

// ── Role Helpers ─────────────────────────────────────────────────────────────

export const isUserRole = (value: unknown): value is UserRole =>
  value === 'admin' || value === 'editor'

// ── Site Settings Fallback ───────────────────────────────────────────────────

/**
 * Builds a complete SiteSettings row populated with default branding. Useful
 * as the initial state before site_settings is fetched from Supabase.
 */
export const buildFallbackSiteSettings = (): SiteSettings => ({
  id: 1,
  organization_name: defaultOrganization.name,
  organization_abbr: defaultOrganization.abbreviation,
  cabinet_name: defaultOrganization.cabinetName,
  cabinet_period: defaultOrganization.cabinetPeriod,
  tagline: defaultOrganization.tagline,
  logo_url: null,
  hero_image_url: null,
  social_links: { ...defaultOrganization.socialLinks },
  contact_email: defaultOrganization.contactEmail,
  secretariat_address: defaultOrganization.secretariatAddress,
  gmaps_embed_url: defaultOrganization.gmapsEmbedUrl,
  stats: { ...defaultOrganization.stats },
  spotlight_mode: 'showcase',
  updated_by: null,
  updated_at: new Date(0).toISOString(),
})

// ── Display Helpers ──────────────────────────────────────────────────────────

export const memberLevelOrder: Record<string, number> = {
  bph: 0,
  coordinator: 1,
  staff_ahli: 2,
  staff_muda: 3,
}

export const memberLevelLabel: Record<string, string> = {
  bph: 'Badan Pengurus Harian',
  coordinator: 'Koordinator',
  staff_ahli: 'Staff Ahli',
  staff_muda: 'Staff Muda',
}

export const eventStatusLabel: Record<string, string> = {
  upcoming: 'Mendatang',
  ongoing: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}
