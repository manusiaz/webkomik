'use client'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { coverBg } from '@/lib/comics'
import { useTheme } from '@/lib/store'
import { Cover, Switch, cx } from '@/components/ui'

const COLORS = [
  ['Background', '--bg', '#F6F6F4 / #0F1013', 'Latar halaman'], ['Surface', '--surface', '#FFFFFF / #17191D', 'Kartu, panel, input'], ['Surface 2', '--surface-2', '#EFEFEC / #1F2127', 'Track segmented, avatar'],
  ['Ink', '--ink', '#16171A / #ECEDEF', 'Teks utama'], ['Ink 2', '--ink-2', '#50545D / #A4A8B0', 'Teks sekunder'], ['Ink 3', '--ink-3', '#868A93 / #6F737B', 'Meta, label'],
  ['Line', '--line', '#E3E3DF / #272A31', 'Border'], ['Line 2', '--line-2', '#CFCFCA / #363A42', 'Border dashed iklan'],
  ['Accent', '--accent', '#3E7BE6', 'Tombol utama, progress'], ['Accent text', '--accent-text', '#2A62C9 / #86ABF2', 'Link, teks aksen'], ['Accent soft', '--accent-soft', '#E7EEFB / #1A2640', 'Chip aktif, highlight'],
]
const STATUS = [['Sukses', '#2FA67A'], ['Peringatan', '#F2A93B'], ['Bahaya', '#D9534F'], ['Rating', '#F2A93B']]
const HUES = [250, 20, 60, 300, 160, 230, 350, 150]
const TYPE: [string, string, number, number, string, string][] = [
  ['Display', '56 / 800 / -0.04em', 56, 800, '-0.04em', 'Langit yang Retak'], ['H1', '40 / 800 / -0.04em', 40, 800, '-0.04em', 'Jadwal Update'], ['H2 section', '22 / 800 / -0.03em', 22, 800, '-0.03em', 'Rekomendasi buat kamu'],
  ['Judul kartu', '15 / 700', 15, 700, '0', 'Pedang Ketujuh'], ['Body', '15 / 400 / 1.6', 15, 400, '0', 'Sejak langit di atas Kota Arga retak, setiap malam turun serpihan cahaya.'], ['Meta', '12 / 400 · ink-3', 12, 400, '0', 'Fantasi · ★ 4.8 · Ch 128'],
  ['Label', '12 / 800 / 0.04em', 12, 800, '0.04em', 'PENGECUALIAN'], ['Mono', '11–12 / Plex Mono', 12, 400, '0', 'halaman 9 / 14 · 728×90 · 12 mnt'],
]
const SPACING: [number, number, string][] = [[1, 4, 'ikon ↔ teks'], [2, 8, 'gap chip'], [3, 12, 'gap kartu mobile'], [4, 16, 'padding panel'], [5, 18, 'gap kartu desktop'], [6, 24, 'padding section'], [8, 32, 'padding halaman desktop'], [12, 48, 'jarak antar section']]
const RADII: [number, string][] = [[6, 'badge'], [8, 'tombol kecil'], [10, 'tombol'], [12, 'kartu/cover'], [16, 'panel/hero'], [999, 'chip']]
const CHIPS = ['Fantasi', 'Aksi', 'Romansa', 'Horor', 'Komedi']
const SEGS = [['scroll', 'Scroll'], ['paged', 'Per halaman'], ['double', 'Dua halaman']]
const ADS: [number, number, string][] = [[728, 90, 'Leaderboard · home_top'], [320, 100, 'Mobile banner'], [300, 250, 'Rectangle · reader_end'], [300, 600, 'Half page · sidebar'], [320, 50, 'Mobile sticky'], [320, 480, 'Interstitial']]
const NOTES = [
  { t: 'Gambar dulu', b: 'Cover 3:4 minimal 150px (mobile) / 190px (desktop). Teks judul di bawah cover, badge di atas cover. Jangan pakai thumbnail kecil di list utama.' },
  { t: 'Gambar chapter', b: 'Disimpan di CDN sendiri dalam 2 versi (HD 1600w, hemat 800w), format WebP/AVIF, lazy-load + prefetch chapter berikutnya.' },
  { t: 'Tema & bahasa', b: 'data-theme di <html>, preferensi di localStorage (nacp-theme, nacp-lang). Reader punya latar sendiri: ikut tema / hitam / putih / sepia.' },
  { t: 'Iklan', b: 'Semua slot dikonfigurasi dari Admin > Iklan (jaringan, rotasi, frekuensi, target, jadwal). Pengguna premium tidak memuat script iklan sama sekali.' },
]

