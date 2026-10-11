-- Demo catalog matching lib/comics.ts. Delete once real titles are uploaded from /admin.
insert into public.comics (id, title, type, genre, genres, status, author, partner, synopsis_id, synopsis_en, hue, rating, views, published) values
  ('langit', 'Langit yang Retak', 'Lokal', 'Fantasi', array['Fantasi', 'Aksi'], 'Berjalan', 'Arya Wibisana · Studio Kertas', 'Studio Kertas', 'Sejak langit di atas Kota Arga retak, setiap malam turun serpihan cahaya yang memberi kekuatan pada siapa pun yang menyentuhnya. Raka, kurir paket biasa, tidak sengaja menyimpan serpihan terbesar dan sekarang diburu tiga faksi yang ingin memilikinya.', 'Ever since the sky over Arga City cracked, shards of light fall every night, granting power to whoever touches them. Raka, an ordinary courier, keeps the largest one by accident and is now hunted by three factions.', 250, 4.8, 84200, true),
  ('pedang', 'Pedang Ketujuh', 'Manhwa', 'Aksi', array['Aksi', 'Fantasi'], 'Berjalan', 'Han Seo-jin · Hanul Media', 'Hanul Media', 'Enam pedang legendaris sudah punya tuan. Yang ketujuh memilih anak penjaga gudang senjata yang belum pernah memegang pedang.', 'Six legendary swords have found their masters. The seventh chooses an armory keeper’s son who has never held a blade.', 20, 4.7, 71900, true),
  ('kedai', 'Kedai Teh Musim Gugur', 'Manga', 'Slice of life', array['Slice of life', 'Drama'], 'Tamat', 'Mori Aoi · Kumo Press', 'Kumo Press', 'Sebuah kedai teh kecil di kaki gunung, pemiliknya yang pendiam, dan pelanggan yang datang membawa cerita masing-masing.', 'A small tea house at the foot of a mountain, its quiet owner, and customers who each bring a story.', 60, 4.9, 40300, true),
  ('raja', 'Raja Tanpa Mahkota', 'Manhua', 'Fantasi', array['Fantasi', 'Wuxia'], 'Berjalan', 'Lin Mu · Jade Lantern', 'Jade Lantern', 'Pewaris takhta yang dibuang kembali sebagai murid sekte paling lemah, membawa ingatan dari kehidupan sebelumnya.', 'A cast-out heir returns as a disciple of the weakest sect, carrying memories of his past life.', 300, 4.5, 66100, true),
  ('sekolah', 'Sekolah Malam', 'Lokal', 'Horor', array['Horor', 'Misteri'], 'Berjalan', 'Dewi Kirana · Studio Kertas', 'Studio Kertas', 'Kelas tambahan jam sembilan malam. Daftar absennya selalu bertambah satu nama.', 'Extra class at nine at night. The attendance list always has one more name.', 160, 4.6, 38800, true),
  ('pemburu', 'Pemburu Level Nol', 'Manhwa', 'Aksi', array['Aksi'], 'Berjalan', null, 'Hanul Media', null, null, 230, 4.4, 59400, true),
  ('surat', 'Surat untuk Hana', 'Manga', 'Romansa', array['Romansa'], 'Berjalan', null, 'Kumo Press', null, null, 350, 4.8, 22700, true),
  ('gerbang', 'Gerbang Naga Giok', 'Manhua', 'Wuxia', array['Wuxia'], 'Berjalan', null, 'Jade Lantern', null, null, 150, 4.3, 31500, true),
  ('ojek', 'Ojek Dimensi', 'Lokal', 'Komedi', array['Komedi'], 'Berjalan', null, 'Rumah Panel', null, null, 80, 4.7, 27900, true),
  ('mercusuar', 'Penjaga Mercusuar', 'Manga', 'Misteri', array['Misteri'], 'Berjalan', null, 'Kumo Press', null, null, 210, 4.6, 15200, true),
  ('istana', 'Istana Bayangan', 'Manhwa', 'Drama', array['Drama'], 'Tamat', null, 'Hanul Media', null, null, 280, 4.5, 33100, true),
  ('koki', 'Koki Sang Kaisar', 'Manhua', 'Komedi', array['Komedi'], 'Berjalan', null, 'Jade Lantern', null, null, 40, 4.4, 29800, true),
  ('finis', 'Garis Finis', 'Manga', 'Olahraga', array['Olahraga'], 'Berjalan', null, 'Kumo Press', null, null, 190, 4.7, 24600, true),
  ('kota', 'Kota Tanpa Hujan', 'Lokal', 'Sci-fi', array['Sci-fi'], 'Berjalan', null, 'Rumah Panel', null, null, 200, 4.9, 9800, true),
  ('menara', 'Pewaris Menara', 'Manhwa', 'Fantasi', array['Fantasi'], 'Berjalan', null, 'Hanul Media', null, null, 270, 4.3, 20400, true),
  ('lentera', 'Lentera Merah', 'Manhua', 'Romansa', array['Romansa'], 'Berjalan', null, 'Jade Lantern', null, null, 10, 4.5, 17300, true),
  ('arus', 'Arus Balik', 'Lokal', 'Drama', array['Drama'], 'Berjalan', null, 'Rumah Panel', null, null, 220, 4.6, 6100, true),
  ('bintang', 'Bintang Ruang Ganti', 'Manga', 'Olahraga', array['Olahraga'], 'Berjalan', null, 'Kumo Press', null, null, 100, 4.4, 4800, true)
on conflict (id) do nothing;
