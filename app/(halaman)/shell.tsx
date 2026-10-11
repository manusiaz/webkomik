'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { BottomNav, LangToggle, Logo, ThemeToggle, cx } from '@/components/ui'
import { useAdsOn, useLogged } from '@/lib/store'
import { ToastProvider, useT } from './shared'

const TOP = ['/', '/jadwal', '/cari', '/bookmark', '/riwayat']
const BOTTOM = ['/', '/cari', '/bookmark', '/riwayat', '/profil']

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname()
  const t = useT()
  const [logged] = useLogged()
  const ads = useAdsOn()
  return (
    <ToastProvider>
      <div className="relative flex min-h-screen flex-col bg-bg text-ink">
        <header className="sticky top-0 z-30 border-b border-line bg-bg">
          <div className="mx-auto flex max-w-[1440px] items-center gap-[18px] px-3.5 py-3 md:px-8">
            <Logo />
            <nav className="hidden gap-0.5 md:flex">
              {TOP.map((href, i) => (
                <Link key={href} href={href} className={cx('whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold hover:no-underline', path === href ? 'bg-surface-2 text-ink' : 'text-ink-3')}>{t.nav[i]}</Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <LangToggle />
              <ThemeToggle labels={{ light: t.light, dark: t.dark }} />
              <Link href="/profil" className={cx('grid size-9 place-items-center rounded-full border border-line text-[13px] font-extrabold hover:no-underline', logged ? 'bg-accent text-white' : 'bg-surface text-ink-2')}>{logged ? 'R' : '?'}</Link>
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-3.5 pb-14 pt-[18px] md:px-8 md:pt-8">{children}</main>
        <div className="sticky bottom-0 z-30 mt-auto md:hidden">
          {ads && <div className="flex h-[50px] items-center justify-center gap-2 border-t border-dashed border-line-2 bg-surface font-mono text-[10px] text-ink-3"><span className="font-medium text-ink-2">{t.ad}</span>320×50 · mobile_sticky</div>}
          <BottomNav active={BOTTOM.indexOf(path)} />
        </div>
      </div>
    </ToastProvider>
  )
}
