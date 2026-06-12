<?php
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

// 6. Aksi: Ubah Layout Desain Sistem
if (isset($_POST['update_system_design'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan mengubah desain sistem.";
    } else {
        $new_app_name = trim($_POST['nama_aplikasi'] ?? '');
        $new_logo_icon = trim($_POST['logo_icon'] ?? 'bi-wallet2');
        $new_logo_img = trim($_POST['logo_image_url'] ?? '');

        if (empty($new_app_name)) {
            $error_msg = "Nama aplikasi tidak boleh kosong!";
        } else {
            $escaped_name = mysqli_real_escape_string($koneksi, $new_app_name);
            $escaped_icon = mysqli_real_escape_string($koneksi, $new_logo_icon);
            $escaped_img = mysqli_real_escape_string($koneksi, $new_logo_img);

            $q1 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('nama_aplikasi', '$escaped_name') ON DUPLICATE KEY UPDATE nilai = '$escaped_name'");
            $q2 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('logo_icon', '$escaped_icon') ON DUPLICATE KEY UPDATE nilai = '$escaped_icon'");
            $q3 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('logo_image_url', '$escaped_img') ON DUPLICATE KEY UPDATE nilai = '$escaped_img'");

            if ($q1 && $q2 && $q3) {
                $success_msg = "Desain sistem & identitas aplikasi berhasil diperbarui!";
                $app_name = $new_app_name;
                $app_logo_icon = $new_logo_icon;
                $app_logo_image_url = $new_logo_img;
            } else {
                $error_msg = "Gagal memperbarui konfigurasi desain sistem.";
            }
        }
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
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-desainsistem" data-bs-toggle="pill" data-bs-target="#pane-desainsistem" type="button" role="tab" aria-controls="pane-desainsistem" aria-selected="false">
                        <i class="bi bi-window-sidebar me-2"></i>Desain Sistem
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
                                <i class="bi bi-palette-fill text-primary fs-4"></i>
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

        <!-- 4. TAB LAYOUT DESAIN SISTEM -->
        <?php if ($user_role !== 'user'): ?>
        <div class="tab-pane fade" id="pane-desainsistem" role="tabpanel" aria-labelledby="tab-desainsistem">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-4 rounded-4 bg-primary-subtle d-inline-block text-primary">
                                <i class="bi bi-window-sidebar fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Layout Desain Sistem</h4>
                                <p class="text-muted small mb-0">Atur kustomisasi nama aplikasi dan ganti logo perusahaan pada header dan login</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST" id="form-sys-design">
                            <input type="hidden" name="update_system_design" value="1">
                            
                            <!-- Input: Nama Aplikasi -->
                            <div class="mb-4">
                                <label for="nama_aplikasi" class="form-label fw-bold text-slate-800 mb-2">Nama Aplikasi / Perusahaan</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-window"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0" id="nama_aplikasi" name="nama_aplikasi" value="<?= htmlspecialchars($app_name); ?>" placeholder="Contoh: KeuanganKu, Cahaya Corp" required maxlength="50">
                                </div>
                                <div class="form-text text-muted mt-1 small">Nama ini akan diletakkan pada Header Sidebar, Breadcrumb, dan Form Login.</div>
                            </div>

                            <!-- Input: Logo Image URL -->
                            <div class="mb-4">
                                <label for="logo_image_url" class="form-label fw-bold text-slate-800 mb-2">URL Logo Gambar Perusahaan (Pilihan Utama)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-link-45deg"></i></span>
                                    <input type="url" class="form-control border-start-0 ps-0" id="logo_image_url" name="logo_image_url" value="<?= htmlspecialchars($app_logo_image_url); ?>" placeholder="Contoh: https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=100">
                                </div>
                                <div class="form-text text-muted mt-1 small">Opsional. Masukkan URL tautan gambar logo secara langsung (direct link). Jika diisi, logo ini akan menggantikan Icon di atas. Kosongkan untuk menggunakan Icon Bootstrap di bawah.</div>
                            </div>

                            <!-- Seleksi: Icon Cadangan (Bootstrap Icons) -->
                            <div class="mb-4">
                                <label class="form-label fw-bold text-slate-800 mb-2">Pilih Icon Cadangan (Apabila URL Logo Gambar Kosong)</label>
                                <div class="row g-2">
                                    <?php
                                    $available_icons = [
                                        'bi-wallet2' => 'Dompet wallet2',
                                        'bi-bank' => 'Bank Klasik',
                                        'bi-cash-coin' => 'Koin Kas',
                                        'bi-briefcase' => 'Bisnis Mandiri',
                                        'bi-building' => 'Gedung Kantor',
                                        'bi-calculator' => 'Akuntansi',
                                        'bi-graph-up-arrow' => 'Investasi Tren',
                                        'bi-shield-check' => 'Sistem Aman'
                                    ];
                                    foreach ($available_icons as $ico_class => $ico_lbl):
                                        $is_sel = ($app_logo_icon === $ico_class);
                                    ?>
                                        <div class="col-6 col-sm-3">
                                            <div class="border rounded-3 p-2 text-center style-icon-card cursor-pointer <?= $is_sel ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'bg-light text-secondary'; ?>" data-icon="<?= $ico_class; ?>" style="transition: all 0.2s; cursor: pointer;">
                                                <i class="bi <?= $ico_class; ?> fs-3 d-block mb-1"></i>
                                                <span class="small d-block text-truncate" style="font-size: 0.75rem;"><?= $ico_lbl; ?></span>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                                <input type="hidden" name="logo_icon" id="selected_logo_icon" value="<?= htmlspecialchars($app_logo_icon); ?>">
                            </div>

                            <!-- Real-time Live Preview Box -->
                            <div class="mb-4 p-3 bg-light rounded-4 border border-light-subtle">
                                <span class="text-muted small fw-bold" style="font-size: 0.75rem;"><i class="bi bi-eye-fill me-1 text-primary"></i> Live Pratinjau Desain Header Sidebar:</span>
                                <div class="d-flex align-items-center mt-2.5 p-3 rounded-3" style="background-color: #0f172a; color: white;">
                                    <div id="preview-logo-container" class="me-3 d-flex align-items-center justify-content-center bg-white p-1 rounded-circle" style="width: 38px; height: 38px;">
                                        <!-- Will be filled by JS -->
                                    </div>
                                    <div>
                                        <h6 class="fw-bold mb-0 text-white" id="preview-app-name"><?= htmlspecialchars($app_name); ?></h6>
                                        <span class="badge bg-primary-subtle text-primary font-monospace" style="font-size: 0.62rem;">v1.3 - Pro</span>
                                    </div>
                                </div>
                            </div>

                            <div class="d-grid col-md-8 mx-auto mt-4">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> Simpan Desain Sistem Baru
                                </button>
                            </div>
                        </form>
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

    // --- SCRIPT LAYOUT DESAIN SISTEM INTERACTIVE ---
    const appNameInput = document.getElementById('nama_aplikasi');
    const logoImgInput = document.getElementById('logo_image_url');
    const previewAppName = document.getElementById('preview-app-name');
    const previewLogoContainer = document.getElementById('preview-logo-container');
    const selectedLogoIconInput = document.getElementById('selected_logo_icon');

    function updateHeaderPreview() {
        if (!appNameInput || !previewAppName) return;
        
        // Update live app name text
        previewAppName.textContent = appNameInput.value.trim() || 'KeuanganKu';
        
        // Get image URL or fallback to chosen icon
        const imgUrl = logoImgInput.value.trim();
        if (imgUrl) {
            previewLogoContainer.className = 'me-3 d-flex align-items-center justify-content-center bg-white p-1 rounded-circle border';
            previewLogoContainer.style.width = '38px';
            previewLogoContainer.style.height = '38px';
            previewLogoContainer.innerHTML = `<img src="${escapeHtml(imgUrl)}" alt="Logo" class="rounded-circle" style="width: 28px; height: 28px; object-fit: contain;">`;
        } else {
            const selectedIcon = selectedLogoIconInput.value || 'bi-wallet2';
            previewLogoContainer.className = 'me-3 d-flex align-items-center justify-content-center text-primary bg-primary-subtle rounded-circle';
            previewLogoContainer.style.width = '38px';
            previewLogoContainer.style.height = '38px';
            previewLogoContainer.innerHTML = `<i class="bi ${selectedIcon} fs-4"></i>`;
        }
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    if (appNameInput) {
        appNameInput.addEventListener('input', updateHeaderPreview);
        logoImgInput.addEventListener('input', updateHeaderPreview);
        
        // Select icon cards on click
        document.querySelectorAll('.style-icon-card').forEach(card => {
            card.addEventListener('click', function() {
                // Remove selected attributes
                document.querySelectorAll('.style-icon-card').forEach(c => {
                    c.classList.remove('border-primary', 'bg-primary-subtle', 'text-primary', 'fw-bold');
                    c.classList.add('bg-light', 'text-secondary');
                });
                // Highlight selected card
                this.classList.add('border-primary', 'bg-primary-subtle', 'text-primary', 'fw-bold');
                this.classList.remove('bg-light', 'text-secondary');
                
                selectedLogoIconInput.value = this.getAttribute('data-icon');
                updateHeaderPreview();
            });
        });

        // Run preview load
        updateHeaderPreview();
    }
</script>
</body>
</html>
