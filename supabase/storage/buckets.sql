-- =============================================================================
-- Storage: Bucket Definitions
-- Run this in your Supabase project via the Dashboard SQL editor, OR include
-- it in your migration sequence after enabling the Storage extension.
--
-- Buckets:
--   public-media   → logos, banners, event posters, member photos, project thumbnails
--                    (public read access without authentication)
--   documents      → ospek handbooks, press releases, downloadable files
--                    (public read when intended for download; upload restricted to CMS)
-- =============================================================================

-- Insert buckets via the storage schema (Supabase-managed)
-- NOTE: In Supabase hosted projects, buckets are best created via the Dashboard
--       or Supabase CLI. This SQL is provided for documentation/CI reference.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'public-media',
    'public-media',
    TRUE,                                       -- Public read: no auth token needed for GET
    5242880,                                    -- 5 MB file size limit
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif'
    ]
  ),
  (
    'documents',
    'documents',
    TRUE,                                       -- Public read for downloadable files
    15728640,                                   -- 15 MB file size limit
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  )
ON CONFLICT (id) DO NOTHING;
