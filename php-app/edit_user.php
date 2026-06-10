<?php
// edit_user.php
// Pembaruan data user, beserta password opsional (Khusus Super Admin)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

if (($_SESSION['role'] ?? '') !== 'superadmin') {
    header("Location: kelola_user.php?err=Hanya Super Admin yang berhak memodifikasi data user.");
    exit();
}

require_once 'koneksi.php';

$id = $_GET['id'] ?? 0;

// Cari data user tersebut
$query_user = "SELECT * FROM users WHERE id = ?";
$stmt_find = mysqli_prepare($koneksi, $query_user);
mysqli_stmt_bind_param($stmt_find, "i", $id);
mysqli_stmt_execute($stmt_find);
$user_data = mysqli_stmt_get_result($stmt_find)->fetch_assoc();
mysqli_stmt_close($stmt_find);

if (!$user_data) {
    header("Location: kelola_user.php?err=Data user tidak ditemukan!");
    exit();
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama = trim($_POST['nama']);
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    // Cegah penurunan peran superadmin inti
    if ($user_data['username'] === 'admin') {
        $role = 'superadmin';
    } else {
        $role = $_POST['role'] === 'superadmin' ? 'superadmin' : 'admin';
    }

    if (empty($nama) || empty($username)) {
        $error = "Kolom Nama dan Username dilarang dikosongkan!";
    } else {
        // Update query
        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $query_upd = "UPDATE users SET nama = ?, username = ?, password = ?, role = ? WHERE id = ?";
            $stmt_upd = mysqli_prepare($koneksi, $query_upd);
            mysqli_stmt_bind_param($stmt_upd, "ssssi", $nama, $username, $hashed, $role, $id);
        } else {
            $query_upd = "UPDATE users SET nama = ?, username = ?, role = ? WHERE id = ?";
            $stmt_upd = mysqli_prepare($koneksi, $query_upd);
            mysqli_stmt_bind_param($stmt_upd, "sssi", $nama, $username, $role, $id);
        }

        if (mysqli_stmt_execute($stmt_upd)) {
            mysqli_stmt_close($stmt_upd);
            header("Location: kelola_user.php?msg=" . urlencode("Data pengguna '$nama' sukses diperbarui!"));
            exit();
        } else {
            $error = "Terjadi kegagalan koneksi database ketika memperbarui user.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Baru - Edit Pengguna</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style> body { background-color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; } </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>

<div class="container py-2" style="max-width: 600px;">
    <div class="card border-0 rounded-4 shadow-lg p-3">
        <div class="card-body">
            <h4 class="fw-bold text-dark mb-1"><i class="bi bi-pencil-square text-primary me-2"></i>Edit Pengguna</h4>
            <p class="text-muted small">Silakan sesuaikan pengaturan data user di bawah.</p>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger font-semibold mb-4"><?= $error; ?></div>
            <?php endif; ?>

            <form action="edit_user.php?id=<?= $id; ?>" method="POST">
                <div class="mb-3">
                    <label class="form-label small fw-bold">Nama Lengkap</label>
                    <input type="text" name="nama" class="form-control rounded-3" value="<?= htmlspecialchars($user_data['nama']); ?>" required>
                </div>
                
                <div class="mb-3">
                    <label class="form-label small fw-bold">Username</label>
                    <input type="text" name="username" class="form-control rounded-3 font-monospace" value="<?= htmlspecialchars($user_data['username']); ?>" required <?= $user_data['username'] === 'admin' ? 'readonly' : ''; ?>>
                    <?php if ($user_data['username'] === 'admin'): ?>
                        <div class="form-text text-danger small">Username admin utama dilarang diedit demi kestabilan.</div>
                    <?php endif; ?>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-bold">Password Baru (Bila Diganti)</label>
                    <input type="password" name="password" class="form-control rounded-3" placeholder="Biarkan kosong jika tidak berencana diedit">
                </div>

                <div class="mb-4">
                    <label class="form-label small fw-bold">Level Peran (Role)</label>
                    <select name="role" class="form-select rounded-3" <?= $user_data['username'] === 'admin' ? 'disabled' : ''; ?>>
                        <option value="admin" <?= $user_data['role'] === 'admin' ? 'selected' : ''; ?>>Admin (Melihat/Menulis Transaksi)</option>
                        <option value="superadmin" <?= $user_data['role'] === 'superadmin' ? 'selected' : ''; ?>>Super Admin (Akses Mutlak Server)</option>
                    </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <a href="kelola_user.php" class="btn btn-outline-secondary rounded-3 px-4">Batal</a>
                    <button type="submit" class="btn btn-primary rounded-3 px-4">Simpan Perubahan</button>
                </div>
            </form>
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

</body>
</html>
