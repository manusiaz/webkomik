'use client'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { COMICS, coverBg, routes, typeLabel } from '@/lib/comics'
import { useLang } from '@/lib/store'
import { Cover, LangToggle, ThemeToggle, cx } from '@/components/ui'
import { T } from './T'

type BipEvent = Event & { prompt: () => Promise<void> }

const WALL_SRC = COMICS.slice(0, 9)
const PARTNERS = ['Studio Kertas', 'Hanul Media', 'Kumo Press', 'Jade Lantern', 'Rumah Panel']
const TYPE_KEYS = ['Manga', 'Manhwa', 'Manhua', 'Lokal']
const PAD = 'px-4 md:px-8'
const H2 = 'm-0 text-[30px] md:text-[44px] font-extrabold tracking-[-0.04em] text-balance'

function A({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return href.startsWith('/') ? <Link href={href} className={className}>{children}</Link> : <a href={href} className={className}>{children}</a>
}

function Seg({ value, labels, onChange, track, btn }: { value: number; labels: string[]; onChange: (i: number) => void; track: string; btn: string }) {
  return (
    <div className={cx('flex self-start bg-surface-2 p-[3px]', track)}>
      {labels.map((l, i) => (
        <button key={l} onClick={() => onChange(i)} className={cx('cursor-pointer border-0 font-bold', btn, value === i ? 'bg-bg text-ink' : 'bg-transparent text-ink-3')}>{l}</button>
      ))}
    </div>
  )
}

export function Landing() {
  const [lang] = useLang()
  const t = T[lang]
  const [q, setQ] = useState(0)
  const [os, setOs] = useState(0)
  const [toast, setToast] = useState('')
  const bip = useRef<BipEvent | null>(null)
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); bip.current = e as BipEvent }
    addEventListener('beforeinstallprompt', on)
    return () => { removeEventListener('beforeinstallprompt', on); clearTimeout(tt.current) }
  }, [])

  const install = () => {
    if (bip.current) { bip.current.prompt(); bip.current = null; return }
    setToast(t.installHint)
    clearTimeout(tt.current)
    tt.current = setTimeout(() => setToast(''), 3200)
  }

  const plans = [
    { name: t.free, price: 'Rp0', per: '', items: t.freeItems, cta: t.freeCta, href: '/', box: 'bg-bg border border-line', btn: 'bg-surface text-ink' },
    { name: t.prem, price: 'Rp15rb', per: t.perMonth, items: t.premItems, cta: t.premCta, href: routes.page('profil'), box: 'bg-accent-soft border-2 border-accent', btn: 'bg-accent text-white' },
  ]

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className={cx('mx-auto flex max-w-[1240px] items-center gap-5 py-3', PAD)}>
          <a href="#top" className="flex items-center gap-2 text-[23px] font-extrabold tracking-[-0.05em] text-ink hover:no-underline"><span className="size-[11px] rounded-[3px] bg-accent" />nacp</a>
          <nav className="hidden gap-0.5 md:flex">
            {t.nav.map((l, i) => <a key={l} href={['#fitur', '#aplikasi', '#premium', '#faq'][i]} className="px-3 py-2 text-sm font-semibold text-ink-2 hover:no-underline">{l}</a>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <Link href="/" className="flex h-9 items-center whitespace-nowrap rounded-[9px] bg-accent px-4 text-[13px] font-extrabold text-white hover:no-underline">{t.cta}</Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className={cx('mx-auto grid max-w-[1240px] items-center gap-12 py-10 md:py-20 min-[1000px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]', PAD)}>
          <div className="flex flex-col gap-[22px]">
            <span className="self-start rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-bold text-accent-text">{t.badge}</span>
            <h1 className="m-0 text-balance text-[42px] font-extrabold leading-[0.98] tracking-[-0.05em] md:text-[58px] min-[1000px]:text-[76px]">{t.h1}</h1>
            <p className="m-0 max-w-[52ch] text-pretty text-lg leading-[1.6] text-ink-2">{t.sub}</p>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/" className="flex h-[52px] items-center rounded-card bg-accent px-6 text-base font-extrabold text-white hover:no-underline">{t.cta}</Link>
              <button onClick={install} className="h-[52px] cursor-pointer rounded-card border border-line bg-surface px-[22px] text-base font-bold text-ink">{t.install}</button>
            </div>
            <div className="flex flex-wrap gap-7 pt-2">
              {t.stats.map(([v, l]) => <div key={l}><div className="text-[26px] font-extrabold tracking-[-0.03em]">{v}</div><div className="text-[13px] text-ink-3">{l}</div></div>)}
            </div>
          </div>
          <div className="grid h-[420px] grid-cols-3 gap-3.5 overflow-hidden [mask-image:linear-gradient(180deg,transparent_0,#000_8%,#000_88%,transparent_100%)] md:h-[600px]">
            {[0, -90, -40].map((offset, c) => (
              <div key={c} className="flex flex-col gap-3.5" style={{ marginTop: offset }}>
                {[0, 1, 2, 3].map(r => {
                  const x = WALL_SRC[(c * 3 + r) % WALL_SRC.length]
                  return (
                    <Link key={r} href={routes.comic(x.id)} className="block flex-none hover:no-underline">
                      <Cover h={x.h} label={false} className="aspect-cover rounded-[14px]">
                        <span className="absolute left-2 top-2 rounded-chip bg-black/55 px-[7px] py-[3px] text-[11px] font-bold text-white">{typeLabel(x.type, lang)}</span>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-black/0 to-black/85 px-2.5 pb-2.5 pt-[30px] text-[13px] font-extrabold leading-[1.25] text-white">{x.title}</div>
                      </Cover>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        <section className={cx('mx-auto max-w-[1240px] pb-[72px]', PAD)}>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            {t.types.map(([label, sub], i) => {
              const covers = WALL_SRC.filter(c => c.type === TYPE_KEYS[i]).slice(0, 3).map(c => coverBg(c.h)).concat([coverBg(i * 90 + 40)]).slice(0, 3)
              return (
                <Link key={label} href={routes.page('cari')} className="flex items-center gap-3.5 rounded-panel border border-line bg-surface p-3.5 text-ink hover:no-underline">
                  <div className="flex flex-none">
                    {covers.map((bg, j) => <div key={j} className="-mr-3.5 aspect-cover w-[42px] rounded-[7px] border-2 border-surface" style={{ background: bg }} />)}
                  </div>
                  <div className="pl-[18px]"><div className="text-[17px] font-extrabold">{label}</div><div className="text-xs text-ink-3">{sub}</div></div>
                </Link>
              )
            })}
          </div>
        </section>

        <section id="fitur" className="border-y border-line bg-surface">
          <div className={cx('mx-auto flex max-w-[1240px] flex-col gap-10 py-20', PAD)}>
            <h2 className={cx(H2, 'max-w-[18ch]')}>{t.featH}</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-[18px]">
              <Feature title={t.f1} body={t.f1b}>
                <div className="flex flex-wrap gap-2">
                  {PARTNERS.map(p => <span key={p} className="flex items-center gap-2 rounded-[9px] border border-line bg-surface py-1.5 pl-1.5 pr-2.5 text-xs font-bold"><span className="size-[22px] rounded-chip border border-dashed border-line-2" />{p}</span>)}
                </div>
              </Feature>
              <Feature title={t.f2} body={t.f2b}>
                <div className="flex flex-col gap-2">
                  <Seg value={q} labels={t.q} onChange={setQ} track="rounded-[9px]" btn="h-[30px] rounded-[7px] px-3 text-xs" />
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 flex-1 overflow-hidden rounded bg-surface-2"><div className="h-full bg-accent" style={{ width: q === 0 ? '34%' : '100%' }} /></div>
                    <span className="min-w-[110px] font-mono text-xs text-ink-2">{q === 0 ? '≈ 2,1 MB / ch' : '≈ 6,4 MB / ch'}</span>
                  </div>
                </div>
              </Feature>
              <Feature title={t.f3} body={t.f3b}>
                <div className="flex flex-wrap gap-1.5">
                  {t.reader.map(c => <span key={c} className="rounded-full border border-line bg-surface px-[11px] py-1.5 text-xs font-bold text-ink-2">{c}</span>)}
                </div>
              </Feature>
            </div>
          </div>
        </section>

        <section id="aplikasi" className={cx('mx-auto grid max-w-[1240px] items-center gap-12 py-[88px] min-[1000px]:grid-cols-[360px_minmax(0,1fr)]', PAD)}>
          <div className="aspect-[9/19] w-[260px] justify-self-center rounded-[40px] bg-[#0B0B0C] p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-[31px] bg-[#0F1013]">
              <div className="flex items-center gap-1.5 px-3.5 pb-2 pt-4 text-base font-extrabold tracking-[-0.04em] text-[#ECEDEF]"><span className="size-2 rounded-[2px] bg-[#3E7BE6]" />nacp</div>
              <div className="grid grid-cols-2 gap-2 px-3.5">
                {[250, 20, 60, 300, 160, 230].map(h => <div key={h} className="aspect-cover rounded-lg" style={{ background: `repeating-linear-gradient(135deg,rgba(255,255,255,0.035) 0 6px,transparent 6px 12px),${coverBg(h)}` }} />)}
              </div>
              <div className="mt-auto grid grid-cols-4 border-t border-[#272A31] pb-3.5 pt-2.5">
                {t.phoneNav.map((l, i) => <span key={l} className={cx('text-center text-[9px] font-bold', i === 0 ? 'text-[#ECEDEF]' : 'text-[#6F737B]')}>{l}</span>)}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className={H2}>{t.appH}</h2>
            <p className="m-0 max-w-[54ch] text-base leading-[1.6] text-ink-2">{t.appSub}</p>
            <div className="flex flex-col gap-2.5">
              {t.appPerks.map(p => <div key={p} className="flex gap-3 text-[15px] text-ink-2"><span className="grid size-5 flex-none place-items-center rounded-full bg-accent text-[11px] font-extrabold text-white">✓</span>{p}</div>)}
            </div>
            <Seg value={os} labels={t.os} onChange={setOs} track="rounded-btn" btn="h-[34px] rounded-lg px-3.5 text-[13px]" />
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {(os === 0 ? t.stepsA : t.stepsI).map((s, i) => <li key={s} className="flex items-baseline gap-3 text-sm text-ink-2"><span className="font-mono text-xs text-ink-3">0{i + 1}</span>{s}</li>)}
            </ol>
            <button onClick={install} className="h-12 cursor-pointer self-start rounded-card border-0 bg-accent px-[22px] text-[15px] font-extrabold text-white">{t.install}</button>
          </div>
        </section>

        <section id="premium" className="border-y border-line bg-surface">
          <div className={cx('mx-auto flex max-w-[1000px] flex-col gap-8 py-20', PAD)}>
            <h2 className={cx(H2, 'text-center')}>{t.priceH}</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
              {plans.map(pl => (
                <div key={pl.name} className={cx('flex flex-col gap-4 rounded-[20px] p-[26px]', pl.box)}>
                  <div className="flex items-baseline justify-between"><span className="text-xl font-extrabold">{pl.name}</span><span className="text-[26px] font-extrabold tracking-[-0.03em]">{pl.price}<span className="text-[13px] font-semibold text-ink-3">{pl.per}</span></span></div>
                  <div className="flex flex-col gap-[9px]">
                    {pl.items.map(it => <div key={it} className="flex gap-2.5 text-sm text-ink-2"><span className="font-extrabold text-accent-text">✓</span>{it}</div>)}
                  </div>
                  <Link href={pl.href} className={cx('mt-auto flex h-[46px] items-center justify-center rounded-[11px] border border-line text-sm font-extrabold hover:no-underline', pl.btn)}>{pl.cta}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cx('mx-auto max-w-[1240px] py-20', PAD)}>
          <div className="grid items-center gap-7 rounded-[24px] bg-accent p-6 text-white md:p-11 min-[1000px]:grid-cols-[minmax(0,1fr)_auto]">
            <div><h2 className={H2}>{t.partnerH}</h2><p className="mb-0 mt-3 max-w-[56ch] text-base leading-[1.6]">{t.partnerSub}</p></div>
            <a href="mailto:partner@nacp.id" className="flex h-[50px] items-center justify-self-start whitespace-nowrap rounded-card bg-white px-[22px] text-[15px] font-extrabold text-[#16171A] hover:no-underline min-[1000px]:justify-self-end">{t.partnerCta}</a>
          </div>
        </section>

        <section id="faq" className={cx('mx-auto flex max-w-[860px] flex-col gap-5 pb-[88px]', PAD)}>
          <h2 className={H2}>FAQ</h2>
          <div className="flex flex-col border-t border-line">
            {t.faq.map(([qq, a], i) => (
              <details key={i} name="faq" open={i === 0} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none justify-between gap-4 py-[18px] text-[17px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {qq}<span className="flex-none text-xl leading-none text-ink-3"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span>
                </summary>
                <p className="mb-[18px] mt-0 max-w-[68ch] text-[15px] leading-[1.65] text-ink-2">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className={cx('mx-auto grid max-w-[1240px] gap-7 py-11 md:grid-cols-2 min-[1000px]:grid-cols-[1.6fr_1fr_1fr_1fr]', PAD)}>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.05em]"><span className="size-2.5 rounded-[3px] bg-accent" />nacp</div>
            <p className="m-0 max-w-[42ch] text-[13px] leading-[1.6] text-ink-3">{t.seo}</p>
          </div>
          {t.foot.map(([h, links]) => (
            <div key={h} className="flex flex-col gap-2">
              <div className="text-xs font-extrabold tracking-[0.04em] text-ink-3">{h}</div>
              {links.map(([label, href]) => <A key={label} href={href} className="text-sm text-ink-2">{label}</A>)}
            </div>
          ))}
        </div>
        <div className={cx('mx-auto max-w-[1240px] border-t border-line pb-7 pt-4 text-xs text-ink-3', PAD)}>© 2026 nacp · {t.rights}</div>
      </footer>

      {toast && <div className="fixed bottom-6 left-1/2 z-90 max-w-[calc(100%-24px)] -translate-x-1/2 rounded-btn bg-[#16171A] px-4 py-3 text-[13px] font-semibold leading-normal text-white">{toast}</div>}
    </div>
  )
}

function Feature({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-line bg-bg p-[22px]">
      {children}
      <div><div className="text-[19px] font-extrabold tracking-[-0.02em]">{title}</div><p className="mb-0 mt-1.5 text-sm leading-[1.6] text-ink-2">{body}</p></div>
    </div>
  )
}
