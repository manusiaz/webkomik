'use client'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { COMICS, SEED_PROGRESS } from '@/lib/comics'
import { useBookmarks, useLang } from '@/lib/store'

export const TODAY = 4
export const BEFORE: Record<string, number> = { ...SEED_PROGRESS, surat: 33 }
export const META = COMICS.map((c, i) => ({ ...c, day: i % 7, time: ['19.00', '12.00', '21.00', '17.00'][i % 4], added: 18 - i }))

export const T = {
  id: { schedule: 'Jadwal Update', scheduleSub: 'Chapter resmi tayang sesuai jadwal partner. Bookmark judul untuk dapat notifikasi.', weekOf: '6–12 Okt 2026', days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'], today: 'Hari ini', titles: (n: number) => `${n} judul`, aired: 'Sudah tayang', airsAt: 'Tayang', upcoming: 'Terjadwal', browse: 'Daftar Komik', searchPh: 'Cari judul, author, partner', sorts: [['pop', 'Terpopuler'], ['upd', 'Update terbaru'], ['rating', 'Rating tertinggi'], ['new', 'Judul baru'], ['az', 'A–Z']] as [Sort, string][], type: 'TIPE', genre: 'GENRE', status: 'STATUS', all: 'Semua', ongoing: 'Berjalan', done: 'Tamat', minRating: 'RATING MIN.', reset: 'Reset filter', result: (n: number) => `${n} judul ditemukan`, noResult: 'Nggak ketemu', noResultSub: 'Coba kata kunci lain, atau request judul ini ke tim nacp.', request: 'Request komik', requested: 'Request terkirim. Makasih!', sponsored: 'Bersponsor', ad: 'IKLAN', bookmarks: 'Bookmark', bmTabs: ['Semua', 'Ada chapter baru', 'Selesai dibaca'], edit: 'Edit', doneEdit: 'Selesai', newCh: (n: number) => `+${n} baru`, lastRead: (a: number, b: number) => `Dibaca Ch ${a} dari ${b}`, notifOn: 'Notif on', notifOff: 'Notif off', bmEmpty: 'Belum ada bookmark', bmSub: (n: number, k: number) => `${n} judul · ${k} ada chapter baru`, history: 'Riwayat Baca', histSub: 'Tersimpan di perangkat ini dan akun kamu', clear: 'Hapus riwayat', remove: 'Hapus', resume: 'Lanjut', groups: ['Hari ini', 'Kemarin', 'Minggu ini'], page: (c: number, p: number, t: number) => `Chapter ${c} · halaman ${p} dari ${t}`, histEmpty: 'Riwayat kosong. Mulai baca dari beranda.', login: 'Masuk', register: 'Daftar', authSub: 'Akun dipakai untuk sinkron bookmark dan riwayat di semua perangkat, serta langganan premium.', google: 'Lanjut dengan Google', or: 'atau', username: 'Username', password: 'Kata sandi', noAccountNote: 'Tanpa akun kamu tetap bisa baca semua chapter gratis.', errEmail: 'Email belum valid', errPw: 'Kata sandi minimal 6 karakter', logout: 'Keluar', member: 'Bergabung Feb 2025', stats: ['chapter dibaca', 'jam membaca', 'judul di-bookmark', 'komentar'], perMonth: '/bulan', perks: ['Tanpa iklan di semua halaman', 'Early access chapter 1–7 hari lebih awal', 'Gambar HD tanpa batas', 'Download chapter untuk dibaca offline di webapp'], premActive: 'Premium aktif sampai 10 Nov 2026', subscribe: 'Langganan sekarang', manage: 'Kelola langganan', set: [['Bahasa', 'Bahasa antarmuka'], ['Tema', 'Gelap atau terang'], ['Notifikasi', 'Push saat chapter baru dari bookmark'], ['Pengaturan baca default', 'Mode, arah, latar, kualitas'], ['Data & penyimpanan', 'Kualitas gambar dan download offline']], on: 'Aktif', off: 'Mati', payTitle: 'Langganan Premium', plans: [['1 bulan', 'Tagih tiap bulan', 'Rp15.000'], ['3 bulan', 'Hemat 11%', 'Rp40.000'], ['12 bulan', 'Hemat 28%', 'Rp129.000']], payMethod: 'METODE BAYAR', pay: 'Bayar', payNote: 'Bisa dibatalkan kapan saja. Iklan langsung hilang setelah pembayaran berhasil.', paid: 'Pembayaran berhasil. Selamat datang di Premium!', welcome: 'Berhasil masuk', bmAdded: 'Ditambahkan ke bookmark', bmRemoved: 'Dihapus dari bookmark', nav: ['Beranda', 'Jadwal', 'Daftar Komik', 'Bookmark', 'Riwayat'], light: 'Terang', dark: 'Gelap' },
  en: { schedule: 'Release Schedule', scheduleSub: 'Official chapters go live on the partner’s schedule. Bookmark a title to get notified.', weekOf: 'Oct 6–12, 2026', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], today: 'Today', titles: (n: number) => `${n} titles`, aired: 'Out now', airsAt: 'Airs', upcoming: 'Scheduled', browse: 'All Comics', searchPh: 'Search title, author, partner', sorts: [['pop', 'Most popular'], ['upd', 'Recently updated'], ['rating', 'Top rated'], ['new', 'Newest series'], ['az', 'A–Z']] as [Sort, string][], type: 'TYPE', genre: 'GENRE', status: 'STATUS', all: 'All', ongoing: 'Ongoing', done: 'Completed', minRating: 'MIN. RATING', reset: 'Reset filters', result: (n: number) => `${n} titles found`, noResult: 'Nothing found', noResultSub: 'Try another keyword, or request this title from the nacp team.', request: 'Request a comic', requested: 'Request sent. Thanks!', sponsored: 'Sponsored', ad: 'AD', bookmarks: 'Bookmarks', bmTabs: ['All', 'New chapters', 'Finished'], edit: 'Edit', doneEdit: 'Done', newCh: (n: number) => `+${n} new`, lastRead: (a: number, b: number) => `Read Ch ${a} of ${b}`, notifOn: 'Notify on', notifOff: 'Notify off', bmEmpty: 'No bookmarks yet', bmSub: (n: number, k: number) => `${n} titles · ${k} with new chapters`, history: 'Reading History', histSub: 'Saved on this device and your account', clear: 'Clear history', remove: 'Remove', resume: 'Resume', groups: ['Today', 'Yesterday', 'This week'], page: (c: number, p: number, t: number) => `Chapter ${c} · page ${p} of ${t}`, histEmpty: 'History is empty. Start reading from home.', login: 'Log in', register: 'Sign up', authSub: 'Your account syncs bookmarks and history across devices and holds your premium subscription.', google: 'Continue with Google', or: 'or', username: 'Username', password: 'Password', noAccountNote: 'You can read every chapter for free without an account.', errEmail: 'Enter a valid email', errPw: 'Password needs at least 6 characters', logout: 'Log out', member: 'Joined Feb 2025', stats: ['chapters read', 'hours reading', 'titles bookmarked', 'comments'], perMonth: '/month', perks: ['No ads on any page', 'Early access 1–7 days ahead', 'Unlimited HD images', 'Download chapters for offline reading in the webapp'], premActive: 'Premium active until Nov 10, 2026', subscribe: 'Subscribe now', manage: 'Manage subscription', set: [['Language', 'Interface language'], ['Theme', 'Dark or light'], ['Notifications', 'Push when bookmarked titles update'], ['Default reading settings', 'Mode, direction, background, quality'], ['Data & storage', 'Image quality and offline downloads']], on: 'On', off: 'Off', payTitle: 'Premium subscription', plans: [['1 month', 'Billed monthly', 'Rp15.000'], ['3 months', 'Save 11%', 'Rp40.000'], ['12 months', 'Save 28%', 'Rp129.000']], payMethod: 'PAYMENT METHOD', pay: 'Pay', payNote: 'Cancel anytime. Ads disappear as soon as payment succeeds.', paid: 'Payment successful. Welcome to Premium!', welcome: 'Logged in', bmAdded: 'Added to bookmarks', bmRemoved: 'Removed from bookmarks', nav: ['Home', 'Schedule', 'All Comics', 'Bookmarks', 'History'], light: 'Light', dark: 'Dark' },
}
export type Sort = 'pop' | 'upd' | 'rating' | 'new' | 'az'

