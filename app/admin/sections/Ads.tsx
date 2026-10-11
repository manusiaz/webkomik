'use client'
import { useState } from 'react'
import { compact } from '@/lib/comics'
import { cx } from '@/components/ui'
import { EX_POOL, NETWORKS, NET_OPTS, PAGE_OPTS, SIZE_OPTS, SLOTS, UNIT, UNIT_SHORT, pct2, type Role, type Slot } from '../data'
import { Drawer, Field, Kpi, PickChip, Range, ToggleRow, Track, btnPrimary, input, panel, select } from '../ui'

type Tab = 'slots' | 'nets' | 'rules' | 'stats'
type Rules = { premium: boolean; lazy: boolean; consent: boolean; popunder: boolean; push: boolean; maxPage: number; delay: number; popCap: number; pushDelay: number }
type ToggleKey = 'premium' | 'lazy' | 'consent' | 'popunder' | 'push'
type SliderKey = 'maxPage' | 'delay' | 'popCap' | 'pushDelay'

const SLOT_COLS = 'grid grid-cols-[52px_minmax(200px,1.6fr)_1.2fr_110px_1.3fr_110px_90px_64px] gap-3 border-b border-line px-4'
const STAT_COLS = 'grid grid-cols-[minmax(140px,200px)_1fr_90px_64px_90px] gap-3.5'
const RULE_TOGGLES: [ToggleKey, string, string][] = [
  ['premium', 'Bebas iklan untuk premium', 'Semua slot disembunyikan untuk pelanggan Rp15rb/bln'],
  ['lazy', 'Lazy-load iklan', 'Slot baru dimuat saat mendekati layar, halaman komik tetap cepat'],
  ['consent', 'Banner persetujuan cookie', 'Wajib untuk iklan personal'],
  ['popunder', 'Izinkan popunder', 'Script Monetag/Adsterra, tanpa slot visual'],
  ['push', 'Izinkan push notification ads', 'Ditawarkan setelah N detik'],
]
const RULE_SLIDERS: [SliderKey, string, number, number, (v: number) => string, string][] = [
  ['maxPage', 'Maks slot per halaman', 1, 12, v => String(v), 'Batas atas semua slot yang tampil di satu halaman'],
  ['delay', 'Jeda interstitial', 0, 10, v => v + ' dtk', 'Waktu sebelum tombol lewati aktif'],
  ['popCap', 'Popunder per sesi', 0, 5, v => v + '×', 'Hanya jika popunder aktif'],
  ['pushDelay', 'Tawarkan push setelah', 5, 120, v => v + ' dtk', 'Hanya jika push aktif'],
]
const H = 'text-xs font-extrabold tracking-[0.04em] text-ink-3'

