// =============================================================================
// Seed Mock Data
// Mirrors the rows that supabase/seed/*.sql inserts, exposed as TypeScript
// fixtures. Used as a fallback when Supabase is not configured so the public
// portal still renders a complete preview in development.
//
// IMPORTANT: Keep in sync with supabase/seed/seed_*.sql
// =============================================================================

import type {
  Cabinet,
  CabinetDepartment,
  CabinetMemberWithDepartment,
  Event,
  OspekContent,
  Project,
  SiteSettings,
} from '@/types/database'

// ── Site Settings fallback (matches seed_site_settings.sql) ──────────────────

export const seedSiteSettings: SiteSettings = {
  id: 1,
  organization_name: 'Himpunan Mahasiswa Prodi Teknik Informatika',
  organization_abbr: 'HMPTI UNESA',
  cabinet_name: 'Kabinet Cakrawala',
  cabinet_period: '2025/2026',
  tagline: 'Bergerak, Berinovasi, Berdampak.',
  logo_url: null,
  hero_image_url: null,
  social_links: {
    instagram: 'https://instagram.com/hmptiunesa',
    linkedin: 'https://linkedin.com/company/hmptiunesa',
    youtube: 'https://youtube.com/@hmptiunesa',
    github: 'https://github.com/hmptiunesa',
    tiktok: 'https://tiktok.com/@hmptiunesa',
    email: 'hmpti@unesa.ac.id',
  },
  contact_email: 'hmpti@unesa.ac.id',
  secretariat_address:
    'Sekretariat HMPTI, Gedung A9, Universitas Negeri Surabaya, ' +
    'Jl. Ketintang, Surabaya 60231',
  gmaps_embed_url:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.7543' +
    '!2d112.7311!3d-7.3149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768' +
    '!4f13.1!3m3!1m2!1s0x2dd7fb7c3f3b!2sUniversitas+Negeri+Surabaya' +
    '!5e0!3m2!1sen!2sid',
  stats: {
    department_count: 5,
    completed_programs: 20,
    active_committee_count: 60,
  },
  spotlight_mode: 'showcase',
  updated_by: null,
  updated_at: new Date(0).toISOString(),
}

// ── Cabinet seed (matches seed_sample_cabinet.sql) ────────────────────────────

const CABINET_ID = '11111111-1111-1111-1111-111111111111'
const DEPT_BPH = '21111111-1111-1111-1111-111111111111'
const DEPT_MEDKOMINFO = '22222222-2222-2222-2222-222222222222'
const DEPT_DIKTEK = '33333333-3333-3333-3333-333333333333'
const DEPT_WIRAUSAHA = '44444444-4444-4444-4444-444444444444'
const DEPT_PENGMAS = '55555555-5555-5555-5555-555555555555'

export const seedActiveCabinet: Cabinet = {
  id: CABINET_ID,
  name: 'Kabinet Cakrawala',
  period: '2025/2026',
  status: 'active',
  vision:
    'Menjadi himpunan mahasiswa yang inovatif, kolaboratif, dan berdampak ' +
    'bagi civitas akademika Teknik Informatika UNESA.',
  mission:
    '1. Mengembangkan potensi akademik dan non-akademik anggota.\n' +
    '2. Mempererat sinergi antarmahasiswa Teknik Informatika.\n' +
    '3. Menjadi wadah kreativitas dan inovasi teknologi informasi.\n' +
    '4. Membangun jaringan kolaborasi yang luas dan berkelanjutan.',
  history_text:
    'HMPTI UNESA berdiri sebagai representasi mahasiswa Program Studi ' +
    'Teknik Informatika Universitas Negeri Surabaya. Berawal dari semangat ' +
    'kebersamaan dan keinginan untuk berkontribusi, HMPTI terus bertumbuh ' +
    'menjadi organisasi yang aktif, inovatif, dan berdampak.',
  logo_url: null,
  hero_image_url: null,
  sort_order: 0,
  created_by: null,
  updated_by: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
}

