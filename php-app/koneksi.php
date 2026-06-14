<?php
// koneksi.php
// Konfigurasi koneksi database untuk cPanel / Shared Hosting maupun Localhost
// Dilengkapi dengan sistem Auto-Installer pintar untuk uji coba lokal (XAMPP / Laragon)

$db_host = "localhost";
$db_user = "root";       // Default XAMPP: root
$db_pass = "";           // Default XAMPP: kosong ""
$db_name = "keuangan_db";

// Nonaktifkan mysqli reporting exception default agar kita bisa handle error secara visual & elegan
mysqli_report(MYSQLI_REPORT_OFF);

// Mencoba koneksi ke server MySQL tanpa memilih database terlebih dahulu
$koneksi = @mysqli_connect($db_host, $db_user, $db_pass);

if (!$koneksi) {
    // Jika koneksi ke server MySQL gagal (misal XAMPP belum aktif)
    $error_detail = mysqli_connect_error();
    die('
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 60px auto; padding: 30px; border-radius: 16px; background-color: #fef2f2; border: 1px solid #fca5a5; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background-color: #fee2e2; padding: 10px; border-radius: 50%; margin-right: 15px; color: #ef4444;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h2 style="color: #991b1b; margin: 0; font-weight: 700; font-size: 22px;">Gagal Menghubungi Server MySQL!</h2>
        </div>
        
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Aplikasi <strong>KeuanganKu</strong> tidak dapat terhubung ke server database MySQL Anda menggunakan kredensial di <code>koneksi.php</code>.
        </p>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 10px; border: 1px solid #f3f4f6; font-family: monospace; font-size: 13.5px; color: #b91c1c; margin-bottom: 25px;">
            <strong>Detail Masalah:</strong> ' . htmlspecialchars($error_detail) . '
        </div>
        
        <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;">Langkah Solusi untuk XAMPP:</h3>
        <ol style="color: #4b5563; font-size: 14.5px; line-height: 1.6; padding-left: 20px; margin-bottom: 25px;">
            <li style="margin-bottom: 8px;">Pastikan aplikasi <strong>XAMPP Control Panel</strong> Anda sudah dibuka.</li>
            <li style="margin-bottom: 8px;">Klik tombol <strong>Start</strong> di samping modul <strong>Apache</strong> dan <strong>MySQL</strong> hingga berwarna hijau.</li>
            <li style="margin-bottom: 8px;">Buka file <code>koneksi.php</code> dan pastikan kredensial di bawah sudah cocok:
                <ul style="padding-left: 20px; margin-top: 5px; list-style-type: circle;">
                    <li><code>$db_host = "' . htmlspecialchars($db_host) . '";</code></li>
                    <li><code>$db_user = "' . htmlspecialchars($db_user) . '";</code></li>
                    <li><code>$db_pass = "' . htmlspecialchars($db_pass) . '";</code></li>
                </ul>
            </li>
        </ol>
        
        <button onclick="window.location.reload()" style="background-color: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">
            Segarkan Halaman & Hubungkan Kembali
        </button>
    </div>');
}

// Atur Charset Koneksi ke UTF-8
mysqli_set_charset($koneksi, "utf8mb4");

// Coba pilih database. Jika belum ada, lakukan Auto-Installation database & tabel pintar
$db_check = @mysqli_select_db($koneksi, $db_name);

if (!$db_check) {
    // Database tidak ditemukan! Kita coba buat secara otomatis agar mempermudah pengguna XAMPP
    $sql_create_db = "CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
    
    if (@mysqli_query($koneksi, $sql_create_db)) {
        // Berhasil membuat database baru! Sekarang hubungkan ke database tersebut
        mysqli_select_db($koneksi, $db_name);
    } else {
        // Gagal membuat database otomatis karena hak akses dibatasi (misal di cPanel Shared Hosting)
        die("
        <div style='font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 60px auto; padding: 30px; border-radius: 16px; background-color: #fffbeb; border: 1px solid #fcd34d; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);'>
            <div style='display: flex; align-items: center; margin-bottom: 20px;'>
                <div style='background-color: #fef3c7; padding: 10px; border-radius: 50%; margin-right: 15px; color: #d97706;'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><line x1='12' y1='8' x2='12' y2='12'></line><line x1='12' y1='16' x2='12.01' y2='16'></line></svg>
                </div>
                <h2 style='color: #92400e; margin: 0; font-weight: 700; font-size: 22px;'>Database '$db_name' Belum Ada!</h2>
            </div>
            
            <p style='color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;'>
                Database dengan nama <strong>$db_name</strong> tidak ditemukan pada server lokal/hosting Anda dan hak akses database Anda membatasi pembuatan otomatis.
            </p>
            
            <h3 style='color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;'>Tuntunan Import Manual lewat phpMyAdmin:</h3>
            <ol style='color: #4b5563; font-size: 14.5px; line-height: 1.6; padding-left: 20px; margin-bottom: 25px;'>
                <li style='margin-bottom: 8px;'>Buka browser dan arahkan ke alamat <strong><a href='http://localhost/phpmyadmin/' target='_blank' style='color: #d97706; text-decoration: underline;'>http://localhost/phpmyadmin/</a></strong>.</li>
                <li style='margin-bottom: 8px;'>Buat database baru dengan mengklik menu <strong>Baru / New</strong> di sisi kiri lalu beri nama persis: <strong>$db_name</strong>.</li>
                <li style='margin-bottom: 8px;'>Pilih database <strong>$db_name</strong> tersebut, lalu masuk ke menu tab <strong>Import</strong> di bagian atas.</li>
                <li style='margin-bottom: 8px;'>Pilih file database <strong>db.sql</strong> yang ada dalam folder projek Anda, lalu tekan tombol <strong>Kirim / Go / Import</strong> di bagian bawah.</li>
            </ol>
            
            <button onclick='window.location.reload()' style='background-color: #d97706; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s;'>
                Saya Sudah Import SQL, Hubungkan Kembali
            </button>
        </div>");
    }
}

// Setelah database dipilih, pastikan tabel-tabel utama sudah ada atau di-install secara otomatis
$table_check_users = @mysqli_query($koneksi, "SELECT 1 FROM `users` LIMIT 1");
if (!$table_check_users) {
    // 1. Buat Tabel Users
    $sql_table_users = "CREATE TABLE IF NOT EXISTS `users` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `username` VARCHAR(50) NOT NULL UNIQUE,
      `password` VARCHAR(255) NOT NULL,
      `nama` VARCHAR(100) NOT NULL,
      `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
      `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_users);

    // 2. Isi Akun Default (Dihapus agar pendaftar pertama menjadi Super Admin)
    // database dimulai dalam kondisi bersih tanpa data user bawaan agar pengisian mandiri dapat berjalan.
} else {
    // Jalankan auto-migration: pastikan kolom 'status' ada di tabel users
    $status_col_check = @mysqli_query($koneksi, "SHOW COLUMNS FROM `users` LIKE 'status'");
    if ($status_col_check && mysqli_num_rows($status_col_check) == 0) {
        @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'pending'");
    }
}

$table_check_transaksi = @mysqli_query($koneksi, "SELECT 1 FROM `transaksi` LIMIT 1");
if (!$table_check_transaksi) {
    // 3. Buat Tabel Transaksi
    $sql_table_transaksi = "CREATE TABLE IF NOT EXISTS `transaksi` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `tanggal` DATE NOT NULL,
      `keterangan` VARCHAR(255) NOT NULL,
      `kategori` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
      `jenis` ENUM('pemasukan','pengeluaran') NOT NULL,
      `jumlah` INT(11) NOT NULL,
      `dompet` VARCHAR(100) NOT NULL DEFAULT 'Tunai',
      `username` VARCHAR(50) NOT NULL DEFAULT 'admin',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_transaksi);

    // 4. Isi Data Transaksi Bawaan
    $sql_insert_dummy_transaksi = "INSERT INTO `transaksi` (`id`, `tanggal`, `keterangan`, `kategori`, `jenis`, `jumlah`, `dompet`) VALUES
    (1, '2026-06-01', 'Gaji Bulanan Utama', 'Gaji', 'pemasukan', 5000000, 'Bank BCA'),
    (2, '2026-06-02', 'Membeli Hosting & Domain CPanel', 'Tagihan', 'pengeluaran', 250000, 'Bank BCA'),
    (3, '2026-06-03', 'Projek Pembuatan Jasa Website UMKM', 'Freelance', 'pemasukan', 1750000, 'Gopay'),
    (4, '2026-06-05', 'Membayar Tagihan Listrik Bulanan', 'Tagihan', 'pengeluaran', 190000, 'Tunai'),
    (5, '2026-06-06', 'Membeli Buku Panduan Pemrograman PHP', 'Belanja', 'pengeluaran', 95000, 'OVO'),
    (6, '2026-06-08', 'Menerima Komisi Afiliasi Landing Page', 'Freelance', 'pemasukan', 600000, 'Gopay')
    ON DUPLICATE KEY UPDATE id=id;";
    @mysqli_query($koneksi, $sql_insert_dummy_transaksi);
}

