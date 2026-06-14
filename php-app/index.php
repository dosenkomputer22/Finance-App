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

$user_role = $_SESSION['role'] ?? 'admin';
$user_username = $_SESSION['username'] ?? 'user';

// Ambil Filter Bulan & Tahun Aktif
$selected_month = isset($_GET['filter_month']) && $_GET['filter_month'] !== 'all' ? (int)$_GET['filter_month'] : 'all';
$selected_year = isset($_GET['filter_year']) ? (int)$_GET['filter_year'] : (int)date('Y');

// PROSES SINKRONISASI DATABASE (TRANSAKSI BERULANG)
$sync_msg = '';
if (isset($_GET['sync']) && $_GET['sync'] === '1') {
    $berulang_q = mysqli_query($koneksi, "SELECT * FROM transaksi_berulang");
    $sync_count = 0;
    if ($berulang_q) {
        while ($b_row = mysqli_fetch_assoc($berulang_q)) {
            $desc = mysqli_real_escape_string($koneksi, $b_row['keterangan']);
            $cat = mysqli_real_escape_string($koneksi, $b_row['kategori']);
            $type = mysqli_real_escape_string($koneksi, $b_row['jenis']);
            $amount = intval($b_row['jumlah']);
            
            // Cek apakah sudah tersinkronisasi bulan ini
            $u_filter = ($user_role === 'user') ? "AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'" : "";
            $check_exist = mysqli_query($koneksi, "
                SELECT 1 FROM transaksi 
                WHERE keterangan='$desc' 
                  AND jenis='$type' 
                  AND jumlah=$amount 
                  AND MONTH(tanggal) = MONTH(CURRENT_DATE())
                  AND YEAR(tanggal) = YEAR(CURRENT_DATE())
                  $u_filter
                LIMIT 1
            ");
            
            if ($check_exist && mysqli_num_rows($check_exist) == 0) {
                // Insert as new transaction for current date
                $today = date('Y-m-d');
                $def_wallet = 'Tunai';
                $t_user = ($user_role === 'user') ? $user_username : 'admin';
                mysqli_query($koneksi, "
                    INSERT INTO transaksi (tanggal, keterangan, kategori, jenis, jumlah, dompet, username) 
                    VALUES ('$today', '$desc', '$cat', '$type', $amount, '$def_wallet', '$t_user')
                ");
                $sync_count++;
            }
        }
    }
    header("Location: index.php?sync_done=" . $sync_count);
    exit();
}

if (isset($_GET['sync_done'])) {
    $inserted_qty = (int)$_GET['sync_done'];
    if ($inserted_qty > 0) {
        $sync_msg = "Sinkronisasi berhasil! Berhasil mengenerate " . $inserted_qty . " transaksi rutin baru untuk periode ini.";
    } else {
        $sync_msg = "Database sudah sinkron! Tidak ada transaksi rutin baru yang perlu digenerate.";
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

// 3. Hitung saldo per dompet secara acak & otomatis
$wallets_list = [];
$total_saldo_semua_dompet = 0;
$wl_q = mysqli_query($koneksi, "SELECT * FROM dompet ORDER BY id ASC");
if ($wl_q) {
    while ($w_row = mysqli_fetch_assoc($wl_q)) {
        $w_name = $w_row['nama'];
        $w_initial = intval($w_row['saldo_awal']);
        
        // Hitung total pemasukan ke dompet ini
        if ($user_role === 'user') {
            $in_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'");
        } else {
            $in_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "'");
        }
        $in_row = mysqli_fetch_assoc($in_q);
        $w_in = $in_row['total'] ?? 0;
        
        // Hitung total pengeluaran dari dompet ini
        if ($user_role === 'user') {
            $out_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'");
        } else {
            $out_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "'");
        }
        $out_row = mysqli_fetch_assoc($out_q);
        $w_out = $out_row['total'] ?? 0;
        
        $current_balance = $w_initial + $w_in - $w_out;
        $total_saldo_semua_dompet += $current_balance;
        
        $wallets_list[] = [
            'id' => $w_row['id'],
            'nama' => $w_name,
            'saldo_awal' => $w_initial,
            'saldo_akhir' => $current_balance
        ];
    }
}
$saldo_akhir = $total_saldo_semua_dompet;

// 4. Ambil daftar transaksi dari database diurutkan dari tanggal terbaru
if ($user_role === 'user') {
    $query_transaksi = "SELECT * FROM transaksi WHERE username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ORDER BY tanggal DESC, id DESC";
} else {
    $query_transaksi = "SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC";
}
$result_transaksi = mysqli_query($koneksi, $query_transaksi);

// 5. Ambil data tren harian untuk grafik (disaring berdasarkan bulan terpilih jika diset)
$chart_dates = [];
$chart_pemasukan = [];
$chart_pengeluaran = [];

$query_chart = "SELECT tanggal, 
                SUM(CASE WHEN jenis='pemasukan' THEN jumlah ELSE 0 END) as total_masuk,
                SUM(CASE WHEN jenis='pengeluaran' THEN jumlah ELSE 0 END) as total_keluar
                FROM transaksi WHERE 1=1 ";
if ($user_role === 'user') {
    $query_chart .= "AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ";
}
if ($selected_month !== 'all') {
    $query_chart .= "AND MONTH(tanggal) = " . (int)$selected_month . " ";
    $query_chart .= "AND YEAR(tanggal) = " . (int)$selected_year . " ";
}
$query_chart .= "GROUP BY tanggal ORDER BY tanggal ASC";
if ($selected_month === 'all') {
    $query_chart .= " LIMIT 10";
}

$res_chart = mysqli_query($koneksi, $query_chart);
if ($res_chart && mysqli_num_rows($res_chart) > 0) {
    while ($row = mysqli_fetch_assoc($res_chart)) {
        $chart_dates[] = date('d M', strtotime($row['tanggal']));
        $chart_pemasukan[] = (int)$row['total_masuk'];
        $chart_pengeluaran[] = (int)$row['total_keluar'];
    }
} else {
    // Fallback data jika kosong
    if ($selected_month !== 'all') {
        // Tampilkan beberapa tanggal acak di bulan terpilih untuk visualisasi kosong yang rapi
        for ($i = 1; $i <= 5; $i++) {
            $formatted_d = sprintf('%04d-%02d-%02d', $selected_year, $selected_month, $i * 5);
            $chart_dates[] = date('d M', strtotime($formatted_d));
            $chart_pemasukan[] = 0;
            $chart_pengeluaran[] = 0;
        }
    } else {
        for ($i = 5; $i >= 0; $i--) {
            $chart_dates[] = date('d M', strtotime("-$i days"));
            $chart_pemasukan[] = 0;
            $chart_pengeluaran[] = 0;
        }
    }
}

// 6. Ambil data kategori untuk grafik donat distribusi (disaring berdasarkan bulan terpilih jika diset)
$category_labels = [];
$category_totals = [];
$query_cat_chart = "SELECT kategori, SUM(jumlah) as total FROM transaksi WHERE 1=1 ";
if ($user_role === 'user') {
    $query_cat_chart .= "AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ";
}
if ($selected_month !== 'all') {
    $query_cat_chart .= "AND MONTH(tanggal) = " . (int)$selected_month . " ";
    $query_cat_chart .= "AND YEAR(tanggal) = " . (int)$selected_year . " ";
}
$query_cat_chart .= "GROUP BY kategori ORDER BY total DESC LIMIT 5";
$res_cat_chart = mysqli_query($koneksi, $query_cat_chart);
if ($res_cat_chart && mysqli_num_rows($res_cat_chart) > 0) {
    while ($row = mysqli_fetch_assoc($res_cat_chart)) {
        $category_labels[] = $row['kategori'];
        $category_totals[] = (int)$row['total'];
    }
} else {
    $category_labels = ['Tidak Ada Data'];
    $category_totals = [0];
}

// 7. Cek Peringatan Anggaran (>90% penggunaan)
$current_month = date('m');
$current_year = date('Y');

// Ambil pengeluaran aktual bulan ini per kategori
$spending_actuals = [];
$sp_q = mysqli_query($koneksi, "
    SELECT kategori, SUM(jumlah) AS total_spent 
    FROM transaksi 
    WHERE jenis = 'pengeluaran' 
      AND MONTH(tanggal) = $current_month 
      AND YEAR(tanggal) = $current_year 
    GROUP BY kategori
");
if ($sp_q) {
    while ($row = mysqli_fetch_assoc($sp_q)) {
        $spending_actuals[$row['kategori']] = intval($row['total_spent']);
    }
}

// Ambil semua limit anggaran yang aktif (> 0)
$budget_warnings_to_show = [];
$bg_q = mysqli_query($koneksi, "SELECT kategori, limit_bulanan FROM anggaran WHERE limit_bulanan > 0");
if ($bg_q) {
    while ($row = mysqli_fetch_assoc($bg_q)) {
        $cat = $row['kategori'];
        $limit = intval($row['limit_bulanan']);
        $actual = $spending_actuals[$cat] ?? 0;
        
        $percentage = ($actual / $limit) * 100;
        if ($percentage >= 90) {
            $budget_warnings_to_show[] = [
                'kategori' => $cat,
                'limit' => $limit,
                'actual' => $actual,
                'percentage' => number_format($percentage, 1)
            ];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($app_name); ?> - Dashboard Keuangan</title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
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
        .text-pemasukan {
            color: #10b981 !important;
        }
        .text-pengeluaran {
            color: #ef4444 !important;
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
    </style>
</head>
<body>

<?php
$active_page = 'dashboard';
include 'sidebar.php';
?>
<div class="container-fluid py-2">
    
    <!-- Notifikasi Hasil Sinkronisasi Database -->
    <?php if (!empty($sync_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 shadow-xs p-3.5 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
            <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
            <div>
                <strong class="text-success d-block">Sinkronisasi Selesai</strong>
                <span class="small text-slate-700"><?= htmlspecialchars($sync_msg); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
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

    <!-- Banner Peringatan Anggaran Bulanan (>90%) -->
    <?php if (!empty($budget_warnings_to_show)): ?>
        <div class="alert alert-danger border-0 rounded-4 shadow-sm p-4 mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.08); border-left: 6px solid #ef4444 !important;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="bg-danger text-white rounded-circle p-2.5 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-exclamation-triangle-fill fs-4"></i>
                    </div>
                </div>
                <div class="col">
                    <h5 class="alert-heading fw-bold mb-1" style="color: #991b1b; font-size: 1.1rem;">
                        <i class="bi bi-shield-fill-exclamation me-1"></i>Peringatan Kuota Anggaran Bulanan Lampaui Batas!
                    </h5>
                    <p class="text-slate-600 mb-0 small" style="line-height: 1.5;">Beberapa kategori transaksi di bawah telah melampaui atau mendekati <strong>90%</strong> dari limit kuota pengeluaran bulanan Anda. Gunakan halaman <strong class="text-indigo-600"><a href="anggaran.php" class="text-indigo-600 text-decoration-underline">Anggaran</a></strong> untuk menyesuaikan.</p>
                </div>
            </div>
            <hr class="my-3 border-danger-subtle" style="opacity: 0.15;">
            <div class="row g-3">
                <?php foreach ($budget_warnings_to_show as $warning): ?>
                    <?php 
                    $is_over = $warning['actual'] >= $warning['limit'];
                    $text_lbl = $is_over ? 'OVER LIMIT' : 'KRITIS (>90%)';
                    $bg_badge = $is_over ? 'bg-danger text-white' : 'bg-warning text-dark';
                    ?>
                    <div class="col-md-6 col-lg-4">
                        <div class="bg-white p-3 rounded-4 border border-danger-subtle h-100 d-flex flex-column justify-content-between">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-slate-800 d-block text-truncate" style="font-size: 0.85rem;" title="<?= htmlspecialchars($warning['kategori']); ?>"><?= htmlspecialchars($warning['kategori']); ?></span>
                                <span class="badge <?= $bg_badge; ?> font-monospace" style="font-size: 0.65rem;"><?= $text_lbl; ?></span>
                            </div>
                            <div>
                                <span class="text-muted d-block small mb-1" style="font-size: 0.72rem;">Kuota Terpakai: <span class="fw-bold text-danger"><?= $warning['percentage']; ?>%</span></span>
                                <div class="progress" style="height: 6px; border-radius: 99px; background-color: #f1f5f9;">
                                    <div class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" style="width: <?= min($warning['percentage'], 100); ?>%"></div>
                                </div>
                                <span class="text-muted d-block mt-2 font-monospace" style="font-size: 0.7rem; font-weight: 500;">
                                    <?= rupiah($warning['actual']); ?> / <?= rupiah($warning['limit']); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
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
            <div class="card gradient-card gradient-card-success p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-up-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Pemasukan</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pemasukan); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-down-left-circle"></i> Kas Masuk Terakumulasi</p>
                </div>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Pengeluaran -->
        <?php if ($show_card_out): ?>
        <div class="col-md-<?= $card_col; ?>">
            <div class="card gradient-card gradient-card-danger p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-down-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Pengeluaran</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pengeluaran); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-up-right-circle"></i> Kas Keluar Terakumulasi</p>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Saldo Akhir -->
        <?php if ($show_card_balance): ?>
        <div class="col-md-<?= $card_col; ?>">
            <?php 
            $is_surplus = $saldo_akhir >= 0;
            $gradient_class = $is_surplus ? 'gradient-card-primary' : 'gradient-card-warning';
            $icon_class = $is_surplus ? 'bi-stars' : 'bi-exclamation-triangle';
            $status_msg = $is_surplus ? 'Keuangan Sehat & Aman' : 'Keuangan Defisit!';
            ?>
            <div class="card gradient-card <?= $gradient_class; ?> p-4 h-100">
                <div class="card-pattern">
                    <i class="bi <?= $icon_class; ?>"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Saldo Akhir</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($saldo_akhir); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-shield-check"></i> <?= $status_msg; ?></p>
                </div>
            </div>
        </div>
        <?php endif; ?>

    </div>
    <?php endif; ?>

    <!-- SEKTOR DAFTAR DOMPET / REKENING -->
    <div class="row g-3 mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center mb-1">
            <div>
                <h5 class="fw-bold text-slate-800 mb-1"><i class="bi bi-wallet2 text-primary me-2"></i>Status Rekening & Dompet</h5>
                <p class="text-xs text-muted mb-0" style="font-size: 0.72rem;">Monitoring saldo internal secara otomatis terpisah per instrumen simpanan</p>
            </div>
            <a href="rekening.php" class="btn btn-sm btn-outline-primary rounded-3 text-xs font-semibold px-3 py-1.5" style="font-size: 0.72rem;">
                <i class="bi bi-wallet2 me-1"></i> Kelola Dompet
            </a>
        </div>
        
        <?php foreach ($wallets_list as $w): ?>
        <div class="col-6 col-md-3">
            <div class="card border-0 rounded-4 shadow-sm p-3 bg-white" style="border-left: 4px solid #3b82f6 !important; height: 100%;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-slate-700 truncate d-block w-75" style="font-size: 0.8rem;" title="<?= htmlspecialchars($w['nama']); ?>"><?= htmlspecialchars($w['nama']); ?></span>
                    <i class="bi bi-wallet2 text-muted" style="font-size: 0.9rem;"></i>
                </div>
                <div>
                    <span class="text-uppercase font-monospace text-slate-400 d-block" style="font-size: 0.6rem; letter-spacing: 0.05em;">Saldo Aktual</span>
                    <span class="fw-bold text-dark font-monospace" style="font-size: 0.92rem;"><?= rupiah($w['saldo_akhir']); ?></span>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- Panel Visualisasi Grafik Interaktif -->
    <?php if ($show_chart_trend || $show_chart_prop): ?>
    
    <!-- Filter Periodik Grafik Bulanan Kecil -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 bg-white p-3 rounded-4 border border-light-subtle shadow-xs">
        <div class="d-flex align-items-center gap-2">
            <div class="bg-primary-subtle text-primary rounded-3 p-1.5 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                <i class="bi bi-funnel-fill fs-6"></i>
            </div>
            <div>
                <span class="text-xs text-muted d-block" style="font-size: 0.7rem;">FILTRASI DATA</span>
                <span class="fw-bold text-slate-800 text-xs" style="font-size: 0.8rem;">Filter Periode Grafik Utama</span>
            </div>
        </div>
        <form method="GET" action="index.php" class="d-flex align-items-center gap-2" id="chartFilterForm">
            <select name="filter_month" class="form-select form-select-sm border-light-subtle rounded-3 text-xs shadow-xs" style="width: 140px; font-weight: 500; height: 34px;" onchange="this.form.submit()">
                <option value="all" <?= $selected_month === 'all' ? 'selected' : ''; ?>>Semua Bulan</option>
                <?php
                $months_id = [
                    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
                    7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
                ];
                foreach ($months_id as $m_num => $m_name) {
                    $sel = ($selected_month !== 'all' && $selected_month == $m_num) ? 'selected' : '';
                    echo "<option value='$m_num' $sel>$m_name</option>";
                }
                ?>
            </select>
            <select name="filter_year" class="form-select form-select-sm border-light-subtle rounded-3 text-xs shadow-xs" style="width: 85px; font-weight: 500; height: 34px;" onchange="this.form.submit()">
                <?php
                $curr_yr = (int)date('Y');
                for ($y = $curr_yr - 3; $y <= $curr_yr + 2; $y++) {
                    $sel = ($selected_year == $y) ? 'selected' : '';
                    echo "<option value='$y' $sel>$y</option>";
                }
                ?>
            </select>
            <?php if ($selected_month !== 'all'): ?>
                <a href="index.php?filter_month=all" class="btn btn-sm btn-outline-secondary rounded-3 text-xs px-2.5 d-flex align-items-center justify-content-center" style="height: 34px;" title="Reset Filter">
                    <i class="bi bi-x-lg"></i>
                </a>
            <?php endif; ?>
        </form>
    </div>

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
                    <a href="index.php?sync=1" class="btn btn-sm btn-light text-secondary border border-light-subtle px-3 py-2 rounded-3 text-xs fw-semibold d-inline-flex align-items-center gap-1.5 transition-all text-decoration-none hover-shadow" style="transition: all 0.2s ease;">
                        <i class="bi bi-arrow-repeat text-primary" style="font-size: 0.95rem;"></i> Sinkron database
                    </a>
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
                <a href="tambah.php?add=1" class="btn btn-add rounded-3 px-3.5 py-2 text-xs">
                    <i class="bi bi-plus-circle-fill me-2"></i>Tambah Transaksi
                </a>
            </div>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-custom" style="font-size: 0.85rem;">
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
                                        <span class="badge badge-kategori"><?= !empty($row['kategori']) ? htmlspecialchars($row['kategori']) : 'Umum'; ?></span>
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
                <span><?= $app_footer; ?></span>
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
</html>