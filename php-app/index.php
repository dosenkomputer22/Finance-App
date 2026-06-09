<?php
// index.php
// Halaman dashboard utama, ringkasan saldo keuangan, dan riwayat transaksi

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
    <title>Dashboard Keuangan Sederhana</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f3f4f6;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1f2937;
        }
        .main-card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
            background: #ffffff;
        }
        .v-card-sum {
            border: none;
            border-radius: 12px;
            transition: all 0.25s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .v-card-sum:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
        }
        .bg-pemasukan {
            background-color: #d1fae5 !important;
            border-left: 5px solid #10b981;
        }
        .bg-pengeluaran {
            background-color: #fee2e2 !important;
            border-left: 5px solid #ef4444;
        }
        .bg-saldo-surplus {
            background-color: #e0f2fe !important;
            border-left: 5px solid #0284c7;
        }
        .bg-saldo-defisit {
            background-color: #fef3c7 !important;
            border-left: 5px solid #d97706;
        }
        .text-pemasukan {
            color: #065f46 !important;
        }
        .text-pengeluaran {
            color: #991b1b !important;
        }
        .btn-add {
            background-color: #1f2937;
            color: #ffffff;
            border: none;
            font-weight: 500;
        }
        .btn-add:hover {
            background-color: #111827;
            color: #ffffff;
        }
        .badge-pemasukan {
            background-color: #10b981;
            color: #ffffff;
            font-size: 0.8rem;
            padding: 0.4em 0.8em;
            border-radius: 30px;
        }
        .badge-pengeluaran {
            background-color: #ef4444;
            color: #ffffff;
            font-size: 0.8rem;
            padding: 0.4em 0.8em;
            border-radius: 30px;
        }
    </style>
</head>
<body>

<nav class="navbar navbar-dark bg-dark py-3 mb-4 shadow">
    <div class="container">
        <span class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center">
            <i class="bi bi-piggy-bank-fill me-2 text-warning"></i>
            Aplikasi Catatan Keuangan
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
                            <span class="fs-3 fw-bold text-pemasukan"><?= rupiah($total_pemasukan); ?></span>
                        </div>
                        <div class="rounded-circle bg-white p-2 text-center shadow-sm" style="width: 45px; height: 45px; line-height: 29px; color: #10b981;">
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
                            <span class="fs-3 fw-bold text-pengeluaran"><?= rupiah($total_pengeluaran); ?></span>
                        </div>
                        <div class="rounded-circle bg-white p-2 text-center shadow-sm" style="width: 45px; height: 45px; line-height: 29px; color: #ef4444;">
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
            $text_saldo_style = $is_surplus ? 'text-primary' : 'text-warning-emphasis';
            $icon_saldo_color = $is_surplus ? '#0284c7' : '#d97706';
            ?>
            <div class="card v-card-sum <?= $bg_saldo_style; ?> h-100 p-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="text-uppercase small fw-bold text-muted d-block mb-1">Saldo Akhir</span>
                            <span class="fs-3 fw-bold <?= $text_saldo_style; ?>"><?= rupiah($saldo_akhir); ?></span>
                        </div>
                        <div class="rounded-circle bg-white p-2 text-center shadow-sm" style="width: 45px; height: 45px; line-height: 29px; color: <?= $icon_saldo_color; ?>;">
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
                            <th class="text-center" style="width: 150px;">Jenis</th>
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
                                        <span class="fw-normal"><?= htmlspecialchars($row['keterangan']); ?></span>
                                    </td>
                                    <td class="text-center">
                                        <?php if ($row['jenis'] === 'pemasukan'): ?>
                                            <span class="badge badge-pemasukan fw-semibold"><i class="bi bi-arrow-down-left me-1"></i>Pemasukan</span>
                                        <?php else: ?>
                                            <span class="badge badge-pengeluaran fw-semibold"><i class="bi bi-arrow-up-right me-1"></i>Pengeluaran</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end fw-bold">
                                        <?php if ($row['jenis'] === 'pemasukan'): ?>
                                            <span class="text-pemasukan">+ <?= rupiah($row['jumlah']); ?></span>
                                        <?php else: ?>
                                            <span class="text-pengeluaran">- <?= rupiah($row['jumlah']); ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-center">
                                        <div class="btn-group gap-1">
                                            <a href="edit.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-secondary rounded-2" title="Edit Transaksi">
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
                                <td colspan="6" class="text-center py-5 text-muted">
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
</html>
