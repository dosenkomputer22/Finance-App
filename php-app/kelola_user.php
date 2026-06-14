<?php
// kelola_user.php
// Halaman tabel daftar user dan management akun dengan otorisasi Super Admin & Admin

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_role = $_SESSION['role'] ?? 'admin';
$success_msg = "";
$error_msg = "";
$active_tab = "user_list";

// 1. Aksi: Ubah Otoritas Peran (Khusus Superadmin)
if (isset($_POST['update_role_permissions'])) {
    $active_tab = 'otoritas';
    if ($user_role !== 'superadmin') {
        $error_msg = "Akses Ditolak: Hanya akun dengan tingkat peran 'superadmin' yang berwenang melakukan konfigurasi otoritas hak akses.";
    } else {
        // Fetch dynamic roles list from peran table
        $roles_list = [];
        $roles_res = mysqli_query($koneksi, "SELECT * FROM `peran` ORDER BY id ASC");
        if ($roles_res && mysqli_num_rows($roles_res) > 0) {
            while ($r_row = mysqli_fetch_assoc($roles_res)) {
                $roles_list[] = $r_row['role_key'];
            }
        } else {
            $roles_list = ['superadmin', 'admin', 'user'];
        }
        
        $menus_list = ['dashboard', 'transaksi', 'laporan', 'anggaran', 'rekening', 'kategori', 'kelola_user', 'pengaturan'];
        
        $all_queries_ok = true;
        foreach ($roles_list as $role_item) {
            foreach ($menus_list as $menu_item) {
                // Tentukan nama field dari form post
                $post_key = "perm_" . $role_item . "_" . $menu_item;
                $p_val = isset($_POST[$post_key]) && $_POST[$post_key] == '1' ? '1' : '0';
                
                // Mencegah superadmin terkunci secara tidak sengaja
                if ($role_item === 'superadmin' && in_array($menu_item, ['pengaturan', 'kelola_user'])) {
                    $p_val = '1';
                }
                
                $db_kunci = mysqli_real_escape_string($koneksi, "perm_" . $role_item . "_" . $menu_item);
                $db_nilai = mysqli_real_escape_string($koneksi, $p_val);
                
                // Bersihkan entri duplikat sebelumnya untuk reliabilitas mutlak, lalu simpan entri baru
                mysqli_query($koneksi, "DELETE FROM `pengaturan_sistem` WHERE `kunci` = '$db_kunci'");
                $sql_save = "INSERT INTO `pengaturan_sistem` (`kunci`, `nilai`) VALUES ('$db_kunci', '$db_nilai')";
                if (mysqli_query($koneksi, $sql_save)) {
                    $sys_settings[$db_kunci] = $p_val;
                } else {
                    $all_queries_ok = false;
                }
            }
        }
        
        if ($all_queries_ok) {
            $success_msg = "Konfigurasi izin otoritas peran berhasil diperbarui dan diterapkan ke seluruh sistem!";
        } else {
            $error_msg = "Sebagian atau seluruh izin otoritas gagal diperbarui di database.";
        }
    }
}

// 2. Aksi: Tambah Peran Baru Secara Manual (Khusus Superadmin)
if (isset($_POST['add_custom_role'])) {
    $active_tab = 'otoritas';
    if ($user_role !== 'superadmin') {
        $error_msg = "Akses Ditolak: Hanya superadmin yang berhak menambah peran baru.";
    } else {
        $role_key = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $_POST['role_key'] ?? ''));
        $role_name = trim(strip_tags($_POST['role_name'] ?? ''));
        
        if (empty($role_key) || empty($role_name)) {
            $error_msg = "Kunci Peran dan Nama Peran wajib diisi.";
        } else {
            // Cek apakah sudah ada role_key tersebut
            $check_role = mysqli_query($koneksi, "SELECT 1 FROM `peran` WHERE `role_key` = '".mysqli_real_escape_string($koneksi, $role_key)."'");
            if ($check_role && mysqli_num_rows($check_role) > 0) {
                $error_msg = "Gagal: Kunci Peran '$role_key' sudah digunakan.";
            } else {
                $role_key_esc = mysqli_real_escape_string($koneksi, $role_key);
                $role_name_esc = mysqli_real_escape_string($koneksi, $role_name);
                
                $sql_ins = "INSERT INTO `peran` (`role_key`, `role_name`) VALUES ('$role_key_esc', '$role_name_esc')";
                if (mysqli_query($koneksi, $sql_ins)) {
                    $success_msg = "Peran baru '$role_name' berhasil ditambahkan! Silakan tentukan izin aksesnya di tabel bawah.";
                    // Default permissions: aktifkan beberapa menu dlu biar ga blank
                    $default_menus = ['dashboard', 'transaksi', 'laporan', 'rekening'];
                    foreach ($default_menus as $dm_key) {
                        $kunci = "perm_" . $role_key . "_" . $dm_key;
                        mysqli_query($koneksi, "INSERT INTO `pengaturan_sistem` (`kunci`, `nilai`) VALUES ('$kunci', '1') ON DUPLICATE KEY UPDATE `nilai` = '1'");
                        $sys_settings[$kunci] = '1';
                    }
                } else {
                    $error_msg = "Gagal menyisipkan peran baru ke database.";
                }
            }
        }
    }
}

