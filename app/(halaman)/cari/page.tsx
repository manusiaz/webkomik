import type { Metadata } from 'next'
import { Cari } from './cari'

export const metadata: Metadata = { title: 'Daftar Komik · nacp' }

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[]; genre?: string | string[] }> }) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const genre = typeof sp.genre === 'string' ? sp.genre : ''
  return <Cari key={q + '|' + genre} initialQ={q} initialGenre={genre} />
}
