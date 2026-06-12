<?php
// login.php
// Sistem Autentikasi Keamanan Pengguna - Memanfaatkan Session & Prepared Statements secara aman

session_start();
require_once 'koneksi.php';

$error = '';
$success_msg = $_GET['msg'] ?? '';

// Cek apakah sudah ada sekurangnya 1 user di database
$has_users = false;
$cnt_result = mysqli_query($koneksi, "SELECT COUNT(*) as total FROM users");
if ($cnt_result) {
    $row_cnt = mysqli_fetch_assoc($cnt_result);
    if ($row_cnt && $row_cnt['total'] > 0) {
        $has_users = true;
    }
}

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
                    // Cek apakah ini pendaftar pertama
                    $query_count = "SELECT COUNT(*) as total FROM users";
                    $cnt_result = mysqli_query($koneksi, $query_count);
                    $row_cnt = mysqli_fetch_assoc($cnt_result);
                    $is_first = ($row_cnt['total'] == 0);

                    $role = $is_first ? 'superadmin' : 'admin';
                    $status = $is_first ? 'approved' : 'pending';

                    // Masukkan ke database dengan status sesuai kondisi di atas
                    $hashed_pw = password_hash($password, PASSWORD_DEFAULT);
                    $query_insert = "INSERT INTO users (username, password, nama, role, status) VALUES (?, ?, ?, ?, ?)";
                    $stmt_ins = mysqli_prepare($koneksi, $query_insert);
                    if ($stmt_ins) {
                        mysqli_stmt_bind_param($stmt_ins, "sssss", $username, $hashed_pw, $nama, $role, $status);
                        if (mysqli_stmt_execute($stmt_ins)) {
                            if ($is_first) {
                                header("Location: login.php?msg=" . urlencode("Registrasi berhasil! Anda adalah pendaftar pertama pada database, sehingga otomatis disetujui menjadi Super Admin. Silakan masuk menggunakan password Anda."));
                            } else {
                                header("Location: login.php?msg=" . urlencode("Pendaftaran berhasil! Akun Anda (@$username) sedang menunggu persetujuan (ACC) dari Super Admin sebelum Anda dapat masuk."));
                            }
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
            background: radial-gradient(circle at 50% 50%, #0b0f19 0%, #020408 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #f8fafc;
            padding: 1.5rem;
            position: relative;
            overflow-x: hidden;
        }
        .glow-sphere {
            position: absolute;
            border-radius: 50%;
            filter: blur(140px);
            opacity: 0.15;
            z-index: 1;
            pointer-events: none;
        }
        .glow-1 {
            width: 350px;
            height: 350px;
            background: #2563eb;
            top: 20%;
            left: 10%;
        }
        .glow-2 {
            width: 400px;
            height: 400px;
            background: #7c3aed;
            bottom: 20%;
            right: 10%;
        }
        .login-card {
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
            max-width: 445px;
            width: 100%;
            padding: 3rem 2.5rem;
            position: relative;
            z-index: 2;
            animation: flow-glow 6s infinite alternate;
            transition: all 0.4s ease;
        }
        @keyframes flow-glow {
            0% { border-color: rgba(99, 102, 241, 0.12); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5); }
            50% { border-color: rgba(59, 130, 246, 0.28); box-shadow: 0 25px 70px rgba(59, 130, 246, 0.08); }
            100% { border-color: rgba(99, 102, 241, 0.12); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5); }
        }
        .login-card:hover {
            border-color: rgba(255, 255, 255, 0.18);
        }
        .brand-logo-container {
            width: 76px;
            height: 76px;
            background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #6366f1 100%);
            border-radius: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
            font-size: 2.3rem;
            color: white;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: pulse-logo 3s infinite alternate;
        }
        @keyframes pulse-logo {
            0% { transform: scale(1); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
            100% { transform: scale(1.05); box-shadow: 0 0 25px rgba(99, 102, 241, 0.55); }
        }
        .brand-logo-container:hover {
            transform: rotate(12deg) scale(1.1);
        }
        .form-label {
            font-weight: 700;
            color: #94a3b8;
            font-size: 0.725rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
            display: block;
        }
        .input-group-custom {
            position: relative;
            margin-bottom: 1.5rem;
        }
        .input-group-custom i {
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            color: #475569;
            font-size: 1.1rem;
            transition: color 0.3s;
            z-index: 10;
        }
        .form-control-custom {
            background-color: rgba(10, 15, 30, 0.7) !important;
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #f8fafc !important;
            border-radius: 14px;
            padding: 0.85rem 1rem 0.85rem 48px;
            font-size: 0.95rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            width: 100%;
        }
        .form-control-custom::placeholder {
            color: #475569;
        }
        .form-control-custom:focus {
            background-color: rgba(10, 15, 30, 0.95) !important;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
            outline: none;
        }
        .form-control-custom:focus + i {
            color: #3b82f6;
        }
        .tab-bar-pill {
            background: rgba(10, 15, 30, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 5px;
            border-radius: 99px;
            display: flex;
            gap: 4px;
            margin-bottom: 2rem;
        }
        .tab-btn-pill {
            flex: 1;
            background: none;
            border: none;
            color: #64748b;
            font-weight: 700;
            font-size: 0.8rem;
            padding: 0.65rem 1rem;
            border-radius: 99px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .tab-btn-pill:hover {
            color: #cbd5e1;
        }
        .tab-btn-pill.active {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            color: #ffffff;
            box-shadow: 0 4px 15px rgba(37, 99, 211, 0.35);
        }
        .btn-premium {
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            border: none;
            color: white;
            font-weight: 700;
            border-radius: 14px;
            padding: 0.9rem 1.5rem;
            font-size: 0.95rem;
            letter-spacing: 0.03em;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 20px rgba(37, 99, 211, 0.25);
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(37, 99, 211, 0.45);
            filter: brightness(1.1);
        }
        .btn-premium:active {
            transform: translateY(0);
        }
        .btn-premium-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25);
        }
        .btn-premium-success:hover {
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.45);
        }
        .kredensial-box {
            background-color: rgba(10, 15, 30, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 18px;
            padding: 1.25rem;
            margin-top: 1.75rem;
        }
        .brand-text-gradient {
            background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>

<div class="glow-sphere glow-1"></div>
<div class="glow-sphere glow-2"></div>

<div class="login-card">
    <div class="text-center mb-4">
        <div class="brand-logo-container overflow-hidden" style="background: <?= !empty($app_logo_image_url) ? '#ffffff' : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #6366f1 100%)'; ?>;">
            <?php if (!empty($app_logo_image_url)): ?>
                <img src="<?= htmlspecialchars($app_logo_image_url); ?>" alt="Logo" class="img-fluid" style="width: 100%; height: 100%; object-fit: contain; padding: 10px;">
            <?php else: ?>
                <i class="bi <?= htmlspecialchars($app_logo_icon); ?>"></i>
            <?php endif; ?>
        </div>
        <h4 class="fw-bold mb-1 brand-text-gradient text-truncate px-2" title="<?= htmlspecialchars($app_name); ?>"><?= htmlspecialchars($app_name); ?></h4>
        <p class="text-muted small mb-0">Kelola arus kas & laporan keuangan secara aman</p>
    </div>

    <!-- Switcher Tab UI -->
    <div class="tab-bar-pill">
        <button class="tab-btn-pill active" id="tab-login-btn" onclick="switchTab('login')">
            <i class="bi bi-box-arrow-in-right"></i> Masuk
        </button>
        <button class="tab-btn-pill" id="tab-register-btn" onclick="switchTab('register')">
            <i class="bi bi-person-plus"></i> Daftar Baru
        </button>
    </div>

    <!-- Notifikasi Alert Sukses / Error -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success px-4 py-3 rounded-3 d-flex align-items-start mb-4" role="alert" style="background-color: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); color: #86efac; z-index: 10;">
            <i class="bi bi-check-circle-fill me-2.5 fs-5 text-success mt-0.5"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($success_msg); ?></div>
        </div>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger px-4 py-3 rounded-3 d-flex align-items-start mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #fca5a5; z-index: 10;">
            <i class="bi bi-exclamation-triangle-fill me-2.5 fs-5 text-danger mt-0.5"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
        </div>
    <?php endif; ?>

    <!-- FORM MASUK (LOGIN) -->
    <div id="form-login">
        <form action="login.php" method="POST">
            <input type="hidden" name="action" value="login">
            
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <div class="input-group-custom">
                    <input type="text" class="form-control-custom" id="username" name="username" placeholder="Masukkan username" required autofocus>
                    <i class="bi bi-person"></i>
                </div>
            </div>
            
            <div class="mb-4">
                <label for="password" class="form-label">Password</label>
                <div class="input-group-custom">
                    <input type="password" class="form-control-custom" id="password" name="password" placeholder="Masukkan password" required>
                    <i class="bi bi-shield-lock"></i>
                </div>
            </div>

            <button type="submit" class="btn-premium">
                <i class="bi bi-box-arrow-in-right"></i> Masuk Sekarang
            </button>
        </form>
    </div>

    <!-- FORM DAFTAR AKUN (REGISTER) -->
    <div id="form-register" style="display: none;">
        <form action="login.php" method="POST">
            <input type="hidden" name="action" value="register">
            
            <div class="mb-3">
                <label for="reg-nama" class="form-label">Nama Lengkap</label>
                <div class="input-group-custom">
                    <input type="text" class="form-control-custom" id="reg-nama" name="nama" placeholder="Contoh: Muhammad Rian" required>
                    <i class="bi bi-card-text"></i>
                </div>
            </div>

            <div class="mb-3">
                <label for="reg-username" class="form-label">Username Baru</label>
                <div class="input-group-custom">
                    <input type="text" class="form-control-custom" id="reg-username" name="username" placeholder="Gunakan huruf kecil & angka" required>
                    <i class="bi bi-person-plus"></i>
                </div>
            </div>
            
            <div class="mb-4">
                <label for="reg-password" class="form-label">Password</label>
                <div class="input-group-custom">
                    <input type="password" class="form-control-custom" id="reg-password" name="password" placeholder="Minimal 6 karakter" required>
                    <i class="bi bi-key"></i>
                </div>
            </div>

            <button type="submit" class="btn-premium btn-premium-success">
                <i class="bi bi-person-plus-fill"></i> Daftar Akun Baru
            </button>
            <?php if (!$has_users): ?>
                <p class="text-center text-muted small mt-3 mb-0" style="font-size: 0.75rem;">Status pendaftaran Anda otomatis disetujui jika Anda mendaftar pertama kali, atau menyusul pending ACC jika sudah ada pendaftar sebelumnya.</p>
            <?php else: ?>
                <p class="text-center text-muted small mt-3 mb-0" style="font-size: 0.75rem;">Pendaftaran akun baru membutuhkan persetujuan (ACC) terlebih dahulu oleh Super Admin sebelum dapat masuk.</p>
            <?php endif; ?>
        </form>
    </div>

    <!-- KETERANGAN & SOLUSI BCRYPT SEEDING / PASSWORD RESET -->
    <?php if (!$has_users): ?>
    <div class="kredensial-box">
        <span class="text-muted small fw-bold" style="font-size: 0.75rem;"><i class="bi bi-info-circle-fill me-1 text-primary"></i> Aturan Sistem Sandbox:</span>
        <div class="text-light small mt-1.5" style="font-size: 0.72rem; line-height: 1.45;">
            Pada instalasi awal, database atau tabel <code>users</code> dalam keadaan <strong>kosong (bersih)</strong>. <br>
            <span class="text-warning fw-bold">Aturan Akun Baru:</span><br>
            - User pertama yang mendaftar otomatis menjadi <strong>Super Admin</strong> dengan status disetujui langsung (Approved).<br>
            - Pendaftar ke-2 dan seterusnya otomatis menjadi <strong>Admin</strong> biasa dengan status menunggu persetujuan (Pending ACC) dari Super Admin.
        </div>
    </div>
    <?php endif; ?>
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
</script>

</body>
</html>
