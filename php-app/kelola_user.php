<?php
// kelola_user.php
// Halaman tabel daftar user dan management akun dengan otorisasi Super Admin & Admin

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Ambil daftar seluruh user
$query_users = "SELECT id, username, nama, role FROM users ORDER BY id ASC";
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

<nav class="navbar navbar-expand-sm navbar-dark bg-dark py-3 mb-4 shadow" style="background-color: #131926 !important;">
    <div class="container">
        <span class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center me-4">
            <i class="bi bi-wallet2 me-2 text-primary"></i>
            KeuanganKu <span class="badge bg-primary ms-2 fs-6">v1.2</span>
        </span>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul class="navbar-nav gap-1 my-2 my-sm-0">
                <li class="nav-item">
                    <a href="index.php" class="nav-link fw-bold text-white-50 hover:text-white"><i class="bi bi-grid-fill me-1"></i> Dashboard</a>
                </li>
                <li class="nav-item">
                    <a href="kelola_user.php" class="nav-link active fw-bold text-white"><i class="bi bi-people-fill me-1"></i> Kelola User</a>
                </li>
            </ul>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white bg-white/10 px-3 py-1.5 rounded-3 text-xs d-inline font-monospace">
                    <i class="bi bi-person-circle text-info me-1.5"></i><?= htmlspecialchars($_SESSION['nama'] ?? 'User'); ?> (<?= htmlspecialchars($_SESSION['role'] ?? 'admin'); ?>)
                </span>
                <a href="logout.php" class="btn btn-sm btn-danger rounded-3 px-3 py-1.5" onclick="return confirm('Apakah Anda yakin ingin keluar?');">
                    <i class="bi bi-box-arrow-right me-1"></i>Keluar
                </a>
            </div>
        </div>
    </div>
</nav>

<div class="container py-2">
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
                            <th style="width: 180px;">Level Peran</th>
                            <th class="text-center" style="width: 180px;">Aksi</th>
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
                                <td class="text-center">
                                    <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                                        <div class="btn-group gap-1">
                                            <a href="edit_user.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-primary rounded-2" title="Edit Akun"><i class="bi bi-pencil-square"></i></a>
                                            
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
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
