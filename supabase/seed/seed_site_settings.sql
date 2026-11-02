-- =============================================================================
-- Seed: Site Settings (Development Placeholder)
-- Run this after migrations to populate the singleton site_settings row
-- with placeholder values for local development.
--
-- IMPORTANT: Before production launch, update all placeholder values with
-- real HMPTI UNESA content — approved by the organization content owner.
-- =============================================================================

UPDATE public.site_settings
SET
  organization_name   = 'Himpunan Mahasiswa Prodi Teknik Informatika',
  organization_abbr   = 'HMPTI UNESA',
  cabinet_name        = 'Kabinet [Nama Kabinet]',
  cabinet_period      = '2025/2026',
  tagline             = 'Bergerak, Berinovasi, Berdampak.',

  social_links        = '{
    "instagram": "https://instagram.com/hmptiunesa",
    "linkedin":  "https://linkedin.com/company/hmptiunesa",
    "youtube":   "https://youtube.com/@hmptiunesa",
    "github":    "https://github.com/hmptiunesa",
    "tiktok":    "https://tiktok.com/@hmptiunesa",
    "email":     "hmpti@unesa.ac.id"
  }',

  contact_email       = 'hmpti@unesa.ac.id',
  secretariat_address = 'Sekretariat HMPTI, Gedung A9, Universitas Negeri Surabaya, Jl. Ketintang, Surabaya 60231',
  gmaps_embed_url     = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.7543!2d112.7311!3d-7.3149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb7c3f3b!2sUniversitas+Negeri+Surabaya!5e0!3m2!1sen!2sid',

  stats               = '{
    "department_count":         5,
    "completed_programs":       20,
    "active_committee_count":   60
  }',

  spotlight_mode      = 'showcase'
WHERE id = 1;
