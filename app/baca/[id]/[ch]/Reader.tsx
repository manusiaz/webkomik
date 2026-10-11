'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { byId, routes } from '@/lib/comics'
import { AdSlot, cx, Logo } from '@/components/ui'
import { useAdsOn, useHistory, useLang, useProgress, useStored, useTheme } from '@/lib/store'

const PAGES = 14
type Prefs = { mode: 'scroll' | 'paged' | 'double'; dir: 'ltr' | 'rtl'; fit: 'width' | 'height' | 'custom'; customW: number; gap: number; bg: 'auto' | 'black' | 'white' | 'sepia'; quality: 'saver' | 'hd'; auto: boolean; speed: number; tap: boolean; bright: number; night: boolean; perTitle: boolean }
/** Global prefs at the top level; `byTitle[id]` overrides them while "save for this title" is on. */
type StoredPrefs = Partial<Prefs> & { byTitle?: Record<string, Partial<Prefs>> }
const DEF: Prefs = { mode: 'scroll', dir: 'ltr', fit: 'width', customW: 760, gap: 0, bg: 'auto', quality: 'hd', auto: false, speed: 3, tap: true, bright: 100, night: false, perTitle: true }
const NONE: StoredPrefs = {}
const BG = {
  black: { c: '#0B0B0C', a: '#17181B', b: '#1D1E22', ink: '#6C7078', adLine: '#33363C', adInk: '#7A7E86' },
  white: { c: '#FFFFFF', a: '#EEEEEB', b: '#E5E5E1', ink: '#8A8E96', adLine: '#CFCFCA', adInk: '#868A93' },
  sepia: { c: '#F1E7D3', a: '#E6DAC2', b: '#DDD0B5', ink: '#8A7A5C', adLine: '#CDBE9E', adInk: '#8A7A5C' },
}
const T = {
  id: { settings: 'Pengaturan', readSettings: 'Pengaturan baca', mode: 'Mode baca', scroll: 'Scroll', paged: 'Per halaman', double: 'Dua halaman', dir: 'Arah baca', ltr: 'Kiri → kanan', rtl: 'Kanan → kiri', fit: 'Ukuran gambar', fitW: 'Fit lebar', fitH: 'Fit tinggi', custom: 'Custom', customWidth: 'Lebar custom', background: 'Warna latar', themeBg: 'Ikut tema', black: 'Hitam', white: 'Putih', sepia: 'Sepia', quality: 'Kualitas gambar', saver: 'Hemat data', hd: 'HD', gap: 'Jarak antar gambar', speed: 'Kecepatan auto-scroll', bright: 'Kecerahan', auto: 'Auto-scroll', autoSub: 'Halaman jalan sendiri', tap: 'Tap kiri/kanan', tapSub: 'Ganti halaman dengan ketuk sisi layar', night: 'Filter malam', nightSub: 'Kurangi cahaya biru', perTitle: 'Simpan untuk judul ini', perTitleSub: 'Pengaturan khusus', reset: 'Reset ke default', page: 'halaman', loading: 'memuat', ad: 'IKLAN', every: 'tiap', endOf: 'Akhir', releasedWith: 'Dirilis bersama', licensed: 'konten berlisensi', next: 'Chapter', last: 'Chapter terakhir', prefetching: 'Menyiapkan chapter berikutnya', prefetched: 'sudah di-prefetch', report: 'Gambar error? Laporkan', reported: 'Laporan terkirim. Makasih!', rate: 'Kasih rating', comments: 'Komentar', writeComment: 'Tulis komentar…', send: 'Kirim', like: 'Suka', interEvery: 'tampil tiap 2 chapter', skipIn: 'Lewati dalam', skip: 'Lanjut ke chapter', offline: 'Simpan offline', offlineOn: 'Tersimpan offline', offlineToast: 'Chapter disimpan untuk dibaca offline', light: 'Terang', dark: 'Gelap', reacts: ['Seru', 'Lucu', 'Sedih', 'Kaget', 'Bingung'], now: 'baru saja', of: 'dari', q: 'hemat · avif · 800w' },
  en: { settings: 'Settings', readSettings: 'Reading settings', mode: 'Reading mode', scroll: 'Scroll', paged: 'Single page', double: 'Double page', dir: 'Direction', ltr: 'Left → right', rtl: 'Right → left', fit: 'Image size', fitW: 'Fit width', fitH: 'Fit height', custom: 'Custom', customWidth: 'Custom width', background: 'Background', themeBg: 'Theme', black: 'Black', white: 'White', sepia: 'Sepia', quality: 'Image quality', saver: 'Data saver', hd: 'HD', gap: 'Page gap', speed: 'Auto-scroll speed', bright: 'Brightness', auto: 'Auto-scroll', autoSub: 'Pages move on their own', tap: 'Tap left/right', tapSub: 'Turn pages by tapping the edges', night: 'Night filter', nightSub: 'Reduce blue light', perTitle: 'Save for this title', perTitleSub: 'Settings only for', reset: 'Reset to default', page: 'page', loading: 'loading', ad: 'AD', every: 'every', endOf: 'End of', releasedWith: 'Released with', licensed: 'licensed content', next: 'Chapter', last: 'Latest chapter', prefetching: 'Preparing next chapter', prefetched: 'prefetched', report: 'Broken image? Report it', reported: 'Report sent. Thanks!', rate: 'Rate this chapter', comments: 'Comments', writeComment: 'Write a comment…', send: 'Send', like: 'Like', interEvery: 'shown every 2 chapters', skipIn: 'Skip in', skip: 'Go to chapter', offline: 'Save offline', offlineOn: 'Saved offline', offlineToast: 'Chapter saved for offline reading', light: 'Light', dark: 'Dark', reacts: ['Hype', 'Funny', 'Sad', 'Shocked', 'Confused'], now: 'just now', of: 'of', q: 'saver · avif · 800w' },
}
const SEED = [
  { name: 'dimas.r', text: 'Panel waktu Raka megang serpihan itu gila sih, warnanya keluar banget.', time: '2j', likes: 48 },
  { name: 'nadya', text: 'Akhirnya ketahuan siapa yang ngirim paket pertama. Nunggu minggu depan!', time: '3j', likes: 31 },
  { name: 'kopi_hitam', text: 'Studio Kertas konsisten banget update tiap Jumat.', time: '5j', likes: 12 },
]
const REACT_COUNTS = [214, 96, 41, 133, 18]
const AD_EVERY = 4

