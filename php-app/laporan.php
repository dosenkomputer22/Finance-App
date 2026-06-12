<?php
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
        
        $q_pem_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi $where_awal AND jenis='pemasukan'");
        $q_pen_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi $where_awal AND jenis='pengeluaran'");
        
        $val_pem_awal = mysqli_fetch_assoc($q_pem_awal)['total'] ?? 0;
        $val_pen_awal = mysqli_fetch_assoc($q_pen_awal)['total'] ?? 0;
        $saldo_awal = $val_pem_awal - $val_pen_awal;
    }

    // Query data berdasarkan filter untuk Excel
    $query_excel = "SELECT * FROM transaksi $where_clause ORDER BY tanggal ASC, id ASC";
    $result_excel = mysqli_query($koneksi, $query_excel);

    // Ambil rekap untuk Excel
    $q_pem_excel = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? $where_clause . " AND jenis='pemasukan'" : "WHERE jenis='pemasukan'");
    $q_pen_excel = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? $where_clause . " AND jenis='pengeluaran'" : "WHERE jenis='pengeluaran'");
    
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
    
    $q_pem_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi $where_awal AND jenis='pemasukan'");
    $q_pen_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi $where_awal AND jenis='pengeluaran'");
    
    $val_pem_awal = mysqli_fetch_assoc($q_pem_awal)['total'] ?? 0;
    $val_pen_awal = mysqli_fetch_assoc($q_pen_awal)['total'] ?? 0;
    $saldo_awal = $val_pem_awal - $val_pen_awal;
}

// Formulasi query untuk halaman HTML interaktif
$query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? $where_clause . " AND jenis='pemasukan'" : "WHERE jenis='pemasukan'");
$res_pemasukan = mysqli_query($koneksi, $query_pemasukan);
$row_pemasukan = mysqli_fetch_assoc($res_pemasukan);
$total_pemasukan = $row_pemasukan['total'] ?? 0;

$query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? $where_clause . " AND jenis='pengeluaran'" : "WHERE jenis='pengeluaran'");
$res_pengeluaran = mysqli_query($koneksi, $query_pengeluaran);
$row_pengeluaran = mysqli_fetch_assoc($res_pengeluaran);
$total_pengeluaran = $row_pengeluaran['total'] ?? 0;

$saldo_akhir = $saldo_awal + $total_pemasukan - $total_pengeluaran;

$query_transaksi = "SELECT * FROM transaksi $where_clause ORDER BY tanggal ASC, id ASC";
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
                <label for="end_date" class="form-label text-xs fw-extrabold text-[#334155]">Tanggal Akhir</label>
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
                                    <td class="py-3.5 text-end font-monospace font-bold align-middle" style="padding-right: 24px; color: <?= $running_balance >= 0 ? '#1e293b' : '#ef4444'; ?>;">
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
</html>