export const seedDepartments: CabinetDepartment[] = [
  {
    id: DEPT_BPH, cabinet_id: CABINET_ID,
    name: 'Badan Pengurus Harian', code: 'BPH',
    description: 'Koordinasi dan pengawasan organisasi secara keseluruhan.',
    icon_url: null, sort_order: 0,
    created_at: new Date(0).toISOString(),
  },
  {
    id: DEPT_MEDKOMINFO, cabinet_id: CABINET_ID,
    name: 'Departemen Media & Komunikasi Informasi', code: 'MEDKOMINFO',
    description: 'Mengelola media sosial, dokumentasi, dan komunikasi eksternal organisasi.',
    icon_url: null, sort_order: 1,
    created_at: new Date(0).toISOString(),
  },
  {
    id: DEPT_DIKTEK, cabinet_id: CABINET_ID,
    name: 'Departemen Pendidikan & Teknologi', code: 'DIKTEK',
    description: 'Menyelenggarakan kegiatan pendidikan, pelatihan, dan inovasi teknologi.',
    icon_url: null, sort_order: 2,
    created_at: new Date(0).toISOString(),
  },
  {
    id: DEPT_WIRAUSAHA, cabinet_id: CABINET_ID,
    name: 'Departemen Kewirausahaan', code: 'WIRAUSAHA',
    description: 'Mendorong jiwa kewirausahaan dan ekonomi kreatif di kalangan mahasiswa TI.',
    icon_url: null, sort_order: 3,
    created_at: new Date(0).toISOString(),
  },
  {
    id: DEPT_PENGMAS, cabinet_id: CABINET_ID,
    name: 'Departemen Pengabdian Masyarakat', code: 'PENGMAS',
    description: 'Menggerakkan kontribusi sosial mahasiswa TI bagi masyarakat luas.',
    icon_url: null, sort_order: 4,
    created_at: new Date(0).toISOString(),
  },
]

const deptById = (id: string): CabinetDepartment =>
  seedDepartments.find((d) => d.id === id)!

const memberWithDept = (
  partial: Omit<CabinetMemberWithDepartment, 'department' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>,
  deptId: string | null,
): CabinetMemberWithDepartment => ({
  ...partial,
  department: deptId ? deptById(deptId) : null,
  created_by: null,
  updated_by: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
})

export const seedMembers: CabinetMemberWithDepartment[] = [
  memberWithDept({
    id: 'm-001', cabinet_id: CABINET_ID, department_id: DEPT_BPH,
    name: 'Placeholder Ketua Umum', role_title: 'Ketua Umum', level: 'bph',
    photo_url: null, display_order: 1,
    social_links: { linkedin: '', github: '' },
  }, DEPT_BPH),
  memberWithDept({
    id: 'm-002', cabinet_id: CABINET_ID, department_id: DEPT_BPH,
    name: 'Placeholder Wakil Ketua', role_title: 'Wakil Ketua Umum', level: 'bph',
    photo_url: null, display_order: 2,
    social_links: { linkedin: '', github: '' },
  }, DEPT_BPH),
  memberWithDept({
    id: 'm-003', cabinet_id: CABINET_ID, department_id: DEPT_BPH,
    name: 'Placeholder Sekretaris I', role_title: 'Sekretaris I', level: 'bph',
    photo_url: null, display_order: 3,
    social_links: { linkedin: '', github: '' },
  }, DEPT_BPH),
  memberWithDept({
    id: 'm-004', cabinet_id: CABINET_ID, department_id: DEPT_BPH,
    name: 'Placeholder Bendahara I', role_title: 'Bendahara I', level: 'bph',
    photo_url: null, display_order: 4,
    social_links: { linkedin: '', github: '' },
  }, DEPT_BPH),
  memberWithDept({
    id: 'm-005', cabinet_id: CABINET_ID, department_id: DEPT_MEDKOMINFO,
    name: 'Placeholder Koordinator MEDKOMINFO', role_title: 'Koordinator Departemen',
    level: 'coordinator', photo_url: null, display_order: 5,
    social_links: { linkedin: '', github: '' },
  }, DEPT_MEDKOMINFO),
  memberWithDept({
    id: 'm-006', cabinet_id: CABINET_ID, department_id: DEPT_DIKTEK,
    name: 'Placeholder Koordinator DIKTEK', role_title: 'Koordinator Departemen',
    level: 'coordinator', photo_url: null, display_order: 6,
    social_links: { linkedin: '', github: '' },
  }, DEPT_DIKTEK),
]

