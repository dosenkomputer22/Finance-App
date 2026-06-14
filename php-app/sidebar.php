<?php
// sidebar.php
// Sidebar layout shared across index.php, kelola_user.php, tambah.php, edit.php, dsb.

// Ensure session is started safely
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($koneksi)) {
    include_once 'koneksi.php';
}

$active_page = $active_page ?? 'dashboard';
$user_nama = htmlspecialchars($_SESSION['nama'] ?? 'Pengguna');
$user_role = htmlspecialchars($_SESSION['role'] ?? 'admin');
$user_username = htmlspecialchars($_SESSION['username'] ?? 'user');

// Cek hak akses menu dinamis untuk page aktif
$permission_page_mapping = [
    'dashboard' => 'dashboard',
    'transaksi' => 'transaksi',
    'pemasukan' => 'transaksi',
    'pengeluaran' => 'transaksi',
    'transaksi_berulang' => 'transaksi',
    'laporan' => 'laporan',
    'anggaran' => 'anggaran',
    'rekening' => 'rekening',
    'kategori' => 'kategori',
    'kelola_user' => 'kelola_user',
    'pengaturan' => 'pengaturan'
];

$required_menu = $permission_page_mapping[$active_page] ?? 'dashboard';
if (!has_menu_permission($user_role, $required_menu)) {
    if (basename($_SERVER['PHP_SELF']) !== 'index.php') {
        header("Location: index.php?error=no_permission");
        exit();
    } else {
        $allowed_urls = [
            'transaksi' => 'tambah.php?filter_jenis=semua',
            'laporan' => 'laporan.php',
            'anggaran' => 'anggaran.php',
            'rekening' => 'rekening.php',
            'kategori' => 'kategori.php',
            'kelola_user' => 'kelola_user.php',
            'pengaturan' => 'pengaturan.php'
        ];
        $fallback_target = '';
        foreach ($allowed_urls as $menu_key => $target_url) {
            if (has_menu_permission($user_role, $menu_key)) {
                $fallback_target = $target_url;
                break;
            }
        }
        if (!empty($fallback_target)) {
            header("Location: " . $fallback_target);
            exit();
        } else {
            echo "<div style='font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0f172a; color: #f1f5f9; padding: 20px;'><div style='text-align: center; max-width: 500px; background: rgba(255,255,255,0.05); padding: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);'><i class='bi bi-shield-slash' style='font-size: 3rem; color: #ef4444;'></i><h2 style='font-weight: 700; margin-top:20px;'>Akses Ditolak</h2><p style='color: #94a3b8; font-size: 0.9rem; line-height: 1.5; margin-top: 10px;'>Akun Anda tidak memiliki izin untuk melihat menu manapun. Hubungi Superadmin Anda.</p><a href='logout.php' style='display:inline-block; font-size: 0.85rem; font-weight: 600; text-decoration:none; color:#ffffff; background:#ef4444; padding: 10px 20px; border-radius: 8px; margin-top: 15px;'>Keluar Akun</a></div></div>";
            exit();
        }
    }
}

// Ambil & Terapkan Tema Warna Dinamis dari Pengaturan User
if (isset($koneksi) && !isset($_SESSION['theme'])) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $theme_query = mysqli_query($koneksi, "SELECT theme FROM users WHERE username = '$db_username_escaped'");
    if ($theme_query && mysqli_num_rows($theme_query) > 0) {
        $theme_row = mysqli_fetch_assoc($theme_query);
        $_SESSION['theme'] = $theme_row['theme'];
    } else {
        $_SESSION['theme'] = 'slate';
    }
}
$current_theme = $_SESSION['theme'] ?? 'slate';

