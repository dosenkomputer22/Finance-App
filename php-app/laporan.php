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
$filter_bulan = $_GET['bulan'] ?? '';
$filter_tahun = $_GET['tahun'] ?? '';

// Hitung rentang tanggal secara otomatis jika menggunakan filter bulanan / tahunan
if (!empty($filter_bulan) && $filter_bulan !== 'semua' && !empty($filter_tahun) && $filter_tahun !== 'semua') {
    $formatted_month = str_pad($filter_bulan, 2, '0', STR_PAD_LEFT);
    $filter_mulai = "{$filter_tahun}-{$formatted_month}-01";
    $filter_selesai = date("Y-m-t", strtotime($filter_mulai));
} elseif (!empty($filter_tahun) && $filter_tahun !== 'semua') {
    $filter_mulai = "{$filter_tahun}-01-01";
    $filter_selesai = "{$filter_tahun}-12-31";
} elseif (!empty($filter_bulan) && $filter_bulan !== 'semua') {
    $curr_year = date('Y');
    $formatted_month = str_pad($filter_bulan, 2, '0', STR_PAD_LEFT);
    $filter_mulai = "{$curr_year}-{$formatted_month}-01";
    $filter_selesai = date("Y-m-t", strtotime($filter_mulai));
}

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
        <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
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
    <title><?= htmlspecialchars($app_name); ?> - Laporan Komprehensif</title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.12);
            background: #ffffff;
            transition: all 0.3s ease;
        }
        .main-card:hover {
            box-shadow: 0 10px 25px -5px rgba(148, 163, 184, 0.18);
        }
        .filter-card {
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .text-pemasukan {
            color: #10b981 !important;
        }
        .text-pengeluaran {
            color: #ef4444 !important;
        }
        
        /* Premium Dual-Tone Gradient Metric Cards with Glass Refraction Matte Shine */
        .gradient-card {
            position: relative;
            border: none !important;
            border-radius: 20px;
            color: #ffffff !important;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background-size: 200% 200%;
        }
        .gradient-card:hover {
            transform: translateY(-6px);
        }
        .gradient-card-info {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            box-shadow: 0 12px 28px -4px rgba(59, 130, 246, 0.35);
        }
        .gradient-card-info:hover {
            box-shadow: 0 20px 38px -5px rgba(59, 130, 246, 0.5);
        }
         .gradient-card-success {
            background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);
            box-shadow: 0 12px 28px -4px rgba(16, 185, 129, 0.35);
        }
        .gradient-card-success:hover {
            box-shadow: 0 20px 38px -5px rgba(16, 185, 129, 0.5);
        }
        .gradient-card-danger {
            background: linear-gradient(135deg, #881337 0%, #f43f5e 100%);
            box-shadow: 0 12px 28px -4px rgba(244, 63, 94, 0.35);
        }
        .gradient-card-danger:hover {
            box-shadow: 0 20px 38px -5px rgba(244, 63, 94, 0.5);
        }
        .gradient-card-primary {
            background: linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%);
            box-shadow: 0 12px 28px -4px rgba(139, 92, 246, 0.35);
        }
        .gradient-card-primary:hover {
            box-shadow: 0 20px 38px -5px rgba(139, 92, 246, 0.5);
        }
        .gradient-card-warning {
            background: linear-gradient(135deg, #78350f 0%, #f59e0b 100%);
            box-shadow: 0 12px 28px -4px rgba(245, 158, 11, 0.35);
        }
        .gradient-card-warning:hover {
            box-shadow: 0 20px 38px -5px rgba(245, 158, 11, 0.5);
        }
        
        .card-pattern {
            position: absolute;
            top: -15px;
            right: -15px;
            width: 110px;
            height: 110px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.75rem;
            transform: rotate(15deg);
            transition: all 0.4s ease;
        }
        .gradient-card:hover .card-pattern {
            transform: rotate(25deg) scale(1.15);
            background: rgba(255, 255, 255, 0.16);
        }
        .gradient-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-25deg);
            transition: none;
        }
        .gradient-card:hover::after {
            left: 150%;
            transition: all 0.85s ease-in-out;
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

        /* Form Label and control styling */
        .form-label-custom {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 6px;
        }
        .form-control-custom {
            border-radius: 10px;
            padding: 0.65rem 1rem;
            border: 1px solid #cbd5e1;
            font-size: 0.85rem;
            background-color: #ffffff;
            color: #1e293b;
            font-weight: 500;
        }
        .form-control-custom:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
            background-color: #ffffff;
        }

        /* Modern Table Customization */
        .table-custom {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
        }
        .table-custom thead th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            padding: 14px 16px;
            border-top: none;
            border-bottom: 1.5px solid #e2e8f0;
        }
        .table-custom tbody tr {
            transition: all 0.2s ease;
        }
        .table-custom tbody tr:hover {
            background-color: #fafafa !important;
        }
        .table-custom tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 0.85rem;
        }
        .table-custom tbody tr:last-child td {
            border-bottom: none;
        }
        
        /* Media Print Styling kustom untuk Ekspor PDF Sempurna */
        @media print {
            @page {
                size: A4 portrait;
                margin: 15mm 12mm 15mm 12mm;
            }

            /* Sembunyikan elemen navigasi sidebar, filter card, tombol, dll */
            .sidebar-container, 
            .mobile-header, 
            .top-header-bar, 
            header,
            .no-print,
            .filter-card, 
            .btn-export-group, 
            .btn, 
            hr, 
            .user-profile-section,
            .card-header,
            footer {
                display: none !important;
            }
            
            /* Netralkan pembungkus layout flexbox agar halaman mengalir biasa tanpa batasan kontainer */
            html, body {
                height: auto !important;
                min-height: auto !important;
                overflow: visible !important;
                background: #ffffff !important;
                color: #0d131e !important;
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
                color: #0f172a !important;
                border: 1px solid #94a3b8 !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
                font-size: 0.72rem !important;
                letter-spacing: 0.02em !important;
                padding: 8px 10px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .table td {
                border: 1px solid #cbd5e1 !important;
                padding: 8px 10px !important;
                background-color: transparent !important;
                color: #1e293b !important;
                font-size: 0.75rem !important;
            }

            /* Penyesuaian baris info saldo awal dan total */
            tr.table-info {
                background-color: #f0f9ff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            tr.bg-light-subtle {
                background-color: #f8fafc !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .badge-cat {
                border: 1px solid #e2e8f0 !important;
                background-color: #f8fafc !important;
                color: #475569 !important;
                font-size: 0.68rem !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                display: inline-block !important;
            }

            .print-header {
                display: block !important;
                margin-top: 5px;
                margin-bottom: 20px;
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
    
    <?php
    // Definisikan informasi periode lapor untuk cetak PDF/Laporan yang rapi
    $periode_nama = 'Semua Periode';
    if (!empty($filter_mulai) || !empty($filter_selesai)) {
        $periode_nama = '' . ($filter_mulai ? date('d-m-Y', strtotime($filter_mulai)) : 'Awal') . ' s/d ' . ($filter_selesai ? date('d-m-Y', strtotime($filter_selesai)) : 'Akhir');
    } else {
        $months_id = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $b_name = ($filter_bulan !== 'semua' && !empty($filter_bulan) && isset($months_id[$filter_bulan])) ? $months_id[$filter_bulan] : 'Semua Bulan';
        $t_name = ($filter_tahun !== 'semua' && !empty($filter_tahun)) ? $filter_tahun : 'Semua Tahun';
        $periode_nama = "$b_name $t_name";
    }

    $aliran_nama = 'Semua Transaksi';
    if ($filter_jenis === 'pemasukan') {
        $aliran_nama = 'Hanya Pemasukan (Debit)';
    } elseif ($filter_jenis === 'pengeluaran') {
        $aliran_nama = 'Hanya Pengeluaran (Kredit)';
    }
    ?>

    <!-- Bagian Kepala Print (Disembunyikan di layar, ditampilkan hanya ketika dicetak) -->
    <div class="print-header d-none">
        <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 6px; letter-spacing: -0.025em; font-family: sans-serif;">LAPORAN CATATAN TRANSAKSI KEUANGAN</h2>
            <div style="font-size: 0.82rem; color: #475569; margin-bottom: 4px; font-weight: 500; font-family: sans-serif;">
                Aplikasi <strong><?= htmlspecialchars($app_name); ?></strong> &nbsp;&bull;&nbsp; 
                Periode Laporan: <strong style="color: #0f172a;"><?= $periode_nama; ?></strong>
            </div>
            <div style="font-size: 0.72rem; color: #64748b; font-family: sans-serif;">
                Tipe Aliran: <strong><?= $aliran_nama; ?></strong> &nbsp;&bull;&nbsp; 
                Kategori: <strong><?= empty($filter_kategori) ? 'Semua Kategori' : htmlspecialchars($filter_kategori); ?></strong> &nbsp;&bull;&nbsp; 
                Petugas: <strong><?= htmlspecialchars($_SESSION['nama']); ?></strong> &nbsp;&bull;&nbsp; 
                Waktu Cetak: <strong><?= date('d-m-Y H:i:s'); ?></strong>
            </div>
            <div style="border-top: 2.5px solid #0f172a; border-bottom: 1px solid #94a3b8; height: 4px; margin-top: 15px;"></div>
        </div>

        <!-- Ringkasan Khusus Cetak (Sangat Indah & Rapih) -->
        <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 25px; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div style="flex: 1; text-align: center; border-right: 1.5px solid #cbd5e1; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">SALDO AWAL ACUAN</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #334155;"><?= rupiah($saldo_awal); ?></div>
                </div>
                <div style="flex: 1; text-align: center; border-right: 1.5px solid #cbd5e1; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #16a34a; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">TOTAL KAS MASUK</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #16a34a;"><?= rupiah($total_pemasukan); ?></div>
                </div>
                <div style="flex: 1; text-align: center; border-right: 1.5px solid #cbd5e1; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #dc2626; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">TOTAL KAS KELUAR</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #dc2626;"><?= rupiah($total_pengeluaran); ?></div>
                </div>
                <div style="flex: 1; text-align: center; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #2563eb; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">SALDO AKHIR KUMULATIF</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #2563eb;"><?= rupiah($saldo_akhir); ?></div>
                </div>
            </div>
        </div>

        <!-- Judul Tabel Khusus Cetak -->
        <h5 style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 12px; margin-top: 15px; text-transform: uppercase; letter-spacing: -0.01em; font-family: sans-serif;">
            <i class="bi bi-list-columns-reverse"></i> Rincian Buku Kas Transaksi Terlampir
        </h5>
    </div>

    <!-- Header & Tombol Print Utama -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 no-print">
        <div>
            <h3 class="fw-black text-slate-800 tracking-tight mb-1">Laporan Keuangan</h3>
            <p class="text-muted mb-0 small">Saring data arus kas secara akurat dan ekspor ke lembar kerja Excel atau cetak PDF langsung.</p>
        </div>
        
        <!-- Action Group -->
        <div class="d-flex flex-wrap gap-2 btn-export-group">
            <button type="button" data-bs-toggle="modal" data-bs-target="#exportModalModal" class="btn btn-outline-primary d-flex align-items-center gap-2 rounded-3 px-3.5 py-2 fw-bold text-xs" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.2)">
                <i class="bi bi-download text-primary fs-5"></i>
                <span>Cetak / Ekspor Laporan</span>
            </button>
        </div>
    </div>

    <!-- Panel Filter Komprehensif -->
    <div class="card main-card filter-card p-4 mb-4">
        <form action="laporan.php" method="GET" class="row g-3">
            <div class="col-md-2">
                <label for="jenis" class="form-label text-xs fw-extrabold text-slate-700">Tipe Aliran</label>
                <select class="form-select rounded-3 text-xs" id="jenis" name="jenis">
                    <option value="" <?= ($filter_jenis === '') ? 'selected' : ''; ?>>Semua Aliran</option>
                    <option value="pemasukan" <?= ($filter_jenis === 'pemasukan') ? 'selected' : ''; ?>>Pemasukan (+)</option>
                    <option value="pengeluaran" <?= ($filter_jenis === 'pengeluaran') ? 'selected' : ''; ?>>Pengeluaran (-)</option>
                </select>
            </div>
            
            <div class="col-md-2">
                <label for="kategori" class="form-label text-xs fw-extrabold text-slate-700">Kategori</label>
                <select class="form-select rounded-3 text-xs" id="kategori" name="kategori">
                    <option value="" <?= ($filter_kategori === '') ? 'selected' : ''; ?>>Semua Kategori</option>
                    <?php foreach ($all_categories as $cat): ?>
                        <option value="<?= htmlspecialchars($cat['nama']); ?>" <?= ($filter_kategori === $cat['nama']) ? 'selected' : ''; ?>>
                            <?= htmlspecialchars($cat['nama']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="col-md-2">
                <label for="filter_mode" class="form-label text-xs fw-extrabold text-slate-700">Metode Saring</label>
                <select class="form-select rounded-3 text-xs" id="filter_mode" onchange="toggleFilterFields()">
                    <option value="bulanan" <?= (!empty($filter_bulan) || !empty($filter_tahun) || (empty($filter_bulan) && empty($filter_tahun) && empty($filter_mulai) && empty($filter_selesai))) ? 'selected' : ''; ?>>Saring Bulanan</option>
                    <option value="tanggal" <?= (empty($filter_bulan) && empty($filter_tahun) && (!empty($filter_mulai) || !empty($filter_selesai))) ? 'selected' : ''; ?>>Rentang Tanggal</option>
                </select>
            </div>

            <!-- Fields for Monthly Filter -->
            <div class="col-md-2 col-sm-6 filter-bulanan-field">
                <label for="bulan" class="form-label text-xs fw-extrabold text-slate-700">Pilih Bulan</label>
                <select class="form-select rounded-3 text-xs" id="bulan" name="bulan">
                    <option value="semua" <?= ($filter_bulan === 'semua' || empty($filter_bulan)) ? 'selected' : ''; ?>>Semua Bulan</option>
                    <?php
                    $months = [
                        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
                        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
                    ];
                    foreach ($months as $num => $name):
                    ?>
                        <option value="<?= $num; ?>" <?= ($filter_bulan == $num) ? 'selected' : ''; ?>><?= $name; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="col-md-2 col-sm-6 filter-bulanan-field">
                <label for="tahun" class="form-label text-xs fw-extrabold text-slate-700">Pilih Tahun</label>
                <select class="form-select rounded-3 text-xs" id="tahun" name="tahun">
                    <option value="semua" <?= ($filter_tahun === 'semua' || empty($filter_tahun)) ? 'selected' : ''; ?>>Semua Tahun</option>
                    <?php
                    // Ambil daftar tahun unik dari database
                    $q_years = mysqli_query($koneksi, "SELECT DISTINCT YEAR(tanggal) AS thn FROM transaksi ORDER BY thn DESC");
                    $db_years = [];
                    if ($q_years) {
                        while ($yr_row = mysqli_fetch_assoc($q_years)) {
                            if (!empty($yr_row['thn'])) $db_years[] = (int)$yr_row['thn'];
                        }
                    }
                    // Tambahkan jangkauan tahun yang sangat luas untuk fleksibilitas maksimal
                    for ($y = 2020; $y <= 2035; $y++) {
                        $db_years[] = $y;
                    }
                    if (!in_array(date('Y'), $db_years)) $db_years[] = (int)date('Y');
                    if (!in_array(2026, $db_years)) $db_years[] = 2026;
                    sort($db_years);
                    $db_years = array_reverse(array_unique($db_years));
                    foreach ($db_years as $yr):
                    ?>
                        <option value="<?= $yr; ?>" <?= ($filter_tahun == $yr) ? 'selected' : ''; ?>><?= $yr; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Fields for Date Filter -->
            <div class="col-md-2 col-sm-6 filter-tanggal-field" style="display: none;">
                <label for="start_date" class="form-label text-xs fw-extrabold text-slate-700">Tanggal Mulai</label>
                <input type="date" class="form-control rounded-3 text-xs" id="start_date" name="start_date" value="<?= htmlspecialchars($filter_mulai); ?>">
            </div>

            <div class="col-md-2 col-sm-6 filter-tanggal-field" style="display: none;">
                <label for="end_date" class="form-label text-xs fw-extrabold text-slate-700">Tanggal Akhir</label>
                <input type="date" class="form-control rounded-3 text-xs" id="end_date" name="end_date" value="<?= htmlspecialchars($filter_selesai); ?>">
            </div>

            <div class="col-md-2 col-sm-12 d-grid align-items-end">
                <button type="submit" class="btn btn-primary rounded-3 text-center fw-extrabold py-2 d-flex align-items-center justify-content-center gap-1" style="min-height: 38px;">
                    <i class="bi bi-funnel-fill"></i>
                    <span>Saring</span>
                </button>
            </div>
        </form>
    </div>

    <!-- Ringkasan Filter Terkait dengan Gradient Elegan (Bento Grid 4 Kolom) -->
    <div class="row g-4 mb-4 no-print">
        <!-- 1. Saldo Awal Acuan -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card gradient-card-info p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-hourglass-split"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Saldo Awal Acuan</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($saldo_awal); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-info-circle"></i> Saldo kumulatif sebelum filter tanggal</p>
                </div>
            </div>
        </div>

        <!-- 2. Pemasukan Terfilter -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card gradient-card-success p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-up-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Kas Masuk (Debit)</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pemasukan); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-down-left-circle"></i> Mutasi penambahan saldo (+)</p>
                </div>
            </div>
        </div>
        
        <!-- 3. Pengeluaran Terfilter -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card gradient-card-danger p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-down-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Kas Keluar (Kredit)</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pengeluaran); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-up-right-circle"></i> Mutasi pengurangan dana (-)</p>
                </div>
            </div>
        </div>

        <!-- 4. Saldo Akhir Berjalan -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card <?= ($saldo_akhir >= 0) ? 'gradient-card-primary' : 'gradient-card-warning'; ?> p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-stars"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.9; letter-spacing: 0.05em">Saldo Akhir Kumulatif</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;">
                            <?= rupiah($saldo_akhir); ?>
                        </h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;">
                        <span class="fw-bold"><i class="bi bi-shield-check"></i> Saldo Bersih Berjalan</span>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Tabel Data Utama Terlapor -->
    <div class="card main-card overflow-hidden">
        <div class="card-header bg-white py-3.5 px-4 border-0 bg-slate-50/50 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-table text-indigo-600"></i> Rincian Buku Kas Transaksi
            </h5>
            <span class="badge bg-slate-100 text-slate-600 border px-3 py-1.5 rounded-pill fw-semibold font-monospace" style="font-size: 0.72rem;">
                <?= mysqli_num_rows($result_transaksi); ?> Entri Terkait
            </span>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-custom" style="font-size: 0.85rem;">
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
                                        <span class="badge-cat">
                                            <?= !empty($row['kategori']) ? htmlspecialchars($row['kategori']) : 'Umum'; ?>
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
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Modal Ekspor dengan Pilihan Bulan & Tahun sebelum Download -->
<div class="modal fade" id="exportModalModal" tabindex="-1" aria-labelledby="exportModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header border-bottom-0 pb-0">
                <h5 class="modal-title fw-black text-slate-800" id="exportModalLabel">
                    <i class="bi bi-download text-primary me-2"></i> Ekspor Laporan Keuangan
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <form action="laporan.php" method="GET" target="_blank" id="formEkspor">
                <!-- Keep existing non-date filters -->
                <input type="hidden" name="jenis" value="<?= htmlspecialchars($filter_jenis) ?>">
                <input type="hidden" name="kategori" value="<?= htmlspecialchars($filter_kategori) ?>">
                <input type="hidden" name="export" id="export_type" value="">
                <input type="hidden" name="print" id="print_trigger" value="">

                <div class="modal-body py-4">
                    <div class="alert alert-primary rounded-3 text-xs mb-4" style="background-color: rgba(37,99,235,0.06); border-color: rgba(37,99,235,0.12); color: #1e3a8a; font-size: 0.75rem;">
                        <i class="bi bi-info-circle-fill me-1.5 text-primary"></i>
                        Pilih rentang bulan dan tahun yang ingin Anda cetak atau unduh sebelum memproses file.
                    </div>
                    
                    <div class="row g-3">
                        <div class="col-6">
                            <label for="export_bulan" class="form-label text-xs fw-extrabold text-slate-700" style="font-size: 0.72rem;">Pilih Bulan</label>
                            <select class="form-select text-xs rounded-3" id="export_bulan" name="bulan">
                                <option value="semua" <?= ($filter_bulan === 'semua' || empty($filter_bulan)) ? 'selected' : ''; ?>>Semua Bulan</option>
                                <?php
                                $months = [
                                    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
                                    7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
                                ];
                                foreach ($months as $num => $name):
                                ?>
                                    <option value="<?= $num; ?>" <?= ($filter_bulan == $num) ? 'selected' : ''; ?>><?= $name; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-6">
                            <label for="export_tahun" class="form-label text-xs fw-extrabold text-slate-700" style="font-size: 0.72rem;">Pilih Tahun</label>
                            <select class="form-select text-xs rounded-3" id="export_tahun" name="tahun">
                                <option value="semua" <?= ($filter_tahun === 'semua' || empty($filter_tahun)) ? 'selected' : ''; ?>>Semua Tahun</option>
                                <?php
                                foreach ($db_years as $yr):
                                ?>
                                    <option value="<?= $yr; ?>" <?= ($filter_tahun == $yr) ? 'selected' : ''; ?>><?= $yr; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer border-top-0 pt-0 d-flex gap-2">
                    <button type="button" onclick="submitExport('pdf')" class="btn btn-outline-danger w-50 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2.5 fw-bold text-xs" style="background-color: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2)">
                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                        Cetak / PDF
                    </button>
                    <button type="button" onclick="submitExport('excel')" class="btn btn-outline-success w-50 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2.5 fw-bold text-xs" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2)">
                        <i class="bi bi-file-earmark-spreadsheet-fill text-success fs-5"></i>
                        Excel (.XLS)
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function toggleFilterFields() {
    const mode = document.getElementById('filter_mode').value;
    const monthlyFields = document.querySelectorAll('.filter-bulanan-field');
    const dateFields = document.querySelectorAll('.filter-tanggal-field');
    
    if (mode === 'bulanan') {
        monthlyFields.forEach(el => el.style.display = 'block');
        dateFields.forEach(el => el.style.display = 'none');
        document.getElementById('start_date').value = '';
        document.getElementById('end_date').value = '';
    } else {
        monthlyFields.forEach(el => el.style.display = 'none');
        dateFields.forEach(el => el.style.display = 'block');
        document.getElementById('bulan').value = 'semua';
        document.getElementById('tahun').value = 'semua';
    }
}

function submitExport(type) {
    const form = document.getElementById('formEkspor');
    const expTypeInput = document.getElementById('export_type');
    const printTrigger = document.getElementById('print_trigger');
    const modalEl = document.getElementById('exportModalModal');
    
    if (type === 'excel') {
        expTypeInput.value = 'excel';
        printTrigger.value = '';
    } else {
        expTypeInput.value = '';
        printTrigger.value = 'true';
    }
    
    form.submit();
    
    // Auto close modal
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if(modalInstance) {
        modalInstance.hide();
    }
}

// Jalankan ketika dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    toggleFilterFields();
});
</script>

<?php if (isset($_GET['print']) && $_GET['print'] === 'true'): ?>
<script>
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.print();
    }, 500);
});
</script>
<?php endif; ?>
</body>
</html>