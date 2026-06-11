<?php
// kelola_user.php
// Halaman tabel daftar user dan management akun dengan otorisasi Super Admin & Admin

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

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
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Pengguna - KeuanganKu</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body { background-color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; color: #334155; }
        .main-card { border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02); background: #ffffff; }
    </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>
    <?php if (isset($_GET['msg'])): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 shadow-xs border-0 py-3 mb-4" role="alert">
            <i class="bi bi-check-circle-fill text-success fs-5 me-2"></i>
            <?= htmlspecialchars($_GET['msg']); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <?php if (isset($_GET['err'])): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 shadow-xs border-0 py-3 mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-5 me-2"></i>
            <?= htmlspecialchars($_GET['err']); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Otorisasi Keterangan Sandbox -->
    <div class="bg-indigo-50 border border-indigo-100 rounded-4 p-3.5 mb-4 d-flex align-items-start gap-3">
        <i class="bi bi-shield-lock-fill text-indigo fs-4"></i>
        <div>
            <h6 class="fw-bold text-dark mb-1">Informasi Hak Otorisasi Peran (Role)</h6>
            <p class="small text-muted mb-0 leading-relaxed">
                Aplikasi ini mendukung tingkatan peran pengguna:<br>
                1. <strong>Super Admin</strong>: Memiliki hak mutlak dalam menambah, mengedit, serta mendelete user.<br>
                2. <strong>Admin</strong>: Dapat melihat daftar akun (Read-Only) tetapi tidak diizinkan mengubah susunan database user.
            </p>
        </div>
    </div>

    <!-- Panel Pengguna -->
    <div class="card main-card">
        <div class="card-header bg-white py-3.5 border-0 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <i class="bi bi-people text-primary fs-4 me-2"></i>
                <h5 class="fw-bold mb-0">Manajemen Akses Pengguna</h5>
            </div>
            <div>
                <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                    <a href="tambah_user.php" class="btn btn-primary rounded-3 px-3 py-2">
                        <i class="bi bi-person-plus-fill me-1.5"></i>Tambah User Baru
                    </a>
                <?php else: ?>
                    <button class="btn btn-outline-secondary rounded-3 px-3 py-2" disabled title="Hanya Super Admin yang diizinkan menambah user baru">
                        <i class="bi bi-lock-fill me-1.5"></i>Tambah User (Disabled)
                    </button>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4 py-3" style="width: 80px;">No</th>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th style="width: 150px;">Level Peran</th>
                            <th style="width: 140px;">Status ACC</th>
                            <th class="text-center" style="width: 220px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $no = 1;
                        while ($row = mysqli_fetch_assoc($result_users)): 
                        ?>
                            <tr>
                                <td class="ps-4 fw-medium text-muted"><?= $no++; ?></td>
                                <td><div class="fw-bold text-dark"><?= htmlspecialchars($row['nama']); ?></div></td>
                                <td><span class="font-monospace text-secondary">@<?= htmlspecialchars($row['username']); ?></span></td>
                                <td>
                                    <?php if ($row['role'] === 'superadmin'): ?>
                                        <span class="badge bg-primary-subtle border border-primary-200 text-primary px-3 py-1.5 rounded-3 text-uppercase"><i class="bi bi-shield-fill me-1"></i>Super Admin</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary-subtle border border-secondary text-secondary px-3 py-1.5 rounded-3 text-uppercase"><i class="bi bi-person-fill me-1"></i>Admin</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (($row['status'] ?? 'approved') === 'approved'): ?>
                                        <span class="badge bg-success-subtle border border-success-200 text-success px-2 py-1.5 rounded-3"><i class="bi bi-check-circle-fill me-1"></i>Approved</span>
                                    <?php else: ?>
                                        <span class="badge bg-warning-subtle border border-warning-200 text-warning px-2 py-1.5 rounded-3"><i class="bi bi-hourglass-split me-1"></i>Pending</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                                        <div class="px-2 d-flex justify-content-center gap-1">
                                            <?php if (($row['status'] ?? 'approved') === 'pending'): ?>
                                                <a href="kelola_user.php?act=approve&id=<?= $row['id']; ?>" class="btn btn-sm btn-success rounded-2 text-white px-2.5" title="Setujui Akun (ACC)">
                                                    <i class="bi bi-check-circle-fill me-1"></i>ACC
                                                </a>
                                            <?php endif; ?>
                                            <a href="edit_user.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-primary rounded-2" title="Edit Akun / Ganti Password"><i class="bi bi-pencil-square"></i></a>
                                            
                                            <?php if ($row['id'] == ($_SESSION['user_id'] ?? 0) || $row['username'] === 'admin'): ?>
                                                <button class="btn btn-sm btn-outline-secondary rounded-2" disabled title="Keamanan: Tidak diizinkan mendelete akun sendiri atau superadmin utama"><i class="bi bi-trash-fill"></i></button>
                                            <?php else: ?>
                                                <a href="hapus_user.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-danger rounded-2" onclick="return confirm('Apakah Anda yakin ingin mendelete user ini?');" title="Delete Akun"><i class="bi bi-trash"></i></a>
                                            <?php endif; ?>
                                        </div>
                                    <?php else: ?>
                                        <button class="btn btn-sm btn-light rounded-3 text-muted" disabled><i class="bi bi-lock-fill me-1"></i>Terkunci</button>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP & MySQL &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