// Ambil & Terapkan Bahasa Dinamis dari Pengaturan User
if (isset($koneksi) && !isset($_SESSION['lang'])) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $lang_query = mysqli_query($koneksi, "SELECT lang FROM users WHERE username = '$db_username_escaped'");
    if ($lang_query && mysqli_num_rows($lang_query) > 0) {
        $lang_row = mysqli_fetch_assoc($lang_query);
        $_SESSION['lang'] = !empty($lang_row['lang']) ? $lang_row['lang'] : 'id';
    } else {
        $_SESSION['lang'] = 'id';
    }
}
$current_lang = $_SESSION['lang'] ?? 'id';

$theme_colors = [
    'slate' => [
        'name' => 'Modern Slate',
        'primary' => '#2563eb', // Blue 600
        'hover' => '#1d4ed8',
        'rgb' => '37, 99, 235',
        'bg_sidebar' => '#0f172a', // Slate 900
        'text_sidebar' => '#cbd5e1',
        'sidebar_active' => '#2563eb'
    ],
    'emerald' => [
        'name' => 'Emerald Forest',
        'primary' => '#059669', // Emerald 600
        'hover' => '#047857',
        'rgb' => '5, 150, 105',
        'bg_sidebar' => '#064e3b', // Emerald 900
        'text_sidebar' => '#d1fae5',
        'sidebar_active' => '#059669'
    ],
    'violet' => [
        'name' => 'Royal Violet',
        'primary' => '#7c3aed', // Violet 600
        'hover' => '#6d28d9',
        'rgb' => '124, 58, 237',
        'bg_sidebar' => '#2e1065', // Violet 900
        'text_sidebar' => '#f5f3ff',
        'sidebar_active' => '#7c3aed'
    ],
    'crimson' => [
        'name' => 'Charcoal Crimson',
        'primary' => '#dc2626', // Red 600
        'hover' => '#b91c1c',
        'rgb' => '220, 38, 38',
        'bg_sidebar' => '#450a0a', // Red 900
        'text_sidebar' => '#fee2e2',
        'sidebar_active' => '#dc2626'
    ],
    'amber' => [
        'name' => 'Amber Sunset',
        'primary' => '#d97706', // Amber 600
        'hover' => '#b45309',
        'rgb' => '217, 119, 6',
        'bg_sidebar' => '#451a03', // Amber 900
        'text_sidebar' => '#fffbeb',
        'sidebar_active' => '#d97706'
    ]
];

$selected_theme = isset($theme_colors[$current_theme]) ? $current_theme : 'slate';
$theme_cfg = $theme_colors[$selected_theme];
?>
<script>
    // Lindungi dari Cumulative Layout Shift (CLS) saat browser pertama kali memuat layout halaman
    (function() {
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (isCollapsed && window.innerWidth >= 768) {
            document.write('<style>@media(min-width:768px){.sidebar-container{width:80px !important;}.sidebar-brand-text, .sidebar-nav-link span, .toggle-chevron, .sub-menu-nav, .collapse.show, .collapse, .user-profile-text-wrapper, .dropdown-toggle::after{display:none !important;}.sidebar-container .sidebar-brand{padding:20px 0 !important;justify-content:center !important;flex-direction:column !important;gap:8px !important;}.sidebar-container .sidebar-brand a{justify-content:center !important;width:auto !important;}.sidebar-container .sidebar-brand img,.sidebar-container .sidebar-brand i{margin-right:0 !important;}.sidebar-container .sidebar-toggle-btn{position:static !important;transform:none !important;margin-top:4px !important;}.sidebar-container .sidebar-nav-link{padding:12px 0 !important;margin:4px 12px !important;justify-content:center !important;}.sidebar-container .sidebar-nav-link i{margin-right:0 !important;font-size:1.45rem !important;}.sidebar-container .user-profile-section{padding:10px 0 !important;margin:16px 8px !important;justify-content:center !important;}.sidebar-container .user-profile-section a{justify-content:center !important;}}</style>');
        }
    })();
