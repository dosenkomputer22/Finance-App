// php-templates.ts
// Dynamic PHP template engine to generate custom and clean source codes

import { DbConfig } from './types';

export function getKoneksiCode(config: DbConfig): string {
  const dbName = config.name || 'keuangan_db';
  return `<?php
// koneksi.php
// Konfigurasi koneksi database untuk cPanel / Shared Hosting maupun Localhost
// Dilengkapi dengan sistem Auto-Installer pintar untuk uji coba lokal (XAMPP / Laragon)

$db_host = "${config.host || 'localhost'}";
$db_user = "${config.user || 'root'}";       // Default XAMPP: root
$db_pass = "${config.pass || ''}";           // Default XAMPP: kosong ""
$db_name = "${dbName}";

// Nonaktifkan mysqli reporting exception default agar kita bisa handle error secara visual & elegan
mysqli_report(MYSQLI_REPORT_OFF);

// Mencoba koneksi ke server MySQL tanpa memilih database terlebih dahulu
$koneksi = @mysqli_connect($db_host, $db_user, $db_pass);

if (!$koneksi) {
    // Jika koneksi ke server MySQL gagal (misal XAMPP belum aktif)
    \$error_detail = mysqli_connect_error();
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
            <strong>Detail Masalah:</strong> \' . htmlspecialchars(\$error_detail) . \'
        </div>
        
        <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;">Langkah Solusi untuk XAMPP:</h3>
        <ol style="color: #4b5563; font-size: 14.5px; line-height: 1.6; padding-left: 20px; margin-bottom: 25px;">
            <li style="margin-bottom: 8px;">Pastikan aplikasi <strong>XAMPP Control Panel</strong> Anda sudah dibuka.</li>
            <li style="margin-bottom: 8px;">Klik tombol <strong>Start</strong> di samping modul <strong>Apache</strong> dan <strong>MySQL</strong> hingga berwarna hijau.</li>
            <li style="margin-bottom: 8px;">Buka file <code>koneksi.php</code> dan pastikan kredensial di bawah sudah cocok:
                <ul style="padding-left: 20px; margin-top: 5px; list-style-type: circle;">
                    <li><code>\$db_host = "\' . htmlspecialchars(\$db_host) . \'";</code></li>
                    <li><code>\$db_user = "\' . htmlspecialchars(\$db_user) . \'";</code></li>
                    <li><code>\$db_pass = "\' . htmlspecialchars(\$db_pass) . \'";</code></li>
                </ul>
            </li>
        </ol>
        
        <button onclick="window.location.reload()" style="background-color: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">
            Segarkan Halaman & Hubungkan Kembali
        </button>
    </div>\');
}

// Atur Charset Koneksi ke UTF-8
mysqli_set_charset($koneksi, "utf8mb4");

// Coba pilih database. Jika belum ada, lakukan Auto-Installation database & tabel pintar
$db_check = @mysqli_select_db($koneksi, $db_name);

if (!$db_check) {
    // Database tidak ditemukan! Kita coba buat secara otomatis agar mempermudah pengguna XAMPP
    $sql_create_db = "CREATE DATABASE IF NOT EXISTS \`$db_name\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
    
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
$table_check_users = @mysqli_query($koneksi, "SELECT 1 FROM \`users\` LIMIT 1");
if (!$table_check_users) {
    // 1. Buat Tabel Users
    $sql_table_users = "CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`username\` VARCHAR(50) NOT NULL UNIQUE,
      \`password\` VARCHAR(255) NOT NULL,
      \`nama\` VARCHAR(100) NOT NULL,
      \`role\` VARCHAR(20) NOT NULL DEFAULT 'admin',
      \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending',
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_users);

    // 2. Isi Akun Default (Password: admin123)
    $hashed_pw = password_hash('admin123', PASSWORD_DEFAULT);
    $sql_insert_users = "INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`nama\`, \`role\`, \`status\`) VALUES
    (1, 'admin', '$hashed_pw', 'Administrator Keuangan', 'superadmin', 'approved'),
    (2, 'budi', '$hashed_pw', 'Budi Santoso', 'admin', 'approved')
    ON DUPLICATE KEY UPDATE id=id;";
    @mysqli_query($koneksi, $sql_insert_users);
} else {
    // Jalankan auto-migration: pastikan kolom 'status' ada di tabel users
    $status_col_check = @mysqli_query($koneksi, "SHOW COLUMNS FROM \`users\` LIKE 'status'");
    if ($status_col_check && mysqli_num_rows($status_col_check) == 0) {
        @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending'");
        @mysqli_query($koneksi, "UPDATE \`users\` SET \`status\` = 'approved' WHERE username IN ('admin', 'budi')");
    }
}

$table_check_transaksi = @mysqli_query($koneksi, "SELECT 1 FROM \`transaksi\` LIMIT 1");
if (!$table_check_transaksi) {
    // 3. Buat Tabel Transaksi
    $sql_table_transaksi = "CREATE TABLE IF NOT EXISTS \`transaksi\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`tanggal\` DATE NOT NULL,
      \`keterangan\` VARCHAR(255) NOT NULL,
      \`kategori\` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
      \`jenis\` ENUM('pemasukan','pengeluaran') NOT NULL,
      \`jumlah\` INT(11) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_transaksi);

    // 4. Isi Data Transaksi Bawaan
    $sql_insert_dummy_transaksi = "INSERT INTO \`transaksi\` (\`id\`, \`tanggal\`, \`keterangan\`, \`kategori\`, \`jenis\`, \`jumlah\`) VALUES
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
$col_check_theme = @mysqli_query($koneksi, "SHOW COLUMNS FROM \`users\` LIKE 'theme'");
if ($col_check_theme && mysqli_num_rows($col_check_theme) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`theme\` VARCHAR(30) NOT NULL DEFAULT 'slate'");
}

// 5b. Pastikan kolom konfigurasi dashboard ada di tabel users
$col_check_dashboard = @mysqli_query($koneksi, "SHOW COLUMNS FROM \`users\` LIKE 'show_card_in'");
if ($col_check_dashboard && mysqli_num_rows($col_check_dashboard) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_card_in\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_card_out\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_card_balance\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_chart_trend\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_chart_prop\` INT(1) NOT NULL DEFAULT 1");
}

// 6. Pastikan tabel kategori transaksi ada
$table_check_kategori = @mysqli_query($koneksi, "SELECT 1 FROM \`kategori\` LIMIT 1");
if (!$table_check_kategori) {
    $sql_table_kategori = "CREATE TABLE IF NOT EXISTS \`kategori\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`nama\` VARCHAR(100) NOT NULL UNIQUE,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_kategori);

    // Isi Default Kategori
    $sql_insert_default_kategori = "INSERT INTO \`kategori\` (\`nama\`) VALUES
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
?>`;
}

export function getSqlSchema(config: DbConfig): string {
  const dbName = config.name || 'keuangan_db';
  return `-- db.sql
-- Script SQL Pembuatan Database, Tabel Pengguna (Login) & Tabel Transaksi Keuangan

-- Buat database jika dijalankan di localhost (Di cPanel biasanya database dibuat manual lewat menu 'MySQL Database Wizard' lalu jalankan script ini)
CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE \`${dbName}\`;

-- Struktur Tabel users untuk Pengamanan Login
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama\` VARCHAR(100) NOT NULL,
  \`role\` VARCHAR(20) NOT NULL DEFAULT 'admin',
  \`theme\` VARCHAR(30) NOT NULL DEFAULT 'slate',
  \`show_card_in\` INT(1) NOT NULL DEFAULT 1,
  \`show_card_out\` INT(1) NOT NULL DEFAULT 1,
  \`show_card_balance\` INT(1) NOT NULL DEFAULT 1,
  \`show_chart_trend\` INT(1) NOT NULL DEFAULT 1,
  \`show_chart_prop\` INT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Akun Default (username: admin -> Super Admin, username: budi -> Admin)
-- Password default adalah admin123 (telah di-hash menggunakan bcrypt password_hash())
INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`nama\`, \`role\`, \`theme\`, \`show_card_in\`, \`show_card_out\`, \`show_card_balance\`, \`show_chart_trend\`, \`show_chart_prop\`) VALUES
(1, 'admin', '$2y$10$vO.mXpX2xR10.C8UfPyX8.1X7N.TfKIdwN9YhEqO5C7h3ZHe.7S.e', 'Administrator Keuangan', 'superadmin', 'slate', 1, 1, 1, 1, 1),
(2, 'budi', '$2y$10$vO.mXpX2xR10.C8UfPyX8.1X7N.TfKIdwN9YhEqO5C7h3ZHe.7S.e', 'Budi Santoso', 'admin', 'slate', 1, 1, 1, 1, 1)
ON DUPLICATE KEY UPDATE id=id;

-- Struktur Tabel Kategori Transaksi
CREATE TABLE IF NOT EXISTS \`kategori\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Isi Default Kategori
INSERT INTO \`kategori\` (\`id\`, \`nama\`) VALUES
(1, 'Gaji'),
(2, 'Belanja'),
(3, 'Transportasi'),
(4, 'Makan & Minum'),
(5, 'Tagihan'),
(6, 'Freelance'),
(7, 'Lainnya')
ON DUPLICATE KEY UPDATE nama=nama;

-- Struktur Tabel transaksi
CREATE TABLE IF NOT EXISTS \`transaksi\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`tanggal\` DATE NOT NULL,
  \`keterangan\` VARCHAR(255) NOT NULL,
  \`kategori\` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
  \`jenis\` ENUM('pemasukan','pengeluaran') NOT NULL,
  \`jumlah\` INT(11) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Dummy Awal
INSERT INTO \`transaksi\` (\`id\`, \`tanggal\`, \`keterangan\`, \`kategori\`, \`jenis\`, \`jumlah\`, \`username\`) VALUES
(1, '2026-06-01', 'Gaji Bulanan Utama', 'Gaji', 'pemasukan', 5000000, 'admin'),
(2, '2026-06-02', 'Membeli Hosting & Domain CPanel', 'Tagihan', 'pengeluaran', 250000, 'admin'),
(3, '2026-06-03', 'Projek Pembuatan Jasa Website UMKM', 'Freelance', 'pemasukan', 1750000, 'admin'),
(4, '2026-06-05', 'Membayar Tagihan Listrik Bulanan', 'Tagihan', 'pengeluaran', 190000, 'admin'),
(5, '2026-06-06', 'Membeli Buku Panduan Pemrograman PHP', 'Belanja', 'pengeluaran', 95000, 'admin'),
(6, '2026-06-08', 'Menerima Komisi Afiliasi Landing Page', 'Freelance', 'pemasukan', 600000, 'admin')
ON DUPLICATE KEY UPDATE id=id;
`;
}

