import { COMICS, coverBg, type Comic } from '@/lib/comics'

export type Role = 'Admin' | 'Editor' | 'Uploader'
export type SectionKey = 'dashboard' | 'titles' | 'upload' | 'schedule' | 'ads' | 'users' | 'comments' | 'partners' | 'reports' | 'site'
export type AdminStatus = Comic['status'] | 'Hiatus' | 'Draft'
export type AdminComic = Omit<Comic, 'status'> & { status: AdminStatus; genres: string[] }

export const ADMIN_COMICS: AdminComic[] = COMICS.map((c, i) => ({ ...c, status: i === 16 ? 'Draft' : c.status, genres: [c.genre] }))
export const ADMIN_GENRES = ['Aksi', 'Fantasi', 'Romansa', 'Horor', 'Komedi', 'Drama', 'Slice of life', 'Misteri', 'Wuxia', 'Olahraga', 'Sci-fi']

export const NAV: [SectionKey, string][] = [['dashboard', 'Dashboard'], ['titles', 'Judul'], ['upload', 'Upload Chapter'], ['schedule', 'Jadwal Rilis'], ['ads', 'Iklan'], ['users', 'Pengguna'], ['comments', 'Komentar'], ['partners', 'Partner'], ['reports', 'Laporan & Request'], ['site', 'Tampilan & SEO']]
export const ACCESS: Record<Role, SectionKey[]> = {
  Admin: NAV.map(n => n[0]),
  Editor: ['dashboard', 'titles', 'upload', 'schedule', 'ads', 'comments', 'reports'],
  Uploader: ['dashboard', 'titles', 'upload', 'schedule'],
}
export const ROLES: Role[] = ['Admin', 'Editor', 'Uploader']
export const WHO: Record<Role, string> = { Admin: 'Rina (Admin)', Editor: 'Bagas (Editor)', Uploader: 'Studio Kertas (Uploader)' }
export const UPLOADER_PARTNER = 'Studio Kertas'

export const PARTNERS = [
  { name: 'Studio Kertas', kind: 'Studio komik lokal', share: '70/30', uploaders: 3, until: 'Des 2027' },
  { name: 'Hanul Media', kind: 'Publisher manhwa', share: '60/40', uploaders: 2, until: 'Jun 2027' },
  { name: 'Kumo Press', kind: 'Publisher manga', share: '55/45', uploaders: 2, until: 'Mar 2027' },
  { name: 'Jade Lantern', kind: 'Publisher manhua', share: '60/40', uploaders: 1, until: 'Sep 2027' },
  { name: 'Rumah Panel', kind: 'Kolektif kreator lokal', share: '75/25', uploaders: 4, until: 'Des 2026' },
]

export type UserRole = 'Pembaca' | 'Uploader' | 'Editor' | 'Admin'
export const USERS: { name: string; email: string; role: UserRole; sub: string; joined: string }[] = (
  [
    ['Rina Aulia', 'rina@nacp.id', 'Admin', '—', '01/24'], ['Bagas Pratama', 'bagas@nacp.id', 'Editor', '—', '03/24'],
    ['Studio Kertas', 'upload@studiokertas.id', 'Uploader', '—', '05/24'], ['Hanul Media', 'id@hanulmedia.kr', 'Uploader', '—', '06/24'],
    ['dimas.r', 'dimas.r@gmail.com', 'Pembaca', 'Premium', '02/25'], ['nadya', 'nadya.k@gmail.com', 'Pembaca', 'Premium', '07/25'],
    ['kopi_hitam', 'kh@proton.me', 'Pembaca', 'Gratis', '09/25'], ['spam_bot_88', 'x88@mail.ru', 'Pembaca', 'Gratis', '10/26'],
  ] as const
).map(([name, email, role, sub, joined]) => ({ name, email, role, sub, joined }))

export type AdminComment = { i: number; user: string; where: string; time: string; text: string; flags: number; done: boolean }
export const COMMENTS: AdminComment[] = [
  { user: 'spam_bot_88', where: 'Langit yang Retak · Ch 128', time: '12 mnt', text: 'Baca gratis full di link bio gw, lebih lengkap!!', flags: 14 },
  { user: 'anon_77', where: 'Sekolah Malam · Ch 47', time: '1 jam', text: 'Spoiler: yang ke-31 itu sebenarnya gurunya sendiri.', flags: 6 },
  { user: 'dimas.r', where: 'Langit yang Retak · Ch 128', time: '2 jam', text: 'Panel waktu Raka megang serpihan itu gila sih, warnanya keluar banget.', flags: 0 },
  { user: 'nadya', where: 'Pedang Ketujuh · Ch 342', time: '3 jam', text: 'Akhirnya pedang ketujuh ngomong juga.', flags: 0 },
  { user: 'troll_id', where: 'Raja Tanpa Mahkota · Ch 915', time: '5 jam', text: 'Author-nya males, ceritanya muter-muter terus.', flags: 3 },
  { user: 'kopi_hitam', where: 'Kedai Teh · Ch 61', time: '8 jam', text: 'Tamat dengan manis. Makasih Kumo Press.', flags: 0 },
].map((c, i) => ({ ...c, i, done: false }))

