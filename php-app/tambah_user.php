<?php
// tambah_user.php
// Menambahkan akun pengguna baru dengan filtering role (Khusus Super Admin)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

// Otorisasi ketat keamanan: Cek jika bukan superadmin
if (($_SESSION['role'] ?? '') !== 'superadmin') {
    header("Location: kelola_user.php?err=Akses ditolak! Hanya Super Admin yang berhak memproses aksi ini.");
    exit();
}

require_once 'koneksi.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $nama = trim($_POST['nama']);
    $role = $_POST['role'] === 'superadmin' ? 'superadmin' : 'admin';

    if (empty($username) || empty($password) || empty($nama)) {
        $error = "Penyebab: Seluruh kolom form di bawah wajib dilengkapi!";
    } elseif (strlen($username) < 4) {
        $error = "Penyebab: Parameter username harus minimal terdiri dari 4 karakter!";
    } else {
        // Cek duplikasi username lewat prepared statement
        $query_check = "SELECT id FROM users WHERE username = ?";
        $stmt_check = mysqli_prepare($koneksi, $query_check);
        mysqli_stmt_bind_param($stmt_check, "s", $username);
        mysqli_stmt_execute($stmt_check);
        mysqli_stmt_store_result($stmt_check);
        
        if (mysqli_stmt_num_rows($stmt_check) > 0) {
            $error = "Penyebab: Username '@" . htmlspecialchars($username) . "' telah digunakan oleh akun lain!";
            mysqli_stmt_close($stmt_check);
        } else {
            mysqli_stmt_close($stmt_check);
            
            // Masukkan data baru dengan password di-hash aman
            $hashed_pw = password_hash($password, PASSWORD_DEFAULT);
            $query_ins = "INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)";
            $stmt_ins = mysqli_prepare($koneksi, $query_ins);
            
            if ($stmt_ins) {
                mysqli_stmt_bind_param($stmt_ins, "ssss", $username, $hashed_pw, $nama, $role);
                if (mysqli_stmt_execute($stmt_ins)) {
                    mysqli_stmt_close($stmt_ins);
                    header("Location: kelola_user.php?msg=" . urlencode("User baru '$nama' berhasil dibuat ke database!"));
                    exit();
                } else {
                    $error = "Gagal memproses pendaftaran user baru ke MySQL server.";
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Baru - Tambah Pengguna</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body { background-color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; }
    </style>
</head>
<body>

<div class="container py-5" style="max-width: 600px;">
    <div class="card border-0 rounded-4 shadow-lg p-3">
        <div class="card-body">
            <h4 class="fw-bold text-dark mb-1"><i class="bi bi-person-plus-fill text-primary me-2"></i>Tambah User Baru</h4>
            <p class="text-muted small">Daftarkan akun administrator baru ke dalam database keamanan server.</p>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2.5 rounded-3 border-0 small font-semibold mb-4">
                    <i class="bi bi-info-circle-fill me-1.5"></i> <?= $error; ?>
                </div>
            <?php endif; ?>

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
                        <option value="admin">Admin (Hanya Melihat/Menulis Transaksi)</option>
                        <option value="superadmin">Super Admin (Akses Mutlak Server)</option>
                    </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <a href="kelola_user.php" class="btn btn-outline-secondary rounded-3 px-4">Batal</a>
                    <button type="submit" class="btn btn-primary rounded-3 px-4">Simpan User</button>
                </div>
            </form>
        </div>
    </div>
</div>

</body>
</html>
