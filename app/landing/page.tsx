import type { Metadata } from 'next'
import { Landing } from './Landing'

const title = 'nacp · Baca manga, manhwa, manhua & komik lokal berlisensi'
const description = 'nacp adalah tempat baca komik berlisensi dalam Bahasa Indonesia: manga, manhwa, manhua, dan komik lokal. Gratis dengan iklan, atau Premium tanpa iklan.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://nacp.id/landing' },
  openGraph: { title, description, url: 'https://nacp.id/landing', siteName: 'nacp', locale: 'id_ID', alternateLocale: ['en_US'], type: 'website' },
}

const jsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'nacp', url: 'https://nacp.id', inLanguage: ['id', 'en'], potentialAction: { '@type': 'SearchAction', target: 'https://nacp.id/cari?q={q}', 'query-input': 'required name=q' } }

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Landing />
    </>
  )
}
