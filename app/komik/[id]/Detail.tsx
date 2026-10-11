'use client'
import Link from 'next/link'
import { useRef, useState, type CSSProperties } from 'react'
import { byId, COMICS, coverBg, compact, routes, SEED_PROGRESS, typeLabel } from '@/lib/comics'
import { AdSlot, cx, LangToggle, Logo, ThemeToggle } from '@/components/ui'
import { useAdsOn, useBookmarks, useLang, useProgress } from '@/lib/store'

const NAMES = { id: ['Serpihan di atap', 'Kurir terakhir', 'Tiga faksi', 'Malam tanpa bintang', 'Gudang di Pasar Lama', 'Yang mengikuti dari jauh', 'Cahaya kedua', 'Perjanjian', 'Retakan baru', 'Pintu belakang', 'Hujan cahaya', 'Nama asli Raka'], en: ['Shard on the roof', 'The last courier', 'Three factions', 'Starless night', 'Warehouse at the Old Market', 'The one following', 'Second light', 'The pact', 'A new crack', 'Back door', 'Rain of light', 'Raka’s real name'] }
const T = {
  id: { home: 'Beranda', ongoing: 'Berjalan', done: 'Tamat', views: 'dilihat', bookmarks: 'bookmark', rating: 'rating', chapters: 'chapter', first: 'Baca dari awal', cont: 'Lanjutkan Ch', start: 'Mulai baca Ch 1', bm: '+ Bookmark', bmOn: 'Di-bookmark', notif: 'Notif chapter baru', notifOn: 'Notif aktif', notifToast: 'Kamu bakal dapat notif tiap chapter baru', synopsis: 'Sinopsis', schedule: 'Jadwal update', friday: 'Tiap Jumat, 19.00 WIB', releasedWith: 'Dirilis bersama', licensed: 'konten berlisensi', sponsored: 'Bersponsor', findCh: 'Cari chapter', newest: 'Terbaru dulu', oldest: 'Terlama dulu', newTag: 'BARU', read: 'Sudah dibaca', soon: 'Jumat', lockedDate: 'Jumat, 17 Okt', similar: 'Mirip dengan ini', more: (n: number) => `Tampilkan ${n} chapter lagi`, ago: ['2 jam lalu', '7 hari lalu'] },
  en: { home: 'Home', ongoing: 'Ongoing', done: 'Completed', views: 'views', bookmarks: 'bookmarks', rating: 'rating', chapters: 'chapters', first: 'Read from start', cont: 'Continue Ch', start: 'Start reading Ch 1', bm: '+ Bookmark', bmOn: 'Bookmarked', notif: 'Notify new chapters', notifOn: 'Notifications on', notifToast: 'You’ll be notified of every new chapter', synopsis: 'Synopsis', schedule: 'Schedule', friday: 'Every Friday, 19:00 WIB', releasedWith: 'Released with', licensed: 'licensed content', sponsored: 'Sponsored', findCh: 'Find chapter', newest: 'Newest first', oldest: 'Oldest first', newTag: 'NEW', read: 'Read', soon: 'Friday', lockedDate: 'Fri, Oct 17', similar: 'More like this', more: (n: number) => `Show ${n} more chapters`, ago: ['2h ago', '7d ago'] },
}

const stripes = (w: number, bg: string) => `repeating-linear-gradient(135deg,rgba(255,255,255,0.035) 0 ${w}px,transparent ${w}px ${w * 2}px),${bg}`
const field = 'h-9 rounded-[9px] border border-line bg-surface px-3 text-[13px]'

