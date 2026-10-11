'use client'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { col, type AdminComment } from '../data'
import { FilterPill } from '../ui'

export function Comments({ comments, setComments, flash }: { comments: AdminComment[]; setComments: Dispatch<SetStateAction<AdminComment[]>>; flash: (m: string) => void }) {
  const [tab, setTab] = useState<'flagged' | 'all'>('flagged')
  const open = comments.filter(c => !c.done)
  const flagged = open.filter(c => c.flags > 0)
  const shown = tab === 'flagged' ? flagged : open
  const patch = (i: number, p: Partial<AdminComment>) => setComments(cs => cs.map(x => (x.i === i ? { ...x, ...p } : x)))

  return (
    <>
      <div className="flex gap-1.5">
        <FilterPill className="h-[34px] px-3.5" on={tab === 'flagged'} onClick={() => setTab('flagged')}>Dilaporkan · {flagged.length}</FilterPill>
        <FilterPill className="h-[34px] px-3.5" on={tab === 'all'} onClick={() => setTab('all')}>Semua</FilterPill>
      </div>
      <div className="flex flex-col gap-2.5">
        {shown.map(c => (
          <div key={c.i} className="flex gap-3.5 rounded-card border bg-surface p-3.5" style={{ borderColor: c.flags > 0 ? '#D9534F' : 'var(--line)' }}>
            <div className="aspect-cover w-11 flex-none rounded-chip" style={{ background: col((c.i * 61 + 200) % 360) }} />
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <div className="flex flex-wrap items-baseline gap-2 text-xs text-ink-3">
                <b className="text-[13px] text-ink">{c.user}</b><span>{c.where}</span><span className="font-mono">{c.time}</span>
                {c.flags > 0 && <span className="rounded-[5px] bg-danger px-[7px] py-0.5 text-[10px] font-extrabold text-white">{c.flags} laporan</span>}
              </div>
              <div className="text-sm leading-[1.55] text-ink-2">{c.text}</div>
            </div>
            <div className="flex flex-none flex-col gap-1.5">
              <button onClick={() => patch(c.i, { flags: 0 })} className="h-[30px] cursor-pointer rounded-lg border border-line bg-bg px-3 text-xs font-bold text-ink">Setujui</button>
              <button onClick={() => { patch(c.i, { done: true }); flash('Komentar dihapus') }} className="h-[30px] cursor-pointer rounded-lg border-0 bg-danger px-3 text-xs font-bold text-white">Hapus</button>
            </div>
          </div>
        ))}
        {!shown.length && <div className="rounded-card border border-dashed border-line-2 p-[30px] text-center text-sm text-ink-3">Semua komentar sudah ditinjau.</div>}
      </div>
    </>
  )
}