// 5. Pastikan kolom theme ada di tabel users (untuk mendukung fitur ubah tema kustom)
$col_check_theme = @mysqli_query($koneksi, "SHOW COLUMNS FROM `users` LIKE 'theme'");
if ($col_check_theme && mysqli_num_rows($col_check_theme) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `theme` VARCHAR(30) NOT NULL DEFAULT 'slate'");
}

// 5b. Pastikan kolom konfigurasi dashboard ada di tabel users
$col_check_dashboard = @mysqli_query($koneksi, "SHOW COLUMNS FROM `users` LIKE 'show_card_in'");
if ($col_check_dashboard && mysqli_num_rows($col_check_dashboard) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_card_in` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_card_out` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_card_balance` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_chart_trend` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `show_chart_prop` INT(1) NOT NULL DEFAULT 1");
}

// 6. Pastikan tabel kategori transaksi ada
$table_check_kategori = @mysqli_query($koneksi, "SELECT 1 FROM `kategori` LIMIT 1");
if (!$table_check_kategori) {
    $sql_table_kategori = "CREATE TABLE IF NOT EXISTS `kategori` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `nama` VARCHAR(100) NOT NULL UNIQUE,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_kategori);

    // Isi Default Kategori
    $sql_insert_default_kategori = "INSERT INTO `kategori` (`nama`) VALUES
    ('Gaji'),
    ('Belanja'),
    ('Transportasi'),
    ('Makan & Minum'),
    ('Tagihan'),
    ('Freelance'),
    ('Lainnya')
    ON DUPLICATE KEY UPDATE nama=nama;";
    @mysqli_query($koneksi, $sql_insert_default_kategori);
}

