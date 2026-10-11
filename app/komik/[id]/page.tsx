import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { byId, COMICS } from '@/lib/comics'
import { Detail } from './Detail'

type Props = { params: Promise<{ id: string }> }

export const generateStaticParams = () => COMICS.map(c => ({ id: c.id }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = byId[(await params).id]
  if (!c) return {}
  return { title: `${c.title} · nacp`, description: c.syn?.id ?? `${c.title} — ${c.type}, ${c.genre}. Dirilis resmi bersama ${c.partner}.` }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  if (!byId[id]) notFound()
  return <Detail id={id} />
}
