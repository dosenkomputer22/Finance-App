<?php
// login.php
// Sistem Autentikasi Keamanan Pengguna - Memanfaatkan Session & Prepared Statements secara aman

session_start();
require_once 'koneksi.php';

$error = '';
$success_msg = $_GET['msg'] ?? '';

// Jika user sudah login, langsung alihkan ke halaman utama dashboard
if (isset($_SESSION['login']) && $_SESSION['login'] === true) {
    header("Location: index.php");
    exit();
}

// Memproses autentikasi form login / register saat POST submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'login';

    if ($action === 'register') {
        $nama = trim($_POST['nama']);
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);

        if (empty($nama) || empty($username) || empty($password)) {
            $error = "Peringatan: Semua kolom pendaftaran wajib diisi!";
        } else {
            // Cek apakah username sudah ada
            $query_chk = "SELECT id FROM users WHERE username = ?";
            $stmt_chk = mysqli_prepare($koneksi, $query_chk);
            if ($stmt_chk) {
                mysqli_stmt_bind_param($stmt_chk, "s", $username);
                mysqli_stmt_execute($stmt_chk);
                mysqli_stmt_store_result($stmt_chk);
                
                if (mysqli_stmt_num_rows($stmt_chk) > 0) {
                    $error = "Username @$username sudah terdaftar! Gunakan username lain.";
                } else {
                    // Masukkan ke database dengan status 'pending' dan role 'admin'
                    $hashed_pw = password_hash($password, PASSWORD_DEFAULT);
                    $query_insert = "INSERT INTO users (username, password, nama, role, status) VALUES (?, ?, ?, 'admin', 'pending')";
                    $stmt_ins = mysqli_prepare($koneksi, $query_insert);
                    if ($stmt_ins) {
                        mysqli_stmt_bind_param($stmt_ins, "sss", $username, $hashed_pw, $nama);
                        if (mysqli_stmt_execute($stmt_ins)) {
                            header("Location: login.php?msg=" . urlencode("Pendaftaran berhasil! Akun Anda (@$username) sedang menunggu persetujuan (ACC) dari Super Admin sebelum Anda dapat masuk."));
                            exit();
                        } else {
                            $error = "Terjadi kegagalan saat memasukkan data pendaftaran.";
                        }
                        mysqli_stmt_close($stmt_ins);
                    } else {
                        $error = "Gagal memproses pendaftaran database.";
                    }
                }
                mysqli_stmt_close($stmt_chk);
            }
        }
    } else {
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
                    // Cek status persetujuan dlu
                    if ($row['status'] === 'pending') {
                        $error = "Akun Anda (@$username) belum disetujui (ACC) oleh Super Admin. Silakan tunggu atau hubungi Super Admin Anda.";
                    } else {
                        // Verifikasi password hash aman (Bcrypt)
                        if (password_verify($password, $row['password'])) {
                            $_SESSION['login'] = true;
                            $_SESSION['user_id'] = $row['id'];
                            $_SESSION['username'] = $row['username'];
                            $_SESSION['nama'] = $row['nama'];
                            $_SESSION['role'] = $row['role'] ?? 'admin';

                            header("Location: index.php");
                            exit();
                        } else {
                            $error = "Password salah! Silakan periksa kembali.";
                        }
                    }
                } else {
                    // Fitur Fallback Otomatis jika database kosong atau belum di-seed
                    if ($username === 'admin' && $password === 'admin123') {
                        // Daftarkan otomatis ke database 'users' agar memudahkan testing penguji/siswa
                        $hashed_pw = password_hash('admin123', PASSWORD_DEFAULT);
                        $query_insert = "INSERT INTO users (username, password, nama, role, status) VALUES (?, ?, ?, 'superadmin', 'approved')";
                        $stmt_ins = mysqli_prepare($koneksi, $query_insert);
                        if ($stmt_ins) {
                            $nama_admin = "Administrator Keuangan";
                            mysqli_stmt_bind_param($stmt_ins, "sss", $username, $hashed_pw, $nama_admin);
                            mysqli_stmt_execute($stmt_ins);
                            mysqli_stmt_close($stmt_ins);
                        }

                        $_SESSION['login'] = true;
                        $_SESSION['user_id'] = 1;
                        $_SESSION['username'] = 'admin';
                        $_SESSION['nama'] = 'Administrator Keuangan';
                        $_SESSION['role'] = 'superadmin';

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
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Catatan Keuangan - Autentikasi Pengguna</title>
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
            max-width: 445px;
            width: 100%;
            overflow: hidden;
            padding: 2.2rem;
        }
        .form-label {
            font-weight: 700;
            color: #94a3b8;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .form-control {
            background-color: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f8fafc;
            border-radius: 12px;
            padding: 0.7rem 1rem;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }
        .form-control:focus {
            background-color: #0f172a;
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.2);
            color: #f8fafc;
        }
        .btn-theme {
            background-color: #3b82f6;
            border: none;
            color: white;
            font-weight: 700;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            transition: all 0.25s ease;
        }
        .btn-theme:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .brand-icon {
            font-size: 2.8rem;
            color: #3b82f6;
            margin-bottom: 0.2rem;
            display: inline-block;
        }
        .kredensial-box {
            background-color: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 0.85rem;
        }
        .tab-btn {
            background: none;
            border: none;
            color: #64748b;
            font-weight: 700;
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }
        .tab-btn.active {
            color: #3b82f6;
            border-bottom: 2px solid #3b82f6;
        }
    </style>
