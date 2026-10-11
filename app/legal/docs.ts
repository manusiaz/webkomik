export type DocKey = 'syarat' | 'privasi' | 'hakcipta'
export const ORDER: DocKey[] = ['syarat', 'privasi', 'hakcipta']

export const DOCS: Record<DocKey, { tab: string; title: string; intro: string; sections: [string, string[]][] }> = {
  syarat: { tab: 'Syarat Layanan', title: 'Syarat Layanan', intro: 'Dengan menggunakan nacp (situs, webapp, dan layanan terkait), kamu setuju dengan syarat berikut. Baca juga Kebijakan Privasi kami.', sections: [
    ['Akun', ['Kamu bisa membaca tanpa akun. Akun diperlukan untuk sinkron bookmark, riwayat, komentar, dan Premium. Kamu bertanggung jawab menjaga keamanan kata sandi.', 'Satu orang satu akun. Kami dapat menangguhkan akun yang dipakai untuk spam, penipuan, atau pelanggaran syarat ini.']],
    ['Konten dan lisensi', ['Semua komik di nacp dirilis atas izin publisher, studio, atau kreator. Hak cipta tetap milik pemegang hak masing-masing.', 'Kamu boleh membaca untuk keperluan pribadi. Kamu tidak boleh mengunduh massal, menyalin, mengunggah ulang, atau mendistribusikan halaman komik di luar fitur yang kami sediakan.']],
    ['Premium dan pembayaran', ['Premium adalah langganan berulang (Rp15.000/bulan, atau paket 3 dan 12 bulan) yang menghilangkan iklan, membuka early access, gambar HD, dan unduhan offline.', 'Langganan diperpanjang otomatis sampai dibatalkan. Pembatalan berlaku di akhir periode berjalan. Dana tidak dikembalikan untuk periode yang sudah berjalan, kecuali diwajibkan hukum.']],
    ['Iklan', ['Pengguna gratis melihat iklan dari jaringan pihak ketiga. Kami tidak bertanggung jawab atas isi situs yang dituju iklan; laporkan iklan yang menyesatkan lewat halaman kontak.']],
    ['Komentar dan perilaku', ['Dilarang: spoiler tanpa tanda, ujaran kebencian, pelecehan, promosi situs bajakan, dan spam. Komentar yang melanggar dapat dihapus dan akun dapat diblokir.']],
    ['Perubahan dan kontak', ['Kami dapat memperbarui syarat ini. Perubahan penting diumumkan di situs minimal 7 hari sebelum berlaku. Pertanyaan: halo@nacp.id.']],
  ] },
  privasi: { tab: 'Kebijakan Privasi', title: 'Kebijakan Privasi', intro: 'Halaman ini menjelaskan data apa yang kami kumpulkan, untuk apa, dan pilihan yang kamu punya. Disusun mengacu pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.', sections: [
    ['Data yang kami kumpulkan', ['Akun: email, username, dan kata sandi terenkripsi. Jika masuk dengan Google, kami menerima nama dan email.', 'Aktivitas baca: judul dan chapter yang dibuka, posisi halaman, bookmark, dan pengaturan baca, supaya bisa disinkronkan antar perangkat.', 'Teknis: alamat IP, jenis perangkat dan browser, serta log error untuk keamanan dan perbaikan layanan.']],
    ['Untuk apa data dipakai', ['Menjalankan fitur (sinkron, notifikasi, rekomendasi berdasarkan riwayat), memproses pembayaran Premium, mencegah penyalahgunaan, dan menghitung statistik pembaca untuk bagi hasil partner dalam bentuk agregat.']],
    ['Iklan dan cookie', ['Jaringan iklan (mis. Google AdSense, Monetag, Adsterra) dapat memakai cookie untuk menampilkan dan mengukur iklan. Kamu bisa menolak iklan personal lewat banner persetujuan; iklan tetap tampil tetapi tidak dipersonalisasi.', 'Pelanggan Premium tidak memuat script iklan.']],
    ['Berbagi data', ['Kami tidak menjual data pribadi. Data dibagikan hanya ke penyedia yang membantu menjalankan layanan (hosting, CDN, pembayaran, email) dengan perjanjian kerahasiaan, atau jika diwajibkan hukum.']],
    ['Hak kamu', ['Kamu dapat mengakses, memperbaiki, mengunduh, atau menghapus data akunmu dari halaman Profil atau lewat privasi@nacp.id. Permintaan diproses paling lama 3×24 jam kerja.', 'Riwayat baca bisa dihapus kapan saja dari halaman Riwayat.']],
    ['Penyimpanan dan keamanan', ['Data disimpan selama akun aktif. Akun yang dihapus dibersihkan dalam 30 hari, kecuali data transaksi yang wajib disimpan sesuai aturan perpajakan.']],
  ] },
  hakcipta: { tab: 'Laporan Hak Cipta', title: 'Laporan Hak Cipta', intro: 'nacp hanya menayangkan karya berlisensi. Jika kamu pemegang hak atau kuasanya dan menemukan konten di nacp yang dipakai tanpa izin, laporkan di sini. Kami juga menerima laporan situs lain yang mengambil konten partner nacp.', sections: [] },
}