export function Ads({ role, flash }: { role: Role; flash: (m: string) => void }) {
  const canEdit = role === 'Admin'
  const [tab, setTab] = useState<Tab>('slots')
  const [slots, setSlots] = useState<Slot[]>(SLOTS)
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [d, setD] = useState<Slot | null>(null)
  const [rules, setRules] = useState<Rules>({ premium: true, lazy: true, consent: true, popunder: false, push: false, maxPage: 6, delay: 3, popCap: 1, pushDelay: 30 })

  const totalImp = slots.reduce((a, b) => a + (b.on ? b.imp : 0), 0)
  const totalClicks = slots.reduce((a, b) => a + (b.on ? Math.round((b.imp * b.ctr) / 100) : 0), 0)
  const maxImp = Math.max(...slots.map(x => x.imp), 1)
  const kpis = [
    { label: 'Impresi · 7 hari', value: compact(totalImp), delta: '+8,4% vs minggu lalu', deltaColor: '#2FA67A' },
    { label: 'Klik', value: compact(totalClicks), delta: '+3,1%', deltaColor: '#2FA67A' },
    { label: 'CTR rata-rata', value: pct2((totalClicks / Math.max(totalImp, 1)) * 100), delta: '−0,02 poin', deltaColor: '#D9534F' },
    { label: 'Est. pendapatan', value: 'Rp ' + compact(Math.round(totalImp * 9.5)), delta: 'eCPM rata-rata Rp9.500', deltaColor: 'var(--ink-3)' },
  ]

  const open = (i: number, list = slots) => { setEditIdx(i); setD(structuredClone(list[i])) }
  const close = () => { setD(null); setEditIdx(null) }
  const ed = (p: Partial<Slot>) => setD(s => s && { ...s, ...p })
  const newSlot = () => {
    const ns: Slot = { id: 'slot_baru_' + (slots.length + 1), name: 'Slot baru', page: 'Beranda', pos: '', size: '300×250', nets: [['AdSense', 100]], freq: 1, unit: 'load', cap: 10, on: false, imp: 0, ctr: 0, dev: ['Desktop', 'Mobile'], geo: ['Semua'], prem: true, ex: [] }
    const list = [...slots, ns]
    setSlots(list)
    open(list.length - 1, list)
  }
  const weightTotal = d ? d.nets.reduce((a, b) => a + b[1], 0) : 0
  const setNet = (i: number, name?: string, w?: number) => d && ed({ nets: d.nets.map((n, j) => (j === i ? [name ?? n[0], w ?? n[1]] : n)) })
  const toggleChip = (key: 'dev' | 'geo', v: string) => d && ed({ [key]: d[key].includes(v) ? d[key].filter(x => x !== v) : [...d[key], v] })
  const save = () => {
    if (weightTotal !== 100) return flash('Total rotasi harus 100%')
    setSlots(s => s.map((y, j) => (j === editIdx && d ? d : y)))
    close()
    flash('Slot disimpan')
  }

  return (
    <>
      {canEdit && (
        <div className="-mt-2 flex justify-end gap-2">
          <select className="h-[38px] rounded-[9px] border border-line bg-surface px-2.5 text-[13px] text-ink"><option>7 hari terakhir</option><option>Hari ini</option><option>30 hari</option></select>
          <button onClick={newSlot} className={`${btnPrimary} h-[38px] px-4 text-[13px]`}>+ Slot baru</button>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {kpis.map(k => <Kpi key={k.label} {...k} />)}
      </div>

      <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
        {([['slots', 'Slot iklan'], ['nets', 'Jaringan'], ['rules', 'Aturan global'], ['stats', 'Statistik']] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cx('cursor-pointer whitespace-nowrap border-0 bg-transparent px-3.5 py-2.5 text-sm font-semibold', tab === k ? 'text-ink shadow-[inset_0_-2px_0_var(--accent)]' : 'text-ink-3')}>{l}</button>
        ))}
      </div>

      {tab === 'slots' && (
        <>
          <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
            <div className="min-w-[880px]">
              <div className={`${SLOT_COLS} py-2.5 text-[11px] font-bold tracking-[0.02em] text-ink-3`}>
                <span>Aktif</span><span>Slot</span><span>Penempatan</span><span>Ukuran</span><span>Sumber (rotasi)</span><span>Frekuensi</span><span className="text-right">Impresi</span><span className="text-right">CTR</span>
              </div>
              {slots.map((x, i) => (
                <div key={x.id} onClick={() => (canEdit ? open(i) : flash('Hanya Admin yang bisa edit slot'))} className={cx(SLOT_COLS, 'cursor-pointer items-center py-3', editIdx === i && d ? 'bg-accent-soft' : 'bg-transparent')}>
                  <button role="switch" aria-checked={x.on} onClick={e => { e.stopPropagation(); if (canEdit) setSlots(s => s.map((y, j) => (j === i ? { ...y, on: !y.on } : y))) }} className="w-fit cursor-pointer border-0 bg-transparent p-0"><Track on={x.on} sm /></button>
                  <div className="min-w-0"><div className="truncate text-sm font-bold">{x.name}</div><div className="font-mono text-[11px] text-ink-3">{x.id}</div></div>
                  <div className="text-[13px] leading-[1.4] text-ink-2"><b className="font-semibold text-ink">{x.page}</b> · {x.pos}</div>
                  <div className="font-mono text-xs text-ink-2">{x.size}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {x.nets.map(([l, w], j) => <span key={j} className="rounded-chip bg-surface-2 px-2 py-[3px] text-xs font-semibold text-ink-2">{l} <span className="font-mono font-normal text-ink-3">{w}%</span></span>)}
                  </div>
                  <div className="text-xs text-ink-2">{UNIT_SHORT[x.unit].replace('{n}', String(x.freq))}</div>
                  <div className="text-right font-mono text-xs">{x.on ? compact(x.imp) : '—'}</div>
                  <div className="text-right font-mono text-xs text-ink-2">{x.on ? pct2(x.ctr) : '—'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-ink-3">Klik baris untuk edit. Slot nonaktif tidak memuat script sama sekali.</div>
        </>
      )}

      {tab === 'nets' && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-3.5">
          {NETWORKS.map(n => (
            <div key={n.name} className={`${panel} flex flex-col gap-3`}>
              <div className="flex items-center justify-between gap-2"><div className="text-base font-bold">{n.name}</div><span className="font-mono text-[11px] text-ok">● {n.status}</span></div>
              <div className="text-xs text-ink-3">{n.kind}</div>
              <Field label="Publisher / Zone ID" className="text-ink-3!"><input defaultValue={n.pub} className="h-9 rounded-lg border border-line bg-bg px-2.5 font-mono text-xs text-ink" /></Field>
              <Field label="Script global (head)" className="text-ink-3!"><textarea rows={3} defaultValue={n.script} className="resize-y rounded-lg border border-line bg-bg px-2.5 py-2 font-mono text-[11px] text-ink-2" /></Field>
              <div className="font-mono text-[11px] text-ink-3">ads.txt: {n.adstxt}</div>
            </div>
          ))}
          <button className="min-h-[200px] cursor-pointer rounded-[14px] border border-dashed border-line-2 bg-transparent text-sm font-semibold text-ink-2">+ Tambah jaringan (script apa aja)</button>
        </div>
      )}

      {tab === 'rules' && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-3.5">
          <div className="rounded-[14px] border border-line bg-surface px-[18px] py-1.5">
            {RULE_TOGGLES.map(([k, l, sub]) => (
              <ToggleRow key={k} on={rules[k]} onClick={() => canEdit && setRules(r => ({ ...r, [k]: !r[k] }))} label={l} sub={sub} labelClass="text-sm font-semibold" className="border-b border-line py-3.5" />
            ))}
          </div>
          <div className={`${panel} flex flex-col gap-[18px]`}>
            {RULE_SLIDERS.map(([k, l, min, max, f, sub]) => (
              <Range key={k} big label={l} display={f(rules[k])} min={min} max={max} value={rules[k]} onChange={v => canEdit && setRules(r => ({ ...r, [k]: v }))} sub={sub} />
            ))}
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className={`${panel} flex flex-col gap-1 overflow-x-auto`}>
          <div className="min-w-[560px]">
            <div className={`${STAT_COLS} pb-2 text-[11px] font-bold text-ink-3`}><span>Slot</span><span>Impresi (7 hari)</span><span className="text-right">Klik</span><span className="text-right">CTR</span><span className="text-right">Est.</span></div>
            {slots.map(x => (
              <div key={x.id} className={`${STAT_COLS} items-center border-t border-line py-[9px]`}>
                <span className="truncate font-mono text-xs">{x.id}</span>
                <div className="flex items-center gap-2.5"><div className="h-2 rounded-sm bg-accent" style={{ width: Math.round((x.imp / maxImp) * 100) + '%' }} /><span className="font-mono text-[11px] text-ink-3">{compact(x.imp)}</span></div>
                <span className="text-right font-mono text-xs">{compact(Math.round((x.imp * x.ctr) / 100))}</span>
                <span className="text-right font-mono text-xs text-ink-2">{pct2(x.ctr)}</span>
                <span className="text-right font-mono text-xs">Rp {compact(Math.round(x.imp * 9.5))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {d && (
        <Drawer
          onClose={close}
          width="min-[900px]:w-[460px]"
          overlay="bg-black/35"
          head={<div className="min-w-0"><div className="text-base font-bold">Edit slot · {d.name}</div><div className="font-mono text-[11px] text-ink-3">{d.id}</div></div>}
          foot={<>
            <button onClick={save} className={`${btnPrimary} h-[42px] flex-1 rounded-btn text-sm`}>Simpan</button>
            <button onClick={close} className="h-[42px] cursor-pointer rounded-btn border border-line bg-surface px-4 text-sm font-semibold text-ink">Batal</button>
          </>}
        >
          <div className="flex flex-col gap-6 px-[22px] pt-5 pb-7">
            <div className="flex flex-col gap-3">
              <div className={H}>DASAR</div>
              <Field label="Nama slot"><input value={d.name} onChange={e => ed({ name: e.target.value })} className={`${input} bg-surface`} /></Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Halaman"><select value={d.page} onChange={e => ed({ page: e.target.value })} className={`${select} bg-surface`}>{PAGE_OPTS.map(o => <option key={o}>{o}</option>)}</select></Field>
                <Field label="Ukuran"><select value={d.size} onChange={e => ed({ size: e.target.value })} className={`${select} bg-surface`}>{SIZE_OPTS.map(o => <option key={o}>{o}</option>)}</select></Field>
              </div>
              <Field label="Posisi"><input value={d.pos} onChange={e => ed({ pos: e.target.value })} className={`${input} bg-surface`} /></Field>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between"><div className={H}>SUMBER &amp; ROTASI</div><span className="font-mono text-[11px]" style={{ color: weightTotal === 100 ? 'var(--ink-3)' : '#D9534F' }}>total {weightTotal}%</span></div>
              {d.nets.map(([name, w], i) => (
                <div key={i} className="flex flex-col gap-2 rounded-btn border border-line bg-surface p-3">
                  <div className="flex items-center justify-between gap-2">
                    <select value={name} onChange={e => setNet(i, e.target.value)} className="h-8 rounded-[7px] border border-line bg-bg px-2 text-[13px] font-semibold text-ink">{NET_OPTS.map(o => <option key={o}>{o}</option>)}</select>
                    <span className="font-mono text-xs">{w}%</span>
                    <button onClick={() => ed({ nets: d.nets.filter((_, j) => j !== i) })} className="cursor-pointer border-0 bg-transparent text-xs text-ink-3">hapus</button>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={w} onChange={e => setNet(i, undefined, +e.target.value)} className="w-full accent-accent" />
                </div>
              ))}
              <button onClick={() => ed({ nets: [...d.nets, ['Adsterra', 0]] })} className="h-9 cursor-pointer rounded-[9px] border border-dashed border-line-2 bg-transparent text-[13px] font-semibold text-ink-2">+ Tambah sumber</button>
              <Field label="Kode / script slot"><textarea rows={4} placeholder="<script>…</script>" className="resize-y rounded-[9px] border border-line bg-surface px-3 py-2.5 font-mono text-[11px] text-ink-2" /></Field>
              {d.nets.some(n => n[0] === 'Direct') && (
                <div className="flex flex-col gap-2 rounded-btn border border-line bg-surface p-3">
                  <div className="text-xs font-bold text-ink-2">Iklan direct</div>
                  <div className="flex h-[90px] items-center justify-center rounded-lg border border-dashed border-line-2 font-mono text-[11px] text-ink-3">drop banner {d.size} · jpg/png/webp/gif</div>
                  <input placeholder="https://link-tujuan.com" className="h-9 rounded-lg border border-line bg-bg px-2.5 text-[13px] text-ink" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <div className={H}>FREKUENSI</div>
              <Range big label={UNIT[d.unit]} display={d.freq} min={1} max={12} value={d.freq} onChange={v => ed({ freq: v })} />
              <Range big label="Maks per sesi" display={d.cap} min={1} max={30} value={d.cap} onChange={v => ed({ cap: v })} />
            </div>

            <div className="flex flex-col gap-3">
              <div className={H}>TARGET</div>
              {([['dev', 'Device', ['Desktop', 'Mobile', 'Webapp']], ['geo', 'Negara', ['Semua', 'ID', 'MY', 'SG', 'PH']]] as const).map(([key, label, opts]) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="text-xs font-semibold text-ink-2">{label}</div>
                  <div className="flex flex-wrap gap-1.5">{opts.map(o => <PickChip key={o} on={d[key].includes(o)} onClick={() => toggleChip(key, o)}>{o}</PickChip>)}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <div className={H}>JADWAL</div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Mulai"><input type="date" defaultValue="2026-10-10" className="h-[38px] rounded-[9px] border border-line bg-surface px-2.5 text-[13px] text-ink" /></Field>
                <Field label="Selesai"><input type="date" className="h-[38px] rounded-[9px] border border-line bg-surface px-2.5 text-[13px] text-ink" /></Field>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className={`${H} mb-1`}>PENGECUALIAN</div>
              <ToggleRow on={d.prem} onClick={() => ed({ prem: !d.prem })} label="Sembunyikan untuk user premium" sub="Langganan bebas iklan Rp15rb/bln" labelClass="text-sm font-semibold" />
              <div className="mt-2 mb-1.5 text-xs font-semibold text-ink-2">Judul dikecualikan</div>
              <div className="flex flex-wrap gap-1.5">
                {d.ex.map(x => (
                  <button key={x} onClick={() => ed({ ex: d.ex.filter(y => y !== x) })} className="cursor-pointer rounded-[7px] border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink">{x} <span className="text-ink-3">×</span></button>
                ))}
                <button onClick={() => { const nx = EX_POOL.find(x => !d.ex.includes(x)); if (nx) ed({ ex: [...d.ex, nx] }) }} className="cursor-pointer rounded-[7px] border border-dashed border-line-2 bg-transparent px-2.5 py-1.5 text-xs font-semibold text-ink-2">+ judul</button>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </>
  )
}
