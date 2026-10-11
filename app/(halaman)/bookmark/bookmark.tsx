'use client'
import Link from 'next/link'
import { useState } from 'react'
import { byId, routes } from '@/lib/comics'
import { useProgress, useStored } from '@/lib/store'
import { Cover, cx } from '@/components/ui'
import { BEFORE, EmptyBox, PageHead, gridCls, useT, useToggleBm } from '../shared'

const NOTIF: Record<string, boolean> = { langit: true, pedang: true, sekolah: true }

export function Bookmark() {
  const t = useT()
  const [bm, toggleBm] = useToggleBm()
  const [progress] = useProgress()
  const [notif, setNotif] = useStored('nacp-notif', NOTIF)
  const [tab, setTab] = useState(0)
  const [editing, setEditing] = useState(false)
  const prog = { ...BEFORE, ...progress }
  const all = bm.map(id => byId[id]).filter(Boolean).map(c => { const read = prog[c.id] || 0; return { ...c, read, nw: c.ch - read } })
  const list = all.filter(c => tab === 0 || (tab === 1 ? c.nw > 0 : c.nw <= 0))
  return (
    <>
      <PageHead title={t.bookmarks} sub={t.bmSub(all.length, all.filter(c => c.nw > 0).length)}>
        <button onClick={() => setEditing(!editing)} className={cx('h-[38px] cursor-pointer rounded-btn border border-line px-3.5 text-[13px] font-bold', editing ? 'bg-ink text-bg' : 'bg-surface text-ink')}>{editing ? t.doneEdit : t.edit}</button>
      </PageHead>
      <div className="flex gap-1.5 overflow-x-auto">
        {t.bmTabs.map((l, i) => (
          <button key={l} onClick={() => setTab(i)} className={cx('h-9 cursor-pointer whitespace-nowrap rounded-full border border-line px-3.5 text-[13px] font-bold', tab === i ? 'bg-ink text-bg' : 'bg-surface text-ink-2')}>{l}</button>
        ))}
      </div>
      {list.length > 0 && (
        <div className={gridCls}>
          {list.map(c => (
            <div key={c.id} className="relative flex flex-col gap-2">
              <Link href={routes.comic(c.id)} className="block">
                <Cover h={c.h} label={false}>
                  {c.nw > 0 && <span className="absolute left-2 top-2 rounded-chip bg-accent px-2 py-[3px] text-[11px] font-extrabold text-white">{t.newCh(c.nw)}</span>}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-b from-black/0 to-black/80 px-2.5 pb-2.5 pt-[26px] text-white">
                    <div className="mb-1.5 font-mono text-[11px]">Ch {c.read} / {c.ch}</div>
                    <div className="h-1 overflow-hidden rounded-[2px] bg-white/25"><div className="h-full bg-white" style={{ width: `${Math.round(c.read / c.ch * 100)}%` }} /></div>
                  </div>
                </Cover>
              </Link>
              {editing && <button onClick={() => toggleBm(c.id)} aria-label="remove" className="absolute right-2 top-2 size-8 cursor-pointer rounded-full border-0 bg-danger text-base font-extrabold text-white">×</button>}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-bold">{c.title}</div>
                  <div className="text-xs text-ink-3">{t.lastRead(c.read, c.ch)}</div>
                </div>
                <button onClick={() => setNotif({ ...notif, [c.id]: !notif[c.id] })} title="notif" className={cx('h-7 flex-none cursor-pointer rounded-[7px] border border-line bg-surface px-2 text-[11px] font-extrabold', notif[c.id] ? 'text-accent-text' : 'text-ink-3')}>{notif[c.id] ? t.notifOn : t.notifOff}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {list.length === 0 && (
        <EmptyBox>
          <div className="text-[17px] font-extrabold">{t.bmEmpty}</div>
          <Link href="/cari" className="flex h-10 items-center rounded-btn bg-accent px-4 text-[13px] font-bold text-white hover:no-underline">{t.browse}</Link>
        </EmptyBox>
      )}
    </>
  )
}