export type AdminReport = { id: string; ch: number; page: number; reason: string; count: number; fixed: boolean }
export const REPORTS: AdminReport[] = [
  { id: 'langit', ch: 127, page: 9, reason: 'Gambar tidak muncul', count: 12 },
  { id: 'raja', ch: 914, page: 22, reason: 'Urutan halaman tertukar', count: 4 },
  { id: 'pedang', ch: 341, page: 3, reason: 'Resolusi pecah', count: 2 },
].map(r => ({ ...r, fixed: false }))

export const REQUESTS = [
  { title: 'Penjahit dari Gang Sempit', type: 'Lokal', note: 'kreator sudah dihubungi', votes: 842, status: 'Negosiasi', c: '#F2A93B' },
  { title: 'Akademi Penyihir Gagal', type: 'Manhwa', note: 'cek pemegang lisensi', votes: 611, status: 'Ditinjau', c: 'var(--ink-3)' },
  { title: 'Nelayan Bintang', type: 'Manga', note: 'publisher setuju', votes: 430, status: 'Disetujui', c: '#2FA67A' },
  { title: 'Tujuh Cawan Arak', type: 'Manhua', note: 'lisensi dipegang pihak lain', votes: 388, status: 'Ditolak', c: '#D9534F' },
]

export type UploadStatus = 'Tayang' | 'Terjadwal' | 'Diproses' | 'Draft' | 'Gagal'
export type UploadRow = { id: string; ch: number; by: string; st: UploadStatus; when: string }
export const UPLOADS: UploadRow[] = [
  { id: 'langit', ch: 128, by: 'Studio Kertas', st: 'Tayang', when: '3 Okt 19.00' },
  { id: 'pedang', ch: 343, by: 'Hanul Media', st: 'Terjadwal', when: 'Sab 11 Okt 12.00' },
  { id: 'raja', ch: 916, by: 'Jade Lantern', st: 'Diproses', when: 'baru saja' },
  { id: 'sekolah', ch: 48, by: 'Studio Kertas', st: 'Draft', when: 'kemarin' },
  { id: 'pemburu', ch: 211, by: 'Hanul Media', st: 'Gagal', when: '2 jam lalu' },
]
export const UPLOAD_ST: Record<UploadStatus, [string, string, string]> = {
  Tayang: ['#2FA67A', '#fff', 'Lihat'], Terjadwal: ['#F2A93B', '#16171A', 'Edit'], Diproses: ['#3E7BE6', '#fff', 'Pantau'],
  Draft: ['var(--surface-2)', 'var(--ink-2)', 'Lanjutkan'], Gagal: ['#D9534F', '#fff', 'Ulangi'],
}

export const SECS = ['Banner utama', 'Lanjut Baca', 'Rekomendasi buat kamu', 'Peringkat', 'Update Terbaru', 'Komik Baru', 'Jelajah Genre', 'Slider rekomendasi bawah']
export const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
export const TODAY = 5