// 7. Pastikan tabel pengaturan_sistem ada
$table_check_settings = @mysqli_query($koneksi, "SELECT 1 FROM `pengaturan_sistem` LIMIT 1");
if (!$table_check_settings) {
    $sql_table_settings = "CREATE TABLE IF NOT EXISTS `pengaturan_sistem` (
      `kunci` VARCHAR(50) NOT NULL UNIQUE,
      `nilai` TEXT NOT NULL,
      PRIMARY KEY (`kunci`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_settings);

    // Isi Default Pengaturan Sistem
    @mysqli_query($koneksi, "INSERT IGNORE INTO `pengaturan_sistem` (`kunci`, `nilai`) VALUES
    ('nama_aplikasi', 'KeuanganKu'),
    ('logo_icon', 'bi-wallet2'),
    ('logo_image_url', ''),
    ('app_favicon_url', 'https://cdn-icons-png.flaticon.com/512/2920/2920083.png'),
    ('app_footer', '')");
}

// 8. Pastikan tabel transaksi_berulang ada
$table_check_berulang = @mysqli_query($koneksi, "SELECT 1 FROM `transaksi_berulang` LIMIT 1");
if (!$table_check_berulang) {
    $sql_table_berulang = "CREATE TABLE IF NOT EXISTS `transaksi_berulang` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `keterangan` VARCHAR(255) NOT NULL,
      `kategori` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
      `jenis` ENUM('pemasukan','pengeluaran') NOT NULL,
      `jumlah` INT(11) NOT NULL,
      `frekuensi` VARCHAR(50) NOT NULL DEFAULT 'Bulanan',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_berulang);

    // Isi Default Transaksi Berulang
    @mysqli_query($koneksi, "INSERT INTO `transaksi_berulang` (`id`, `keterangan`, `kategori`, `jenis`, `jumlah`, `frekuensi`) VALUES
    (1, 'Sewa VPS Cloud Run Pro', 'Tagihan', 'pengeluaran', 120000, 'Bulanan'),
    (2, 'Langganan Internet Biznet', 'Tagihan', 'pengeluaran', 350000, 'Bulanan'),
    (3, 'Penghasilan Google AdSense', 'Freelance', 'pemasukan', 2400000, 'Bulanan'),
    (4, 'Gaji Pokok Karyawan Tetap', 'Gaji', 'pemasukan', 5500000, 'Bulanan')
    ON DUPLICATE KEY UPDATE id=id;");
}

// 9. Pastikan tabel dompet (Multi-Wallet Management) ada
$table_check_dompet = @mysqli_query($koneksi, "SELECT 1 FROM `dompet` LIMIT 1");
if (!$table_check_dompet) {
    $sql_table_dompet = "CREATE TABLE IF NOT EXISTS `dompet` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `nama` VARCHAR(100) NOT NULL UNIQUE,
      `saldo_awal` INT(11) NOT NULL DEFAULT 0,
      `nama_rekening` VARCHAR(100) NOT NULL DEFAULT '-',
      `no_rekening` VARCHAR(50) NOT NULL DEFAULT '-',
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_dompet);

    // Isi Default Dompet/Rekening
    $sql_insert_default_dompet = "INSERT INTO `dompet` (`nama`, `saldo_awal`, `nama_rekening`, `no_rekening`) VALUES
    ('Tunai', 1000000, '-', '-'),
    ('Bank BCA', 5000000, 'Dosen Komputer', '1234567890'),
    ('Gopay', 250000, 'Dosen Komputer', '081234567890'),
    ('OVO', 100000, 'Dosen Komputer', '081234567890')
    ON DUPLICATE KEY UPDATE nama=nama;";
    @mysqli_query($koneksi, $sql_insert_default_dompet);
}

