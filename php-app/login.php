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
                                header("Location: login.php?msg=" . urlencode("Registrasi berhasil! Anda adalah pendaftar pertama pada database, sehingga otomatis disetujui menjadi Super Admin. Silakan masuk memakai password Anda."));
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
                    $error = "Username tidak terdaftar di sistem database!";
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
    <title><?= htmlspecialchars($app_name); ?> - Autentikasi Pengguna</title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: <?= htmlspecialchars($login_accent_color); ?>;
            --primary-hover: <?= htmlspecialchars($login_hover_color); ?>;
            --primary-light: rgba(16, 185, 129, 0.08);
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-300: #cbd5e1;
            --slate-400: #94a3b8;
            --slate-500: #64748b;
            --slate-600: #475569;
            --slate-700: #334155;
            --slate-800: #1e293b;
            --slate-900: #0f172a;
        }

        body {
            background-color: #f1f5f9;
            background-image: radial-gradient(at 0% 0%, hsla(160,84%,50%,0.06) 0, transparent 50%),
                              radial-gradient(at 100% 100%, hsla(217,100%,50%,0.06) 0, transparent 50%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', system-ui, sans-serif;
            color: var(--slate-800);
            padding: 1.5rem;
            margin: 0;
            position: relative;
            overflow-x: hidden;
        }

        /* Abstract glowing spheres */
        .glowing-sphere {
            position: absolute;
            border-radius: 50%;
            filter: blur(130px);
            opacity: 0.12;
            z-index: 1;
            pointer-events: none;
        }
        .sphere-1 {
            width: 450px;
            height: 450px;
            background: #10b981;
            top: -10%;
            left: -10%;
        }
        .sphere-2 {
            width: 450px;
            height: 450px;
            background: #2563eb;
            bottom: -10%;
            right: -10%;
        }

        .auth-card {
            background: #ffffff;
            border-radius: 28px;
            box-shadow: 0 30px 70px rgba(15, 23, 42, 0.08), 0 0 1px rgba(15, 23, 42, 0.15);
            border: 1px solid var(--slate-200);
            max-width: 1020px;
            width: 100%;
            min-height: 670px;
            display: grid;
            grid-template-columns: 1.15fr 1fr;
            overflow: hidden;
            position: relative;
            z-index: 2;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 991.98px) {
            .auth-card {
                grid-template-columns: 1fr;
                max-width: 480px;
                min-height: auto;
                border-radius: 24px;
            }
        }

        /* Left Branding Panel Style */
        .branding-panel {
            background: linear-gradient(135deg, <?= htmlspecialchars($login_grad_start); ?> 0%, <?= htmlspecialchars($login_grad_mid); ?> 35%, <?= htmlspecialchars($login_grad_end); ?> 100%);
            padding: 4rem 3.5rem;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* Decorative circles */
        .brand-decorator {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.015);
            border: 1px solid rgba(255, 255, 255, 0.03);
            pointer-events: none;
        }
        .dec-1 { width: 350px; height: 350px; top: -10%; right: -20%; }
        .dec-2 { width: 220px; height: 220px; bottom: 10%; left: -10%; }

        .brand-top-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 5;
        }

        .logo-circle {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            color: #ffffff;
            font-size: 1.35rem;
        }

        .brand-mid-info {
            z-index: 5;
            margin: auto 0;
            padding: 1.5rem 0;
        }

        .brand-slogan {
            font-size: 2.3rem;
            font-weight: 950;
            line-height: 1.25;
            letter-spacing: -0.02em;
            color: #ffffff;
            margin-bottom: 1.25rem;
        }
        .brand-slogan span {
            background: linear-gradient(135deg, #a7f3d0 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .brand-description {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.92rem;
            line-height: 1.6;
            max-width: 380px;
            margin-bottom: 2.25rem;
        }

        /* Ambient floating stat-badge */
        .floating-stat-box {
            background: rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.11);
            border-radius: 16px;
            padding: 1.1rem 1.4rem;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            max-width: 360px;
            animation: floatingUp 4s ease-in-out infinite alternate;
        }
        @keyframes floatingUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-8px); }
        }

        .stat-icon {
            width: 40px;
            height: 40px;
            background-color: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 1.1rem;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
        }

        .brand-footer {
            z-index: 5;
            font-weight: 500;
            letter-spacing: 0.01em;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.45);
        }

        /* Right Form Panel Style */
        .form-panel {
            padding: 3.5rem 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: #ffffff;
        }

        @media (max-width: 575.98px) {
            .form-panel {
                padding: 2.25rem 1.5rem;
            }
        }

        .form-tab-container {
            background: var(--slate-100);
            padding: 5px;
            border-radius: 14px;
            display: flex;
            gap: 4px;
            margin-bottom: 2rem;
            border: 1px solid var(--slate-200);
        }

        .form-tab-btn {
            flex: 1;
            background: none;
            border: none;
            padding: 10px 14px;
            font-size: 0.82rem;
            font-weight: 700;
            color: var(--slate-500);
            border-radius: 10px;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .form-tab-btn:hover {
            color: var(--slate-800);
        }
        .form-tab-btn.active {
            background: #ffffff;
            color: var(--slate-900);
            box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
            border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .form-label-custom {
            font-size: 0.68rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--slate-500);
            margin-bottom: 0.5rem;
            display: block;
        }

        .input-group-custom {
            position: relative;
            margin-bottom: 1.25rem;
        }

        .input-group-custom .input-i {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--slate-400);
            font-size: 1.1rem;
            pointer-events: none;
            transition: color 0.2s ease;
            z-index: 5;
        }

        .form-control-custom {
            width: 100%;
            background-color: #ffffff !important;
            border: 1.5px solid var(--slate-200);
            color: var(--slate-900) !important;
            border-radius: 12px;
            padding: 11px 14px 11px 45px;
            font-size: 0.92rem;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .form-control-custom::placeholder {
            color: var(--slate-400);
            font-weight: 400;
            font-size: 0.85rem;
        }

        .form-control-custom:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
        }

        .form-control-custom:focus ~ .input-i {
            color: var(--primary-color);
        }

        .password-toggle {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--slate-400);
            font-size: 1.1rem;
            padding: 0;
            cursor: pointer;
            z-index: 6;
            transition: color 0.2s ease;
        }
        .password-toggle:hover {
            color: var(--slate-700);
        }

        .btn-elite {
            width: 100%;
            background: linear-gradient(135deg, var(--primary-color) 0%, #10b981 100%);
            color: #ffffff;
            border: none;
            border-radius: 12px;
            padding: 13px 20px;
            font-size: 0.92rem;
            font-weight: 750;
            letter-spacing: 0.01em;
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.25);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-elite:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 22px rgba(5, 150, 105, 0.38);
            filter: brightness(1.05);
        }

        .btn-elite:active {
            transform: translateY(0);
        }

        .btn-elite-secondary {
            background: linear-gradient(135deg, var(--slate-700) 0%, var(--slate-800) 100%);
            box-shadow: 0 4px 15px rgba(30, 41, 59, 0.15);
        }
        .btn-elite-secondary:hover {
            box-shadow: 0 8px 22px rgba(30, 41, 59, 0.25);
        }

        .alert-custom {
            padding: 14px 16px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            line-height: 1.5;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 1.5rem;
        }

        .sandbox-box {
            background-color: var(--slate-50);
            border: 1px solid var(--slate-200);
            border-radius: 14px;
            padding: 1rem 1.15rem;
            margin-top: 1.5rem;
            font-size: 0.72rem;
            line-height: 1.5;
            color: var(--slate-600);
        }

        /* Seamless Transitions */
        .form-wrap {
            animation: formFadeIn 0.35s ease-out;
        }
        @keyframes formFadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>

