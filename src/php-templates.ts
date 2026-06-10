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
    die("
    <div style='font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 60px auto; padding: 30px; border-radius: 16px; background-color: #fef2f2; border: 1px solid #fca5a5; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);'>
        <div style='display: flex; align-items: center; margin-bottom: 20px;'>
            <div style='background-color: #fee2e2; padding: 10px; border-radius: 50%; margin-right: 15px; color: #ef4444;'>
                <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polygon points='7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2'></polygon><line x1='12' y1='8' x2='12' y2='12'></line><line x1='12' y1='16' x2='12.01' y2='16'></line></svg>
            </div>
            <h2 style='color: #991b1b; margin: 0; font-weight: 700; font-size: 22px;'>Gagal Menghubungi Server MySQL!</h2>
        </div>
        
        <p style='color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;'>
            Aplikasi <strong>KeuanganKu</strong> tidak dapat terhubung ke server database MySQL Anda menggunakan kredensial di <code>koneksi.php</code>.
        </p>
        
        <div style='background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #f3f4f6; font-family: monospace; font-size: 13.5px; color: #b91c1c; margin-bottom: 25px;'>
            <strong>Detail Masalah:</strong> " . mysqli_connect_error() . "
        </div>
        
        <h3 style='color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;'>Langkah Solusi untuk XAMPP:</h3>
        <ol style='color: #4b5563; font-size: 14.5px; line-height: 1.6; padding-left: 20px; margin-bottom: 25px;'>
            <li style='margin-bottom: 8px;'>Pastikan aplikasi <strong>XAMPP Control Panel</strong> Anda sudah dibuka.</li>
            <li style='margin-bottom: 8px;'>Klik tombol <strong>Start</strong> di samping modul <strong>Apache</strong> dan <strong>MySQL</strong> hingga berwarna hijau.</li>
            <li style='margin-bottom: 8px;'>Buka file <code>koneksi.php</code> dan pastikan kredensial di bawah sudah cocok:
                <ul style='padding-left: 20px; margin-top: 5px; list-style-type: circle;'>
                    <li><code>\$db_host = \"$db_host\";</code></li>
                    <li><code>\$db_user = \"root\";</code> (Default XAMPP)</li>
                    <li><code>\$db_pass = \"\";</code> (Default XAMPP password dikosongkan)</li>
                </ul>
            </li>
        </ol>
        
        <button onclick='window.location.reload()' style='background-color: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s;'>
            Segarkan Halaman & Hubungkan Kembali
        </button>
    </div>");
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_users);

    // 2. Isi Akun Default (Password: admin123)
    $hashed_pw = password_hash('admin123', PASSWORD_DEFAULT);
    $sql_insert_users = "INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`nama\`, \`role\`) VALUES
    (1, 'admin', '$hashed_pw', 'Administrator Keuangan', 'superadmin'),
    (2, 'budi', '$hashed_pw', 'Budi Santoso', 'admin')
    ON DUPLICATE KEY UPDATE id=id;";
    @mysqli_query($koneksi, $sql_insert_users);
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
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Akun Default (username: admin -> Super Admin, username: budi -> Admin)
-- Password default adalah admin123 (telah di-hash menggunakan bcrypt password_hash())
INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`nama\`, \`role\`) VALUES
(1, 'admin', '$2y$10$vO.mXpX2xR10.C8UfPyX8.1X7N.TfKIdwN9YhEqO5C7h3ZHe.7S.e', 'Administrator Keuangan', 'superadmin'),
(2, 'budi', '$2y$10$vO.mXpX2xR10.C8UfPyX8.1X7N.TfKIdwN9YhEqO5C7h3ZHe.7S.e', 'Budi Santoso', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Struktur Tabel transaksi
CREATE TABLE IF NOT EXISTS \`transaksi\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`tanggal\` DATE NOT NULL,
  \`keterangan\` VARCHAR(255) NOT NULL,
  \`kategori\` VARCHAR(100) NOT NULL,
  \`jenis\` ENUM('pemasukan','pengeluaran') NOT NULL,
  \`jumlah\` INT(11) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Dummy Awal
INSERT INTO \`transaksi\` (\`id\`, \`tanggal\`, \`keterangan\`, \`kategori\`, \`jenis\`, \`jumlah\`) VALUES
(1, '2026-05-23', 'Gaji Bulanan', 'Gaji', 'pemasukan', 10000000),
(2, '2026-05-23', 'Belanja Bulanan', 'Belanja', 'pengeluaran', 1250000),
(3, '2026-05-22', 'Transportasi IP', 'Transportasi', 'pengeluaran', 50000),
(4, '2026-05-21', 'Freelance Project', 'Freelance', 'pemasukan', 2500000),
(5, '2026-05-21', 'Makan Siang', 'Makan & Minum', 'pengeluaran', 25000),
(6, '2026-05-18', 'Tagihan Listrik', 'Tagihan', 'pengeluaran', 15000);
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

// 1. Ambil & hitung total pemasukan
$query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan'";
$res_pemasukan = mysqli_query($koneksi, $query_pemasukan);
$row_pemasukan = mysqli_fetch_assoc($res_pemasukan);
$total_pemasukan = $row_pemasukan['total'] ?? 0;

// 2. Ambil & hitung total pengeluaran
$query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran'";
$res_pengeluaran = mysqli_query($koneksi, $query_pengeluaran);
$row_pengeluaran = mysqli_fetch_assoc($res_pengeluaran);
$total_pengeluaran = $row_pengeluaran['total'] ?? 0;

// 3. Hitung saldo akhir otomatis secara aman
$saldo_akhir = $total_pemasukan - $total_pengeluaran;

// 4. Ambil daftar transaksi dari database diurutkan dari tanggal terbaru
$query_transaksi = "SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC";
$result_transaksi = mysqli_query($koneksi, $query_transaksi);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeuanganKu - Dashboard Keuangan</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #334155;
        }
        .main-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
            background: #ffffff;
        }
        .v-card-sum {
            border: none;
            border-radius: 16px;
            transition: all 0.25s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .v-card-sum:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }
        .bg-pemasukan {
            background-color: #ffffff !important;
            border-left: 6px solid #10b981;
        }
        .bg-pengeluaran {
            background-color: #ffffff !important;
            border-left: 6px solid #ef4444;
        }
        .bg-saldo-surplus {
            background-color: #ffffff !important;
            border-left: 6px solid #2563eb;
        }
        .bg-saldo-defisit {
            background-color: #ffffff !important;
            border-left: 6px solid #f59e0b;
        }
        .text-pemasukan {
            color: #10b981 !important;
        }
        .text-pengeluaran {
            color: #ef4444 !important;
        }
        .btn-add {
            background-color: #2563eb;
            color: #ffffff;
            border: none;
            font-weight: 600;
            border-radius: 10px;
        }
        .btn-add:hover {
            background-color: #1d4ed8;
            color: #ffffff;
        }
        .badge-pemasukan {
            background-color: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
        .badge-pengeluaran {
            background-color: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
        .badge-kategori {
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-sm navbar-dark bg-dark py-3 mb-4 shadow" style="background-color: #131926 !important;">
    <div class="container">
        <span class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center me-4">
            <i class="bi bi-wallet2 me-2 text-primary"></i>
            KeuanganKu <span class="badge bg-primary ms-2 fs-6">v1.2</span>
        </span>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul class="navbar-nav gap-1 my-2 my-sm-0">
                <li class="nav-item">
                    <a href="index.php" class="nav-link active fw-bold text-white"><i class="bi bi-grid-fill me-1"></i> Dashboard</a>
                </li>
                <li class="nav-item">
                    <a href="kelola_user.php" class="nav-link fw-bold text-white-50 hover:text-white"><i class="bi bi-people-fill me-1"></i> Kelola User</a>
                </li>
            </ul>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white bg-white/10 px-3 py-1.5 rounded-3 text-xs d-inline font-monospace">
                    <i class="bi bi-person-circle text-info me-1.5"></i><?= htmlspecialchars($_SESSION['nama'] ?? 'User'); ?> (<?= htmlspecialchars($_SESSION['role'] ?? 'admin'); ?>)
                </span>
                <a href="logout.php" class="btn btn-sm btn-danger rounded-3 px-3 py-1.5" onclick="return confirm('Apakah Anda yakin ingin keluar dari PHP session ini?');">
                    <i class="bi bi-box-arrow-right me-1"></i>Keluar
                </a>
            </div>
        </div>
    </div>
</nav>

<div class="container py-2 pb-5">
    
    <!-- Bagian Ringkasan Anggaran -->
    <div class="row g-4 mb-4">
        
        <!-- Pemasukan -->
        <div class="col-md-4">
            <div class="card v-card-sum bg-pemasukan h-100 p-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-uppercase small fw-bold text-muted d-block mb-1">Total Pemasukan</span>
                            <span class="fs-4 fw-black text-pemasukan"><?= rupiah($total_pemasukan); ?></span>
                        </div>
                        <div class="rounded-circle bg-light p-2 text-center" style="width: 45px; height: 45px; color: #10b981;">
                            <i class="bi bi-graph-up-arrow fs-5"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Pengeluaran -->
        <div class="col-md-4">
            <div class="card v-card-sum bg-pengeluaran h-100 p-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-uppercase small fw-bold text-muted d-block mb-1">Total Pengeluaran</span>
                            <span class="fs-4 fw-black text-pengeluaran"><?= rupiah($total_pengeluaran); ?></span>
                        </div>
                        <div class="rounded-circle bg-light p-2 text-center" style="width: 45px; height: 45px; color: #ef4444;">
                            <i class="bi bi-graph-down-arrow fs-5"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Saldo Akhir -->
        <div class="col-md-4">
            <?php 
            $is_surplus = $saldo_akhir >= 0;
            $bg_saldo_style = $is_surplus ? 'bg-saldo-surplus' : 'bg-saldo-defisit';
            $text_saldo_style = $is_surplus ? 'text-primary' : 'text-warning';
            $icon_saldo_color = $is_surplus ? '#2563eb' : '#f59e0b';
            ?>
            <div class="card v-card-sum <?= $bg_saldo_style; ?> h-100 p-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-uppercase small fw-bold text-muted d-block mb-1">Saldo Akhir</span>
                            <span class="fs-4 fw-black <?= $text_saldo_style; ?>"><?= rupiah($saldo_akhir); ?></span>
                        </div>
                        <div class="rounded-circle bg-light p-2 text-center" style="width: 45px; height: 45px; color: <?= $icon_saldo_color; ?>;">
                            <i class="bi bi-cash-stack fs-5"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Tabel Riwayat Data Transaksi -->
    <div class="card main-card overflow-hidden">
        <div class="card-header bg-white py-3 border-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center">
                <i class="bi bi-database-check text-primary fs-4 me-2"></i>
                <h5 class="fw-bold mb-0">Riwayat Catatan Transaksi</h5>
            </div>
            <div>
                <a href="tambah.php" class="btn btn-add rounded-3 px-3 py-2">
                    <i class="bi bi-plus-circle-fill me-2"></i>Tambah Transaksi
                </a>
            </div>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4 py-3" style="width: 70px;">No</th>
                            <th style="width: 140px;">Tanggal</th>
                            <th>Keterangan</th>
                            <th style="width: 135px;">Kategori</th>
                            <th class="text-center" style="width: 130px;">Jenis</th>
                            <th class="text-end" style="width: 180px;">Nominal</th>
                            <th class="text-center" style="width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (mysqli_num_rows($result_transaksi) > 0): ?>
                            <?php 
                            $no = 1;
                            while ($row = mysqli_fetch_assoc($result_transaksi)): 
                            ?>
                                <tr>
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
                                    <td class="text-end fw-black font-monospace">
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

<footer class="footer bg-white border-top py-4 text-center text-muted small mt-5">
    <div class="container">
        <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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

// Verifikasi jika form dikirimkan
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Escape dan amankan input mentah
    $tanggal = trim($_POST['tanggal']);
    $keterangan = trim($_POST['keterangan']);
    $kategori = trim($_POST['kategori']);
    $jenis = trim($_POST['jenis']);
    $jumlah = trim($_POST['jumlah']);

    // Validasi sederhana: pastikan tidak ada data yang kosong
    if (empty($tanggal) || empty($keterangan) || empty($jenis) || empty($jumlah) || empty($kategori)) {
        $error = "Peringatan: Semua data wajib diisi dan tidak boleh dibiarkan kosong!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah harus lebih besar dari Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Tipe transaksi tidak dikenal!";
    } else {
        // Cast input ke nilai numerik integer
        $jumlah_int = (int) $jumlah;

        // Gunakan Prepared Statement demi pertahanan SQL Injection
        $query_insert = "INSERT INTO transaksi (tanggal, keterangan, kategori, jenis, jumlah) VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($koneksi, $query_insert);

        if ($stmt) {
            // Ikat parameter ("sssis" : s=string, i=integer)
            mysqli_stmt_bind_param($stmt, "sssis", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int);

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
            $error = "Kegagalan sistem internal MySQLi dalam penyusunan query.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Transaksi Keuangan</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .main-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
    </style>
</head>
<body>

<nav class="navbar navbar-dark bg-dark py-3 mb-4 shadow" style="background-color: #131926 !important;">
    <div class="container">
        <a href="index.php" class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center text-white">
            <i class="bi bi-wallet2 text-primary me-2"></i>
            KeuanganKu
        </a>
    </div>
</nav>

<div class="container py-2 pb-5">
    <div class="row justify-content-center">
        <div class="col-lg-7 col-md-10">
            
            <!-- Tombol Kembali -->
            <div class="mb-3">
                <a href="index.php" class="btn btn-link link-dark text-decoration-none p-0">
                    <i class="bi bi-arrow-left-circle-fill me-1 text-secondary"></i> Kembali ke Dashboard
                </a>
            </div>

            <!-- Form Card -->
            <div class="card main-card overflow-hidden">
                <div class="card-header bg-dark text-white p-3" style="background-color: #131926 !important;">
                    <h5 class="fw-bold mb-0"><i class="bi bi-plus-circle me-2 text-primary"></i>Tambah Transaksi Baru</h5>
                </div>
                <div class="card-body p-4">

                    <?php if (!empty($error)): ?>
                        <div class="alert alert-danger d-flex align-items-center" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                            <div><?= $error; ?></div>
                        </div>
                    <?php endif; ?>

                    <form action="tambah.php" method="POST">
                        <div class="row g-3">
                            
                            <!-- Pilih Tanggal -->
                            <div class="col-md-6">
                                <label for="tanggal" class="form-label fw-semibold text-secondary">Tanggal Transaksi</label>
                                <input type="date" class="form-control" id="tanggal" name="tanggal" value="<?= date('Y-m-d'); ?>" required>
                            </div>

                            <!-- Pilih Aliran -->
                            <div class="col-md-6">
                                <label for="jenis" class="form-label fw-semibold text-secondary">Jenis Transaksi</label>
                                <select class="form-select" id="jenis" name="jenis" required>
                                    <option value="" disabled selected>-- Pilih Jenis --</option>
                                    <option value="pemasukan">Pemasukan (Uang Masuk)</option>
                                    <option value="pengeluaran">Pengeluaran (Uang Keluar)</option>
                                </select>
                            </div>

                            <!-- Pilih Kategori -->
                            <div class="col-md-6">
                                <label for="kategori" class="form-label fw-semibold text-secondary">Kategori</label>
                                <select class="form-select" id="kategori" name="kategori" required>
                                    <option value="Gaji">Gaji</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Belanja">Belanja</option>
                                    <option value="Transportasi">Transportasi</option>
                                    <option value="Makan & Minum">Makan & Minum</option>
                                    <option value="Tagihan">Tagihan</option>
                                    <option value="Lainnya" selected>Lainnya</option>
                                </select>
                            </div>

                            <!-- Input Jumlah -->
                            <div class="col-md-6">
                                <label for="jumlah" class="form-label fw-semibold text-secondary">Jumlah Nominal (Rupiah)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light fw-bold text-secondary">Rp</span>
                                    <input type="number" class="form-control" id="jumlah" name="jumlah" placeholder="Contoh: 100000" min="1" required>
                                </div>
                            </div>

                            <!-- Input Keterangan -->
                            <div class="col-12 font-monospace">
                                <label for="keterangan" class="form-label fw-semibold text-secondary">Keterangan / Deskripsi</label>
                                <textarea class="form-control" id="keterangan" name="keterangan" rows="3" placeholder="Contoh: Membeli makan siang, Pembayaran projek web..." required></textarea>
                            </div>

                            <!-- Tombol Submit -->
                            <div class="col-12 border-top pt-3 mt-4 d-flex justify-content-end gap-2">
                                <a href="index.php" class="btn btn-outline-secondary px-4 py-2">Batal</a>
                                <button type="submit" class="btn btn-primary px-4 py-2">
                                    <i class="bi bi-check-circle-fill me-1"></i> Simpan Transaksi
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>

        </div>
    </div>
</div>

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
    
    // Alihkan jika data id tidak ada di database
    if (mysqli_num_rows($result) === 0) {
        header("Location: index.php");
        exit();
    }
    
    $old_data = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt_select);
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
    if (empty($tanggal) || empty($keterangan) || empty($jenis) || empty($jumlah) || empty($kategori)) {
        $error = "Peringatan: Semua kolom harus diisi!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah minimal harus lebih besar dari Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Pilihan jenis tidak tersedia di sistem!";
    } else {
        $jumlah_int = (int) $jumlah;

        // Persiapkan Query Update MySQLi
        $query_update = "UPDATE transaksi SET tanggal = ?, keterangan = ?, kategori = ?, jenis = ?, jumlah = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($koneksi, $query_update);

        if ($stmt_update) {
            // Bind parameter ("ssssii" : s=string, i=integer)
            mysqli_stmt_bind_param($stmt_update, "ssssii", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $id);

            // Eksekusi statement update
            if (mysqli_stmt_execute($stmt_update)) {
                // Sukses mengedit, kembali ke beranda dashboard
                header("Location: index.php");
                exit();
            } else {
                $error = "Gagal memperbarui transaksi: " . mysqli_stmt_error($stmt_update);
            }
            mysqli_stmt_close($stmt_update);
        } else {
            $error = "Kegagalan sistem internal database MySQLi dalam pembaruan kueri.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ubah Data Transaksi - KeuanganKu</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .main-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
    </style>
</head>
<body>

<nav class="navbar navbar-dark bg-dark py-3 mb-4 shadow" style="background-color: #131926 !important;">
    <div class="container">
        <a href="index.php" class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center text-white">
            <i class="bi bi-wallet2 text-primary me-2"></i>
            KeuanganKu
        </a>
    </div>
</nav>

<div class="container py-2 pb-5">
    <div class="row justify-content-center">
        <div class="col-lg-7 col-md-10">
            
            <!-- Tombol Kembali -->
            <div class="mb-3">
                <a href="index.php" class="btn btn-link link-dark text-decoration-none p-0">
                    <i class="bi bi-arrow-left-circle-fill me-1 text-secondary"></i> Kembali ke Dashboard
                </a>
            </div>

            <!-- Form Edit Card -->
            <div class="card main-card overflow-hidden">
                <div class="card-header bg-dark text-white p-3" style="background-color: #131926 !important;">
                    <h5 class="fw-bold mb-0"><i class="bi bi-pencil-square me-2 text-primary"></i>Ubah / Edit Detail Transaksi</h5>
                </div>
                <div class="card-body p-4">

                    <?php if (!empty($error)): ?>
                        <div class="alert alert-danger d-flex align-items-center" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                            <div><?= $error; ?></div>
                        </div>
                    <?php endif; ?>

                    <form action="edit.php?id=<?= $id; ?>" method="POST">
                        <div class="row g-3">
                            
                            <!-- Pilih Tanggal -->
                            <div class="col-md-6">
                                <label for="tanggal" class="form-label fw-semibold text-secondary">Tanggal Transaksi</label>
                                <input type="date" class="form-control" id="tanggal" name="tanggal" value="<?= htmlspecialchars($old_data['tanggal']); ?>" required>
                            </div>

                            <!-- Pilih Aliran -->
                            <div class="col-md-6">
                                <label for="jenis" class="form-label fw-semibold text-secondary">Jenis Aliran Keuangan</label>
                                <select class="form-select" id="jenis" name="jenis" required>
                                    <option value="pemasukan" <?= $old_data['jenis'] === 'pemasukan' ? 'selected' : ''; ?>>Pemasukan (Uang Masuk)</option>
                                    <option value="pengeluaran" <?= $old_data['jenis'] === 'pengeluaran' ? 'selected' : ''; ?>>Pengeluaran (Uang Keluar)</option>
                                </select>
                            </div>

                            <!-- Pilih Kategori -->
                            <div class="col-md-6">
                                <label for="kategori" class="form-label fw-semibold text-secondary">Kategori</label>
                                <select class="form-select" id="kategori" name="kategori" required>
                                    <option value="Gaji" <?= $old_data['kategori'] === 'Gaji' ? 'selected' : ''; ?>>Gaji</option>
                                    <option value="Freelance" <?= $old_data['kategori'] === 'Freelance' ? 'selected' : ''; ?>>Freelance</option>
                                    <option value="Belanja" <?= $old_data['kategori'] === 'Belanja' ? 'selected' : ''; ?>>Belanja</option>
                                    <option value="Transportasi" <?= $old_data['kategori'] === 'Transportasi' ? 'selected' : ''; ?>>Transportasi</option>
                                    <option value="Makan & Minum" <?= $old_data['kategori'] === 'Makan & Minum' ? 'selected' : ''; ?>>Makan & Minum</option>
                                    <option value="Tagihan" <?= $old_data['kategori'] === 'Tagihan' ? 'selected' : ''; ?>>Tagihan</option>
                                    <option value="Lainnya" <?= $old_data['kategori'] === 'Lainnya' ? 'selected' : ''; ?>>Lainnya</option>
                                </select>
                            </div>

                            <!-- Input Jumlah -->
                            <div class="col-md-6">
                                <label for="jumlah" class="form-label fw-semibold text-secondary">Jumlah Nominal (Rupiah)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light fw-bold text-secondary">Rp</span>
                                    <input type="number" class="form-control" id="jumlah" name="jumlah" value="<?= htmlspecialchars($old_data['jumlah']); ?>" min="1" required>
                                </div>
                            </div>

                            <!-- Input Keterangan -->
                            <div class="col-12 font-monospace">
                                <label for="keterangan" class="form-label fw-semibold text-secondary">Keterangan / Deskripsi</label>
                                <textarea class="form-control" id="keterangan" name="keterangan" rows="3" required><?= htmlspecialchars($old_data['keterangan']); ?></textarea>
                            </div>

                            <!-- Tombol Submit -->
                            <div class="col-12 border-top pt-3 mt-4 d-flex justify-content-end gap-2">
                                <a href="index.php" class="btn btn-outline-secondary px-4 py-2">Batal</a>
                                <button type="submit" class="btn btn-warning text-dark fw-bold px-4 py-2">
                                    <i class="bi bi-save-fill me-1"></i> Simpan Perubahan
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>

        </div>
    </div>
</div>

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
        body { background-color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; color: #334155; }
        .main-card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02); background: #ffffff; }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-sm navbar-dark bg-dark py-3 mb-4 shadow" style="background-color: #131926 !important;">
    <div class="container">
        <span class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center me-4">
            <i class="bi bi-wallet2 me-2 text-primary"></i>
            KeuanganKu <span class="badge bg-primary ms-2 fs-6">v1.2</span>
        </span>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul class="navbar-nav gap-1 my-2 my-sm-0">
                <li class="nav-item">
                    <a href="index.php" class="nav-link fw-bold text-white-50 hover:text-white"><i class="bi bi-grid-fill me-1"></i> Dashboard</a>
                </li>
                <li class="nav-item">
                    <a href="kelola_user.php" class="nav-link active fw-bold text-white"><i class="bi bi-people-fill me-1"></i> Kelola User</a>
                </li>
            </ul>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white bg-white/10 px-3 py-1.5 rounded-3 text-xs d-inline font-monospace">
                    <i class="bi bi-person-circle text-info me-1.5"></i><?= htmlspecialchars($_SESSION['nama'] ?? 'User'); ?> (<?= htmlspecialchars($_SESSION['role'] ?? 'admin'); ?>)
                </span>
                <a href="logout.php" class="btn btn-sm btn-danger rounded-3 px-3 py-1.5" onclick="return confirm('Apakah Anda yakin ingin keluar?');">
                    <i class="bi bi-box-arrow-right me-1"></i>Keluar
                </a>
            </div>
        </div>
    </div>
</nav>

<div class="container py-2">
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
    <title>Sistem Baru - Tambah Pengguna</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body { background-color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; }
    </style>
</head>
<body>

<div class="container py-5" style="max-width: 600px;">
    <div class="card border-0 rounded-4 shadow-lg p-3">
        <div class="card-body">
            <h4 class="fw-bold text-dark mb-1"><i class="bi bi-person-plus-fill text-primary me-2"></i>Tambah User Baru</h4>
            <p class="text-muted small">Daftarkan akun administrator baru ke dalam database keamanan server.</p>

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
    </div>
</div>

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
    <title>Sistem Baru - Edit Pengguna</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style> body { background-color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; } </style>
</head>
<body>

<div class="container py-5" style="max-width: 600px;">
    <div class="card border-0 rounded-4 shadow-lg p-3">
        <div class="card-body">
            <h4 class="fw-bold text-dark mb-1"><i class="bi bi-pencil-square text-primary me-2"></i>Edit Pengguna</h4>
            <p class="text-muted small">Silakan sesuaikan pengaturan data user di bawah.</p>

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
    </div>
</div>

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

