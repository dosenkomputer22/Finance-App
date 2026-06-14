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
    // Ambil daftar peran yang valid dari database
    $valid_roles = [];
    $roles_res = mysqli_query($koneksi, "SELECT role_key FROM `peran`");
    if ($roles_res) {
        while ($r_row = mysqli_fetch_assoc($roles_res)) {
            $valid_roles[] = $r_row['role_key'];
        }
    }
    
    $role = strtolower(trim($_POST['role'] ?? 'user'));
    if (!in_array($role, $valid_roles)) {
        $role = 'user'; // fallback aman
    }

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
    <title>Tambah Pengguna - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 600px;
            margin: 0 auto;
        }
        .form-label {
            font-weight: 600;
            color: #475569;
            font-size: 0.85rem;
        }
        .form-control, .form-select {
            border-radius: 10px;
            padding: 0.65rem 1rem;
            border: 1px solid #cbd5e1;
        }
        .form-control:focus, .form-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.15);
        }
    </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>
    <div class="card main-card p-4 p-sm-5 mt-3">
        <div class="d-flex items-center gap-2 mb-4">
            <a href="kelola_user.php" class="btn btn-sm btn-outline-secondary rounded-3 me-2">
                <i class="bi bi-arrow-left"></i> Kembali
            </a>
            <h4 class="fw-bold text-slate-800 mb-0">Tambah User Baru</h4>
        </div>
        <p class="text-muted small mb-4">Daftarkan akun administrator baru ke dalam database keamanan server.</p>

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
                        }
                        ?>
                    </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <a href="kelola_user.php" class="btn btn-outline-secondary rounded-3 px-4">Batal</a>
                    <button type="submit" class="btn btn-primary rounded-3 px-4">Simpan User</button>
                </div>
            </form>
    </div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

</body>
</html>