</head>
<body>

<div class="login-card">
    <div class="text-center mb-3">
        <div class="brand-icon">
            <i class="bi bi-wallet2"></i>
        </div>
        <h4 class="fw-bold mb-1">KeuanganKu Portal</h4>
        <p class="text-muted small mb-0">Kelola arus kas & laporan keuangan secara aman</p>
    </div>

    <!-- Switcher Tab UI -->
    <div class="d-flex justify-content-center gap-3 mb-4 border-b border-secondary border-opacity-10pb-2">
        <button class="tab-btn active" id="tab-login-btn" onclick="switchTab('login')">
            <i class="bi bi-box-arrow-in-right me-1"></i> Masuk
        </button>
        <button class="tab-btn" id="tab-register-btn" onclick="switchTab('register')">
            <i class="bi bi-person-plus me-1"></i> Daftar Baru
        </button>
    </div>

    <!-- Notifikasi Alert Sukses / Error -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success px-3 py-2.5 rounded-3 d-flex align-items-start mb-4" role="alert" style="background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #86efac;">
            <i class="bi bi-check-circle-fill me-2 fs-5 text-success mt-0.5"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($success_msg); ?></div>
        </div>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger px-3 py-2.5 rounded-3 d-flex align-items-start mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #fca5a5;">
            <i class="bi bi-exclamation-triangle-fill me-2 fs-5 text-danger mt-0.5"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
        </div>
    <?php endif; ?>

    <!-- FORM MASUK (LOGIN) -->
    <div id="form-login">
        <form action="login.php" method="POST">
            <input type="hidden" name="action" value="login">
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" name="username" placeholder="Masukkan username" required autofocus>
            </div>
            
            <div class="mb-4">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="Masukkan password" required>
            </div>

            <button type="submit" class="btn btn-theme w-100 mb-3 text-uppercase tracking-wider">
                <i class="bi bi-box-arrow-in-right me-1"></i> Masuk Sekarang
            </button>
        </form>
    </div>

    <!-- FORM DAFTAR AKUN (REGISTER) -->
    <div id="form-register" style="display: none;">
        <form action="login.php" method="POST">
            <input type="hidden" name="action" value="register">
            
            <div class="mb-3">
                <label for="reg-nama" class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" id="reg-nama" name="nama" placeholder="Contoh: Muhammad Rian" required>
            </div>

            <div class="mb-3">
                <label for="reg-username" class="form-label">Username Baru</label>
                <input type="text" class="form-control" id="reg-username" name="username" placeholder="Gunakan huruf kecil & angka saja" required>
            </div>
            
            <div class="mb-4">
                <label for="reg-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="reg-password" name="password" placeholder="Minimal 6 karakter" required>
            </div>

            <button type="submit" class="btn btn-theme w-100 mb-2 bg-success text-white text-uppercase tracking-wider">
                <i class="bi bi-person-plus-fill me-1"></i> Daftar Akun Baru
            </button>
            <p class="text-center text-muted small mt-2">Daftar sekarang dengan status 'Pending'. Anda baru dapat masuk setelah di-ACC oleh Super Admin.</p>
        </form>
    </div>

    <!-- KETERANGAN & SOLUSI BCRYPT SEEDING / PASSWORD RESET -->
    <div class="kredensial-box mt-4">
        <span class="text-muted small fw-bold"><i class="bi bi-info-circle-fill me-1 text-primary"></i>Catatan Pengamanan Server:</span>
        <div class="text-light small mt-1" style="font-size: 0.72rem; line-height: 1.45;">
            Password login di-verifikasi melalui <strong>password_hash (Bcrypt)</strong>. <br>
            <span class="text-warning">Gagal masuk "admin"?</span> Ini dikarenakan penulisan manual di phpMyAdmin secara plain-text / MD5 tidak dapat di-verifikasi. 
            <p class="mt-2 mb-1 text-decoration-underline fw-bold">Solusinya, jalankan SQL query ini di phpMyAdmin Anda:</p>
            <code class="d-block p-2 bg-black text-light border border-secondary border-opacity-30 rounded text-wrap font-monospace mb-1" style="font-size: 0.65rem;">
                UPDATE users SET password = '<?= password_hash('admin123', PASSWORD_BCRYPT); ?>', status = 'approved' WHERE username = 'admin';
            </code>
            <span class="text-white-50">Query di atas akan mereset password admin Anda ke <strong class="text-white">admin123</strong> secara aman dengan hash Bcrypt resmi.</span>
        </div>
    </div>
</div>

<script>
function switchTab(target) {
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegBtn = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (target === 'login') {
        tabLoginBtn.classList.add('active');
        tabRegBtn.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
        
        // Reset field errors
        const loginUser = document.getElementById('username');
        if (loginUser) loginUser.focus();
    } else {
        tabRegBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        formLogin.style.display = 'none';
        formRegister.style.display = 'block';
        
        const regNama = document.getElementById('reg-nama');
        if (regNama) regNama.focus();
    }
}

// Deteksi otomatis jika user baru saja mendaftar
<?php if (isset($_GET['msg']) && strpos(urldecode($_GET['msg']), 'Pendaftaran berhasil') !== false): ?>
    // Tetap di halaman login, tapi tunjukkan tab login yang menceritakan kesuksesan
<?php endif; ?>
</script>

</body>
</html>