<div class="glowing-sphere sphere-1"></div>
<div class="glowing-sphere sphere-2"></div>

<div class="auth-card">
    <!-- PANEL KIRI (BRANDING & INFO) -->
    <div class="branding-panel d-none d-lg-flex">
        <div class="brand-decorator dec-1"></div>
        <div class="brand-decorator dec-2"></div>
        
        <div class="brand-top-logo">
            <div class="logo-circle" style="background: <?= !empty($app_logo_image_url) ? '#ffffff' : 'linear-gradient(135deg, ' . htmlspecialchars($login_accent_color) . ' 0%, ' . htmlspecialchars($login_hover_color) . ' 100%)'; ?>;">
                <?php if (!empty($app_logo_image_url)): ?>
                    <img src="<?= htmlspecialchars($app_logo_image_url); ?>" alt="Logo" class="img-fluid" style="width: 100%; height: 100%; object-fit: contain; padding: 6px;">
                <?php else: ?>
                    <i class="text-white bi <?= htmlspecialchars($app_logo_icon ?? 'bi-wallet2'); ?> fs-5"></i>
                <?php endif; ?>
            </div>
            <span class="fw-black text-white text-uppercase tracking-wider m-0" style="font-size: 0.95rem; font-weight: 900; letter-spacing: 0.08em;"><?= htmlspecialchars($app_name); ?></span>
        </div>

        <div class="brand-mid-info">
            <h1 class="brand-slogan">
                <?= htmlspecialchars($login_slogan_1); ?><br>
                <span><?= htmlspecialchars($login_slogan_2); ?></span>
            </h1>
            <p class="brand-description">
                <?= htmlspecialchars($login_desc); ?>
            </p>
            
            <div class="floating-stat-box">
                <div class="stat-icon" style="background-color: <?= htmlspecialchars($login_accent_color); ?>; box-shadow: 0 4px 12px <?= htmlspecialchars($login_accent_color); ?>5A;">
                    <i class="bi bi-shield-lock-fill"></i>
                </div>
                <div>
                    <div class="fw-bold text-white small" style="font-size: 0.85rem;"><?= htmlspecialchars($login_badge_title); ?></div>
                    <div class="text-white-50" style="font-size: 0.72rem;"><?= htmlspecialchars($login_badge_desc); ?></div>
                </div>
            </div>
        </div>

        <div class="brand-footer d-flex justify-content-between align-items-center">
            <span>© <?= date('Y'); ?> <?= htmlspecialchars($app_name); ?></span>
            <span class="opacity-75 font-monospace" style="font-size: 0.72rem;">v1.4 SECURE</span>
        </div>
    </div>

    <!-- PANEL KANAN (FORM UTAMA) -->
    <div class="form-panel">
        <!-- Brand Logo for Mobile only -->
        <div class="d-lg-none text-center mb-4">
            <div class="logo-circle mx-auto mb-3" style="width: 54px; height: 54px; background: <?= !empty($app_logo_image_url) ? '#ffffff' : 'linear-gradient(135deg, ' . htmlspecialchars($login_accent_color) . ' 0%, ' . htmlspecialchars($login_hover_color) . ' 100%)'; ?>;">
                <?php if (!empty($app_logo_image_url)): ?>
                    <img src="<?= htmlspecialchars($app_logo_image_url); ?>" alt="Logo" class="img-fluid" style="width: 100%; height: 100%; object-fit: contain; padding: 6px;">
                <?php else: ?>
                    <i class="text-white bi <?= htmlspecialchars($app_logo_icon ?? 'bi-wallet2'); ?> fs-4"></i>
                <?php endif; ?>
            </div>
            <h4 class="fw-black text-slate-900 mb-1" style="font-weight: 900; letter-spacing: -0.01em;"><?= htmlspecialchars($app_name); ?></h4>
            <p class="text-muted small mb-0"><?= htmlspecialchars($login_subtitle); ?></p>
        </div>

        <div class="auth-header mb-4 d-none d-lg-block">
            <h3 class="fw-black text-slate-900 mb-1" style="font-size: 1.6rem; font-weight: 900; letter-spacing: -0.02em;"><?= htmlspecialchars($login_title); ?></h3>
            <p class="text-muted small"><?= htmlspecialchars($login_subtitle); ?></p>
        </div>

        <!-- Tab Switcher Menu -->
        <div class="form-tab-container">
            <button class="form-tab-btn active" id="tab-login-btn" onclick="switchTab('login')">
                <i class="bi bi-box-arrow-in-right"></i> Masuk
            </button>
            <button class="form-tab-btn" id="tab-register-btn" onclick="switchTab('register')">
                <i class="bi bi-person-plus-fill"></i> Pendaftaran
            </button>
        </div>

        <!-- Alert Notification -->
        <?php if (!empty($success_msg)): ?>
            <div class="alert alert-success alert-custom alert-dismissible fade show" role="alert" style="background-color: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.15); color: #065f46;">
                <i class="bi bi-check-circle-fill text-success fs-5"></i>
                <div><?= htmlspecialchars($success_msg); ?></div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" style="font-size: 0.7rem;"></button>
            </div>
        <?php endif; ?>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger alert-custom alert-dismissible fade show" role="alert" style="background-color: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.15); color: #991b1b;">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                <div><?= htmlspecialchars($error); ?></div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" style="font-size: 0.7rem;"></button>
            </div>
        <?php endif; ?>

        <!-- FORM MASUK (LOGIN) -->
        <div id="form-login" class="form-wrap">
            <form action="login.php" method="POST">
                <input type="hidden" name="action" value="login">
                
                <div class="mb-3">
                    <label for="username" class="form-label-custom">Username</label>
                    <div class="input-group-custom">
                        <input type="text" class="form-control-custom" id="username" name="username" placeholder="Masukkan username Anda" required autofocus autocomplete="username">
                        <i class="bi bi-person input-i"></i>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label for="password" class="form-label-custom">Password</label>
                    <div class="input-group-custom">
                        <input type="password" class="form-control-custom" id="password" name="password" placeholder="Masukkan password Anda" required autocomplete="current-password">
                        <i class="bi bi-shield-lock input-i"></i>
                        <button type="button" class="password-toggle" onclick="togglePassword('password', this)" title="Tampilkan Password">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-elite">
                    <i class="bi bi-box-arrow-in-right"></i> Masuk Sekarang
                </button>
            </form>
        </div>

        <!-- FORM DAFTAR AKUN (REGISTER) -->
        <div id="form-register" class="form-wrap" style="display: none;">
            <form action="login.php" method="POST">
                <input type="hidden" name="action" value="register">
                
                <div class="mb-3">
                    <label for="reg-nama" class="form-label-custom">Nama Lengkap</label>
                    <div class="input-group-custom">
                        <input type="text" class="form-control-custom" id="reg-nama" name="nama" placeholder="Contoh: Muhammad Rian" required autocomplete="name">
                        <i class="bi bi-card-text input-i"></i>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="reg-username" class="form-label-custom">Username Baru</label>
                    <div class="input-group-custom">
                        <input type="text" class="form-control-custom" id="reg-username" name="username" placeholder="Gunakan huruf kecil & angka" required autocomplete="username">
                        <i class="bi bi-person-plus input-i"></i>
                    </div>
                </div>
                
                <div class="mb-4">
                    <label for="reg-password" class="form-label-custom">Password Baru</label>
                    <div class="input-group-custom">
                        <input type="password" class="form-control-custom" id="reg-password" name="password" placeholder="Minimal 6 karakter" required autocomplete="new-password">
                        <i class="bi bi-key input-i"></i>
                        <button type="button" class="password-toggle" onclick="togglePassword('reg-password', this)" title="Tampilkan Password">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-elite btn-elite-secondary">
                    <i class="bi bi-person-plus-fill"></i> Daftarkan Akun Baru
                </button>
                
                <?php if (!$has_users): ?>
                    <p class="text-center text-muted small mt-2.5 mb-0" style="font-size: 0.72rem; line-height: 1.45;">Status pendaftaran Anda otomatis disetujui jika Anda mendaftar pertama kali, atau menyusul pending ACC jika sudah ada pendaftar sebelumnya.</p>
                <?php else: ?>
                    <p class="text-center text-muted small mt-2.5 mb-0" style="font-size: 0.72rem; line-height: 1.45;">Pendaftaran akun baru membutuhkan persetujuan (ACC) terlebih dahulu oleh Super Admin sebelum dapat masuk.</p>
                <?php endif; ?>
            </form>
        </div>

        <!-- KREDENSIAL BOX (SANDBOX INFO) -->
        <?php if (!$has_users): ?>
        <div class="sandbox-box">
            <span class="text-dark small fw-bold d-flex align-items-center gap-1.5 mb-1"><i class="bi bi-info-circle-fill text-emerald-600"></i> Aturan Sistem Sandbox:</span>
            <div style="font-size: 0.7rem; line-height: 1.4;">
                Database atau tabel <code>users</code> dalam keadaan kosong (bersih).<br>
                1. User pertama yang mendaftar otomatis menjadi <strong>Super Admin</strong>.<br>
                2. Pendaftar berikutnya berstatus <strong>Pending</strong> menunggu persetujuan Super Admin.
            </div>
        </div>
        <?php endif; ?>
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

function togglePassword(fieldId, btn) {
    const passwordField = document.getElementById(fieldId);
    const icon = btn.querySelector('i');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
}
</script>
<!-- Bootstrap 5 Bundle with Popper JS CDN -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
