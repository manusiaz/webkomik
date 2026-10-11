'use client'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { coverBg } from '@/lib/comics'
import { cx } from '@/lib/cx'
import { useAdsOn, useLang, useTheme } from '@/lib/store'


export function Logo({ href = '/', size = 'md' }: { href?: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: ['text-[19px]', 'size-[9px]'], md: ['text-[23px]', 'size-[11px]'], lg: ['text-[28px]', 'size-[13px]'] }[size]
  return (
    <Link href={href} className={cx('flex flex-none items-center gap-2 font-extrabold tracking-[-0.05em] text-ink hover:no-underline', s[0])}>
      <span className={cx('rounded-[3px] bg-accent', s[1])} />nacp
    </Link>
  )
}

const toolBtn = 'h-9 rounded-[9px] border border-line bg-surface text-ink-2 cursor-pointer'

export function LangToggle({ className }: { className?: string }) {
  const [lang, setLang] = useLang()
  return (
    <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className={cx(toolBtn, 'min-w-[42px] font-mono text-xs', className)}>
      {lang === 'id' ? 'ID' : 'EN'}
    </button>
  )
}

/** Label names the theme you switch TO, like the prototype. */
export function ThemeToggle({ className, labels }: { className?: string; labels?: { light: string; dark: string } }) {
  const [theme, setTheme] = useTheme()
  const [lang] = useLang()
  const l = labels ?? (lang === 'id' ? { light: 'Terang', dark: 'Gelap' } : { light: 'Light', dark: 'Dark' })
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={cx(toolBtn, 'flex-none whitespace-nowrap px-3 text-[13px] font-semibold', className)}>
      {theme === 'light' ? l.dark : l.light}
    </button>
  )
}

/** 3:4 placeholder cover. Swap for next/image once covers live on the CDN. */
export function Cover({ h, className, style, children, l, c, label = 'cover' }: { h: number; className?: string; style?: CSSProperties; children?: ReactNode; l?: number; c?: number; label?: string | false }) {
  return (
    <div className={cx('cover-ph relative overflow-hidden', className ?? 'aspect-cover rounded-card')} style={{ '--ph': coverBg(h, l, c), ...style } as CSSProperties}>
      {label && <span className="pointer-events-none absolute bottom-2 left-2.5 font-mono text-[10px] text-white/50">{label}</span>}
      {children}
    </div>
  )
}

export function Badge({ children, tone = 'dark', className }: { children: ReactNode; tone?: 'dark' | 'accent' | 'glass'; className?: string }) {
  const t = { dark: 'bg-black/55 font-bold', accent: 'bg-accent font-extrabold', glass: 'bg-white/18 font-bold' }[tone]
  return <span className={cx('absolute rounded-chip px-[7px] py-[3px] text-[11px] text-white', t, className)}>{children}</span>
}

/** Fixed-height slot so layout never jumps when the network fills it. Hidden for premium. */
export function AdSlot({ id, size, w, h, className, vertical, label }: { id: string; size: string; w?: number; h: number; className?: string; vertical?: boolean; label?: string }) {
  const on = useAdsOn()
  const [lang] = useLang()
  if (!on) return null
  return (
    <div
      data-slot={id}
      style={{ maxWidth: w, height: h }}
      className={cx('mx-auto flex w-full items-center justify-center gap-2.5 rounded-lg border border-dashed border-line-2 bg-surface font-mono text-[11px] text-ink-3', vertical && 'flex-col gap-1', className)}
    >
      <span className="font-medium text-ink-2">{label ?? (lang === 'id' ? 'IKLAN' : 'AD')}</span><span>{size}</span><span>{id}</span>
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange, size = 'md', className }: { value: T; options: [T, string][]; onChange: (v: T) => void; size?: 'sm' | 'md'; className?: string }) {
  return (
    <div className={cx('flex rounded-[9px] bg-surface-2 p-[3px]', className)}>
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cx('cursor-pointer rounded-[7px] border-0 font-bold', size === 'md' ? 'px-4 py-[7px] text-[13px]' : 'h-8 px-3.5 text-xs', value === v ? 'bg-bg text-ink' : 'bg-transparent text-ink-3')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button onClick={onClick} className={cx('cursor-pointer whitespace-nowrap rounded-full border border-line px-4 py-2 text-[13px] font-bold', active ? 'bg-ink text-bg' : 'bg-surface text-ink-2', className)}>
      {children}
    </button>
  )
}

/** 40×24 toggle, knob 18 */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx('flex h-6 w-10 flex-none cursor-pointer rounded-full border-0 p-[3px]', on ? 'justify-end bg-accent' : 'justify-start bg-line-2')}>
      <span className="size-[18px] rounded-full bg-white" />
    </button>
  )
}

export function SectionHead({ title, href, linkLabel, sub }: { title: ReactNode; href?: string; linkLabel?: ReactNode; sub?: ReactNode }) {
  return (
    <div className={sub ? 'mb-3.5' : 'mb-4'}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.03em]">{title}</h2>
        {href && <Link href={href} className="text-[13px] font-bold">{linkLabel}</Link>}
      </div>
      {sub && <div className="mt-1 text-[13px] text-ink-3">{sub}</div>}
    </div>
  )
}

const BN = { id: ['Beranda', 'Cari', 'Bookmark', 'Riwayat', 'Profil'], en: ['Home', 'Search', 'Bookmarks', 'History', 'Profile'] }
const BN_HREF = ['/', '/cari', '/bookmark', '/riwayat', '/profil']

/** Mobile bottom nav shared by the reading site; `active` is the index. */
export function BottomNav({ active }: { active: number }) {
  const [lang] = useLang()
  return (
    <nav className="grid grid-cols-5 border-t border-line bg-bg">
      {BN[lang].map((label, i) => (
        <Link key={i} href={BN_HREF[i]} className={cx('flex h-[58px] flex-col items-center justify-center gap-[5px] text-[11px] font-bold hover:no-underline', i === active ? 'text-ink' : 'text-ink-3')}>
          <span className={cx('h-[3px] w-[18px] rounded-sm', i === active ? 'bg-accent' : 'bg-transparent')} />{label}
        </Link>
      ))}
    </nav>
  )
}

export { cx }
