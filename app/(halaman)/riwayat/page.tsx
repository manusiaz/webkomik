import type { Metadata } from 'next'
import { Riwayat } from './riwayat'

export const metadata: Metadata = { title: 'Riwayat Baca · nacp' }

export default function Page() {
  return <Riwayat />
}
