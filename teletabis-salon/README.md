# Teletabis Salon

## Menjalankan aplikasi dengan MySQL

1. Jalankan service **MySQL** dari Laragon.
2. Buka phpMyAdmin, pilih **Import**, lalu impor file `database.sql`. File ini membuat database `teletabis_salon`, tabel aplikasi, dua akun demo, dan 30 layanan awal.
3. Salin `.env.example` menjadi `.env`, lalu sesuaikan host, port, username, dan password MySQL dengan konfigurasi Laragon.
4. Dari folder proyek, jalankan `npm install`.
5. Terapkan skema stok secara aman dan aditif dengan `npm run db:migrate`.
6. Isi data barang dan relasi pemakaian layanan dengan `npm run db:seed`.
7. Jalankan `npm start`.
8. Buka http://localhost:3000.
cd C:\laragon\www\github\teletabis-salon\teletabis-salon

Jika mengubah `DB_NAME` di `.env`, samakan nama database dengan yang dibuat di phpMyAdmin. Jangan unggah atau bagikan `.env` maupun `.datakey`. `.datakey` dibuat otomatis saat server pertama kali dijalankan; simpan cadangannya dengan aman karena diperlukan untuk membaca nomor HP yang terenkripsi.

Akun demo setelah impor:

- Admin: `admin@teletabis.id` / `Admin#2026`
- Kasir: `kasir@teletabis.id` / `Kasir#2026`

Segera ganti password demo setelah login. Pembatasan jam login admin/kasir saat ini **dinonaktifkan**. Untuk mengaktifkannya kembali, atur `LOGIN_HOURS_ENABLED=1` di `.env` lalu restart server. Nilai `0` (default) menonaktifkannya; fungsi pemeriksaan jam tetap tersedia di server.

> Database SQLite lama (`salon.db`) tidak dihapus atau otomatis dipindahkan. Impor `database.sql` menyiapkan database MySQL baru; ekspor data SQLite lama secara terpisah sebelum beralih jika ada data yang ingin dipertahankan.

## Mengelola layanan dan foto

Admin dapat menambah atau mengedit layanan dari dashboard, termasuk harga reguler, harga diskon, durasi, dan foto. Harga diskon harus lebih kecil daripada harga reguler. Harga yang ditampilkan pada booking disimpan sebagai snapshot, sehingga perubahan harga berikutnya tidak mengubah booking lama. Penghapusan meminta password admin dan hanya menonaktifkan layanan.

Unggah foto JPG, PNG, atau WebP (maksimal 5 MB) langsung dari browser dashboard admin. Untuk layanan yang sudah ada, klik **Ganti foto** di baris layanan, pilih gambar dari perangkat, dan aplikasi otomatis menyimpan foto serta menghubungkannya ke database dan halaman website. Saat menambah/mengedit layanan, formulir juga menerima unggahan dan menampilkan pratinjau. Isi database menyimpan alamat foto, sedangkan berkas gambar disimpan di `public/images/services/`. Saat server mulai, foto lama yang nama filenya sama atau mirip dengan nama layanan akan dicocokkan dan alamatnya diperbaiki otomatis. Foto tampil dalam kartu dengan ukuran dan crop seragam.

Setiap layanan memiliki penjelasan yang disimpan di database, ditampilkan saat tombol **Lihat detail** dipilih, dan bisa diedit dari dashboard admin. Nama dan jabatan empat staf pada halaman Tentang Kami saat ini adalah contoh; sesuaikan dengan nama tim salon yang sebenarnya.

Foto suasana salon di halaman Tentang Kami berada di `public/images/salon/` sebagai `foto_salon_1.jpg`, `foto_salon_2.jpg`, dan `foto_salon_3.jpg`. Foto empat staf berada di `public/images/team/` sebagai `stafF-1.jpg` sampai `stafF-4.jpg`.

Konten halaman bisa diedit di `public/index.html`, `public/layanan.html`, `public/tentang-kami.html`, `public/login.html`, dan `public/dashboard.html`. `public/app.js` mengatur data dinamis dan interaksi form.