</script>
<style>
    /* Styling khusus Sidebar Premium dengan Tema Dinamis */
    .sidebar-container {
        width: 280px;
        background-color: <?= $theme_cfg['bg_sidebar']; ?>;
        color: <?= $theme_cfg['text_sidebar']; ?>;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 1000;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    .sidebar-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
    
    .sidebar-brand {
        position: relative;
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: padding 0.25s ease;
    }

    .sidebar-brand a {
        transition: opacity 0.22s ease;
        cursor: pointer;
    }

    .sidebar-brand a:hover {
        opacity: 0.8 !important;
    }
    
    .sidebar-nav-link {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 600;
        text-decoration: none;
        border-radius: 12px;
        margin: 4px 16px;
        transition: all 0.2s ease;
    }
    
    .sidebar-nav-link:hover {
        background-color: rgba(255, 255, 255, 0.07);
        color: #ffffff;
    }
    
    .sidebar-nav-link.active {
        background-color: <?= $theme_cfg['sidebar_active']; ?> !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(<?= $theme_cfg['rgb']; ?>, 0.35);
    }
    
    .sidebar-nav-link i {
        font-size: 1.25rem;
        margin-right: 12px;
    }

    /* Sub-menu styling for Transaksi dropdown */
    .sub-menu-nav {
        padding-left: 12px;
        margin-bottom: 6px;
    }
    
    .sidebar-sub-link {
        display: flex;
        align-items: center;
        padding: 9px 16px;
        color: rgba(255, 255, 255, 0.55);
        font-weight: 500;
        text-decoration: none;
        border-radius: 10px;
        margin: 2px 16px 2px 28px;
        font-size: 0.85rem;
        transition: all 0.2s ease;
    }
    
    .sidebar-sub-link:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
    }
    
    .sidebar-sub-link.active {
        color: #ffffff !important;
        font-weight: 750;
        background-color: rgba(255, 255, 255, 0.1);
        border-left: 3px solid <?= $theme_cfg['sidebar_active']; ?>;
    }
    
    .sidebar-sub-link i {
        font-size: 0.9rem;
        margin-right: 10px;
        opacity: 0.7;
    }

    [aria-expanded="true"] .toggle-chevron {
        transform: rotate(180deg);
    }
    .toggle-chevron {
        transition: transform 0.2s ease;
    }

    .user-profile-section {
        background-color: rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 12px;
        margin: 16px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        transition: all 0.2s ease;
    }
    .user-profile-section:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    .user-profile-section .dropdown-toggle::after {
        margin-left: auto;
        color: rgba(255, 255, 255, 0.4);
    }
    .user-profile-section .dropdown-menu {
        background-color: #1e293b !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
        padding: 6px !important;
    }
    .user-profile-section .dropdown-item {
        color: #e2e8f0 !important;
        border-radius: 8px;
        transition: all 0.15s ease;
    }
    .user-profile-section .dropdown-item:hover {
        background-color: rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
    }
    .user-profile-section .dropdown-item.text-danger:hover {
        background-color: rgba(239, 68, 68, 0.15) !important;
        color: #ef4444 !important;
    }

    .mobile-header {
        background-color: <?= $theme_cfg['bg_sidebar']; ?>;
        color: #ffffff;
        padding: 15px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Penyesuaian layout fluid */
    .app-layout-wrapper {
        display: flex;
        min-height: 100vh;
        width: 100%;
    }

    .main-canvas-area {
        flex-grow: 1;
        background-color: #f8fafc;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    /* Override Warna Booster Bootstrap secara Dinamis */
    .btn-primary {
        background-color: <?= $theme_cfg['primary']; ?> !important;
        border-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .btn-primary:hover, .btn-primary:active, .btn-primary:focus {
        background-color: <?= $theme_cfg['hover']; ?> !important;
        border-color: <?= $theme_cfg['hover']; ?> !important;
    }
    .btn-outline-primary {
        color: <?= $theme_cfg['primary']; ?> !important;
        border-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .btn-outline-primary:hover {
        background-color: <?= $theme_cfg['primary']; ?> !important;
        color: #ffffff !important;
    }
    .text-primary {
        color: <?= $theme_cfg['primary']; ?> !important;
    }
    .bg-primary {
        background-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .badge.bg-primary-subtle {
        background-color: rgba(<?= $theme_cfg['rgb']; ?>, 0.12) !important;
        color: <?= $theme_cfg['primary']; ?> !important;
        border: 1px solid rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }
    .border-primary-200 {
        border-color: rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }

    @media (max-width: 767.98px) {
        .sidebar-container {
            position: fixed;
            left: -280px;
            top: 0;
            bottom: 0;
            width: 280px;
            height: 100vh;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        .sidebar-container.show {
            left: 0;
        }

        .sidebar-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            z-index: 999;
        }

        .sidebar-backdrop.show {
            display: block;
        }
    }

    /* Collapsed state styles for medium and larger devices */
    @media (min-width: 768px) {
        .sidebar-container.collapsed {
            width: 80px;
        }
        .sidebar-container.collapsed .sidebar-brand-text,
        .sidebar-container.collapsed .sidebar-nav-link span,
        .sidebar-container.collapsed .sidebar-nav-link .toggle-chevron,
        .sidebar-container.collapsed .collapse,
        .sidebar-container.collapsed .collapse.show,
        .sidebar-container.collapsed .user-profile-text-wrapper,
        .sidebar-container.collapsed .dropdown-toggle::after {
            display: none !important;
        }
        .sidebar-container.collapsed .sidebar-brand {
            padding: 24px 0 !important;
            display: flex;
            justify-content: center !important;
        }
        .sidebar-container.collapsed .sidebar-brand a {
            justify-content: center !important;
            width: 100%;
        }
        .sidebar-container.collapsed .sidebar-brand img,
        .sidebar-container.collapsed .sidebar-brand i {
            margin-right: 0 !important;
        }
        .sidebar-container.collapsed .sidebar-nav-link {
            padding: 12px 0 !important;
            margin: 4px 12px !important;
            justify-content: center !important;
        }
        .sidebar-container.collapsed .sidebar-nav-link i {
            margin-right: 0 !important;
            font-size: 1.45rem !important;
        }
        .sidebar-container.collapsed .user-profile-section {
            padding: 10px 0 !important;
            margin: 16px 8px !important;
            justify-content: center !important;
        }
        .sidebar-container.collapsed .user-profile-section a {
            justify-content: center !important;
        }
    }

    /* Premium frosted glass and backdrop-blur overlays for floating modals */
    body.modal-open .app-layout-wrapper {
        transition: filter 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .modal-backdrop {
        background-color: rgba(15, 23, 42, 0.3) !important;
        backdrop-filter: blur(6px);
        transition: all 0.3s ease;
    }
    .modal-content {
        border: none !important;
        border-radius: 20px !important;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25) !important;
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
    }
    .modal-header {
        border-bottom: 1.5px solid rgba(241, 245, 249, 0.85) !important;
    }
    .modal-footer {
        border-top: 1.5px solid rgba(241, 245, 249, 0.85) !important;
    }
</style>

<div class="app-layout-wrapper">
    <!-- Backdrop untuk mobile menu -->
    <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebarMenu()"></div>

    <!-- Sidebar Container -->
    <aside class="sidebar-container d-flex flex-column" id="sidebarMenu">
        <!-- Brand Header Logo -->
        <div class="sidebar-brand">
            <?php
            $app_name_len = mb_strlen($app_name, 'UTF-8');
            $title_font_size = '1.14rem';
            if ($app_name_len > 20) {
                $title_font_size = '0.84rem';
            } elseif ($app_name_len > 15) {
                $title_font_size = '0.94rem';
            } elseif ($app_name_len > 10) {
                $title_font_size = '1.04rem';
            }
            ?>
            <a href="javascript:void(0)" onclick="toggleSidebarCollapse(); return false;" class="d-flex align-items-center text-white text-decoration-none" style="flex-grow: 1; min-width: 0;" title="Sembunyikan/Tampilkan Menu">
                <?php if (!empty($app_logo_image_url)): ?>
                    <img src="<?= htmlspecialchars($app_logo_image_url); ?>" alt="Logo" class="rounded-pill bg-white p-1" style="width: 34px; height: 34px; object-fit: contain; flex-shrink: 0; margin-right: 10px; align-self: center;">
                <?php else: ?>
                    <i class="bi <?= htmlspecialchars($app_logo_icon); ?> text-white fs-3" style="flex-shrink: 0; margin-right: 10px; align-self: center;"></i>
                <?php endif; ?>
                <div class="sidebar-brand-text d-flex flex-column justify-content-center" style="min-width: 0; line-height: 1.1;">
                    <h5 class="fw-bold mb-0 tracking-tight text-truncate" style="letter-spacing: -0.025em; color: #ffffff; font-size: <?= $title_font_size; ?>; line-height: 1.25;" title="<?= htmlspecialchars($app_name); ?>"><?= htmlspecialchars($app_name); ?></h5>
                    <span class="badge bg-primary-subtle text-primary font-monospace mt-1" style="font-size: 0.54rem; padding: 2px 4px; border-radius: 4px; width: fit-content; letter-spacing: 0.025em; font-weight: 700;"><?= htmlspecialchars($app_version); ?></span>
                </div>
            </a>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-grow-1 py-4">
            <?php if (has_menu_permission($user_role, 'dashboard')): ?>
            <a href="index.php" class="sidebar-nav-link <?= ($active_page === 'dashboard') ? 'active' : ''; ?>">
                <i class="bi bi-grid-fill"></i>
                <span><?= __('Dashboard', 'Dashboard'); ?></span>
            </a>
            <?php endif; ?>
            
            <!-- Dropdown Menu Transaksi -->
            <?php if (has_menu_permission($user_role, 'transaksi')): ?>
            <?php 
            $is_transaksi_active = in_array($active_page, ['transaksi', 'pemasukan', 'pengeluaran', 'transaksi_berulang']);
            ?>
            <a href="#menuTransaksi" data-bs-toggle="collapse" class="sidebar-nav-link d-flex justify-content-between align-items-center <?= $is_transaksi_active ? 'active' : ''; ?>" aria-expanded="<?= $is_transaksi_active ? 'true' : 'false'; ?>">
                <div class="d-flex align-items-center">
                    <i class="bi bi-cash-stack"></i>
                    <span><?= __('Transaksi', 'Transactions'); ?></span>
                </div>
                <i class="bi bi-chevron-down ms-auto toggle-chevron" style="font-size: 0.8rem; margin-right: 0;"></i>
            </a>
            <div class="collapse <?= $is_transaksi_active ? 'show' : ''; ?>" id="menuTransaksi">
                <div class="sub-menu-nav">
                    <a href="tambah.php?filter_jenis=semua" class="sidebar-sub-link <?= ($active_page === 'transaksi') ? 'active' : ''; ?>">
                        <i class="bi bi-arrow-repeat"></i>
                        <span><?= __('Semua Transaksi', 'All Transactions'); ?></span>
                    </a>
                    <a href="tambah.php?filter_jenis=pemasukan" class="sidebar-sub-link <?= ($active_page === 'pemasukan') ? 'active' : ''; ?>">
                        <i class="bi bi-graph-up-arrow"></i>
                        <span><?= __('Pemasukan', 'Income'); ?></span>
                    </a>
                    <a href="tambah.php?filter_jenis=pengeluaran" class="sidebar-sub-link <?= ($active_page === 'pengeluaran') ? 'active' : ''; ?>">
                        <i class="bi bi-graph-down-arrow"></i>
                        <span><?= __('Pengeluaran', 'Expense'); ?></span>
                    </a>
                    <a href="tambah.php?filter_jenis=berulang" class="sidebar-sub-link <?= ($active_page === 'transaksi_berulang') ? 'active' : ''; ?>">
                        <i class="bi bi-arrow-clockwise"></i>
                        <span><?= __('Transaksi Berulang', 'Recurring'); ?></span>
                    </a>
                </div>
            </div>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'laporan')): ?>
            <a href="laporan.php" class="sidebar-nav-link <?= ($active_page === 'laporan') ? 'active' : ''; ?>">
                <i class="bi bi-file-earmark-bar-graph-fill"></i>
                <span><?= __('Laporan', 'Reports'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'anggaran')): ?>
            <a href="anggaran.php" class="sidebar-nav-link <?= ($active_page === 'anggaran') ? 'active' : ''; ?>">
                <i class="bi bi-pie-chart-fill"></i>
                <span><?= __('Anggaran', 'Budgets'); ?></span>
            </a>
            <?php endif; ?>
 
            <?php if (has_menu_permission($user_role, 'rekening')): ?>
            <a href="rekening.php" class="sidebar-nav-link <?= ($active_page === 'rekening') ? 'active' : ''; ?>">
                <i class="bi bi-wallet2"></i>
                <span><?= __('Dompet / Rekening', 'Wallets / Accounts'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'kategori')): ?>
            <a href="kategori.php" class="sidebar-nav-link <?= ($active_page === 'kategori') ? 'active' : ''; ?>">
                <i class="bi bi-tag-fill"></i>
                <span><?= __('Kategori', 'Categories'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'kelola_user')): ?>
            <a href="kelola_user.php" class="sidebar-nav-link <?= ($active_page === 'kelola_user') ? 'active' : ''; ?>">
                <i class="bi bi-people-fill"></i>
                <span><?= __('Kelola User', 'Manage Users'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'pengaturan')): ?>
            <a href="pengaturan.php" class="sidebar-nav-link <?= ($active_page === 'pengaturan') ? 'active' : ''; ?>">
                <i class="bi bi-gear-fill"></i>
                <span><?= __('Pengaturan', 'Settings'); ?></span>
            </a>
            <?php endif; ?>
        </nav>
 
        <!-- User Profile & Dropdown Box at Bottom -->
        <div class="mt-auto">
            <div class="user-profile-section dropdown">
                <a href="#" class="d-flex align-items-center gap-2 text-decoration-none dropdown-toggle w-100" id="userProfDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="outline: none;">
                    <div class="bg-primary rounded-circle text-center d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; flex-shrink: 0;">
                        <i class="bi bi-person-fill text-white fs-6"></i>
                    </div>
                    <div class="overflow-hidden flex-grow-1 text-start user-profile-text-wrapper">
                        <h6 class="fw-bold text-white mb-0 text-truncate" style="font-size: 0.8rem;"><?= $user_nama; ?></h6>
                        <span class="text-uppercase font-monospace text-slate-400 d-block text-truncate" style="font-size: 0.6rem;"><?= $user_role; ?></span>
                    </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-dark shadow border-0 mt-2" aria-labelledby="userProfDropdown" style="background-color: #1e293b; border-radius: 12px; font-size: 0.8rem; width: 100%;">
                    <li>
                        <div class="px-3 py-1.5 text-slate-400 font-monospace border-bottom border-secondary mb-1" style="font-size: 0.65rem; opacity: 0.8;">
                            <?= __('Sesi:', 'Session:'); ?> @<?= htmlspecialchars($user_username); ?>
                        </div>
                    </li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-white" href="pengaturan.php" style="font-size: 0.75rem;">
                            <i class="bi bi-gear-fill text-muted"></i> <?= __('Pengaturan', 'Settings'); ?>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-white" href="rekening.php" style="font-size: 0.75rem;">
                            <i class="bi bi-wallet2 text-muted"></i> <?= __('Dompet Saya', 'My Wallets'); ?>
                        </a>
                    </li>
                    <li><hr class="dropdown-divider border-secondary" style="opacity: 0.15; margin: 4px 0;"></li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger fw-semibold" href="logout.php" onclick="return confirm('<?= __('Apakah Anda yakin ingin keluar?', 'Are you sure you want to log out?'); ?>');" style="font-size: 0.75rem;">
                            <i class="bi bi-box-arrow-right"></i> <?= __('Keluar Akun', 'Log Out'); ?>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </aside>

    <!-- Main Canvas Area -->
    <div class="main-canvas-area col">
        <!-- Mobile Header Bar -->
        <header class="mobile-header d-md-none d-flex justify-content-between align-items-center">
            <a href="index.php" class="d-flex align-items-center text-white text-decoration-none">
                <?php if (!empty($app_logo_image_url)): ?>
                    <img src="<?= htmlspecialchars($app_logo_image_url); ?>" alt="Logo" class="rounded-pill me-2 bg-white p-0.5" style="width: 28px; height: 28px; object-fit: contain;">
                <?php else: ?>
                    <i class="bi <?= htmlspecialchars($app_logo_icon); ?> text-primary fs-4 me-2"></i>
                <?php endif; ?>
                <h6 class="fw-bold mb-0 text-truncate" style="max-width: 180px;"><?= htmlspecialchars($app_name); ?></h6>
            </a>
            <button class="btn btn-dark border-secondary px-2.5 py-1.5 rounded-3" onclick="toggleSidebarMenu()">
                <i class="bi bi-list fs-4 font-extrabold text-white"></i>
            </button>
        </header>

        <!-- Top breadcrumb bar for large screens -->
        <header class="bg-white border-bottom py-3 px-4 d-none d-md-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <span class="text-muted text-uppercase fw-bold font-monospace text-xs" style="font-size: 0.7rem; letter-spacing: 0.05em">Aplikasi <?= htmlspecialchars($app_name); ?> Native PHP</span>
                <i class="bi bi-chevron-right text-muted" style="font-size: 0.8rem;"></i>
                <span class="text-dark fw-bold text-xs" style="font-size: 0.8rem;"><?= htmlspecialchars(ucwords(str_replace('_', ' ', $active_page))); ?></span>
            </div>
            
            <div class="d-flex align-items-center gap-2 font-monospace text-xs bg-light px-3 py-1.5 rounded-3 text-muted" style="font-size: 0.75rem;">
                <i class="bi bi-clock-fill text-primary"></i>
                <span>Waktu Server: <?= date('d M Y'); ?></span>
            </div>
        </header>

        <!-- Container for inner contents -->
        <div class="p-3 p-md-4 flex-grow-1 overflow-auto">
<script>
    function toggleSidebarMenu() {
        const sidebar = document.getElementById('sidebarMenu');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (sidebar && backdrop) {
            sidebar.classList.toggle('show');
            backdrop.classList.toggle('show');
        }
    }

    function toggleSidebarCollapse() {
        const sidebar = document.getElementById('sidebarMenu');
        const desktopIcon = document.getElementById('desktopToggleIcon');
        if (!sidebar) return;
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            localStorage.setItem('sidebar-collapsed', 'false');
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-left text-white opacity-75 fs-6';
            }
        } else {
            sidebar.classList.add('collapsed');
            localStorage.setItem('sidebar-collapsed', 'true');
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-right text-white opacity-75 fs-6';
            }
        }
    }

    // Set status tombol & ikon dari localStorage saat halaman termuat
    document.addEventListener('DOMContentLoaded', function() {
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        const sidebar = document.getElementById('sidebarMenu');
        const desktopIcon = document.getElementById('desktopToggleIcon');
        
        if (isCollapsed) {
            if (sidebar && window.innerWidth >= 768) {
                sidebar.classList.add('collapsed');
            }
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-right text-white opacity-75 fs-6';
            }
        } else {
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-left text-white opacity-75 fs-6';
            }
        }
    });
</script>

