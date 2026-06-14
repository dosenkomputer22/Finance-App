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
$user_role = strtolower($_SESSION['role'] ?? 'admin');
$success_msg = "";
$error_msg = "";
$active_tab = "tema";

// 1. Array Kategori Proteksi Sistem (Tidak boleh dihapus)
$system_categories = ['Gaji', 'Belanja', 'Transportasi', 'Makan & Minum', 'Tagihan', 'Freelance', 'Lainnya'];

// 2. Aksi: Ubah Tema Warna Aplikasi
if (isset($_POST['update_theme'])) {
    $active_tab = 'tema';
    $new_theme = mysqli_real_escape_string($koneksi, $_POST['theme'] ?? 'slate');
    $valid_themes = ['slate', 'emerald', 'violet', 'crimson', 'amber'];
    
    if (in_array($new_theme, $valid_themes)) {
        $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
        $update_query = "UPDATE users SET theme = '$new_theme' WHERE username = '$db_username_escaped'";
        
        if (mysqli_query($koneksi, $update_query)) {
            $_SESSION['theme'] = $new_theme;
            $success_msg = "Tema warna aplikasi berhasil diperbarui menjadi " . ucwords($new_theme) . "!";

            // Sync login design with chosen theme colors automatically
            $theme_login_colors = [
                'slate' => [
                    'start' => '#1e293b',
                    'mid' => '#0f172a',
                    'end' => '#020617',
                    'accent' => '#2563eb',
                    'hover' => '#1d4ed8'
                ],
                'emerald' => [
                    'start' => '#064e3b',
                    'mid' => '#022c22',
                    'end' => '#081d33',
                    'accent' => '#059669',
                    'hover' => '#047857'
                ],
                'violet' => [
                    'start' => '#4c1d95',
                    'mid' => '#2e1065',
                    'end' => '#0f052d',
                    'accent' => '#7c3aed',
                    'hover' => '#6d28d9'
                ],
                'crimson' => [
                    'start' => '#7f1d1d',
                    'mid' => '#450a0a',
                    'end' => '#1c0202',
                    'accent' => '#dc2626',
                    'hover' => '#b91c1c'
                ],
                'amber' => [
                    'start' => '#78350f',
                    'mid' => '#451a03',
                    'end' => '#1e0800',
                    'accent' => '#d97706',
                    'hover' => '#b45309'
                ]
            ];

            if (isset($theme_login_colors[$new_theme])) {
                $cols = $theme_login_colors[$new_theme];
                $start_val = mysqli_real_escape_string($koneksi, $cols['start']);
                $mid_val = mysqli_real_escape_string($koneksi, $cols['mid']);
                $end_val = mysqli_real_escape_string($koneksi, $cols['end']);
                $accent_val = mysqli_real_escape_string($koneksi, $cols['accent']);
                $hover_val = mysqli_real_escape_string($koneksi, $cols['hover']);

                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_start', '$start_val') ON DUPLICATE KEY UPDATE nilai = '$start_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_mid', '$mid_val') ON DUPLICATE KEY UPDATE nilai = '$mid_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_end', '$end_val') ON DUPLICATE KEY UPDATE nilai = '$end_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_accent_color', '$accent_val') ON DUPLICATE KEY UPDATE nilai = '$accent_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_hover_color', '$hover_val') ON DUPLICATE KEY UPDATE nilai = '$hover_val'");
                
                $login_grad_start = $cols['start'];
                $login_grad_mid = $cols['mid'];
                $login_grad_end = $cols['end'];
                $login_accent_color = $cols['accent'];
                $login_hover_color = $cols['hover'];
            }
        } else {
            $error_msg = "Gagal memperbarui tema di database.";
        }
    } else {
        $error_msg = "Pilihan tema tidak valid.";
    }
}

// 2b. Aksi: Ubah Bahasa Aplikasi (Indonesian & English support)
if (isset($_POST['update_lang'])) {
    $active_tab = 'bahasa';
    $new_lang = mysqli_real_escape_string($koneksi, $_POST['lang'] ?? 'id');
    $valid_langs = ['id', 'en'];
    
    if (in_array($new_lang, $valid_langs)) {
        $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
        $update_query = "UPDATE users SET lang = '$new_lang' WHERE username = '$db_username_escaped'";
        
        if (mysqli_query($koneksi, $update_query)) {
            $_SESSION['lang'] = $new_lang;
            $success_msg = ($new_lang === 'id') ? "Bahasa aplikasi berhasil diubah menjadi Bahasa Indonesia!" : "Application language updated to English successfully!";
        } else {
            $error_msg = "Gagal memperbarui bahasa di database.";
        }
    } else {
        $error_msg = "Pilihan bahasa tidak valid.";
    }
}

// Kategori Transaksi telah dipindahkan ke halaman khusus kategori.php