const mq = () => matchMedia('(min-width: 760px)')
const subMq = (l: () => void) => { const m = mq(); m.addEventListener('change', l); return () => m.removeEventListener('change', l) }
const useWide = () => useSyncExternalStore(subMq, () => mq().matches, () => true)

const hBtn = 'h-[34px] cursor-pointer rounded-lg border border-line bg-surface'

export function Reader({ id, ch }: { id: string; ch: number }) {
  const comic = byId[id]
  const max = comic.ch
  const hasNext = ch < max
  const router = useRouter()
  const wide = useWide()
  const ads = useAdsOn()
  const [lang, setLang] = useLang()
  const [theme, setTheme] = useTheme()
  const [, setProgress] = useProgress()
  const [, setHist] = useHistory()
  const t = T[lang]

  const [stored, setPrefs] = useStored<StoredPrefs>('nacp-reader-v2', NONE)
  const { byTitle, ...global } = stored
  const perTitle = global.perTitle ?? DEF.perTitle
  const s: Prefs = { ...DEF, ...global, ...(perTitle ? byTitle?.[id] : null), perTitle }
  const upd = (patch: Partial<Prefs>) => setPrefs(prev => {
    if ('perTitle' in patch || !(prev.perTitle ?? DEF.perTitle)) return { ...prev, ...patch }
    return { ...prev, byTitle: { ...prev.byTitle, [id]: { ...prev.byTitle?.[id], ...patch } } }
  })
  const reset = () => setPrefs(prev => { const b = { ...prev.byTitle }; delete b[id]; return { ...DEF, byTitle: b } })

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [load, setLoad] = useState({ idx: 0, pct: 0, pre: 0 })
  const [scrollPct, setScrollPct] = useState(0)
  const [rating, setRating] = useState(0)
  const [react, setReact] = useState<number | null>(null)
  const [comments, setComments] = useState(() => SEED.map(c => ({ ...c, liked: false })))
  const [draft, setDraft] = useState('')
  const [inter, setInter] = useState(0)
  const [toast, setToast] = useState('')
  const [offline, setOffline] = useState(false)
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined)
  const flash = (m: string) => { setToast(m); clearTimeout(tt.current); tt.current = setTimeout(() => setToast(''), 2200) }

  const go = (n: number) => router.push(routes.read(id, n))
  const next = () => {
    if (!hasNext) return
    if (ads && ch % 2 === 1) setInter(5)
    else go(ch + 1)
  }
  const stepN = s.mode === 'double' && wide ? 2 : 1
  const idxs = stepN === 2 ? [page, page + 1].filter(i => i < PAGES) : [page]
  const tap = (side: 'left' | 'right') => {
    const fwd = (side === 'right') === (s.dir === 'ltr')
    if (fwd && page + stepN >= PAGES) return next()
    setPage(Math.max(0, Math.min(PAGES - stepN, page + (fwd ? stepN : -stepN))))
  }

  const live = useRef({ s, settingsOpen, tap, save: () => {} })
  useEffect(() => {
    live.current = {
      s, settingsOpen, tap,
      save: () => {
        const pg = s.mode === 'scroll' ? Math.min(PAGES, Math.max(1, Math.round(scrollPct / 100 * PAGES))) : page + idxs.length
        const now = new Date(), time = String(now.getHours()).padStart(2, '0') + '.' + String(now.getMinutes()).padStart(2, '0')
        setProgress(p => ({ ...p, [id]: ch }))
        setHist(h => [[id, ch, pg, PAGES, time, 0], ...h.filter(x => !(x[0] === id && x[1] === ch))])
      },
    }
  })

  useEffect(() => {
    const save = () => live.current.save()
    save()
    addEventListener('beforeunload', save)
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; setScrollPct(h > 0 ? Math.min(100, scrollY / h * 100) : 0) }
    addEventListener('scroll', onScroll, { passive: true })
    const onKey = (e: KeyboardEvent) => { if (live.current.s.mode === 'scroll') return; if (e.key === 'ArrowLeft') live.current.tap('left'); if (e.key === 'ArrowRight') live.current.tap('right') }
    addEventListener('keydown', onKey)
    let raf = 0
    const loop = () => { const { s, settingsOpen } = live.current; if (s.auto && s.mode === 'scroll' && !settingsOpen) scrollBy(0, s.speed * 0.6); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { removeEventListener('beforeunload', save); removeEventListener('scroll', onScroll); removeEventListener('keydown', onKey); cancelAnimationFrame(raf); save() }
  }, [])

  useEffect(() => {
    const step = s.quality === 'hd' ? 11 : 24
    const iv = setInterval(() => setLoad(l => {
      if (l.idx < PAGES) { const pct = l.pct + step; return pct >= 100 ? { ...l, idx: l.idx + 1, pct: 0 } : { ...l, pct } }
      return l.pre < 100 && hasNext ? { ...l, pre: Math.min(100, l.pre + 4) } : l
    }), 70)
    return () => clearInterval(iv)
  }, [s.quality, hasNext])

  useEffect(() => { if (hasNext) router.prefetch(routes.read(id, ch + 1)) }, [router, id, ch, hasNext])

  useEffect(() => {
    if (inter <= 0) return
    const to = setTimeout(() => setInter(i => (i <= 1 ? -1 : i - 1)), 1000)
    return () => clearTimeout(to)
  }, [inter])

  const bg = BG[s.bg === 'auto' ? (theme === 'dark' ? 'black' : 'white') : s.bg]
  const pageStyle: CSSProperties = { background: `repeating-linear-gradient(135deg,${bg.a} 0 10px,${bg.b} 10px 20px)`, filter: `brightness(${s.bright / 100})${s.night ? ' sepia(0.35) saturate(0.85)' : ''}`, color: bg.ink }
  const pageMeta = (i: number) => i < load.idx ? (s.quality === 'hd' ? 'HD · webp · 1600w' : t.q) : i === load.idx ? `${t.loading} ${load.pct}%` : t.loading + '…'
  const progressPct = s.mode === 'scroll' ? scrollPct : Math.round((page + idxs.length) / PAGES * 100)

  const seg = <K extends 'mode' | 'dir' | 'fit' | 'quality'>(key: K, label: string, opts: [Prefs[K], string][]) => (
    <div key={key} className="flex flex-col gap-2">
      <div className="text-xs font-bold tracking-[0.02em] text-ink-3">{label}</div>
      <div className="flex gap-0.5 rounded-btn bg-surface-2 p-[3px]">
        {opts.map(([v, l]) => (
          <button key={v} onClick={() => { upd({ [key]: v }); setPage(0) }} className={cx('h-[34px] flex-1 cursor-pointer rounded-lg border-0 text-[13px] font-semibold', s[key] === v ? 'bg-bg text-ink shadow-[0_1px_2px_rgba(0,0,0,.12)]' : 'bg-transparent text-ink-3')}>{l}</button>
        ))}
      </div>
    </div>
  )
  const slider = (key: 'gap' | 'speed' | 'bright', label: string, min: number, mx: number, step: number, fmt: (v: number) => string) => (
    <div key={key} className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs"><span className="font-bold text-ink-3">{label}</span><span className="font-mono text-ink-2">{fmt(s[key])}</span></div>
      <input type="range" min={min} max={mx} step={step} value={s[key]} onChange={e => upd({ [key]: +e.target.value })} className="w-full accent-[#3E7BE6]" />
    </div>
  )
  const toggle = (key: 'auto' | 'tap' | 'night' | 'perTitle', label: string, sub: string) => (
    <button key={key} onClick={() => upd({ [key]: !s[key] })} className="flex cursor-pointer items-center justify-between gap-3 border-0 bg-transparent py-3 text-left text-ink">
      <span className="flex flex-col gap-0.5"><span className="text-sm font-semibold">{label}</span><span className="text-xs text-ink-3">{sub}</span></span>
      <span className={cx('flex h-6 w-10 flex-none rounded-full p-[3px]', s[key] ? 'justify-end bg-[#3E7BE6]' : 'justify-start bg-line-2')}><span className="size-[18px] rounded-full bg-white" /></span>
    </button>
  )

  return (
    <div className="relative flex min-h-screen flex-col text-ink" style={{ background: bg.c }}>
      <header className="sticky top-0 z-40 border-b border-line bg-bg">
        <div className="flex h-14 items-center gap-3 px-3 md:px-6">
          <Logo size="sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <Link href={routes.comic(id)} className="truncate text-sm font-bold text-ink">{comic.title}</Link>
            <div className="truncate font-mono text-[11px] text-ink-3">Chapter {ch} {t.of} {max}</div>
          </div>
          <div className="flex flex-none items-center gap-1.5">
            <button onClick={() => ch > 1 && go(ch - 1)} disabled={ch <= 1} className={cx(hBtn, 'w-[34px] text-[15px] text-ink disabled:opacity-40')}>‹</button>
            <select value={ch} onChange={e => go(+e.target.value)} className={cx(hBtn, 'hidden px-2 text-[13px] font-semibold text-ink md:block')}>
              {Array.from({ length: max }, (_, i) => max - i).map(n => <option key={n} value={n}>Chapter {n}</option>)}
            </select>
            <button onClick={next} disabled={!hasNext} className={cx(hBtn, 'w-[34px] text-[15px] text-ink disabled:opacity-40')}>›</button>
            <button onClick={() => { setOffline(!offline); if (!offline) flash(t.offlineToast) }} className={cx(hBtn, 'hidden px-3 text-xs font-semibold md:block', offline ? 'text-accent-text' : 'text-ink-2')}>{offline ? t.offlineOn : t.offline}</button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={cx(hBtn, 'px-2.5 text-xs font-semibold text-ink-2')}>{theme === 'light' ? t.dark : t.light}</button>
            <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className={cx(hBtn, 'min-w-10 font-mono text-[11px] text-ink-2')}>{lang === 'id' ? 'ID' : 'EN'}</button>
            <button onClick={() => setSettingsOpen(!settingsOpen)} className={cx('h-[34px] cursor-pointer rounded-lg border-0 px-3 text-xs font-bold', settingsOpen ? 'bg-accent text-white' : 'bg-ink text-bg')}>{t.settings}</button>
          </div>
        </div>
        <div className="h-[3px] bg-surface-2"><div className="h-full bg-accent" style={{ width: `${progressPct}%` }} /></div>
      </header>

      {s.mode === 'scroll' ? (
        <div className="flex flex-col items-center" style={{ padding: `${s.gap}px 0`, gap: s.gap }}>
          {Array.from({ length: PAGES }, (_, i) => (
            <div key={i} className="contents">
              <div
                className={cx('relative flex aspect-page max-w-full items-center justify-center', s.fit === 'width' && 'w-full md:w-[min(100%,820px)]')}
                style={{ ...pageStyle, width: s.fit === 'custom' ? s.customW : undefined, height: s.fit === 'height' ? 'calc(100vh - 59px)' : undefined }}
              >
                <div className="flex flex-col items-center gap-2 font-mono text-xs">
                  <span>{t.page} {i + 1} / {PAGES}</span>
                  <span className="text-[11px]">{pageMeta(i)}</span>
                  {i === load.idx && <div className="mt-1.5 h-[3px] w-[140px] overflow-hidden rounded-xs" style={{ background: bg.b }}><div className="h-full bg-[#3E7BE6]" style={{ width: `${load.pct}%` }} /></div>}
                </div>
              </div>
              {ads && (i + 1) % AD_EVERY === 0 && i < PAGES - 1 && (
                <div className="my-2 flex h-[100px] w-full max-w-[320px] items-center justify-center gap-2.5 rounded-lg border border-dashed font-mono text-[11px] md:h-[90px] md:max-w-[728px]" style={{ borderColor: bg.adLine, color: bg.adInk }}>
                  <span className="font-medium">{t.ad}</span><span>{wide ? '728×90' : '320×100'}</span><span>reader_inline · {t.every} {AD_EVERY}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative flex h-[calc(100vh-59px)] items-center justify-center p-4" style={{ gap: s.gap, flexDirection: s.dir === 'rtl' ? 'row-reverse' : 'row' }}>
          {idxs.map(i => (
            <div key={i} className="relative flex aspect-page h-full items-center justify-center" style={{ ...pageStyle, maxWidth: idxs.length > 1 ? '50%' : '100%' }}>
              <div className="flex flex-col items-center gap-2 font-mono text-xs"><span>{t.page} {i + 1}</span><span className="text-[11px]">{s.quality === 'hd' ? 'HD' : t.saver}</span></div>
            </div>
          ))}
          {s.tap && (
            <>
              <button onClick={() => tap('left')} aria-label="left" className="absolute inset-y-0 left-0 w-[35%] cursor-w-resize border-0 bg-transparent" />
              <button onClick={() => tap('right')} aria-label="right" className="absolute inset-y-0 right-0 w-[35%] cursor-e-resize border-0 bg-transparent" />
            </>
          )}
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 rounded-full border border-line bg-bg px-3 py-1.5 font-mono text-xs text-ink-2">{idxs.map(i => i + 1).join('–')} / {PAGES} · {s.dir === 'rtl' ? 'RTL' : 'LTR'}</div>
        </div>
      )}

      <section className="border-t border-line bg-bg px-3 pb-10 pt-8 md:px-6">
        <div className="mx-auto flex max-w-[720px] flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <div className="font-mono text-xs text-ink-3">{t.endOf} Ch {ch}</div>
            <div className="text-[13px] text-ink-2">{t.releasedWith} <a href="#" className="font-bold">{comic.partner}</a> · {t.licensed}</div>
          </div>

          <AdSlot id="reader_end" size="300×250" w={300} h={250} vertical className="rounded-btn" />

          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => ch > 1 && go(ch - 1)} disabled={ch <= 1} className="h-[52px] cursor-pointer rounded-card border border-line bg-surface text-sm font-bold text-ink disabled:opacity-40">‹ Ch {ch - 1}</button>
            <button onClick={next} disabled={!hasNext} className="h-[52px] cursor-pointer rounded-card border-0 bg-accent text-sm font-bold text-white disabled:opacity-40">{hasNext ? `${t.next} ${ch + 1}` : t.last} ›</button>
          </div>
          <div className="flex flex-wrap justify-between gap-3 font-mono text-[11px] text-ink-3">
            <span>{!hasNext ? '' : load.pre >= 100 ? `Ch ${ch + 1} ${t.prefetched} · 4,2 MB` : `${t.prefetching} · ${load.pre}%`}</span>
            <button onClick={() => flash(t.reported)} className="cursor-pointer border-0 bg-transparent p-0 text-accent-text">{t.report}</button>
          </div>

          <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[15px] font-bold">{t.rate}</div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => setRating(n)} className={cx('cursor-pointer border-0 bg-transparent p-0.5 text-2xl leading-none', n <= rating ? 'text-warn' : 'text-line-2')}>★</button>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.reacts.map((l, i) => (
                <button key={i} onClick={() => setReact(react === i ? null : i)} className={cx('flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold text-ink', react === i ? 'border-accent bg-accent-soft' : 'border-line bg-bg')}>
                  {l}<span className="font-mono text-[11px] text-ink-3">{REACT_COUNTS[i] + (react === i ? 1 : 0)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="text-[17px] font-bold">{t.comments} · {comments.length}</div>
            <div className="flex gap-2">
              <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={t.writeComment} className="h-11 min-w-0 flex-1 rounded-btn border border-line bg-surface px-3.5 text-sm text-ink outline-none" />
              <button
                onClick={() => { if (!draft.trim()) return; setComments(cs => [{ name: 'kamu', text: draft.trim(), time: t.now, likes: 0, liked: false }, ...cs]); setDraft('') }}
                className="h-11 cursor-pointer rounded-btn border-0 bg-ink px-4 text-[13px] font-bold text-bg"
              >{t.send}</button>
            </div>
            {comments.map((c, i) => (
              <div key={i} className="flex gap-3 border-t border-line py-3">
                <div className="grid size-[34px] flex-none place-items-center rounded-full bg-surface-2 text-xs font-bold text-ink-2">{c.name[0].toUpperCase()}</div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-baseline gap-2"><span className="text-[13px] font-bold">{c.name}</span><span className="font-mono text-[11px] text-ink-3">{c.time}</span></div>
                  <div className="text-sm leading-[1.55] text-pretty text-ink-2">{c.text}</div>
                  <button onClick={() => setComments(cs => cs.map((x, j) => (j === i ? { ...x, liked: !x.liked } : x)))} className={cx('cursor-pointer self-start border-0 bg-transparent p-0 text-xs font-semibold', c.liked ? 'text-accent-text' : 'text-ink-3')}>
                    {t.like} · {c.likes + (c.liked ? 1 : 0)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {ads && (
        <div className="sticky bottom-0 z-30 flex h-[50px] items-center justify-center gap-2 border-t border-dashed border-line-2 bg-surface font-mono text-[10px] text-ink-3 md:hidden">
          <span className="font-medium text-ink-2">{t.ad}</span>320×50 · mobile_sticky
        </div>
      )}

      {settingsOpen && (
        <>
          <div onClick={() => setSettingsOpen(false)} className="fixed inset-0 z-60 bg-black/35" />
          <aside className="fixed inset-x-0 bottom-0 z-61 flex max-h-[78vh] flex-col overflow-y-auto rounded-t-panel border border-line bg-bg text-ink md:left-auto md:top-0 md:max-h-none md:w-[360px] md:rounded-none">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-bg px-5 py-4">
              <div className="text-base font-bold">{t.readSettings}</div>
              <button onClick={() => setSettingsOpen(false)} className="size-8 cursor-pointer rounded-lg border-0 bg-surface-2 text-base text-ink">×</button>
            </div>
            <div className="flex flex-col gap-[22px] px-5 pb-7 pt-[18px]">
              {seg('mode', t.mode, [['scroll', t.scroll], ['paged', t.paged], ['double', t.double]])}
              {seg('dir', t.dir, [['ltr', t.ltr], ['rtl', t.rtl]])}
              {seg('fit', t.fit, [['width', t.fitW], ['height', t.fitH], ['custom', t.custom]])}
              {seg('quality', t.quality, [['saver', t.saver], ['hd', t.hd]])}
              {s.fit === 'custom' && (
                <div className="-mt-2.5 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-ink-2"><span>{t.customWidth}</span><span className="font-mono">{s.customW}px</span></div>
                  <input type="range" min={360} max={1200} step={20} value={s.customW} onChange={e => upd({ customW: +e.target.value })} className="w-full accent-[#3E7BE6]" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-ink-3">{t.background}</div>
                <div className="flex gap-2">
                  {(['auto', 'black', 'white', 'sepia'] as const).map(k => (
                    <button
                      key={k}
                      onClick={() => upd({ bg: k })}
                      className="h-11 flex-1 cursor-pointer rounded-btn border-2 text-xs font-semibold"
                      style={{ background: k === 'auto' ? 'linear-gradient(90deg,#0B0B0C 50%,#FFFFFF 50%)' : BG[k].c, color: k === 'black' ? '#ECEDEF' : k === 'auto' ? '#3E7BE6' : '#16171A', borderColor: s.bg === k ? '#3E7BE6' : 'var(--line)' }}
                    >{k === 'auto' ? t.themeBg : t[k]}</button>
                  ))}
                </div>
              </div>
              {slider('gap', t.gap, 0, 40, 2, v => `${v}px`)}
              {slider('speed', t.speed, 1, 10, 1, v => `${v}×`)}
              {slider('bright', t.bright, 40, 100, 5, v => `${v}%`)}
              <div className="flex flex-col gap-0.5 border-t border-line pt-2">
                {toggle('auto', t.auto, t.autoSub)}
                {toggle('tap', t.tap, t.tapSub)}
                {toggle('night', t.night, t.nightSub)}
                {toggle('perTitle', t.perTitle, `${t.perTitleSub} ${comic.title}`)}
              </div>
              <button onClick={reset} className="h-10 cursor-pointer rounded-btn border border-line bg-surface text-[13px] font-semibold text-ink-2">{t.reset}</button>
            </div>
          </aside>
        </>
      )}

      {inter !== 0 && (
        <div className="fixed inset-0 z-80 flex flex-col items-center justify-center gap-[18px] bg-[rgba(10,11,13,0.92)] p-6">
          <div className="flex aspect-[320/480] w-full max-w-[320px] flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-[#4A4E56] font-mono text-xs text-[#9A9EA6] md:aspect-video md:max-w-[640px]">
            <span className="font-medium text-[#ECEDEF]">{t.ad}</span><span>interstitial · reader_interstitial</span><span>{t.interEvery}</span>
          </div>
          <button
            onClick={() => { if (inter > 0) return; setInter(0); go(ch + 1) }}
            disabled={inter > 0}
            className={cx('h-11 cursor-pointer rounded-btn border-0 px-[22px] text-sm font-bold text-white', inter > 0 ? 'bg-[#3A3D44]' : 'bg-[#3E7BE6]')}
          >{inter > 0 ? `${t.skipIn} ${inter}` : `${t.skip} ${ch + 1}`}</button>
        </div>
      )}

      {toast && <div className="fixed bottom-20 left-1/2 z-90 -translate-x-1/2 rounded-btn bg-[#16171A] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,.25)]">{toast}</div>}
    </div>
  )
}
