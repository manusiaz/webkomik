'use client'
import type { ChangeEvent, CSSProperties, ReactNode } from 'react'
import { cx } from '@/components/ui'

export const panel = 'rounded-[14px] border border-line bg-surface p-[18px]'
export const input = 'h-10 rounded-[9px] border border-line px-3 text-sm text-ink'
export const select = 'h-10 rounded-[9px] border border-line px-2.5 text-[13px] text-ink'
export const textarea = 'resize-y rounded-[9px] border border-line px-3 py-2.5 text-[13px] text-ink'
export const btnPrimary = 'cursor-pointer rounded-[9px] border-0 bg-accent font-bold text-white'
export const btnGhost = 'cursor-pointer rounded-[9px] border border-line bg-surface text-ink-2'
export const sectionLabel = 'text-xs font-bold text-ink-3'

export function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return <label className={cx('flex flex-col gap-[5px] text-xs font-semibold text-ink-2', className)}>{label}{children}</label>
}

export function Track({ on, sm }: { on: boolean; sm?: boolean }) {
  return (
    <span className={cx('flex flex-none rounded-full p-[3px]', sm ? 'h-[22px] w-9' : 'h-6 w-10', on ? 'justify-end bg-accent' : 'justify-start bg-line-2')}>
      <span className={cx('rounded-full bg-white', sm ? 'size-4' : 'size-[18px]')} />
    </span>
  )
}

export function ToggleRow({ on, onClick, label, sub, className, labelClass = 'text-[13px] font-bold' }: { on: boolean; onClick: () => void; label: ReactNode; sub?: ReactNode; className?: string; labelClass?: string }) {
  return (
    <button onClick={onClick} className={cx('flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent text-left text-ink', className ?? 'py-2.5')}>
      <span className="flex flex-col gap-0.5"><span className={labelClass}>{label}</span>{sub && <span className="text-xs text-ink-3">{sub}</span>}</span>
      <Track on={on} />
    </button>
  )
}

export function Seg<T extends string>({ value, options, onChange, btn = 'h-8 px-3.5', full, className, radius = 'rounded-[9px]' }: { value: T; options: [T, string][]; onChange: (v: T) => void; btn?: string; full?: boolean; className?: string; radius?: string }) {
  return (
    <div className={cx('flex bg-surface-2 p-[3px]', radius, className)}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={cx('cursor-pointer rounded-[7px] border-0 text-xs font-bold', btn, full && 'flex-1', value === v ? 'bg-bg text-ink' : 'bg-transparent text-ink-3')}>{l}</button>
      ))}
    </div>
  )
}

export function Range({ label, display, min, max, step = 1, value, onChange, sub, big }: { label: ReactNode; display: ReactNode; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; sub?: ReactNode; big?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={cx('flex justify-between', big ? 'text-[13px]' : 'text-xs')}>
        <span className={big ? 'font-semibold' : 'font-bold text-ink-3'}>{label}</span>
        <span className="font-mono text-ink-2">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(+e.target.value)} className="w-full accent-accent" />
      {sub && <div className="text-xs text-ink-3">{sub}</div>}
    </div>
  )
}

export function Kpi({ label, value, delta, deltaColor }: { label: string; value: ReactNode; delta: string; deltaColor: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-4">
      <div className="text-xs font-semibold text-ink-3">{label}</div>
      <div className="text-2xl font-extrabold tracking-[-0.03em]">{value}</div>
      <div className="font-mono text-[11px]" style={{ color: deltaColor }}>{delta}</div>
    </div>
  )
}

export function Thumb({ bg, className, style }: { bg: string; className?: string; style?: CSSProperties }) {
  return <div className={cx('aspect-cover flex-none', className)} style={{ background: bg, ...style }} />
}

export function PickChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={cx('cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold', on ? 'border-accent bg-accent-soft text-accent-text' : 'border-line bg-surface text-ink-2')}>{children}</button>
  )
}

export function Drawer({ onClose, width = 'min-[900px]:w-[480px]', head, children, foot, overlay = 'bg-black/40' }: { onClose: () => void; width?: string; head: ReactNode; children: ReactNode; foot: ReactNode; overlay?: string }) {
  return (
    <>
      <div onClick={onClose} className={cx('fixed inset-0 z-60', overlay)} />
      <aside className={cx('fixed inset-y-0 right-0 z-61 flex w-full flex-col overflow-y-auto border-l border-line bg-bg', width)}>
        <div className="sticky top-0 z-2 flex items-center justify-between gap-3 border-b border-line bg-bg px-[22px] py-4">
          {head}
          <button onClick={onClose} className="size-8 flex-none cursor-pointer rounded-lg border-0 bg-surface-2 text-base text-ink">×</button>
        </div>
        {children}
        <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-line bg-bg px-[22px] py-3.5">{foot}</div>
      </aside>
    </>
  )
}

export function FilterPill({ on, onClick, children, className = 'h-[34px] px-3' }: { on: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button onClick={onClick} className={cx('cursor-pointer rounded-full border border-line text-xs font-bold', className, on ? 'bg-ink text-bg' : 'bg-surface text-ink-2')}>{children}</button>
  )
}
