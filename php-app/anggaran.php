<?php
// anggaran.php
// Halaman Manajemen Anggaran & Limit Kategori Transaksi (Proaktif Control)

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

// 1. Aksi: Simpan / Update Limit Kategori
if (isset($_POST['set_budget'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Peran 'user' hanya diizinkan untuk melihat visualisasi anggaran.";
    } else {
        $kat_nama = trim($_POST['kategori_nama'] ?? '');
        $limit_bulanan = intval($_POST['limit_bulanan'] ?? '0');

        if (empty($kat_nama)) {
            $error_msg = "Silakan pilih atau tentukan kategori pengeluaran.";
        } elseif ($limit_bulanan < 0) {
            $error_msg = "Limit bulanan tidak boleh kurang dari Rp 0.";
        } else {
            $kat_escaped = mysqli_real_escape_string($koneksi, $kat_nama);
            
            // Cek apakah data anggaran untuk kategori ini sudah ada
            $check_query = mysqli_query($koneksi, "SELECT id FROM anggaran WHERE kategori = '$kat_escaped'");
            if (mysqli_num_rows($check_query) > 0) {
                // Update
                $save_query = "UPDATE anggaran SET limit_bulanan = $limit_bulanan WHERE kategori = '$kat_escaped'";
            } else {
                // Insert
                $save_query = "INSERT INTO anggaran (kategori, limit_bulanan) VALUES ('$kat_escaped', $limit_bulanan)";
            }

            if (mysqli_query($koneksi, $save_query)) {
                $success_msg = "Batas kuota anggaran untuk '" . htmlspecialchars($kat_nama) . "' berhasil disimpan!";
            } else {
                $error_msg = "Gagal memperbarui database anggaran.";
            }
        }
    }
}

// 2. Ambil pengeluaran aktual bulan ini per kategori
$current_month = date('m');
$current_year = date('Y');

$spending_data = [];
$spending_query = mysqli_query($koneksi, "
    SELECT kategori, SUM(jumlah) AS total_spent 
    FROM transaksi 
    WHERE jenis = 'pengeluaran' 
      AND MONTH(tanggal) = $current_month 
      AND YEAR(tanggal) = $current_year 
    GROUP BY kategori
");

if ($spending_query) {
    while ($row = mysqli_fetch_assoc($spending_query)) {
        $spending_data[$row['kategori']] = intval($row['total_spent']);
    }
}

// 3. Ambil semua kategori dari tabel kategori
$all_categories = [];
$cat_query = mysqli_query($koneksi, "SELECT nama FROM kategori ORDER BY nama ASC");
if ($cat_query) {
    while ($row = mysqli_fetch_assoc($cat_query)) {
        $all_categories[] = $row['nama'];
    }
}

// 4. Ambil konfigurasi limit anggaran terdaftar
$budget_limits = [];
$budget_query = mysqli_query($koneksi, "SELECT * FROM anggaran");
if ($budget_query) {
    while ($row = mysqli_fetch_assoc($budget_query)) {
        $budget_limits[$row['kategori']] = intval($row['limit_bulanan']);
    }
}

// Set active page for sidebar navigation
$active_page = 'anggaran';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Anggaran - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
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
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
            background-color: #ffffff;
            border: 1px solid rgba(241, 245, 249, 1);
        }

        .progress-compact {
            height: 10px;
            border-radius: 99px;
            background-color: #e2e8f0;
            overflow: hidden;
        }

        .budget-card {
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            background: #ffffff;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .budget-card:hover {
            border-color: #e2e8f0;
            box-shadow: 0 12px 24px -8px rgba(148, 163, 184, 0.25);
            transform: translateY(-2px);
        }

        .budget-card.warning-near {
            border-left: 5px solid #eab308;
            background: linear-gradient(90deg, rgba(234, 179, 8, 0.02) 0%, #ffffff 100%);
        }

        .budget-card.danger-limit {
            border-left: 5px solid #ef4444;
            background: linear-gradient(90deg, rgba(239, 68, 68, 0.02) 0%, #ffffff 100%);
        }

        .budget-card.safe-limit {
            border-left: 5px solid #10b981;
        }

        .budget-icon-wrapper {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .info-panel {
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.04), transparent);
            border: 1px dashed rgba(99, 102, 241, 0.2);
            border-radius: 16px;
        }

        .status-badge {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
    </style>
</head>
<body>

<?php include 'sidebar.php'; ?>

<!-- Content Area -->
<div class="container-fluid py-3">
    
    <!-- Header Title Bar -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 bg-white p-4 rounded-4 border border-slate-100 shadow-xs">
                <div class="d-flex align-items-center gap-3">
                    <div class="p-3 rounded-4 text-white d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #4f46e5, #6366f1); width: 54px; height: 54px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
                        <i class="bi bi-pie-chart-fill fs-3"></i>
                    </div>
                    <div>
                        <h4 class="fw-bold text-slate-800 mb-0 font-sans">Anggaran Belanja</h4>
                        <p class="text-muted small mb-0">Kontrol pengeluaran bulanan secara proaktif dengan batas kuota kategori</p>
                    </div>
                </div>
                <div class="text-md-end">
                    <span class="badge bg-primary-subtle text-primary font-monospace px-3 py-2 rounded-3" style="font-size: 0.75rem;">
                        <i class="bi bi-calendar3 me-1"></i> Bulan: <?= date('F Y'); ?>
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Notifikasi Sukses / Gagal -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
            <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
            <div>
                <strong class="text-success-800 d-block">Simpan Anggaran Sukses!</strong>
                <span class="small text-slate-600"><?= htmlspecialchars($success_msg); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
            <div>
                <strong class="text-danger-800 d-block">Terjadi Kendala!</strong>
                <span class="small text-slate-600"><?= htmlspecialchars($error_msg); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="row g-4">
        <!-- 1. KIRI: FORM CONFIGURATION (Untuk Admin/Superadmin) -->
        <div class="col-lg-4">
            <div class="card main-card p-4 shadow-sm h-100">
                <div class="border-bottom pb-3 mb-4">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-shield-lock-fill text-primary me-2"></i>Setel Batas Kuota
                    </h5>
                    <p class="text-muted small mb-0 mt-1">Ubah atau tentukan batas maksimal spending per kategori bulanan</p>
                </div>

                <?php if ($user_role === 'user'): ?>
                    <div class="alert alert-info rounded-4 border-0 p-3 mb-4" style="background-color: rgba(99, 102, 241, 0.08);">
                        <i class="bi bi-info-circle-fill text-primary me-2 fs-5"></i>
                        <span class="small text-slate-700">Akun Anda berpangkat <strong>User</strong>. Hanya <strong>Admin / Superadmin</strong> yang diizinkan mengedit budget limit kategori.</span>
                    </div>
                <?php endif; ?>

                <form action="anggaran.php" method="POST" class="mb-4">
                    <input type="hidden" name="set_budget" value="1">
                    
                    <div class="mb-3">
                        <label for="kategori_nama" class="form-label fw-bold text-slate-700 small">Pilih Kategori Transaksi</label>
                        <select class="form-select border-slate-200 py-2.5 rounded-3 fw-medium" id="kategori_nama" name="kategori_nama" required <?= $user_role === 'user' ? 'disabled' : ''; ?>>
                            <option value="">-- Silakan Pilih Kategori --</option>
                            <?php foreach ($all_categories as $item_cat): ?>
                                <option value="<?= htmlspecialchars($item_cat); ?>"><?= htmlspecialchars($item_cat); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="limit_bulanan" class="form-label fw-bold text-slate-700 small">Batas Kuota Bulanan (Rp)</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light text-muted border-end-0 fw-bold">Rp</span>
                            <input type="number" class="form-control border-start-0 ps-1 rounded-end-3" id="limit_bulanan" name="limit_bulanan" placeholder="Misal: 3000000" min="0" required <?= $user_role === 'user' ? 'disabled' : ''; ?> style="font-weight: 500;">
                        </div>
                        <div class="form-text text-muted small mt-2">Masukkan nilai 0 untuk menonaktifkan kontrol budget kategori (unlimited).</div>
                    </div>

                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 shadow-sm" <?= $user_role === 'user' ? 'disabled' : ''; ?>>
                            <i class="bi bi-check2-circle fs-5"></i><span>Terapkan Limit</span>
                        </button>
                    </div>
                </form>

                <!-- Guideline Panel Info -->
                <div class="p-3 info-panel mt-auto">
                    <h6 class="fw-bold text-indigo-800 d-flex align-items-center gap-2" style="font-size: 0.82rem; color: #3730a3;">
                        <i class="bi bi-lightning-charge-fill"></i> Efek Kontrol Proaktif
                    </h6>
                    <p class="text-muted mb-0 leading-relaxed" style="font-size: 0.72rem; line-height: 1.55;">
                        Sistem memonitor total transaksi berjenis <strong>pengeluaran</strong> sepanjang bulan berjalan secara real-time. Banner peringatan akan otomatis tampil di beranda ketika pengeluaran di salah satu kategori melewati <strong>90%</strong> kuota limit.
                    </p>
                </div>
            </div>
        </div>

        <!-- 2. KANAN: LIVE BUDGET STATUS LIST (8 COLS) -->
        <div class="col-lg-8">
            <div class="card main-card p-4 shadow-sm h-100">
                <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-speedometer2 text-primary me-2"></i>Status Kepatuhan Anggaran
                    </h5>
                    <span class="text-muted small">Update Terakhir: <?= date('d M Y H:i'); ?></span>
                </div>

                <div class="row g-3">
                    <?php if (empty($all_categories)): ?>
                        <div class="col-12 py-5 text-center">
                            <i class="bi bi-pie-chart text-muted fs-1 mb-2 d-block"></i>
                            <p class="text-muted mb-0 italic">Belum ada kategori transaksi yang terdaftar.</p>
                        </div>
                    <?php else: ?>
                        <?php 
                        foreach ($all_categories as $index => $cat_name): 
                            $limit = $budget_limits[$cat_name] ?? 0;
                            $spent = $spending_data[$cat_name] ?? 0;

                            $pct = 0;
                            if ($limit > 0) {
                                $pct = ($spent / $limit) * 100;
                            }
                            
                            $pct_formatted = number_format($pct, 1);
                            
                            // Visual properties based on limit compliance
                            if ($limit === 0) {
                                $card_class = "safe-limit";
                                $status_text = "Tanpa Batas";
                                $status_badge_bg = "background-color: rgba(100, 116, 139, 0.08); color: #64748b; border: 1px solid #cbd5e1;";
                                $prog_color = "bg-secondary";
                                $text_color = "text-secondary";
                                $icon_char = "bi-infinity";
                            } elseif ($pct >= 100) {
                                $card_class = "danger-limit";
                                $status_text = "Over Limit";
                                $status_badge_bg = "background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);";
                                $prog_color = "bg-danger";
                                $text_color = "text-danger";
                                $icon_char = "bi-exclamation-octagon-fill";
                            } elseif ($pct >= 90) {
                                $card_class = "danger-limit";
                                $status_text = "Sangat Kritis (>90%)";
                                $status_badge_bg = "background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15);";
                                $prog_color = "bg-danger";
                                $text_color = "text-danger";
                                $icon_char = "bi-exclamation-triangle-fill";
                            } elseif ($pct >= 70) {
                                $card_class = "warning-near";
                                $status_text = "Waspada (>70%)";
                                $status_badge_bg = "background-color: rgba(234, 179, 8, 0.1); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.2);";
                                $prog_color = "bg-warning";
                                $text_color = "text-warning";
                                $icon_char = "bi-shield-exclamation";
                            } else {
                                $card_class = "safe-limit";
                                $status_text = "Aman";
                                $status_badge_bg = "background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);";
                                $prog_color = "bg-success";
                                $text_color = "text-success";
                                $icon_char = "bi-shield-fill-check";
                            }

                            // Palette for wrapping
                            $icons_map = [
                                'Gaji' => 'bi-cash-coin',
                                'Belanja' => 'bi-cart-fill',
                                'Transportasi' => 'bi-truck',
                                'Makan & Minum' => 'bi-cup-hot-fill',
                                'Tagihan' => 'bi-receipt',
                                'Freelance' => 'bi-laptop',
                                'Lainnya' => 'bi-three-dots'
                            ];
                            $curr_icon = $icons_map[$cat_name] ?? 'bi-tag-fill';
                        ?>
                            <div class="col-12">
                                <div class="budget-card p-3.5 <?= $card_class; ?>">
                                    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="budget-icon-wrapper bg-light text-dark">
                                                <i class="bi <?= $curr_icon; ?> text-primary"></i>
                                            </div>
                                            <div>
                                                <h6 class="fw-bold text-slate-800 mb-0"><?= htmlspecialchars($cat_name); ?></h6>
                                                <span class="text-muted small">Aktual: <strong class="text-slate-700"><?= rupiah($spent); ?></strong></span>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="status-badge" style="<?= $status_badge_bg; ?>">
                                                <i class="bi <?= $icon_char; ?>"></i> <?= $status_text; ?>
                                            </span>
                                            <span class="text-muted small fw-bold font-monospace">
                                                / <?= $limit > 0 ? rupiah($limit) : 'Bebas Limit'; ?>
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Progress Loading bar -->
                                    <?php if ($limit > 0): ?>
                                        <div class="row align-items-center g-2">
                                            <div class="col">
                                                <div class="progress progress-compact">
                                                    <div class="progress-bar <?= $prog_color; ?> progress-bar-striped progress-bar-animated" role="progressbar" style="width: <?= min($pct, 100); ?>%" aria-valuenow="<?= min($pct, 100); ?>" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                            <div class="col-auto">
                                                <span class="small font-monospace fw-bold <?= $text_color; ?>"><?= $pct_formatted; ?>%</span>
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <div class="row align-items-center g-2">
                                            <div class="col">
                                                <div class="progress progress-compact">
                                                    <div class="progress-bar bg-slate-300" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                            <div class="col-auto">
                                                <span class="small font-monospace text-muted fw-bold">Unlimited</span>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
