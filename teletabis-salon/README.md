# Teletabis Salon

## Menjalankan aplikasi dengan MySQL

1. Jalankan service **MySQL** dari Laragon.
2. Buka phpMyAdmin, pilih **Import**, lalu impor file `database.sql`. File ini membuat database `teletabis_salon`, tabel aplikasi, dua akun demo, dan 30 layanan awal.
3. Salin `.env.example` menjadi `.env`, lalu sesuaikan host, port, username, dan password MySQL dengan konfigurasi Laragon.
4. Dari folder proyek, jalankan `npm install`, lalu `npm start`.
5. Buka http://localhost:3000.

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

## Fitur keamanan

- Peran customer/kasir/admin, sesi cookie `httpOnly`, CAPTCHA sekali pakai, dan penguncian akun setelah lima kegagalan login. Pembatasan login admin/kasir pukul 09.00–21.00 WIB dapat diaktifkan melalui `LOGIN_HOURS_ENABLED=1`.
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
| RBAC dan autentikasi | Peran customer/kasir/admin, CAPTCHA, sesi cookie, lockout, dan pembatasan jam login staf |
| Enkripsi dan integritas | AES-256-GCM untuk nomor HP, bcrypt untuk password, hash berantai SHA-256 untuk audit |
| Validasi dan keamanan web | Prepared statements, validasi input, Helmet, rate limit, dan validasi file upload |
| Relasi dan histori | Foreign key, indeks, serta snapshot harga pada setiap booking |