type Code = { css: string; theme: string; jsx: string }
const TABS: [keyof Code, string][] = [['css', 'globals.css'], ['theme', 'globals.css (@theme)'], ['jsx', 'Komponen']]

const H2 = 'm-0 text-[22px] font-extrabold tracking-[-0.02em]'
const PANEL = 'rounded-[14px] border border-line bg-surface'
const CAP = 'text-xs font-extrabold tracking-[0.04em] text-ink-3'
const SEG_BTN = (on: boolean) => cx('h-8 cursor-pointer rounded-[7px] border-0 text-xs font-bold', on ? 'bg-bg text-ink' : 'bg-transparent text-ink-3')

function Section({ title, children, head }: { title: string; children: ReactNode; head?: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      {head ?? <h2 className={H2}>{title}</h2>}
      {children}
    </section>
  )
}

const Badge = ({ children, accent, glass, wide }: { children: ReactNode; accent?: boolean; glass?: boolean; wide?: boolean }) => (
  <span className={cx('rounded-chip py-[3px] text-[11px] text-white', wide ? 'px-2' : 'px-[7px]', accent ? 'bg-accent font-extrabold' : glass ? 'bg-white/18 font-bold' : 'bg-black/55 font-bold')}>{children}</span>
)

export function DesignSystem({ code }: { code: Code }) {
  const [theme, setTheme] = useTheme()
  const [chip, setChip] = useState('Fantasi')
  const [seg, setSeg] = useState('scroll')
  const [tg, setTg] = useState(true)
  const [tab, setTab] = useState<keyof Code>('css')
  const [copied, setCopied] = useState(false)

  const copy = () => { navigator.clipboard?.writeText(code[tab]).catch(() => {}); setCopied(true) }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-4 pb-20 pt-10 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[28px] font-extrabold tracking-[-0.05em]"><span className="size-[13px] rounded-[3px] bg-accent" />nacp</div>
            <h1 className="mb-0 mt-2.5 text-[44px] font-extrabold tracking-[-0.04em]">Design System</h1>
            <p className="mb-0 mt-2 max-w-[60ch] text-[15px] leading-[1.6] text-ink-2">Dipakai bareng di situs baca, webapp, landing page, dan panel admin. Semua warna lewat CSS variable, jadi tema terang/gelap cukup ganti atribut <code className="font-mono text-[13px]">data-theme</code> di root.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-[38px] cursor-pointer rounded-[9px] border border-line bg-surface px-3.5 text-[13px] font-bold text-ink">{theme === 'dark' ? 'Lihat tema terang' : 'Lihat tema gelap'}</button>
            <Link href="/" className="flex h-[38px] items-center rounded-[9px] bg-accent px-3.5 text-[13px] font-bold text-white hover:no-underline">Lihat situs →</Link>
          </div>
        </header>

        <Section title="01 · Warna">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
            {COLORS.map(([name, v, hex, use]) => (
              <div key={v} className="overflow-hidden rounded-card border border-line bg-surface">
                <div className="h-[72px]" style={{ background: `var(${v})` }} />
                <div className="flex flex-col gap-[3px] px-3 py-2.5">
                  <span className="text-[13px] font-bold">{name}</span>
                  <span className="font-mono text-[11px] text-ink-3">{v}</span>
                  <span className="font-mono text-[11px] text-ink-2">{hex}</span>
                  <span className="text-[11px] text-ink-3">{use}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-ink-3">Status</span>
            {STATUS.map(([name, hex]) => <span key={name} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-bold"><span className="size-3 rounded-[3px]" style={{ background: hex }} />{name} <span className="font-mono font-normal text-ink-3">{hex}</span></span>)}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-ink-3">Placeholder cover (per judul, hue berbeda)</span>
            {HUES.map(h => <div key={h} className="aspect-cover w-11 rounded-chip" style={{ background: `repeating-linear-gradient(135deg,rgba(255,255,255,0.035) 0 6px,transparent 6px 12px),${coverBg(h)}` }} />)}
            <span className="font-mono text-[11px] text-ink-3">oklch(0.42 0.09 H)</span>
          </div>
        </Section>

        <Section title="02 · Tipografi">
          <div className="text-sm text-ink-2">Plus Jakarta Sans untuk semua teks UI. IBM Plex Mono untuk angka teknis: nomor halaman, ukuran slot, waktu, kode.</div>
          <div className="flex flex-col border-t border-line">
            {TYPE.map(([name, spec, size, weight, ls, sample]) => (
              <div key={name} className="grid grid-cols-[170px_minmax(0,1fr)] items-baseline gap-5 border-b border-line py-3.5">
                <div className="flex flex-col gap-0.5"><span className="text-[13px] font-bold">{name}</span><span className="font-mono text-[11px] text-ink-3">{spec}</span></div>
                <div className={cx('truncate leading-[1.15]', name === 'Mono' && 'font-mono')} style={{ fontSize: size, fontWeight: weight, letterSpacing: ls }}>{sample}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="03 · Spacing & radius">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4">
            <div className={cx(PANEL, 'flex flex-col gap-2.5 p-[18px]')}>
              {SPACING.map(([n, px, use]) => (
                <div key={n} className="flex items-center gap-3"><span className="w-10 font-mono text-xs text-ink-3">{n}</span><div className="h-3 rounded-[3px] bg-accent" style={{ width: px }} /><span className="text-xs text-ink-2">{use}</span></div>
              ))}
            </div>
            <div className={cx(PANEL, 'flex flex-wrap items-end gap-3.5 p-[18px]')}>
              {RADII.map(([px, use]) => (
                <div key={px} className="flex flex-col items-center gap-1.5"><div className="size-16 border border-line-2 bg-surface-2" style={{ borderRadius: px }} /><span className="font-mono text-[11px] text-ink-3">{px}px</span><span className="text-[11px] text-ink-2">{use}</span></div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="04 · Komponen">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
            <div className={cx(PANEL, 'flex flex-col gap-3.5 p-5')}>
              <div className={CAP}>TOMBOL</div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button className="h-11 cursor-pointer rounded-btn border-0 bg-accent px-5 text-sm font-extrabold text-white">Lanjutkan Ch 127</button>
                <button className="h-11 cursor-pointer rounded-btn border border-line bg-surface px-[18px] text-sm font-bold text-ink">Bookmark</button>
                <button className="h-11 cursor-pointer rounded-btn border-0 bg-ink px-[18px] text-sm font-bold text-bg">Kirim</button>
                <button className="h-9 cursor-pointer rounded-lg border-0 bg-danger px-3 text-xs font-bold text-white">Hapus</button>
              </div>
              <div className="font-mono text-[11px] text-ink-3">primary · secondary · inverse · danger — tinggi 44 (utama), 36 (toolbar), 30 (inline)</div>
            </div>

            <div className={cx(PANEL, 'flex flex-col gap-3.5 p-5')}>
              <div className={CAP}>CHIP, SEGMENTED, TOGGLE</div>
              <div className="flex flex-wrap gap-1.5">
                {CHIPS.map(c => <button key={c} onClick={() => setChip(c)} className={cx('cursor-pointer rounded-full border border-line px-3.5 py-[7px] text-[13px] font-bold', chip === c ? 'bg-ink text-bg' : 'bg-surface text-ink-2')}>{c}</button>)}
              </div>
              <div className="flex self-start rounded-[9px] bg-surface-2 p-[3px]">
                {SEGS.map(([v, l]) => <button key={v} onClick={() => setSeg(v)} className={cx(SEG_BTN(seg === v), 'px-3.5')}>{l}</button>)}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex flex-col gap-0.5"><span className="text-sm font-bold">Auto-scroll</span><span className="text-xs text-ink-3">Toggle 40×24, knob 18</span></span>
                <Switch on={tg} onChange={setTg} label="Auto-scroll" />
              </div>
            </div>

            <div className={cx(PANEL, 'flex flex-col gap-3.5 p-5')}>
              <div className={CAP}>INPUT</div>
              <input placeholder="Cari judul, author, atau genre" className="h-11 rounded-btn border border-line bg-bg px-3.5 text-sm text-ink" />
              <input defaultValue="128" className="h-11 rounded-btn border border-danger bg-bg px-3.5 text-sm text-ink" />
              <span className="-mt-2 text-xs font-semibold text-danger">Ch 128 sudah ada. Pakai 129?</span>
            </div>

            <div className={cx(PANEL, 'flex flex-col gap-3.5 p-5')}>
              <div className={CAP}>BADGE DI ATAS COVER</div>
              <div className="flex flex-wrap gap-2 rounded-btn p-3.5" style={{ background: coverBg(250) }}>
                <Badge>Manhwa</Badge><Badge accent>UP</Badge><Badge accent wide>+2</Badge><Badge>★ 4.8</Badge><Badge glass>Ch 128</Badge>
              </div>
            </div>
          </div>

          <div className={cx(PANEL, 'flex flex-col gap-4 p-5')}>
            <div className={CAP}>KARTU KOMIK (cover selalu 3:4, minimal 150px mobile / 190px desktop)</div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[18px] md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
              <div className="flex flex-col gap-2">
                <Cover h={250} label={false}>
                  <span className="absolute left-2 top-2"><Badge>Lokal</Badge></span>
                  <span className="absolute right-2 top-2"><Badge accent>UP</Badge></span>
                </Cover>
                <div className="text-[15px] font-bold">Langit yang Retak</div>
                <div className="flex justify-between rounded-[7px] border border-line bg-bg px-2.5 py-1.5 text-[13px] font-semibold">Ch 128<span className="font-mono text-[11px] font-normal text-accent-text">12 mnt</span></div>
                <div className="font-mono text-[10px] text-ink-3">update</div>
              </div>
              <div className="flex flex-col gap-2">
                <Cover h={20} label={false}>
                  <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-black/0 to-black/75" />
                  <span className="absolute bottom-0.5 left-2.5 text-[72px] font-extrabold leading-none tracking-[-0.06em] text-white">1</span>
                </Cover>
                <div className="text-[15px] font-bold">Pedang Ketujuh</div>
                <div className="text-xs text-ink-3">Aksi · 71,9rb dilihat</div>
                <div className="font-mono text-[10px] text-ink-3">peringkat</div>
              </div>
              <div className="flex flex-col gap-2">
                <Cover h={160} label={false}>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-black/0 to-black/78 px-2.5 pb-2.5 pt-7 text-white">
                    <div className="mb-1.5 font-mono text-[11px]">Ch 44 / 47</div>
                    <div className="h-1 rounded-sm bg-white/25"><div className="h-full w-[94%] rounded-sm bg-white" /></div>
                  </div>
                </Cover>
                <div className="text-[15px] font-bold">Sekolah Malam</div>
                <div className="font-mono text-[10px] text-ink-3">lanjut baca</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex aspect-cover flex-col items-center justify-center gap-1 rounded-card border border-dashed border-line-2 bg-bg font-mono text-[11px] text-ink-3"><span className="font-medium text-ink-2">Bersponsor</span><span>native</span></div>
                <div className="font-mono text-[10px] text-ink-3">native ad, ukuran sama dengan kartu</div>
              </div>
            </div>
          </div>

          <div className={cx(PANEL, 'flex flex-col gap-3.5 p-5')}>
            <div className={CAP}>SLOT IKLAN STANDAR</div>
            <div className="flex flex-wrap items-end gap-3.5">
              {ADS.map(([w, h, use]) => (
                <div key={use} className="flex max-w-full flex-col gap-1.5">
                  <div className="flex max-w-full items-center justify-center rounded-chip border border-dashed border-line-2 bg-bg font-mono text-[10px] text-ink-3" style={{ width: w / 2, height: h / 2 }}>{w}×{h}</div>
                  <span className="text-[11px] text-ink-2">{use}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-ink-3">Ditampilkan pada setengah skala. Slot selalu punya tinggi tetap supaya layout tidak lompat saat iklan dimuat.</div>
          </div>
        </Section>

        <Section
          title="05"
          head={
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className={H2}>05 · Handoff developer (Next.js + Tailwind)</h2>
              <div className="flex rounded-[9px] bg-surface-2 p-[3px]">
                {TABS.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setCopied(false) }} className={cx(SEG_BTN(tab === k), 'px-3')}>{l}</button>)}
              </div>
            </div>
          }
        >
          <div className="relative">
            <pre className="m-0 overflow-x-auto whitespace-pre rounded-[14px] bg-[#0B0B0C] p-5 font-mono text-[12.5px] leading-[1.65] text-[#D7DAE0]">{code[tab]}</pre>
            <button onClick={copy} className="absolute right-3 top-3 h-[30px] cursor-pointer rounded-lg border-0 bg-[#2A2D33] px-3 text-xs font-bold text-white">{copied ? 'Tersalin' : 'Salin'}</button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
            {NOTES.map(n => <div key={n.t} className="rounded-card border border-line bg-surface p-4"><div className="mb-1.5 text-sm font-extrabold">{n.t}</div><div className="text-[13px] leading-[1.55] text-ink-2">{n.b}</div></div>)}
          </div>
        </Section>
      </div>
    </div>
  )
}
