'use client'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { GENRES, TYPES, routes, typeLabel, type ComicType } from '@/lib/comics'
import { useAdsOn, useLang } from '@/lib/store'
import { Badge, Cover, cx } from '@/components/ui'
import { EmptyBox, H1, META, gridCls, useT, useToast, type Sort } from '../shared'

const GENRE_CHIPS = ['Aksi', 'Fantasi', ...GENRES.filter(g => g !== 'Aksi' && g !== 'Fantasi')]
type Item = (typeof META)[number]
const SORTERS: Record<Sort, (a: Item, b: Item) => number> = {
  pop: (a, b) => b.v - a.v,
  upd: (a, b) => a.day - b.day,
  rating: (a, b) => b.r - a.r,
  new: (a, b) => b.added - a.added,
  az: (a, b) => a.title.localeCompare(b.title),
}

function FChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={cx('cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold', on ? 'border-accent bg-accent-soft text-accent-text' : 'border-line bg-bg text-ink-2')}>{children}</button>
}

export function Cari({ initialQ, initialGenre }: { initialQ: string; initialGenre: string }) {
  const t = useT()
  const [lang] = useLang()
  const ads = useAdsOn()
  const flash = useToast()
  const [q, setQ] = useState(initialQ)
  const [sort, setSort] = useState<Sort>('pop')
  const [fType, setFType] = useState<'Semua' | ComicType>('Semua')
  const [fStatus, setFStatus] = useState<'Semua' | 'Berjalan' | 'Tamat'>('Semua')
  const [fGenres, setFGenres] = useState<string[]>(GENRES.includes(initialGenre) ? [initialGenre] : [])
  const [minR, setMinR] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)

  const needle = q.toLowerCase()
  const res = META.filter(c =>
    (fType === 'Semua' || c.type === fType) &&
    (fStatus === 'Semua' || c.status === fStatus) &&
    (!fGenres.length || fGenres.includes(c.genre)) &&
    c.r * 10 >= minR &&
    `${c.title} ${c.partner} ${c.author ?? ''}`.toLowerCase().includes(needle),
  ).sort(SORTERS[sort])
  const active = +(fType !== 'Semua') + +(fStatus !== 'Semua') + fGenres.length + +(minR > 0)
  const reset = () => { setFType('Semua'); setFStatus('Semua'); setFGenres([]); setMinR(0); setQ('') }

  const groups: { label: string; items: ReactNode }[] = [
    { label: t.type, items: (['Semua', ...TYPES] as const).map(x => <FChip key={x} on={fType === x} onClick={() => setFType(x)}>{x === 'Semua' ? t.all : typeLabel(x, lang)}</FChip>) },
    { label: t.status, items: ([['Semua', t.all], ['Berjalan', t.ongoing], ['Tamat', t.done]] as const).map(([v, l]) => <FChip key={v} on={fStatus === v} onClick={() => setFStatus(v)}>{l}</FChip>) },
    { label: t.genre, items: GENRE_CHIPS.map(g => <FChip key={g} on={fGenres.includes(g)} onClick={() => setFGenres(fGenres.includes(g) ? fGenres.filter(x => x !== g) : [...fGenres, g])}>{g}</FChip>) },
  ]

  const cards: ReactNode[] = res.map(c => (
    <Link key={c.id} href={routes.comic(c.id)} className="flex flex-col gap-2 text-ink hover:no-underline">
      <Cover h={c.h} label={false}>
        <Badge className="left-2 top-2">{typeLabel(c.type, lang)}</Badge>
        <Badge className="right-2 top-2">★ {c.r.toFixed(1)}</Badge>
        <span className={cx('absolute bottom-2 right-2 rounded-chip px-[7px] py-[3px] text-[10px] font-extrabold text-white', c.status === 'Tamat' ? 'bg-accent' : 'bg-black/55')}>{c.status === 'Tamat' ? t.done : t.ongoing}</span>
      </Cover>
      <div className="truncate text-[15px] font-bold">{c.title}</div>
      <div className="text-xs text-ink-3">{c.genre} · Ch {c.ch}</div>
    </Link>
  ))
  if (ads && cards.length > 6) cards.splice(6, 0, (
    <div key="ad" data-slot="browse_native" className="flex aspect-cover flex-col items-center justify-center gap-1 rounded-card border border-dashed border-line-2 bg-surface font-mono text-[11px] text-ink-3">
      <span className="font-medium text-ink-2">{t.sponsored}</span><span>native</span><span>browse_native</span>
    </div>
  ))

  return (
    <>
      <div className="flex flex-col gap-3.5">
        <H1>{t.browse}</H1>
        <div className="flex flex-wrap gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPh} className="h-12 min-w-[220px] flex-1 rounded-card border border-line bg-surface px-4 text-[15px] text-ink outline-none" />
          <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="h-12 rounded-card border border-line bg-surface px-3 text-sm font-semibold text-ink">
            {t.sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={() => setFilterOpen(!filterOpen)} className="h-12 cursor-pointer rounded-card border-0 bg-ink px-4 text-sm font-bold text-bg md:hidden">Filter{active ? ` · ${active}` : ''}</button>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-7 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={cx(filterOpen ? 'flex' : 'hidden md:flex', 'top-[84px] flex-col gap-5 rounded-[14px] border border-line bg-surface p-[18px] md:sticky')}>
          {groups.map(g => (
            <div key={g.label} className="flex flex-col gap-2">
              <div className="text-xs font-extrabold tracking-[0.03em] text-ink-3">{g.label}</div>
              <div className="flex flex-wrap gap-1.5">{g.items}</div>
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs"><span className="font-extrabold tracking-[0.03em] text-ink-3">{t.minRating}</span><span className="font-mono text-ink-2">★ {minR ? (minR / 10).toFixed(1) : '0'}</span></div>
            <input type="range" min={0} max={49} step={1} value={minR} onChange={e => setMinR(+e.target.value)} className="w-full accent-accent" />
          </div>
          <button onClick={reset} className="h-[38px] cursor-pointer rounded-[9px] border border-line bg-bg text-[13px] font-bold text-ink-2">{t.reset}</button>
        </aside>
        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="text-[13px] text-ink-3">{t.result(res.length)}</div>
          {res.length > 0 && <div className={gridCls}>{cards}</div>}
          {res.length === 0 && (
            <EmptyBox>
              <div className="text-[17px] font-extrabold">{t.noResult}</div>
              <div className="text-sm text-ink-3">{t.noResultSub}</div>
              <button onClick={() => flash(t.requested)} className="h-10 cursor-pointer rounded-btn border-0 bg-accent px-4 text-[13px] font-bold text-white">{t.request}</button>
            </EmptyBox>
          )}
        </div>
      </div>
    </>
  )
}
