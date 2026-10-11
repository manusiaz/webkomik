import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'nacp',
    short_name: 'nacp',
    description: 'Baca manga, manhwa, manhua, dan komik lokal berlisensi.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1013',
    theme_color: '#0F1013',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}
