import type { Metadata } from 'next'
import { Profil } from './profil'

export const metadata: Metadata = { title: 'Profil · nacp' }

export default function Page() {
  return <Profil />
}
