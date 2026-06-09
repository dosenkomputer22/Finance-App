// php-templates.ts
// Dynamic PHP template engine to generate custom and clean source codes

import { DbConfig } from './types';

export function getKoneksiCode(config: DbConfig): string {
  return `<?php
// koneksi.php
// Konfigurasi koneksi database untuk cPanel / Shared Hosting maupun Localhost

$db_host = "${config.host || 'localhost'}";      // Umumnya 'localhost' di sebagian besar cPanel
$db_user = "${config.user || 'db_user_anda'}";   // Username Database MySQL yang Anda buat di cPanel
$db_pass = "${config.pass || 'db_pass_anda'}";   // Password User Database tersebut
$db_name = "${config.name || 'keuangan_db'}";    // Nama Database yang Anda buat di cPanel

// Melakukan koneksi ke server MySQL
$koneksi = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Setting charset ke UTF-8 agar mendukung karakter penulisan khusus secara aman
mysqli_set_charset($koneksi, "utf8mb4");

// Verifikasi keberhasilan koneksi
if (mysqli_connect_errno()) {
    die("Koneksi database MySQL gagal dilakukan: " . mysqli_connect_error());
}
?>`;
}

export function getSqlSchema(config: DbConfig): string {
  const dbName = config.name || 'keuangan_db';
  return `-- db.sql
-- Script SQL Pembuatan Database & Tabel Transaksi Keuangan

-- Buat database jika dijalankan di localhost (Di cPanel biasanya database dibuat manual lewat menu 'MySQL Database Wizard' lalu jalankan script ini)
CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE \`${dbName}\`;

-- Struktur Tabel transaksi (Dilengkapi dengan Kolom Kategori sesuai spesifikasi)
CREATE TABLE IF NOT EXISTS \`transaksi\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`tanggal\` DATE NOT NULL,
  \`keterangan\` VARCHAR(255) NOT NULL,
  \`kategori\` VARCHAR(100) NOT NULL,
  \`jenis\` ENUM('pemasukan','pengeluaran') NOT NULL,
  \`jumlah\` INT(11) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Dummy Awal (Dilengkapi Kolom Kategori sesuai screenshot referensi)
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
// Halaman dashboard utama, ringkasan saldo keuangan, dan tabel transaksi terpadu

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

<nav class="navbar navbar-dark bg-dark py-3 mb-4 shadow-sm" style="background-color: #131926 !important;">
    <div class="container">
        <span class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center">
            <i class="bi bi-wallet2 me-2 text-primary"></i>
            KeuanganKu <span class="badge bg-primary ms-2 fs-6">v1.1</span>
        </span>
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
// Mengurus penambahan transaksi baru beserta validasi input server-side

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
// Mengedit transaksi yang sudah ada di database secara aman dengan Prepared Statements

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
// Memproses penghapusan denga keamanan parameterized query MySQLi dan mengalihkan ke dashboard

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
