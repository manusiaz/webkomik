// Single source of comic data for every page. Mock until the admin/API backend exists.
export type ComicType = 'Manga' | 'Manhwa' | 'Manhua' | 'Lokal'
export type Lang = 'id' | 'en'

export type Comic = {
  id: string
  title: string
  type: ComicType
  genre: string
  g2?: string
  ch: number
  v: number
  r: number
  h: number
  partner: string
  status: 'Berjalan' | 'Tamat'
  author?: string
  syn?: Record<Lang, string>
}

type Row = [string, string, ComicType, string, number, number, number, number, string, 'Berjalan' | 'Tamat']
const ROWS: Row[] = [
  ['langit', 'Langit yang Retak', 'Lokal', 'Fantasi', 128, 84200, 4.8, 250, 'Studio Kertas', 'Berjalan'],
  ['pedang', 'Pedang Ketujuh', 'Manhwa', 'Aksi', 342, 71900, 4.7, 20, 'Hanul Media', 'Berjalan'],
  ['kedai', 'Kedai Teh Musim Gugur', 'Manga', 'Slice of life', 61, 40300, 4.9, 60, 'Kumo Press', 'Tamat'],
  ['raja', 'Raja Tanpa Mahkota', 'Manhua', 'Fantasi', 915, 66100, 4.5, 300, 'Jade Lantern', 'Berjalan'],
  ['sekolah', 'Sekolah Malam', 'Lokal', 'Horor', 47, 38800, 4.6, 160, 'Studio Kertas', 'Berjalan'],
  ['pemburu', 'Pemburu Level Nol', 'Manhwa', 'Aksi', 210, 59400, 4.4, 230, 'Hanul Media', 'Berjalan'],
  ['surat', 'Surat untuk Hana', 'Manga', 'Romansa', 33, 22700, 4.8, 350, 'Kumo Press', 'Berjalan'],
  ['gerbang', 'Gerbang Naga Giok', 'Manhua', 'Wuxia', 588, 31500, 4.3, 150, 'Jade Lantern', 'Berjalan'],
  ['ojek', 'Ojek Dimensi', 'Lokal', 'Komedi', 72, 27900, 4.7, 80, 'Rumah Panel', 'Berjalan'],
  ['mercusuar', 'Penjaga Mercusuar', 'Manga', 'Misteri', 19, 15200, 4.6, 210, 'Kumo Press', 'Berjalan'],
  ['istana', 'Istana Bayangan', 'Manhwa', 'Drama', 156, 33100, 4.5, 280, 'Hanul Media', 'Tamat'],
  ['koki', 'Koki Sang Kaisar', 'Manhua', 'Komedi', 301, 29800, 4.4, 40, 'Jade Lantern', 'Berjalan'],
  ['finis', 'Garis Finis', 'Manga', 'Olahraga', 240, 24600, 4.7, 190, 'Kumo Press', 'Berjalan'],
  ['kota', 'Kota Tanpa Hujan', 'Lokal', 'Sci-fi', 12, 9800, 4.9, 200, 'Rumah Panel', 'Berjalan'],
  ['menara', 'Pewaris Menara', 'Manhwa', 'Fantasi', 98, 20400, 4.3, 270, 'Hanul Media', 'Berjalan'],
  ['lentera', 'Lentera Merah', 'Manhua', 'Romansa', 77, 17300, 4.5, 10, 'Jade Lantern', 'Berjalan'],
  ['arus', 'Arus Balik', 'Lokal', 'Drama', 8, 6100, 4.6, 220, 'Rumah Panel', 'Berjalan'],
  ['bintang', 'Bintang Ruang Ganti', 'Manga', 'Olahraga', 5, 4800, 4.4, 100, 'Kumo Press', 'Berjalan'],
]

