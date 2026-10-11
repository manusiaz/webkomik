'use client'
import type { Dispatch, SetStateAction } from 'react'
import { REQUESTS, col, type AdminComic, type AdminReport } from '../data'
import { panel } from '../ui'

export function Reports({ comics, reports, setReports }: { comics: AdminComic[]; reports: AdminReport[]; setReports: Dispatch<SetStateAction<AdminReport[]>> }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start gap-4">
      <div className={`${panel} flex flex-col`}>
        <div className="mb-2 text-base font-extrabold">Laporan gambar error</div>
        {reports.map((r, i) => {
          const c = comics.find(x => x.id === r.id) ?? comics[0]
          return (
            <div key={i} className="flex items-center gap-3 border-t border-line py-3" style={{ opacity: r.fixed ? 0.5 : 1 }}>
              <div className="aspect-[2/3] w-10 flex-none rounded-[5px]" style={{ background: col(c.h) }} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold">{c.title} · Ch {r.ch} · hal. {r.page}</div>
                <div className="text-xs text-ink-3">{r.reason} · {r.count} laporan</div>
              </div>
              <button onClick={() => setReports(rs => rs.map((x, j) => (j === i ? { ...x, fixed: !x.fixed } : x)))} className={`h-[30px] flex-none cursor-pointer rounded-lg border border-line bg-bg px-3 text-xs font-bold ${r.fixed ? 'text-ok' : 'text-ink'}`}>
                {r.fixed ? 'Beres' : 'Tandai beres'}
              </button>
            </div>
          )
        })}
      </div>
      <div className={`${panel} flex flex-col`}>
        <div className="mb-2 text-base font-extrabold">Request komik</div>
        {REQUESTS.map(q => (
          <div key={q.title} className="flex items-center gap-3 border-t border-line py-3">
            <div className="w-[52px] flex-none text-center"><div className="text-lg font-extrabold">{q.votes}</div><div className="text-[10px] text-ink-3">vote</div></div>
            <div className="min-w-0 flex-1"><div className="text-sm font-bold">{q.title}</div><div className="text-xs text-ink-3">{q.type} · {q.note}</div></div>
            <span className="text-[11px] font-bold" style={{ color: q.c }}>{q.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
