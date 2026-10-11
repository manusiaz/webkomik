'use client'
import { useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react'
import { Cover } from '@/components/ui'
import { TYPES, type ComicType } from '@/lib/comics'
import { ADMIN_GENRES, PARTNERS, UPLOADER_PARTNER, col, type AdminComic, type AdminStatus, type Role } from '../data'
import { Drawer, Field, FilterPill, PickChip, btnPrimary, input, select, textarea } from '../ui'

type Edit = Omit<AdminComic, 'syn'> & { isNew?: boolean; slug: string; slugTouched?: boolean; syn: string; meta: string }

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const STATUS_BG: Record<AdminStatus, string> = { Berjalan: '#2FA67A', Draft: '#6F737B', Tamat: '#3E7BE6', Hiatus: '#3E7BE6' }

function toEdit(c: AdminComic, isNew = false): Edit {
  return {
    ...c, genres: c.genres.slice(), isNew, slug: slugify(c.title),
    syn: isNew ? '' : c.syn?.id ?? `${c.title} adalah ${c.type === 'Lokal' ? 'komik lokal' : c.type.toLowerCase()} bergenre ${c.genre.toLowerCase()}.`,
    meta: `Baca ${c.title} bahasa Indonesia, rilis resmi di nacp.`,
  }
}

export function Titles({ comics, setComics, role, flash, onUpload }: { comics: AdminComic[]; setComics: Dispatch<SetStateAction<AdminComic[]>>; role: Role; flash: (m: string) => void; onUpload: (id: string, ch: number) => void }) {
  const [tq, setTq] = useState('')
  const [tf, setTf] = useState<'Semua' | ComicType>('Semua')
  const [et, setEt] = useState<Edit | null>(null)
  const list = comics.filter(c => (tf === 'Semua' || c.type === tf) && c.title.toLowerCase().includes(tq.toLowerCase()) && (role !== 'Uploader' || c.partner === UPLOADER_PARTNER))
  const patch = (p: Partial<Edit>) => setEt(e => e && { ...e, ...p })

  const save = () => {
    if (!et) return
    const { isNew, slugTouched: _t, slug: _s, meta: _m, syn: _y, ...c } = et
    const next: AdminComic = { ...c, genre: et.genres[0] || et.genre }
    setComics(cs => (isNew ? [{ ...next, id: 'n' + Date.now() }, ...cs] : cs.map(x => (x.id === et.id ? next : x))))
    setEt(null)
    flash('Judul disimpan')
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <input value={tq} onChange={e => setTq(e.target.value)} placeholder="Cari judul" className="h-[38px] w-[220px] max-w-full rounded-[9px] border border-line bg-surface px-3 text-[13px] text-ink" />
        {(['Semua', ...TYPES] as const).map(f => <FilterPill key={f} on={tf === f} onClick={() => setTf(f)}>{f}</FilterPill>)}
        <button onClick={() => setEt(toEdit({ id: 'baru', title: 'Judul baru', type: 'Lokal', genre: 'Fantasi', genres: [], ch: 0, v: 0, r: 0, h: 120, partner: 'Studio Kertas', status: 'Draft' }, true))} className={`${btnPrimary} ml-auto h-[38px] px-4 text-[13px]`}>+ Judul baru</button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-[18px]">
        {list.map(c => (
          <button key={c.id} onClick={() => setEt(toEdit(c))} className="flex min-w-0 cursor-pointer flex-col gap-2 border-0 bg-transparent p-0 text-left text-ink">
            <Cover h={c.h} label={false} className="aspect-cover w-full rounded-card">
              <span className="absolute top-2 left-2 rounded-chip bg-black/55 px-[7px] py-[3px] text-[11px] font-bold text-white">{c.type}</span>
              <span className="absolute top-2 right-2 rounded-chip px-[7px] py-[3px] text-[11px] font-bold text-white" style={{ background: STATUS_BG[c.status] }}>{c.status}</span>
            </Cover>
            <div className="w-full truncate text-sm font-bold">{c.title}</div>
            <div className="text-xs text-ink-3">{c.ch} ch · {c.partner}</div>
          </button>
        ))}
      </div>

      {et && (
        <Drawer
          onClose={() => setEt(null)}
          head={<div className="text-base font-extrabold">{et.isNew ? 'Judul baru' : 'Edit · ' + et.title}</div>}
          foot={<>
            <button onClick={save} className={`${btnPrimary} h-[42px] flex-1 rounded-btn text-sm font-extrabold`}>Simpan</button>
            <button onClick={() => { onUpload(et.id, (et.ch || 0) + 1); setEt(null) }} className="h-[42px] cursor-pointer rounded-btn border border-line bg-surface px-4 text-sm font-bold text-ink">Upload chapter</button>
          </>}
        >
          <div className="flex flex-col gap-4 px-[22px] pt-5 pb-7">
            <div className="grid grid-cols-[140px_1fr] gap-3.5">
              <div className="cover-ph flex aspect-cover items-end rounded-btn p-2 font-mono text-[10px] text-white/70" style={{ '--ph': col(et.h) } as CSSProperties}>ganti cover</div>
              <div className="grid place-items-center rounded-btn border border-dashed border-line-2 p-2 text-center font-mono text-[11px] text-ink-3">banner 1920×600<br />seret ke sini</div>
            </div>
            <Field label="Judul">
              <input value={et.title} onChange={e => patch({ title: e.target.value, ...(et.slugTouched ? {} : { slug: slugify(e.target.value) }) })} className={`${input} bg-surface`} />
            </Field>
            <Field label="Slug">
              <input value={et.slug} onChange={e => patch({ slug: slugify(e.target.value) || e.target.value, slugTouched: true })} className={`${input} bg-surface font-mono text-xs`} />
            </Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Tipe">
                <select value={et.type} onChange={e => patch({ type: e.target.value as ComicType })} className={`${select} bg-surface`}>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
              </Field>
              <Field label="Status">
                <select value={et.status} onChange={e => patch({ status: e.target.value as AdminStatus })} className={`${select} bg-surface`}>{['Berjalan', 'Tamat', 'Hiatus', 'Draft'].map(t => <option key={t}>{t}</option>)}</select>
              </Field>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-ink-2">Genre</div>
              <div className="flex flex-wrap gap-1.5">
                {ADMIN_GENRES.map(g => {
                  const on = et.genres.includes(g)
                  return <PickChip key={g} on={on} onClick={() => patch({ genres: on ? et.genres.filter(x => x !== g) : [...et.genres, g] })}>{g}</PickChip>
                })}
              </div>
            </div>
            <Field label="Sinopsis">
              <textarea rows={4} value={et.syn} onChange={e => patch({ syn: e.target.value })} className={`${textarea} bg-surface leading-normal`} />
            </Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Partner">
                <select value={et.partner} onChange={e => patch({ partner: e.target.value })} className={`${select} bg-surface`}>{PARTNERS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
              </Field>
              <Field label="Jadwal rilis">
                <select className={`${select} bg-surface`}><option>Tiap Jumat 19.00</option><option>Tiap Senin 19.00</option><option>Tidak tetap</option></select>
              </Field>
            </div>
            <Field label="Meta deskripsi (SEO)">
              <textarea rows={2} value={et.meta} onChange={e => patch({ meta: e.target.value })} className={`${textarea} bg-surface`} />
            </Field>
          </div>
        </Drawer>
      )}
    </>
  )
}
