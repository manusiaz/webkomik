'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SEED_PROGRESS, compact, routes } from '@/lib/comics'
import { useBookmarks, useLang, useLogged, usePremium, useStored, useTheme } from '@/lib/store'
import { cx } from '@/components/ui'
import { H1, useT, useToast } from '../shared'

const field = 'h-[46px] rounded-[11px] border bg-bg px-3.5 text-sm text-ink outline-none'
const METHODS = ['QRIS', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'VA Bank']

function Auth() {
  const t = useT()
  const flash = useToast()
  const [, setLogged] = useLogged()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [tried, setTried] = useState(false)
  const emailOk = /.+@.+\..+/.test(email), pwOk = pw.length >= 6
  const err = tried ? (!emailOk ? t.errEmail : !pwOk ? t.errPw : '') : ''
  const login = () => { setLogged(true); flash(t.welcome) }
  const title = isRegister ? t.register : t.login
  return (
    <div className="mx-auto my-6 flex w-full max-w-[420px] flex-col gap-3.5 rounded-[18px] border border-line bg-surface p-7">
      <div className="flex rounded-btn bg-surface-2 p-[3px]">
        {([[false, t.login], [true, t.register]] as const).map(([v, l]) => (
          <button key={l} onClick={() => { setIsRegister(v); setTried(false) }} className={cx('h-9 flex-1 cursor-pointer rounded-lg border-0 text-[13px] font-bold', isRegister === v ? 'bg-bg text-ink' : 'bg-transparent text-ink-3')}>{l}</button>
        ))}
      </div>
      <h1 className="mb-0 mt-1 text-2xl font-extrabold tracking-[-0.03em]">{title}</h1>
      <div className="text-[13px] leading-normal text-ink-3">{t.authSub}</div>
      <button onClick={login} className="h-[46px] cursor-pointer rounded-[11px] border border-line bg-bg text-sm font-bold text-ink">{t.google}</button>
      <div className="flex items-center gap-2.5 text-xs text-ink-3"><span className="h-px flex-1 bg-line" />{t.or}<span className="h-px flex-1 bg-line" /></div>
      {isRegister && <input placeholder={t.username} className={cx(field, 'border-line')} />}
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className={cx(field, tried && !emailOk ? 'border-danger' : 'border-line')} />
      <input value={pw} onChange={e => setPw(e.target.value)} placeholder={t.password} type="password" className={cx(field, tried && !pwOk ? 'border-danger' : 'border-line')} />
      {err && <div className="text-xs font-semibold text-danger">{err}</div>}
      <button onClick={() => { if (!emailOk || !pwOk) return setTried(true); setTried(false); login() }} className="h-12 cursor-pointer rounded-[11px] border-0 bg-accent text-[15px] font-extrabold text-white">{title}</button>
      <div className="text-center text-xs text-ink-3">{t.noAccountNote}</div>
    </div>
  )
}

function PayModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const flash = useToast()
  const [, setPremium] = usePremium()
  const [plan, setPlan] = useState(0)
  const [method, setMethod] = useState('QRIS')
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/50" />
      <div role="dialog" aria-modal className="fixed left-1/2 top-1/2 z-[61] grid max-h-[calc(100vh-40px)] w-[min(440px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 auto-rows-max gap-3.5 overflow-y-auto rounded-[18px] border border-line bg-bg p-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-extrabold">{t.payTitle}</div>
          <button onClick={onClose} aria-label="close" className="size-8 cursor-pointer rounded-lg border-0 bg-surface-2 text-base text-ink">×</button>
        </div>
        <div className="flex flex-col gap-2">
          {t.plans.map(([l, sub, price], i) => (
            <button key={l} onClick={() => setPlan(i)} className={cx('flex cursor-pointer items-center justify-between rounded-card border-2 bg-surface p-3.5 text-left text-ink', plan === i ? 'border-accent' : 'border-line')}>
              <span className="flex flex-col gap-0.5"><span className="text-sm font-extrabold">{l}</span><span className="text-xs text-ink-3">{sub}</span></span>
              <span className="text-[15px] font-extrabold">{price}</span>
            </button>
          ))}
        </div>
        <div className="text-xs font-extrabold text-ink-3">{t.payMethod}</div>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map(m => (
            <button key={m} onClick={() => setMethod(m)} className={cx('h-[46px] cursor-pointer rounded-btn border-2 bg-surface text-[13px] font-bold text-ink', method === m ? 'border-accent' : 'border-line')}>{m}</button>
          ))}
        </div>
        <button onClick={() => { setPremium(true); onClose(); flash(t.paid) }} className="h-12 cursor-pointer rounded-[11px] border-0 bg-accent text-[15px] font-extrabold text-white">{t.pay} {t.plans[plan][2]} · {method}</button>
        <div className="text-center text-[11px] text-ink-3">{t.payNote}</div>
      </div>
    </>
  )
}