const EXTRA: Record<string, Partial<Comic>> = {
  langit: { g2: 'Aksi', author: 'Arya Wibisana · Studio Kertas', syn: { id: 'Sejak langit di atas Kota Arga retak, setiap malam turun serpihan cahaya yang memberi kekuatan pada siapa pun yang menyentuhnya. Raka, kurir paket biasa, tidak sengaja menyimpan serpihan terbesar dan sekarang diburu tiga faksi yang ingin memilikinya.', en: 'Ever since the sky over Arga City cracked, shards of light fall every night, granting power to whoever touches them. Raka, an ordinary courier, keeps the largest one by accident and is now hunted by three factions.' } },
  pedang: { g2: 'Fantasi', author: 'Han Seo-jin · Hanul Media', syn: { id: 'Enam pedang legendaris sudah punya tuan. Yang ketujuh memilih anak penjaga gudang senjata yang belum pernah memegang pedang.', en: 'Six legendary swords have found their masters. The seventh chooses an armory keeper’s son who has never held a blade.' } },
  kedai: { g2: 'Drama', author: 'Mori Aoi · Kumo Press', syn: { id: 'Sebuah kedai teh kecil di kaki gunung, pemiliknya yang pendiam, dan pelanggan yang datang membawa cerita masing-masing.', en: 'A small tea house at the foot of a mountain, its quiet owner, and customers who each bring a story.' } },
  raja: { g2: 'Wuxia', author: 'Lin Mu · Jade Lantern', syn: { id: 'Pewaris takhta yang dibuang kembali sebagai murid sekte paling lemah, membawa ingatan dari kehidupan sebelumnya.', en: 'A cast-out heir returns as a disciple of the weakest sect, carrying memories of his past life.' } },
  sekolah: { g2: 'Misteri', author: 'Dewi Kirana · Studio Kertas', syn: { id: 'Kelas tambahan jam sembilan malam. Daftar absennya selalu bertambah satu nama.', en: 'Extra class at nine at night. The attendance list always has one more name.' } },
}

export const COMICS: Comic[] = ROWS.map(([id, title, type, genre, ch, v, r, h, partner, status]) => ({ id, title, type, genre, ch, v, r, h, partner, status, ...EXTRA[id] }))
export const byId = Object.fromEntries(COMICS.map(c => [c.id, c])) as Record<string, Comic>
export const getComic = (id?: string | null) => (id && byId[id]) || byId.langit

export const TYPES: ComicType[] = ['Manga', 'Manhwa', 'Manhua', 'Lokal']
export const GENRES = ['Fantasi', 'Aksi', 'Romansa', 'Horor', 'Komedi', 'Drama', 'Slice of life', 'Misteri', 'Wuxia', 'Olahraga', 'Sci-fi']

/** Seed reading progress shown until the reader records real progress. */
export const SEED_PROGRESS: Record<string, number> = { langit: 126, pedang: 339, kedai: 61, sekolah: 44, raja: 900, ojek: 70 }
export const DEFAULT_BM = ['langit', 'pedang', 'kedai', 'sekolah', 'raja', 'ojek', 'surat']

/** [id, ch, page, totalPages, time, dayGroup 0=today 1=yesterday 2=this week] */
export type HistEntry = [string, number, number, number, string, number]
export const SEED_HIST: HistEntry[] = [['langit', 126, 9, 14, '21.42', 0], ['pedang', 339, 22, 22, '20.10', 0], ['sekolah', 44, 6, 18, '13.05', 0], ['raja', 900, 30, 30, '22.30', 1], ['ojek', 70, 4, 16, '07.55', 1], ['kedai', 61, 24, 24, 'Sel', 2], ['surat', 33, 12, 20, 'Sen', 2]]

export const coverBg = (h: number, l = 0.42, c = 0.09) => `oklch(${l} ${c} ${h})`
export const typeLabel = (t: ComicType, lang: Lang) => (t === 'Lokal' && lang === 'en' ? 'Local' : t)

export const routes = {
  home: '/',
  comic: (id: string) => `/komik/${id}`,
  read: (id: string, ch?: number) => (ch ? `/baca/${id}/${ch}` : `/baca/${id}`),
  page: (p: 'jadwal' | 'cari' | 'bookmark' | 'riwayat' | 'profil') => `/${p}`,
  admin: '/admin',
  landing: '/landing',
  legal: (doc: 'syarat' | 'privasi' | 'hakcipta') => `/legal/${doc}`,
  ds: '/design-system',
}

/** 84200 → "84,2rb" (id) / "84.2k" (en); millions → "2,6jt" / "2.6M" */
export const compact = (n: number, lang: Lang = 'id') => {
  if (lang === 'en') return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
  return n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + 'jt' : n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'rb' : String(n)
}
