<?php
// kategori.php
// Halaman Manajemen Kategori Transaksi (Pindahan dari pengaturan.php)

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

// 2. Aksi: Tambah Kategori Baru
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

// 3. Aksi: Hapus Kategori
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

// Set active page for sidebar
$active_page = 'kategori';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Kategori - <?= htmlspecialchars($app_name); ?></title>
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

        .category-grid-item {
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            padding: 20px;
            background-color: #ffffff;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .category-grid-item:hover {
            border-color: #e2e8f0;
            box-shadow: 0 12px 24px -8px rgba(148, 163, 184, 0.2);
            transform: translateY(-2px);
        }

        .category-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 25%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            font-weight: 700;
            flex-shrink: 0;
            transition: background-color 0.2s ease;
        }

        .delete-cat-btn {
            opacity: 0.5;
            transition: all 0.2s ease;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
            border: none;
        }

        .category-grid-item:hover .delete-cat-btn {
            opacity: 1;
        }

        .delete-cat-btn:hover {
            color: #ffffff;
            background: #ef4444;
            transform: scale(1.05);
        }

        .badge-locked {
            font-size: 0.7rem;
            font-weight: 700;
            color: #64748b;
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .info-panel {
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.04), transparent);
            border: 1px dashed rgba(99, 102, 241, 0.2);
            border-radius: 16px;
        }
    </style>
</head>
<body>

<?php include 'sidebar.php'; ?>

