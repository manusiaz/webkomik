'use client'
import Link from 'next/link'
import { useState } from 'react'
import { typeLabel, routes } from '@/lib/comics'
import { useAdsOn, useLang } from '@/lib/store'
import { AdSlot, Badge, Cover, cx } from '@/components/ui'
import { META, PageHead, TODAY, gridCls, useT, useToggleBm } from '../shared'

export function Jadwal() {
  const t = useT()
  const [lang] = useLang()
  const [day, setDay] = useState(TODAY)
  const [bm, toggleBm] = useToggleBm()
  const ads = useAdsOn()
  const running = META.filter(c => c.status === 'Berjalan')
  const items = running.filter(c => c.day === day)
  return (
    <>
      <PageHead title={t.schedule} sub={t.scheduleSub}>
        <div className="font-mono text-xs text-ink-2">{t.weekOf}</div>
      </PageHead>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {t.days.map((d, i) => {
          const a = day === i
          return (
            <button key={d} onClick={() => setDay(i)} className={cx('flex min-w-[86px] flex-none cursor-pointer flex-col items-start gap-0.5 rounded-card border px-3.5 py-2.5', a ? 'bg-ink text-bg' : 'bg-surface text-ink', i === TODAY && !a ? 'border-accent' : 'border-line')}>
              <span className="text-[15px] font-extrabold"><span className="md:hidden">{d.slice(0, 3)}</span><span className="hidden md:inline">{d}</span></span>
              <span className="text-[11px] font-semibold opacity-80">{i === TODAY ? t.today : t.titles(running.filter(c => c.day === i).length)}</span>
            </button>
          )
        })}
      </div>
      <div className={gridCls}>
        {items.map(c => {
          const aired = day < TODAY || (day === TODAY && c.time <= '17.00')
          const on = bm.includes(c.id)
          return (
            <div key={c.id} className="flex flex-col gap-2">
              <Link href={routes.comic(c.id)} className="block">
                <Cover h={c.h} label={false}>
                  <Badge className="left-2 top-2">{typeLabel(c.type, lang)}</Badge>
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-b from-black/0 to-black/85 px-2.5 pb-2.5 pt-[30px] text-white">
                    <span className={cx('self-start rounded-chip px-2 py-[3px] text-[11px] font-extrabold text-white', aired ? 'bg-white/20' : 'bg-accent')}>
                      {aired ? `${t.aired} · Ch ${c.ch}` : `${day === TODAY ? t.today : t.upcoming} · Ch ${c.ch + 1}`}
                    </span>
                    <span className="font-mono text-xs">{t.airsAt} {c.time} WIB</span>
                  </div>
                </Cover>
              </Link>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-bold">{c.title}</div>
                  <div className="text-xs text-ink-3">{c.genre} · {c.partner}</div>
                </div>
                <button onClick={() => toggleBm(c.id)} className={cx('h-[30px] flex-none cursor-pointer rounded-lg border px-2.5 text-xs font-extrabold', on ? 'border-accent bg-accent-soft text-accent-text' : 'border-line bg-surface text-ink')}>{on ? '✓' : '+'}</button>
              </div>
            </div>
          )
        })}
      </div>
      {ads && <div className="md:hidden"><AdSlot id="schedule_bottom" size="320×100" w={320} h={100} /></div>}
      {ads && <div className="hidden md:block"><AdSlot id="schedule_bottom" size="728×90" w={728} h={90} /></div>}
    </>
  )
}
