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

// 4. Aksi: Hapus Kategori
if (isset($_GET['delete_category'])) {
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

// Ambil semua kategori untuk ditampilkan
$all_categories = [];
$res_categories = mysqli_query($koneksi, "SELECT * FROM kategori ORDER BY id ASC");
if ($res_categories) {
    while ($row = mysqli_fetch_assoc($res_categories)) {
        $all_categories[] = $row;
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
    </style>
</head>
<body>

<?php include 'sidebar.php'; ?>

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

    <div class="row g-4">
        <!-- Kolom Kiri: Ganti Tema Warna Aplikasi -->
        <div class="col-lg-6">
            <div class="card main-card p-4 p-md-5 h-100">
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

                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                            <i class="bi bi-check2-circle me-1.5"></i> Simpan Pilihan Tema Warna
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Kolom Kanan: Manage Kategori Transaksi -->
        <div class="col-lg-6">
            <div class="card main-card p-4 p-md-5 h-100">
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
                <div class="d-flex flex-wrap gap-2.5 overflow-auto max-h-96 pr-1">
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
</script>
</body>
</html>