export const INDEX_PHP = `<?php
// index.php
// Halaman dashboard utama dengan proteksi session login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Fungsi Helper format mata uang Rupiah
function rupiah($angka) {
    return "Rp " . number_format($angka, 0, ',', '.');
}

$user_role = $_SESSION['role'] ?? 'admin';
$user_username = $_SESSION['username'] ?? 'user';

// Ambil kustomisasi dashboard saat ini milik pengguna ini
$show_card_in = 1;
$show_card_out = 1;
$show_card_balance = 1;
$show_chart_trend = 1;
$show_chart_prop = 1;

if (isset($koneksi)) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $config_query = mysqli_query($koneksi, "SELECT show_card_in, show_card_out, show_card_balance, show_chart_trend, show_chart_prop FROM users WHERE username = '$db_username_escaped'");
    if ($config_query && mysqli_num_rows($config_query) > 0) {
        $config_row = mysqli_fetch_assoc($config_query);
        $show_card_in = isset($config_row['show_card_in']) ? (int)$config_row['show_card_in'] : 1;
        $show_card_out = isset($config_row['show_card_out']) ? (int)$config_row['show_card_out'] : 1;
        $show_card_balance = isset($config_row['show_card_balance']) ? (int)$config_row['show_card_balance'] : 1;
        $show_chart_trend = isset($config_row['show_chart_trend']) ? (int)$config_row['show_chart_trend'] : 1;
        $show_chart_prop = isset($config_row['show_chart_prop']) ? (int)$config_row['show_chart_prop'] : 1;
    }
}

// 1. Ambil & hitung total pemasukan
if ($user_role === 'user') {
    $query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'";
} else {
    $query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan'";
}
$res_pemasukan = mysqli_query($koneksi, $query_pemasukan);
$row_pemasukan = mysqli_fetch_assoc($res_pemasukan);
$total_pemasukan = $row_pemasukan['total'] ?? 0;

// 2. Ambil & hitung total pengeluaran
if ($user_role === 'user') {
    $query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'";
} else {
    $query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran'";
}
$res_pengeluaran = mysqli_query($koneksi, $query_pengeluaran);
$row_pengeluaran = mysqli_fetch_assoc($res_pengeluaran);
$total_pengeluaran = $row_pengeluaran['total'] ?? 0;

// 3. Hitung saldo akhir otomatis secara aman
$saldo_akhir = $total_pemasukan - $total_pengeluaran;

// 4. Ambil daftar transaksi dari database diurutkan dari tanggal terbaru
if ($user_role === 'user') {
    $query_transaksi = "SELECT * FROM transaksi WHERE username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ORDER BY tanggal DESC, id DESC";
} else {
    $query_transaksi = "SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC";
}
$result_transaksi = mysqli_query($koneksi, $query_transaksi);

// 5. Ambil data tren harian untuk grafik
$chart_dates = [];
$chart_pemasukan = [];
$chart_pengeluaran = [];

$query_chart = "SELECT tanggal, 
                SUM(CASE WHEN jenis='pemasukan' THEN jumlah ELSE 0 END) as total_masuk,
                SUM(CASE WHEN jenis='pengeluaran' THEN jumlah ELSE 0 END) as total_keluar
                FROM transaksi ";
if ($user_role === 'user') {
    $query_chart .= "WHERE username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ";
}
$query_chart .= "GROUP BY tanggal ORDER BY tanggal ASC LIMIT 10";

$res_chart = mysqli_query($koneksi, $query_chart);
if ($res_chart && mysqli_num_rows($res_chart) > 0) {
    while ($row = mysqli_fetch_assoc($res_chart)) {
        $chart_dates[] = date('d M', strtotime($row['tanggal']));
        $chart_pemasukan[] = (int)$row['total_masuk'];
        $chart_pengeluaran[] = (int)$row['total_keluar'];
    }
} else {
    // Fallback data jika kosong
    for ($i = 5; $i >= 0; $i--) {
        $chart_dates[] = date('d M', strtotime("-$i days"));
        $chart_pemasukan[] = 0;
        $chart_pengeluaran[] = 0;
    }
}

// 6. Ambil data kategori untuk grafik donat distribusi
$category_labels = [];
$category_totals = [];
$query_cat_chart = "SELECT kategori, SUM(jumlah) as total FROM transaksi ";
if ($user_role === 'user') {
    $query_cat_chart .= "WHERE username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ";
}
$query_cat_chart .= "GROUP BY kategori ORDER BY total DESC LIMIT 5";
$res_cat_chart = mysqli_query($koneksi, $query_cat_chart);
if ($res_cat_chart && mysqli_num_rows($res_cat_chart) > 0) {
    while ($row = mysqli_fetch_assoc($res_cat_chart)) {
        $category_labels[] = $row['kategori'];
        $category_totals[] = (int)$row['total'];
    }
} else {
    $category_labels = ['Umum'];
    $category_totals = [0];
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeuanganKu - Dashboard Keuangan</title>
    <!-- Google Fonts Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.04), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
            background: #ffffff;
            border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .v-card-sum {
            border: none;
            border-radius: 20px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.03), 0 2px 4px -2px rgba(15, 23, 42, 0.03);
            border: 1px solid rgba(226, 232, 240, 0.8);
            position: relative;
            overflow: hidden;
        }
        .v-card-sum:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.08);
        }
        .bg-pemasukan {
            background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%) !important;
            border-left: 6px solid #10b981;
        }
        .bg-pengeluaran {
            background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%) !important;
            border-left: 6px solid #ef4444;
        }
        .bg-saldo-surplus {
            background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%) !important;
            border-left: 6px solid #2563eb;
        }
        .bg-saldo-defisit {
            background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%) !important;
            border-left: 6px solid #f59e0b;
        }
        .text-pemasukan {
            color: #10b981 !important;
        }
        .text-pengeluaran {
            color: #ef4444 !important;
        }
        .card-icon-wrapper {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            transition: all 0.3s ease;
        }
        .v-card-sum:hover .card-icon-wrapper {
            transform: scale(1.1) rotate(6deg);
        }
        .icon-pemasukan {
            background-color: rgba(16, 185, 129, 0.12);
            color: #10b981;
        }
        .icon-pengeluaran {
            background-color: rgba(239, 68, 68, 0.12);
            color: #ef4444;
        }
        .icon-saldo-surplus {
            background-color: rgba(37, 99, 235, 0.12);
            color: #2563eb;
        }
        .icon-saldo-defisit {
            background-color: rgba(245, 158, 11, 0.12);
            color: #f59e0b;
        }
        .btn-add {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: #ffffff;
            border: none;
            font-weight: 600;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
            transition: all 0.2s ease;
        }
        .btn-add:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
            transform: translateY(-1px);
            color: #ffffff;
        }
        .badge-pemasukan {
            background-color: rgba(16, 185, 129, 0.08);
            color: #065f46;
            border: 1px solid rgba(16, 185, 129, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
        .badge-pengeluaran {
            background-color: rgba(239, 68, 68, 0.08);
            color: #991b1b;
            border: 1px solid rgba(239, 68, 68, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
        .badge-kategori {
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
    </style>
</head>
<body>

<?php
$active_page = 'dashboard';
include 'sidebar.php';
?>
<div class="container-fluid py-2">
    
    <!-- Notifikasi Error/Gagal dari Aksi Halaman Lain -->
    <?php if (isset($_GET['err'])): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 shadow-xs p-3.5 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
            <div>
                <strong class="text-danger d-block">Akses Terbatasi!</strong>
                <span class="small text-slate-700"><?= htmlspecialchars($_GET['err']); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <!-- Bagian Ringkasan Anggaran Premium -->
    <?php 
    $visible_cards_count = $show_card_in + $show_card_out + $show_card_balance;
    $card_col = 12;
    if ($visible_cards_count == 3) {
        $card_col = 4;
    } elseif ($visible_cards_count == 2) {
        $card_col = 6;
    }
    if ($visible_cards_count > 0): 
    ?>
    <div class="row g-4 mb-4">
        
        <!-- Pemasukan -->
        <?php if ($show_card_in): ?>
        <div class="col-md-<?= $card_col; ?>">
            <div class="card v-card-sum bg-pemasukan h-100 p-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-uppercase small fw-extrabold text-muted d-block mb-1.5" style="font-size: 0.72rem; letter-spacing: 0.05em;">Total Pemasukan</span>
                            <span class="fs-3 fw-bold text-pemasukan"><?= rupiah($total_pemasukan); ?></span>
                        </div>
                        <div class="card-icon-wrapper icon-pemasukan">
                            <i class="bi bi-graph-up-arrow fs-5"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Pengeluaran -->
        <?php if ($show_card_out): ?>
        <div class="col-md-<?= $card_col; ?>">
            <div class="card v-card-sum bg-pengeluaran h-100 p-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-uppercase small fw-extrabold text-muted d-block mb-1.5" style="font-size: 0.72rem; letter-spacing: 0.05em;">Total Pengeluaran</span>
                            <span class="fs-3 fw-bold text-pengeluaran"><?= rupiah($total_pengeluaran); ?></span>
                        </div>
                        <div class="card-icon-wrapper icon-pengeluaran">
                            <i class="bi bi-graph-down-arrow fs-5"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Saldo Akhir -->
        <?php if ($show_card_balance): ?>
        <div class="col-md-<?= $card_col; ?>">
            <?php 
            $is_surplus = $saldo_akhir >= 0;
            $bg_saldo_style = $is_surplus ? 'bg-saldo-surplus' : 'bg-saldo-defisit';
            $text_saldo_style = $is_surplus ? 'text-primary' : 'text-warning';
            $icon_wrapper_style = $is_surplus ? 'icon-saldo-surplus' : 'icon-saldo-defisit';
            $icon_class = $is_surplus ? 'bi-cash-stack' : 'bi-exclamation-octagon';
            ?>
            <div class="card v-card-sum <?= $bg_saldo_style; ?> h-100 p-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-uppercase small fw-extrabold text-muted d-block mb-1.5" style="font-size: 0.72rem; letter-spacing: 0.05em;">Saldo Akhir</span>
                            <span class="fs-3 fw-bold <?= $text_saldo_style; ?>"><?= rupiah($saldo_akhir); ?></span>
                        </div>
                        <div class="card-icon-wrapper <?= $icon_wrapper_style; ?>">
                            <i class="bi <?= $icon_class; ?> fs-5"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

    </div>
    <?php endif; ?>

    <!-- Panel Visualisasi Grafik Interaktif -->
    <?php if ($show_chart_trend || $show_chart_prop): ?>
    <div class="row g-4 mb-4">
        <!-- Grafik Tren Aliran Kas -->
        <?php if ($show_chart_trend): ?>
        <div class="col-lg-<?= $show_chart_prop ? '8' : '12'; ?>">
            <div class="card main-card p-4 h-100">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 class="fw-bold text-slate-800 mb-1">Tren Aliran Dana</h5>
                        <p class="text-muted small mb-0">Statistik real-time pergerakan arus kas harian</p>
                    </div>
                    <div class="badge bg-light text-secondary border border-light-subtle px-3 py-2 rounded-3 text-xs fw-semibold">
                        <i class="bi bi-activity text-primary me-1"></i> Sinkron database
                    </div>
                </div>
                <div style="height: 300px; position: relative;">
                    <canvas id="cashflowChart"></canvas>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Grafik Distribusi Kategori -->
        <?php if ($show_chart_prop): ?>
        <div class="col-lg-<?= $show_chart_trend ? '4' : '12'; ?>">
            <div class="card main-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                    <h5 class="fw-bold text-slate-800 mb-1">Proporsi Kategori</h5>
                    <p class="text-muted small mb-3">Distribusi volume dana tertinggi per kategori</p>
                </div>
                <div style="height: 200px; position: relative;" class="d-flex align-items-center justify-content-center">
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="text-center mt-3 pt-3 border-top border-light-subtle">
                    <span class="text-muted small font-monospace"><i class="bi bi-pie-chart-fill text-muted me-1"></i> Top 5 Kategori Aktif</span>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
    <?php endif; ?>

    <!-- Tabel Riwayat Data Transaksi -->
    <div class="card main-card overflow-hidden">
        <div class="card-header bg-white py-3 border-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center">
                <i class="bi bi-database-check text-primary fs-4 me-2"></i>
                <h5 class="fw-bold mb-0">Riwayat Catatan Transaksi</h5>
            </div>
            <div>
                <a href="tambah.php" class="btn btn-add rounded-3 px-3.5 py-2 text-xs">
                    <i class="bi bi-plus-circle-fill me-2"></i>Tambah Transaksi
                </a>
            </div>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
                    <thead class="bg-light table-light">
                        <tr>
                            <th class="ps-4 py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 70px;">No</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 140px;">Tanggal</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace">Keterangan</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 135px;">Kategori</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 130px;">Jenis</th>
                            <th class="text-end text-muted text-uppercase fw-bold font-monospace" style="width: 180px; padding-right: 20px;">Nominal</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (mysqli_num_rows($result_transaksi) > 0): ?>
                            <?php 
                            $no = 1;
                            while ($row = mysqli_fetch_assoc($result_transaksi)): 
                            ?>
                                <tr class="border-bottom border-light-subtle">
                                    <td class="ps-4 fw-medium text-muted"><?= $no++; ?></td>
                                    <td>
                                        <div class="fw-semibold">
                                            <?= date('d/m/Y', strtotime($row['tanggal'])); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="fw-semibold text-dark"><?= htmlspecialchars($row['keterangan']); ?></span>
                                    </td>
                                    <td>
                                        <span class="badge badge-kategori"><?= htmlspecialchars($row['kategori'] ?? 'Umum'); ?></span>
                                    </td>
                                    <td class="text-center">
                                        <?php if ($row['jenis'] === 'pemasukan'): ?>
                                            <span class="badge badge-pemasukan fw-semibold"><i class="bi bi-arrow-down-left me-1"></i>Pemasukan</span>
                                        <?php else: ?>
                                            <span class="badge badge-pengeluaran fw-semibold"><i class="bi bi-arrow-up-right me-1"></i>Pengeluaran</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end fw-bold font-monospace" style="padding-right: 20px;">
                                        <?php if ($row['jenis'] === 'pemasukan'): ?>
                                            <span class="text-pemasukan">+ <?= rupiah($row['jumlah']); ?></span>
                                        <?php else: ?>
                                            <span class="text-pengeluaran">- <?= rupiah($row['jumlah']); ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-center">
                                        <div class="btn-group gap-1">
                                            <a href="edit.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-primary rounded-2" title="Edit Transaksi">
                                                <i class="bi bi-pencil-square"></i>
                                            </a>
                                            <a href="hapus.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-danger rounded-2" onclick="return confirm('Apakah Anda yakin ingin menghapus transaksi ini?');" title="Hapus Transaksi">
                                                <i class="bi bi-trash"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="bi bi-journals fs-1 mb-3 text-secondary d-block"></i>
                                    <h5>Belum Ada Data Transaksi</h5>
                                    <p class="small text-muted mb-0">Klik tombol "Tambah Transaksi" di atas untuk memasukkan data pertama Anda.</p>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
</div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // 1. Inisialisasi Grafik Aliran Kas (Pemasukan v.s. Pengeluaran)
    const elCashflow = document.getElementById('cashflowChart');
    if (elCashflow) {
        const ctxCashflow = elCashflow.getContext('2d');
        
        // Konversi tanggal, data pemasukan & pengeluaran dari PHP secara aman
        const chartDates = <?= json_encode($chart_dates); ?>;
        const chartPemasukan = <?= json_encode($chart_pemasukan); ?>;
        const chartPengeluaran = <?= json_encode($chart_pengeluaran); ?>;
        
        new Chart(ctxCashflow, {
            type: 'line',
            data: {
                labels: chartDates,
                datasets: [
                    {
                        label: 'Pemasukan',
                        data: chartPemasukan,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        borderWidth: 3.5,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Pengeluaran',
                        data: chartPengeluaran,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        borderWidth: 3.5,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11,
                                weight: '600'
                            },
                            color: '#64748b',
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 15
                        }
                    },
                    tooltip: {
                        padding: 12,
                        backgroundColor: '#1e293b',
                        titleColor: '#fff',
                        titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
                        bodyColor: '#cbd5e1',
                        bodyFont: { family: "'Inter', sans-serif" },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10
                            },
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return 'Rp ' + (value / 1000000).toFixed(1) + ' jt';
                                } else if (value >= 1000) {
                                    return 'Rp ' + (value / 1000) + ' rb';
                                }
                                return 'Rp ' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // 2. Inisialisasi Grafik Distribusi Kategori (Doughnut)
    const elCategory = document.getElementById('categoryChart');
    if (elCategory) {
        const ctxCategory = elCategory.getContext('2d');
        const catLabels = <?= json_encode($category_labels); ?>;
        const catTotals = <?= json_encode($category_totals); ?>;
        
        const paletteTheme = [
            '#2563eb', // Blue
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#8b5cf6'  // Violet
        ];

        new Chart(ctxCategory, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catTotals,
                    backgroundColor: paletteTheme.slice(0, catLabels.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10,
                                weight: '500'
                            },
                            color: '#64748b',
                            boxWidth: 8,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 10
                        }
                    },
                    tooltip: {
                        padding: 10,
                        backgroundColor: '#1e293b',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                },
                cutout: '68%'
            }
        });
    }
});
</script>
</body>
</html>`;