// 9a2. Pastikan kolom nama_rekening ada di tabel dompet
$col_check_nama_rek = @mysqli_query($koneksi, "SHOW COLUMNS FROM `dompet` LIKE 'nama_rekening'");
if ($col_check_nama_rek && mysqli_num_rows($col_check_nama_rek) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `dompet` ADD COLUMN `nama_rekening` VARCHAR(100) NOT NULL DEFAULT '-'");
}

// 9a3. Pastikan kolom no_rekening ada di tabel dompet
$col_check_no_rek = @mysqli_query($koneksi, "SHOW COLUMNS FROM `dompet` LIKE 'no_rekening'");
if ($col_check_no_rek && mysqli_num_rows($col_check_no_rek) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `dompet` ADD COLUMN `no_rekening` VARCHAR(50) NOT NULL DEFAULT '-'");
}

// 9b. Pastikan kolom dompet ada di tabel transaksi
$col_check_dompet = @mysqli_query($koneksi, "SHOW COLUMNS FROM `transaksi` LIKE 'dompet'");
if ($col_check_dompet && mysqli_num_rows($col_check_dompet) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `transaksi` ADD COLUMN `dompet` VARCHAR(100) NOT NULL DEFAULT 'Tunai'");
}

// 9c. Pastikan kolom username ada di tabel transaksi
$col_check_username = @mysqli_query($koneksi, "SHOW COLUMNS FROM `transaksi` LIKE 'username'");
if ($col_check_username && mysqli_num_rows($col_check_username) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `transaksi` ADD COLUMN `username` VARCHAR(50) NOT NULL DEFAULT 'admin'");
}

// 9d. Pastikan kolom lang ada di tabel users
$col_check_lang = @mysqli_query($koneksi, "SHOW COLUMNS FROM `users` LIKE 'lang'");
if ($col_check_lang && mysqli_num_rows($col_check_lang) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE `users` ADD COLUMN `lang` VARCHAR(10) NOT NULL DEFAULT 'id'");
}

// 9e. Pastikan tabel peran ada di database untuk dynamic roles
$table_check_peran = @mysqli_query($koneksi, "SELECT 1 FROM `peran` LIMIT 1");
if (!$table_check_peran) {
    $sql_table_peran = "CREATE TABLE IF NOT EXISTS `peran` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `role_key` VARCHAR(50) NOT NULL UNIQUE,
      `role_name` VARCHAR(100) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_peran);
    
    // Seed peran default
    @mysqli_query($koneksi, "INSERT IGNORE INTO `peran` (`role_key`, `role_name`) VALUES 
    ('superadmin', 'Superadmin'),
    ('admin', 'Admin'),
    ('user', 'User')");
}

// Ambil Pengaturan Sistem Global
$sys_settings = [];
$res_sys = @mysqli_query($koneksi, "SELECT * FROM `pengaturan_sistem`");
if ($res_sys && mysqli_num_rows($res_sys) > 0) {
    while ($row = mysqli_fetch_assoc($res_sys)) {
        $sys_settings[$row['kunci']] = $row['nilai'];
    }
}

