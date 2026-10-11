'use client'
import { cx } from '@/components/ui'
import { col, weekOf, type AdminComic } from '../data'

export function Schedule({ comics }: { comics: AdminComic[] }) {
  return (
    <>
      <div className="overflow-x-auto">
        <div className="grid min-w-[1080px] grid-cols-[repeat(7,minmax(150px,1fr))] gap-2.5">
          {weekOf(comics).map(day => (
            <div key={day.name} className={cx('flex min-h-[300px] min-w-0 flex-col gap-2 rounded-card border p-2.5', day.today ? 'border-accent bg-accent-soft' : 'border-line bg-surface')}>
              <div className="flex items-baseline justify-between"><span className="text-[13px] font-extrabold">{day.name}</span><span className="font-mono text-[11px] text-ink-3">{day.date}</span></div>
              {day.items.map(it => (
                <div key={it.id} className="flex gap-2 rounded-[9px] border border-line bg-bg p-1.5">
                  <div className="aspect-cover w-10 flex-none rounded-[5px]" style={{ background: col(it.h) }} />
                  <div className="flex min-w-0 flex-col justify-center gap-0.5">
                    <span className="truncate text-xs font-bold">{it.title}</span>
                    <span className="text-[11px] text-ink-2">Ch {it.ch}</span>
                    <span className="font-mono text-[10px]" style={{ color: it.stColor }}>{it.time} · {it.st}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-ink-3">Chapter terjadwal otomatis tampil di halaman Jadwal Update dan mengirim notifikasi ke pembaca yang mem-bookmark judulnya.</div>
    </>
  )
}