// 5. Aksi: Ubah Kustomisasi Tampilan Dashboard
if (isset($_POST['update_dashboard_config'])) {
    $active_tab = 'dashboard';
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
    $active_tab = 'desainsistem';
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan mengubah desain sistem.";
    } else {
        $new_app_name = trim($_POST['nama_aplikasi'] ?? '');
        $new_logo_icon = trim($_POST['logo_icon'] ?? 'bi-wallet2');
        $new_app_footer = trim($_POST['app_footer'] ?? '');
        $new_app_version = trim($_POST['app_version'] ?? 'v1.3 - Pro');

        if (empty($new_app_name)) {
            $error_msg = "Nama aplikasi tidak boleh kosong!";
        } else {
            $upload_ok = true;
            $new_logo_img = $app_logo_image_url; // default keep existing
            $new_app_favicon = $app_favicon; // default keep existing

            if (isset($_FILES['logo_upload']) && $_FILES['logo_upload']['error'] === UPLOAD_ERR_OK) {
                $file_tmp = $_FILES['logo_upload']['tmp_name'];
                $file_name = $_FILES['logo_upload']['name'];
                $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];

                if (in_array($file_ext, $allowed_extensions)) {
                    if (!is_dir('uploads')) {
                        @mkdir('uploads', 0777, true);
                    }

                    // Hapus file lama jika ada dan merupakan file lokal
                    if (!empty($app_logo_image_url) && strpos($app_logo_image_url, 'uploads/') === 0 && file_exists($app_logo_image_url)) {
                        @unlink($app_logo_image_url);
                    }

                    $new_filename = 'logo_' . time() . '.' . $file_ext;
                    $dest_path = 'uploads/' . $new_filename;

                    if (move_uploaded_file($file_tmp, $dest_path)) {
                        $new_logo_img = $dest_path;
                    } else {
                        $error_msg = "Gagal memindahkan file ke direktori uploads. Cek perijinan folder.";
                        $upload_ok = false;
                    }
                } else {
                    $error_msg = "Format gambar tidak didukung! Format yang diperbolehkan: JPG, JPEG, PNG, GIF, SVG, WEBP.";
                    $upload_ok = false;
                }
            } elseif (isset($_POST['clear_logo']) && $_POST['clear_logo'] == '1') {
                if (!empty($app_logo_image_url) && strpos($app_logo_image_url, 'uploads/') === 0 && file_exists($app_logo_image_url)) {
                    @unlink($app_logo_image_url);
                }
                $new_logo_img = '';
            }

            // Handle Favicon Upload
            if ($upload_ok && isset($_FILES['favicon_upload']) && $_FILES['favicon_upload']['error'] === UPLOAD_ERR_OK) {
                $fav_tmp = $_FILES['favicon_upload']['tmp_name'];
                $fav_name = $_FILES['favicon_upload']['name'];
                $fav_ext = strtolower(pathinfo($fav_name, PATHINFO_EXTENSION));
                $fav_allowed = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'];

                if (in_array($fav_ext, $fav_allowed)) {
                    if (!is_dir('uploads')) {
                        @mkdir('uploads', 0777, true);
                    }

                    // Hapus favicon lama jika ada dan merupakan file lokal
                    if (!empty($app_favicon) && strpos($app_favicon, 'uploads/') === 0 && file_exists($app_favicon)) {
                        @unlink($app_favicon);
                    }

                    $new_fav_filename = 'favicon_' . time() . '.' . $fav_ext;
                    $fav_dest_path = 'uploads/' . $new_fav_filename;

                    if (move_uploaded_file($fav_tmp, $fav_dest_path)) {
                        $new_app_favicon = $fav_dest_path;
                    } else {
                        $error_msg = "Gagal memindahkan favicon ke direktori uploads.";
                        $upload_ok = false;
                    }
                } else {
                    $error_msg = "Format favicon tidak didukung! Format yang diperbolehkan: JPG, JPEG, PNG, GIF, SVG, WEBP, ICO.";
                    $upload_ok = false;
                }
            } elseif ($upload_ok && isset($_POST['clear_favicon']) && $_POST['clear_favicon'] == '1') {
                if (!empty($app_favicon) && strpos($app_favicon, 'uploads/') === 0 && file_exists($app_favicon)) {
                    @unlink($app_favicon);
                }
                $new_app_favicon = 'https://cdn-icons-png.flaticon.com/512/2920/2920083.png'; // default fallback
            }

            if ($upload_ok) {
                $escaped_name = mysqli_real_escape_string($koneksi, $new_app_name);
                $escaped_icon = mysqli_real_escape_string($koneksi, $new_logo_icon);
                $escaped_img = mysqli_real_escape_string($koneksi, $new_logo_img);
                $escaped_favicon = mysqli_real_escape_string($koneksi, $new_app_favicon);
                $escaped_footer = mysqli_real_escape_string($koneksi, $new_app_footer);
                $escaped_version = mysqli_real_escape_string($koneksi, $new_app_version);

                $q1 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('nama_aplikasi', '$escaped_name') ON DUPLICATE KEY UPDATE nilai = '$escaped_name'");
                $q2 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('logo_icon', '$escaped_icon') ON DUPLICATE KEY UPDATE nilai = '$escaped_icon'");
                $q3 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('logo_image_url', '$escaped_img') ON DUPLICATE KEY UPDATE nilai = '$escaped_img'");
                $q4 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('app_favicon_url', '$escaped_favicon') ON DUPLICATE KEY UPDATE nilai = '$escaped_favicon'");
                $q5 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('app_footer', '$escaped_footer') ON DUPLICATE KEY UPDATE nilai = '$escaped_footer'");
                $q6 = mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('app_version', '$escaped_version') ON DUPLICATE KEY UPDATE nilai = '$escaped_version'");

                if ($q1 && $q2 && $q3 && $q4 && $q5 && $q6) {
                    $success_msg = "Desain sistem & identitas aplikasi berhasil diperbarui!";
                    $app_name = $new_app_name;
                    $app_logo_icon = $new_logo_icon;
                    $app_logo_image_url = $new_logo_img;
                    $app_favicon = $new_app_favicon;
                    $app_footer = $new_app_footer;
                    $app_version = $new_app_version;
                } else {
                    $error_msg = "Gagal memperbarui konfigurasi desain sistem.";
                }
            }
        }
    }
}