export function Detail({ id }: { id: string }) {
  const raw = byId[id]
  const [lang] = useLang()
  const t = T[lang]
  const ads = useAdsOn()
  const [bms, setBms] = useBookmarks()
  const [progress] = useProgress()
  const [notif, setNotif] = useState(false)
  const [sort, setSort] = useState<'desc' | 'asc'>('desc')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(12)
  const [toast, setToast] = useState('')
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined)

  const flash = (m: string) => { setToast(m); clearTimeout(tt.current); tt.current = setTimeout(() => setToast(''), 2200) }

  const tl = typeLabel(raw.type, lang)
  const partner = raw.partner || 'Studio Kertas'
  const syn = raw.syn ? raw.syn[lang] : lang === 'id'
    ? `${raw.title} adalah ${raw.type === 'Lokal' ? 'komik lokal' : raw.type.toLowerCase()} bergenre ${raw.genre.toLowerCase()} yang dirilis resmi bersama ${partner}. Sinopsis lengkap diisi dari panel admin.`
    : `${raw.title} is a ${raw.genre.toLowerCase()} ${raw.type === 'Lokal' ? 'local comic' : raw.type.toLowerCase()} officially released with ${partner}. Full synopsis is set from the admin panel.`
  const read = progress[raw.id] ?? SEED_PROGRESS[raw.id] ?? 0
  const isBm = bms.includes(raw.id)

  const all = [{ n: raw.ch + 1, locked: true }, ...Array.from({ length: raw.ch }, (_, i) => ({ n: raw.ch - i, locked: false }))]
  let list = q.trim() ? all.filter(x => String(x.n).includes(q.trim())) : all
  if (sort === 'asc') list = list.slice().reverse()
  const shown = list.slice(0, limit)
  const dateOf = (n: number, locked: boolean) => locked ? t.lockedDate : n === raw.ch ? t.ago[0] : n === raw.ch - 1 ? t.ago[1]
    : `${String(((raw.ch - n) * 7) % 28 + 1).padStart(2, '0')}/${String(9 - Math.floor((raw.ch - n) / 4) % 9).padStart(2, '0')}/26`

  const similar = COMICS.filter(x => x.id !== raw.id).sort((a, b) => Number(b.genre === raw.genre) - Number(a.genre === raw.genre) || b.v - a.v).slice(0, 6)
  const tags = [tl, raw.genre, raw.g2, raw.status === 'Tamat' ? t.done : t.ongoing].filter(Boolean) as string[]
  const stats = [[`★ ${raw.r.toFixed(1)}`, t.rating], [compact(raw.v * 31, lang), t.views], [compact(Math.round(raw.v * 0.42), lang), t.bookmarks], [String(raw.ch), t.chapters]]

  return (
    <div className="relative flex min-h-screen flex-col bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-3.5 py-3 md:px-8">
          <Logo />
          <div className="hidden gap-0.5 text-[13px] font-semibold text-ink-3 md:flex">
            <Link href={routes.home} className="px-2.5 py-2 text-ink-3">{t.home}</Link>
            <span className="px-0.5 py-2">/</span>
            <Link href={routes.page('cari')} className="px-2.5 py-2 text-ink-2">{tl}</Link>
          </div>
          <div className="ml-auto flex gap-2"><LangToggle /><ThemeToggle /></div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0" style={{ background: stripes(14, coverBg(raw.h, 0.34, 0.08)) }}>
          <span className="absolute right-3.5 top-3.5 font-mono text-[11px] text-white/50 md:right-8">banner · 1920×600</span>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.5)_55%,rgba(0,0,0,0.78)_100%)]" />
        </div>
        <div className="relative mx-auto grid max-w-[1440px] items-end gap-5 px-3.5 pb-9 pt-7 md:grid-cols-[minmax(200px,280px)_minmax(0,1fr)] md:gap-9 md:px-8 md:pt-[120px]">
          <div className="relative aspect-cover w-full max-w-[220px] justify-self-center overflow-hidden rounded-[14px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] md:max-w-[280px] md:justify-self-start" style={{ background: stripes(10, coverBg(raw.h)) }}>
            <span className="absolute bottom-2.5 left-3 font-mono text-[11px] text-white/55">cover · 600×800</span>
          </div>
          <div className="flex min-w-0 flex-col gap-3 pb-1">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tg, i) => <span key={tg} className={cx('rounded-chip px-2.5 py-1 text-xs font-bold text-white', i === 0 ? 'bg-accent' : 'bg-white/16')}>{tg}</span>)}
            </div>
            <h1 className="m-0 text-[34px] font-extrabold leading-none tracking-[-0.045em] text-balance text-white md:text-[56px]">{raw.title}</h1>
            <div className="text-sm text-white/78">{raw.author || raw.partner}</div>
            <div className="flex flex-wrap gap-[18px] text-[13px] text-white/78">
              {stats.map(([v, l]) => (
                <div key={l} className="flex flex-col gap-0.5"><span className="text-lg font-extrabold tracking-[-0.02em] text-white">{v}</span><span className="text-xs text-white/70">{l}</span></div>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-2.5">
              <Link href={routes.read(raw.id, read ? Math.min(read + 1, raw.ch) : 1)} className="rounded-btn bg-accent px-[22px] py-[13px] text-sm font-extrabold text-white hover:no-underline">{read ? `${t.cont} ${Math.min(read + 1, raw.ch)}` : t.start}</Link>
              <Link href={routes.read(raw.id, 1)} className="rounded-btn border border-line bg-surface px-[18px] py-[13px] text-sm font-bold text-ink hover:no-underline">{t.first}</Link>
              <button
                onClick={() => setBms(isBm ? bms.filter(x => x !== raw.id) : [...bms, raw.id])}
                className={cx('h-[46px] cursor-pointer rounded-btn border px-[18px] text-sm font-bold', isBm ? 'border-accent bg-accent-soft text-accent-text' : 'border-line bg-surface text-ink')}
              >{isBm ? t.bmOn : t.bm}</button>
              <button
                onClick={() => { setNotif(!notif); if (!notif) flash(t.notifToast) }}
                className={cx('h-[46px] cursor-pointer rounded-btn border border-line bg-surface px-4 text-[13px] font-semibold', notif ? 'text-accent-text' : 'text-ink-2')}
              >{notif ? t.notifOn : t.notif}</button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 items-start gap-8 px-3.5 pb-14 pt-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-7">
          <section className="flex flex-col gap-2.5">
            <h2 className="m-0 text-lg font-extrabold">{t.synopsis}</h2>
            <p className="m-0 max-w-[72ch] text-[15px] leading-[1.7] text-pretty text-ink-2">{syn}</p>
            <div className="flex flex-wrap gap-4 text-[13px] text-ink-3">
              <span>{t.schedule}: <Link href={routes.page('jadwal')} className="font-bold">{t.friday}</Link></span>
              <span>{t.releasedWith} <a href="#" className="font-bold">{partner}</a> · {t.licensed}</span>
            </div>
          </section>

          <div className="md:hidden"><AdSlot id="detail_top" size="320×100" w={320} h={100} className="mx-0!" /></div>
          <div className="hidden md:block"><AdSlot id="detail_top" size="728×90" w={728} h={90} className="mx-0!" /></div>

          <section className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="m-0 text-xl font-extrabold tracking-[-0.02em]">{raw.ch} {t.chapters}</h2>
              <div className="flex gap-2">
                <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.findCh} className={cx(field, 'w-[150px] text-ink outline-none')} />
                <button onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')} className={cx(field, 'cursor-pointer whitespace-nowrap font-semibold text-ink-2')}>{sort === 'desc' ? t.newest : t.oldest}</button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {shown.map((x, j) => {
                const isRead = !x.locked && x.n <= read
                const inner = (
                  <>
                    <div className="relative aspect-thumb w-[88px] flex-none overflow-hidden rounded-lg md:w-[120px]" style={{ background: stripes(8, coverBg((raw.h + x.n * 13) % 360, 0.4, 0.08)) }}>
                      {x.locked && <div className="absolute inset-0 grid place-items-center bg-black/55 text-[11px] font-bold text-white">{t.soon}</div>}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="whitespace-nowrap text-[15px] font-extrabold">{x.locked ? `Ch ${x.n}` : `Chapter ${x.n}`}</span>
                        {!x.locked && x.n >= raw.ch - 1 && <span className="rounded-[5px] bg-accent px-[7px] py-0.5 text-[10px] font-extrabold text-white">{t.newTag}</span>}
                        {isRead && <span className="text-[11px] font-semibold text-ink-3">{t.read}</span>}
                      </div>
                      <div className="truncate text-[13px] text-ink-2">{NAMES[lang][x.n % NAMES[lang].length]}</div>
                    </div>
                    <div className="flex flex-none flex-col items-end gap-1 pr-1.5 font-mono text-[11px] text-ink-3">
                      <span>{dateOf(x.n, x.locked)}</span>
                      <span>{x.locked ? '' : compact(Math.round(raw.v / (1 + (raw.ch - x.n) * 0.05)), lang)}</span>
                    </div>
                  </>
                )
                const rowCls = cx('flex items-center gap-3.5 rounded-card border bg-surface p-2 text-ink hover:no-underline', x.n === read ? 'border-accent' : 'border-line', isRead && 'opacity-62')
                return (
                  <div key={x.n} className="contents">
                    {x.locked ? <div className={rowCls}>{inner}</div> : <Link href={routes.read(raw.id, x.n)} className={rowCls}>{inner}</Link>}
                    {ads && j === 5 && (
                      <div className="flex h-[90px] items-center justify-center gap-2.5 rounded-btn border border-dashed border-line-2 font-mono text-[11px] text-ink-3">
                        <span className="font-medium text-ink-2">{t.sponsored}</span><span>native · detail_list</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {list.length > limit && (
              <button onClick={() => setLimit(limit + 24)} className="h-11 cursor-pointer rounded-btn border border-line bg-surface text-sm font-bold text-ink">{t.more(Math.min(24, list.length - limit))}</button>
            )}
          </section>
        </div>

        <aside className="top-[84px] flex min-w-0 flex-col gap-4 lg:sticky">
          <div className="flex flex-col gap-3.5 rounded-panel border border-line bg-surface p-[18px]">
            <h2 className="m-0 text-lg font-extrabold tracking-[-0.02em]">{t.similar}</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-x-3 gap-y-3.5">
              {similar.map(s => (
                <Link key={s.id} href={routes.comic(s.id)} className="flex flex-col gap-[7px] text-ink hover:no-underline">
                  <div className="relative aspect-cover overflow-hidden rounded-btn" style={{ background: stripes(10, coverBg(s.h)) } as CSSProperties}>
                    <span className="absolute bottom-[7px] right-[7px] rounded-[5px] bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">★ {s.r.toFixed(1)}</span>
                  </div>
                  <div className="line-clamp-2 text-[13px] font-bold leading-[1.3]">{s.title}</div>
                </Link>
              ))}
            </div>
          </div>
          <AdSlot id="detail_sidebar" size="300×250" h={250} vertical className="rounded-btn" />
        </aside>
      </main>

      {ads && (
        <div className="sticky bottom-0 z-30 flex h-[50px] items-center justify-center gap-2 border-t border-dashed border-line-2 bg-surface font-mono text-[10px] text-ink-3 md:hidden">
          <span className="font-medium text-ink-2">{lang === 'id' ? 'IKLAN' : 'AD'}</span>320×50 · mobile_sticky
        </div>
      )}
      {toast && <div className="fixed bottom-20 left-1/2 z-90 -translate-x-1/2 rounded-btn bg-[#16171A] px-4 py-2.5 text-[13px] font-semibold text-white">{toast}</div>}
    </div>
  )
}