export const seedCabinetHistory: Cabinet[] = [
  {
    id: '11111111-1111-1111-1111-222222222222',
    name: 'Kabinet [Nama Lama]', period: '2024/2025', status: 'archived',
    vision: null, mission: null, history_text: null,
    logo_url: null, hero_image_url: null, sort_order: 1,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: '11111111-1111-1111-1111-333333333333',
    name: 'Kabinet [Nama Lebih Lama]', period: '2023/2024', status: 'archived',
    vision: null, mission: null, history_text: null,
    logo_url: null, hero_image_url: null, sort_order: 2,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
]

// ── Events seed (matches seed_sample_events.sql) ─────────────────────────────

export const seedEvents: Event[] = [
  {
    id: 'e-001',
    title: 'Workshop Git & GitHub untuk Mahasiswa TI',
    slug: 'workshop-git-github-2025',
    category: 'workshop',
    status: 'upcoming',
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    location: 'Lab Komputer A9, UNESA Ketintang',
    summary:
      'Workshop praktis pengenalan version control menggunakan Git dan GitHub ' +
      'untuk mahasiswa Teknik Informatika UNESA.',
    description:
      '## Deskripsi\n\nWorkshop ini membekali mahasiswa TI dengan kemampuan ' +
      'dasar version control menggunakan Git dan GitHub.\n\n## Materi\n- Konsep version control\n- Instalasi Git\n- Workflow GitHub: fork, branch, PR\n- Kolaborasi tim',
    poster_url: null,
    registration_url: '#',
    contact_person: 'MEDKOMINFO HMPTI',
    outcome_notes: null,
    press_release: null,
    documentation_images: [],
    public_documents: [],
    is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: 'e-002',
    title: 'Seminar Nasional Kecerdasan Buatan & Masa Depan Karier TI',
    slug: 'semnas-ai-karier-ti-2025',
    category: 'seminar',
    status: 'completed',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    location: 'Auditorium Universitas Negeri Surabaya',
    summary:
      'Seminar nasional membahas perkembangan AI dan dampaknya terhadap ' +
      'peluang karier di industri teknologi informasi.',
    description:
      '## Tentang Seminar\n\nSeminar Nasional menghadirkan praktisi dan ' +
      'akademisi di bidang Kecerdasan Buatan untuk membahas tren terkini.',
    poster_url: null,
    registration_url: null,
    contact_person: null,
    outcome_notes:
      'Seminar dihadiri lebih dari 200 peserta dari berbagai kampus di Jawa Timur.',
    press_release:
      '## Press Release\n\nAcara berlangsung sukses dengan antusiasme ' +
      'tinggi dari peserta.',
    documentation_images: [
      'https://placehold.co/800x600/1e3a5f/ffffff?text=Dokumentasi+Semnas+1',
      'https://placehold.co/800x600/1e3a5f/ffffff?text=Dokumentasi+Semnas+2',
      'https://placehold.co/800x600/1e3a5f/ffffff?text=Dokumentasi+Semnas+3',
    ],
    public_documents: [{ label: 'Press Release PDF', url: '#' }],
    is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
]

// ── Projects seed (matches seed_sample_projects.sql) ─────────────────────────

export const seedProjects: Project[] = [
  {
    id: 'p-001',
    title: 'SiAkad — Sistem Informasi Akademik Sederhana',
    slug: 'siakad-sistem-informasi-akademik',
    category: 'web',
    tags: ['Vue.js', 'Node.js', 'PostgreSQL', 'Docker'],
    description:
      'Aplikasi web manajemen data akademik sederhana yang memungkinkan ' +
      'dosen mengelola nilai, jadwal, dan data mahasiswa secara efisien. ' +
      'Dibangun menggunakan Vue.js untuk frontend dan Node.js + PostgreSQL untuk backend.',
    thumbnail_url: 'https://placehold.co/600x400/3b6cf4/ffffff?text=SiAkad+Preview',
    screenshots: [],
    contributors: [
      { name: 'Budi Santoso', role: 'Full-stack Developer' },
      { name: 'Dewi Rahayu', role: 'UI/UX Designer' },
      { name: 'Arif Hidayat', role: 'Backend Developer' },
    ],
    demo_url: '#',
    repo_url: 'https://github.com/hmptiunesa/siakad-placeholder',
    other_links: [],
    achievements: 'Juara 2 - Lomba Karya Inovatif Mahasiswa UNESA 2024',
    is_featured: true,
    is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: 'p-002',
    title: 'EcoTrack — Aplikasi Monitoring Sampah Berbasis IoT',
    slug: 'ecotrack-monitoring-sampah-iot',
    category: 'iot',
    tags: ['Arduino', 'MQTT', 'React', 'Firebase'],
    description:
      'Sistem monitoring tempat sampah pintar berbasis IoT yang mendeteksi ' +
      'tingkat kepenuhan dan mengirimkan notifikasi real-time kepada ' +
      'petugas kebersihan.',
    thumbnail_url: 'https://placehold.co/600x400/16a34a/ffffff?text=EcoTrack+Preview',
    screenshots: [],
    contributors: [
      { name: 'Rizky Pratama', role: 'IoT Engineer' },
      { name: 'Siti Aminah', role: 'Frontend Developer' },
    ],
    demo_url: '#',
    repo_url: 'https://github.com/hmptiunesa/ecotrack-placeholder',
    other_links: [],
    achievements: 'Finalis - Gemastik XVII Kategori IoT',
    is_featured: false,
    is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: 'p-003',
    title: 'NusantaraLingua — Kamus Bahasa Daerah Digital',
    slug: 'nusantaralingua-kamus-bahasa-daerah',
    category: 'mobile',
    tags: ['Flutter', 'Dart', 'SQLite', 'Python'],
    description:
      'Aplikasi mobile kamus bahasa daerah Nusantara yang memungkinkan ' +
      'pengguna mencari, mendengarkan pelafalan, dan mempelajari kosa kata ' +
      'dari berbagai bahasa daerah Indonesia.',
    thumbnail_url: 'https://placehold.co/600x400/d97706/ffffff?text=NusantaraLingua+Preview',
    screenshots: [],
    contributors: [
      { name: 'Ahmad Fauzan', role: 'Mobile Developer' },
      { name: 'Clara Situmorang', role: 'Data Curator & Backend' },
      { name: 'Yoga Permana', role: 'UI Designer' },
    ],
    demo_url: '#',
    repo_url: 'https://github.com/hmptiunesa/nusantaralingua-placeholder',
    other_links: [],
    achievements: null,
    is_featured: false,
    is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
]

// ── Ospek content seed (no SQL file yet — representative fixture) ───────────

export const seedOspekContent: OspekContent[] = [
  {
    id: 'o-001', section_type: 'schedule',
    title: 'Upacara Pembukaan PKKMB',
    description: 'Upacara pembukaan resmi PKKMB Fakultas Teknik.',
    scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Gedung A10 UNESA',
    link_url: null, link_label: null, file_url: null,
    group_identifier: null, sort_order: 1, is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: 'o-002', section_type: 'announcement',
    title: 'Pembagian Kelompok PKKMB',
    description: 'Kelompok telah diumumkan. Cek detail kelompok kamu.',
    scheduled_at: null, location: null,
    link_url: '/about', link_label: 'Lihat Detail',
    file_url: null, group_identifier: null,
    sort_order: 2, is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: 'o-003', section_type: 'handbook',
    title: 'Buku Panduan PKKMB 2025',
    description: 'Unduh buku panduan lengkap PKKMB 2025.',
    scheduled_at: null, location: null,
    link_url: null, link_label: null,
    file_url: 'https://placehold.co/600x800/1e3a5f/ffffff?text=Buku+Panduan+PKKMB',
    group_identifier: null, sort_order: 3, is_published: true,
    created_by: null, updated_by: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
]
