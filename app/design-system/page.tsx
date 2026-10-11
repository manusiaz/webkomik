import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'
import { DesignSystem } from './DesignSystem'

export const dynamic = 'force-static'
export const metadata: Metadata = { title: 'nacp · Design System', robots: { index: false } }

const src = (f: string) => readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), f), 'utf8')

/** Top-level `export function Name` plus its doc comment, up to the closing `}` at column 0. */
function fnSource(file: string, name: string) {
  const m = file.match(new RegExp(`(?:/\\*\\*[^\\n]*\\*/\\n)?export function ${name}\\b[\\s\\S]*?\\n}\\n`))
  return m ? m[0].trimEnd() : ''
}

export default function Page() {
  const css = src('app/globals.css')
  const ui = src('components/ui.tsx')
  const vars = css.slice(css.indexOf(':root'), css.indexOf('@theme inline')).trim()
  const theme = css.match(/@theme inline \{[\s\S]*?\n\}/)?.[0] ?? ''
  const breakpoints = css.match(/@theme \{[\s\S]*?\n\}/)?.[0] ?? ''

  const code = {
    css: `/* app/globals.css */\n${vars}\n/* warna aksen bisa diganti dari Admin > Tampilan: tulis ulang --accent di <html style> */`,
    theme: `/* app/globals.css — Tailwind v4, config CSS-first (tanpa tailwind.config.ts) */\n@import "tailwindcss";\n\n@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));\n\n${theme}\n\n${breakpoints}`,
    jsx: `// components/ui.tsx\n${fnSource(ui, 'Cover')}\n\n${fnSource(ui, 'AdSlot')}\n\n// Pemakaian: kartu komik
<Link href={routes.comic(c.id)} className="flex flex-col gap-2 text-ink">
  <Cover h={c.h} label={false}>
    <Badge className="left-2 top-2">{typeLabel(c.type, lang)}</Badge>
    <Badge tone="accent" className="right-2 top-2">UP</Badge>
  </Cover>
  <p className="truncate text-[15px] font-bold">{c.title}</p>
  <p className="text-xs text-ink-3">{c.genre} · ★ {c.r}</p>
</Link>

// Pemakaian: slot iklan, tinggi tetap supaya layout tidak lompat
<AdSlot id="home_top" size="728×90" w={728} h={90} />`,
  }

  return <DesignSystem code={code} />
}
