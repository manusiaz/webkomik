import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { byId, COMICS } from '@/lib/comics'
import { Reader } from './Reader'

type Props = { params: Promise<{ id: string; ch: string }> }

export const generateStaticParams = () => COMICS.flatMap(c => [{ id: c.id, ch: '1' }, { id: c.id, ch: String(c.ch) }])

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, ch } = await params
  const c = byId[id]
  return c ? { title: `${c.title} · Chapter ${ch} · nacp` } : {}
}

export default async function Page({ params }: Props) {
  const { id, ch } = await params
  const c = byId[id]
  const n = Number(ch)
  if (!c || !Number.isInteger(n) || n < 1 || n > c.ch) notFound()
  return <Reader key={n} id={id} ch={n} />
}
