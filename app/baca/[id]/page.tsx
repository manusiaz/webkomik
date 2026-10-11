import { notFound } from 'next/navigation'
import { byId, COMICS } from '@/lib/comics'
import { Resume } from './Resume'

export const generateStaticParams = () => COMICS.map(c => ({ id: c.id }))

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!byId[id]) notFound()
  return <Resume id={id} />
}
