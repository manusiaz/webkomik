'use client'
import { useState } from 'react'
import { ACCENTS, SECS } from '../data'
import { Field, ToggleRow, Track, btnPrimary, input, panel, sectionLabel, textarea } from '../ui'

const SEO_TOGGLES = [['sitemap', 'Sitemap otomatis (judul + chapter)'], ['index', 'Izinkan mesin pencari mengindeks'], ['schema', 'Structured data (ComicSeries / Chapter)']] as const
type SeoKey = (typeof SEO_TOGGLES)[number][0]
const arrowBtn = 'size-[26px] flex-none cursor-pointer rounded-chip border border-line bg-surface text-ink-2'

export function Site({ accent, setAccent, flash }: { accent: string; setAccent: (c: string) => void; flash: (m: string) => void }) {
  const [siteName, setSiteName] = useState('nacp')
  const [secs, setSecs] = useState(() => SECS.map(l => ({ l, on: true })))
  const [seoTitle, setSeoTitle] = useState('Baca {judul} Bahasa Indonesia · {situs}')
  const [seo, setSeo] = useState<Record<SeoKey, boolean>>({ sitemap: true, index: true, schema: true })
  const swap = (i: number, j: number) => setSecs(s => {
    if (j < 0 || j >= s.length) return s
    const a = s.slice();
    [a[i], a[j]] = [a[j], a[i]]
    return a
  })

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start gap-4">
      <div className={`${panel} flex flex-col gap-4`}>
        <div className="text-base font-extrabold">Tampilan</div>
        <div className="flex items-center gap-3.5">
          <div className="grid size-16 flex-none place-items-center rounded-[14px] border border-dashed border-line-2 font-mono text-[10px] text-ink-3">logo</div>
          <Field label="Nama situs" className="flex-1"><input value={siteName} onChange={e => setSiteName(e.target.value)} className={`${input} bg-bg`} /></Field>
        </div>
        <div className="flex flex-col gap-2">
          <div className={sectionLabel}>Warna aksen</div>
          <div className="flex flex-wrap items-center gap-2.5">
            {ACCENTS.map(c => (
              <button key={c} aria-label={c} onClick={() => setAccent(c)} className="size-9 cursor-pointer rounded-btn border-[3px]" style={{ background: c, borderColor: accent === c ? 'var(--ink)' : 'transparent' }} />
            ))}
            <span className="ml-2 flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.05em]"><span className="size-[11px] rounded-[3px] bg-accent" />{siteName}</span>
            <span className="rounded-[9px] bg-accent px-3.5 py-[9px] text-[13px] font-extrabold text-white">Bebas iklan</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className={sectionLabel}>Section beranda (urutan & tampil)</div>
          {secs.map((x, i) => (
            <div key={x.l} className="flex items-center gap-2 rounded-[9px] border border-line bg-bg px-2.5 py-2" style={{ opacity: x.on ? 1 : 0.5 }}>
              <span className="w-[18px] font-mono text-[11px] text-ink-3">{i + 1}</span>
              <span className="flex-1 text-[13px] font-bold">{x.l}</span>
              <button aria-label="Naik" onClick={() => swap(i, i - 1)} className={arrowBtn}>↑</button>
              <button aria-label="Turun" onClick={() => swap(i, i + 1)} className={arrowBtn}>↓</button>
              <button role="switch" aria-checked={x.on} onClick={() => setSecs(s => s.map((y, j) => (j === i ? { ...y, on: !y.on } : y)))} className="cursor-pointer border-0 bg-transparent p-0"><Track on={x.on} /></button>
            </div>
          ))}
        </div>
      </div>
      <div className={`${panel} flex flex-col gap-3.5`}>
        <div className="text-base font-extrabold">SEO</div>
        <Field label="Pola judul halaman komik"><input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className={`${input} bg-bg font-mono text-xs`} /></Field>
        <Field label="Meta deskripsi beranda">
          <textarea rows={3} defaultValue="nacp adalah tempat baca komik berlisensi dalam Bahasa Indonesia: manga, manhwa, manhua, dan komik lokal." className={`${textarea} bg-bg`} />
        </Field>
        <Field label="Pola URL">
          <select className="h-10 rounded-[9px] border border-line bg-bg px-2.5 font-mono text-xs text-ink">
            <option>/komik/{'{slug}'}/chapter-{'{n}'}</option><option>/{'{slug}'}/{'{n}'}</option><option>/baca/{'{slug}'}-chapter-{'{n}'}</option>
          </select>
        </Field>
        <div className="flex flex-col gap-[3px] rounded-btn border border-line bg-bg p-3">
          <div className="text-[11px] text-ink-3">Preview hasil pencarian</div>
          <div className="text-base font-semibold text-[#7FA8F2]">{seoTitle.replace('{judul}', 'Langit yang Retak').replace('{situs}', siteName)}</div>
          <div className="font-mono text-[11px] text-ok">nacp.id/komik/langit-yang-retak</div>
          <div className="text-xs text-ink-2">Baca Langit yang Retak bahasa Indonesia, rilis resmi bersama Studio Kertas. Update tiap Jumat.</div>
        </div>
        {SEO_TOGGLES.map(([k, l]) => (
          <ToggleRow key={k} on={seo[k]} onClick={() => setSeo(s => ({ ...s, [k]: !s[k] }))} label={l} labelClass="text-sm font-semibold" className="py-2" />
        ))}
        <button onClick={() => flash('Pengaturan situs disimpan')} className={`${btnPrimary} h-[42px] rounded-btn text-sm font-extrabold`}>Simpan pengaturan</button>
      </div>
    </div>
  )
}