export const useT = () => T[useLang()[0]]

export const gridCls = 'grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))] md:gap-[18px]'

export function PageHead({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><H1>{title}</H1>{sub && <div className="mt-1 text-sm text-ink-3">{sub}</div>}</div>
      {children}
    </div>
  )
}

export const H1 = ({ children }: { children: ReactNode }) => <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.04em] md:text-[40px]">{children}</h1>

export function EmptyBox({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-center gap-2.5 rounded-[14px] border border-dashed border-line-2 px-5 py-12 text-center">{children}</div>
}

const ToastCtx = createContext<(m: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const flash = useCallback((m: string) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(''), 2200)
  }, [])
  return (
    <ToastCtx.Provider value={flash}>
      {children}
      {msg && <div className="fixed bottom-[90px] left-1/2 z-[90] -translate-x-1/2 rounded-[10px] bg-[#16171A] px-4 py-2.5 text-[13px] font-semibold text-white">{msg}</div>}
    </ToastCtx.Provider>
  )
}

export function useToggleBm() {
  const [bm, setBm] = useBookmarks()
  const t = useT()
  const flash = useToast()
  return [bm, (id: string) => {
    const on = bm.includes(id)
    setBm(on ? bm.filter(x => x !== id) : [...bm, id])
    flash(on ? t.bmRemoved : t.bmAdded)
  }] as const
}
