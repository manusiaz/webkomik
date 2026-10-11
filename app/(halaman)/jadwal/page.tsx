import type { Metadata } from 'next'
import { Jadwal } from './jadwal'

export const metadata: Metadata = { title: 'Jadwal Update · nacp' }

export default function Page() {
  return <Jadwal />
}