export const TAMBAH_PHP = `<?php
// tambah.php
// Mengurus penambahan transaksi baru beserta validasi input server-side dengan proteksi login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$error = '';

// Verifikasi jika form dikirimkan via POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Escape dan amankan input mentah
    $tanggal = trim($_POST['tanggal']);
    $keterangan = trim($_POST['keterangan']);
    $kategori = trim($_POST['kategori']);
    $jenis = trim($_POST['jenis']);
    $jumlah = trim($_POST['jumlah']);

    // Validasi sederhana: pastikan tidak ada data yang kosong
    if (empty($tanggal) || empty($keterangan) || empty($kategori) || empty($jenis) || empty($jumlah)) {
        $error = "Peringatan: Semua data wajib diisi dan tidak boleh dibiarkan kosong!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah harus lebih besar dari Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Tipe transaksi tidak dikenal!";
    } else {
        // Cast input ke nilai numerik integer
        $jumlah_int = (int) $jumlah;

        // Gunakan Prepared Statement demi pertahanan SQL Injection
        $user_username = $_SESSION['username'] ?? 'admin';
        $query_insert = "INSERT INTO transaksi (tanggal, keterangan, kategori, jenis, jumlah, username) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($koneksi, $query_insert);

        if ($stmt) {
            // Ikat parameter ("ssssis" : s=string, i=integer)
            mysqli_stmt_bind_param($stmt, "ssssis", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $user_username);

            // Jalankan Statement
            if (mysqli_stmt_execute($stmt)) {
                // Berhasil ditambah, arahkan kembali ke index.php
                header("Location: index.php");
                exit();
            } else {
                $error = "Gagal memproses data masuk: " . mysqli_stmt_error($stmt);
            }

            // Membebaskan memori statement
            mysqli_stmt_close($stmt);
        } else {
            $error = "Gagal memproses susunan syntax query MySQL: " . mysqli_error($koneksi);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Transaksi - KeuanganKu</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 600px;
            margin: 0 auto;
        }
        .form-label {
            font-weight: 600;
            color: #475569;
            font-size: 0.85rem;
        }
        .form-control, .form-select {
            border-radius: 10px;
            padding: 0.65rem 1rem;
            border: 1px solid #cbd5e1;
        }
        .form-control:focus, .form-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.15);
        }
    </style>
</head>
<body>

<?php
$active_page = 'tambah_transaksi';
include 'sidebar.php';
?>
    <div class="card main-card p-4 p-sm-5 mt-3">
        <div class="d-flex items-center gap-2 mb-4">
            <a href="index.php" class="btn btn-sm btn-outline-secondary rounded-3 me-2">
                <i class="bi bi-arrow-left"></i> Kembali
            </a>
            <h4 class="fw-bold text-slate-800 mb-0">Tambah Transaksi Baru</h4>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger px-3 py-2.5 rounded-3 d-flex align-items-center mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #b91c1c;">
                <i class="bi bi-exclamation-triangle-fill me-2 fs-5 text-danger"></i>
                <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
            </div>
        <?php endif; ?>

        <form action="tambah.php" method="POST">
            <div class="mb-3">
                <label for="tanggal" class="form-label">Tanggal Transaksi</label>
                <input type="date" class="form-control" id="tanggal" name="tanggal" value="<?= date('Y-m-d'); ?>" required>
            </div>

            <div class="mb-3">
                <label class="form-label d-block">Jenis Aliran Dana</label>
                <div class="form-check form-check-inline me-4">
                    <input class="form-check-input" type="radio" name="jenis" id="pemasukan" value="pemasukan" checked>
                    <label class="form-check-label fw-semibold text-success" for="pemasukan">
                        <i class="bi bi-box-arrow-in-down-left me-1"></i> Pemasukan
                    </label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="jenis" id="pengeluaran" value="pengeluaran">
                    <label class="form-check-label fw-semibold text-danger" for="pengeluaran">
                        <i class="bi bi-box-arrow-up-right me-1"></i> Pengeluaran
                    </label>
                </div>
            </div>

            <div class="mb-3">
                <label for="kategori" class="form-label">Kategori Transaksi</label>
                <select class="form-select" id="kategori" name="kategori" required>
                    <?php
                    $cat_query = mysqli_query($koneksi, "SELECT nama FROM kategori ORDER BY id ASC");
                    if ($cat_query) {
                        while ($cat_row = mysqli_fetch_assoc($cat_query)) {
                            $cat_name = htmlspecialchars($cat_row['nama']);
                            $selected = ($cat_name === 'Lainnya') ? 'selected' : '';
                            echo "<option value=\\"$cat_name\\" $selected>$cat_name</option>";
                        }
                    } else {
                        echo '<option value="Lainnya" selected>Lainnya</option>';
                    }
                    ?>
                </select>
            </div>

            <div class="mb-3">
                <label for="jumlah" class="form-label">Jumlah Uang (Rupiah Rp)</label>
                <div class="input-group">
                    <span class="input-group-text bg-light text-slate-500 font-monospace fw-bold">Rp</span>
                    <input type="number" class="form-control font-monospace fw-bold" id="jumlah" name="jumlah" placeholder="Contoh: 100000" min="1" required>
                </div>
            </div>

            <div class="mb-4">
                <label for="keterangan" class="form-label">Keterangan Catatan</label>
                <textarea class="form-control" id="keterangan" name="keterangan" placeholder="Ketik keterangan detail pembayaran..." rows="3" required></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold shadow-sm text-uppercase tracking-wider">
                <i class="bi bi-save me-1.5"></i> Simpan Catatan Keuangan
            </button>
        </form>
    </div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

export const EDIT_PHP = `<?php
// edit.php
// Mengedit transaksi yang sudah ada di database secara aman dengan Prepared Statements dan proteksi login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Pastikan parameter id tersedia di URL
if (!isset($_GET['id']) || empty(trim($_GET['id']))) {
    header("Location: index.php");
    exit();
}

$id = (int)$_GET['id'];
$error = '';

// 1. Ambil data transaksi lama berdasarkan ID untuk ditaruh di form
$query_select = "SELECT * FROM transaksi WHERE id = ?";
$stmt_select = mysqli_prepare($koneksi, $query_select);

if ($stmt_select) {
    mysqli_stmt_bind_param($stmt_select, "i", $id);
    mysqli_stmt_execute($stmt_select);
    $result = mysqli_stmt_get_result($stmt_select);
    
    // Alihkan jika data id tidak terdapat di database
    if (mysqli_num_rows($result) === 0) {
        header("Location: index.php");
        exit();
    }
    
    $old_data = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt_select);

    // Proteksi: Jika role adalah 'user', pastikan transaksi milik dia
    $user_role = $_SESSION['role'] ?? 'admin';
    $user_username = $_SESSION['username'] ?? 'user';
    if ($user_role === 'user' && $old_data['username'] !== $user_username) {
        header("Location: index.php?err=" . urlencode("Akses ditolak! Anda tidak diizinkan mengubah transaksi milik pengguna lain."));
        exit();
    }
} else {
    die("Kegagalan memproses kueri database SELECT.");
}

// 2. Proses edit data setelah form di-submit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tanggal = trim($_POST['tanggal']);
    $keterangan = trim($_POST['keterangan']);
    $kategori = trim($_POST['kategori']);
    $jenis = trim($_POST['jenis']);
    $jumlah = trim($_POST['jumlah']);

    // Validasi data masukan
    if (empty($tanggal) || empty($keterangan) || empty($kategori) || empty($jenis) || empty($jumlah)) {
        $error = "Peringatan: Semua kolom isian formulir wajib dilengkapi!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah transaksi wajib di atas Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Jenis transaksi tidak valid.";
    } else {
        $jumlah_int = (int) $jumlah;

        // Persingkat pembaruan menggunakan parameterized set statement
        $query_update = "UPDATE transaksi SET tanggal = ?, keterangan = ?, kategori = ?, jenis = ?, jumlah = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($koneksi, $query_update);

        if ($stmt_update) {
            mysqli_stmt_bind_param($stmt_update, "ssssii", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $id);

            if (mysqli_stmt_execute($stmt_update)) {
                // Alihkan setelah sukses diupdate
                header("Location: index.php");
                exit();
            } else {
                $error = "Gagal memproses eksekusi pembaruan database: " . mysqli_stmt_error($stmt_update);
            }
            mysqli_stmt_close($stmt_update);
        } else {
            $error = "Masalah kueri: Gagal memproses prepared update statement.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ubah Transaksi - KeuanganKu</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 600px;
            margin: 0 auto;
        }
        .form-label {
            font-weight: 600;
            color: #475569;
            font-size: 0.85rem;
        }
        .form-control, .form-select {
            border-radius: 10px;
            padding: 0.65rem 1rem;
            border: 1px solid #cbd5e1;
        }
        .form-control:focus, .form-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.15);
        }
    </style>
</head>
<body>

<?php
$active_page = 'dashboard';
include 'sidebar.php';
?>
    <div class="card main-card p-4 p-sm-5 mt-3">
        <div class="d-flex items-center gap-2 mb-4">
            <a href="index.php" class="btn btn-sm btn-outline-secondary rounded-3 me-2">
                <i class="bi bi-arrow-left"></i> Kembali
            </a>
            <h4 class="fw-bold text-slate-800 mb-0">Ubah Detail Transaksi</h4>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger px-3 py-2.5 rounded-3 d-flex align-items-center mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #b91c1c;">
                <i class="bi bi-exclamation-triangle-fill me-2 fs-5 text-danger"></i>
                <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
            </div>
        <?php endif; ?>

        <form action="edit.php?id=<?= $id; ?>" method="POST">
            <div class="mb-3">
                <label for="tanggal" class="form-label">Tanggal Transaksi</label>
                <input type="date" class="form-control" id="tanggal" name="tanggal" value="<?= htmlspecialchars($old_data['tanggal']); ?>" required>
            </div>

            <div class="mb-3">
                <label class="form-label d-block">Jenis Aliran Dana</label>
                <div class="form-check form-check-inline me-4">
                    <input class="form-check-input" type="radio" name="jenis" id="pemasukan" value="pemasukan" <?= $old_data['jenis'] === 'pemasukan' ? 'checked' : ''; ?>>
                    <label class="form-check-label fw-semibold text-success" for="pemasukan">
                        <i class="bi bi-box-arrow-in-down-left me-1"></i> Pemasukan
                    </label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="jenis" id="pengeluaran" value="pengeluaran" <?= $old_data['jenis'] === 'pengeluaran' ? 'checked' : ''; ?>>
                    <label class="form-check-label fw-semibold text-danger" for="pengeluaran">
                        <i class="bi bi-box-arrow-up-right me-1"></i> Pengeluaran
                    </label>
                </div>
            </div>

            <div class="mb-3">
                <label for="kategori" class="form-label">Kategori Transaksi</label>
                <select class="form-select" id="kategori" name="kategori" required>
                    <?php
                    $cat_query = mysqli_query($koneksi, "SELECT nama FROM kategori ORDER BY id ASC");
                    if ($cat_query) {
                        $found_any_selected = false;
                        while ($cat_row = mysqli_fetch_assoc($cat_query)) {
                            $cat_name = htmlspecialchars($cat_row['nama']);
                            $selected = ($old_data['kategori'] === $cat_name) ? 'selected' : '';
                            if ($selected) $found_any_selected = true;
                            echo "<option value=\\"$cat_name\\" $selected>$cat_name</option>";
                        }
                        // Jika kategori lama tidak terdaftar lagi (dihapus/lainnya), tambahkan pilihan cadangan
                        if (!$found_any_selected && !empty($old_data['kategori'])) {
                            $cat_name_old = htmlspecialchars($old_data['kategori']);
                            echo "<option value=\\"$cat_name_old\\" selected>$cat_name_old (Kustom/Non-Aktif)</option>";
                        }
                    } else {
                        echo '<option value="Lainnya" selected>Lainnya</option>';
                    }
                    ?>
                </select>
            </div>

            <div class="mb-3">
                <label for="jumlah" class="form-label">Jumlah Uang (Rupiah Rp)</label>
                <div class="input-group">
                    <span class="input-group-text bg-light text-slate-500 font-monospace fw-bold">Rp</span>
                    <input type="number" class="form-control font-monospace fw-bold" id="jumlah" name="jumlah" value="<?= htmlspecialchars($old_data['jumlah']); ?>" min="1" required>
                </div>
            </div>

            <div class="mb-4">
                <label for="keterangan" class="form-label">Keterangan Catatan</label>
                <textarea class="form-control" id="keterangan" name="keterangan" rows="3" required><?= htmlspecialchars($old_data['keterangan']); ?></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold shadow-sm text-uppercase tracking-wider">
                <i class="bi bi-check-circle me-1.5"></i> Simpan Perubahan Transaksi
            </button>
        </form>
    </div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

export const HAPUS_PHP = `<?php
// hapus.php
// Memproses penghapusan denga keamanan parameterized query MySQLi dan proteksi login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Memastikan parameter ID terisi
if (isset($_GET['id']) && !empty(trim($_GET['id']))) {
    $id = (int) $_GET['id'];
    $user_role = $_SESSION['role'] ?? 'admin';
    $user_username = $_SESSION['username'] ?? 'user';

    // Verifikasi penanggung jawab / pemilik kueri jika role adalah 'user'
    $can_delete = true;
    $query_check = "SELECT username FROM transaksi WHERE id = ?";
    $stmt_check = mysqli_prepare($koneksi, $query_check);
    if ($stmt_check) {
        mysqli_stmt_bind_param($stmt_check, "i", $id);
        mysqli_stmt_execute($stmt_check);
        $res_check = mysqli_stmt_get_result($stmt_check);
        if ($row_check = mysqli_fetch_assoc($res_check)) {
            if ($user_role === 'user' && $row_check['username'] !== $user_username) {
                $can_delete = false;
            }
        }
        mysqli_stmt_close($stmt_check);
    }

    if ($can_delete) {
        // Siapkan prepared statement untuk mencegah serangan SQL Injection
        $query_delete = "DELETE FROM transaksi WHERE id = ?";
        $stmt = mysqli_prepare($koneksi, $query_delete);
        
        if ($stmt) {
            // Ikat parameter integer
            mysqli_stmt_bind_param($stmt, "i", $id);
            
            // Jalankan perintah hapus
            mysqli_stmt_execute($stmt);
            
            // Selesai membebaskan memori kueri
            mysqli_stmt_close($stmt);
        }
    } else {
        header("Location: index.php?err=" . urlencode("Gagal menghapus! Anda tidak diizinkan menghapus transaksi milik orang lain."));
        exit();
    }
}

// Redirect otomatis dialihkan mengarah kembali ke index.php
header("Location: index.php");
exit();
?>`;

export const README_CPANEL = `# Panduan Singkat Deployment Aplikasi Keuangan ke cPanel

Berikut adalah instruksi langkah-demi-langkah bagi Anda untuk mengupload, mengatur database, dan menjalankan aplikasi keuangan berbasis PHP Native ini di hosting cPanel standar milik Anda.

---

## Langkah 1: Persiapan Database di cPanel

1. **Masuk ke cPanel** menggunakan akun hosting Anda.
2. Cari dan klik menu **MySQL Database Wizard** (rekomendasi untuk pemula) atau **MySQL Databases**.
3. **Buat Database Baru**:
   - Ketikkan nama database, contoh: \`keuangan_db\` atau \`namauser_keuangan\`.
   - Simpan nama lengkap database ini karena cPanel biasanya menambahkan prefix nama pengguna Anda (cth: \`u1234567_keuangan_db\`). Klik **Next Step**.
4. **Buat User Database**:
   - Ketikkan nama user baru, contoh: \`keuangan_user\` (akan menjadi \`u1234567_keuangan_user\`).
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
4. Pada kolom "File to import", klik **Choose File** (Pilih File) dan pilih berkas \`db.sql\` yang ada dalam folder unduhan ini.
5. Gulir ke bawah dan klik tombol **Go** atau **Import** di kanan bawah.
6. Tunggu hingga muncul pesan hijau sukses ("Import has been successfully finished..."). Tabel \`transaksi\` kini telah selesai dibuat beserta data percontohan!

---

## Langkah 3: Konfigurasi File Koneksi di \`koneksi.php\`

Sebelum atau setelah mengunggah, Anda harus menyunting file koneksi database:

1. Buka file \`koneksi.php\`.
2. Ubah baris data konfigurasi dengan kesesuaian dari cPanel Anda di Langkah 1:
   \`\`\`php
   $db_host = "localhost";        // Biarkan tetap localhost
   $db_user = "u1234567_userdb";  // Username MySQL dari Langkah 1
   $db_pass = "password_anda";    // Password MySQL dari Langkah 1
   $db_name = "u1234567_namedb";  // Nama Database dari Langkah 1
   \`\`\`
3. Simpan perubahan file tersebut.

---

## Langkah 4: Upload File ke File Manager cPanel

1. Di beranda cPanel, klik menu **File Manager**.
2. Masuklah ke dalam direktori/folder bernama **public_html** (ini adalah folder publik tempat website Anda diakses).
3. Unggah seluruh file PHP berikut langsung ke dalam \`public_html\`:
   - \`index.php\`
   - \`login.php\`
   - \`logout.php\`
   - \`tambah.php\`
   - \`edit.php\`
   - \`hapus.php\`
   - \`koneksi.php\`
4. *Tips:* Untuk mempercepat proses, Anda dapat meng-compress seluruh file di atas menjadi satu file \`.zip\`, unggah file ZIP tersebut via File Manager, lalu klik kanan file ZIP tersebut di File Manager cPanel dan pilih **Extract**.

---

## Langkah 5: Selesai! Uji Coba Aplikasi

Aplikasi Anda kini sudah siap dijalankan! Buka browser Anda dan akses domain website Anda:
- \`http://nama-domain-anda.com/\` (jika di-upload langsung di folder utama \`public_html\`)
- Atau \`http://nama-domain-anda.com/keuangan/\` (jika di-upload ke dalam subfolder baru bernama \`keuangan\` di dalam \`public_html\`).
`;

