<?php
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

<?php
$active_page = 'dashboard';
include 'sidebar.php';
?>
    
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
</html>
