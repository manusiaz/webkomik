'use client'
import type { CSSProperties } from 'react'
import { compact } from '@/lib/comics'
import { col, weekOf, type AdminComic, type SectionKey } from '../data'
import { Kpi, panel } from '../ui'

const KPIS = [
  { label: 'Pembaca hari ini', value: '48,2rb', delta: '+6,2% vs kemarin', deltaColor: '#2FA67A' },
  { label: 'Chapter rilis minggu ini', value: '37', delta: '5 terjadwal hari ini', deltaColor: 'var(--ink-3)' },
  { label: 'Pelanggan premium', value: '2.914', delta: '+118 bulan ini', deltaColor: '#2FA67A' },
  { label: 'Est. iklan · 7 hari', value: 'Rp 16,3jt', delta: 'lihat menu Iklan', deltaColor: 'var(--accent-text)' },
]

export function Dashboard({ comics, flagged, openReports, go }: { comics: AdminComic[]; flagged: number; openReports: number; go: (s: SectionKey) => void }) {
  const todayCount = weekOf(comics).find(d => d.today)?.items.length ?? 0
  const todo: { label: string; sub: string; count: number; bg: string; fg: string; to: SectionKey }[] = [
    { label: 'Komentar dilaporkan', sub: 'Perlu dimoderasi', count: flagged, bg: '#D9534F', fg: '#fff', to: 'comments' },
    { label: 'Laporan gambar error', sub: 'Dari tombol "Laporkan" di reader', count: openReports, bg: '#F2A93B', fg: '#16171A', to: 'reports' },
    { label: 'Chapter tayang hari ini', sub: 'Jumat, 19.00 WIB', count: todayCount, bg: 'var(--accent)', fg: '#fff', to: 'schedule' },
    { label: 'Request komik baru', sub: 'Vote tertinggi 842', count: 4, bg: 'var(--surface-2)', fg: 'var(--ink)', to: 'reports' },
  ]
  const top = [...comics].sort((a, b) => b.v - a.v).slice(0, 6)

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {KPIS.map(k => <Kpi key={k.label} {...k} />)}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-4">
        <div className={`${panel} flex flex-col gap-1`}>
          <div className="mb-1.5 text-base font-extrabold">Perlu perhatian</div>
          {todo.map(t => (
            <button key={t.label} onClick={() => go(t.to)} className="flex cursor-pointer items-center justify-between gap-3 border-t border-line bg-transparent py-3 text-left text-ink">
              <span className="flex flex-col gap-0.5"><span className="text-sm font-bold">{t.label}</span><span className="text-xs text-ink-3">{t.sub}</span></span>
              <span className="grid h-7 min-w-7 place-items-center rounded-full px-2 text-xs font-extrabold" style={{ background: t.bg, color: t.fg }}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className={panel}>
          <div className="mb-3.5 text-base font-extrabold">Judul teratas minggu ini</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
            {top.map((c, i) => (
              <div key={c.id} className="flex min-w-0 flex-col gap-1.5">
                <div className="cover-ph relative aspect-cover overflow-hidden rounded-btn" style={{ '--ph': col(c.h) } as CSSProperties}>
                  <span className="absolute bottom-1 left-2 text-4xl leading-none font-extrabold tracking-[-0.05em] text-white">{i + 1}</span>
                </div>
                <div className="truncate text-xs font-bold">{c.title}</div>
                <div className="font-mono text-[11px] text-ink-3">{compact(c.v * 7)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