export const LOGIN_PHP = `<?php
// login.php
// Sistem Autentikasi Keamanan Pengguna - Memanfaatkan Session & Prepared Statements secara aman

session_start();
require_once 'koneksi.php';

$error = '';

// Jika user sudah login, langsung alihkan ke halaman utama dashboard
if (isset($_SESSION['login']) && $_SESSION['login'] === true) {
    header("Location: index.php");
    exit();
}

// Memproses autentikasi form login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if (empty($username) || empty($password)) {
        $error = "Peringatan: Username dan password wajib diisi!";
    } else {
        // Gunakan Prepared Statement MySQLi untuk mencegah serangan SQL Injection
        $query_user = "SELECT * FROM users WHERE username = ?";
        $stmt_user = mysqli_prepare($koneksi, $query_user);

        if ($stmt_user) {
            mysqli_stmt_bind_param($stmt_user, "s", $username);
            mysqli_stmt_execute($stmt_user);
            $result_user = mysqli_stmt_get_result($stmt_user);

            if ($row = mysqli_fetch_assoc($result_user)) {
                // Verifikasi password hash aman (Bcrypt)
                if (password_verify($password, $row['password'])) {
                    $_SESSION['login'] = true;
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['username'] = $row['username'];
                    $_SESSION['nama'] = $row['nama'];
                    $_SESSION['role'] = $row['role'] ?? 'admin';

                    header("Location: index.php");
                    exit();
                } else {
                    $error = "Password salah! Silakan periksa kembali.";
                }
            } else {
                // Fitur Fallback Otomatis: Jika database baru di-import dan belum di-seed,
                // username: admin, password: admin123
                if ($username === 'admin' && $password === 'admin123') {
                    // Daftarkan otomatis ke database 'users' agar memudahkan testing siswa
                    $hashed_pw = password_hash('admin123', PASSWORD_DEFAULT);
                    $query_insert = "INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, 'superadmin')";
                    $stmt_ins = mysqli_prepare($koneksi, $query_insert);
                    if ($stmt_ins) {
                        $nama_admin = "Administrator Keuangan";
                        mysqli_stmt_bind_param($stmt_ins, "sss", $username, $hashed_pw, $nama_admin);
                        mysqli_stmt_execute($stmt_ins);
                        mysqli_stmt_close($stmt_ins);
                    }

                    $_SESSION['login'] = true;
                    $_SESSION['username'] = 'admin';
                    $_SESSION['nama'] = 'Administrator Keuangan';
                    $_SESSION['role'] = 'superadmin';

                    header("Location: index.php");
                    exit();
                } else {
                    $error = "Username tidak terdaftar di sistem database!";
                }
            }
            mysqli_stmt_close($stmt_user);
        } else {
            $error = "Masalah sistem: Gagal menyusun perintah prepared query database.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Pengguna - Sistem Catatan Keuangan</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #131926 0%, #1e293b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, sans-serif;
            color: #f8fafc;
        }
        .login-card {
            background-color: #111827;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            max-width: 430px;
            width: 100%;
            overflow: hidden;
            padding: 2.5rem;
        }
        .form-control {
            background-color: #1f2937;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f8fafc;
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
        }
        .form-control:focus {
            background-color: #1f2937;
            border-color: #2563eb;
            box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.2);
            color: #f8fafc;
        }
        .btn-login {
            background-color: #2563eb;
            border: none;
            color: white;
            font-weight: 700;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            transition: all 0.25s ease;
        }
        .btn-login:hover {
            background-color: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .brand-icon {
            font-size: 2.8rem;
            color: #3b82f6;
            margin-bottom: 0.5rem;
            display: inline-block;
        }
    </style>
</head>
<body>

<div class="login-card">
    <div class="text-center mb-4">
        <div class="brand-icon">
            <i class="bi bi-wallet2 text-primary"></i>
        </div>
        <h4 class="fw-black mb-1">Masuk Dashboard</h4>
        <p class="text-muted small">Kelola arus kas & laporan keuangan secara aman</p>
    </div>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger px-3 py-2.5 rounded-3 d-flex align-items-center mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #fca5a5;">
            <i class="bi bi-exclamation-triangle-fill me-2 fs-5 text-danger"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
        </div>
    <?php endif; ?>

    <form action="login.php" method="POST">
        <div class="mb-3">
            <label for="username" class="form-label text-secondary small fw-bold text-uppercase tracking-wider">Username</label>
            <input type="text" class="form-control" id="username" name="username" placeholder="Masukkan username admin" required autofocus>
        </div>
        
        <div class="mb-4">
            <label for="password" class="form-label text-secondary small fw-bold text-uppercase tracking-wider">Password</label>
            <input type="password" class="form-control" id="password" name="password" placeholder="Masukkan password admin" required>
        </div>

        <button type="submit" class="btn btn-login w-100 mb-3 text-uppercase tracking-wide">
            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk Sekarang
        </button>

        <div class="text-center border-top border-slate-800 pt-3 mt-3">
            <span class="text-muted small">Kredensial Default:<br><strong class="text-white">username: admin</strong> / <strong class="text-white">password: admin123</strong></span>
        </div>
    </form>
</div>

</body>
</html>
`;

export const LOGOUT_PHP = `<?php
// logout.php
// Menghancurkan session login untuk memutus hubungan akses pengguna secara aman

session_start();

// Hapus seluruh variabel session
$_SESSION = array();

// Bersihkan session cookie di web browser pengguna
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Hancurkan session data di sisi server
session_destroy();

// Alihkan halaman ke form masuk login kembali
header("Location: login.php");
exit();
?>`;

export const KELOLA_USER_PHP = `<?php
// kelola_user.php
// Halaman tabel daftar user dan management akun dengan otorisasi Super Admin & Admin

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

$user_role = $_SESSION['role'] ?? 'admin';
if ($user_role !== 'superadmin') {
    header("Location: index.php?err=" . urlencode("Akses ditolak! Kelola Pengguna hanya dapat diakses oleh Super Admin."));
    exit();
}

require_once 'koneksi.php';

// Ambil daftar seluruh user
$query_users = "SELECT id, username, nama, role FROM users ORDER BY id ASC";
$result_users = mysqli_query($koneksi, $query_users);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Pengguna - KeuanganKu</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            background: #ffffff;
        }
    </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>
<div class="container-fluid py-2">
    <?php if (isset($_GET['msg'])): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-xs border-0 py-3 mb-4" role="alert">
            <i class="bi bi-check-circle-fill text-success fs-5 me-2"></i>
            <?= htmlspecialchars($_GET['msg']); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <?php if (isset($_GET['err'])): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 shadow-xs border-0 py-3 mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-5 me-2"></i>
            <?= htmlspecialchars($_GET['err']); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Otorisasi Keterangan Sandbox -->
    <div class="bg-indigo-50 border border-indigo-100 rounded-4 p-3.5 mb-4 d-flex align-items-start gap-3">
        <i class="bi bi-shield-lock-fill text-indigo fs-4"></i>
        <div>
            <h6 class="fw-bold text-indigo-900 mb-1">Informasi Hak Otorisasi Peran (Role)</h6>
            <p class="small text-indigo-700 mb-0 leading-relaxed">
                Aplikasi ini mendukung tingkatan peran pengguna:<br>
                1. <strong>Super Admin</strong>: Memiliki hak mutlak dalam menambah, mengedit, serta mendelete user.<br>
                2. <strong>Admin</strong>: Dapat melihat daftar akun (Read-Only) tetapi tidak diizinkan mengubah susunan database user.
            </p>
        </div>
    </div>

    <!-- Panel Pengguna -->
    <div class="card main-card">
        <div class="card-header bg-white py-3.5 border-0 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <i class="bi bi-people text-primary fs-4 me-2"></i>
                <h5 class="fw-bold mb-0">Manajemen Akses Pengguna</h5>
            </div>
            <div>
                <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                    <a href="tambah_user.php" class="btn btn-primary rounded-3 px-3 py-2">
                        <i class="bi bi-person-plus-fill me-1.5"></i>Tambah User Baru
                    </a>
                <?php else: ?>
                    <button class="btn btn-outline-secondary rounded-3 px-3 py-2" disabled title="Hanya Super Admin yang diizinkan menambah user baru">
                        <i class="bi bi-lock-fill me-1.5"></i>Tambah User (Disabled)
                    </button>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4 py-3" style="width: 80px;">No</th>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th style="width: 180px;">Level Peran</th>
                            <th class="text-center" style="width: 180px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $no = 1;
                        while ($row = mysqli_fetch_assoc($result_users)): 
                        ?>
                            <tr>
                                <td class="ps-4 fw-medium text-muted"><?= $no++; ?></td>
                                <td><div class="fw-bold text-dark"><?= htmlspecialchars($row['nama']); ?></div></td>
                                <td><span class="font-monospace text-secondary">@<?= htmlspecialchars($row['username']); ?></span></td>
                                <td>
                                    <?php if ($row['role'] === 'superadmin'): ?>
                                        <span class="badge bg-indigo-subtle border border-indigo-200 text-indigo px-3 py-1.5 rounded-3 text-uppercase"><i class="bi bi-shield-fill me-1"></i>Super Admin</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary-subtle border border-secondary text-secondary px-3 py-1.5 rounded-3 text-uppercase"><i class="bi bi-person-fill me-1"></i>Admin</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                                        <div class="btn-group gap-1.5">
                                            <a href="edit_user.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-primary rounded-2" title="Edit Akun"><i class="bi bi-pencil-square"></i></a>
                                            
                                            <?php if ($row['id'] == ($_SESSION['user_id'] ?? 0) || $row['username'] === 'admin'): ?>
                                                <button class="btn btn-sm btn-outline-secondary rounded-2" disabled title="Keamanan: Tidak diizinkan mendelete akun sendiri atau superadmin utama"><i class="bi bi-trash-fill"></i></button>
                                            <?php else: ?>
                                                <a href="hapus_user.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-danger rounded-2" onclick="return confirm('Apakah Anda yakin ingin mendelete user ini?');" title="Delete Akun"><i class="bi bi-trash"></i></a>
                                            <?php endif; ?>
                                        </div>
                                    <?php else: ?>
                                        <button class="btn btn-sm btn-light rounded-3 text-muted" disabled><i class="bi bi-lock-fill me-1"></i>Terkunci</button>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

export const TAMBAH_USER_PHP = `<?php
// tambah_user.php
// Menambahkan akun pengguna baru dengan filtering role (Khusus Super Admin)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

// Otorisasi ketat keamanan: Cek jika bukan superadmin
if (($_SESSION['role'] ?? '') !== 'superadmin') {
    header("Location: kelola_user.php?err=Akses ditolak! Hanya Super Admin yang berhak memproses aksi ini.");
    exit();
}

