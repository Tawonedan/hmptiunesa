-- =============================================================================
-- Seed: Sample Cabinet, Departments & Members (Development Placeholder)
-- Provides a representative dataset to develop and test the /about page.
-- Replace with real HMPTI UNESA content before production launch.
-- =============================================================================

-- Insert sample active cabinet
INSERT INTO public.cabinets (id, name, period, status, vision, mission, history_text, sort_order)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Kabinet Cakrawala',
  '2025/2026',
  'active',
  'Menjadi himpunan mahasiswa yang inovatif, kolaboratif, dan berdampak bagi civitas akademika Teknik Informatika UNESA.',
  '1. Mengembangkan potensi akademik dan non-akademik anggota.
2. Mempererat sinergi antarmahasiswa Teknik Informatika.
3. Menjadi wadah kreativitas dan inovasi teknologi informasi.
4. Membangun jaringan kolaborasi yang luas dan berkelanjutan.',
  'HMPTI UNESA berdiri sebagai representasi mahasiswa Program Studi Teknik Informatika Universitas Negeri Surabaya. Berawal dari semangat kebersamaan dan keinginan untuk berkontribusi, HMPTI terus bertumbuh menjadi organisasi yang aktif, inovatif, dan berdampak.',
  0
);

-- Insert sample departments
INSERT INTO public.cabinet_departments (id, cabinet_id, name, code, description, sort_order)
VALUES
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Badan Pengurus Harian', 'BPH', 'Koordinasi dan pengawasan organisasi secara keseluruhan.', 0),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Departemen Media & Komunikasi Informasi', 'MEDKOMINFO',
   'Mengelola media sosial, dokumentasi, dan komunikasi eksternal organisasi.', 1),

  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Departemen Pendidikan & Teknologi', 'DIKTEK',
   'Menyelenggarakan kegiatan pendidikan, pelatihan, dan inovasi teknologi.', 2),

  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
   'Departemen Kewirausahaan', 'WIRAUSAHA',
   'Mendorong jiwa kewirausahaan dan ekonomi kreatif di kalangan mahasiswa TI.', 3),

  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111',
   'Departemen Pengabdian Masyarakat', 'PENGMAS',
   'Menggerakkan kontribusi sosial mahasiswa TI bagi masyarakat luas.', 4);

-- Insert sample cabinet members (BPH)
INSERT INTO public.cabinet_members
  (cabinet_id, department_id, name, role_title, level, display_order, social_links)
VALUES
  ('11111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111',
   'Placeholder Ketua Umum', 'Ketua Umum', 'bph', 1,
   '{"linkedin": "", "github": ""}'),

  ('11111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111',
   'Placeholder Wakil Ketua', 'Wakil Ketua Umum', 'bph', 2,
   '{"linkedin": "", "github": ""}'),

  ('11111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111',
   'Placeholder Sekretaris I', 'Sekretaris I', 'bph', 3,
   '{"linkedin": "", "github": ""}'),

  ('11111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111',
   'Placeholder Bendahara I', 'Bendahara I', 'bph', 4,
   '{"linkedin": "", "github": ""}'),

  -- MEDKOMINFO sample
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   'Placeholder Koordinator MEDKOMINFO', 'Koordinator Departemen', 'coordinator', 5,
   '{"linkedin": "", "github": ""}'),

  -- DIKTEK sample
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
   'Placeholder Koordinator DIKTEK', 'Koordinator Departemen', 'coordinator', 6,
   '{"linkedin": "", "github": ""}');

-- Insert historical cabinet entry
INSERT INTO public.cabinets (id, name, period, status, sort_order)
VALUES
  ('11111111-1111-1111-1111-222222222222', 'Kabinet [Nama Lama]', '2024/2025', 'archived', 1),
  ('11111111-1111-1111-1111-333333333333', 'Kabinet [Nama Lebih Lama]', '2023/2024', 'archived', 2);
