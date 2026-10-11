'use client'
import { useState, type ChangeEvent } from 'react'
import { cx } from '@/components/ui'

const EMPTY = { name: '', email: '', work: '', org: '', urls: '', note: '' }
type F = typeof EMPTY
const ROLES = ['Pemegang hak', 'Kuasa / agen', 'Pembaca (laporkan situs bajakan)']
const LABEL = 'flex flex-col gap-[5px] text-xs font-semibold text-ink-2'
const INPUT = 'border bg-bg text-ink rounded-[9px]'

export function ReportForm() {
  const [role, setRole] = useState(0)
  const [f, setF] = useState<F>(EMPTY)
  const [file, setFile] = useState('')
  const [agree, setAgree] = useState(false)
  const [tried, setTried] = useState(false)
  const [ticket, setTicket] = useState('')

  const set = (k: keyof F) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  const emailOk = /.+@.+\..+/.test(f.email)
  const urlOk = /nacp\.id|http/.test(f.urls)
  const border = (ok: boolean) => (tried && !ok ? 'border-danger' : 'border-line')
  const err = !tried ? '' : !f.name.trim() ? 'Isi nama lengkap' : !emailOk ? 'Email belum valid' : !f.work.trim() ? 'Isi judul karya asli' : !urlOk ? 'Cantumkan minimal satu URL konten' : !agree ? 'Centang pernyataan itikad baik' : ''

  const submit = () => {
    if (!(f.name.trim() && emailOk && f.work.trim() && urlOk && agree)) return setTried(true)
    setTried(false)
    setTicket('HC-' + String(Date.now()).slice(-6))
  }
  const reset = () => { setTicket(''); setF(EMPTY); setFile(''); setAgree(false) }

  if (ticket) return (
    <div className="flex flex-col gap-2 rounded-panel border border-accent bg-accent-soft p-6">
      <div className="text-lg font-extrabold">Laporan diterima</div>
      <div className="text-sm leading-[1.6] text-ink-2">Nomor tiket <b className="font-mono text-ink">{ticket}</b>. Konfirmasi dikirim ke {f.email}. Tim kami meninjau dalam 2 hari kerja; konten yang terbukti melanggar diturunkan paling lambat 24 jam setelah verifikasi.</div>
      <button onClick={reset} className="mt-1.5 h-[38px] cursor-pointer self-start rounded-[9px] border border-line bg-surface px-3.5 text-[13px] font-bold text-ink">Kirim laporan lain</button>
    </div>
  )

  const fields: [keyof F, string, string, boolean][] = [
    ['name', 'Nama lengkap', '', !!f.name.trim()],
    ['email', 'Email', 'nama@perusahaan.com', emailOk],
    ['work', 'Judul karya asli', 'mis. Langit yang Retak', !!f.work.trim()],
    ['org', role === 1 ? 'Mewakili (pemegang hak)' : 'Perusahaan / studio (opsional)', '', true],
  ]

  return (
    <form noValidate onSubmit={e => { e.preventDefault(); submit() }} className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-[22px]">
      <div className="text-[17px] font-extrabold">Formulir laporan</div>
      <div className="flex flex-col gap-1.5">
        <div className="text-xs font-bold text-ink-2">Kamu melapor sebagai</div>
        <div className="flex flex-wrap self-start rounded-[9px] bg-surface-2 p-[3px]">
          {ROLES.map((l, i) => <button type="button" key={l} onClick={() => setRole(i)} className={cx('h-8 cursor-pointer rounded-[7px] border-0 px-3 text-xs font-bold', role === i ? 'bg-bg text-ink' : 'bg-transparent text-ink-3')}>{l}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        {fields.map(([k, label, ph, ok]) => (
          <label key={k} className={LABEL}>{label}<input type={k === 'email' ? 'email' : 'text'} value={f[k]} onChange={set(k)} placeholder={ph} className={cx(INPUT, 'h-[42px] px-3 text-sm', border(ok))} /></label>
        ))}
      </div>
      <label className={LABEL}>URL konten di nacp (satu per baris)<textarea rows={3} value={f.urls} onChange={set('urls')} placeholder="https://nacp.id/komik/judul/chapter-12" className={cx(INPUT, 'resize-y px-3 py-2.5 font-mono text-xs', border(urlOk))} /></label>
      <label className={cx(LABEL, 'cursor-pointer')}>Bukti kepemilikan hak
        <span className="flex items-center gap-2.5 rounded-btn border border-dashed border-line-2 bg-bg p-3.5 font-medium text-ink-3">
          <span className="min-w-0 truncate">{file || 'PDF/JPG sertifikat, kontrak lisensi, atau surat kuasa'}</span>
          <span className="ml-auto flex h-8 flex-none items-center rounded-lg bg-surface-2 px-3 font-bold text-ink">Pilih file</span>
        </span>
        <input type="file" accept=".pdf,image/*" onChange={e => { const x = e.target.files?.[0]; if (x) setFile(x.name) }} className="hidden" />
      </label>
      <label className={LABEL}>Keterangan<textarea rows={3} value={f.note} onChange={set('note')} placeholder="Jelaskan karya asli dan bagian yang dilanggar" className={cx(INPUT, 'resize-y border-line px-3 py-2.5 text-[13px]')} /></label>
      <button type="button" role="checkbox" aria-checked={agree} onClick={() => setAgree(!agree)} className="flex cursor-pointer items-start gap-3 border-0 bg-transparent p-0 text-left text-[13px] leading-[1.55] text-ink-2">
        <span className={cx('grid size-5 flex-none place-items-center rounded-chip border-2 text-xs font-extrabold text-white', agree ? 'border-accent bg-accent' : tried ? 'border-danger' : 'border-line-2')}>{agree ? '✓' : ''}</span>
        Saya menyatakan dengan itikad baik bahwa penggunaan konten di atas tidak diizinkan oleh pemilik hak, dan informasi dalam laporan ini akurat.
      </button>
      {err && <div className="text-[13px] font-semibold text-danger">{err}</div>}
      <button type="submit" className="h-[46px] cursor-pointer self-start rounded-[11px] border-0 bg-accent px-[22px] text-sm font-extrabold text-white">Kirim laporan</button>
    </form>
  )
}
