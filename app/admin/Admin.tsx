'use client'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cx } from '@/components/ui'
import { useTheme } from '@/lib/store'
import { ACCESS, ADMIN_COMICS, COMMENTS, NAV, REPORTS, ROLES, type Role, type SectionKey } from './data'
import { Ads } from './sections/Ads'
import { Comments } from './sections/Comments'
import { Dashboard } from './sections/Dashboard'
import { Partners } from './sections/Partners'
import { Reports } from './sections/Reports'
import { Schedule } from './sections/Schedule'
import { Site } from './sections/Site'
import { Titles } from './sections/Titles'
import { Upload, type UploadTarget } from './sections/Upload'
import { Users } from './sections/Users'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function Admin({ me }: { me: { role: Role; name: string } }) {
  const router = useRouter()
  const [theme, setTheme] = useTheme()
  const [role, setRole] = useState<Role>(me.role)
  const signOut = async () => { await createClient().auth.signOut(); router.replace('/login') }
  const [sec, setSec] = useState<SectionKey>('dashboard')
  const [visited, setVisited] = useState<Set<SectionKey>>(() => new Set(['dashboard']))
  const [comics, setComics] = useState(ADMIN_COMICS)
  const [comments, setComments] = useState(COMMENTS)
  const [reports, setReports] = useState(REPORTS)
  const [accent, setAccent] = useState('#3E7BE6')
  const [target, setTarget] = useState<UploadTarget>({ id: 'langit', ch: 129, n: 0 })
  const [toast, setToast] = useState('')
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined)

  const flash = useCallback((m: string) => {
    setToast(m)
    clearTimeout(tt.current)
    tt.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const go = useCallback((s: SectionKey) => {
    setSec(s)
    setVisited(v => (v.has(s) ? v : new Set(v).add(s)))
    history.replaceState(null, '', '?s=' + s)
  }, [])

  useEffect(() => {
    const sp = new URLSearchParams(location.search).get('s')
    if (sp && NAV.some(n => n[0] === sp)) go(sp as SectionKey)
  }, [go])

  const allowed = ACCESS[role]
  const flagged = comments.filter(c => !c.done && c.flags > 0).length
  const openReports = reports.filter(r => !r.fixed).length
  const label = (NAV.find(n => n[0] === sec) ?? NAV[0])[1]
  const nav = NAV.filter(n => allowed.includes(n[0]))
  const badge = (k: SectionKey) => (k === 'comments' ? flagged || '' : k === 'reports' ? openReports || '' : '')

  const sections: Record<SectionKey, ReactNode> = {
    dashboard: <Dashboard comics={comics} flagged={flagged} openReports={openReports} go={go} />,
    titles: <Titles comics={comics} setComics={setComics} role={role} flash={flash} onUpload={(id, ch) => { setTarget(t => ({ id, ch, n: t.n + 1 })); go('upload') }} />,
    upload: <Upload comics={comics} setComics={setComics} role={role} flash={flash} target={target} />,
    schedule: <Schedule comics={comics} />,
    ads: <Ads role={role} flash={flash} />,
    users: <Users />,
    comments: <Comments comments={comments} setComments={setComments} flash={flash} />,
    partners: <Partners comics={comics} />,
    reports: <Reports comics={comics} reports={reports} setReports={setReports} />,
    site: <Site accent={accent} setAccent={setAccent} flash={flash} />,
  }

  return (
    <div className="grid min-h-screen bg-bg text-ink min-[900px]:grid-cols-[232px_minmax(0,1fr)]" style={{ '--accent': accent } as CSSProperties}>
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 overflow-y-auto border-r border-line bg-surface px-3 py-[18px] min-[900px]:flex">
        <Link href="/" className="flex items-center gap-2 px-2.5 pt-1 pb-[18px] text-xl font-extrabold tracking-[-0.05em] text-ink hover:no-underline">
          <span className="size-2.5 rounded-[3px] bg-accent" />nacp<span className="ml-0.5 font-mono text-[10px] font-medium tracking-normal text-ink-3">admin</span>
        </Link>
        {nav.map(([k, l]) => (
          <button key={k} onClick={() => go(k)} className={cx('flex cursor-pointer items-center justify-between rounded-lg border-0 px-2.5 py-[9px] text-left text-[13px] font-semibold', sec === k ? 'bg-surface-2 text-ink' : 'bg-transparent text-ink-2')}>
            {l}<span className="font-mono text-[10px] text-ink-3">{badge(k)}</span>
          </button>
        ))}
        <div className="mt-auto flex flex-col gap-2 border-t border-line px-2.5 pt-3">
          {me.role === 'Admin' && (
            <>
              <div className="text-[11px] font-bold text-ink-3">Lihat sebagai</div>
              <div className="flex rounded-lg bg-surface-2 p-[3px]">
                {ROLES.map(r => (
                  <button key={r} onClick={() => setRole(r)} className={cx('h-7 flex-1 cursor-pointer rounded-md border-0 text-[11px] font-semibold', role === r ? 'bg-surface text-ink' : 'bg-transparent text-ink-3')}>{r}</button>
                ))}
              </div>
            </>
          )}
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="h-[30px] cursor-pointer rounded-lg border border-line bg-bg text-xs font-semibold text-ink-2">
            {theme === 'light' ? 'Mode gelap' : 'Mode terang'}
          </button>
          <button onClick={signOut} className="h-[30px] cursor-pointer rounded-lg border border-line bg-bg text-xs font-semibold text-ink-2">Keluar</button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col gap-[22px] px-4 pt-6 pb-[60px] min-[900px]:px-8">
        <div className="flex gap-1.5 overflow-x-auto pb-1 min-[900px]:hidden">
          {nav.map(([k, l]) => (
            <button key={k} onClick={() => go(k)} className={cx('cursor-pointer whitespace-nowrap rounded-full border border-line px-3 py-[7px] text-xs font-bold', sec === k ? 'bg-surface-2 text-ink' : 'bg-transparent text-ink-2')}>{l}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 font-mono text-[11px] text-ink-3">Admin / {label}</div>
            <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.03em]">{label}</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-3">
            <span>Masuk sebagai <b className="text-ink-2">{me.name}</b> ({role})</span>
            <button onClick={signOut} className="cursor-pointer rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-2 min-[900px]:hidden">Keluar</button>
          </div>
        </div>

        {NAV.map(([k]) => visited.has(k) && (
          <div key={k} className={sec === k && allowed.includes(k) ? 'contents' : 'hidden'}>{sections[k]}</div>
        ))}

        {!allowed.includes(sec) && (
          <div className="max-w-[560px] rounded-[14px] border border-dashed border-line-2 bg-surface p-10">
            <div className="mb-1.5 text-base font-bold">Akses terbatas</div>
            <div className="text-sm leading-[1.6] text-ink-2">Role kamu tidak punya akses ke halaman ini.</div>
          </div>
        )}
      </main>

      {toast && <div className="fixed bottom-6 left-1/2 z-90 -translate-x-1/2 rounded-btn bg-[#16171A] px-4 py-2.5 text-[13px] font-semibold text-white">{toast}</div>}
    </div>
  )
}
