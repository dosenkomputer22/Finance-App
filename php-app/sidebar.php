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
<style>
    /* Styling khusus Sidebar Premium dengan Tema Dinamis */
    .sidebar-container {
        width: 280px;
        background-color: <?= $theme_cfg['bg_sidebar']; ?>;
        color: <?= $theme_cfg['text_sidebar']; ?>;
        transition: all 0.3s ease;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 1000;
        flex-shrink: 0;
    }
    
    .sidebar-brand {
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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

    .user-profile-section {
        background-color: rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 16px;
        margin: 16px;
        border: 1px solid rgba(255, 255, 255, 0.03);
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
</style>

<div class="app-layout-wrapper">
    <!-- Backdrop untuk mobile menu -->
    <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebarMenu()"></div>

    <!-- Sidebar Container -->
    <aside class="sidebar-container d-flex flex-column" id="sidebarMenu">
        <!-- Brand Header Logo -->
        <div class="sidebar-brand">
            <a href="index.php" class="d-flex align-items-center text-white text-decoration-none">
                <i class="bi bi-wallet2 text-white fs-3 me-2"></i>
                <div>
                    <h5 class="fw-bold mb-0 tracking-tight" style="letter-spacing: -0.025em; color: #ffffff;">KeuanganKu</h5>
                    <span class="badge bg-primary-subtle font-monospace" style="font-size: 0.65rem;">v1.3 - Pro</span>
                </div>
            </a>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-grow-1 py-4">
            <a href="index.php" class="sidebar-nav-link <?= ($active_page === 'dashboard') ? 'active' : ''; ?>">
                <i class="bi bi-grid-fill"></i>
                <span>Dashboard</span>
            </a>
            
            <a href="tambah.php" class="sidebar-nav-link <?= ($active_page === 'tambah_transaksi') ? 'active' : ''; ?>">
                <i class="bi bi-plus-circle-fill"></i>
                <span>Tambah Transaksi</span>
            </a>
            
            <a href="kelola_user.php" class="sidebar-nav-link <?= ($active_page === 'kelola_user') ? 'active' : ''; ?>">
                <i class="bi bi-people-fill"></i>
                <span>Kelola User</span>
            </a>
            
            <a href="pengaturan.php" class="sidebar-nav-link <?= ($active_page === 'pengaturan') ? 'active' : ''; ?>">
                <i class="bi bi-gear-fill"></i>
                <span>Pengaturan</span>
            </a>
        </nav>

        <!-- User Profile & Action Box at Bottom -->
        <div class="mt-auto">
            <div class="user-profile-section">
                <div class="d-flex align-items-center gap-3 mb-2">
                    <div class="bg-primary rounded-circle text-center d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; flex-shrink: 0;">
                        <i class="bi bi-person-fill text-white fs-5"></i>
                    </div>
                    <div class="overflow-hidden">
                        <h6 class="fw-bold text-white mb-0 text-truncate" style="font-size: 0.85rem;"><?= $user_nama; ?></h6>
                        <span class="text-uppercase font-monospace text-slate-400 d-block" style="font-size: 0.65rem;"><?= $user_role; ?></span>
                    </div>
                </div>
                <hr class="border-secondary my-2.5" style="opacity: 0.15;">
                <div class="d-grid">
                    <a href="logout.php" class="btn btn-outline-danger btn-sm rounded-3 py-1.5 font-semibold text-start px-3 text-white border-0" style="background-color: rgba(239, 68, 68, 0.1);" onclick="return confirm('Apakah Anda yakin ingin keluar dari PHP session ini?');">
                        <i class="bi bi-box-arrow-right me-2 text-danger"></i>Keluar Akun
                    </a>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Canvas Area -->
    <div class="main-canvas-area col">
        <!-- Mobile Header Bar -->
        <header class="mobile-header d-md-none d-flex justify-content-between align-items-center">
            <a href="index.php" class="d-flex align-items-center text-white text-decoration-none">
                <i class="bi bi-wallet2 text-primary fs-4 me-2"></i>
                <h6 class="fw-bold mb-0">KeuanganKu</h6>
            </a>
            <button class="btn btn-dark border-secondary px-2.5 py-1.5 rounded-3" onclick="toggleSidebarMenu()">
                <i class="bi bi-list fs-4 font-extrabold text-white"></i>
            </button>
        </header>

        <!-- Top breadcrumb bar for large screens -->
        <header class="bg-white border-bottom py-3 px-4 d-none d-md-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <span class="text-muted text-uppercase fw-bold font-monospace text-xs" style="font-size: 0.7rem; letter-spacing: 0.05em">Aplikasi KeuanganKu Native PHP</span>
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
        sidebar.classList.toggle('show');
        backdrop.classList.toggle('show');
    }
</script>