// Global Variables
$app_name = !empty($sys_settings['nama_aplikasi']) ? $sys_settings['nama_aplikasi'] : 'KeuanganKu';
$app_logo_icon = !empty($sys_settings['logo_icon']) ? $sys_settings['logo_icon'] : 'bi-wallet2';
$app_logo_image_url = !empty($sys_settings['logo_image_url']) ? $sys_settings['logo_image_url'] : '';
$app_favicon = !empty($sys_settings['app_favicon_url']) ? $sys_settings['app_favicon_url'] : 'https://cdn-icons-png.flaticon.com/512/2920/2920083.png';
$app_footer = !empty($sys_settings['app_footer']) ? $sys_settings['app_footer'] : 'Sistem Catatan Keuangan Native PHP & MySQL &copy; ' . date('Y');
$app_version = !empty($sys_settings['app_version']) ? $sys_settings['app_version'] : 'v1.3 - Pro';
$login_version = !empty($sys_settings['login_version']) ? $sys_settings['login_version'] : 'v1.4 SECURE';

$login_title = !empty($sys_settings['login_title']) ? $sys_settings['login_title'] : 'Selamat Datang';
$login_subtitle = !empty($sys_settings['login_subtitle']) ? $sys_settings['login_subtitle'] : 'Kelola arus kas & laporan keuangan secara aman dan praktis.';
$login_slogan_1 = !empty($sys_settings['login_slogan_1']) ? $sys_settings['login_slogan_1'] : 'Pantau Finansial';
$login_slogan_2 = !empty($sys_settings['login_slogan_2']) ? $sys_settings['login_slogan_2'] : 'Makin Mudah & Terukur.';
$login_desc = !empty($sys_settings['login_desc']) ? $sys_settings['login_desc'] : 'Solusi pencatatan arus kas pribadi maupun bisnis UMKM Anda. Dilengkapi pelaporan otomatis, grafik interaktif, pembukuan rekening dompet, dan pengelolaan anggaran bulanan.';
$login_badge_title = !empty($sys_settings['login_badge_title']) ? $sys_settings['login_badge_title'] : 'Sistem Keamanan Tinggi';
$login_badge_desc = !empty($sys_settings['login_badge_desc']) ? $sys_settings['login_badge_desc'] : 'Prepared Statements & Bcrypt Protected';

$login_grad_start = !empty($sys_settings['login_grad_start']) ? $sys_settings['login_grad_start'] : '#064e3b';
$login_grad_mid = !empty($sys_settings['login_grad_mid']) ? $sys_settings['login_grad_mid'] : '#022c22';
$login_grad_end = !empty($sys_settings['login_grad_end']) ? $sys_settings['login_grad_end'] : '#081d33';
$login_accent_color = !empty($sys_settings['login_accent_color']) ? $sys_settings['login_accent_color'] : '#059669';
$login_hover_color = !empty($sys_settings['login_hover_color']) ? $sys_settings['login_hover_color'] : '#047857';

// Global Formatting Helper as requested to prevent fatal errors
if (!function_exists('rupiah')) {
    function rupiah($angka) {
        return 'Rp ' . number_format((float)$angka, 0, ',', '.');
    }
}

// Global Translation Helper
if (!function_exists('__')) {
    function __($id_text, $en_text = '') {
        $lang = $_SESSION['lang'] ?? 'id';
        return ($lang === 'id' || empty($en_text)) ? $id_text : $en_text;
    }
}

// Global Role Menu Permission Helper
if (!function_exists('has_menu_permission')) {
    function has_menu_permission($role, $menu) {
        global $sys_settings;
        $role = strtolower(trim($role));
        
        // Selalu izinkan superadmin ke pengaturan dan kelola_user untuk menghindari lockout tidak sengaja
        if ($role === 'superadmin' && in_array($menu, ['pengaturan', 'kelola_user'])) {
            return true;
        }
        
        $key = "perm_" . $role . "_" . $menu;
        if (isset($sys_settings[$key])) {
            return $sys_settings[$key] === '1';
        }
        
        // Pilihan Izin Default jika belum diatur di database
        $defaults = [
            'superadmin' => [
                'dashboard' => true,
                'transaksi' => true,
                'laporan' => true,
                'anggaran' => true,
                'rekening' => true,
                'kategori' => true,
                'kelola_user' => true,
                'pengaturan' => true
            ],
            'admin' => [
                'dashboard' => true,
                'transaksi' => true,
                'laporan' => true,
                'anggaran' => true,
                'rekening' => true,
                'kategori' => true,
                'kelola_user' => false,
                'pengaturan' => true
            ],
            'user' => [
                'dashboard' => true,
                'transaksi' => true,
                'laporan' => true,
                'anggaran' => true,
                'rekening' => true,
                'kategori' => false,
                'kelola_user' => false,
                'pengaturan' => true
            ]
        ];
        
        return $defaults[$role][$menu] ?? false;
    }
}
?>