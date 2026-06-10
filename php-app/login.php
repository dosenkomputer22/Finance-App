<?php
// login.php
// Sistem Autentikasi Keamanan Pengguna - Memanfaatkan Session & Prepared Statements secara aman

session_start();
require_once 'koneksi.php';

$error = '';

// Jika user sudah login, langsung alihkan ke halaman utama dashboard
if (isset($_SESSION['login']) && $_SESSION['login'] === true) {
    header("Location: index.php");
    exit();
}

// Memproses autentikasi form login saat POST submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if (empty($username) || empty($password)) {
        $error = "Peringatan: Username dan password wajib diisi!";
    } else {
        // Gunakan Prepared Statement MySQLi untuk mencegah serangan SQL Injection
        $query_user = "SELECT * FROM users WHERE username = ?";
        $stmt_user = mysqli_prepare($koneksi, $query_user);

        if ($stmt_user) {
            mysqli_stmt_bind_param($stmt_user, "s", $username);
            mysqli_stmt_execute($stmt_user);
            $result_user = mysqli_stmt_get_result($stmt_user);

            if ($row = mysqli_fetch_assoc($result_user)) {
                // Verifikasi password hash aman (Bcrypt)
                if (password_verify($password, $row['password'])) {
                    $_SESSION['login'] = true;
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['username'] = $row['username'];
                    $_SESSION['nama'] = $row['nama'];

                    header("Location: index.php");
                    exit();
                } else {
                    $error = "Password salah! Silakan periksa kembali.";
                }
            } else {
                // Fitur Fallback Otomatis jika database kosong atau belum di-seed
                if ($username === 'admin' && $password === 'admin123') {
                    // Daftarkan otomatis ke database 'users' agar memudahkan testing penguji/siswa
                    $hashed_pw = password_hash('admin123', PASSWORD_DEFAULT);
                    $query_insert = "INSERT INTO users (username, password, nama) VALUES (?, ?, ?)";
                    $stmt_ins = mysqli_prepare($koneksi, $query_insert);
                    if ($stmt_ins) {
                        $nama_admin = "Administrator Keuangan";
                        mysqli_stmt_bind_param($stmt_ins, "sss", $username, $hashed_pw, $nama_admin);
                        mysqli_stmt_execute($stmt_ins);
                        mysqli_stmt_close($stmt_ins);
                    }

                    $_SESSION['login'] = true;
                    $_SESSION['username'] = 'admin';
                    $_SESSION['nama'] = 'Administrator Keuangan';

                    header("Location: index.php");
                    exit();
                } else {
                    $error = "Username tidak terdaftar di sistem database!";
                }
            }
            mysqli_stmt_close($stmt_user);
        } else {
            $error = "Masalah sistem: Gagal menyusun perintah prepared query database.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Pengguna - Sistem Catatan Keuangan</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #f8fafc;
            padding: 1.5rem;
        }
        .login-card {
            background-color: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            max-width: 420px;
            width: 100%;
            overflow: hidden;
            padding: 2.5rem;
        }
        .form-label {
            font-weight: 600;
            color: #94a3b8;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .form-control {
            background-color: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f8fafc;
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }
        .form-control:focus {
            background-color: #0f172a;
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.2);
            color: #f8fafc;
        }
        .btn-login {
            background-color: #3b82f6;
            border: none;
            color: white;
            font-weight: 700;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            transition: all 0.25s ease;
        }
        .btn-login:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .brand-icon {
            font-size: 3rem;
            color: #3b82f6;
            margin-bottom: 0.5rem;
            display: inline-block;
        }
        .kredensial-box {
            background-color: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1rem;
        }
    </style>
</head>
<body>

<div class="login-card">
    <div class="text-center mb-4">
        <div class="brand-icon">
            <i class="bi bi-wallet2"></i>
        </div>
        <h4 class="fw-bold mb-1">Masuk Dashboard</h4>
        <p class="text-muted small mb-0">Kelola arus kas & laporan keuangan secara aman</p>
    </div>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger px-3 py-2.5 rounded-3 d-flex align-items-center mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #fca5a5;">
            <i class="bi bi-exclamation-triangle-fill me-2 fs-5 text-danger"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
        </div>
    <?php endif; ?>

    <form action="login.php" method="POST">
        <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" name="username" placeholder="Masukkan username admin" required autofocus>
        </div>
        
        <div class="mb-4">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" name="password" placeholder="Masukkan password admin" required>
        </div>

        <button type="submit" class="btn btn-login w-100 mb-3 text-uppercase tracking-wider">
            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk Sekarang
        </button>

        <div class="kredensial-box mt-4 text-center">
            <span class="text-muted small">Kredensial Default Uji Coba:</span>
            <div class="mt-1 font-monospace small">
                <span class="text-light">username: <strong>admin</strong></span><br>
                <span class="text-light">password: <strong>admin123</strong></span>
            </div>
        </div>
    </form>
</div>

</body>
</html>