const PREFS = { notif: true }

export function Profil() {
  const t = useT()
  const flash = useToast()
  const router = useRouter()
  const [lang, setLang] = useLang()
  const [theme, setTheme] = useTheme()
  const [logged, setLogged] = useLogged()
  const [premium, setPremium] = usePremium()
  const [bm] = useBookmarks()
  const [prefs, setPrefs] = useStored('nacp-prefs', PREFS)
  const [payOpen, setPayOpen] = useState(false)
  if (!logged) return <Auth />

  const stats = [[compact(1284, lang), t.stats[0]], ['96', t.stats[1]], [String(bm.length), t.stats[2]], ['41', t.stats[3]]]
  const settings: [string, string, string, () => void][] = [
    [...t.set[0], lang === 'id' ? 'Indonesia' : 'English', () => setLang(lang === 'id' ? 'en' : 'id')],
    [...t.set[1], theme === 'dark' ? t.dark : t.light, () => setTheme(theme === 'light' ? 'dark' : 'light')],
    [...t.set[2], prefs.notif ? t.on : t.off, () => setPrefs({ ...prefs, notif: !prefs.notif })],
    [...t.set[3], '›', () => router.push(routes.read('langit', SEED_PROGRESS.langit))],
    [...t.set[4], premium ? 'HD' : 'Auto', () => {}],
  ] as [string, string, string, () => void][]

  return (
    <>
      <div className="flex flex-wrap items-center gap-[18px]">
        <div className="grid size-[84px] place-items-center rounded-full bg-accent text-[32px] font-extrabold text-white">R</div>
        <div className="min-w-[200px] flex-1">
          <H1>raka.dibaca</H1>
          <div className="mt-1 text-[13px] text-ink-3">{t.member}{premium ? ' · Premium' : ''}</div>
        </div>
        <button onClick={() => { setLogged(false); setPremium(false) }} className="h-[38px] cursor-pointer rounded-btn border border-line bg-surface px-3.5 text-[13px] font-bold text-ink-2">{t.logout}</button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {stats.map(([v, l]) => (
          <div key={l} className="rounded-card border border-line bg-surface p-4">
            <div className="text-2xl font-extrabold tracking-[-0.03em]">{v}</div>
            <div className="mt-0.5 text-xs text-ink-3">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-4">
        <div className={cx('flex flex-col gap-3.5 rounded-panel border p-[22px]', premium ? 'border-accent bg-accent-soft' : 'border-line bg-surface')}>
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-xl font-extrabold tracking-[-0.02em]">nacp Premium</div>
            <div className="text-sm font-bold text-ink-2">Rp15.000<span className="text-xs text-ink-3">{t.perMonth}</span></div>
          </div>
          <div className="flex flex-col gap-2">
            {t.perks.map(p => (
              <div key={p} className="flex gap-2.5 text-sm text-ink-2">
                <span className="grid size-[18px] flex-none place-items-center rounded-full bg-accent text-[11px] font-extrabold text-white">✓</span>{p}
              </div>
            ))}
          </div>
          {premium && <div className="text-[13px] font-bold text-accent-text">{t.premActive}</div>}
          <button onClick={() => (premium ? flash(t.premActive) : setPayOpen(true))} className={cx('h-[46px] cursor-pointer rounded-[11px] border-0 text-sm font-extrabold', premium ? 'bg-surface text-ink' : 'bg-accent text-white')}>{premium ? t.manage : t.subscribe}</button>
        </div>
        <div className="flex flex-col rounded-panel border border-line bg-surface px-5 py-2">
          {settings.map(([label, sub, value, onClick]) => (
            <button key={label} onClick={onClick} className="flex cursor-pointer items-center justify-between gap-3 border-0 border-b border-solid border-line bg-transparent py-3.5 text-left text-ink">
              <span className="flex flex-col gap-0.5"><span className="text-sm font-bold">{label}</span><span className="text-xs text-ink-3">{sub}</span></span>
              <span className="whitespace-nowrap text-[13px] font-bold text-accent-text">{value}</span>
            </button>
          ))}
        </div>
      </div>
      {payOpen && <PayModal onClose={() => setPayOpen(false)} />}
    </>
  )
}
