<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// Interface untuk data berita
interface NewsItem {
  id: string
  imageUrl: string
  title: string
  category: string
  date: string
  description: string
  content?: string
  featured?: boolean
  tags?: string[]
}

// Data berita
const article = ref<NewsItem | null>(null)
const loading = ref(true)
const error = ref('')

// Data kategori
const categories: Record<string, string> = {
    'program-kerja': 'Program Kerja',
    'teknologi': 'Teknologi',
    'akademik': 'Akademik',
    'organisasi': 'Organisasi',
    'kerjasama': 'Kerjasama',
    'beasiswa': 'Beasiswa',
    'karir': 'Karir',
    'announcement': 'Pengumuman',
    'article': 'Artikel',
    'event': 'Kegiatan',
    'achievement': 'Prestasi',
    'other': 'Lainnya'
}

// Tags (Fallback/Sidebar)
const staticTags = [
  'Web Development', 'Mobile App', 'UI/UX', 'Programming', 'Cloud',
  'IoT', 'AI', 'Blockchain', 'Data Science', 'Cybersecurity',
]

// Artikel terkait
const relatedArticles = ref<NewsItem[]>([])

const getCategoryName = (categoryId: string): string => {
  return categories[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
}

const goToNewsDetail = (itemId: string) => {
  router.push(`/berita/${itemId}`)
}

const goBack = () => {
  router.push('/berita')
}

const fetchArticle = async (id: string) => {
    try {
        loading.value = true
        const response = await axios.get(`/api/news/${id}`)
        const data = response.data
        
        const pubDate = new Date(data.publishDate || data.createdAt)
        const formattedDate = pubDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        
        article.value = {
            id: data._id,
            imageUrl: data.featuredImage || data.thumbnail || 'https://picsum.photos/id/1/1200/600',
            title: data.title,
            category: data.category,
            date: formattedDate,
            description: data.summary,
            content: data.content,
            featured: data.status === 'published',
            tags: data.tags || []
        }
        
        // Fetch related articles
        fetchRelatedArticles(data.category, data._id)
        
    } catch (err) {
        console.error('Error fetching article:', err)
        error.value = 'Gagal memuat artikel'
        // router.push('/berita') // Redirect if not found?
    } finally {
        loading.value = false
    }
}

const fetchRelatedArticles = async (category: string, currentId: string) => {
    try {
        const response = await axios.get(`/api/news`, { params: { category, limit: 4, status: 'published' } })
        const backendData = response.data.news || (Array.isArray(response.data) ? response.data : [])
        
        if (Array.isArray(backendData)) {
             relatedArticles.value = backendData
                .filter((item: any) => item._id !== currentId)
                .slice(0, 3)
                .map((item: any) => {
                    const pubDate = new Date(item.publishDate)
                    const formattedDate = pubDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    
                    return {
                        id: item._id,
                        imageUrl: item.thumbnail || item.featuredImage || 'https://picsum.photos/id/2/600/400',
                        title: item.title,
                        category: item.category,
                        date: formattedDate,
                        description: item.summary
                    }
                })
        }
    } catch (err) {
        console.error('Error fetching related articles:', err)
    }
}

// Watch rute parameter changes to refetch data (e.g. clicking related article)
watch(() => route.params.id, (newId) => {
    if (newId) fetchArticle(newId as string)
})

onMounted(() => {
  // Mendapatkan ID artikel dari parameter URL
  const newsId = route.params.id as string
  if (newsId) {
      fetchArticle(newsId)
  }
  
  // Scroll ke atas halaman
  window.scrollTo(0, 0)
})
</script>

<template>
  <div v-if="article" class="news-detail-page">
    <!-- Hero Section -->
    <section class="news-hero" :style="{ backgroundImage: `url(${article.imageUrl})` }">
      <div class="hero-overlay"></div>
      <button class="back-button" @click="goBack"><span class="back-arrow">←</span> Kembali</button>
      <div class="hero-content container">
        <h1 class="hero-title">{{ article.title }}</h1>
        <div class="hero-meta">
          <span class="meta-date">{{ article.date }}</span>
          <span class="meta-divider">•</span>
          <span class="meta-author">HIMTI UNESA</span>
          <span class="meta-divider">•</span>
          <span class="hero-badge">{{ getCategoryName(article.category) }}</span>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="content-wrapper">
        <!-- Main Content -->
        <main class="article-content">
          <div class="article-body">
            <!-- Artikel Content -->
            <p v-html="article.content"></p>

            <!-- Tags -->
            <div class="article-tags" v-if="article.tags && article.tags.length > 0">
              <span class="tag" v-for="(tag, index) in article.tags" :key="index">{{
                tag
              }}</span>
            </div>

            <!-- Share Section -->
            <div class="article-share">
              <h4>Bagikan artikel ini</h4>
              <div class="share-buttons">
                <button class="share-btn facebook">
                  <span class="share-icon">f</span>
                  Facebook
                </button>
                <button class="share-btn twitter">
                  <span class="share-icon">t</span>
                  Twitter
                </button>
                <button class="share-btn whatsapp">
                  <span class="share-icon">w</span>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </main>

        <!-- Sidebar -->
        <aside class="article-sidebar">
          <!-- Author Section -->
          <div class="sidebar-section author-section">
            <div class="author-image"></div>
            <div class="author-info">
              <h4>HIMTI UNESA</h4>
              <p>Himpunan Mahasiswa Teknik Informatika Universitas Negeri Surabaya</p>
              <div class="author-social">
                <a href="#" class="social-link">Instagram</a>
                <a href="#" class="social-link">Twitter</a>
              </div>
            </div>
          </div>

          <!-- Related Articles -->
          <div class="sidebar-section related-articles">
            <h3>Artikel Terkait</h3>
            <div class="related-list">
              <div
                class="related-item"
                v-for="item in relatedArticles"
                :key="item.id"
                @click="goToNewsDetail(item.id)"
              >
                <div
                  class="related-image"
                  :style="{ backgroundImage: `url(${item.imageUrl})` }"
                ></div>
                <div class="related-content">
                  <span class="related-category">{{ getCategoryName(item.category) }}</span>
                  <h4>{{ item.title }}</h4>
                  <span class="related-date">{{ item.date }}</span>
                </div>
              </div>

              <!-- Jika tidak ada artikel terkait -->
              <div v-if="relatedArticles.length === 0" class="no-related">
                <p>Tidak ada artikel terkait saat ini.</p>
              </div>
            </div>
          </div>

          <!-- Tags Section -->
          <div class="sidebar-section tag-section">
            <h3>Tags</h3>
            <div class="tag-cloud">
              <a href="#" v-for="(tag, index) in staticTags" :key="index" class="tag">{{ tag }}</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="article === null" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Memuat artikel...</p>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --secondary-color: #7c3aed;
  --accent-color: #f97316;
  --background: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-light: #94a3b8;
  --border-color: #e2e8f0;
}