require_once 'koneksi.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $nama = trim($_POST['nama']);
    $role = $_POST['role'] === 'superadmin' ? 'superadmin' : 'admin';

    if (empty($username) || empty($password) || empty($nama)) {
        $error = "Penyebab: Seluruh kolom form di bawah wajib dilengkapi!";
    } elseif (strlen($username) < 4) {
        $error = "Penyebab: Parameter username harus minimal terdiri dari 4 karakter!";
    } else {
        // Cek duplikasi username lewat prepared statement
        $query_check = "SELECT id FROM users WHERE username = ?";
        $stmt_check = mysqli_prepare($koneksi, $query_check);
        mysqli_stmt_bind_param($stmt_check, "s", $username);
        mysqli_stmt_execute($stmt_check);
        mysqli_stmt_store_result($stmt_check);
        
        if (mysqli_stmt_num_rows($stmt_check) > 0) {
            $error = "Penyebab: Username '@" . htmlspecialchars($username) . "' telah digunakan oleh akun lain!";
            mysqli_stmt_close($stmt_check);
        } else {
            mysqli_stmt_close($stmt_check);
            
            // Masukkan data baru dengan password di-hash aman
            $hashed_pw = password_hash($password, PASSWORD_DEFAULT);
            $query_ins = "INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)";
            $stmt_ins = mysqli_prepare($koneksi, $query_ins);
            
            if ($stmt_ins) {
                mysqli_stmt_bind_param($stmt_ins, "ssss", $username, $hashed_pw, $nama, $role);
                if (mysqli_stmt_execute($stmt_ins)) {
                    mysqli_stmt_close($stmt_ins);
                    header("Location: kelola_user.php?msg=" . urlencode("User baru '$nama' berhasil dibuat ke database!"));
                    exit();
                } else {
                    $error = "Gagal memproses pendaftaran user baru ke MySQL server.";
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Pengguna - KeuanganKu</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 600px;
            margin: 0 auto;
        }
        .form-label {
            font-weight: 600;
            color: #475569;
            font-size: 0.85rem;
        }
        .form-control, .form-select {
            border-radius: 10px;
            padding: 0.65rem 1rem;
            border: 1px solid #cbd5e1;
        }
        .form-control:focus, .form-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.15);
        }
    </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>
    <div class="card main-card p-4 p-sm-5 mt-3">
        <div class="d-flex items-center gap-2 mb-4">
            <a href="kelola_user.php" class="btn btn-sm btn-outline-secondary rounded-3 me-2">
                <i class="bi bi-arrow-left"></i> Kembali
            </a>
            <h4 class="fw-bold text-slate-800 mb-0">Tambah User Baru</h4>
        </div>
        <p class="text-muted small mb-4">Daftarkan akun administrator baru ke dalam database keamanan server.</p>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2.5 rounded-3 border-0 small font-semibold mb-4">
                    <i class="bi bi-info-circle-fill me-1.5"></i> <?= $error; ?>
                </div>
            <?php endif; ?>

            <form action="tambah_user.php" method="POST">
                <div class="mb-3">
                    <label class="form-label text-slate-700 small fw-bold">Nama Lengkap</label>
                    <input type="text" name="nama" class="form-control rounded-3" placeholder="Contoh: Andi Wijaya" required>
                </div>
                
                <div class="mb-3">
                    <label class="form-label text-slate-700 small fw-bold">Username Akun</label>
                    <input type="text" name="username" class="form-control rounded-3 font-monospace" placeholder="andi_wi" required>
                </div>

                <div class="mb-3">
                    <label class="form-label text-slate-700 small fw-bold">Password Baru</label>
                    <input type="password" name="password" class="form-control rounded-3" placeholder="Masukkan password rahasia" required>
                </div>

                <div class="mb-4">
                    <label class="form-label text-slate-700 small fw-bold">Level Peran (Role)</label>
                    <select name="role" class="form-select rounded-3">
                        <option value="admin">Admin (Hanya Melihat/Menulis Transaksi)</option>
                        <option value="superadmin">Super Admin (Akses Mutlak Server)</option>
                    </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <a href="kelola_user.php" class="btn btn-outline-secondary rounded-3 px-4">Batal</a>
                    <button type="submit" class="btn btn-primary rounded-3 px-4">Simpan User</button>
                </div>
            </form>
    </div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

</body>
</html>`;

export const EDIT_USER_PHP = `<?php
// edit_user.php
// Pembaruan data user, beserta password opsional (Khusus Super Admin)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

if (($_SESSION['role'] ?? '') !== 'superadmin') {
    header("Location: kelola_user.php?err=Hanya Super Admin yang berhak memodifikasi data user.");
    exit();
}

require_once 'koneksi.php';

$id = $_GET['id'] ?? 0;

// Cari data user tersebut
$query_user = "SELECT * FROM users WHERE id = ?";
$stmt_find = mysqli_prepare($koneksi, $query_user);
mysqli_stmt_bind_param($stmt_find, "i", $id);
mysqli_stmt_execute($stmt_find);
$user_data = mysqli_stmt_get_result($stmt_find)->fetch_assoc();
mysqli_stmt_close($stmt_find);

if (!$user_data) {
    header("Location: kelola_user.php?err=Data user tidak ditemukan!");
    exit();
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama = trim($_POST['nama']);
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    // Cegah penurunan peran superadmin inti
    if ($user_data['username'] === 'admin') {
        $role = 'superadmin';
    } else {
        $role = $_POST['role'] === 'superadmin' ? 'superadmin' : 'admin';
    }

    if (empty($nama) || empty($username)) {
        $error = "Kolom Nama dan Username dilarang dikosongkan!";
    } else {
        // Update query
        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $query_upd = "UPDATE users SET nama = ?, username = ?, password = ?, role = ? WHERE id = ?";
            $stmt_upd = mysqli_prepare($koneksi, $query_upd);
            mysqli_stmt_bind_param($stmt_upd, "ssssi", $nama, $username, $hashed, $role, $id);
        } else {
            $query_upd = "UPDATE users SET nama = ?, username = ?, role = ? WHERE id = ?";
            $stmt_upd = mysqli_prepare($koneksi, $query_upd);
            mysqli_stmt_bind_param($stmt_upd, "sssi", $nama, $username, $role, $id);
        }

        if (mysqli_stmt_execute($stmt_upd)) {
            mysqli_stmt_close($stmt_upd);
            header("Location: kelola_user.php?msg=" . urlencode("Data pengguna '$nama' sukses diperbarui!"));
            exit();
        } else {
            $error = "Terjadi kegagalan koneksi database ketika memperbarui user.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Pengguna - KeuanganKu</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 600px;
            margin: 0 auto;
        }
        .form-label {
            font-weight: 600;
            color: #475569;
            font-size: 0.85rem;
        }
        .form-control, .form-select {
            border-radius: 10px;
            padding: 0.65rem 1rem;
            border: 1px solid #cbd5e1;
        }
        .form-control:focus, .form-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.15);
        }
    </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>
    <div class="card main-card p-4 p-sm-5 mt-3">
        <div class="d-flex items-center gap-2 mb-4">
            <a href="kelola_user.php" class="btn btn-sm btn-outline-secondary rounded-3 me-2">
                <i class="bi bi-arrow-left"></i> Kembali
            </a>
            <h4 class="fw-bold text-slate-800 mb-0">Ubah Data Pengguna</h4>
        </div>
        <p class="text-muted small mb-4">Silakan sesuaikan pengaturan data user di bawah.</p>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger font-semibold mb-4"><?= $error; ?></div>
            <?php endif; ?>

            <form action="edit_user.php?id=<?= $id; ?>" method="POST">
                <div class="mb-3">
                    <label class="form-label small fw-bold">Nama Lengkap</label>
                    <input type="text" name="nama" class="form-control rounded-3" value="<?= htmlspecialchars($user_data['nama']); ?>" required>
                </div>
                
                <div class="mb-3">
                    <label class="form-label small fw-bold">Username</label>
                    <input type="text" name="username" class="form-control rounded-3 font-monospace" value="<?= htmlspecialchars($user_data['username']); ?>" required <?= $user_data['username'] === 'admin' ? 'readonly' : ''; ?>>
                    <?php if ($user_data['username'] === 'admin'): ?>
                        <div class="form-text text-danger small">Username admin utama dilarang diedit demi kestabilan.</div>
                    <?php endif; ?>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-bold">Password Baru (Bila Diganti)</label>
                    <input type="password" name="password" class="form-control rounded-3" placeholder="Biarkan kosong jika tidak berencana diedit">
                </div>

                <div class="mb-4">
                    <label class="form-label small fw-bold">Level Peran (Role)</label>
                    <select name="role" class="form-select rounded-3" <?= $user_data['username'] === 'admin' ? 'disabled' : ''; ?>>
                        <option value="admin" <?= $user_data['role'] === 'admin' ? 'selected' : ''; ?>>Admin (Melihat/Menulis Transaksi)</option>
                        <option value="superadmin" <?= $user_data['role'] === 'superadmin' ? 'selected' : ''; ?>>Super Admin (Akses Mutlak Server)</option>
                    </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <a href="kelola_user.php" class="btn btn-outline-secondary rounded-3 px-4">Batal</a>
                    <button type="submit" class="btn btn-primary rounded-3 px-4">Simpan Perubahan</button>
                </div>
            </form>
    </div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

</body>
</html>`;

export const HAPUS_USER_PHP = `<?php
// hapus_user.php
// Menghapus akun dari database secara permanen (Khusus Super Admin)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

if (($_SESSION['role'] ?? '') !== 'superadmin') {
    header("Location: kelola_user.php?err=Akses ditolak! Anda bukan Super Admin!");
    exit();
}

require_once 'koneksi.php';

$id = $_GET['id'] ?? 0;

// Blokir penghapusan diri sendiri
if ($id == ($_SESSION['user_id'] ?? 0)) {
    header("Location: kelola_user.php?err=Keamanan: Anda dilarang mendelete akun sendiri!");
    exit();
}

// Blokir penghapusan admin utama
$query_check = "SELECT username FROM users WHERE id = ?";
$stmt_check = mysqli_prepare($koneksi, $query_check);
mysqli_stmt_bind_param($stmt_check, "i", $id);
mysqli_stmt_execute($stmt_check);
$username_res = mysqli_stmt_get_result($stmt_check)->fetch_assoc();
mysqli_stmt_close($stmt_check);

if ($username_res && $username_res['username'] === 'admin') {
    header("Location: kelola_user.php?err=Keamanan: User admin utama dilarang dihapus!");
    exit();
}

// Lakukan penghapusan secara aman lewat prepared statement
$query_del = "DELETE FROM users WHERE id = ?";
$stmt_del = mysqli_prepare($koneksi, $query_del);
mysqli_stmt_bind_param($stmt_del, "i", $id);

if (mysqli_stmt_execute($stmt_del)) {
    mysqli_stmt_close($stmt_del);
    header("Location: kelola_user.php?msg=User berhasil dihapus secara permanen dari server database!");
    exit();
} else {
    header("Location: kelola_user.php?err=Database: Terjadi kegagalan memproses query penghapusan.");
    exit();
}
?>`;

export const SIDEBAR_PHP = `<?php
// sidebar.php
// Sidebar layout shared across index.php, kelola_user.php, tambah.php, edit.php, dsb.

// Ensure session is started safely
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($koneksi)) {
    include_once 'koneksi.php';
}

$active_page = $active_page ?? 'dashboard';
$user_nama = htmlspecialchars($_SESSION['nama'] ?? 'Pengguna');
$user_role = htmlspecialchars($_SESSION['role'] ?? 'admin');
$user_username = htmlspecialchars($_SESSION['username'] ?? 'user');

// Ambil & Terapkan Tema Warna Dinamis dari Pengaturan User
if (isset($koneksi) && !isset($_SESSION['theme'])) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $theme_query = mysqli_query($koneksi, "SELECT theme FROM users WHERE username = '$db_username_escaped'");
    if ($theme_query && mysqli_num_rows($theme_query) > 0) {
        $theme_row = mysqli_fetch_assoc($theme_query);
        $_SESSION['theme'] = $theme_row['theme'];
    } else {
        $_SESSION['theme'] = 'slate';
    }
}
$current_theme = $_SESSION['theme'] ?? 'slate';

$theme_colors = [
    'slate' => [
        'name' => 'Modern Slate',
        'primary' => '#2563eb', // Blue 600
        'hover' => '#1d4ed8',
        'rgb' => '37, 99, 235',
        'bg_sidebar' => '#0f172a', // Slate 900
        'text_sidebar' => '#cbd5e1',
        'sidebar_active' => '#2563eb'
    ],
    'emerald' => [
        'name' => 'Emerald Forest',
        'primary' => '#059669', // Emerald 600
        'hover' => '#047857',
        'rgb' => '5, 150, 105',
        'bg_sidebar' => '#064e3b', // Emerald 900
        'text_sidebar' => '#d1fae5',
        'sidebar_active' => '#059669'
    ],
    'violet' => [
        'name' => 'Royal Violet',
        'primary' => '#7c3aed', // Violet 600
        'hover' => '#6d28d9',
        'rgb' => '124, 58, 237',
        'bg_sidebar' => '#2e1065', // Violet 900
        'text_sidebar' => '#f5f3ff',
        'sidebar_active' => '#7c3aed'
    ],
    'crimson' => [
        'name' => 'Charcoal Crimson',
        'primary' => '#dc2626', // Red 600
        'hover' => '#b91c1c',
        'rgb' => '220, 38, 38',
        'bg_sidebar' => '#450a0a', // Red 900
        'text_sidebar' => '#fee2e2',
        'sidebar_active' => '#dc2626'
    ],
    'amber' => [
        'name' => 'Amber Sunset',
        'primary' => '#d97706', // Amber 600
        'hover' => '#b45309',
        'rgb' => '217, 119, 6',
        'bg_sidebar' => '#451a03', // Amber 900
        'text_sidebar' => '#fffbeb',
        'sidebar_active' => '#d97706'
    ]
];