// 3. Aksi: Hapus Peran Kustom (Khusus Superadmin)
if (isset($_POST['delete_custom_role'])) {
    $active_tab = 'otoritas';
    if ($user_role !== 'superadmin') {
        $error_msg = "Akses Ditolak: Hanya superadmin yang berhak menghapus peran.";
    } else {
        $role_to_delete = strtolower(trim($_POST['role_key_to_delete'] ?? ''));
        if (in_array($role_to_delete, ['superadmin', 'admin', 'user'])) {
            $error_msg = "Gagal: Peran bawaan '$role_to_delete' tidak dapat dihapus demi kestabilan sistem.";
        } else {
            $role_to_delete_esc = mysqli_real_escape_string($koneksi, $role_to_delete);
            $query_del = mysqli_query($koneksi, "DELETE FROM `peran` WHERE `role_key` = '$role_to_delete_esc'");
            if ($query_del) {
                // Hapus all perm settings
                mysqli_query($koneksi, "DELETE FROM `pengaturan_sistem` WHERE `kunci` LIKE 'perm_".$role_to_delete_esc."_%'");
                // Kembalikan users dengan role ini ke 'admin'
                mysqli_query($koneksi, "UPDATE `users` SET `role` = 'admin' WHERE `role` = '$role_to_delete_esc'");
                $success_msg = "Peran dengan kunci '$role_to_delete' berhasil dihapus beserta seluruh izin hak aksesnya!";
            } else {
                $error_msg = "Gagal menghapus peran dari database.";
            }
        }
    }
}

// Aksi approval registrasi (Khusus Super Admin)
if (($_SESSION['role'] ?? '') === 'superadmin' && isset($_GET['act']) && $_GET['act'] === 'approve') {
    $approve_id = intval($_GET['id'] ?? 0);
    $query_appr = "UPDATE users SET status = 'approved' WHERE id = ?";
    $stmt_appr = mysqli_prepare($koneksi, $query_appr);
    if ($stmt_appr) {
        mysqli_stmt_bind_param($stmt_appr, "i", $approve_id);
        if (mysqli_stmt_execute($stmt_appr)) {
            header("Location: kelola_user.php?msg=" . urlencode("Registrasi pengguna telah disetujui (ACC) sukses!"));
        } else {
            header("Location: kelola_user.php?err=" . urlencode("Gagal menyetujui pengguna di database."));
        }
        mysqli_stmt_close($stmt_appr);
        exit();
    }
}

// Ambil daftar seluruh user (termasuk kolom status)
$query_users = "SELECT id, username, nama, role, status FROM users ORDER BY id ASC";
$result_users = mysqli_query($koneksi, $query_users);

// Proses data ke array untuk kalkulasi metrik visual yang stylish
$list_users = [];
$total_users = 0;
$total_approved = 0;
$total_pending = 0;

if ($result_users) {
    while ($row = mysqli_fetch_assoc($result_users)) {
        $list_users[] = $row;
        $total_users++;
        if (($row['status'] ?? 'approved') === 'approved') {
            $total_approved++;
        } else {
            $total_pending++;
        }
    }
}