## Kategori admin dan stok barang

Dashboard admin menampilkan tiga kategori: **Stok Barang** membuka `/admin/inventory`, **Keamanan** memuat backup database, ganti password, audit trail, data pengguna, monitoring keamanan, dan kunci semua sesi, sedangkan **Kelola Layanan** berisi CRUD layanan. Daftar booking disembunyikan dari halaman admin; booking customer dan kasir tetap tersedia.

Jalankan `npm run db:migrate` setelah mengimpor database dan sebelum server pertama kali dijalankan; migrasi menambahkan tabel `inventory`, `service_materials`, `inventory_logs`, snapshot pemakaian booking, serta kolom `bookings.stok_dipotong` tanpa menghapus tabel stok lama. Setelah itu jalankan `npm run db:seed`. Seeder aman dijalankan ulang, membuat barang dengan stok 0, menetapkan ambang stok minimum, dan menghubungkan nama layanan yang cocok tanpa mengganti jumlah pemakaian yang sudah diubah admin. Layanan yang tidak cocok dicatat di log proses seed.

Admin dapat memfilter barang berdasarkan kategori atau nama, menambah/mengubah/menghapus barang, mengisi stok awal banyak barang, menambah stok, mengoreksi stok, dan melihat riwayat per barang. Barang yang masih digunakan oleh layanan tidak dapat dihapus. Mutasi stok dan pemakaian booking dicatat dengan saldo sebelum/sesudah, kasir/admin pencatat, serta nomor booking jika terkait. Di **Kelola Layanan**, admin dapat mengatur checklist barang dan jumlah pemakaian per booking.

Saat kasir mengubah booking ke **dikonfirmasi** atau langsung ke **selesai**, stok barang habis pakai dikurangi atomik; alat tidak dipotong. Stok yang tidak cukup membatalkan seluruh perubahan status dan menampilkan nama barang serta jumlah yang kurang. Status yang berubah bolak-balik tidak memotong stok dua kali, sedangkan pembatalan booking yang sudah memotong stok mengembalikan pemakaian yang tersimpan pada snapshot. Booking selesai tampil pada bagian **Booking Selesai** yang tertutup secara default.

## Fitur keamanan

- Peran customer/kasir/admin, token sesi per tab yang disimpan di `sessionStorage` (server hanya menyimpan hash token), CAPTCHA sekali pakai, dan penguncian akun setelah lima kegagalan login. Setiap tab dapat memakai akun/role berbeda tanpa logout dari tab lain. Pembatasan login admin/kasir pukul 09.00–21.00 WIB dapat diaktifkan melalui `LOGIN_HOURS_ENABLED=1`.
- Nomor HP dienkripsi AES-256-GCM; password di-hash bcrypt.
- Panic button admin mencabut semua sesi aktif.
- Watermark dashboard menampilkan identitas akun dan IP.
- Password baru harus memenuhi kebijakan kompleksitas dan tidak boleh sama dengan tiga password terakhir; password berusia lebih dari 90 hari ditandai.
- Audit log memiliki hash SHA-256 berantai, dapat diverifikasi dari dashboard, dan akses ditolak dicatat.
- Backup admin mencakup definisi tabel dan data MySQL, dengan checksum SHA-256 di folder `backups/`.
- Upload gambar dibatasi ukuran dan divalidasi berdasarkan signature berkas.

| Materi | Implementasi |
|---|---|
| Siklus hidup basis data | Skema MySQL/InnoDB di `database.sql`; backup dan checksum tersedia dari dashboard |
| RBAC dan autentikasi | Peran customer/kasir/admin, CAPTCHA, token sesi per tab, lockout, dan pembatasan jam login staf |
| Enkripsi dan integritas | AES-256-GCM untuk nomor HP, bcrypt untuk password, hash berantai SHA-256 untuk audit |
| Validasi dan keamanan web | Prepared statements, validasi input, Helmet, rate limit, dan validasi file upload |
| Relasi dan histori | Foreign key, indeks, serta snapshot harga pada setiap booking |
