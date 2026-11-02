-- =============================================================================
-- Seed: Sample Showcase Projects (Development Placeholder)
-- Three showcase projects with representative data for /spotlight page.
-- =============================================================================

INSERT INTO public.projects
  (title, slug, category, tags, description, thumbnail_url,
   contributors, demo_url, repo_url, achievements, is_featured, is_published)
VALUES
  (
    'SiAkad — Sistem Informasi Akademik Sederhana',
    'siakad-sistem-informasi-akademik',
    'web',
    '["Vue.js", "Node.js", "PostgreSQL", "Docker"]',
    'Aplikasi web manajemen data akademik sederhana yang memungkinkan dosen mengelola nilai, jadwal, dan data mahasiswa secara efisien. Dibangun menggunakan Vue.js untuk frontend dan Node.js + PostgreSQL untuk backend.',
    'https://placehold.co/600x400/3b6cf4/ffffff?text=SiAkad+Preview',
    '[
      {"name": "Budi Santoso", "role": "Full-stack Developer"},
      {"name": "Dewi Rahayu", "role": "UI/UX Designer"},
      {"name": "Arif Hidayat", "role": "Backend Developer"}
    ]',
    '#',
    'https://github.com/hmptiunesa/siakad-placeholder',
    'Juara 2 - Lomba Karya Inovatif Mahasiswa UNESA 2024',
    TRUE,
    TRUE
  ),
  (
    'EcoTrack — Aplikasi Monitoring Sampah Berbasis IoT',
    'ecotrack-monitoring-sampah-iot',
    'iot',
    '["Arduino", "MQTT", "React", "Firebase"]',
    'Sistem monitoring tempat sampah pintar berbasis IoT yang mendeteksi tingkat kepenuhan dan mengirimkan notifikasi real-time kepada petugas kebersihan. Menggunakan sensor ultrasonik dan koneksi MQTT.',
    'https://placehold.co/600x400/16a34a/ffffff?text=EcoTrack+Preview',
    '[
      {"name": "Rizky Pratama", "role": "IoT Engineer"},
      {"name": "Siti Aminah", "role": "Frontend Developer"}
    ]',
    '#',
    'https://github.com/hmptiunesa/ecotrack-placeholder',
    'Finalis - Gemastik XVII Kategori IoT',
    FALSE,
    TRUE
  ),
  (
    'NusantaraLingua — Kamus Bahasa Daerah Digital',
    'nusantaralingua-kamus-bahasa-daerah',
    'mobile',
    '["Flutter", "Dart", "SQLite", "Python"]',
    'Aplikasi mobile kamus bahasa daerah Nusantara yang memungkinkan pengguna mencari, mendengarkan pelafalan, dan mempelajari kosa kata dari berbagai bahasa daerah Indonesia. Database bahasa dikurasi bersama komunitas.',
    'https://placehold.co/600x400/d97706/ffffff?text=NusantaraLingua+Preview',
    '[
      {"name": "Ahmad Fauzan", "role": "Mobile Developer"},
      {"name": "Clara Situmorang", "role": "Data Curator & Backend"},
      {"name": "Yoga Permana", "role": "UI Designer"}
    ]',
    '#',
    'https://github.com/hmptiunesa/nusantaralingua-placeholder',
    NULL,
    FALSE,
    TRUE
  );
