<script setup lang="ts">
import { useSiteSettings } from '@/composables/useSiteSettings'

const { organizationAbbr } = useSiteSettings()
</script>

<template>
  <section class="not-found">
    <div class="container nf-inner">
      <span class="eyebrow">{{ organizationAbbr }}</span>
      <h1>404</h1>
      <p class="lead">Halaman yang kamu cari tidak ditemukan.</p>
      <p class="muted">
        Mungkin halaman ini sudah dipindahkan atau sudah tidak tersedia lagi di
        versi terbaru website HMPTI.
      </p>
      <div class="cta-row">
        <RouterLink to="/" class="btn btn-primary">Kembali ke Beranda</RouterLink>
        <RouterLink to="/contact" class="btn btn-outline">Hubungi Kami</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  padding: 6rem 0;
  text-align: center;
}
.nf-inner {
  max-width: 540px;
}
.nf-inner h1 {
  font-size: clamp(5rem, 20vw, 9rem);
  font-weight: 900;
  color: var(--brand-primary);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.05em;
}
.lead {
  font-size: 1.25rem;
  margin: 1rem 0 0.5rem;
  color: var(--text-primary);
}
.cta-row {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}
</style>