$selected_theme = isset($theme_colors[$current_theme]) ? $current_theme : 'slate';
$theme_cfg = $theme_colors[$selected_theme];
?>
<style>
    /* Styling khusus Sidebar Premium dengan Tema Dinamis */
    .sidebar-container {
        width: 280px;
        background-color: <?= $theme_cfg['bg_sidebar']; ?>;
        color: <?= $theme_cfg['text_sidebar']; ?>;
        transition: all 0.3s ease;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 1000;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    .sidebar-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
    
    .sidebar-brand {
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .sidebar-nav-link {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 600;
        text-decoration: none;
        border-radius: 12px;
        margin: 4px 16px;
        transition: all 0.2s ease;
    }
    
    .sidebar-nav-link:hover {
        background-color: rgba(255, 255, 255, 0.07);
        color: #ffffff;
    }
    
    .sidebar-nav-link.active {
        background-color: <?= $theme_cfg['sidebar_active']; ?> !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(<?= $theme_cfg['rgb']; ?>, 0.35);
    }
    
    .sidebar-nav-link i {
        font-size: 1.25rem;
        margin-right: 12px;
    }

    .user-profile-section {
        background-color: rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 16px;
        margin: 16px;
        border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .mobile-header {
        background-color: <?= $theme_cfg['bg_sidebar']; ?>;
        color: #ffffff;
        padding: 15px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Penyesuaian layout fluid */
    .app-layout-wrapper {
        display: flex;
        min-height: 100vh;
        width: 100%;
    }

    .main-canvas-area {
        flex-grow: 1;
        background-color: #f8fafc;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    /* Override Warna Booster Bootstrap secara Dinamis */
    .btn-primary {
        background-color: <?= $theme_cfg['primary']; ?> !important;
        border-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .btn-primary:hover, .btn-primary:active, .btn-primary:focus {
        background-color: <?= $theme_cfg['hover']; ?> !important;
        border-color: <?= $theme_cfg['hover']; ?> !important;
    }
    .btn-outline-primary {
        color: <?= $theme_cfg['primary']; ?> !important;
        border-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .btn-outline-primary:hover {
        background-color: <?= $theme_cfg['primary']; ?> !important;
        color: #ffffff !important;
    }
    .text-primary {
        color: <?= $theme_cfg['primary']; ?> !important;
    }
    .bg-primary {
        background-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .badge.bg-primary-subtle {
        background-color: rgba(<?= $theme_cfg['rgb']; ?>, 0.12) !important;
        color: <?= $theme_cfg['primary']; ?> !important;
        border: 1px solid rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }
    .border-primary-200 {
        border-color: rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }

    @media (max-width: 767.98px) {
        .sidebar-container {
            position: fixed;
            left: -280px;
            top: 0;
            bottom: 0;
            width: 280px;
            height: 100vh;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        .sidebar-container.show {
            left: 0;
        }

        .sidebar-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            z-index: 999;
        }

        .sidebar-backdrop.show {
            display: block;
        }
    }
</style>

<div class="app-layout-wrapper">
    <!-- Backdrop untuk mobile menu -->
    <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebarMenu()"></div>

    <!-- Sidebar Container -->
    <aside class="sidebar-container d-flex flex-column" id="sidebarMenu">
        <!-- Brand Header Logo -->
        <div class="sidebar-brand">
            <a href="index.php" class="d-flex align-items-center text-white text-decoration-none">
                <i class="bi bi-wallet2 text-white fs-3 me-2"></i>
                <div>
                    <h5 class="fw-bold mb-0 tracking-tight" style="letter-spacing: -0.025em; color: #ffffff;">KeuanganKu</h5>
                    <span class="badge bg-primary-subtle font-monospace" style="font-size: 0.65rem;">v1.3 - Pro</span>
                </div>
            </a>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-grow-1 py-4">
            <a href="index.php" class="sidebar-nav-link <?= ($active_page === 'dashboard') ? 'active' : ''; ?>">
                <i class="bi bi-grid-fill"></i>
                <span>Dashboard</span>
            </a>
            
            <a href="tambah.php" class="sidebar-nav-link <?= ($active_page === 'tambah_transaksi') ? 'active' : ''; ?>">
                <i class="bi bi-plus-circle-fill"></i>
                <span>Tambah Transaksi</span>
            </a>
            
            <a href="laporan.php" class="sidebar-nav-link <?= ($active_page === 'laporan') ? 'active' : ''; ?>">
                <i class="bi bi-file-earmark-bar-graph-fill"></i>
                <span>Laporan</span>
            </a>
            
            <?php if ($user_role === 'superadmin'): ?>
            <a href="kelola_user.php" class="sidebar-nav-link <?= ($active_page === 'kelola_user') ? 'active' : ''; ?>">
                <i class="bi bi-people-fill"></i>
                <span>Kelola User</span>
            </a>
            <?php endif; ?>
            
            <a href="pengaturan.php" class="sidebar-nav-link <?= ($active_page === 'pengaturan') ? 'active' : ''; ?>">
                <i class="bi bi-gear-fill"></i>
                <span>Pengaturan</span>
            </a>
        </nav>

        <!-- User Profile & Action Box at Bottom -->
        <div class="mt-auto">
            <div class="user-profile-section">
                <div class="d-flex align-items-center gap-3 mb-2">
                    <div class="bg-primary rounded-circle text-center d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                        <i class="bi bi-person-fill text-white fs-5"></i>
                    </div>
                    <div class="overflow-hidden">
                        <h6 class="fw-bold text-white mb-0 text-truncate" style="font-size: 0.85rem;"><?= $user_nama; ?></h6>
                        <span class="text-uppercase font-monospace text-slate-400 d-block" style="font-size: 0.65rem;"><?= $user_role; ?></span>
                    </div>
                </div>
                <hr class="border-secondary my-2.5" style="opacity: 0.15;">
                <div class="d-grid">
                    <a href="logout.php" class="btn btn-outline-danger btn-sm rounded-3 py-1.5 font-semibold text-start px-3 text-white border-0" style="background-color: rgba(239, 68, 68, 0.1);" onclick="return confirm('Apakah Anda yakin ingin keluar dari PHP session ini?');">
                        <i class="bi bi-box-arrow-right me-2 text-danger"></i>Keluar Akun
                    </a>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Canvas Area -->
    <div class="main-canvas-area col">
        <!-- Mobile Header Bar -->
        <header class="mobile-header d-md-none d-flex justify-content-between align-items-center">
            <a href="index.php" class="d-flex align-items-center text-white text-decoration-none">
                <i class="bi bi-wallet2 text-primary fs-4 me-2"></i>
                <h6 class="fw-bold mb-0">KeuanganKu</h6>
            </a>
            <button class="btn btn-dark border-secondary px-2.5 py-1.5 rounded-3" onclick="toggleSidebarMenu()">
                <i class="bi bi-list fs-4 font-extrabold text-white"></i>
            </button>
        </header>

        <!-- Top breadcrumb bar for large screens -->
        <header class="bg-white border-bottom py-3 px-4 d-none d-md-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <span class="text-muted text-uppercase fw-bold font-monospace text-xs" style="font-size: 0.7rem; letter-spacing: 0.05em">Aplikasi KeuanganKu Native PHP</span>
                <i class="bi bi-chevron-right text-muted" style="font-size: 0.8rem;"></i>
                <span class="text-dark fw-bold text-xs" style="font-size: 0.8rem;"><?= htmlspecialchars(ucwords(str_replace('_', ' ', $active_page))); ?></span>
            </div>
            
            <div class="d-flex align-items-center gap-2 font-monospace text-xs bg-light px-3 py-1.5 rounded-3 text-muted" style="font-size: 0.75rem;">
                <i class="bi bi-clock-fill text-primary"></i>
                <span>Waktu Server: <?= date('d M Y'); ?></span>
            </div>
        </header>

        <!-- Container for inner contents -->
        <div class="p-3 p-md-4 flex-grow-1 overflow-auto">
<script>
    function toggleSidebarMenu() {
        const sidebar = document.getElementById('sidebarMenu');
        const backdrop = document.getElementById('sidebarBackdrop');
        sidebar.classList.toggle('show');
        backdrop.classList.toggle('show');
    }
</script>
`;

export const PENGATURAN_PHP = `<?php
// pengaturan.php
// Halaman Pengaturan Aplikasi (Kelola Kategori Transaksi dan Pilih Tema Warna)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_username = $_SESSION['username'] ?? 'user';
$user_role = $_SESSION['role'] ?? 'admin';
$success_msg = "";
$error_msg = "";

// 1. Array Kategori Proteksi Sistem (Tidak boleh dihapus)
$system_categories = ['Gaji', 'Belanja', 'Transportasi', 'Makan & Minum', 'Tagihan', 'Freelance', 'Lainnya'];

// 2. Aksi: Ubah Tema Warna Aplikasi
if (isset($_POST['update_theme'])) {
    $new_theme = mysqli_real_escape_string($koneksi, $_POST['theme'] ?? 'slate');
    $valid_themes = ['slate', 'emerald', 'violet', 'crimson', 'amber'];
    
    if (in_array($new_theme, $valid_themes)) {
        $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
        $update_query = "UPDATE users SET theme = '$new_theme' WHERE username = '$db_username_escaped'";
        
        if (mysqli_query($koneksi, $update_query)) {
            $_SESSION['theme'] = $new_theme;
            $success_msg = "Tema warna aplikasi berhasil diperbarui menjadi " . ucwords($new_theme) . "!";
        } else {
            $error_msg = "Gagal memperbarui tema di database.";
        }
    } else {
        $error_msg = "Pilihan tema tidak valid.";
    }
}

// 3. Aksi: Tambah Kategori Baru
if (isset($_POST['add_category'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menambah kategori transaksi.";
    } else {
        $new_cat = trim($_POST['nama_kategori'] ?? '');
        $new_cat_clean = htmlspecialchars($new_cat);
        
        if (empty($new_cat)) {
            $error_msg = "Nama kategori tidak boleh kosong.";
        } else {
            $new_cat_escaped = mysqli_real_escape_string($koneksi, $new_cat);
            // Cek duplikasi
            $check_query = mysqli_query($koneksi, "SELECT id FROM kategori WHERE nama = '$new_cat_escaped'");
            if (mysqli_num_rows($check_query) > 0) {
                $error_msg = "Kategori dengan nama '$new_cat_clean' sudah terdaftar.";
            } else {
                $insert_query = "INSERT INTO kategori (nama) VALUES ('$new_cat_escaped')";
                if (mysqli_query($koneksi, $insert_query)) {
                    $success_msg = "Kategori baru '$new_cat_clean' berhasil ditambahkan!";
                } else {
                    $error_msg = "Gagal menambahkan kategori ke database.";
                }
            }
        }
    }
}

// 4. Aksi: Hapus Kategori
if (isset($_GET['delete_category'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menghapus kategori transaksi.";
    } else {
        $cat_id = intval($_GET['delete_category']);
        
        // Cari nama kategori berdasarkan ID
        $cat_query = mysqli_query($koneksi, "SELECT nama FROM kategori WHERE id = $cat_id");
        if ($cat_query && mysqli_num_rows($cat_query) > 0) {
            $cat_row = mysqli_fetch_assoc($cat_query);
            $cat_nama = $cat_row['nama'];
            
            // Cek proteksi sistem
            if (in_array($cat_nama, $system_categories)) {
                $error_msg = "Kategori bawaan system '$cat_nama' dilindungi dan tidak boleh dihapus.";
            } else {
                // Cek apakah ada transaksi aktif menggunakan kategori ini
                $cat_escaped = mysqli_real_escape_string($koneksi, $cat_nama);
                $check_trans = mysqli_query($koneksi, "SELECT COUNT(*) AS total FROM transaksi WHERE kategori = '$cat_escaped'");
                $trans_row = mysqli_fetch_assoc($check_trans);
                
                if ($trans_row['total'] > 0) {
                    $error_msg = "Kategori '$cat_nama' sedang digunakan oleh " . $trans_row['total'] . " transaksi aktif. Ubah atau hapus transaksi tersebut terlebih dahulu.";
                } else {
                    // Eksekusi hapus aman
                    $delete_query = "DELETE FROM kategori WHERE id = $cat_id";
                    if (mysqli_query($koneksi, $delete_query)) {
                        $success_msg = "Kategori '$cat_nama' berhasil dihapus dari database.";
                    } else {
                        $error_msg = "Gagal menghapus kategori.";
                    }
                }
            }
        } else {
            $error_msg = "Kategori tidak ditemukan.";
        }
    }
}

// Ambil semua kategori untuk ditampilkan
$all_categories = [];
$res_categories = mysqli_query($koneksi, "SELECT * FROM kategori ORDER BY id ASC");
if ($res_categories) {
    while ($row = mysqli_fetch_assoc($res_categories)) {
        $all_categories[] = $row;
    }
}

// 5. Aksi: Ubah Kustomisasi Tampilan Dashboard
if (isset($_POST['update_dashboard_config'])) {
    $show_card_in = isset($_POST['show_card_in']) ? 1 : 0;
    $show_card_out = isset($_POST['show_card_out']) ? 1 : 0;
    $show_card_balance = isset($_POST['show_card_balance']) ? 1 : 0;
    $show_chart_trend = isset($_POST['show_chart_trend']) ? 1 : 0;
    $show_chart_prop = isset($_POST['show_chart_prop']) ? 1 : 0;

    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $update_query = "UPDATE users SET 
        show_card_in = $show_card_in, 
        show_card_out = $show_card_out, 
        show_card_balance = $show_card_balance, 
        show_chart_trend = $show_chart_trend, 
        show_chart_prop = $show_chart_prop 
        WHERE username = '$db_username_escaped'";
        
    if (mysqli_query($koneksi, $update_query)) {
        $success_msg = "Pengaturan tampilan dashboard berhasil diperbarui!";
    } else {
        $error_msg = "Gagal memperbarui pengaturan dashboard di database.";
    }
}

// Ambil kustomisasi dashboard saat ini milik pengguna ini
$show_card_in = 1;
$show_card_out = 1;
$show_card_balance = 1;
$show_chart_trend = 1;
$show_chart_prop = 1;

if (isset($koneksi)) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $config_query = mysqli_query($koneksi, "SELECT show_card_in, show_card_out, show_card_balance, show_chart_trend, show_chart_prop FROM users WHERE username = '$db_username_escaped'");
    if ($config_query && mysqli_num_rows($config_query) > 0) {
        $config_row = mysqli_fetch_assoc($config_query);
        $show_card_in = isset($config_row['show_card_in']) ? (int)$config_row['show_card_in'] : 1;
        $show_card_out = isset($config_row['show_card_out']) ? (int)$config_row['show_card_out'] : 1;
        $show_card_balance = isset($config_row['show_card_balance']) ? (int)$config_row['show_card_balance'] : 1;
        $show_chart_trend = isset($config_row['show_chart_trend']) ? (int)$config_row['show_chart_trend'] : 1;
        $show_chart_prop = isset($config_row['show_chart_prop']) ? (int)$config_row['show_chart_prop'] : 1;
    }
}

// Set active page for sidebar
$active_page = 'pengaturan';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengaturan KeuanganKu - Pro</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
        }
        
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            background-color: #ffffff;
        }

        .theme-selection-card {
            border: 2px solid #f1f5f9;
            border-radius: 16px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .theme-selection-card:hover {
            border-color: #cbd5e1;
            transform: translateY(-2px);
        }

        .theme-selection-card.selected {
            border-color: var(--primary-color, #2563eb);
            background-color: rgba(var(--primary-rgb, 37, 99, 235), 0.03);
            box-shadow: 0 4px 12px rgba(var(--primary-rgb, 37, 99, 235), 0.08);
        }

        .badge-theme-dot {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-block;
        }

        .badge-cat {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 500;
            font-size: 0.85rem;
            padding: 8px 14px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #e2e8f0;
        }

        .badge-cat-system {
            background-color: #f8fafc;
            color: #64748b;
            border-style: dashed;
        }

        /* Custom Tab Styling */
        .settings-nav {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            margin-bottom: 24px;
        }
        
        .settings-nav .nav-link {
            color: #475569;
            font-weight: 600;
            font-size: 0.9rem;
            border-radius: 10px;
            padding: 10px 20px;
            border: none;
            transition: all 0.25s ease;
            background: transparent;
        }
        
        .settings-nav .nav-link:hover {
            color: #1e293b;
            background-color: #f1f5f9;
        }
    </style>
</head>
<body>

<?php include 'sidebar.php'; ?>

<style>
    /* Dynamic Active state colored based on active theme config */
    .settings-nav .nav-link.active {
        color: #ffffff !important;
        background-color: <?= $theme_cfg['primary']; ?> !important;
        box-shadow: 0 4px 12px rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }
</style>

<!-- Content Area -->
<div class="container-fluid py-2">
    
    <!-- Notifikasi Sukses / Gagal -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
            <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
            <div>
                <strong class="text-success-800 d-block">Berhasil!</strong>
                <span class="small text-slate-600"><?= $success_msg; ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
            <div>
                <strong class="text-danger-800 d-block">Terjadi Kesalahan!</strong>
                <span class="small text-slate-600"><?= $error_msg; ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Tabs Navigation -->
    <div class="row mb-2">
        <div class="col-12 col-md-10 col-lg-8 mx-auto">
            <ul class="nav nav-pills nav-fill settings-nav p-1" id="settingsTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="tab-tema" data-bs-toggle="pill" data-bs-target="#pane-tema" type="button" role="tab" aria-controls="pane-tema" aria-selected="true">
                        <i class="bi bi-palette-fill me-2"></i>Tema Warna
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-dashboard" data-bs-toggle="pill" data-bs-target="#pane-dashboard" type="button" role="tab" aria-controls="pane-dashboard" aria-selected="false">
                        <i class="bi bi-sliders me-2"></i>Desain Dashboard
                    </button>
                </li>
                <?php if ($user_role !== 'user'): ?>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-kategori" data-bs-toggle="pill" data-bs-target="#pane-kategori" type="button" role="tab" aria-controls="pane-kategori" aria-selected="false">
                        <i class="bi bi-tags-fill me-2"></i>Kategori Transaksi
                    </button>
                </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>

    <!-- Tabs Content Panes -->
    <div class="tab-content" id="settingsTabContent">
        
        <!-- 1. TAB TEMA WARNA -->
        <div class="tab-pane fade show active" id="pane-tema" role="tabpanel" aria-labelledby="tab-tema">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block">
                                <i class="bi bi-palette-fill text-primary class-fs-4 fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Tema Warna Aplikasi</h4>
                                <p class="text-muted small mb-0">Ubah nuansa visual dasbor & sidebar personal Anda</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST">
                            <input type="hidden" name="update_theme" value="1">
                            
                            <div class="d-flex flex-column gap-3 mb-4">
                                <!-- Theme Slate -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'slate') ? 'selected' : ''; ?>" for="theme_slate">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #2563eb;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Modern Slate (Default)</h6>
                                            <span class="text-muted small">Warna biru korporat profesional dengan sidebar gelap</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_slate" value="slate" <?= ($current_theme === 'slate') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Emerald -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'emerald') ? 'selected' : ''; ?>" for="theme_emerald">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #059669;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Emerald Forest</h6>
                                            <span class="text-muted small">Sentuhan hijau segar yang melambangkan kemakmuran finansial</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_emerald" value="emerald" <?= ($current_theme === 'emerald') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Violet -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'violet') ? 'selected' : ''; ?>" for="theme_violet">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #7c3aed;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Royal Violet</h6>
                                            <span class="text-muted small">Nuansa ungu mewah dengan visual modern yang eksklusif</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_violet" value="violet" <?= ($current_theme === 'violet') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Crimson -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'crimson') ? 'selected' : ''; ?>" for="theme_crimson">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #dc2626;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Charcoal Crimson</h6>
                                            <span class="text-muted small">Aksen merah gelap elegan yang berani dan energik</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_crimson" value="crimson" <?= ($current_theme === 'crimson') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Amber -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'amber') ? 'selected' : ''; ?>" for="theme_amber">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #d97706;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Amber Sunset</h6>
                                            <span class="text-muted small">Warna jingga hangat yang bersahabat dan penuh semangat</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_amber" value="amber" <?= ($current_theme === 'amber') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>
                            </div>

                            <div class="d-grid col-md-8 mx-auto">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> Simpan Pilihan Tema Warna
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. TAB DESAIN DASHBOARD -->
        <div class="tab-pane fade" id="pane-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block">
                                <i class="bi bi-sliders text-primary fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Atur Komponen Dashboard</h4>
                                <p class="text-muted small mb-0">Aktifkan atau sembunyikan grafik dan kartu keuangan Anda</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST">
                            <input type="hidden" name="update_dashboard_config" value="1">
                            
                            <h6 class="fw-bold text-slate-800 mb-3 border-bottom pb-2">
                                <i class="bi bi-card-checklist text-primary me-2"></i>Kartu Ringkasan (Cards)
                            </h6>
                            
                            <div class="mb-4">
                                <!-- Card Pemasukan Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(16, 185, 129, 0.1); color: #10b981;">
                                            <i class="bi bi-graph-up-arrow"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_card_in">Kartu Total Pemasukan</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_card_in" name="show_card_in" value="1" <?= $show_card_in ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>

                                <!-- Card Pengeluaran Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444;">
                                            <i class="bi bi-graph-down-arrow"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_card_out">Kartu Total Pengeluaran</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_card_out" name="show_card_out" value="1" <?= $show_card_out ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>

                                <!-- Card Saldo Akhir Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(37, 99, 235, 0.1); color: #2563eb;">
                                            <i class="bi bi-cash-stack"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_card_balance">Kartu Saldo Akhir</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_card_balance" name="show_card_balance" value="1" <?= $show_card_balance ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>
                            </div>

                            <h6 class="fw-bold text-slate-800 mb-3 border-bottom pb-2">
                                <i class="bi bi-pie-chart text-primary me-2"></i>Komponen Grafik (Charts)
                            </h6>

                            <div class="mb-4">
                                <!-- Chart Arus Kas Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(6, 182, 212, 0.1); color: #06b6d4;">
                                            <i class="bi bi-activity"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_chart_trend">Grafik Tren Aliran Dana (Garis)</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_chart_trend" name="show_chart_trend" value="1" <?= $show_chart_trend ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>

                                <!-- Chart Proporsi Kategori Toggle -->
                                <div class="form-check form-switch mb-4 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(245, 158, 11, 0.1); color: #f59e0b;">
                                            <i class="bi bi-pie-chart-fill"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_chart_prop">Grafik Proporsi Kategori (Donat)</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_chart_prop" name="show_chart_prop" value="1" <?= $show_chart_prop ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>
                            </div>

                            <div class="d-grid col-md-8 mx-auto">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-save2-fill me-1.5"></i> Simpan Konfigurasi Dashboard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. TAB KATEGORI TRANSAKSI -->
        <?php if ($user_role !== 'user'): ?>
        <div class="tab-pane fade" id="pane-kategori" role="tabpanel" aria-labelledby="tab-kategori">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="card main-card p-4 p-md-5 h-100 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block">
                                <i class="bi bi-tag-fill text-primary fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Kategori Transaksi</h4>
                                <p class="text-muted small mb-0">Kelola kategori aliran kas masuk dan keluar aplikasi Anda</p>
                            </div>
                        </div>

                        <!-- Form: Tambah Kategori Baru -->
                        <form action="pengaturan.php" method="POST" class="mb-4 bg-light p-4 rounded-4 border border-light-subtle">
                            <input type="hidden" name="add_category" value="1">
                            <label for="nama_kategori" class="form-label fw-bold text-slate-800 mb-2">Tambah Kategori Baru</label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-tags"></i></span>
                                <input type="text" class="form-control border-start-0 ps-0" id="nama_kategori" name="nama_kategori" placeholder="Contoh: Hiburan, Investasi" required maxlength="50">
                                <button type="submit" class="btn btn-primary px-4 fw-bold">
                                    <i class="bi bi-plus-circle-fill me-1"></i> Tambah
                                </button>
                            </div>
                            <div class="form-text text-muted mt-2 small">Nama kategori bersifat unik dan maksimal 50 karakter.</div>
                        </form>

                        <!-- Daftar Kategori Aktif -->
                        <h6 class="fw-bold text-dark mb-3">Daftar Kategori Terdaftar</h6>
                        <div class="d-flex flex-wrap gap-2.5 overflow-auto pr-1" style="max-height: 400px;">
                            <?php if (empty($all_categories)): ?>
                                <p class="text-muted mb-0 small italic">Belum ada kategori terdaftar.</p>
                            <?php else: ?>
                                <?php foreach ($all_categories as $cat): ?>
                                    <?php 
                                    $is_system = in_array($cat['nama'], $system_categories); 
                                    $badge_class = $is_system ? 'badge-cat badge-cat-system' : 'badge-cat';
                                    ?>
                                    <div class="<?= $badge_class; ?>">
                                        <span><?= htmlspecialchars($cat['nama']); ?></span>
                                        <?php if ($is_system): ?>
                                            <span class="badge bg-secondary rounded-2" style="font-size: 0.65rem; padding: 2px 4px; opacity: 0.85;">System</span>
                                        <?php else: ?>
                                            <a href="pengaturan.php?delete_category=<?= $cat['id']; ?>" class="text-danger hover:text-dark-danger transition-colors" onclick="return confirm('Apakah Anda yakin ingin menghapus kategori \'<?= htmlspecialchars($cat['nama']); ?>\'?');" title="Hapus Kategori">
                                                <i class="bi bi-trash3-fill" style="font-size: 0.85rem;"></i>
                                            </a>
                                        <?php endif; ?>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>
        
    </div>

</div>

<!-- Footer area -->
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
    // Tab persistence with localStorage
    const activeTabId = localStorage.getItem('activeSettingsTab');
    if (activeTabId) {
        const tabEl = document.querySelector('#' + activeTabId);
        if (tabEl) {
            const tab = new bootstrap.Tab(tabEl);
            tab.show();
        }
    }

    document.querySelectorAll('button[data-bs-toggle="pill"]').forEach(tabBtn => {
        tabBtn.addEventListener('shown.bs.tab', function (event) {
            localStorage.setItem('activeSettingsTab', event.target.id);
        });
    });

    // Penanganan interaksi UI klik pada kartu seleksi tema kustom agar radio otomatis terceklis
    document.querySelectorAll('.theme-selection-card').forEach(card => {
        card.addEventListener('click', function() {
            // Uncheck other selections visually
            document.querySelectorAll('.theme-selection-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            // Check the internal radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
</script>
</body>
</html>`;

export const LAPORAN_PHP = `<?php
// laporan.php
// Halaman laporan keuangan dengan filter dinamis dan ekspor Excel & PDF

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_role = $_SESSION['role'] ?? 'admin';
$user_username = $_SESSION['username'] ?? 'user';

// Ambil parameter filter dari GET
$filter_jenis = $_GET['jenis'] ?? '';
$filter_kategori = $_GET['kategori'] ?? '';
$filter_mulai = $_GET['start_date'] ?? '';
$filter_selesai = $_GET['end_date'] ?? '';

// Membangun query bersyarat dinamis
$conds = [];

// Proteksi level 'user' -> hanya bisa akses transaksi milik dia sendiri
if ($user_role === 'user') {
    $conds[] = "username = '" . mysqli_real_escape_string($koneksi, $user_username) . "'";
}

if (!empty($filter_jenis) && in_array($filter_jenis, ['pemasukan', 'pengeluaran'])) {
    $conds[] = "jenis = '" . mysqli_real_escape_string($koneksi, $filter_jenis) . "'";
}

if (!empty($filter_kategori)) {
    $conds[] = "kategori = '" . mysqli_real_escape_string($koneksi, $filter_kategori) . "'";
}

if (!empty($filter_mulai)) {
    $conds[] = "tanggal >= '" . mysqli_real_escape_string($koneksi, $filter_mulai) . "'";
}

if (!empty($filter_selesai)) {
    $conds[] = "tanggal <= '" . mysqli_real_escape_string($koneksi, $filter_selesai) . "'";
}

$where_clause = "";
if (count($conds) > 0) {
    $where_clause = "WHERE " . implode(" AND ", $conds);
}

// 1. Ekspor Excel jika diminta
if (isset($_GET['export']) && $_GET['export'] === 'excel') {
    header("Content-Type: application/vnd.ms-excel; charset=UTF-8");
    header("Content-Disposition: attachment; filename=Laporan_Keuangan_" . date('Ymd_His') . ".xls");
    header("Pragma: no-cache");
    header("Expires: 0");

    // Hitung Saldo Awal sebelum tanggal filter_mulai untuk Excel
    $saldo_awal = 0;
    $conds_awal = [];
    if ($user_role === 'user') {
        $conds_awal[] = "username = '" . mysqli_real_escape_string($koneksi, $user_username) . "'";
    }
    if (!empty($filter_kategori)) {
        $conds_awal[] = "kategori = '" . mysqli_real_escape_string($koneksi, $filter_kategori) . "'";
    }
    if (!empty($filter_mulai)) {
        $conds_awal[] = "tanggal < '" . mysqli_real_escape_string($koneksi, $filter_mulai) . "'";
        $where_awal = "WHERE " . implode(" AND ", $conds_awal);
        
        $q_pem_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pemasukan'");
        $q_pen_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pengeluaran'");
        
        $val_pem_awal = mysqli_fetch_assoc($q_pem_awal)['total'] ?? 0;
        $val_pen_awal = mysqli_fetch_assoc($q_pen_awal)['total'] ?? 0;
        $saldo_awal = $val_pem_awal - $val_pen_awal;
    }

    // Query data berdasarkan filter untuk Excel
    $query_excel = "SELECT * FROM transaksi \$where_clause ORDER BY tanggal ASC, id ASC";
    $result_excel = mysqli_query($koneksi, $query_excel);

    // Ambil rekap untuk Excel
    $q_pem_excel = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pemasukan'" : "WHERE jenis='pemasukan'");
    $q_pen_excel = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pengeluaran'" : "WHERE jenis='pengeluaran'");
    
    $res_pem = mysqli_query($koneksi, $q_pem_excel);
    $row_pem = mysqli_fetch_assoc($res_pem);
    $total_pem = $row_pem['total'] ?? 0;

    $res_pen = mysqli_query($koneksi, $q_pen_excel);
    $row_pen = mysqli_fetch_assoc($res_pen);
    $total_pen = $row_pen['total'] ?? 0;
    
    $saldo_akhir = $saldo_awal + $total_pem - $total_pen;
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
            th { background-color: #2563eb; color: #ffffff; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 8px; }
            .judul { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-align: center; }
            .subjudul { font-size: 12px; color: #64748b; margin-bottom: 20px; text-align: center; }
            .text-success { color: #10b981; font-weight: bold; }
            .text-danger { color: #ef4444; font-weight: bold; }
            .rekap-table { margin-bottom: 20px; width: 350px; }
            .rekap-table th { background-color: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; }
        </style>
    </head>
    <body>
        <div class="judul">LAPORAN REKAPITULASI KEUANGAN (DEBIT & KREDIT)</div>
        <div class="subjudul">Diekspor Pada: <?= date('d-m-Y H:i:s'); ?> | Pengguna: <?= htmlspecialchars($user_username); ?></div>

        <table class="rekap-table">
            <tr>
                <th colspan="2">RINGKASAN REKAPITULASI KEUANGAN</th>
            </tr>
            <tr>
                <td>Saldo Awal Periode</td>
                <td><strong>Rp <?= number_format($saldo_awal, 0, ',', '.'); ?></strong></td>
            </tr>
            <tr>
                <td>Total Kas Masuk (Debit)</td>
                <td class="text-success">Rp <?= number_format($total_pem, 0, ',', '.'); ?></td>
            </tr>
            <tr>
                <td>Total Kas Keluar (Kredit)</td>
                <td class="text-danger">Rp <?= number_format($total_pen, 0, ',', '.'); ?></td>
            </tr>
            <tr>
                <td><strong>Saldo Akhir Kumulatif</strong></td>
                <td><strong>Rp <?= number_format($saldo_akhir, 0, ',', '.'); ?></strong></td>
            </tr>
        </table>

        <table>
            <thead>
                <tr>
                    <th style="width: 50px;">No</th>
                    <th style="width: 120px;">Tanggal</th>
                    <th>Keterangan Transaksi</th>
                    <th style="width: 150px;">Kategori</th>
                    <th style="width: 150px; text-align: right;">Debit (Pemasukan)</th>
                    <th style="width: 150px; text-align: right;">Kredit (Pengeluaran)</th>
                    <th style="width: 150px; text-align: right;">Saldo Berjalan</th>
                </tr>
            </thead>
            <tbody>
                <!-- Baris Saldo Awal -->
                <tr style="background-color: #f8fafc; font-weight: bold;">
                    <td>-</td>
                    <td>-</td>
                    <td><strong>SALDO AWAL ACUAN</strong></td>
                    <td>-</td>
                    <td style="text-align: right;">-</td>
                    <td style="text-align: right;">-</td>
                    <td style="text-align: right;">Rp <?= number_format($saldo_awal, 0, ',', '.'); ?></td>
                </tr>
                <?php 
                $num = 1;
                $running_balance = $saldo_awal;
                if (mysqli_num_rows($result_excel) > 0): 
                    while ($row = mysqli_fetch_assoc($result_excel)): 
                        if ($row['jenis'] === 'pemasukan') {
                            $running_balance += $row['jumlah'];
                            $debit = $row['jumlah'];
                            $kredit = 0;
                        } else {
                            $running_balance -= $row['jumlah'];
                            $debit = 0;
                            $kredit = $row['jumlah'];
                        }
                        ?>
                        <tr>
                            <td><?= $num++; ?></td>
                            <td><?= date('d-m-Y', strtotime($row['tanggal'])); ?></td>
                            <td><?= htmlspecialchars($row['keterangan']); ?></td>
                            <td><?= htmlspecialchars($row['kategori']); ?></td>
                            <td style="text-align: right; color: #10b981;">
                                <?= $debit > 0 ? 'Rp ' . number_format($debit, 0, ',', '.') : '-'; ?>
                            </td>
                            <td style="text-align: right; color: #ef4444;">
                                <?= $kredit > 0 ? 'Rp ' . number_format($kredit, 0, ',', '.') : '-'; ?>
                            </td>
                            <td style="text-align: right; font-weight: bold;">
                                Rp <?= number_format($running_balance, 0, ',', '.'); ?>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                    <!-- Baris Total Paling Bawah -->
                    <tr style="background-color: #f1f5f9; font-weight: bold;">
                        <td colspan="4" style="text-align: right;">TOTAL:</td>
                        <td style="text-align: right; color: #10b981;">Rp <?= number_format($total_pem, 0, ',', '.'); ?></td>
                        <td style="text-align: right; color: #ef4444;">Rp <?= number_format($total_pen, 0, ',', '.'); ?></td>
                        <td style="text-align: right; color: <?= $saldo_akhir >= 0 ? '#2563eb' : '#ef4444'; ?>;">Rp <?= number_format($saldo_akhir, 0, ',', '.'); ?></td>
                    </tr>
                <?php else: ?>
                    <tr>
                        <td colspan="7" style="text-align: center;">Tidak ada data transaksi yang cocok dengan filter.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </body>
    </html>
    <?php
    exit();
}

// Hitung Saldo Awal sebelum tanggal filter_mulai untuk Tampilan Web
$saldo_awal = 0;
$conds_awal = [];
if ($user_role === 'user') {
    $conds_awal[] = "username = '" . mysqli_real_escape_string($koneksi, $user_username) . "'";
}
if (!empty($filter_kategori)) {
    $conds_awal[] = "kategori = '" . mysqli_real_escape_string($koneksi, $filter_kategori) . "'";
}
if (!empty($filter_mulai)) {
    $conds_awal[] = "tanggal < '" . mysqli_real_escape_string($koneksi, $filter_mulai) . "'";
    $where_awal = "WHERE " . implode(" AND ", $conds_awal);
    
    $q_pem_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pemasukan'");
    $q_pen_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pengeluaran'");
    
    $val_pem_awal = mysqli_fetch_assoc($q_pem_awal)['total'] ?? 0;
    $val_pen_awal = mysqli_fetch_assoc($q_pen_awal)['total'] ?? 0;
    $saldo_awal = $val_pem_awal - $val_pen_awal;
}

// Formulasi query untuk halaman HTML interaktif
$query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pemasukan'" : "WHERE jenis='pemasukan'");
$res_pemasukan = mysqli_query($koneksi, $query_pemasukan);
$row_pemasukan = mysqli_fetch_assoc($res_pemasukan);
$total_pemasukan = $row_pemasukan['total'] ?? 0;

$query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pengeluaran'" : "WHERE jenis='pengeluaran'");
$res_pengeluaran = mysqli_query($koneksi, $query_pengeluaran);
$row_pengeluaran = mysqli_fetch_assoc($res_pengeluaran);
$total_pengeluaran = $row_pengeluaran['total'] ?? 0;

$saldo_akhir = $saldo_awal + $total_pemasukan - $total_pengeluaran;

$query_transaksi = "SELECT * FROM transaksi \$where_clause ORDER BY tanggal ASC, id ASC";
$result_transaksi = mysqli_query($koneksi, $query_transaksi);

// Ambil daftar kategori unik untuk filter dropdown
$query_cats = mysqli_query($koneksi, "SELECT * FROM kategori ORDER BY nama ASC");
$all_categories = [];
if ($query_cats) {
    while ($c = mysqli_fetch_assoc($query_cats)) {
        $all_categories[] = $c;
    }
}

// Fungsi Helper format Rupiah
if (!function_exists('rupiah')) {
    function rupiah($angka) {
        return "Rp " . number_format($angka, 0, ',', '.');
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeuanganKu - Laporan Komprehensif</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            background: #ffffff;
        }
        .text-pemasukan {
            color: #10b981 !important;
        }
        .text-pengeluaran {
            color: #ef4444 !important;
        }
        .badge-cat {
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            padding: 4px 8px;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 6px;
        }
        
        /* Media Print Styling kustom untuk Ekspor PDF Sempurna */
        @media print {
            /* Sembunyikan elemen navigasi sidebar, filter card, tombol, dll */
            .sidebar-container, 
            .mobile-header, 
            .top-header-bar, 
            .filter-card, 
            .btn-export-group, 
            .btn, 
            hr, 
            .user-profile-section,
            footer {
                display: none !important;
            }
            
            /* Netralkan pembungkus layout flexbox agar halaman mengalir biasa tanpa batasan kontainer */
            html, body {
                height: auto !important;
                min-height: auto !important;
                overflow: visible !important;
                background: #ffffff !important;
                color: #000000 !important;
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .app-layout-wrapper {
                display: block !important;
                width: 100% !important;
                min-height: auto !important;
                height: auto !important;
                overflow: visible !important;
            }

            .main-canvas-area {
                display: block !important;
                width: 100% !important;
                height: auto !important;
                min-height: auto !important;
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
            }

            .container-fluid {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            /* Hilangkan bayangan, border, dan batasan overflow pada card/tabel */
            .card {
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
            }

            .card-body {
                padding: 0 !important;
                overflow: visible !important;
            }

            /* Netralkan scrollbar table-responsive agar table merentang utuh secara horizontal */
            .table-responsive {
                overflow: visible !important;
                overflow-x: visible !important;
                overflow-y: visible !important;
                display: block !important;
                width: 100% !important;
            }

            table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: auto !important;
            }

            tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
            }

            .table th {
                background-color: #f1f5f9 !important;
                color: #00050a !important;
                border: 1px solid #475569 !important;
                font-weight: bold !important;
                padding: 10px 12px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .table td {
                border: 1px solid #94a3b8 !important;
                padding: 10px 12px !important;
                background-color: transparent !important;
                color: #000000 !important;
            }

            /* Penyesuaian baris info saldo awal dan total */
            tr.table-info {
                background-color: #e0f2fe !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            tr.bg-light-subtle {
                background-color: #f1f5f9 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .print-header {
                display: block !important;
                margin-top: 10px;
                margin-bottom: 25px;
                text-align: center;
                border-bottom: 3px double #1e293b;
                padding-bottom: 15px;
            }
        }
    </style>
</head>
<body>

<?php
$active_page = 'laporan';
include 'sidebar.php';
?>

<div class="container-fluid py-4">
    
    <!-- Bagian Kepala Print (Disembunyikan di layar, ditampilkan hanya ketika dicetak) -->
    <div class="print-header d-none text-center">
        <h3 class="fw-bold text-dark text-uppercase mb-1">Laporan Catatan Transaksi Keuangan</h3>
        <p class="text-muted small mb-0">Dicetak melalui portal online KeuanganKu pada: <?= date('d-m-Y H:i:s'); ?> | Petugas: <?= htmlspecialchars($_SESSION['nama']); ?></p>
        <hr class="border-secondary mt-3 mb-4" style="opacity: 0.5;">
    </div>

    <!-- Header & Tombol Print Utama -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
            <h3 class="fw-black text-slate-800 tracking-tight mb-1">Laporan Keuangan</h3>
            <p class="text-muted mb-0 small">Saring data arus kas secara akurat dan ekspor ke lembar kerja Excel atau cetak PDF langsung.</p>
        </div>
        
        <!-- Action Group -->
        <div class="d-flex flex-wrap gap-2 btn-export-group">
            <button onclick="window.print();" class="btn btn-outline-danger d-flex align-items-center gap-2 rounded-3 px-3.5 py-2 fw-bold text-xs" style="background-color: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2)">
                <i class="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                <span>Cetak / Ekspor PDF</span>
            </button>
            <a href="laporan.php?export=excel&jenis=<?= urlencode($filter_jenis) ?>&kategori=<?= urlencode($filter_kategori) ?>&start_date=<?= urlencode($filter_mulai) ?>&end_date=<?= urlencode($filter_selesai) ?>" class="btn btn-outline-success d-flex align-items-center gap-2 rounded-3 px-3.5 py-2 fw-bold text-xs" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2)">
                <i class="bi bi-file-earmark-spreadsheet-fill text-success fs-5"></i>
                <span>Ekspor ke Excel (.XLS)</span>
            </a>
        </div>
    </div>

    <!-- Panel Filter Komprehensif -->
    <div class="card main-card filter-card p-4 mb-4">
        <form action="laporan.php" method="GET" class="row g-3">
            <div class="col-md-3">
                <label for="jenis" class="form-label text-xs fw-extrabold text-slate-700">Tipe Aliran Dana</label>
                <select class="form-select rounded-3 text-xs" id="jenis" name="jenis">
                    <option value="" <?= ($filter_jenis === '') ? 'selected' : ''; ?>>Semua Aliran (Kas Masuk & Keluar)</option>
                    <option value="pemasukan" <?= ($filter_jenis === 'pemasukan') ? 'selected' : ''; ?>>Pemasukan Saja (+)</option>
                    <option value="pengeluaran" <?= ($filter_jenis === 'pengeluaran') ? 'selected' : ''; ?>>Pengeluaran Saja (-)</option>
                </select>
            </div>
            
            <div class="col-md-3">
                <label for="kategori" class="form-label text-xs fw-extrabold text-slate-700">Kategori Khusus</label>
                <select class="form-select rounded-3 text-xs" id="kategori" name="kategori">
                    <option value="" <?= ($filter_kategori === '') ? 'selected' : ''; ?>>Semua Kategori</option>
                    <?php foreach ($all_categories as $cat): ?>
                        <option value="<?= htmlspecialchars($cat['nama']); ?>" <?= ($filter_kategori === $cat['nama']) ? 'selected' : ''; ?>>
                            <?= htmlspecialchars($cat['nama']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="col-md-2.5 col-sm-6">
                <label for="start_date" class="form-label text-xs fw-extrabold text-slate-700">Tanggal Mulai</label>
                <input type="date" class="form-control rounded-3 text-xs" id="start_date" name="start_date" value="<?= htmlspecialchars($filter_mulai); ?>">
            </div>

            <div class="col-md-2.5 col-sm-6">
                <label for="end_date" class="form-label text-xs fw-extrabold text-slate-700">Tanggal Akhir</label>
                <input type="date" class="form-control rounded-3 text-xs" id="end_date" name="end_date" value="<?= htmlspecialchars($filter_selesai); ?>">
            </div>

            <div class="col-md-1 d-grid align-items-end">
                <button type="submit" class="btn btn-primary rounded-3 text-center fw-extrabold py-2 d-flex align-items-center justify-content-center" style="min-height: 38px;">
                    <i class="bi bi-funnel-fill"></i>
                </button>
            </div>
        </form>
    </div>

    <!-- Ringkasan Filter Terkait -->
    <div class="row g-4 mb-4">
        <!-- Pemasukan Terfilter -->
        <div class="col-md-4">
            <div class="card v-card-sum border-start border-success border-5 h-100 p-3 bg-white">
                <div class="card-body py-1">
                    <span class="text-uppercase small fw-bold text-muted d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.05em">Pemasukan (Terfilter)</span>
                    <span class="fs-4 fw-black text-pemasukan"><?= rupiah($total_pemasukan); ?></span>
                </div>
            </div>
        </div>
        
        <!-- Pengeluaran Terfilter -->
        <div class="col-md-4">
            <div class="card v-card-sum border-start border-danger border-5 h-100 p-3 bg-white">
                <div class="card-body py-1">
                    <span class="text-uppercase small fw-bold text-muted d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.05em">Pengeluaran (Terfilter)</span>
                    <span class="fs-4 fw-black text-pengeluaran"><?= rupiah($total_pengeluaran); ?></span>
                </div>
            </div>
        </div>

        <!-- Saldo Bersih -->
        <div class="col-md-4">
            <div class="card v-card-sum border-start border-primary border-5 h-100 p-3 bg-white">
                <div class="card-body py-1">
                    <span class="text-uppercase small fw-bold text-muted d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.05em">Saldo Bersih Terfilter</span>
                    <span class="fs-4 fw-black <?= ($saldo_akhir >= 0) ? 'text-primary' : 'text-danger'; ?>">
                        <?= rupiah($saldo_akhir); ?>
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Tabel Data Utama Terlapor -->
    <div class="card main-card overflow-hidden">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
                    <thead class="bg-light table-light">
                        <tr>
                            <th class="py-3 px-4 text-center text-muted text-uppercase fw-bold font-monospace" style="width: 60px;">No</th>
                            <th class="py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 120px;">Tanggal</th>
                            <th class="py-3 text-muted text-uppercase fw-bold font-monospace">Keterangan</th>
                            <th class="py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 140px;">Kategori</th>
                            <th class="py-3 text-end text-muted text-uppercase fw-bold font-monospace" style="width: 155px;">Debit (Pemasukan)</th>
                            <th class="py-3 text-end text-muted text-uppercase fw-bold font-monospace" style="width: 155px;">Kredit (Pengeluaran)</th>
                            <th class="py-3 text-end text-muted text-uppercase fw-bold font-monospace" style="width: 170px; padding-right: 24px;">Saldo Berjalan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Baris Saldo Awal Acuan -->
                        <tr class="table-info border-bottom border-light-subtle" style="background-color: rgba(13, 202, 240, 0.05);">
                            <td class="py-3 text-center font-monospace font-semibold text-muted">-</td>
                            <td class="py-3 font-monospace font-medium text-muted">-</td>
                            <td class="py-3 fw-bold text-slate-800">
                                <i class="bi bi-wallet2 text-info me-2"></i> SALDO AWAL PERIODE
                            </td>
                            <td class="py-3 text-muted">-</td>
                            <td class="py-3 text-end text-muted">-</td>
                            <td class="py-3 text-end text-muted">-</td>
                            <td class="py-3 text-end font-monospace fw-bold text-info" style="padding-right: 24px;">
                                <?= rupiah($saldo_awal); ?>
                            </td>
                        </tr>

                        <?php 
                        $no = 1;
                        $running_balance = $saldo_awal;
                        if (mysqli_num_rows($result_transaksi) > 0): 
                            while ($row = mysqli_fetch_assoc($result_transaksi)): 
                                if ($row['jenis'] === 'pemasukan') {
                                    $running_balance += $row['jumlah'];
                                    $debit = $row['jumlah'];
                                    $kredit = 0;
                                } else {
                                    $running_balance -= $row['jumlah'];
                                    $debit = 0;
                                    $kredit = $row['jumlah'];
                                }
                                ?>
                                <tr class="border-bottom border-light-subtle">
                                    <td class="py-3.5 text-center font-monospace font-semibold text-slate-500"><?= $no++; ?></td>
                                    <td class="py-3.5 font-monospace font-medium">
                                        <?= date('d-m-Y', strtotime($row['tanggal'])); ?>
                                    </td>
                                    <td class="py-3.5">
                                        <div class="fw-semibold text-slate-800 text-truncate" style="max-width: 300px;" title="<?= htmlspecialchars($row['keterangan']); ?>">
                                            <?= htmlspecialchars($row['keterangan']); ?>
                                        </div>
                                    </td>
                                    <td class="py-3.5">
                                        <span class="badge rounded bg-secondary-subtle text-secondary px-2 py-1 text-xs">
                                            <?= htmlspecialchars($row['kategori']); ?>
                                        </span>
                                    </td>
                                    <td class="py-3.5 text-end font-monospace font-semibold text-success">
                                        <?= $debit > 0 ? rupiah($debit) : '-'; ?>
                                    </td>
                                    <td class="py-3.5 text-end font-monospace font-semibold text-danger">
                                        <?= $kredit > 0 ? rupiah($kredit) : '-'; ?>
                                    </td>
                                    <td class="py-3.5 text-end font-monospace font-bold card-text-val align-middle" style="padding-right: 24px; color: <?= $running_balance >= 0 ? '#1e293b' : '#ef4444'; ?>;">
                                        <?= rupiah($running_balance); ?>
                                    </td>
                                </tr>
                            <?php endwhile; ?>

                            <!-- Baris Total Kumulatif -->
                            <tr class="bg-light-subtle table-light border-top border-dark-subtle" style="border-width: 2px !important; font-size: 0.9rem;">
                                <td colspan="4" class="py-3 text-end fw-bold text-uppercase text-slate-700">Total Periode Ini:</td>
                                <td class="py-3 text-end font-monospace fw-bold text-success">
                                    <?= rupiah($total_pemasukan); ?>
                                </td>
                                <td class="py-3 text-end font-monospace fw-bold text-danger">
                                    <?= rupiah($total_pengeluaran); ?>
                                </td>
                                <td class="py-3 text-end font-monospace fw-black text-primary" style="padding-right: 24px; color: <?= $saldo_akhir >= 0 ? '#2563eb' : '#ef4444'; ?> !important;">
                                    <?= rupiah($saldo_akhir); ?>
                                </td>
                            </tr>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="bi bi-journal-x fs-1 mb-3 text-secondary d-block"></i>
                                    <h5>Tidak Ada Data Yang Ditemukan</h5>
                                    <p class="small text-muted mb-0">Sesuaikan kriteria filter di atas untuk mengeksplorasi kembali catatan.</p>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
</div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;


