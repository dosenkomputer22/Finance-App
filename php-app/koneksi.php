<?php
// koneksi.php
// Konfigurasi koneksi database untuk cPanel / Shared Hosting maupun Localhost
// Dilengkapi dengan sistem Auto-Installer pintar untuk uji coba lokal (XAMPP / Laragon)

$db_host = "localhost";
$db_user = "root";       // Default XAMPP: root
$db_pass = "";           // Default XAMPP: kosong ""
$db_name = "keuangan_db";

// Nonaktifkan mysqli reporting exception default agar kita bisa handle error secara visual & elegan
mysqli_report(MYSQLI_REPORT_OFF);

// Mencoba koneksi ke server MySQL tanpa memilih database terlebih dahulu
$koneksi = @mysqli_connect($db_host, $db_user, $db_pass);

if (!$koneksi) {
    // Jika koneksi ke server MySQL gagal (misal XAMPP belum aktif)
    $error_detail = mysqli_connect_error();
    die('
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 60px auto; padding: 30px; border-radius: 16px; background-color: #fef2f2; border: 1px solid #fca5a5; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background-color: #fee2e2; padding: 10px; border-radius: 50%; margin-right: 15px; color: #ef4444;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h2 style="color: #991b1b; margin: 0; font-weight: 700; font-size: 22px;">Gagal Menghubungi Server MySQL!</h2>
        </div>
        
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Aplikasi <strong>KeuanganKu</strong> tidak dapat terhubung ke server database MySQL Anda menggunakan kredensial di <code>koneksi.php</code>.
        </p>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #f3f4f6; font-family: monospace; font-size: 13.5px; color: #b91c1c; margin-bottom: 25px;">
            <strong>Detail Masalah:</strong> ' . htmlspecialchars($error_detail) . '
        </div>
        
        <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;">Langkah Solusi untuk XAMPP:</h3>
        <ol style="color: #4b5563; font-size: 14.5px; line-height: 1.6; padding-left: 20px; margin-bottom: 25px;">
            <li style="margin-bottom: 8px;">Pastikan aplikasi <strong>XAMPP Control Panel</strong> Anda sudah dibuka.</li>
            <li style="margin-bottom: 8px;">Klik tombol <strong>Start</strong> di samping modul <strong>Apache</strong> dan <strong>MySQL</strong> hingga berwarna hijau.</li>
            <li style="margin-bottom: 8px;">Buka file <code>koneksi.php</code> dan pastikan kredensial di bawah sudah cocok:
                <ul style="padding-left: 20px; margin-top: 5px; list-style-type: circle;">
                    <li><code>$db_host = "' . htmlspecialchars($db_host) . '";</code></li>
                    <li><code>$db_user = "' . htmlspecialchars($db_user) . '";</code></li>
                    <li><code>$db_pass = "' . htmlspecialchars($db_pass) . '";</code></li>
                </ul>
            </li>
        </ol>
        
        <button onclick="window.location.reload()" style="background-color: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">
            Segarkan Halaman & Hubungkan Kembali
        </button>
    </div>');
}

// Atur Charset Koneksi ke UTF-8
mysqli_set_charset($koneksi, "utf8mb4");

// Coba pilih database. Jika belum ada, lakukan Auto-Installation database & tabel pintar
$db_check = @mysqli_select_db($koneksi, $db_name);

if (!$db_check) {
    // Database tidak ditemukan! Kita coba buat secara otomatis agar mempermudah pengguna XAMPP
    $sql_create_db = "CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
    
    if (@mysqli_query($koneksi, $sql_create_db)) {
        // Berhasil membuat database baru! Sekarang hubungkan ke database tersebut
        mysqli_select_db($koneksi, $db_name);
    } else {
        // Gagal membuat database otomatis karena hak akses dibatasi (misal di cPanel Shared Hosting)
        die("
        <div style='font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 60px auto; padding: 30px; border-radius: 16px; background-color: #fffbeb; border: 1px solid #fcd34d; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);'>
            <div style='display: flex; align-items: center; margin-bottom: 20px;'>
                <div style='background-color: #fef3c7; padding: 10px; border-radius: 50%; margin-right: 15px; color: #d97706;'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><line x1='12' y1='8' x2='12' y2='12'></line><line x1='12' y1='16' x2='12.01' y2='16'></line></svg>
                </div>
                <h2 style='color: #92400e; margin: 0; font-weight: 700; font-size: 22px;'>Database '$db_name' Belum Ada!</h2>
            </div>
            
            <p style='color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;'>
                Database dengan nama <strong>$db_name</strong> tidak ditemukan pada server lokal/hosting Anda dan hak akses database Anda membatasi pembuatan otomatis.
            </p>
            
            <h3 style='color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;'>Tuntunan Import Manual lewat phpMyAdmin:</h3>
            <ol style='color: #4b5563; font-size: 14.5px; line-height: 1.6; padding-left: 20px; margin-bottom: 25px;'>
                <li style='margin-bottom: 8px;'>Buka browser dan arahkan ke alamat <strong><a href='http://localhost/phpmyadmin/' target='_blank' style='color: #d97706; text-decoration: underline;'>http://localhost/phpmyadmin/</a></strong>.</li>
                <li style='margin-bottom: 8px;'>Buat database baru dengan mengklik menu <strong>Baru / New</strong> di sisi kiri lalu beri nama persis: <strong>$db_name</strong>.</li>
                <li style='margin-bottom: 8px;'>Pilih database <strong>$db_name</strong> tersebut, lalu masuk ke menu tab <strong>Import</strong> di bagian atas.</li>
                <li style='margin-bottom: 8px;'>Pilih file database <strong>db.sql</strong> yang ada dalam folder projek Anda, lalu tekan tombol <strong>Kirim / Go / Import</strong> di bagian bawah.</li>
            </ol>
            
            <button onclick='window.location.reload()' style='background-color: #d97706; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s;'>
                Saya Sudah Import SQL, Hubungkan Kembali
            </button>
        </div>");
    }
}

// Setelah database dipilih, pastikan tabel-tabel utama sudah ada atau di-install secara otomatis
$table_check_users = @mysqli_query($koneksi, "SELECT 1 FROM `users` LIMIT 1");
if (!$table_check_users) {
    // 1. Buat Tabel Users
    $sql_table_users = "CREATE TABLE IF NOT EXISTS `users` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `username` VARCHAR(50) NOT NULL UNIQUE,
      `password` VARCHAR(255) NOT NULL,
      `nama` VARCHAR(100) NOT NULL,
      `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
      `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_users);

    // 2. Isi Akun Default (Password: admin123)
    $hashed_pw = password_hash('admin123', PASSWORD_DEFAULT);
    $sql_insert_users = "INSERT INTO `users` (`id`, `username`, `password`, `nama`, `role`, `status`) VALUES
    (1, 'admin', '$hashed_pw', 'Administrator Keuangan', 'superadmin', 'approved'),
    (2, 'budi', '$hashed_pw', 'Budi Santoso', 'admin', 'approved')
    ON DUPLICATE KEY UPDATE id=id;";
    @mysqli_query($koneksi, $sql_insert_users);
} else {
    // Jalankan auto-migration: pastikan kolom 'status' ada di tabel users
    $status_col_check = @mysqli_query($koneksi, "SHOW COLUMNS FROM `users` LIKE 'status'");
    if ($status_col_check && mysqli_num_rows($status_col_check) == 0) {
        @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'pending'");
        // Ubah akun default yang sudah ada menjadi approved agar tidak terkunci
        @mysqli_query($koneksi, "UPDATE `users` SET `status` = 'approved' WHERE username IN ('admin', 'budi')");
    }
}

$table_check_transaksi = @mysqli_query($koneksi, "SELECT 1 FROM `transaksi` LIMIT 1");
if (!$table_check_transaksi) {
    // 3. Buat Tabel Transaksi
    $sql_table_transaksi = "CREATE TABLE IF NOT EXISTS `transaksi` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `tanggal` DATE NOT NULL,
      `keterangan` VARCHAR(255) NOT NULL,
      `kategori` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
      `jenis` ENUM('pemasukan','pengeluaran') NOT NULL,
      `jumlah` INT(11) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_transaksi);

    // 4. Isi Data Transaksi Bawaan
    $sql_insert_dummy_transaksi = "INSERT INTO `transaksi` (`id`, `tanggal`, `keterangan`, `kategori`, `jenis`, `jumlah`) VALUES
    (1, '2026-06-01', 'Gaji Bulanan Utama', 'Gaji', 'pemasukan', 5000000),
    (2, '2026-06-02', 'Membeli Hosting & Domain CPanel', 'Tagihan', 'pengeluaran', 250000),
    (3, '2026-06-03', 'Projek Pembuatan Jasa Website UMKM', 'Freelance', 'pemasukan', 1750000),
    (4, '2026-06-05', 'Membayar Tagihan Listrik Bulanan', 'Tagihan', 'pengeluaran', 190000),
    (5, '2026-06-06', 'Membeli Buku Panduan Pemrograman PHP', 'Belanja', 'pengeluaran', 95000),
    (6, '2026-06-08', 'Menerima Komisi Afiliasi Landing Page', 'Freelance', 'pemasukan', 600000)
    ON DUPLICATE KEY UPDATE id=id;";
    @mysqli_query($koneksi, $sql_insert_dummy_transaksi);
}

