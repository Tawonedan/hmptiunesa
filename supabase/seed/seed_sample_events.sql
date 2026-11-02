-- =============================================================================
-- Seed: Sample Events (Development Placeholder)
-- One upcoming event and one completed event with documentation.
-- =============================================================================

INSERT INTO public.events
  (title, slug, category, status, start_date, end_date, location, summary, description,
   is_published, documentation_images, public_documents)
VALUES
  -- Upcoming event
  (
    'Workshop Git & GitHub untuk Mahasiswa TI',
    'workshop-git-github-2025',
    'workshop',
    'upcoming',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '4 hours',
    'Lab Komputer A9, UNESA Ketintang',
    'Workshop praktis pengenalan version control menggunakan Git dan GitHub untuk mahasiswa Teknik Informatika UNESA.',
    '## Deskripsi

Workshop ini dirancang untuk membekali mahasiswa Teknik Informatika dengan kemampuan dasar version control menggunakan Git dan GitHub — alat wajib dalam dunia pengembangan perangkat lunak modern.

## Yang Akan Dipelajari
- Konsep dasar version control
- Instalasi dan konfigurasi Git
- Workflow GitHub: fork, branch, pull request
- Kolaborasi tim menggunakan GitHub

## Syarat Peserta
- Mahasiswa aktif Teknik Informatika UNESA
- Membawa laptop pribadi

Pendaftaran gratis melalui link di bawah ini.',
    TRUE,
    '[]',
    '[]'
  ),

  -- Completed event with documentation
  (
    'Seminar Nasional Kecerdasan Buatan & Masa Depan Karier TI',
    'semnas-ai-karier-ti-2025',
    'seminar',
    'completed',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days' + INTERVAL '6 hours',
    'Auditorium Universitas Negeri Surabaya',
    'Seminar nasional membahas perkembangan AI dan dampaknya terhadap peluang karier di industri teknologi informasi.',
    '## Tentang Seminar

Seminar Nasional ini menghadirkan praktisi dan akademisi di bidang Kecerdasan Buatan (AI) untuk membahas tren terkini dan peluang karier yang tersedia bagi lulusan Teknik Informatika.

## Narasumber
- Praktisi AI dari industri teknologi nasional
- Akademisi bidang Machine Learning

## Highlights
Seminar dihadiri lebih dari 200 peserta dari berbagai kampus di Jawa Timur.',
    TRUE,
    '[
      "https://placehold.co/800x600/1e3a5f/ffffff?text=Dokumentasi+Semnas+1",
      "https://placehold.co/800x600/1e3a5f/ffffff?text=Dokumentasi+Semnas+2",
      "https://placehold.co/800x600/1e3a5f/ffffff?text=Dokumentasi+Semnas+3"
    ]',
    '[{"label": "Press Release PDF", "url": "#"}]'
  );
