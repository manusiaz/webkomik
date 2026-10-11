'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdSlot, Badge, BottomNav, Chip, Cover, LangToggle, Logo, Segmented, SectionHead, ThemeToggle, cx } from '@/components/ui'
import { COMICS, GENRES, SEED_PROGRESS, byId, compact, routes, typeLabel, type Comic, type ComicType } from '@/lib/comics'
import { useAdsOn, useLang, usePremium, useProgress } from '@/lib/store'

const MINS = [12, 34, 58, 95, 160, 240, 380, 520, 900, 1500, 2100, 2900]
const HERO = ['langit', 'pedang', 'kedai', 'raja', 'sekolah']
const REC_IDS = ['raja', 'pemburu', 'menara', 'gerbang', 'istana', 'kota', 'lentera', 'mercusuar', 'surat']
const CONTINUE_IDS = ['langit', 'pedang', 'kedai', 'sekolah', 'raja', 'ojek']

const T = {
  id: { continue: 'Lanjut Baca', history: 'Riwayat', forYou: 'Rekomendasi buat kamu', forYouSub: 'Karena kamu baca Langit yang Retak dan Pedang Ketujuh', forYouCaps: 'UNTUK KAMU', barSub: 'Dipilih dari riwayat bacamu', ranking: 'Peringkat', daily: 'Harian', weekly: 'Mingguan', latest: 'Update Terbaru', newc: 'Komik Baru', genre: 'Jelajah Genre', seeAll: 'Lihat semua', online: 'pembaca online', search: 'Cari judul, author, atau genre', searchShort: 'Cari', premium: 'Bebas iklan', all: 'Semua', subnav: ['Terbaru', 'Jadwal', 'Daftar Komik', 'Genre'], ad: 'IKLAN', sponsored: 'Bersponsor', newTag: 'BARU', badge: 'Pilihan buat kamu', start: 'Mulai baca Ch 1', cont: 'Lanjutkan Ch', seoTitle: 'nacp: baca komik, manga, manhwa, dan manhua bahasa Indonesia', seoBody: 'nacp adalah tempat baca komik berlisensi dalam Bahasa Indonesia. Setiap judul dirilis bersama publisher, scanlator, dan kreator yang memberi izin. Chapter baru tayang sesuai jadwal, bisa dibaca dengan scroll atau per halaman, dan riwayat bacamu tersimpan otomatis.', footer: 'Semua konten dirilis bersama partner berlisensi.', fPartner: 'Jadi partner', fRequest: 'Request komik', fPrivacy: 'Privasi', min: (m: number) => (m < 60 ? `${m} mnt` : m < 1440 ? `${Math.round(m / 60)} jam` : `${Math.round(m / 1440)} hari`), views: (v: number) => `${compact(v, 'id')} dilihat` },
  en: { continue: 'Continue Reading', history: 'History', forYou: 'Recommended for you', forYouSub: 'Because you read Langit yang Retak and Pedang Ketujuh', forYouCaps: 'FOR YOU', barSub: 'Picked from your reading history', ranking: 'Ranking', daily: 'Daily', weekly: 'Weekly', latest: 'Latest Updates', newc: 'New Series', genre: 'Browse Genres', seeAll: 'See all', online: 'readers online', search: 'Search titles, authors, genres', searchShort: 'Search', premium: 'Go ad-free', all: 'All', subnav: ['Latest', 'Schedule', 'All Comics', 'Genres'], ad: 'AD', sponsored: 'Sponsored', newTag: 'NEW', badge: 'Picked for you', start: 'Start reading Ch 1', cont: 'Continue Ch', seoTitle: 'nacp: read comics, manga, manhwa and manhua in Indonesian', seoBody: 'nacp is a licensed comic reading site in Indonesian. Every title is released together with publishers, scanlators and creators who granted permission. New chapters go live on schedule, read them by scrolling or page by page, and your history is saved automatically.', footer: 'All content released with licensed partners.', fPartner: 'Become a partner', fRequest: 'Request a comic', fPrivacy: 'Privacy', min: (m: number) => (m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`), views: (v: number) => `${compact(v, 'en')} views` },
}
const SUBNAV_HREF = ['/cari', '/jadwal', '/cari', '/cari']

type Filter = 'Semua' | ComicType
const grid = 'grid gap-3 md:gap-[18px] grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]'
const row = 'no-scrollbar grid grid-flow-col gap-3.5 overflow-x-auto pb-1.5'

export function Home() {
  const router = useRouter()
  const [lang] = useLang()
  const [premium] = usePremium()
  const [prog] = useProgress()
  const ads = useAdsOn()
  const t = T[lang]
  const [type, setType] = useState<Filter>('Semua')
  const [rankTab, setRankTab] = useState<'daily' | 'weekly'>('daily')
  const [genre, setGenre] = useState('Fantasi')
  const [online, setOnline] = useState(11204)
  const [hero, setHero] = useState(0)
  const [barOpen, setBarOpen] = useState(true)

  useEffect(() => {
    const iv = setInterval(() => setOnline(o => o + Math.round((Math.random() - 0.45) * 36)), 2500)
    const hv = setInterval(() => setHero(h => (h + 1) % HERO.length), 6000)
    return () => { clearInterval(iv); clearInterval(hv) }
  }, [])

  const tl = (c: Comic) => typeLabel(c.type, lang)
  const pool = type === 'Semua' ? COMICS : COMICS.filter(c => c.type === type)
  const progMap = { ...SEED_PROGRESS, ...prog }
  const contIds = [...Object.keys(prog).filter(id => byId[id]), ...CONTINUE_IDS.filter(id => !(id in prog))]
  const search = (q: string) => router.push(q ? `/cari?q=${encodeURIComponent(q)}` : '/cari')

  const h = byId[HERO[hero]]
  const hRead = progMap[h.id]
  const side = [1, 2].map(i => byId[HERO[(hero + i) % HERO.length]])
  const ranking = [...pool].sort((a, b) => (rankTab === 'daily' ? b.v - a.v : b.r * 1e5 + b.ch - (a.r * 1e5 + a.ch))).slice(0, 10)
  const updates = pool.slice(0, 11)
  const recs = REC_IDS.map(id => byId[id]).filter(c => pool.includes(c))
  const newList = [...COMICS].sort((a, b) => a.ch - b.ch).filter(c => pool.includes(c)).slice(0, 6)
  const genreList = COMICS.filter(c => c.genre === genre).concat(COMICS.filter(c => c.genre !== genre)).slice(0, 6)
  const barPool = COMICS.filter(c => !contIds.includes(c.id))
  // mobile shows 4 of 6 cards in "new" and "genre" grids
  const hideMobile = (i: number, n: number) => (i >= n ? 'max-md:hidden' : '')

  const recSection = (
    <section className="lg:hidden">
      <SectionHead title={t.forYou} href="/cari" linkLabel={t.seeAll} sub={t.forYouSub} />
      <div className={cx(row, 'auto-cols-[160px] gap-3 md:auto-cols-[240px] md:gap-[18px]')}>
        {recs.map(c => (
          <Link key={c.id} href={routes.comic(c.id)} className="flex flex-col gap-2 text-ink hover:no-underline">
            <Cover h={c.h} label={false}>
              <Badge className="left-2 top-2">{tl(c)}</Badge>
              <span className="absolute bottom-2 left-2.5 font-mono text-[10px] text-white/50">cover</span>
            </Cover>
            <div className="line-clamp-2 text-[15px] font-bold leading-[1.3]">{c.title}</div>
            <div className="text-xs text-ink-3">{c.genre} · ★ {c.r.toFixed(1)}</div>
          </Link>
        ))}
      </div>
    </section>
  )

  return (
    <div className="relative flex min-h-screen flex-col bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-3.5 py-3 md:px-8">
          <Logo />
          <nav className="hidden gap-1 md:flex">
            {(['Semua', 'Manga', 'Manhwa', 'Manhua', 'Lokal'] as Filter[]).map(ty => (
              <button key={ty} onClick={() => setType(ty)} className={cx('cursor-pointer whitespace-nowrap rounded-lg border-0 px-3.5 py-2 text-sm font-bold', type === ty ? 'bg-surface-2 text-ink' : 'bg-transparent text-ink-3')}>
                {ty === 'Semua' ? t.all : typeLabel(ty, lang)}
              </button>
            ))}
          </nav>
          <nav className="hidden gap-0.5 xl:flex">
            {t.subnav.map((l, i) => <Link key={l} href={SUBNAV_HREF[i]} className="whitespace-nowrap px-2.5 py-2 text-[13px] font-semibold text-ink-3 hover:no-underline">{l}</Link>)}
          </nav>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            <Link href="/cari" className="flex h-9 flex-none items-center whitespace-nowrap rounded-[9px] border border-line bg-surface px-3 text-[13px] font-semibold text-ink-2 hover:no-underline min-[1080px]:hidden">{t.searchShort}</Link>
            <input
              onKeyDown={e => { if (e.key === 'Enter') search(e.currentTarget.value.trim()) }}
              placeholder={t.search}
              className="hidden h-[38px] min-w-[140px] max-w-[300px] flex-1 rounded-[9px] border border-line bg-surface px-3.5 text-sm text-ink outline-none min-[1080px]:block"
            />
            <LangToggle />
            <ThemeToggle />
            <Link href="/profil" className="hidden h-9 flex-none items-center whitespace-nowrap rounded-[9px] bg-accent px-3.5 text-[13px] font-bold text-white hover:no-underline md:flex">{premium ? 'Premium ✓' : t.premium}</Link>
          </div>
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3.5 pb-2.5 md:hidden">
          {(['Semua', 'Manga', 'Manhwa', 'Manhua', 'Lokal'] as Filter[]).map(ty => (
            <button key={ty} onClick={() => setType(ty)} className={cx('cursor-pointer whitespace-nowrap rounded-full border border-line px-3.5 py-[7px] text-[13px] font-bold', type === ty ? 'bg-ink text-bg' : 'bg-surface text-ink-2')}>
              {ty === 'Semua' ? t.all : typeLabel(ty, lang)}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-3.5 pb-14 pt-3.5 md:gap-12 md:px-8 md:pt-6">
        <section className="grid gap-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <Link href={routes.comic(h.id)} className="cover-ph relative block min-h-[460px] overflow-hidden rounded-panel text-white hover:no-underline md:min-h-[420px] lg:min-h-[480px]" style={{ '--ph': `oklch(0.38 0.1 ${h.h})` } as React.CSSProperties}>
            <span className="absolute right-4 top-3.5 font-mono text-[11px] text-white/55">key art · 1600×900</span>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_35%,rgba(0,0,0,0.82)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2.5 p-[18px] md:p-8">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-chip bg-accent px-[9px] py-1">{t.badge}</span>
                <span className="rounded-chip bg-white/16 px-[9px] py-1">{tl(h)} · {h.genre}</span>
              </div>
              <div className="max-w-[16ch] text-[34px] font-extrabold leading-none tracking-[-0.04em] text-balance md:text-[54px]">{h.title}</div>
              <div className="max-w-[58ch] text-[15px] leading-[1.55] text-white/82 text-pretty">{h.syn?.[lang]}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3.5">
                <span className="rounded-btn bg-white px-5 py-3 text-sm font-extrabold text-[#16171A]">{hRead ? `${t.cont} ${hRead}` : t.start}</span>
                <span className="text-[13px] text-white/75">★ {h.r.toFixed(1)} · {t.views(h.v)}</span>
                <div className="ml-auto flex gap-1.5">
                  {HERO.map((id, i) => (
                    <button key={id} aria-label={byId[id].title} onClick={e => { e.preventDefault(); setHero(i) }} className={cx('h-1.5 cursor-pointer rounded-[3px] border-0 p-0', i === hero ? 'w-[22px] bg-white' : 'w-1.5 bg-white/40')} />
                  ))}
                </div>
              </div>
            </div>
          </Link>
          <div className="hidden grid-rows-2 gap-3 lg:grid">
            {side.map(c => (
              <Link key={c.id} href={routes.comic(c.id)} className="cover-ph relative block overflow-hidden rounded-panel text-white hover:no-underline" style={{ '--ph': `oklch(0.36 0.08 ${c.h})` } as React.CSSProperties}>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.8)_100%)]" />
                <span className="absolute right-3 top-2.5 font-mono text-[10px] text-white/50">key art</span>
                <div className="absolute inset-x-[18px] bottom-4">
                  <div className="mb-1 text-xs font-bold text-white/75">{tl(c)} · Ch {c.ch}</div>
                  <div className="text-[22px] font-extrabold leading-[1.1] tracking-[-0.03em]">{c.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-8 md:gap-12">
            <section>
              <SectionHead title={t.continue} href="/riwayat" linkLabel={t.history} />
              <div className={cx(row, 'auto-cols-[132px] md:auto-cols-[180px]')}>
                {contIds.map(id => {
                  const c = byId[id], read = progMap[id], nw = c.ch - read
                  return (
                    <Link key={id} href={routes.read(id, read)} className="flex flex-col gap-2 text-ink hover:no-underline">
                      <Cover h={c.h} label={false}>
                        <span className="absolute left-2.5 top-[9px] font-mono text-[10px] text-white/50">cover</span>
                        {nw > 0 && <Badge tone="accent" className="right-2 top-2 px-2">+{nw}</Badge>}
                        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.78))] px-2.5 pb-2.5 pt-7 text-white">
                          <div className="mb-1.5 font-mono text-[11px]">Ch {read} / {c.ch}</div>
                          <div className="h-1 overflow-hidden rounded-sm bg-white/25"><div className="h-full bg-white" style={{ width: `${Math.round((read / c.ch) * 100)}%` }} /></div>
                        </div>
                      </Cover>
                      <div className="truncate text-sm font-bold">{c.title}</div>
                    </Link>
                  )
                })}
              </div>
            </section>

            {recSection}

            {ads && (
              <div>
                <AdSlot id="home_top" size="320×100" w={320} h={100} className="md:hidden" />
                <AdSlot id="home_top" size="728×90" w={728} h={90} className="max-md:hidden" />
              </div>
            )}

            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.03em]">{t.ranking}</h2>
                <Segmented value={rankTab} onChange={setRankTab} options={[['daily', t.daily], ['weekly', t.weekly]]} />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:gap-[18px]">
                {ranking.map((c, i) => (
                  <Link key={c.id} href={routes.comic(c.id)} className={cx('flex flex-col gap-2 text-ink hover:no-underline', i >= 6 && 'max-md:hidden', i >= 8 && 'max-lg:hidden')}>
                    <Cover h={c.h} label={false}>
                      <span className="absolute right-2.5 top-[9px] font-mono text-[10px] text-white/50">cover</span>
                      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.75))]" />
                      <span className="absolute bottom-0.5 left-2.5 text-[52px] font-extrabold leading-none tracking-[-0.06em] text-white md:text-[72px]">{i + 1}</span>
                      <Badge tone="glass" className="bottom-2.5 right-2.5 px-2">Ch {c.ch}</Badge>
                    </Cover>
                    <div>
                      <div className="truncate text-[15px] font-bold">{c.title}</div>
                      <div className="mt-0.5 text-xs text-ink-3">{c.genre} · {t.views(c.v)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="min-w-0">
              <SectionHead title={t.latest} href="/cari" linkLabel={t.seeAll} />
              <div className={grid}>
                {updates.map((c, i) => {
                  const m = MINS[i % MINS.length]
                  return (
                    <FeedItem key={c.id} hidden={i >= 8} ad={ads && i === 4 && updates.length > 4 ? t.sponsored : null}>
                      <Link href={routes.comic(c.id)} className="block hover:no-underline">
                        <Cover h={c.h}>
                          <Badge className="left-2 top-2">{tl(c)}</Badge>
                          {m < 60 && <Badge tone="accent" className="right-2 top-2">UP</Badge>}
                        </Cover>
                      </Link>
                      <Link href={routes.comic(c.id)} className="truncate text-[15px] font-bold text-ink">{c.title}</Link>
                      <div className="flex flex-col gap-1">
                        {[[c.ch, m], [c.ch - 1, m * 7 + 1440]].map(([ch, mm], j) => (
                          <Link key={ch} href={routes.read(c.id, ch)} className="flex justify-between gap-2 rounded-[7px] border border-line bg-surface px-2.5 py-1.5 text-[13px] font-semibold text-ink hover:no-underline">
                            Ch {ch}<span className={cx('font-mono text-[11px] font-normal', j === 0 && m < 60 ? 'text-accent-text' : 'text-ink-3')}>{t.min(mm)}</span>
                          </Link>
                        ))}
                      </div>
                    </FeedItem>
                  )
                })}
              </div>
            </section>

            <section>
              <SectionHead title={t.newc} href="/cari" linkLabel={t.seeAll} />
              <div className={grid}>
                {newList.map((c, i) => (
                  <Link key={c.id} href={routes.comic(c.id)} className={cx('flex flex-col gap-2 text-ink hover:no-underline', hideMobile(i, 4))}>
                    <Cover h={c.h}><Badge tone="accent" className="left-2 top-2 px-2 tracking-[0.03em]">{t.newTag}</Badge></Cover>
                    <div className="truncate text-[15px] font-bold">{c.title}</div>
                    <div className="text-xs text-ink-3">{tl(c)} · Ch {c.ch}</div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="m-0 mb-3.5 text-[22px] font-extrabold tracking-[-0.03em]">{t.genre}</h2>
              <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
                {GENRES.map(g => <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</Chip>)}
              </div>
              <div className={grid}>
                {genreList.map((c, i) => (
                  <Link key={c.id} href={routes.comic(c.id)} className={cx('flex flex-col gap-2 text-ink hover:no-underline', hideMobile(i, 4))}>
                    <Cover h={c.h} />
                    <div className="truncate text-[15px] font-bold">{c.title}</div>
                    <div className="text-xs text-ink-3">{tl(c)} · ★ {c.r.toFixed(1)}</div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="flex flex-wrap items-start gap-x-10 gap-y-4 border-t border-line pt-7">
              <div className="min-w-[260px] max-w-[720px] flex-1">
                <h1 className="m-0 mb-2.5 text-base font-bold text-ink-2">{t.seoTitle}</h1>
                <p className="m-0 text-sm leading-[1.7] text-ink-3 text-pretty">{t.seoBody}</p>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line px-3.5 py-2 font-mono text-xs text-ink-2">
                <span className="size-[7px] rounded-full bg-ok" />{online.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} {t.online}
              </div>
            </section>
          </div>

          <aside className="no-scrollbar sticky top-[84px] hidden max-h-[calc(100vh-100px)] flex-col gap-4 overflow-y-auto rounded-panel border border-line bg-surface p-[18px] lg:flex">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="m-0 text-[19px] font-extrabold tracking-[-0.03em]">{t.forYou}</h2>
                <Link href="/cari" className="text-xs font-bold">{t.seeAll}</Link>
              </div>
              <div className="mt-1 text-xs leading-[1.45] text-ink-3">{t.forYouSub}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
              {recs.slice(0, 6).map(c => (
                <Link key={c.id} href={routes.comic(c.id)} className="flex flex-col gap-[7px] text-ink hover:no-underline">
                  <Cover h={c.h} className="aspect-cover rounded-btn" label={false}>
                    <span className="absolute left-[7px] top-[7px] rounded-[5px] bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">{tl(c)}</span>
                    <span className="absolute bottom-[7px] right-[7px] rounded-[5px] bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">★ {c.r.toFixed(1)}</span>
                  </Cover>
                  <div className="line-clamp-2 text-[13px] font-bold leading-[1.3]">{c.title}</div>
                </Link>
              ))}
            </div>
            <AdSlot id="home_sidebar" size="300×250" h={250} vertical className="flex-none bg-bg!" />
          </aside>
        </div>
      </main>

      <footer className="border-t border-line px-3.5 pb-6 pt-5 md:px-8 md:pb-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-4 text-[13px] text-ink-3">
          <span className="text-base font-extrabold tracking-[-0.04em] text-ink">nacp</span>
          <span>{t.footer}</span>
          <div className="ml-auto flex flex-wrap gap-4">
            <Link href="/landing#partner">{t.fPartner}</Link>
            <Link href="/cari">{t.fRequest}</Link>
            <Link href="/legal/hakcipta">DMCA</Link>
            <Link href="/legal/privasi">{t.fPrivacy}</Link>
          </div>
        </div>
      </footer>

      <div className="sticky bottom-0 z-30 mt-auto">
        {barOpen ? (
          <div className="border-t border-line bg-surface shadow-[0_-12px_32px_rgba(0,0,0,0.22)]">
            <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-3.5 py-2.5 md:px-8">
              <div className="hidden w-[120px] flex-none flex-col gap-[3px] md:flex">
                <span className="font-mono text-[10px] font-medium tracking-[0.06em] text-accent-text">{t.forYouCaps}</span>
                <span className="text-[13px] font-bold leading-[1.35]">{t.barSub}</span>
              </div>
              <div className="no-scrollbar flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth py-0.5 md:gap-3">
                {barPool.map(c => (
                  <Link key={c.id} href={routes.comic(c.id)} title={c.title} className="cover-ph relative aspect-cover w-24 flex-none snap-start overflow-hidden rounded-btn hover:no-underline md:w-[132px]" style={{ '--ph': `oklch(0.42 0.09 ${c.h})` } as React.CSSProperties}>
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-px text-[9px] font-bold text-white">{tl(c)}</span>
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.85))] px-2 pb-2 pt-[26px] text-white">
                      <div className="line-clamp-2 text-xs font-extrabold leading-[1.25]">{c.title}</div>
                      <div className="mt-0.5 text-[10px] text-white/75">Ch {c.ch} · ★ {c.r.toFixed(1)}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <button onClick={() => setBarOpen(false)} aria-label="close" className="size-8 flex-none cursor-pointer self-start rounded-lg border-0 bg-surface-2 text-[15px] text-ink-2">×</button>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none flex justify-end px-3.5 pb-2.5 md:px-8">
            <button onClick={() => setBarOpen(true)} className="pointer-events-auto h-[38px] cursor-pointer rounded-full border-0 bg-accent px-4 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,.25)]">{t.forYou} ↑</button>
          </div>
        )}
        <div className="md:hidden">
          {ads && (
            <div className="flex h-[50px] items-center justify-center gap-2 border-t border-dashed border-line-2 bg-surface font-mono text-[10px] text-ink-3">
              <span className="font-medium text-ink-2">{t.ad}</span>320×50 · mobile_sticky
            </div>
          )}
          <BottomNav active={0} />
        </div>
      </div>
    </div>
  )
}

/** Feed card; a native ad of the same size is inserted before the 5th item. */
function FeedItem({ ad, hidden, children }: { ad: string | null; hidden: boolean; children: React.ReactNode }) {
  return (
    <>
      {ad && (
        <div className="flex aspect-cover flex-col items-center justify-center gap-1 rounded-card border border-dashed border-line-2 bg-surface font-mono text-[11px] text-ink-3">
          <span className="font-medium text-ink-2">{ad}</span><span>native</span><span>home_feed_native</span>
        </div>
      )}
      <div className={cx('flex min-w-0 flex-col gap-2', hidden && 'max-md:hidden')}>{children}</div>
    </>
  )
}
