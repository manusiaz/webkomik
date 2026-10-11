import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeSync } from '@/components/ThemeSync'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' })

export const metadata: Metadata = {
  title: 'nacp · Baca komik, manga, manhwa, manhua',
  description: 'nacp adalah tempat baca komik berlisensi dalam Bahasa Indonesia. Manga, manhwa, manhua, dan komik lokal dirilis bersama partner resmi.',
}
export const viewport: Viewport = { themeColor: '#0F1013' }

const noFlash = `try{var t=JSON.parse(localStorage.getItem('nacp-theme'));if(t)document.documentElement.dataset.theme=t;var l=JSON.parse(localStorage.getItem('nacp-lang'));if(l)document.documentElement.lang=l}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="dark" className={`${jakarta.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: noFlash }} /></head>
      <body>
        <ThemeSync />
        {children}
      </body>
    </html>
  )
}