// 5. Pastikan kolom theme ada di tabel users (untuk mendukung fitur ubah tema kustom)
$col_check_theme = @mysqli_query($koneksi, "SHOW COLUMNS FROM `users` LIKE 'theme'");
if ($col_check_theme && mysqli_num_rows($col_check_theme) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `theme` VARCHAR(30) NOT NULL DEFAULT 'slate'");
}

// Tambahkan kolom pengaturan tampil/sembunyi komponen dashboard jika belum ada
$col_check_dashboard = @mysqli_query($koneksi, "SHOW COLUMNS FROM `users` LIKE 'show_card_in'");
if ($col_check_dashboard && mysqli_num_rows($col_check_dashboard) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_card_in` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_card_out` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_card_balance` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_chart_trend` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_chart_prop` INT(1) NOT NULL DEFAULT 1");
}

// 6. Pastikan tabel kategori transaksi ada
$table_check_kategori = @mysqli_query($koneksi, "SELECT 1 FROM `kategori` LIMIT 1");
if (!$table_check_kategori) {
    $sql_table_kategori = "CREATE TABLE IF NOT EXISTS `kategori` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `nama` VARCHAR(100) NOT NULL UNIQUE,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_kategori);

    // Isi Default Kategori
    $sql_insert_default_kategori = "INSERT INTO `kategori` (`nama`) VALUES
    ('Gaji'),
    ('Belanja'),
    ('Transportasi'),
    ('Makan & Minum'),
    ('Tagihan'),
    ('Freelance'),
    ('Lainnya')
    ON DUPLICATE KEY UPDATE nama=nama;";
    @mysqli_query($koneksi, $sql_insert_default_kategori);
}
?>
