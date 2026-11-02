-- =============================================================================
-- Storage: Object-Level RLS Policies
-- These policies control who can upload, update, delete, and read objects
-- from each storage bucket.
-- =============================================================================

-- ── public-media bucket ───────────────────────────────────────────────────────

-- Anyone can read/download public media (logos, event images, member photos)
CREATE POLICY "Public: read public-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'public-media');

-- Only authenticated CMS users (admin or editor) can upload
CREATE POLICY "CMS: upload to public-media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'public-media'
    AND auth.role() = 'authenticated'
    AND public.current_user_role() IN ('admin', 'editor')
  );

-- Only authenticated CMS users can update object metadata
CREATE POLICY "CMS: update public-media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'public-media'
    AND auth.role() = 'authenticated'
    AND public.current_user_role() IN ('admin', 'editor')
  );

-- Only admins can delete media files (prevents accidental editor deletions)
CREATE POLICY "Admin: delete public-media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'public-media'
    AND auth.role() = 'authenticated'
    AND public.current_user_role() = 'admin'
  );

-- ── documents bucket ──────────────────────────────────────────────────────────

-- Anyone can download documents (ospek handbooks, press releases, etc.)
CREATE POLICY "Public: read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Only authenticated CMS users can upload documents
CREATE POLICY "CMS: upload to documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND public.current_user_role() IN ('admin', 'editor')
  );

-- Only authenticated CMS users can update document metadata
CREATE POLICY "CMS: update documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND public.current_user_role() IN ('admin', 'editor')
  );

-- Only admins can delete documents
CREATE POLICY "Admin: delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND public.current_user_role() = 'admin'
  );