export type AdUnit = 'load' | 'card' | 'img' | 'ch'
export type Slot = {
  id: string; name: string; page: string; pos: string; size: string; nets: [string, number][]; freq: number; unit: AdUnit; cap: number
  on: boolean; imp: number; ctr: number; dev: string[]; geo: string[]; prem: boolean; ex: string[]
}
export const SLOTS: Slot[] = [
  { id: 'home_top', name: 'Banner atas beranda', page: 'Beranda', pos: 'Di bawah Lanjut Baca', size: '728×90', nets: [['AdSense', 60], ['Adsterra', 40]], freq: 1, unit: 'load', cap: 10, on: true, imp: 182400, ctr: 0.41, dev: ['Desktop', 'Mobile', 'Webapp'], geo: ['Semua'], prem: true, ex: [] },
  { id: 'home_sidebar', name: 'Sidebar rekomendasi', page: 'Beranda', pos: 'Kolom kanan sticky', size: '300×250', nets: [['AdSense', 100]], freq: 1, unit: 'load', cap: 10, on: true, imp: 96100, ctr: 0.28, dev: ['Desktop'], geo: ['Semua'], prem: true, ex: [] },
  { id: 'home_feed_native', name: 'Native di Update Terbaru', page: 'Beranda', pos: 'Kartu ke-5', size: 'Native', nets: [['Direct', 50], ['Adsterra', 50]], freq: 8, unit: 'card', cap: 6, on: true, imp: 140200, ctr: 0.92, dev: ['Desktop', 'Mobile', 'Webapp'], geo: ['ID', 'MY'], prem: true, ex: [] },
  { id: 'detail_top', name: 'Banner halaman komik', page: 'Detail', pos: 'Di atas daftar chapter', size: '728×90', nets: [['AdSense', 100]], freq: 1, unit: 'load', cap: 10, on: true, imp: 88300, ctr: 0.33, dev: ['Desktop', 'Mobile', 'Webapp'], geo: ['Semua'], prem: true, ex: [] },
  { id: 'reader_inline', name: 'Di antara halaman', page: 'Reader', pos: 'Antar gambar chapter', size: '728×90', nets: [['Monetag', 70], ['AdSense', 30]], freq: 4, unit: 'img', cap: 20, on: true, imp: 612800, ctr: 0.35, dev: ['Desktop', 'Mobile', 'Webapp'], geo: ['Semua'], prem: true, ex: ['Kedai Teh Musim Gugur'] },
  { id: 'reader_end', name: 'Akhir chapter', page: 'Reader', pos: 'Sebelum tombol next', size: '300×250', nets: [['AdSense', 100]], freq: 1, unit: 'ch', cap: 30, on: true, imp: 201300, ctr: 0.77, dev: ['Desktop', 'Mobile', 'Webapp'], geo: ['Semua'], prem: true, ex: [] },
  { id: 'mobile_sticky', name: 'Sticky bawah mobile', page: 'Semua', pos: 'Bawah layar', size: '320×50', nets: [['Adsterra', 100]], freq: 1, unit: 'load', cap: 30, on: true, imp: 398000, ctr: 0.19, dev: ['Mobile', 'Webapp'], geo: ['Semua'], prem: true, ex: [] },
  { id: 'reader_interstitial', name: 'Interstitial pindah chapter', page: 'Reader', pos: 'Layar penuh sebelum chapter baru', size: 'Interstitial', nets: [['Monetag', 100]], freq: 2, unit: 'ch', cap: 5, on: true, imp: 74100, ctr: 1.12, dev: ['Mobile', 'Webapp'], geo: ['ID'], prem: true, ex: [] },
]
export const UNIT: Record<AdUnit, string> = { load: 'Tiap muat halaman', card: 'Tiap N kartu', img: 'Tiap N gambar', ch: 'Tiap N chapter' }
export const UNIT_SHORT: Record<AdUnit, string> = { load: 'tiap muat', card: 'tiap {n} kartu', img: 'tiap {n} gambar', ch: 'tiap {n} chapter' }
export const NETWORKS = [
  { name: 'Google AdSense', kind: 'Display & responsive', status: 'Terhubung', pub: 'ca-pub-0000000000000000', script: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-…"></script>', adstxt: 'google.com, pub-…, DIRECT' },
  { name: 'Monetag', kind: 'Display, interstitial, push, popunder', status: 'Terhubung', pub: 'zone 7·······', script: '<script src="//…/tag.min.js" data-zone="…"></script>', adstxt: 'monetag.com, …, DIRECT' },
  { name: 'Adsterra', kind: 'Banner, native, social bar', status: 'Terhubung', pub: 'key a1b2········', script: '<script src="//…/invoke.js"></script>', adstxt: 'adsterra.com, …, DIRECT' },
  { name: 'Direct', kind: 'Banner upload sendiri + link', status: 'Aktif', pub: '—', script: '(dikelola per slot)', adstxt: '—' },
]
export const NET_OPTS = ['AdSense', 'Monetag', 'Adsterra', 'Direct', 'Lainnya (script)']
export const PAGE_OPTS = ['Beranda', 'Detail', 'Reader', 'Pencarian', 'Semua']
export const SIZE_OPTS = ['728×90', '320×100', '300×250', '300×600', '320×50', 'Native', 'Interstitial']
export const EX_POOL = ['Sekolah Malam', 'Surat untuk Hana', 'Kota Tanpa Hujan']
export const ACCENTS = ['#3E7BE6', '#E2483D', '#7C5CE0', '#2FA67A']

export const col = (h: number) => coverBg(h)
export const pct2 = (n: number) => n.toFixed(2).replace('.', ',') + '%'

export function weekOf(comics: AdminComic[]) {
  return DAYS.map((name, i) => {
    const past = i < TODAY - 1, today = i === TODAY - 1
    const items = comics.filter((c, j) => j % 7 === i && c.status === 'Berjalan').slice(0, 3).map((c, j) => ({
      id: c.id, title: c.title, h: c.h, ch: c.ch + (i >= TODAY - 1 ? 1 : 0), time: ['19.00', '12.00', '21.00'][j % 3],
      st: past ? 'tayang' : today ? 'hari ini' : 'terjadwal', stColor: past ? 'var(--ink-3)' : today ? '#3E7BE6' : '#F2A93B',
    }))
    return { name, date: `${6 + i} Okt`, items, today }
  })
}