<!-- Content Area -->
<div class="container-fluid py-3">
    
    <!-- Header Title Bar with neat layout -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 bg-white p-4 rounded-4 border border-slate-100 shadow-xs">
                <div class="d-flex align-items-center gap-3">
                    <div class="p-3 rounded-4 text-white d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, <?= $theme_cfg['primary']; ?>, <?= $theme_cfg['hover']; ?>); width: 54px; height: 54px; box-shadow: 0 4px 14px rgba(<?= $theme_cfg['rgb']; ?>, 0.35);">
                        <i class="bi bi-tags-fill fs-3"></i>
                    </div>
                    <div>
                        <h4 class="fw-bold text-slate-800 mb-0 font-sans">Kategori Transaksi</h4>
                        <p class="text-muted small mb-0">Kelola dan kelompokan transaksi finansial perusahaan secara aman</p>
                    </div>
                </div>
                <div class="text-md-end">
                    <span class="badge bg-primary-subtle text-primary font-monospace px-3 py-2 rounded-3" style="font-size: 0.75rem;">
                        <i class="bi bi-bookmark-star-fill me-1"></i> <?= count($all_categories); ?> Total Kategori
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
                <strong class="text-danger-800 d-block">Gagal Proses!</strong>
                <span class="small text-slate-600"><?= $error_msg; ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="row g-4">
        <!-- 1. KANAN: LIST KATEGORI (8 COLS) -->
        <div class="col-lg-8 order-lg-1 order-2">
            <div class="card main-card p-4 h-100 shadow-sm">
                <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-folder2-open text-primary me-2"></i>Daftar Kategori Terdaftar
                    </h5>
                    <span class="text-muted small">Sorot untuk memunculkan tombol hapus custom</span>
                </div>

                <div class="row g-3">
                    <?php if (empty($all_categories)): ?>
                        <div class="col-12 py-5 text-center">
                            <i class="bi bi-tags text-muted fs-1 mb-2 d-block"></i>
                            <p class="text-muted mb-0 italic">Belum ada kategori terdafar dalam sistem database.</p>
                        </div>
                    <?php else: ?>
                        <?php 
                        // Map specific beautiful color palettes for categories based on name
                        $color_maps = [
                            'Gaji' => ['bg' => 'rgba(16, 185, 129, 0.1)', 'color' => '#10b981', 'icon' => 'bi-cash-coin'],
                            'Belanja' => ['bg' => 'rgba(239, 68, 68, 0.1)', 'color' => '#ef4444', 'icon' => 'bi-cart-fill'],
                            'Transportasi' => ['bg' => 'rgba(59, 130, 246, 0.1)', 'color' => '#3b82f6', 'icon' => 'bi-truck'],
                            'Makan & Minum' => ['bg' => 'rgba(245, 158, 11, 0.1)', 'color' => '#f59e0b', 'icon' => 'bi-cup-hot-fill'],
                            'Tagihan' => ['bg' => 'rgba(139, 92, 246, 0.1)', 'color' => '#8b5cf6', 'icon' => 'bi-receipt'],
                            'Freelance' => ['bg' => 'rgba(236, 72, 153, 0.1)', 'color' => '#ec4899', 'icon' => 'bi-laptop'],
                            'Lainnya' => ['bg' => 'rgba(100, 116, 139, 0.1)', 'color' => '#64748b', 'icon' => 'bi-three-dots']
                        ];
                        
                        foreach ($all_categories as $index => $cat): 
                            $cat_name = $cat['nama'];
                            $is_system = in_array($cat_name, $system_categories);
                            
                            // Get visual configuration
                            if (isset($color_maps[$cat_name])) {
                                $cfg = $color_maps[$cat_name];
                            } else {
                                // Dynamic pastel colors based on ASCII/Index value
                                $colors = [
                                    ['bg' => 'rgba(14, 165, 233, 0.1)', 'color' => '#0ea5e9', 'icon' => 'bi-tag-fill'],
                                    ['bg' => 'rgba(168, 85, 247, 0.1)', 'color' => '#a855f7', 'icon' => 'bi-bookmarks-fill'],
                                    ['bg' => 'rgba(20, 184, 166, 0.1)', 'color' => '#20b8a6', 'icon' => 'bi-bookmark-heart-fill'],
                                    ['bg' => 'rgba(234, 179, 8, 0.1)', 'color' => '#eab308', 'icon' => 'bi-wallet2'],
                                    ['bg' => 'rgba(251, 146, 60, 0.1)', 'color' => '#fb923c', 'icon' => 'bi-patch-plus-fill']
                                ];
                                $cfg = $colors[$index % count($colors)];
                            }
                        ?>
                            <div class="col-md-6 col-xl-4">
                                <div class="category-grid-item">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="category-icon-wrapper" style="background-color: <?= $cfg['bg']; ?>; color: <?= $cfg['color']; ?>;">
                                            <i class="bi <?= $cfg['icon']; ?>"></i>
                                        </div>
                                        <div class="overflow-hidden">
                                            <span class="h6 fw-bold text-slate-800 mb-0 d-block text-truncate" title="<?= htmlspecialchars($cat_name); ?>">
                                                <?= htmlspecialchars($cat_name); ?>
                                            </span>
                                            <span class="text-muted d-block" style="font-size: 0.68rem;">ID Kategori: #<?= $cat['id']; ?></span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <?php if ($is_system): ?>
                                            <span class="badge-locked" title="Kategori Sistem: Tidak Bisa Dihapus">
                                                <i class="bi bi-shield-lock-fill"></i> Locked
                                            </span>
                                        <?php else: ?>
                                            <a href="kategori.php?delete_category=<?= $cat['id']; ?>" class="delete-cat-btn" onclick="return confirm('Apakah Anda yakin ingin mendelete kategori custom '<?= htmlspecialchars($cat_name); ?>'?');" title="Hapus Kategori">
                                                <i class="bi bi-trash-fill"></i>
                                            </a>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- 2. KIRI: FORM TAMBAH KATEGORI (4 COLS) -->
        <div class="col-lg-4 order-lg-2 order-1">
            <div class="card main-card p-4 shadow-sm h-100 mb-4 mb-lg-0">
                <div class="border-bottom pb-3 mb-4">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-plus-circle-fill text-primary me-2"></i>Tambah Kategori
                    </h5>
                    <p class="text-muted small mb-0 mt-1">Daftarkan label kategori anggaran baru kedalam sistem database</p>
                </div>

                <form action="kategori.php" method="POST" class="mb-4">
                    <input type="hidden" name="add_category" value="1">
                    
                    <div class="mb-3">
                        <label for="nama_kategori" class="form-label fw-bold text-slate-700 small">Nama Kategori Baru</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-tag-fill text-primary"></i></span>
                            <input type="text" class="form-control border-start-0 ps-1 rounded-end-3" id="nama_kategori" name="nama_kategori" placeholder="Misal: Investasi, Kesehatan" required maxlength="50" style="font-weight: 500;">
                        </div>
                        <div class="form-text text-muted small mt-2">Gunakan nama kategori yang padat dan mudah dipahami. Maksimal 50 karakter.</div>
                    </div>

                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 shadow-sm">
                            <i class="bi bi-plus-lg fs-5"></i><span>Simpan Kategori</span>
                        </button>
                    </div>
                </form>

                <!-- Guideline Panel Info -->
                <div class="p-3 info-panel mt-auto">
                    <h6 class="fw-bold text-indigo-800 d-flex align-items-center gap-2" style="font-size: 0.82rem; color: #3730a3;">
                        <i class="bi bi-info-circle-fill"></i> Panduan Pengelolaan
                    </h6>
                    <p class="text-muted mb-0 leading-relaxed" style="font-size: 0.72rem; line-height: 1.5;">
                        Kategori default bersistem (<span class="font-bold text-dark">Locked</span>) dikunci otomatis untuk kelancaran komparasi grafik dashboard utama. Anda dipersilahkan membuat kategori kustom sesuka hati guna mencatat rincian transaksi kas secara lebih spesifik.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>