.news-detail-page {
  width: 100%;
  background-color: var(--background);
  color: var(--text-primary);
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ---------- Hero Section ---------- */
.news-hero {
  position: relative;
  height: 60vh;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 4rem;
  background-size: cover;
  background-position: center;
  margin-bottom: 3rem;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  max-width: 800px;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.back-arrow {
  margin-right: 0.5rem;
  font-size: 1.25rem;
}

.hero-badge {
  display: inline-block;
  background-color: var(--accent-color);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-meta {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.meta-divider {
  margin: 0 0.75rem;
}

/* Content Layout */
.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
  margin-bottom: 4rem;
}

/* Article Content */
.article-content {
  background-color: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.article-body {
  padding: 2.5rem;
}

.article-body p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  font-size: 1.1rem;
  color: var(--text-primary);
}

/* Article Tags */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 2.5rem 0;
}

.tag {
  display: inline-block;
  background-color: #f1f5f9;
  color: var(--text-secondary);
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.25rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Share Section */
.article-share {
  margin-top: 2.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

.article-share h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.share-buttons {
  display: flex;
  gap: 1rem;
}

.share-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  color: white;
  transition: opacity 0.2s ease;
}

.share-btn:hover {
  opacity: 0.9;
}

.share-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-right: 0.5rem;
  font-weight: bold;
}

.facebook {
  background-color: #1877f2;
}

.twitter {
  background-color: #1da1f2;
}

.whatsapp {
  background-color: #25d366;
}

/* Sidebar */
.article-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-section {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.sidebar-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 700;
  position: relative;
}

.sidebar-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 50px;
  height: 2px;
  background-color: var(--primary-color);
}

/* Author Section */
.author-section {
  display: flex;
  gap: 1rem;
}

.author-image {
  width: 80px;
  height: 80px;
  border-radius: 20%;
  background-color: var(--primary-color);
  flex-shrink: 0;
  background-image: url('@/assets/logo.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.author-info {
  flex: 1;
}

.author-info h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.author-info p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.author-social {
  display: flex;
  gap: 0.75rem;
}

.social-link {
  font-size: 0.8rem;
  color: var(--primary-color);
  text-decoration: none;
}

.social-link:hover {
  text-decoration: underline;
}

/* Related Articles */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.related-item {
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.related-item:hover {
  transform: translateX(5px);
}

.related-image {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.related-content {
  flex: 1;
}

.related-category {
  font-size: 0.7rem;
  color: var(--accent-color);
  font-weight: 600;
  text-transform: uppercase;
}

.related-content h4 {
  font-size: 0.95rem;
  color: var(--text-primary);
  margin: 0.25rem 0 0.5rem;
  line-height: 1.4;
}

.related-date {
  font-size: 0.75rem;
  color: var(--text-light);
}

.no-related {
  padding: 1rem;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
  text-align: center;
}

.no-related p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Tag Cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1.5fr 1fr;
  }

  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .news-hero {
    height: 50vh;
    min-height: 400px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .article-body {
    padding: 1.5rem;
  }

  .share-buttons {
    flex-wrap: wrap;
  }

  .share-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .news-hero {
    height: auto;
    min-height: 350px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-badge {
    font-size: 0.75rem;
  }

  .article-body {
    padding: 1.25rem;
  }

  .author-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .author-social {
    justify-content: center;
  }
}
</style>