// 6b. Aksi: Ubah Desain Form Login
if (isset($_POST['update_login_design'])) {
    $active_tab = 'desainlogin';
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Peran 'user' tidak diizinkan mengubah desain portal login.";
    } else {
        $login_title = trim($_POST['login_title'] ?? 'Selamat Datang');
        $login_subtitle = trim($_POST['login_subtitle'] ?? '');
        $login_slogan_1 = trim($_POST['login_slogan_1'] ?? '');
        $login_slogan_2 = trim($_POST['login_slogan_2'] ?? '');
        $login_desc = trim($_POST['login_desc'] ?? '');
        $login_badge_title = trim($_POST['login_badge_title'] ?? '');
        $login_badge_desc = trim($_POST['login_badge_desc'] ?? '');
        $login_version = trim($_POST['login_version'] ?? 'v1.4 SECURE');

        $esc_title = mysqli_real_escape_string($koneksi, $login_title);
        $esc_subtitle = mysqli_real_escape_string($koneksi, $login_subtitle);
        $esc_slogan_1 = mysqli_real_escape_string($koneksi, $login_slogan_1);
        $esc_slogan_2 = mysqli_real_escape_string($koneksi, $login_slogan_2);
        $esc_desc = mysqli_real_escape_string($koneksi, $login_desc);
        $esc_b_title = mysqli_real_escape_string($koneksi, $login_badge_title);
        $esc_b_desc = mysqli_real_escape_string($koneksi, $login_badge_desc);
        $esc_login_version = mysqli_real_escape_string($koneksi, $login_version);

        $queries = [
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_title', '$esc_title') ON DUPLICATE KEY UPDATE nilai = '$esc_title'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_subtitle', '$esc_subtitle') ON DUPLICATE KEY UPDATE nilai = '$esc_subtitle'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_slogan_1', '$esc_slogan_1') ON DUPLICATE KEY UPDATE nilai = '$esc_slogan_1'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_slogan_2', '$esc_slogan_2') ON DUPLICATE KEY UPDATE nilai = '$esc_slogan_2'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_desc', '$esc_desc') ON DUPLICATE KEY UPDATE nilai = '$esc_desc'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_badge_title', '$esc_b_title') ON DUPLICATE KEY UPDATE nilai = '$esc_b_title'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_badge_desc', '$esc_b_desc') ON DUPLICATE KEY UPDATE nilai = '$esc_b_desc'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_version', '$esc_login_version') ON DUPLICATE KEY UPDATE nilai = '$esc_login_version'"
        ];

        $all_ok = true;
        foreach ($queries as $q) {
            if (!mysqli_query($koneksi, $q)) {
                $all_ok = false;
            }
        }

        if ($all_ok) {
            $success_msg = "Desain halaman login berhasil diperbarui!";
            $sys_settings['login_title'] = $login_title;
            $sys_settings['login_subtitle'] = $login_subtitle;
            $sys_settings['login_slogan_1'] = $login_slogan_1;
            $sys_settings['login_slogan_2'] = $login_slogan_2;
            $sys_settings['login_desc'] = $login_desc;
            $sys_settings['login_badge_title'] = $login_badge_title;
            $sys_settings['login_badge_desc'] = $login_badge_desc;
            $sys_settings['login_version'] = $login_version;
        } else {
            $error_msg = "Gagal memperbarui konfigurasi desain form login.";
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
$current_lang = $_SESSION['lang'] ?? 'id';
?>
<!DOCTYPE html>
<html lang="<?= $current_lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= __('Pengaturan', 'Settings') ?> <?= $app_name; ?> - Pro</title>
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
                    <button class="nav-link <?= $active_tab === 'tema' ? 'active' : ''; ?>" id="tab-tema" data-bs-toggle="pill" data-bs-target="#pane-tema" type="button" role="tab" aria-controls="pane-tema" aria-selected="<?= $active_tab === 'tema' ? 'true' : 'false'; ?>">
                        <i class="bi bi-palette-fill me-2"></i><?= __('Tema Warna', 'Color Theme') ?>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link <?= $active_tab === 'dashboard' ? 'active' : ''; ?>" id="tab-dashboard" data-bs-toggle="pill" data-bs-target="#pane-dashboard" type="button" role="tab" aria-controls="pane-dashboard" aria-selected="<?= $active_tab === 'dashboard' ? 'true' : 'false'; ?>">
                        <i class="bi bi-sliders me-2"></i><?= __('Desain Dashboard', 'Dashboard Design') ?>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link <?= $active_tab === 'bahasa' ? 'active' : ''; ?>" id="tab-bahasa" data-bs-toggle="pill" data-bs-target="#pane-bahasa" type="button" role="tab" aria-controls="pane-bahasa" aria-selected="<?= $active_tab === 'bahasa' ? 'true' : 'false'; ?>">
                        <i class="bi bi-translate me-2"></i><?= __('Ubah Bahasa', 'Change Language') ?>
                    </button>
                </li>
                <?php if ($user_role !== 'user'): ?>
                <li class="nav-item" role="presentation">
                    <button class="nav-link <?= $active_tab === 'desainsistem' ? 'active' : ''; ?>" id="tab-desainsistem" data-bs-toggle="pill" data-bs-target="#pane-desainsistem" type="button" role="tab" aria-controls="pane-desainsistem" aria-selected="<?= $active_tab === 'desainsistem' ? 'true' : 'false'; ?>">
                        <i class="bi bi-window-sidebar me-2"></i><?= __('Desain Sistem', 'System Design') ?>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link <?= $active_tab === 'desainlogin' ? 'active' : ''; ?>" id="tab-desainlogin" data-bs-toggle="pill" data-bs-target="#pane-desainlogin" type="button" role="tab" aria-controls="pane-desainlogin" aria-selected="<?= $active_tab === 'desainlogin' ? 'true' : 'false'; ?>">
                        <i class="bi bi-lock-fill me-2"></i><?= __('Desain Form Login', 'Login Form Design') ?>
                    </button>
                </li>
                <?php endif; ?>

            </ul>
        </div>
    </div>

    <!-- Tabs Content Panes -->
    <div class="tab-content" id="settingsTabContent">
        
        <!-- 1. TAB TEMA WARNA -->
        <div class="tab-pane fade <?= $active_tab === 'tema' ? 'show active' : ''; ?>" id="pane-tema" role="tabpanel" aria-labelledby="tab-tema">
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
        <div class="tab-pane fade <?= $active_tab === 'dashboard' ? 'show active' : ''; ?>" id="pane-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
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

        <!-- 3. TAB UBAH BAHASA -->
        <div class="tab-pane fade <?= $active_tab === 'bahasa' ? 'show active' : ''; ?>" id="pane-bahasa" role="tabpanel" aria-labelledby="tab-bahasa">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block">
                                <i class="bi bi-translate text-primary fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0"><?= __('Pengaturan Bahasa', 'Language Settings'); ?></h4>
                                <p class="text-muted small mb-0"><?= __('Pilih bahasa pengantar antarmuka aplikasi Anda', 'Choose the language for your application interface'); ?></p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST">
                            <input type="hidden" name="update_lang" value="1">
                            
                            <div class="d-flex flex-column gap-3 mb-4">
                                <!-- Bahasa Indonesia -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_lang === 'id') ? 'selected' : ''; ?>" for="lang_id">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <span class="fs-3">🇮🇩</span>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Bahasa Indonesia</h6>
                                            <span class="text-muted small">Gunakan Bahasa Indonesia sebagai bahasa default aplikasi</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="lang" id="lang_id" value="id" <?= ($current_lang === 'id') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- English -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_lang === 'en') ? 'selected' : ''; ?>" for="lang_en">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <span class="fs-3">🇬🇧</span>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">English</h6>
                                            <span class="text-muted small">Use English as the application display language</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="lang" id="lang_en" value="en" <?= ($current_lang === 'en') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>
                            </div>

                            <div class="d-grid col-md-8 mx-auto">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> <?= __('Simpan Pengaturan Bahasa', 'Save Language Settings'); ?>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Kategori Transaksi telah dipindahkan ke halaman terpisah kategori.php -->

        <!-- 4. TAB LAYOUT DESAIN SISTEM -->
        <?php if ($user_role !== 'user'): ?>
        <div class="tab-pane fade <?= $active_tab === 'desainsistem' ? 'show active' : ''; ?>" id="pane-desainsistem" role="tabpanel" aria-labelledby="tab-desainsistem">
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

                        <form action="pengaturan.php" method="POST" id="form-sys-design" enctype="multipart/form-data">
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

                            <!-- Input: Upload Logo File -->
                            <div class="mb-4">
                                <label for="logo_upload" class="form-label fw-bold text-slate-800 mb-2">Logo Perusahaan (Pilihan Utama - Upload dari Komputer)</label>
                                <div class="p-3 border rounded-3 bg-light d-flex flex-column gap-3">
                                    <?php if (!empty($app_logo_image_url)): ?>
                                        <div class="current-logo-preview d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-success-subtle">
                                            <div class="d-flex align-items-center gap-3">
                                                <img src="<?= htmlspecialchars($app_logo_image_url); ?>?t=<?= time(); ?>" alt="Logo Saat Ini" class="rounded-3 border" style="width: 50px; height: 50px; object-fit: contain; padding: 4px; background: #fafafa;">
                                                <div>
                                                    <span class="small fw-bold text-success d-block"><i class="bi bi-patch-check-fill"></i> Logo Aktif Terpasang</span>
                                                    <span class="text-muted font-monospace" style="font-size: 0.72rem;"><?= htmlspecialchars(basename($app_logo_image_url)); ?></span>
                                                </div>
                                            </div>
                                            <div class="form-check form-switch m-0">
                                                <input class="form-check-input" type="checkbox" role="switch" name="clear_logo" id="clear_logo" value="1">
                                                <label class="form-check-label small fw-bold text-danger" for="clear_logo">Hapus Logo</label>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <div class="input-group">
                                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-upload"></i></span>
                                        <input type="file" class="form-control border-start-0" id="logo_upload" name="logo_upload" accept="image/*">
                                    </div>
                                    
                                    <div class="form-text text-muted m-0 small">
                                        <i class="bi bi-info-circle-fill text-primary"></i> Unggah file gambar logo (.jpg, .png, .svg, .webp) langsung dari komputer Anda. Jika berhasil diunggah, logo ini akan diprioritaskan ketimbang icon cadangan di bawah.
                                    </div>
                                </div>
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

                            <!-- Ganti Favicon Setting -->
                            <div class="mb-4">
                                <label for="favicon_upload" class="form-label fw-bold text-slate-800 mb-2">Favicon Aplikasi (Icon Tab Browser - Upload dari Komputer)</label>
                                <div class="p-3 border rounded-3 bg-light d-flex flex-column gap-3">
                                    <?php if (!empty($app_favicon)): ?>
                                        <div class="current-favicon-preview d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-success-subtle">
                                            <div class="d-flex align-items-center gap-3">
                                                <img src="<?= htmlspecialchars($app_favicon); ?>?t=<?= time(); ?>" alt="Favicon Saat Ini" class="rounded-3 border" style="width: 34px; height: 34px; object-fit: contain; padding: 4px; background: #fafafa;">
                                                <div>
                                                    <span class="small fw-bold text-success d-block"><i class="bi bi-patch-check-fill"></i> Favicon Aktif Terpasang</span>
                                                    <span class="text-muted font-monospace text-truncate d-inline-block" style="font-size: 0.72rem; max-width: 250px;"><?= htmlspecialchars(basename($app_favicon)); ?></span>
                                                </div>
                                            </div>
                                            <div class="form-check form-switch m-0">
                                                <input class="form-check-input" type="checkbox" role="switch" name="clear_favicon" id="clear_favicon" value="1">
                                                <label class="form-check-label small fw-bold text-danger" for="clear_favicon">Hapus Favicon</label>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <div class="input-group">
                                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-upload"></i></span>
                                        <input type="file" class="form-control border-start-0" id="favicon_upload" name="favicon_upload" accept="image/*">
                                    </div>
                                    
                                    <div class="form-text text-muted m-0 small">
                                        <i class="bi bi-info-circle-fill text-primary"></i> Unggah file gambar favicon (.jpg, .png, .svg, .webp, .ico) langsung dari komputer Anda. Jika tidak diunggah atau dihapus, sistem akan menggunakan ikon bawaan.
                                    </div>
                                </div>
                            </div>

                            <!-- Edit Dashboard Footer Setting -->
                            <div class="mb-4">
                                <label for="app_footer" class="form-label fw-bold text-slate-800 mb-2">Teks Hak Cipta (Footer) Dashboard</label>
                                <div class="input-group mb-2">
                                    <span class="input-group-text bg-white text-muted"><i class="bi bi-c-circle"></i></span>
                                    <input type="text" class="form-control" id="app_footer" name="app_footer" value="<?= htmlspecialchars($app_footer); ?>" placeholder="Contoh: &copy; <?= date('Y'); ?> KeuanganKu | All Rights Reserved" required>
                                </div>
                                <div class="form-text text-muted small"><i class="bi bi-info-circle"></i> Modifikasi teks pengenal hak cipta di bagian bawah dashboard halaman administrasi. Anda bebas menggunakan penanda HTML.</div>
                            </div>

                            <!-- Edit App Version Setting -->
                            <div class="mb-4">
                                <label for="app_version" class="form-label fw-bold text-slate-800 mb-2">Versi Aplikasi (Sidebar Header)</label>
                                <div class="input-group mb-2">
                                    <span class="input-group-text bg-white text-muted"><i class="bi bi-info-square"></i></span>
                                    <input type="text" class="form-control" id="app_version" name="app_version" value="<?= htmlspecialchars($app_version); ?>" placeholder="Contoh: v1.3 - Pro, v2.0-Alpha" required maxlength="20">
                                </div>
                                <div class="form-text text-muted small"><i class="bi bi-info-circle"></i> Tentukan label versi aplikasi yang akan diletakkan di sebelah kanan/bawah nama aplikasi di sidebar.</div>
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
                                        <span class="badge bg-primary-subtle text-primary font-monospace" style="font-size: 0.62rem;" id="preview-app-version"><?= htmlspecialchars($app_version); ?></span>
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

        <!-- 5. TAB DESAIN FORM LOGIN -->
        <div class="tab-pane fade <?= $active_tab === 'desainlogin' ? 'show active' : ''; ?>" id="pane-desainlogin" role="tabpanel" aria-labelledby="tab-desainlogin">
            <div class="row justify-content-center">
                <div class="col-lg-12">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 p-md-4 rounded-4 bg-primary-subtle d-inline-block text-primary">
                                <i class="bi bi-lock fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Custom Desain Form Login</h4>
                                <p class="text-muted small mb-0">Ubah seluruh teks penjelas/slogan dan buat gradasi warna kustom pada panel portal login Anda</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST" id="form-login-design">
                            <input type="hidden" name="update_login_design" value="1">
                            
                            <div class="row pb-3">
                                <!-- LEFT COLUMN: FORM INPUTS -->
                                <div class="col-xl-6">
                                    <h5 class="fw-bold mb-3 text-slate-700 pb-2 border-bottom" style="font-size: 1.05rem;"><i class="bi bi-fonts me-2 text-primary"></i>Kustomisasi Kata-Kata (Konten Teks)</h5>
                                    
                                    <div class="mb-3">
                                        <label for="login_title" class="form-label fw-semibold text-muted small mb-1">Judul Utama Panel Kanan (Welcome Title)</label>
                                        <input type="text" class="form-control" id="login_title" name="login_title" value="<?= htmlspecialchars($login_title); ?>" required maxlength="100">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="login_subtitle" class="form-label fw-semibold text-muted small mb-1">Sub-judul Penjelas Panel Kanan (Welcome Subtitle)</label>
                                        <textarea class="form-control" id="login_subtitle" name="login_subtitle" rows="2" required maxlength="255"><?= htmlspecialchars($login_subtitle); ?></textarea>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="login_slogan_1" class="form-label fw-semibold text-muted small mb-1">Slogan Kiri - Baris 1 (Putih)</label>
                                            <input type="text" class="form-control" id="login_slogan_1" name="login_slogan_1" value="<?= htmlspecialchars($login_slogan_1); ?>" required maxlength="100">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="login_slogan_2" class="form-label fw-semibold text-muted small mb-1">Slogan Kiri - Baris 2 (Gradasi Hijau)</label>
                                            <input type="text" class="form-control" id="login_slogan_2" name="login_slogan_2" value="<?= htmlspecialchars($login_slogan_2); ?>" required maxlength="100">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="login_desc" class="form-label fw-semibold text-muted small mb-1">Deskripsi Slogan Kiri (Penjelasan Aplikasi)</label>
                                        <textarea class="form-control" id="login_desc" name="login_desc" rows="3" required maxlength="500"><?= htmlspecialchars($login_desc); ?></textarea>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="login_badge_title" class="form-label fw-semibold text-muted small mb-1">Judul Lencana / Badge Melayang</label>
                                            <input type="text" class="form-control" id="login_badge_title" name="login_badge_title" value="<?= htmlspecialchars($login_badge_title); ?>" required maxlength="100">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="login_badge_desc" class="form-label fw-semibold text-muted small mb-1">Deskripsi Lencana Melayang</label>
                                            <input type="text" class="form-control" id="login_badge_desc" name="login_badge_desc" value="<?= htmlspecialchars($login_badge_desc); ?>" required maxlength="100">
                                         </div>
                                     </div>

                                     <div class="mb-3">
                                         <label for="login_version" class="form-label fw-semibold text-muted small mb-1">Teks Versi / Label Footer Halaman Login</label>
                                         <input type="text" class="form-control" id="login_version" name="login_version" value="<?= htmlspecialchars($login_version); ?>" required placeholder="Contoh: v1.3 SECURE" maxlength="50">
                                         <div class="form-text text-muted small"><i class="bi bi-info-circle"></i> Teks versi yang diletakkan di bagian footer halaman masuk (login).</div>
                                      </div>
                                </div>

                                <!-- RIGHT COLUMN: PREMIUM REAL-TIME LIVE PREVIEW MOCKUP -->
                                <div class="col-xl-6 mt-4 mt-xl-0">
                                    <h5 class="fw-bold mb-3 text-slate-700 pb-2 border-bottom" style="font-size: 1.05rem;"><i class="bi bi-eye-fill me-2 text-primary"></i>Live Real-time Pratinjau Portal Login</h5>
                                    
                                    <div class="p-3 bg-secondary-subtle rounded-4 border d-flex flex-column align-items-center justify-content-center" style="min-height: 480px; background-color: #f1f5f9; background-image: radial-gradient(at 0% 0%, rgba(16,185,129,0.06) 0, transparent 50%);">
                                        <div class="mock-card w-100 shadow-lg border rounded-4 overflow-hidden bg-white" style="max-width: 500px; display: grid; grid-template-columns: 1.1fr 1fr; min-height: 330px; font-size: 0.65rem;">
                                            
                                            <!-- MOCK LEFT PANEL -->
                                            <div id="mock-left" class="p-3 text-white d-flex flex-column justify-content-between position-relative overflow-hidden" style="background: linear-gradient(135deg, <?= htmlspecialchars($login_grad_start); ?> 0%, <?= htmlspecialchars($login_grad_mid); ?> 35%, <?= htmlspecialchars($login_grad_end); ?> 100%);">
                                                <div class="mock-top d-flex align-items-center gap-1 opacity-75">
                                                    <i class="bi bi-wallet2 text-xs"></i>
                                                    <span class="fw-bold text-uppercase font-sans" style="font-size: 0.5rem; letter-spacing: 0.05em;"><?= htmlspecialchars($app_name); ?></span>
                                                </div>
                                                <div class="mock-mid my-auto" style="line-height: 1.3;">
                                                    <h6 id="mock-slogan" class="fw-black mb-1 text-white" style="font-size: 0.8rem; font-weight: 850;">
                                                        <span id="mock-slogan1" class="d-block text-truncate" style="max-width:140px;"><?= htmlspecialchars($login_slogan_1); ?></span>
                                                        <span id="mock-slogan2" class="d-block text-truncate" style="max-width:140px; background: linear-gradient(135deg, #a7f3d0 0%, #34d399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"><?= htmlspecialchars($login_slogan_2); ?></span>
                                                    </h6>
                                                    <p id="mock-desc" class="opacity-75 mb-2 overflow-hidden" style="font-size: 0.45rem; font-weight: 400; max-height:45px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical;"><?= htmlspecialchars($login_desc); ?></p>
                                                    <div id="mock-badge" class="p-1 px-2 border rounded-2 d-inline-flex align-items-center gap-1" style="background-color: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); max-width: 100%;">
                                                        <i class="bi bi-shield-lock-fill" id="mock-badge-icon" style="color: <?= htmlspecialchars($login_accent_color); ?>;"></i>
                                                        <div style="line-height:1.1;">
                                                            <div id="mock-badge-title" class="fw-bold text-white text-truncate" style="font-size: 0.42rem; max-width:100px;"><?= htmlspecialchars($login_badge_title); ?></div>
                                                            <div id="mock-badge-desc" class="text-white-50 text-truncate" style="font-size: 0.38rem; max-width:100px;"><?= htmlspecialchars($login_badge_desc); ?></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="mock-foot opacity-50 font-sans" style="font-size: 0.42rem;" id="mock-login-version"><?= htmlspecialchars($login_version); ?></div>
                                            </div>

                                            <!-- MOCK RIGHT PANEL -->
                                            <div class="p-3 bg-white d-flex flex-column justify-content-center">
                                                <div class="auth-header mb-2">
                                                    <h6 id="mock-title" class="fw-black text-dark mb-0 text-truncate" style="font-size: 0.72rem; font-weight: 850; max-width:160px;"><?= htmlspecialchars($login_title); ?></h6>
                                                    <p id="mock-subtitle" class="text-muted mb-0" style="font-size: 0.45rem; line-height: 1.2; max-height:30px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;"><?= htmlspecialchars($login_subtitle); ?></p>
                                                </div>
                                                
                                                <!-- Form template -->
                                                <div class="mb-1">
                                                    <div class="bg-light p-1 border rounded" style="font-size: 0.45rem; color: #a1a1a1;">Username</div>
                                                </div>
                                                <div class="mb-2">
                                                    <div class="bg-light p-1 border rounded" style="font-size: 0.45rem; color: #a1a1a1;">Password</div>
                                                </div>

                                                <button type="button" id="mock-btn" class="btn text-white w-100 p-1.5 fw-bold rounded-2 text-center" style="font-size: 0.52rem; background-color: <?= htmlspecialchars($login_accent_color); ?>; border:none; transition:all 0.2s;">
                                                    Masuk
                                                </button>
                                            </div>
                                        </div>
                                        <p class="text-muted text-xs text-center mt-3 mb-0"><i class="bi bi-info-circle-fill text-primary"></i> Cobalah mengubah teks dan warna apa pun di panel kiri untuk melihat pratinjau instan!</p>
                                    </div>
                                </div>
                            </div>

                            <div class="d-grid col-md-6 mx-auto mt-4">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> Simpan Desain Login Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <?php if (false): ?>
        <!-- 6. TAB OTORITAS PERAN (MIGRATED TO KELOLA USER) -->
        <div class="tab-pane d-none" id="pane-otoritas">
            <?php
            $peran_query = mysqli_query($koneksi, "SELECT * FROM `peran` ORDER BY id ASC");
            $dynamic_roles = [];
            if ($peran_query && mysqli_num_rows($peran_query) > 0) {
                while ($row_peran = mysqli_fetch_assoc($peran_query)) {
                    $dynamic_roles[] = $row_peran;
                }
            } else {
                $dynamic_roles = [
                    ['role_key' => 'superadmin', 'role_name' => 'Superadmin'],
                    ['role_key' => 'admin', 'role_name' => 'Admin'],
                    ['role_key' => 'user', 'role_name' => 'User']
                ];
            }
            ?>
            <div class="row">
                <!-- Col-lg-8: Permission Matrix Grid -->
                <div class="col-lg-8 mb-4">
                    <div class="card main-card p-4 p-md-4 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block text-primary">
                                <i class="bi bi-shield-lock-fill fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Otoritas & Izin Hak Akses Peran</h4>
                                <p class="text-muted small mb-0">Tentukan menu dan halaman aplikasi mana saja yang berhak diakses oleh masing-masing tingkat peran pengguna.</p>
                            </div>
                        </div>

                        <?php if ($active_tab === 'otoritas' && !empty($success_msg)): ?>
                            <div class="alert alert-success alert-dismissible fade show border-0 rounded-4 p-3 mb-4 d-flex align-items-center gap-3 animate__animated animate__fadeIn" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
                                <i class="bi bi-shield-check text-success fs-3"></i>
                                <div>
                                    <strong class="text-success d-block small fw-bold" style="font-size: 0.9rem;">Berhasil Disimpan!</strong>
                                    <span class="text-slate-800 small d-block mt-0.5" style="font-size: 0.85rem;"><?= htmlspecialchars($success_msg); ?></span>
                                </div>
                                <button type="button" class="btn-close ms-auto shadow-none" data-bs-dismiss="alert" aria-label="Close" style="font-size: 0.8rem;"></button>
                            </div>
                        <?php endif; ?>

                        <?php if ($active_tab === 'otoritas' && !empty($error_msg)): ?>
                            <div class="alert alert-danger alert-dismissible fade show border-0 rounded-4 p-3 mb-4 d-flex align-items-center gap-3 animate__animated animate__fadeIn" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
                                <i class="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
                                <div>
                                    <strong class="text-danger d-block small fw-bold" style="font-size: 0.9rem;">Gagal Menyimpan!</strong>
                                    <span class="text-slate-800 small d-block mt-0.5" style="font-size: 0.85rem;"><?= htmlspecialchars($error_msg); ?></span>
                                </div>
                                <button type="button" class="btn-close ms-auto shadow-none" data-bs-dismiss="alert" aria-label="Close" style="font-size: 0.8rem;"></button>
                            </div>
                        <?php endif; ?>

                        <form action="pengaturan.php" method="POST" id="form-role-settings">
                            <input type="hidden" name="update_role_permissions" value="1">
                            
                            <div class="alert alert-warning border-0 rounded-4 p-3 mb-4 d-flex align-items-start gap-3" style="background-color: rgba(217, 119, 6, 0.1); color: #b45309;">
                                <i class="bi bi-exclamation-triangle-fill fs-5 mt-0.5"></i>
                                <div style="font-size: 0.85rem;">
                                    <strong class="d-block mb-1">Proteksi Keamanan Sistem & Lockout:</strong>
                                    Sebagai bagian dari pengamanan ketat, tingkat peran <strong>Superadmin</strong> dijamin akan selalu memiliki hak akses penuh ke menu <strong>Pengaturan</strong> dan <strong>Kelola User</strong>. Hal ini untuk memastikan Anda tidak terkunci dari sistem secara tidak sengaja.
                                </div>
                            </div>

                            <div class="table-responsive rounded-3 border">
                                <table class="table table-hover align-middle mb-0 text-center">
                                    <thead class="table-light">
                                        <tr class="text-uppercase font-monospace small text-slate-500" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                                            <th class="text-start ps-4 py-3" style="width: 35%;">Menu Utama Aplikasi</th>
                                            <?php foreach ($dynamic_roles as $role_obj): 
                                                $color_class = 'text-primary';
                                                $icon_class = 'bi-person-fill-gear';
                                                if ($role_obj['role_key'] === 'superadmin') {
                                                    $color_class = 'text-danger';
                                                    $icon_class = 'bi-shield-fill';
                                                } elseif ($role_obj['role_key'] === 'user') {
                                                    $color_class = 'text-success';
                                                    $icon_class = 'bi-person-fill';
                                                }
                                            ?>
                                            <th class="fw-bold py-3 <?= $color_class; ?>">
                                                <i class="bi <?= $icon_class; ?> me-1"></i><?= htmlspecialchars($role_obj['role_name']); ?>
                                            </th>
                                            <?php endforeach; ?>
                                        </tr>
                                    </thead>
                                    <tbody style="font-size: 0.88rem;">
                                        <?php
                                        $menus_list = [
                                            'dashboard' => ['name' => 'Dashboard Utama', 'desc' => 'Halaman ringkasan statistik, grafik arus kas, dan dompet.', 'icon' => 'bi-grid-fill'],
                                            'transaksi' => ['name' => 'Transaksi & Riwayat', 'desc' => 'Mencatat pemasukan, pengeluaran, dan transaksi berulang.', 'icon' => 'bi-cash-stack'],
                                            'laporan' => ['name' => 'Laporan Rekapitulasi', 'desc' => 'Filter bulanan/tahunan, cetak/ekspor PDF, pratinjau tabel.', 'icon' => 'bi-file-earmark-bar-graph-fill'],
                                            'anggaran' => ['name' => 'Anggaran Bulanan', 'desc' => 'Menetapkan batasan anggaran tiap kategori pengeluaran.', 'icon' => 'bi-pie-chart-fill'],
                                            'rekening' => ['name' => 'Dompet / Rekening', 'desc' => 'Manajemen multi-wallet & saldo awal atau mutasi dompet.', 'icon' => 'bi-wallet2'],
                                            'kategori' => ['name' => 'Kategori Transaksi', 'desc' => 'Menambah atau mengelola nama kategori arus keuangan.', 'icon' => 'bi-tag-fill'],
                                            'kelola_user' => ['name' => 'Kelola Pengguna', 'desc' => 'Melihat daftar serta melakukan edit/hapus akun pengguna.', 'icon' => 'bi-people-fill'],
                                            'pengaturan' => ['name' => 'Pengaturan Global', 'desc' => 'Mengubah tema, logo, konten login, serta izin otoritas.', 'icon' => 'bi-gear-fill']
                                        ];

                                        foreach ($menus_list as $m_key => $m_data):
                                        ?>
                                        <tr>
                                            <td class="text-start ps-4 py-3.5">
                                                <div class="d-flex align-items-center gap-3">
                                                    <div class="p-2 rounded-3 bg-light text-muted d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                                        <i class="bi <?= $m_data['icon']; ?> fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <strong class="text-slate-800 d-block mb-0.5"><?= $m_data['name']; ?></strong>
                                                        <span class="text-muted text-xs d-block" style="font-size: 0.72rem;"><?= $m_data['desc']; ?></span>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <?php foreach ($dynamic_roles as $role_obj): 
                                                $r_key = $role_obj['role_key'];
                                                $is_locked = ($r_key === 'superadmin' && in_array($m_key, ['pengaturan', 'kelola_user']));
                                            ?>
                                            <td class="py-3.5">
                                                <div class="form-check form-switch d-inline-block">
                                                    <input class="form-check-input" type="checkbox" name="perm_<?= $r_key; ?>_<?= $m_key; ?>" value="1" <?= has_menu_permission($r_key, $m_key) ? 'checked' : ''; ?> <?= $is_locked ? 'disabled' : ''; ?> style="width: 2.8em; height: 1.4em; cursor: pointer;">
                                                    <?php if ($is_locked): ?>
                                                        <input type="hidden" name="perm_<?= $r_key; ?>_<?= $m_key; ?>" value="1">
                                                    <?php endif; ?>
                                                </div>
                                            </td>
                                            <?php endforeach; ?>
                                        </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>

                            <div class="d-grid col-md-8 mx-auto mt-4">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm text-uppercase font-sans tracking-wider" style="font-size: 0.85rem;">
                                    <i class="bi bi-shield-check me-2 fs-5"></i> Simpan Hak Akses Peran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Col-lg-4: Manage custom roles sidebar bento -->
                <div class="col-lg-4 mb-4">
                    <!-- Form Tambah Peran -->
                    <div class="card border shadow-sm rounded-4 p-4 mb-4" style="background: #ffffff; border-color: #e2e8f0 !important;">
                        <div class="d-flex align-items-center gap-2.5 mb-3">
                            <div class="p-2 bg-primary-subtle text-primary rounded-3">
                                <i class="bi bi-plus-circle-fill fs-5"></i>
                            </div>
                            <h5 class="fw-bold text-dark mb-0" style="font-size: 1.05rem;">Tambah Peran Manual</h5>
                        </div>
                        <form action="pengaturan.php" method="POST">
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-slate-700">Kunci Peran (Satu kata, lowercase, unik)</label>
                                <input type="text" name="role_key" placeholder="contoh: supervisor" class="form-control rounded-3" required pattern="[a-z0-9_]+" style="font-size: 0.9rem; border-color: #cbd5e1;">
                                <span class="text-muted" style="font-size: 0.72rem; display:block; margin-top: 4px;">Hanya karakter huruf kecil, angka, dan underscore.</span>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-slate-700">Nama Tampilan Peran</label>
                                <input type="text" name="role_name" placeholder="contoh: Supervisor Keuangan" class="form-control rounded-3" required style="font-size: 0.9rem; border-color: #cbd5e1;">
                            </div>
                            <div class="d-grid">
                                <button type="submit" name="add_custom_role" class="btn btn-outline-primary rounded-3 py-2 fw-bold text-uppercase" style="font-size: 0.8rem;">
                                    <i class="bi bi-shield-plus me-1.5"></i> Simpan Peran Baru
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- List Peran Aktif -->
                    <div class="card border shadow-sm rounded-4 p-4" style="background: #ffffff; border-color: #e2e8f0 !important;">
                        <div class="d-flex align-items-center gap-2.5 mb-3">
                            <div class="p-2 bg-success-subtle text-success rounded-3">
                                <i class="bi bi-shield-check-fill fs-5"></i>
                            </div>
                            <h5 class="fw-bold text-dark mb-0" style="font-size: 1.05rem;">Daftar Peran Terdaftar</h5>
                        </div>
                        <div class="list-group list-group-flush" style="font-size: 0.88rem;">
                            <?php foreach ($dynamic_roles as $role_obj): 
                                $is_system = in_array($role_obj['role_key'], ['superadmin', 'admin', 'user']);
                            ?>
                            <div class="list-group-item px-0 py-2.5 d-flex align-items-center justify-content-between border-slate-100">
                                <div>
                                    <span class="fw-bold text-slate-800 d-block"><?= htmlspecialchars($role_obj['role_name']); ?></span>
                                    <span class="font-monospace text-muted text-xs">key: <?= htmlspecialchars($role_obj['role_key']); ?></span>
                                </div>
                                <?php if ($is_system): ?>
                                    <span class="badge bg-secondary-subtle text-secondary rounded-pill text-xs px-2 py-1 border border-secondary-subtle" style="font-size: 0.72rem;">Bawaan</span>
                                <?php else: ?>
                                    <form action="pengaturan.php" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus peran kustom ini? Seluruh akun pengguna yang terikat pada peran ini akan dikembalikan ke tingkat peran Admin.');" class="m-0">
                                        <input type="hidden" name="role_key_to_delete" value="<?= htmlspecialchars($role_obj['role_key']); ?>">
                                        <button type="submit" name="delete_custom_role" class="btn btn-xs btn-link text-danger p-0 border-0" title="Hapus Peran">
                                            <i class="bi bi-trash-fill fs-5"></i>
                                        </button>
                                    </form>
                                <?php endif; ?>
                            </div>
                            <?php endforeach; ?>
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
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
    // Tab persistence with localStorage
    let activeTabId = localStorage.getItem('activeSettingsTab');
    <?php if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($active_tab)): ?>
        activeTabId = 'tab-<?= $active_tab; ?>';
        localStorage.setItem('activeSettingsTab', activeTabId);
    <?php endif; ?>
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
                
                // Real-time synchronization option settings
                const val = radio.value;
                const themeLoginColors = {
                    'slate': {
                        'start': '#1e293b',
                        'mid': '#0f172a',
                        'end': '#020617',
                        'accent': '#2563eb',
                        'hover': '#1d4ed8'
                    },
                    'emerald': {
                        'start': '#064e3b',
                        'mid': '#022c22',
                        'end': '#081d33',
                        'accent': '#059669',
                        'hover': '#047857'
                    },
                    'violet': {
                        'start': '#4c1d95',
                        'mid': '#2e1065',
                        'end': '#0f052d',
                        'accent': '#7c3aed',
                        'hover': '#6d28d9'
                    },
                    'crimson': {
                        'start': '#7f1d1d',
                        'mid': '#450a0a',
                        'end': '#1c0202',
                        'accent': '#dc2626',
                        'hover': '#b91c1c'
                    },
                    'amber': {
                        'start': '#78350f',
                        'mid': '#451a03',
                        'end': '#1e0800',
                        'accent': '#d97706',
                        'hover': '#b45309'
                    }
                };

                if (themeLoginColors[val]) {
                    const c = themeLoginColors[val];
                    const gStart = document.getElementById('login_grad_start');
                    const gMid = document.getElementById('login_grad_mid');
                    const gEnd = document.getElementById('login_grad_end');
                    const cAccent = document.getElementById('login_accent_color');
                    const cHover = document.getElementById('login_hover_color');

                    if (gStart) gStart.value = c.start;
                    if (gMid) gMid.value = c.mid;
                    if (gEnd) gEnd.value = c.end;
                    if (cAccent) cAccent.value = c.accent;
                    if (cHover) cHover.value = c.hover;

                    if (typeof updateLoginPreview === 'function') {
                        updateLoginPreview();
                    }
                }
            }
        });
    });

    // --- SCRIPT LAYOUT DESAIN SISTEM INTERACTIVE ---
    const appNameInput = document.getElementById('nama_aplikasi');
    const logoUploadInput = document.getElementById('logo_upload');
    const clearLogoCheckbox = document.getElementById('clear_logo');
    const previewAppName = document.getElementById('preview-app-name');
    const previewLogoContainer = document.getElementById('preview-logo-container');
    const selectedLogoIconInput = document.getElementById('selected_logo_icon');
    const appVersionInput = document.getElementById('app_version');
    const previewAppVersion = document.getElementById('preview-app-version');

    let localLogoPreviewUrl = '';

    function updateHeaderPreview() {
        if (!appNameInput || !previewAppName) return;
        
        // Update live app name text
        previewAppName.textContent = appNameInput.value.trim() || 'KeuanganKu';

        // Update live app version text
        if (appVersionInput && previewAppVersion) {
            previewAppVersion.textContent = appVersionInput.value.trim() || 'v1.3 - Pro';
        }
        
        // Get image URL or fallback to chosen icon
        let hasLogo = false;
        let logoSrc = '';
        
        const isCleared = clearLogoCheckbox && clearLogoCheckbox.checked;
        
        if (!isCleared) {
            if (localLogoPreviewUrl) {
                hasLogo = true;
                logoSrc = localLogoPreviewUrl;
            } else {
                const existingLogo = '<?= !empty($app_logo_image_url) ? htmlspecialchars($app_logo_image_url) : "" ?>';
                if (existingLogo) {
                    hasLogo = true;
                    logoSrc = existingLogo;
                }
            }
        }
        
        if (hasLogo) {
            previewLogoContainer.className = 'me-3 d-flex align-items-center justify-content-center bg-white p-1 rounded-circle border';
            previewLogoContainer.style.width = '38px';
            previewLogoContainer.style.height = '38px';
            previewLogoContainer.innerHTML = '<img src="' + escapeHtml(logoSrc) + '" alt="Logo" class="rounded-circle" style="width: 28px; height: 28px; object-fit: contain;">';
        } else {
            const selectedIcon = selectedLogoIconInput.value || 'bi-wallet2';
            previewLogoContainer.className = 'me-3 d-flex align-items-center justify-content-center text-primary bg-primary-subtle rounded-circle';
            previewLogoContainer.style.width = '38px';
            previewLogoContainer.style.height = '38px';
            previewLogoContainer.innerHTML = '<i class="bi ' + selectedIcon + ' fs-4"></i>';
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

        if (appVersionInput) {
            appVersionInput.addEventListener('input', updateHeaderPreview);
        }
        
        if (logoUploadInput) {
            logoUploadInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        localLogoPreviewUrl = evt.target.result;
                        if (clearLogoCheckbox) clearLogoCheckbox.checked = false;
                        updateHeaderPreview();
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (clearLogoCheckbox) {
            clearLogoCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    if (logoUploadInput) logoUploadInput.value = '';
                    localLogoPreviewUrl = '';
                }
                updateHeaderPreview();
            });
        }
        
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

    // --- PORTAL LOGIN LIVE DESIGNER REAL-TIME PREVIEW ---
    const loginTitleInput = document.getElementById('login_title');
    const loginSubtitleInput = document.getElementById('login_subtitle');
    const loginSlogan1Input = document.getElementById('login_slogan_1');
    const loginSlogan2Input = document.getElementById('login_slogan_2');
    const loginDescInput = document.getElementById('login_desc');
    const loginBadgeTitleInput = document.getElementById('login_badge_title');
    const loginBadgeDescInput = document.getElementById('login_badge_desc');
    const loginVersionInput = document.getElementById('login_version');

    // Preview elements
    const mockLeft = document.getElementById('mock-left');
    const mockSlogan1 = document.getElementById('mock-slogan1');
    const mockSlogan2 = document.getElementById('mock-slogan2');
    const mockDesc = document.getElementById('mock-desc');
    const mockBadgeIcon = document.getElementById('mock-badge-icon');
    const mockBadgeTitle = document.getElementById('mock-badge-title');
    const mockBadgeDesc = document.getElementById('mock-badge-desc');
    const mockTitle = document.getElementById('mock-title');
    const mockSubtitle = document.getElementById('mock-subtitle');
    const mockBtn = document.getElementById('mock-btn');
    const mockLoginVersionStr = document.getElementById('mock-login-version');

    const themeColorsMapping = {
        'slate': {
            'start': '#1e293b',
            'mid': '#0f172a',
            'end': '#020617',
            'accent': '#2563eb'
        },
        'emerald': {
            'start': '#064e3b',
            'mid': '#022c22',
            'end': '#081d33',
            'accent': '#059669'
        },
        'violet': {
            'start': '#4c1d95',
            'mid': '#2e1065',
            'end': '#0f052d',
            'accent': '#7c3aed'
        },
        'crimson': {
            'start': '#7f1d1d',
            'mid': '#450a0a',
            'end': '#1c0202',
            'accent': '#dc2626'
        },
        'amber': {
            'start': '#78350f',
            'mid': '#451a03',
            'end': '#1e0800',
            'accent': '#d97706'
        }
    };

    function updateLoginPreview() {
        if (loginTitleInput && mockTitle) mockTitle.textContent = loginTitleInput.value.trim() || 'Selamat Datang';
        if (loginSubtitleInput && mockSubtitle) mockSubtitle.textContent = loginSubtitleInput.value.trim() || '';
        if (loginSlogan1Input && mockSlogan1) mockSlogan1.textContent = loginSlogan1Input.value.trim() || '';
        if (loginSlogan2Input && mockSlogan2) mockSlogan2.textContent = loginSlogan2Input.value.trim() || '';
        if (loginDescInput && mockDesc) mockDesc.textContent = loginDescInput.value.trim() || '';
        if (loginBadgeTitleInput && mockBadgeTitle) mockBadgeTitle.textContent = loginBadgeTitleInput.value.trim() || '';
        if (loginBadgeDescInput && mockBadgeDesc) mockBadgeDesc.textContent = loginBadgeDescInput.value.trim() || '';
        if (loginVersionInput && mockLoginVersionStr) mockLoginVersionStr.textContent = loginVersionInput.value.trim() || 'v1.4 SECURE';

        // Get colors dynamically from the selected theme radio
        const checkedThemeRadio = document.querySelector('input[name="theme"]:checked');
        const activeTheme = checkedThemeRadio ? checkedThemeRadio.value : 'emerald';
        const c = themeColorsMapping[activeTheme] || themeColorsMapping['emerald'];

        const gStart = c.start;
        const gMid = c.mid;
        const gEnd = c.end;
        const accent = c.accent;

        if (mockLeft) {
            mockLeft.style.background = 'linear-gradient(135deg, ' + gStart + ' 0%, ' + gMid + ' 35%, ' + gEnd + ' 100%)';
        }
        if (mockBadgeIcon) {
            mockBadgeIcon.style.color = accent;
        }
        if (mockBtn) {
            mockBtn.style.backgroundColor = accent;
        }
    }

    // Attach listeners
    const inputsToWatch = [
        loginTitleInput, loginSubtitleInput, loginSlogan1Input, loginSlogan2Input,
        loginDescInput, loginBadgeTitleInput, loginBadgeDescInput, loginVersionInput
    ];

    inputsToWatch.forEach(inp => {
        if (inp) {
            inp.addEventListener('input', updateLoginPreview);
        }
    });

    // Also update login preview when theme changes
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', updateLoginPreview);
    });

    // Execute on tab active
    const loginTabBtn = document.getElementById('tab-desainlogin');
    if (loginTabBtn) {
        loginTabBtn.addEventListener('shown.bs.tab', function() {
            updateLoginPreview();
        });
    }

    // Initially execute once
    updateLoginPreview();
</script>
</body>
</html>