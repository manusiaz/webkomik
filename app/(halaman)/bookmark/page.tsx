import type { Metadata } from 'next'
import { Bookmark } from './bookmark'

export const metadata: Metadata = { title: 'Bookmark · nacp' }

export default function Page() {
  return <Bookmark />
}
