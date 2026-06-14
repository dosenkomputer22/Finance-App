# Panduan Singkat Deployment Aplikasi Keuangan ke cPanel

Berikut adalah instruksi langkah-demi-langkah bagi Anda untuk mengupload, mengatur database, dan menjalankan aplikasi keuangan berbasis PHP Native ini di hosting cPanel standar milik Anda.

---

## Langkah 1: Persiapan Database di cPanel

1. **Masuk ke cPanel** menggunakan akun hosting Anda.
2. Cari dan klik menu **MySQL Database Wizard** (rekomendasi untuk pemula) atau **MySQL Databases**.
3. **Buat Database Baru**:
   - Ketikkan nama database, contoh: `keuangan_db` atau `namauser_keuangan`.
   - Simpan nama lengkap database ini karena cPanel biasanya menambahkan prefix nama pengguna Anda (cth: `u1234567_keuangan_db`). Klik **Next Step**.
4. **Buat User Database**:
   - Ketikkan nama user baru, contoh: `keuangan_user` (akan menjadi `u1234567_keuangan_user`).
   - Buat/generate password yang kuat. **Catat nama user dan password ini baik-baik!**
   - Klik **Create User**.
5. **Hubungkan User ke Database**:
   - Centang opsi **ALL PRIVILEGES** untuk memberikan akses penuh kepada user tersebut atas database.
   - Klik **Make Changes** atau **Next Step**.

---

## Langkah 2: Import Tabel Struktur SQL lewat phpMyAdmin

1. Pada halaman utama cPanel, hubungi menu bernama **phpMyAdmin**.
2. Di sidebar sisi kiri, klik nama database Anda yang baru saja dibuat di Langkah 1.
3. Klik tab menu **Import** di bagian atas halaman.
4. Pada kolom "File to import", klik **Choose File** (Pilih File) dan pilih berkas `db.sql` yang ada dalam folder unduhan ini.
5. Gulir ke bawah dan klik tombol **Go** atau **Import** di kanan bawah.
6. Tunggu hingga muncul pesan hijau sukses ("Import has been successfully finished..."). Tabel `transaksi` kini telah selesai dibuat beserta data percontohan!

---

## Langkah 3: Konfigurasi File Koneksi di `koneksi.php`

Sebelum atau setelah mengunggah, Anda harus menyunting file koneksi database:

1. Buka file `koneksi.php`.
2. Ubah baris data konfigurasi dengan kesesuaian dari cPanel Anda di Langkah 1:
   ```php
   $db_host = "localhost";        // Biarkan tetap localhost
   $db_user = "u1234567_userdb";  // Username MySQL dari Langkah 1
   $db_pass = "password_anda";    // Password MySQL dari Langkah 1
   $db_name = "u1234567_namedb";  // Nama Database dari Langkah 1
   ```
3. Simpan perubahan file tersebut.

---

## Langkah 4: Upload File ke File Manager cPanel

1. Di beranda cPanel, klik menu **File Manager**.
2. Masuklah ke dalam direktori/folder bernama **public_html** (ini adalah folder publik tempat website Anda diakses).
3. Unggah seluruh file PHP berikut langsung ke dalam `public_html`:
   - `index.php`
   - `login.php`
   - `logout.php`
   - `tambah.php`
   - `edit.php`
   - `hapus.php`
   - `koneksi.php`
4. *Tips:* Untuk mempercepat proses, Anda dapat meng-compress seluruh file di atas menjadi satu file `.zip`, unggah file ZIP tersebut via File Manager, lalu klik kanan file ZIP tersebut di File Manager cPanel dan pilih **Extract**.

---

## Langkah 5: Selesai! Uji Coba Aplikasi

Aplikasi Anda kini sudah siap dijalankan! Buka browser Anda dan akses domain website Anda:
- `http://nama-domain-anda.com/` (jika di-upload langsung di folder utama `public_html`)
- Atau `http://nama-domain-anda.com/keuangan/` (jika di-upload ke dalam subfolder baru bernama `keuangan` di dalam `public_html`).