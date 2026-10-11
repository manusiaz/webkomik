'use client'
import Link from 'next/link'
import { byId, coverBg, routes } from '@/lib/comics'
import { useHistory } from '@/lib/store'
import { PageHead, useT } from '../shared'

export function Riwayat() {
  const t = useT()
  const [hist, setHist] = useHistory()
  const groups = [0, 1, 2].map(g => ({ g, items: hist.filter(h => h[5] === g && byId[h[0]]) })).filter(g => g.items.length)
  return (
    <>
      <PageHead title={t.history} sub={t.histSub}>
        <button onClick={() => setHist([])} className="h-[38px] cursor-pointer rounded-btn border border-line bg-surface px-3.5 text-[13px] font-bold text-ink-2">{t.clear}</button>
      </PageHead>
      {groups.map(({ g, items }) => (
        <section key={g} className="flex flex-col gap-3">
          <div className="text-[13px] font-extrabold tracking-[0.02em] text-ink-3">{t.groups[g]}</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))]">
            {items.map(([id, ch, pg, tot, time]) => {
              const c = byId[id]
              const next = pg >= tot && ch < c.ch ? ch + 1 : ch
              return (
                <div key={id + ch} className="flex gap-3.5 rounded-[14px] border border-line bg-surface p-2.5">
                  <Link href={routes.comic(id)} className="aspect-cover w-24 flex-none rounded-[10px]" style={{ background: `repeating-linear-gradient(135deg,rgba(255,255,255,0.035) 0 8px,transparent 8px 16px),${coverBg(c.h)}` }} />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                    <div className="truncate text-base font-extrabold">{c.title}</div>
                    <div className="text-[13px] text-ink-2">{t.page(ch, pg, tot)}</div>
                    <div className="h-1 overflow-hidden rounded-[2px] bg-surface-2"><div className="h-full bg-accent" style={{ width: `${Math.round(pg / tot * 100)}%` }} /></div>
                    <div className="mt-1 flex items-center gap-2">
                      <Link href={routes.read(id, next)} className="flex h-[34px] items-center rounded-[9px] bg-accent px-3.5 text-[13px] font-extrabold text-white hover:no-underline">{t.resume} Ch {next}</Link>
                      <span className="font-mono text-[11px] text-ink-3">{time}</span>
                      <button onClick={() => setHist(hist.filter(x => !(x[0] === id && x[1] === ch)))} className="ml-auto cursor-pointer border-0 bg-transparent text-xs text-ink-3">{t.remove}</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
      {groups.length === 0 && <div className="rounded-[14px] border border-dashed border-line-2 px-5 py-12 text-center text-[15px] text-ink-3">{t.histEmpty}</div>}
    </>
  )
}
