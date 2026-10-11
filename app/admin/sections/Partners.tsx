'use client'
import { PARTNERS, col, type AdminComic } from '../data'
import { panel } from '../ui'

export function Partners({ comics }: { comics: AdminComic[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-3.5">
      {PARTNERS.map(p => {
        const ts = comics.filter(c => c.partner === p.name)
        return (
          <div key={p.name} className={`${panel} flex flex-col gap-3.5`}>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-card border border-dashed border-line-2 font-mono text-[9px] text-ink-3">logo</div>
              <div><div className="text-base font-extrabold">{p.name}</div><div className="text-xs text-ink-3">{p.kind}</div></div>
            </div>
            <div className="flex gap-1.5">
              {ts.slice(0, 4).map(c => <div key={c.id} className="aspect-cover flex-1 rounded-chip" style={{ background: col(c.h) }} />)}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-ink-3">
              <div><div className="text-base font-extrabold text-ink">{ts.length}</div>judul</div>
              <div><div className="text-base font-extrabold text-ink">{p.share}</div>bagi hasil</div>
              <div><div className="text-base font-extrabold text-ink">{p.uploaders}</div>uploader</div>
            </div>
            <div className="text-xs text-ink-3">Kontrak s.d. <b className="text-ink-2">{p.until}</b> · kredit tampil di detail & reader</div>
          </div>
        )
      })}
      <button className="min-h-[240px] cursor-pointer rounded-[14px] border border-dashed border-line-2 bg-transparent text-sm font-bold text-ink-2">+ Tambah partner</button>
    </div>
  )
}
