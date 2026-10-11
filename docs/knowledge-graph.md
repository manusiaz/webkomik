# nacp — knowledge graph

Satu sistem. Tiap node = route/file; tiap garis = dependensi data atau desain yang nyata. Update file ini kalau nambah route, key storage, atau komponen bersama.

```mermaid
graph LR
  subgraph Design["Design tokens"]
    CSS["app/globals.css<br/>tokens light/dark · @theme · breakpoints md760 lg1100 xl1240"]
  end
  subgraph Data["Data & state"]
    COMICS["lib/comics.ts<br/>COMICS(18) · routes · compact · coverBg"]
    STORE["lib/store.ts<br/>localStorage hooks"]
  end
  subgraph Backend["Backend (Supabase)"]
    DB["supabase/migrations/0001_init.sql<br/>nacp_profiles(role) · nacp_comics · nacp_chapters · nacp_bookmarks · nacp_reading_progress · nacp_comments · RLS"]
    SB["lib/supabase/*<br/>client · server · getStaff()"]
    PROXY["proxy.ts<br/>session refresh · /admin → /login"]
  end
  UI["components/ui.tsx<br/>Logo · Cover · AdSlot · Segmented · Chip · Switch · BottomNav"]
  LAYOUT["app/layout.tsx + ThemeSync<br/>fonts · data-theme · lang"]

  HOME["/ Beranda"]
  DETAIL["/komik/[id]"]
  READER["/baca/[id]/[ch]"]
  RESUME["/baca/[id] → lanjut"]
  HAL["/jadwal /cari /bookmark /riwayat /profil"]
  ADMIN["/admin"]
  LAND["/landing (+ manifest PWA)"]
  LEGAL["/legal/[doc]"]
  DS["/design-system"]

  CSS --> UI --> HOME & DETAIL & READER & HAL & ADMIN & LAND & LEGAL & DS
  COMICS --> HOME & DETAIL & READER & HAL & ADMIN & LAND
  STORE --> UI
  LAYOUT --> HOME & DETAIL & READER & HAL & ADMIN & LAND & LEGAL & DS

  HOME -- cover --> DETAIL
  HOME -- "Lanjut Baca / chapter" --> READER
  HOME -- "cari ?q=" --> HAL
  DETAIL -- chapter --> READER
  READER -- prev/next --> READER
  RESUME --> READER
  HAL -- cover --> DETAIL
  HAL -- "Lanjut (riwayat)" --> READER
  LAND --> HOME & LEGAL & HAL
  DS -. "membaca kode asli" .-> CSS & UI
```

## State lintas halaman (localStorage)

| Key | Hook | Ditulis oleh | Dibaca oleh |
|---|---|---|---|
| `nacp-theme` | `useTheme` | toggle di semua header, admin, DS | layout (no-flash), ThemeSync, reader bg `auto` |
| `nacp-lang` | `useLang` | `LangToggle` | semua halaman publik |
| `nacp-premium` | `usePremium` / `useAdsOn` | /profil (bayar), logout | semua `AdSlot`, tombol "Bebas iklan" beranda |
| `nacp-logged` | `useLogged` | /profil | header avatar halaman |
| `nacp-bm` | `useBookmarks` | /komik, /jadwal, /bookmark | /bookmark, /komik, /profil |
| `nacp-progress` | `useProgress` | reader | beranda Lanjut Baca, /komik, /bookmark, /baca/[id] |
| `nacp-hist` | `useHistory` | reader | /riwayat |
| `nacp-reader-v2` | `useStored` | panel pengaturan reader | reader |
| `nacp-notif`, `nacp-prefs` | `useStored` | /bookmark, /profil | sama |

## Auth & role

- `/admin` dua lapis: `proxy.ts` (harus login) → `app/admin/page.tsx` cek `nacp_profiles.role` dari DB (admin/editor/uploader). Tanpa env Supabase = semua ditolak (fail closed).
- Role cuma bisa diubah lewat `nacp_set_role()` (khusus admin) atau service role; trigger `nacp_protect_profile` memblok insert/update role & premium dari API.
- Profil nacp dibuat saat login pertama di /login (upsert), bukan trigger di `auth.users` — signup CBN tidak menyentuh nacp.
- Admin pertama: buat user di Supabase Auth, lalu SQL `insert into nacp_profiles (id, role) values ('<uid>','admin') on conflict (id) do update set role='admin'`.
- Project Supabase: `cbn-commercial-hub` (llynyfneqgmoapusbsix), numpang — semua objek nacp berawalan `nacp_` (tabel, fungsi, policy, index), terpisah dari CBN. Kalau CBN mulai pakai project ini, pindahkan nacp ke project sendiri.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Vercel + `.env.local`).

## Aturan yang dipegang

- Semua warna lewat token; tema = `data-theme` di `<html>`.
- Cover selalu 3:4 (`Cover`), min 150px mobile / 190px desktop.
- Slot iklan tinggi tetap; premium → `AdSlot` return null (script iklan tidak dimuat).
- Data komik hanya dari `lib/comics.ts`; admin data mock di `app/admin/data.ts`.

## Belum ada (sengaja, bukan bagian desain)

- Halaman publik & panel admin masih baca data mock (`lib/comics.ts`, `app/admin/data.ts`), belum dari tabel Supabase.
- Login pembaca di /profil, pembayaran Premium, upload ke Storage, ad manager tersimpan: belum.
- Warna aksen dari Admin > Tampilan baru berlaku di preview admin, belum ke situs.
- Gambar asli: cover/halaman masih placeholder → ganti `Cover` ke `next/image` saat CDN siap.