// Helper untuk inisial nama avatar
if (!function_exists('getInitials')) {
    function getInitials($name) {
        $words = explode(" ", trim($name));
        $initials = "";
        $count = 0;
        foreach ($words as $w) {
            if (!empty($w)) {
                $initials .= strtoupper($w[0]);
                $count++;
                if ($count >= 2) break;
            }
        }
        return !empty($initials) ? $initials : "?";
    }
}

// Helper untuk generator warna avatar background yang konsisten
if (!function_exists('getAvatarColor')) {
    function getAvatarColor($name) {
        $colors = [
            '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444'
        ];
        $hash = crc32($name);
        return $colors[abs($hash) % count($colors)];
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Pengguna - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
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
        
        /* Premium Gradient Metric Cards */
        .gradient-card-primary {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            border: none;
            border-radius: 16px;
            color: #ffffff;
            box-shadow: 0 8px 24px -4px rgba(99, 102, 241, 0.35);
            position: relative;
            overflow: hidden;
        }
        .gradient-card-success {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            border: none;
            border-radius: 16px;
            color: #ffffff;
            box-shadow: 0 8px 24px -4px rgba(16, 185, 129, 0.35);
            position: relative;
            overflow: hidden;
        }
        .gradient-card-warning {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
            border: none;
            border-radius: 16px;
            color: #ffffff;
            box-shadow: 0 8px 24px -4px rgba(245, 158, 11, 0.35);
            position: relative;
            overflow: hidden;
        }
        
        .card-pattern {
            position: absolute;
            top: -20px;
            right: -20px;
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.12);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            transform: rotate(15deg);
            transition: all 0.4s ease;
        }
        
        .gradient-card-primary:hover .card-pattern,
        .gradient-card-success:hover .card-pattern,
        .gradient-card-warning:hover .card-pattern {
            transform: rotate(30deg) scale(1.1);
            background: rgba(255, 255, 255, 0.18);
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

        /* Avatar Circle */
        .avatar-circle {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 0.85rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .badge-premium {
            font-size: 0.72rem;
            padding: 0.4rem 0.75rem;
            border-radius: 12px;
            font-weight: 600;
            letter-spacing: 0.025em;
        }
    </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>

    <?php if (isset($_GET['msg'])): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 py-3.5 mb-4 shadow-sm" role="alert" style="background-color: rgba(16, 185, 129, 0.1); color: #047857;">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-check-circle-fill text-success fs-5"></i>
                <div class="fw-semibold small"><?= htmlspecialchars($_GET['msg']); ?></div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <?php if (isset($_GET['err'])): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 py-3.5 mb-4 shadow-sm" role="alert" style="background-color: rgba(239, 68, 68, 0.1); color: #b91c1c;">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                <div class="fw-semibold small"><?= htmlspecialchars($_GET['err']); ?></div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 py-3.5 mb-4 shadow-sm animate__animated animate__fadeIn" role="alert" style="background-color: rgba(16, 185, 129, 0.1); color: #047857;">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-shield-check-fill text-success fs-5"></i>
                <div>
                    <span class="small font-semibold"><?= htmlspecialchars($success_msg); ?></span>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <?php if (!empty($error_msg)): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 py-3.5 mb-4 shadow-sm animate__animated animate__fadeIn" role="alert" style="background-color: rgba(239, 68, 68, 0.1); color: #b91c1c;">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                <div>
                    <span class="small font-semibold"><?= htmlspecialchars($error_msg); ?></span>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Header Action Bar -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3" style="border-bottom: 1px solid #e2e8f0;">
        <div>
            <h3 class="fw-bold text-slate-800 tracking-tight mb-1" style="font-size: 1.6rem;">Kelola Pengguna & Akses</h3>
            <p class="text-muted mb-0 small">Manajemen otorisasi akun masuk sistem, status approval, serta perubahan identitas operasional.</p>
        </div>
        <div>
            <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                <button class="btn btn-primary rounded-3 px-4 py-2.5 fw-bold text-uppercase d-flex align-items-center gap-2 shadow-sm" style="background-color: #4f46e5; border-color: #4f46e5;" data-bs-toggle="modal" data-bs-target="#modalTambahUser">
                    <i class="bi bi-person-plus-fill fs-5"></i> <span>Tambah User Baru</span>
                </button>
            <?php else: ?>
                <button class="btn btn-outline-secondary rounded-3 px-4 py-2.5 fw-bold text-uppercase d-flex align-items-center gap-2 shadow-sm bg-white" disabled title="Hanya Super Admin yang diizinkan menambah user">
                    <i class="bi bi-lock-fill fs-5"></i> <span>Tambah User</span>
                </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Sub-navigation Tabs for Super Admin -->
    <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
    <div class="card border-0 rounded-4 shadow-sm mb-4">
        <div class="card-body p-3">
            <ul class="nav nav-pills gap-2 border-0 justify-content-start font-semibold" id="kelolaUserTab" role="tablist" style="font-size: 0.9rem;">
                <li class="nav-item" role="presentation">
                    <button class="nav-link <?= $active_tab === 'user_list' ? 'active' : ''; ?>" id="tab-user-list" data-bs-toggle="pill" data-bs-target="#pane-user-list" type="button" role="tab" aria-controls="pane-user-list" aria-selected="<?= $active_tab === 'user_list' ? 'true' : 'false'; ?>">
                        <i class="bi bi-people-fill me-2"></i>Daftar & Kelola Pengguna
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link <?= $active_tab === 'otoritas' ? 'active' : ''; ?>" id="tab-otoritas" data-bs-toggle="pill" data-bs-target="#pane-otoritas" type="button" role="tab" aria-controls="pane-otoritas" aria-selected="<?= $active_tab === 'otoritas' ? 'true' : 'false'; ?>">
                        <i class="bi bi-shield-lock-fill me-2"></i>Otoritas & Izin Peran
                    </button>
                </li>
            </ul>
        </div>
    </div>
    <?php endif; ?>

    <div class="tab-content" id="kelolaUserTabContent">
        <!-- PANE 1: USER LIST -->
        <div class="tab-pane fade <?= $active_tab === 'user_list' ? 'show active' : ''; ?>" id="pane-user-list" role="tabpanel" aria-labelledby="tab-user-list">

    <!-- Live Premium Metrics Widget Row -->
    <div class="row g-4 mb-4">
        <!-- Metric Active Users -->
        <div class="col-md-4">
            <div class="card gradient-card-primary p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-people-fill"></i>
                </div>
                <div class="position-relative z-1">
                    <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.72rem; opacity: 0.9; letter-spacing: 0.05em">Total Anggota Terdaftar</span>
                    <h3 class="fw-black mb-1 text-white" style="font-size: 2rem;"><?= $total_users; ?> Pengguna</h3>
                    <p class="small mb-0 text-white-50" style="font-size: 0.75rem;"><i class="bi bi-shield-check"></i> Seluruh akun yang terdata di sistem KeuanganKu</p>
                </div>
            </div>
        </div>
        
        <!-- Metric Approved Users -->
        <div class="col-md-4">
            <div class="card gradient-card-success p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-shield-fill-check"></i>
                </div>
                <div class="position-relative z-1">
                    <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.72rem; opacity: 0.9; letter-spacing: 0.05em">User Terverifikasi (Approved)</span>
                    <h3 class="fw-black mb-1 text-white" style="font-size: 2rem;"><?= $total_approved; ?> Diizinkan</h3>
                    <p class="small mb-0 text-white-50" style="font-size: 0.75rem;"><i class="bi bi-person-check-fill"></i> Memiliki akses login penuh ke sistem saat ini</p>
                </div>
            </div>
        </div>

        <!-- Metric Pending Request -->
        <div class="col-md-4">
            <div class="card gradient-card-warning p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-hourglass-split"></i>
                </div>
                <div class="position-relative z-1">
                    <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.72rem; opacity: 0.9; letter-spacing: 0.05em">Menunggu Persetujuan (Pending)</span>
                    <h3 class="fw-black mb-1 text-white" style="font-size: 2rem;"><?= $total_pending; ?> Tertunda</h3>
                    <p class="small mb-0 text-white-50" style="font-size: 0.75rem;"><i class="bi bi-exclamation-circle-fill"></i> Memerlukan evaluasi langsung dari Super Admin</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Otorisasi Keterangan Sandbox -->
    <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 5px solid #3b82f6 !important;">
        <div class="d-flex align-items-start gap-3">
            <div class="bg-blue-600 bg-opacity-10 p-2.5 rounded-3 text-blue-600 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; color: #2563eb; background-color: rgba(37, 99, 235, 0.08);">
                <i class="bi bi-shield-lock-fill fs-4"></i>
            </div>
            <div>
                <h6 class="fw-bold text-slate-800 mb-1" style="font-size: 0.95rem;">Informasi Aturan Hak Akses Otoritas Peran (Role)</h6>
                <div class="small text-slate-600 leading-relaxed font-semibold" style="font-size: 0.82rem;">
                    Sistem mengimplementasikan otorisasi berbasis tingkatan yang aman:<br>
                    <span class="text-primary">• Super Admin</span> memiliki kendali istimewa penuh (CRUD) untuk menambah, mengonfigurasi sandi, menyetujui pendaftaran, serta melenyapkan entri user.<br>
                    <span class="text-secondary">• Admin</span> berstatus peninjau (Read-Only) yang dapat memantau entri user namun terblokir secara otomatis dari operasi manipulasi.
                </div>
            </div>
        </div>
    </div>

    <!-- Panel Pengguna -->
    <div class="card main-card overflow-hidden">
        <div class="card-header bg-white py-3.5 px-4 border-0 bg-slate-50/50 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-table text-indigo-600"></i> Daftar Informasi Kredensial Pengguna
            </h5>
            <span class="badge bg-slate-100 text-slate-600 border px-3 py-1.5 rounded-pill fw-semibold font-monospace" style="font-size: 0.72rem;">
                <?= count($list_users); ?> Pengguna Terdaftar
            </span>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-custom" style="font-size: 0.85rem;">
                    <thead>
                        <tr>
                            <th class="ps-4 py-3" style="width: 80px;">No</th>
                            <th>Profil Pengguna</th>
                            <th>Username</th>
                            <th style="width: 160px;">Level Peran</th>
                            <th style="width: 150px;">Status ACC</th>
                            <th class="text-center" style="width: 240px;">Rincian Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $no = 1;
                        if (count($list_users) > 0):
                            foreach ($list_users as $row): 
                                $u_nama = $row['nama'];
                                $initials = getInitials($u_nama);
                                $avatar_bg = getAvatarColor($u_nama);
                        ?>
                            <tr>
                                <td class="ps-4 fw-bold text-slate-400"><?= $no++; ?></td>
                                <td>
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="avatar-circle" style="background-color: <?= $avatar_bg; ?>;">
                                            <?= $initials; ?>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-slate-800" style="font-size: 0.9rem;"><?= htmlspecialchars($u_nama); ?></div>
                                            <small class="text-muted" style="font-size: 0.75rem;">ID Pengguna: #<?= $row['id']; ?></small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="font-monospace text-secondary fw-semibold">
                                        @<?= htmlspecialchars($row['username']); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($row['role'] === 'superadmin'): ?>
                                        <span class="badge bg-primary-subtle border border-primary-200 text-primary badge-premium"><i class="bi bi-shield-fill me-1"></i>Super Admin</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary-subtle border border-secondary text-secondary badge-premium"><i class="bi bi-person-fill me-1 font-semibold"></i>Admin</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (($row['status'] ?? 'approved') === 'approved'): ?>
                                        <span class="badge bg-success-subtle border border-success-200 text-success badge-premium"><i class="bi bi-check-circle-fill me-1"></i>APPROVED</span>
                                    <?php else: ?>
                                        <span class="badge bg-warning-subtle border border-warning-200 text-warning badge-premium"><i class="bi bi-hourglass-split me-1 animate-pulse"></i>PENDING</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                                        <div class="px-2 d-flex justify-content-center gap-1.5">
                                            <?php if (($row['status'] ?? 'approved') === 'pending'): ?>
                                                <a href="kelola_user.php?act=approve&id=<?= $row['id']; ?>" class="btn btn-sm btn-success rounded-3 text-white px-3 fw-bold d-flex align-items-center gap-1" style="font-size: 0.75rem; border: none; background-color: #10b981; box-shadow: 0 2px 4px rgba(16,185,129,0.2);" title="Setujui Akun (ACC)">
                                                    <i class="bi bi-check-circle-fill"></i> ACC
                                                </a>
                                            <?php endif; ?>
                                            <button type="button" data-bs-toggle="modal" data-bs-target="#modalEditUser<?= $row['id']; ?>" class="btn btn-sm btn-outline-primary rounded-3 px-2.5 d-flex align-items-center justify-content-center" style="height: 32px;" title="Edit Akun & Ganti Password">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            
                                            <?php if ($row['id'] == ($_SESSION['user_id'] ?? 0) || $row['username'] === 'admin'): ?>
                                                <button class="btn btn-sm btn-outline-secondary rounded-3 px-2.5 d-flex align-items-center justify-content-center" style="height: 32px;" disabled title="Keamanan: Tidak diizinkan menghapus akun Anda sendiri atau Superadmin utama">
                                                    <i class="bi bi-trash-fill"></i>
                                                </button>
                                            <?php else: ?>
                                                <a href="hapus_user.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-danger rounded-3 px-2.5 d-flex align-items-center justify-content-center" style="height: 32px;" onclick="return confirm('Apakah Anda yakin ingin mendelete user ini secara permanen?');" title="Delete Akun">
                                                    <i class="bi bi-trash"></i>
                                                </a>
                                            <?php endif; ?>
                                        </div>
                                    <?php else: ?>
                                        <span class="badge border bg-light text-slate-400 py-2 px-3 rounded-pill" style="font-size: 0.72rem;"><i class="bi bi-lock-fill me-1"></i>Aksi Terkunci</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php 
                            endforeach;
                        else:
                        ?>
                            <tr>
                                <td colspan="6" class="text-center py-5 text-muted">
                                    <i class="bi bi-people fs-1 mb-3 text-secondary d-block"></i>
                                    <h5 class="fw-bold">Tidak Ada Anggota</h5>
                                    <p class="small text-muted mb-0">Klik tombol Tambah User Baru di atas untuk menambah pengguna perdana.</p>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
        </div> <!-- End of PANE 1: USER LIST -->

        <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
        <!-- PANE 2: OTORITAS PERAN -->
        <div class="tab-pane fade <?= $active_tab === 'otoritas' ? 'show active' : ''; ?>" id="pane-otoritas" role="tabpanel" aria-labelledby="tab-otoritas">
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

                        <form action="kelola_user.php" method="POST" id="form-role-settings">
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
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm text-uppercase font-sans tracking-wider" style="font-size: 0.85rem; background-color: #4f46e5 !important; border-color: #4f46e5 !important;">
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
                        <form action="kelola_user.php" method="POST">
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
                                    <form action="kelola_user.php" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus peran kustom ini? Seluruh akun pengguna yang terikat pada peran ini akan dikembalikan ke tingkat peran Admin.');" class="m-0">
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
        </div> <!-- End of inner container from sidebar layout -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<!-- MODAL TAMBAH USER -->
<div class="modal fade" id="modalTambahUser" tabindex="-1" aria-labelledby="modalTambahUserLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold text-slate-800" id="modalTambahUserLabel">
                    <i class="bi bi-person-plus-fill text-indigo-600 me-2 animate-bounce"></i>Tambah Pengguna Baru
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body px-4 py-3">
                <p class="text-muted small mb-4">Daftarkan akun administrator baru ke dalam database administrasi KeuanganKu.</p>
                <form action="tambah_user.php" method="POST">
                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Nama Lengkap</label>
                        <input type="text" name="nama" class="form-control rounded-3" placeholder="Contoh: Andi Wijaya" required>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Username Akun</label>
                        <input type="text" name="username" class="form-control rounded-3 font-monospace" placeholder="andi_wi" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Password Baru</label>
                        <input type="password" name="password" class="form-control rounded-3" placeholder="Masukkan password rahasia" required>
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-slate-700 small fw-bold">Level Peran (Role)</label>
                        <select name="role" class="form-select rounded-3">
                            <?php
                            $roles_q = mysqli_query($koneksi, "SELECT * FROM `peran` ORDER BY id ASC");
                            if ($roles_q && mysqli_num_rows($roles_q) > 0) {
                                while ($r_item = mysqli_fetch_assoc($roles_q)) {
                                    $role_key = htmlspecialchars($r_item['role_key']);
                                    $role_name = htmlspecialchars($r_item['role_name']);
                                    echo "<option value=\"$role_key\">$role_name</option>";
                                }
                            } else {
                                echo '<option value="admin">Admin</option>';
                                echo '<option value="superadmin">Superadmin</option>';
                                echo '<option value="user">User</option>';
                            }
                            ?>
                        </select>
                    </div>

                    <div class="d-flex justify-content-end gap-2 pb-2">
                        <button type="button" class="btn btn-outline-secondary rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary rounded-3 px-4" style="background-color: #4f46e5 !important; border-color: #4f46e5 !important;">Simpan Akun</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- MODAL EDIT USER DYNAMIC GENERATOR -->
<?php 
if (count($list_users) > 0 && ($_SESSION['role'] ?? '') === 'superadmin'):
    foreach ($list_users as $row):
?>
<div class="modal fade" id="modalEditUser<?= $row['id']; ?>" tabindex="-1" aria-labelledby="modalEditUserLabel<?= $row['id']; ?>" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold text-slate-800" id="modalEditUserLabel<?= $row['id']; ?>">
                    <i class="bi bi-pencil-square text-indigo-600 me-2"></i>Ubah Pengguna
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body px-4 py-3">
                <p class="text-muted small mb-4">Modifikasi rincian data kredensial dan hak akses pengguna ini.</p>
                <form action="edit_user.php?id=<?= $row['id']; ?>" method="POST">
                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Nama Lengkap</label>
                        <input type="text" name="nama" class="form-control rounded-3" value="<?= htmlspecialchars($row['nama']); ?>" required>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Username</label>
                        <input type="text" name="username" class="form-control rounded-3 font-monospace" value="<?= htmlspecialchars($row['username']); ?>" required <?= $row['username'] === 'admin' ? 'readonly' : ''; ?>>
                        <?php if ($row['username'] === 'admin'): ?>
                            <div class="form-text text-danger small">Username admin utama dilarang diedit demi kestabilan.</div>
                        <?php endif; ?>
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Password Baru (Bila Diganti)</label>
                        <input type="password" name="password" class="form-control rounded-3" placeholder="Biarkan kosong jika tidak diganti">
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-slate-700 small fw-bold">Level Peran (Role)</label>
                        <select name="role" class="form-select rounded-3" <?= $row['username'] === 'admin' ? 'disabled' : ''; ?>>
                            <?php
                            $roles_q = mysqli_query($koneksi, "SELECT * FROM `peran` ORDER BY id ASC");
                            if ($roles_q && mysqli_num_rows($roles_q) > 0) {
                                while ($r_item = mysqli_fetch_assoc($roles_q)) {
                                    $role_key = htmlspecialchars($r_item['role_key']);
                                    $role_name = htmlspecialchars($r_item['role_name']);
                                    $sel = ($row['role'] === $role_key) ? 'selected' : '';
                                    echo "<option value=\"$role_key\" $sel>$role_name</option>";
                                }
                            } else {
                                $admin_sel = $row['role'] === 'admin' ? 'selected' : '';
                                $s_sel = $row['role'] === 'superadmin' ? 'selected' : '';
                                $u_sel = $row['role'] === 'user' ? 'selected' : '';
                                echo "<option value=\"admin\" $admin_sel>Admin</option>";
                                echo "<option value=\"superadmin\" $s_sel>Superadmin</option>";
                                echo "<option value=\"user\" $u_sel>User</option>";
                            }
                            ?>
                        </select>
                    </div>

                    <div class="d-flex justify-content-end gap-2 pb-2">
                        <button type="button" class="btn btn-outline-secondary rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary rounded-3 px-4" style="background-color: #4f46e5 !important; border-color: #4f46e5 !important;">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<?php 
    endforeach;
endif;
?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
    // Tab persistence with localStorage
    (function() {
        let activeTabId = localStorage.getItem('activeKelolaUserTab');
        <?php if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($active_tab)): ?>
            activeTabId = 'tab-<?= $active_tab === 'user_list' ? 'user-list' : 'otoritas'; ?>';
            localStorage.setItem('activeKelolaUserTab', activeTabId);
        <?php endif; ?>
        if (activeTabId) {
            const tabEl = document.querySelector('#' + activeTabId);
            if (tabEl) {
                const tab = new bootstrap.Tab(tabEl);
                tab.show();
            }
        }
        // Listen to tab changes to persist
        const tabButtons = document.querySelectorAll('#kelolaUserTab button');
        tabButtons.forEach(btn => {
            btn.addEventListener('shown.bs.tab', function(e) {
                localStorage.setItem('activeKelolaUserTab', e.target.id);
            });
        });
    })();
</script>
</body>
</html>