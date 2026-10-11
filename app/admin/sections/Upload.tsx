'use client'
import Link from 'next/link'
import { useEffect, useRef, useState, type Dispatch, type DragEvent, type SetStateAction } from 'react'
import { cx } from '@/components/ui'
import { routes } from '@/lib/comics'
import { UPLOADER_PARTNER, UPLOADS, UPLOAD_ST, col, type AdminComic, type Role, type UploadRow } from '../data'
import { Field, Range, Seg, ToggleRow, btnPrimary, input, panel, sectionLabel, textarea } from '../ui'

export type UploadTarget = { id: string; ch: number; n: number }
type Page = { key: string; name: string; kb: number; url: string; h: number; pct: number; sig: string; lowres: number }
type BatchItem = { n: number; file: string; pages: number; pct: number; when: string }
type Opt = 'split' | 'trim' | 'wm' | 'dup' | 'extra' | 'sens' | 'early' | 'push' | 'tg' | 'dc'
type Src = 'img' | 'zip' | 'folder'

const SRC_COPY: Record<Src, [string, string, string, string]> = {
  img: ['Seret gambar chapter ke sini', 'JPG, PNG, WEBP · bisa banyak sekaligus · maks 20 MB per file', 'Pilih gambar', 'image/*'],
  zip: ['Seret file ZIP / CBZ ke sini', 'Satu arsip per chapter, isi diurutkan otomatis', 'Pilih ZIP/CBZ', '.zip,.cbz'],
  folder: ['Seret folder chapter ke sini', 'Semua gambar di dalam folder diambil berurutan', 'Pilih folder', 'image/*'],
}
const BATCH_DATES = ['Jum 17 Okt', 'Jum 24 Okt', 'Jum 31 Okt', 'Jum 7 Nov', 'Jum 14 Nov', 'Jum 21 Nov']
const stripes = (c: string, s = 8) => `repeating-linear-gradient(135deg,rgba(255,255,255,0.035) 0 ${s}px,transparent ${s}px ${s * 2}px),${c}`
const sizeOf = (kb: number) => (kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB')
const mb = (kb: number) => (kb / 1024).toFixed(1).replace('.', ',')

export function Upload({ comics, setComics, role, flash, target }: { comics: AdminComic[]; setComics: Dispatch<SetStateAction<AdminComic[]>>; role: Role; flash: (m: string) => void; target: UploadTarget }) {
  const [upTitle, setUpTitle] = useState(target.id)
  const [upCh, setUpCh] = useState(String(target.ch))
  const [lastTarget, setLastTarget] = useState(target.n)
  if (lastTarget !== target.n) {
    setLastTarget(target.n)
    setUpTitle(target.id)
    setUpCh(String(target.ch))
  }
  const [upName, setUpName] = useState('')
  const [upVol, setUpVol] = useState('')
  const [upNote, setUpNote] = useState('')
  const [pages, setPages] = useState<Page[]>([])
  const [batch, setBatch] = useState(false)
  const [batchList, setBatchList] = useState<BatchItem[]>([])
  const [src, setSrc] = useState<Src>('img')
  const [dragging, setDragging] = useState(false)
  const [view, setView] = useState<'grid' | 'strip'>('grid')
  const [pv, setPv] = useState<number | null>(null)
  const [thumb, setThumb] = useState(0)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [splitH, setSplitH] = useState(2000)
  const [upQ, setUpQ] = useState(85)
  const [maxW, setMaxW] = useState('1600')
  const [upFormat, setUpFormat] = useState<'webp' | 'avif'>('webp')
  const [o, setO] = useState<Record<Opt, boolean>>({ split: true, trim: true, wm: false, dup: true, extra: false, sens: false, early: true, push: true, tg: true, dc: false })
  const [earlyDays, setEarlyDays] = useState(3)
  const [adMode, setAdMode] = useState<'default' | 'custom' | 'off'>('default')
  const [adEvery, setAdEvery] = useState(4)
  const [pubMode, setPubMode] = useState<'draft' | 'now' | 'schedule'>('schedule')
  const [uploads, setUploads] = useState<UploadRow[]>(UPLOADS)
  const urls = useRef<string[]>([])

  const up = comics.find(c => c.id === upTitle) ?? comics[0]
  const T = (k: Opt) => ({ on: o[k], onClick: () => setO(s => ({ ...s, [k]: !s[k] })) })

  const busy = pages.some(p => p.pct < 100) || batchList.some(b => b.pct < 100)
  useEffect(() => {
    if (!busy) return
    const iv = setInterval(() => {
      setPages(ps => (ps.some(p => p.pct < 100) ? ps.map(p => (p.pct < 100 ? { ...p, pct: Math.min(100, p.pct + 7 + Math.random() * 12) } : p)) : ps))
      setBatchList(bs => (bs.some(b => b.pct < 100) ? bs.map(b => (b.pct < 100 ? { ...b, pct: Math.min(100, b.pct + 3 + Math.random() * 5) } : b)) : bs))
    }, 120)
    return () => clearInterval(iv)
  }, [busy])
  useEffect(() => () => urls.current.forEach(u => URL.revokeObjectURL(u)), [])

  const objectUrl = (f: File) => {
    const u = URL.createObjectURL(f)
    urls.current.push(u)
    return u
  }
  const addFiles = (files: FileList | null) => {
    const arr = Array.from(files ?? []).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    setPages(ps => [...ps, ...arr.map((f, i) => ({ key: 'f' + Date.now() + i, name: f.name, kb: Math.round(f.size / 1024), url: objectUrl(f), h: ((ps.length + i) * 23) % 360, pct: 0, sig: f.name + f.size, lowres: 0 }))])
  }
  const addDemo = () => {
    setBatch(false)
    setPages(ps => [...ps, ...Array.from({ length: 14 }, (_, i) => ({
      key: 'd' + Date.now() + i, name: String(ps.length + i + 1).padStart(3, '0') + '.jpg', kb: i === 6 ? 2300 : 380 + ((i * 37) % 260), url: '',
      h: (up.h + i * 9) % 360, pct: 0, sig: (i === 11 ? 'sig10' : 'sig' + i) + '_' + ps.length, lowres: i === 3 ? 640 : 0,
    }))])
  }

  const sigs: Record<string, number> = {}
  pages.forEach(p => { sigs[p.sig] = (sigs[p.sig] || 0) + 1 })
  const warnOf = (p: Page) => !o.dup ? '' : p.lowres ? 'Resolusi rendah · ' + p.lowres + 'px' : sigs[p.sig] > 1 ? 'Kemungkinan duplikat' : p.kb > 1800 ? 'File besar · ' + (p.kb / 1024).toFixed(1) + ' MB' : ''
  const done = pages.filter(p => p.pct >= 100).length
  const warns = pages.filter(p => warnOf(p)).length
  const totalKb = pages.reduce((a, p) => a + p.kb, 0)
  const ratio = (upFormat === 'avif' ? 0.28 : 0.38) * (upQ / 85)

  const n = +upCh
  const taken = !isNaN(n) && n <= up.ch
  const chCheck = !upCh || isNaN(n) ? { label: 'Isi nomor chapter', color: '#D9534F', border: '#D9534F' }
    : taken ? { label: `Ch ${n} sudah ada. Pakai ${up.ch + 1}?`, color: '#D9534F', border: '#D9534F' }
    : n > up.ch + 1 ? { label: 'Lompat dari Ch ' + up.ch, color: '#F2A93B', border: 'var(--line)' }
    : { label: 'Nomor tersedia', color: '#2FA67A', border: 'var(--line)' }
  const okNum = !!upCh && !isNaN(n) && !taken
  const allDone = pages.length > 0 && done === pages.length
  const batchOk = batch && batchList.length > 0 && batchList.every(b => b.pct >= 100)
  const checklist: [string, boolean][] = batch
    ? [['File chapter ditambahkan', batchList.length > 0], ['Semua file selesai diproses', batchOk], ['Kredit partner: ' + up.partner, true]]
    : [['Nomor chapter valid', okNum], ['Semua gambar terunggah', allDone], ['Tidak ada peringatan gambar', pages.length > 0 && warns === 0], ['Thumbnail chapter dipilih', pages.length > 0], ['Kredit partner: ' + up.partner, true]]
  const ready = batch ? batchOk : okNum && allDone
  const pubLabel = batch ? `Jadwalkan ${batchList.length || ''} chapter` : pubMode === 'now' ? 'Publikasikan sekarang' : pubMode === 'draft' ? 'Simpan sebagai draft' : 'Jadwalkan chapter'
  const [dropTitle, dropSub, pickLabel, accept] = SRC_COPY[src]
  const titleOpts = comics.filter(c => role !== 'Uploader' || c.partner === UPLOADER_PARTNER)

  const publish = () => {
    if (!ready) return flash('Selesaikan dulu daftar cek')
    if (batch) {
      setUploads(us => [...batchList.map(b => ({ id: up.id, ch: b.n, by: 'Rina', st: 'Terjadwal' as const, when: b.when })), ...us])
      setBatchList([])
      return flash('Chapter batch dijadwalkan')
    }
    const st = pubMode === 'now' ? 'Tayang' : pubMode === 'draft' ? 'Draft' : 'Terjadwal'
    const stamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setUploads(us => [{ id: up.id, ch: n, by: 'Rina', st, when: st === 'Terjadwal' ? 'Jum 17 Okt 19.00' : 'hari ini ' + stamp }, ...us])
    if (st === 'Tayang') setComics(cs => cs.map(c => (c.id === up.id ? { ...c, ch: n } : c)))
    setPages([]); setThumb(0); setUpCh(String(n + 1)); setUpName(''); setUpNote('')
    flash(st === 'Tayang' ? `Chapter ${upCh} tayang` : st === 'Draft' ? 'Draft disimpan' : `Chapter ${upCh} dijadwalkan Jumat 19.00`)
  }

  const onDropOn = (e: DragEvent, i: number) => {
    e.preventDefault(); e.stopPropagation()
    if (dragIdx == null || dragIdx === i) return setDragIdx(null)
    setPages(ps => { const a = ps.slice(); const [m] = a.splice(dragIdx, 1); a.splice(i, 0, m); return a })
    setDragIdx(null)
  }
  const pvP = pv != null ? pages[pv] : undefined

  return (
    <>
      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className={`${panel} flex flex-wrap items-stretch gap-[18px]`}>
            <div className="relative aspect-cover w-[120px] flex-none overflow-hidden rounded-btn" style={{ background: stripes(col(up.h)) }}>
              <span className="absolute top-[7px] left-[7px] rounded-[5px] bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">{up.type}</span>
            </div>
            <div className="flex min-w-[220px] flex-1 flex-col gap-2.5">
              <Field label="Judul">
                <select value={up.id} onChange={e => { const c = comics.find(x => x.id === e.target.value)!; setUpTitle(c.id); setUpCh(String(c.ch + 1)) }} className="h-10 rounded-[9px] border border-line bg-bg px-3 text-sm font-bold text-ink">
                  {titleOpts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
              <div className="flex flex-wrap gap-[18px] text-xs text-ink-3">
                <span>Chapter terakhir <b className="text-ink">Ch {up.ch}</b> · 3 Okt 2026</span>
                <span>Jadwal <b className="text-ink">{up.status === 'Berjalan' ? 'Tiap Jumat 19.00' : up.status}</b></span>
                <span>Partner <b className="text-ink">{up.partner}</b></span>
              </div>
              <Seg className="self-start" value={batch ? 'b' : 's'} onChange={v => { setBatch(v === 'b'); setSrc(v === 'b' ? 'zip' : 'img') }} options={[['s', 'Satu chapter'], ['b', 'Batch (banyak chapter)']]} />
            </div>
          </div>

          {!batch ? (
            <div className={`${panel} flex flex-col gap-3.5`}>
              <div className="text-[15px] font-extrabold">Info chapter</div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                <Field label="Nomor chapter">
                  <input value={upCh} onChange={e => setUpCh(e.target.value)} inputMode="numeric" className={`${input} bg-bg`} style={{ borderColor: chCheck.border }} />
                  <span className="text-[11px] font-semibold" style={{ color: chCheck.color }}>{chCheck.label}</span>
                </Field>
                <Field label="Season / volume"><input value={upVol} onChange={e => setUpVol(e.target.value)} placeholder="opsional" className={`${input} bg-bg`} /></Field>
                <Field label="Judul chapter" className="md:col-span-2"><input value={upName} onChange={e => setUpName(e.target.value)} placeholder="mis. Retakan baru" className={`${input} bg-bg`} /></Field>
              </div>
              <Field label="Catatan untuk pembaca">
                <textarea rows={2} value={upNote} onChange={e => setUpNote(e.target.value)} placeholder="Tampil di akhir chapter, mis. ucapan terima kasih atau info jeda rilis" className={`${textarea} bg-bg`} />
              </Field>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 border-t border-line">
                <ToggleRow {...T('extra')} label="Chapter spesial / extra" sub="Ditandai “Extra”, tidak menggeser nomor" />
                <ToggleRow {...T('sens')} label="Konten sensitif" sub="Pembaca lihat peringatan sebelum membuka" />
              </div>
            </div>
          ) : (
            <div className={`${panel} flex flex-col gap-3`}>
              <div className="flex flex-col gap-0.5">
                <div className="text-[15px] font-extrabold">Batch upload</div>
                <div className="text-xs text-ink-3">Upload ZIP/CBZ atau folder per chapter, nomor dideteksi dari nama file</div>
              </div>
              {batchList.length > 0 && (
                <div className="overflow-x-auto"><div className="flex min-w-[560px] flex-col gap-3">
                  {batchList.map(b => (
                    <div key={b.n} className="grid grid-cols-[90px_minmax(0,1fr)_90px_120px_120px] items-center gap-3 rounded-btn border border-line bg-bg px-3 py-2.5">
                      <span className="text-sm font-extrabold">Ch {b.n}</span>
                      <span className="truncate font-mono text-xs text-ink-2">{b.file}</span>
                      <span className="text-xs text-ink-3">{b.pages} hal.</span>
                      <div className="h-1.5 overflow-hidden rounded-[3px] bg-surface-2"><div className="h-full bg-accent" style={{ width: b.pct + '%' }} /></div>
                      <span className="text-xs font-bold" style={{ color: b.pct >= 100 ? '#2FA67A' : 'var(--ink-3)' }}>{b.when}</span>
                    </div>
                  ))}
                </div></div>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setBatchList(bl => {
                    const start = up.ch + 1 + bl.length
                    return [...bl, ...[0, 1, 2].map(k => ({ n: start + k, file: up.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_ch' + (start + k) + '.cbz', pages: 14 + ((start + k) * 3) % 9, pct: 0, when: BATCH_DATES[(bl.length + k) % 6] }))]
                  })}
                  className="h-9 cursor-pointer rounded-[9px] border border-dashed border-line-2 bg-transparent px-3.5 text-[13px] font-bold text-ink-2"
                >+ Tambah ZIP contoh</button>
                <span className="self-center text-xs text-ink-3">Jadwal otomatis berurutan mengikuti jadwal rilis judul ({up.status === 'Berjalan' ? 'Tiap Jumat 19.00' : up.status})</span>
              </div>
            </div>
          )}

          <div className={`${panel} flex flex-col gap-3.5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="text-[15px] font-extrabold">Gambar</div>
                <div className="text-xs text-ink-3">Urutan halaman ikut nama file (001.jpg, 002.jpg …), bisa diubah dengan drag</div>
              </div>
              <Seg value={src} onChange={setSrc} btn="h-[30px] px-3" options={[['img', 'Gambar'], ['zip', 'ZIP / CBZ'], ['folder', 'Folder']]} />
            </div>
            <div
              onDragOver={e => { e.preventDefault(); if (!dragging) setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); if (batch) return flash('Mode batch: gunakan ZIP contoh'); addFiles(e.dataTransfer.files) }}
              className={cx('flex flex-col items-center gap-2.5 rounded-card border-2 border-dashed p-[26px] text-center', dragging ? 'border-accent bg-accent-soft' : 'border-line-2 bg-bg')}
            >
              <div className="text-base font-extrabold">{dropTitle}</div>
              <div className="text-xs text-ink-3">{dropSub}</div>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <label className="flex h-[38px] cursor-pointer items-center rounded-[9px] bg-accent px-4 text-[13px] font-bold text-white">
                  {pickLabel}
                  <input
                    type="file" multiple accept={accept} className="hidden"
                    {...(src === 'folder' ? { webkitdirectory: '' } : {})}
                    onChange={e => { if (batch) flash('ZIP diterima, sedang diekstrak'); else addFiles(e.target.files); e.target.value = '' }}
                  />
                </label>
                <button onClick={addDemo} className="h-[38px] cursor-pointer rounded-[9px] border border-line bg-surface px-3.5 text-[13px] font-semibold text-ink-2">Pakai 14 gambar contoh</button>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 gap-y-1 border-y border-line py-1">
              <ToggleRow {...T('split')} label="Auto-split gambar panjang" sub="Potong strip webtoon jadi halaman" />
              <ToggleRow {...T('trim')} label="Trim tepi kosong" sub="Buang margin putih/hitam" />
              <ToggleRow {...T('wm')} label="Watermark partner" sub="Logo kecil di pojok bawah halaman terakhir" />
              <ToggleRow {...T('dup')} label="Deteksi duplikat & resolusi" sub="Tandai halaman bermasalah" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
              {o.split && <Range label="Tinggi potong" display={splitH + 'px'} min={1200} max={3200} step={100} value={splitH} onChange={setSplitH} />}
              <Range label="Kualitas" display={upQ} min={50} max={100} step={5} value={upQ} onChange={setUpQ} />
              <Field label="Lebar maks">
                <select value={maxW} onChange={e => setMaxW(e.target.value)} className="h-9 rounded-[9px] border border-line bg-bg px-3 text-[13px] text-ink">
                  {[['800', '800px'], ['1200', '1200px'], ['1600', '1600px (HD)'], ['2000', '2000px']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <div className="flex flex-col gap-1.5">
                <div className={sectionLabel}>Format</div>
                <Seg value={upFormat} onChange={setUpFormat} full btn="h-[30px]" options={[['webp', 'WebP'], ['avif', 'AVIF']]} />
              </div>
            </div>

            {pages.length > 0 && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-btn border border-line bg-bg px-3 py-2.5">
                  <div className="flex flex-wrap gap-[18px] text-xs text-ink-3">
                    <span><b className="text-sm text-ink">{pages.length}</b> halaman</span>
                    <span><b className="text-sm text-ink">{done}</b> terunggah</span>
                    <span>{mb(totalKb)} MB → ±{mb(totalKb * ratio)} MB setelah kompresi</span>
                    <span className="font-bold" style={{ color: warns ? '#F2A93B' : '#2FA67A' }}>{warns ? warns + ' peringatan' : 'Tanpa peringatan'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Seg value={view} onChange={setView} radius="rounded-lg" btn="h-7 px-2.5 rounded-md!" options={[['grid', 'Grid'], ['strip', 'Preview baca']]} />
                    <button onClick={() => setPages(ps => ps.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })))} className="cursor-pointer border-0 bg-transparent p-0 text-xs font-bold text-accent-text">Urutkan nama</button>
                    <button onClick={() => { setPages([]); setThumb(0) }} className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-ink-3">Hapus semua</button>
                  </div>
                </div>
                {view === 'grid' ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3.5">
                    {pages.map((p, i) => {
                      const w = warnOf(p), uploading = p.pct < 100
                      return (
                        <div
                          key={p.key} draggable
                          onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragIdx(i) }}
                          onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                          onDrop={e => onDropOn(e, i)}
                          onDragEnd={() => setDragIdx(null)}
                          className="flex min-w-0 cursor-grab flex-col gap-1.5"
                          style={{ opacity: dragIdx === i ? 0.4 : 1 }}
                        >
                          <div onClick={() => setPv(i)} className="relative aspect-[2/3] overflow-hidden rounded-btn border-2" style={{ background: stripes(col(p.h)), borderColor: dragIdx === i ? 'var(--accent)' : w && !uploading ? '#F2A93B' : 'transparent' }}>
                            {p.url && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${p.url}")` }} />}
                            <span className="absolute top-1.5 left-1.5 rounded-[5px] bg-black/65 px-[7px] py-0.5 font-mono text-[11px] text-white">{i + 1}</span>
                            {i === thumb && <span className="absolute top-1.5 right-1.5 rounded-[5px] bg-accent px-[7px] py-0.5 text-[10px] font-extrabold text-white">THUMB</span>}
                            {w && !uploading && <span className="absolute inset-x-1.5 bottom-[30px] rounded-[5px] bg-warn px-1.5 py-1 text-center text-[10px] font-extrabold text-[#16171A]">{w}</span>}
                            {uploading && <>
                              <div className="absolute inset-0 grid place-items-center bg-black/45 font-mono text-xs text-white">{Math.round(p.pct)}%</div>
                              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40"><div className="h-full bg-accent" style={{ width: p.pct + '%' }} /></div>
                            </>}
                          </div>
                          <div className="flex justify-between gap-1.5 font-mono text-[10px] text-ink-3"><span className="truncate">{p.name}</span><span className="flex-none">{sizeOf(p.kb)}</span></div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex max-h-[720px] flex-col items-center overflow-y-auto rounded-card bg-[#0B0B0C] py-4">
                    {pages.map((p, i) => (
                      <div key={p.key} onClick={() => setPv(i)} className="relative aspect-[2/3] w-[min(100%,420px)] flex-none cursor-pointer" style={{ background: stripes(col(p.h), 10) }}>
                        {p.url && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${p.url}")` }} />}
                        <span className="absolute top-2 right-2 rounded-[5px] bg-black/65 px-[7px] py-0.5 font-mono text-[11px] text-white">{i + 1} / {pages.length}</span>
                      </div>
                    ))}
                    <div className="p-[18px] text-center text-xs text-[#A4A8B0]">{upNote || `Akhir Chapter ${upCh} · ${up.partner}`}</div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={`${panel} flex flex-col gap-3`}>
            <div className="text-[15px] font-extrabold">Monetisasi & akses</div>
            <div className="border-t border-line"><ToggleRow {...T('early')} label="Early access premium" sub="Pelanggan premium baca lebih dulu" /></div>
            {o.early && <Range label="Lebih awal" display={earlyDays + ' hari'} min={1} max={7} value={earlyDays} onChange={setEarlyDays} />}
            <div className="flex flex-col gap-1.5">
              <div className={sectionLabel}>Iklan di chapter ini</div>
              <Seg value={adMode} onChange={setAdMode} full btn="h-8" options={[['default', 'Ikut default'], ['custom', 'Custom'], ['off', 'Matikan']]} />
            </div>
            {adMode === 'custom' && <Range label="Iklan tiap" display={adEvery + ' gambar'} min={2} max={12} value={adEvery} onChange={setAdEvery} />}
          </div>

          <div className={`${panel} flex flex-col`}>
            <div className="text-[15px] font-extrabold">Riwayat upload</div>
            <div className="mt-2.5 overflow-x-auto"><div className="min-w-[620px]">
              {uploads.map((u, i) => {
                const c = comics.find(x => x.id === u.id) ?? comics[0]
                const [bg, fg, action] = UPLOAD_ST[u.st]
                return (
                  <div key={i} className="grid grid-cols-[40px_minmax(0,1.6fr)_80px_110px_120px_80px] items-center gap-3 border-t border-line py-2.5">
                    <div className="aspect-cover rounded-[5px]" style={{ background: col(c.h) }} />
                    <div className="min-w-0"><div className="truncate text-[13px] font-bold">{c.title}</div><div className="text-xs text-ink-3">{u.by}</div></div>
                    <span className="text-[13px] font-bold">Ch {u.ch}</span>
                    <span className="justify-self-start rounded-chip px-2 py-[3px] text-[11px] font-extrabold" style={{ background: bg, color: fg }}>{u.st}</span>
                    <span className="font-mono text-[11px] text-ink-3">{u.when}</span>
                    <Link href={routes.read(u.id, u.ch)} className="text-xs font-bold">{action}</Link>
                  </div>
                )
              })}
            </div></div>
          </div>
        </div>

        <div className={`${panel} sticky top-5 flex flex-col gap-4`}>
          <div className="text-[15px] font-extrabold">Publikasi</div>
          <Seg value={pubMode} onChange={setPubMode} full btn="h-8" options={[['draft', 'Draft'], ['now', 'Sekarang'], ['schedule', 'Jadwalkan']]} />
          {pubMode === 'schedule' && (
            <Field label="Tayang pada">
              <input type="datetime-local" defaultValue="2026-10-17T19:00" className={`${input} bg-bg text-[13px]`} />
              <span className="text-[11px] text-ink-3">Slot jadwal berikutnya: Jumat 17 Okt, 19.00 WIB</span>
            </Field>
          )}
          <div className="flex flex-col border-t border-line">
            <div className={`${sectionLabel} pt-3`}>Kirim notifikasi</div>
            <ToggleRow {...T('push')} label="Push ke pembaca yang bookmark" sub={`${Math.round(up.v * 0.42).toLocaleString('id-ID')} pembaca`} />
            <ToggleRow {...T('tg')} label="Channel Telegram" />
            <ToggleRow {...T('dc')} label="Server Discord" />
          </div>
          <div className="flex flex-col gap-2 border-t border-line pt-3">
            <div className={sectionLabel}>Cek sebelum publikasi</div>
            {checklist.map(([label, ok]) => (
              <div key={label} className={cx('flex items-center gap-2.5 text-[13px]', ok ? 'text-ink' : 'text-ink-3')}>
                <span className={cx('grid size-[18px] flex-none place-items-center rounded-full text-[11px] font-extrabold text-white', ok ? 'bg-ok' : 'bg-line-2')}>{ok ? '✓' : '!'}</span>{label}
              </div>
            ))}
          </div>
          <button onClick={publish} className={cx('h-[46px] cursor-pointer rounded-btn border-0 text-sm font-extrabold text-white', ready ? 'bg-accent' : 'bg-line-2')}>{pubLabel}</button>
          <button onClick={() => flash('Draft disimpan')} className="h-10 cursor-pointer rounded-btn border border-line bg-bg text-[13px] font-bold text-ink">Simpan draft</button>
        </div>
      </div>

      {pvP && pv != null && (
        <>
          <div onClick={() => setPv(null)} className="fixed inset-0 z-70 bg-black/85" />
          <div className="pointer-events-none fixed inset-6 z-71 flex items-center justify-center gap-5">
            <button onClick={() => setPv(Math.max(0, pv - 1))} className="pointer-events-auto size-11 flex-none cursor-pointer rounded-full border-0 bg-white/14 text-xl text-white">‹</button>
            <div className="pointer-events-auto relative aspect-[2/3] h-full max-h-[860px] max-w-full overflow-hidden rounded-lg" style={{ background: stripes(col(pvP.h), 12) }}>
              {pvP.url && <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${pvP.url}")` }} />}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-black/70 to-transparent p-3 font-mono text-xs text-white">
                <span>{pv + 1} / {pages.length} · {pvP.name}</span>
                <button onClick={() => setPv(null)} className="size-[30px] cursor-pointer rounded-lg border-0 bg-white/16 text-white">×</button>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-linear-to-t from-black/75 to-transparent p-3">
                <button onClick={() => { setThumb(pv); flash('Thumbnail chapter diganti') }} className={`${btnPrimary} h-[34px] rounded-lg px-3 text-xs`}>Jadikan thumbnail</button>
                <label className="flex h-[34px] cursor-pointer items-center rounded-lg bg-white/16 px-3 text-xs font-bold text-white">
                  Ganti gambar
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const url = objectUrl(f)
                    setPages(ps => ps.map((p, j) => (j === pv ? { ...p, url, name: f.name, kb: Math.round(f.size / 1024), lowres: 0, sig: 'r' + Date.now(), pct: 0 } : p)))
                    e.target.value = ''
                  }} />
                </label>
                <button onClick={() => {
                  const a = pages.filter((_, j) => j !== pv)
                  setPages(a)
                  setPv(a.length ? Math.min(pv, a.length - 1) : null)
                  if (thumb >= a.length) setThumb(0)
                }} className="h-[34px] cursor-pointer rounded-lg border-0 bg-danger px-3 text-xs font-bold text-white">Hapus</button>
              </div>
            </div>
            <button onClick={() => setPv(Math.min(pages.length - 1, pv + 1))} className="pointer-events-auto size-11 flex-none cursor-pointer rounded-full border-0 bg-white/14 text-xl text-white">›</button>
          </div>
        </>
      )}
    </>
  )
}
