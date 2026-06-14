// php-templates.ts
// Dynamic PHP template engine to generate custom and clean source codes

import { DbConfig } from './types';

export function getKoneksiCode(config: DbConfig): string {
  const dbName = config.name || 'keuangan_db';
  return `<?php
// koneksi.php
// Konfigurasi koneksi database untuk cPanel / Shared Hosting maupun Localhost
// Dilengkapi dengan sistem Auto-Installer pintar untuk uji coba lokal (XAMPP / Laragon)

$db_host = "${config.host || 'localhost'}";
$db_user = "${config.user || 'root'}";       // Default XAMPP: root
$db_pass = "${config.pass || ''}";           // Default XAMPP: kosong ""
$db_name = "${dbName}";

// Nonaktifkan mysqli reporting exception default agar kita bisa handle error secara visual & elegan
mysqli_report(MYSQLI_REPORT_OFF);

// Mencoba koneksi ke server MySQL tanpa memilih database terlebih dahulu
$koneksi = @mysqli_connect($db_host, $db_user, $db_pass);

if (!$koneksi) {
    // Jika koneksi ke server MySQL gagal (misal XAMPP belum aktif)
    \$error_detail = mysqli_connect_error();
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
            <strong>Detail Masalah:</strong> \' . htmlspecialchars(\$error_detail) . \'
        </div>
        
        <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 16px; font-weight: 600;">Langkah Solusi untuk XAMPP:</h3>
        <ol style="color: #4b5563; font-size: 14.5px; line-height: 1.6; padding-left: 20px; margin-bottom: 25px;">
            <li style="margin-bottom: 8px;">Pastikan aplikasi <strong>XAMPP Control Panel</strong> Anda sudah dibuka.</li>
            <li style="margin-bottom: 8px;">Klik tombol <strong>Start</strong> di samping modul <strong>Apache</strong> dan <strong>MySQL</strong> hingga berwarna hijau.</li>
            <li style="margin-bottom: 8px;">Buka file <code>koneksi.php</code> dan pastikan kredensial di bawah sudah cocok:
                <ul style="padding-left: 20px; margin-top: 5px; list-style-type: circle;">
                    <li><code>\$db_host = "\' . htmlspecialchars(\$db_host) . \'";</code></li>
                    <li><code>\$db_user = "\' . htmlspecialchars(\$db_user) . \'";</code></li>
                    <li><code>\$db_pass = "\' . htmlspecialchars(\$db_pass) . \'";</code></li>
                </ul>
            </li>
        </ol>
        
        <button onclick="window.location.reload()" style="background-color: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">
            Segarkan Halaman & Hubungkan Kembali
        </button>
    </div>\');
}

// Atur Charset Koneksi ke UTF-8
mysqli_set_charset($koneksi, "utf8mb4");

// Coba pilih database. Jika belum ada, lakukan Auto-Installation database & tabel pintar
$db_check = @mysqli_select_db($koneksi, $db_name);

if (!$db_check) {
    // Database tidak ditemukan! Kita coba buat secara otomatis agar mempermudah pengguna XAMPP
    $sql_create_db = "CREATE DATABASE IF NOT EXISTS \`$db_name\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
    
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
$table_check_users = @mysqli_query($koneksi, "SELECT 1 FROM \`users\` LIMIT 1");
if (!$table_check_users) {
    // 1. Buat Tabel Users
    $sql_table_users = "CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`username\` VARCHAR(50) NOT NULL UNIQUE,
      \`password\` VARCHAR(255) NOT NULL,
      \`nama\` VARCHAR(100) NOT NULL,
      \`role\` VARCHAR(20) NOT NULL DEFAULT 'admin',
      \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending',
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_users);

    // 2. Isi Akun Default (Dihapus agar pendaftar pertama menjadi Super Admin)
    // database dimulai dalam kondisi bersih tanpa data user bawaan agar pengisian mandiri dapat berjalan.
} else {
    // Jalankan auto-migration: pastikan kolom 'status' ada di tabel users
    $status_col_check = @mysqli_query($koneksi, "SHOW COLUMNS FROM \`users\` LIKE 'status'");
    if ($status_col_check && mysqli_num_rows($status_col_check) == 0) {
        @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending'");
    }
}

$table_check_transaksi = @mysqli_query($koneksi, "SELECT 1 FROM \`transaksi\` LIMIT 1");
if (!$table_check_transaksi) {
    // 3. Buat Tabel Transaksi
    $sql_table_transaksi = "CREATE TABLE IF NOT EXISTS \`transaksi\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`tanggal\` DATE NOT NULL,
      \`keterangan\` VARCHAR(255) NOT NULL,
      \`kategori\` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
      \`jenis\` ENUM('pemasukan','pengeluaran') NOT NULL,
      \`jumlah\` INT(11) NOT NULL,
      \`dompet\` VARCHAR(100) NOT NULL DEFAULT 'Tunai',
      \`username\` VARCHAR(50) NOT NULL DEFAULT 'admin',
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_transaksi);

    // 4. Isi Data Transaksi Bawaan
    $sql_insert_dummy_transaksi = "INSERT INTO \`transaksi\` (\`id\`, \`tanggal\`, \`keterangan\`, \`kategori\`, \`jenis\`, \`jumlah\`, \`dompet\`) VALUES
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
$col_check_theme = @mysqli_query($koneksi, "SHOW COLUMNS FROM \`users\` LIKE 'theme'");
if ($col_check_theme && mysqli_num_rows($col_check_theme) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`theme\` VARCHAR(30) NOT NULL DEFAULT 'slate'");
}

// 5b. Pastikan kolom konfigurasi dashboard ada di tabel users
$col_check_dashboard = @mysqli_query($koneksi, "SHOW COLUMNS FROM \`users\` LIKE 'show_card_in'");
if ($col_check_dashboard && mysqli_num_rows($col_check_dashboard) == 0) {
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_card_in\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_card_out\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_card_balance\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_chart_trend\` INT(1) NOT NULL DEFAULT 1");
    @mysqli_query($koneksi, "ALTER TABLE \`users\` ADD COLUMN \`show_chart_prop\` INT(1) NOT NULL DEFAULT 1");
}

// 6. Pastikan tabel kategori transaksi ada
$table_check_kategori = @mysqli_query($koneksi, "SELECT 1 FROM \`kategori\` LIMIT 1");
if (!$table_check_kategori) {
    $sql_table_kategori = "CREATE TABLE IF NOT EXISTS \`kategori\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`nama\` VARCHAR(100) NOT NULL UNIQUE,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query($koneksi, $sql_table_kategori);

    // Isi Default Kategori
    $sql_insert_default_kategori = "INSERT INTO \`kategori\` (\`nama\`) VALUES
    ('Gaji'),
    ('Belanja'),
    ('Transportasi'),
    ('Makan & Minum'),
    ('Tagihan'),
    ('Freelance'),
    ('Lainnya')
    ON DUPLICATE KEY UPDATE nama=nama;";
    @mysqli_query(\$koneksi, \$sql_insert_default_kategori);
}

// 7. Pastikan tabel pengaturan_sistem ada
\$table_check_settings = @mysqli_query(\$koneksi, "SELECT 1 FROM \`pengaturan_sistem\` LIMIT 1");
if (!\$table_check_settings) {
    \$sql_table_settings = "CREATE TABLE IF NOT EXISTS \`pengaturan_sistem\` (
      \`kunci\` VARCHAR(50) NOT NULL UNIQUE,
      \`nilai\` TEXT NOT NULL,
      PRIMARY KEY (\`kunci\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query(\$koneksi, \$sql_table_settings);

    // Isi Default Pengaturan Sistem
    @mysqli_query(\$koneksi, "INSERT IGNORE INTO \`pengaturan_sistem\` (\`kunci\`, \`nilai\`) VALUES
    (\'nama_aplikasi\', \'KeuanganKu\'),
    (\'logo_icon\', \'bi-wallet2\'),
    (\'logo_image_url\', \'\'),
    (\'app_favicon_url\', \'https://cdn-icons-png.flaticon.com/512/2920/2920083.png\'),
    (\'app_footer\', \'\'),
    (\'print_header_title\', \'LAPORAN CATATAN TRANSAKSI KEUANGAN\'),
    (\'print_header_subtitle\', \'\'),
    (\'print_header_logo\', \'0\'),
    (\'print_header_color\', \'#0f172a\'),
    (\'print_divider_style\', \'double\'),
    (\'print_footer_note\', \'\')");
}

// 8. Pastikan tabel transaksi_berulang ada
\$table_check_berulang = @mysqli_query(\$koneksi, "SELECT 1 FROM \`transaksi_berulang\` LIMIT 1");
if (!\$table_check_berulang) {
    \$sql_table_berulang = "CREATE TABLE IF NOT EXISTS \`transaksi_berulang\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`keterangan\` VARCHAR(255) NOT NULL,
      \`kategori\` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
      \`jenis\` ENUM('pemasukan','pengeluaran') NOT NULL,
      \`jumlah\` INT(11) NOT NULL,
      \`frekuensi\` VARCHAR(50) NOT NULL DEFAULT 'Bulanan',
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query(\$koneksi, \$sql_table_berulang);

    // Isi Default Transaksi Berulang
    @mysqli_query(\$koneksi, "INSERT INTO \`transaksi_berulang\` (\`id\`, \`keterangan\`, \`kategori\`, \`jenis\`, \`jumlah\`, \`frekuensi\`) VALUES
    (1, 'Sewa VPS Cloud Run Pro', 'Tagihan', 'pengeluaran', 120000, 'Bulanan'),
    (2, 'Langganan Internet Biznet', 'Tagihan', 'pengeluaran', 350000, 'Bulanan'),
    (3, 'Penghasilan Google AdSense', 'Freelance', 'pemasukan', 2400000, 'Bulanan'),
    (4, 'Gaji Pokok Karyawan Tetap', 'Gaji', 'pemasukan', 5500000, 'Bulanan')
    ON DUPLICATE KEY UPDATE id=id;");
}

// 9. Pastikan tabel dompet (Multi-Wallet Management) ada
\$table_check_dompet = @mysqli_query(\$koneksi, "SELECT 1 FROM \`dompet\` LIMIT 1");
if (!\$table_check_dompet) {
    \$sql_table_dompet = "CREATE TABLE IF NOT EXISTS \`dompet\` (
      \`id\` INT(11) NOT NULL AUTO_INCREMENT,
      \`nama\` VARCHAR(100) NOT NULL UNIQUE,
      \`saldo_awal\` INT(11) NOT NULL DEFAULT 0,
      \`nama_rekening\` VARCHAR(100) NOT NULL DEFAULT '-',
      \`no_rekening\` VARCHAR(50) NOT NULL DEFAULT '-',
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";
    @mysqli_query(\$koneksi, \$sql_table_dompet);

    // Isi Default Dompet/Rekening
    \$sql_insert_default_dompet = "INSERT INTO \`dompet\` (\`nama\`, \`saldo_awal\`, \`nama_rekening\`, \`no_rekening\`) VALUES
    (\'Tunai\', 1000000, \'-\', \'-\'),
    (\'Bank BCA\', 5000000, \'Dosen Komputer\', \'1234567890\'),
    (\'Gopay\', 250000, \'Dosen Komputer\', \'081234567890\'),
    (\'OVO\', 100000, \'Dosen Komputer\', \'081234567890\')
    ON DUPLICATE KEY UPDATE nama=nama;";
    @mysqli_query(\$koneksi, \$sql_insert_default_dompet);
}

// 9a2. Pastikan kolom nama_rekening ada di tabel dompet
\$col_check_nama_rek = @mysqli_query(\$koneksi, "SHOW COLUMNS FROM \`dompet\` LIKE 'nama_rekening'");
if (\$col_check_nama_rek && mysqli_num_rows(\$col_check_nama_rek) == 0) {
    @mysqli_query(\$koneksi, "ALTER TABLE \`dompet\` ADD COLUMN \`nama_rekening\` VARCHAR(100) NOT NULL DEFAULT '-'");
}

// 9a3. Pastikan kolom no_rekening ada di tabel dompet
\$col_check_no_rek = @mysqli_query(\$koneksi, "SHOW COLUMNS FROM \`dompet\` LIKE 'no_rekening'");
if (\$col_check_no_rek && mysqli_num_rows(\$col_check_no_rek) == 0) {
    @mysqli_query(\$koneksi, "ALTER TABLE \`dompet\` ADD COLUMN \`no_rekening\` VARCHAR(50) NOT NULL DEFAULT '-'");
}

// 9b. Pastikan kolom dompet ada di tabel transaksi
\$col_check_dompet = @mysqli_query(\$koneksi, "SHOW COLUMNS FROM \`transaksi\` LIKE 'dompet'");
if (\$col_check_dompet && mysqli_num_rows(\$col_check_dompet) == 0) {
    @mysqli_query(\$koneksi, "ALTER TABLE \`transaksi\` ADD COLUMN \`dompet\` VARCHAR(100) NOT NULL DEFAULT 'Tunai'");
}

// 9c. Pastikan kolom username ada di tabel transaksi
\$col_check_username = @mysqli_query(\$koneksi, "SHOW COLUMNS FROM \`transaksi\` LIKE 'username'");
if (\$col_check_username && mysqli_num_rows(\$col_check_username) == 0) {
    @mysqli_query(\$koneksi, "ALTER TABLE \`transaksi\` ADD COLUMN \`username\` VARCHAR(50) NOT NULL DEFAULT 'admin'");
}

// 9d. Pastikan kolom lang ada di tabel users
\$col_check_lang = @mysqli_query(\$koneksi, "SHOW COLUMNS FROM \`users\` LIKE 'lang'");
if (\$col_check_lang && mysqli_num_rows(\$col_check_lang) == 0) {
    @mysqli_query(\$koneksi, "ALTER TABLE \`users\` ADD COLUMN \`lang\` VARCHAR(10) NOT NULL DEFAULT 'id'");
}

// Ambil Pengaturan Sistem Global
\$sys_settings = [];
\$res_sys = @mysqli_query(\$koneksi, "SELECT * FROM \`pengaturan_sistem\`");
if (\$res_sys && mysqli_num_rows(\$res_sys) > 0) {
    while (\$row = mysqli_fetch_assoc(\$res_sys)) {
        \$sys_settings[\$row[\'kunci\']] = \$row[\'nilai\'];
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

$print_header_title = !empty($sys_settings['print_header_title']) ? $sys_settings['print_header_title'] : 'LAPORAN CATATAN TRANSAKSI KEUANGAN';
$print_header_subtitle = !empty($sys_settings['print_header_subtitle']) ? $sys_settings['print_header_subtitle'] : '';
$print_header_logo = isset($sys_settings['print_header_logo']) ? $sys_settings['print_header_logo'] : '0';
$print_header_color = !empty($sys_settings['print_header_color']) ? $sys_settings['print_header_color'] : '#0f172a';
$print_divider_style = !empty($sys_settings['print_divider_style']) ? $sys_settings['print_divider_style'] : 'double';
$print_footer_note = !empty($sys_settings['print_footer_note']) ? $sys_settings['print_footer_note'] : '';

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
if (!function_exists(\'rupiah\')) {
    function rupiah(\$angka) {
        return \'Rp \' . number_format((float)\$angka, 0, \',\', \'.\');
    }
}

// Global Translation Helper
if (!function_exists(\'__\')) {
    function __(\$id_text, \$en_text = \'\') {
        \$lang = \$_SESSION[\'lang\'] ?? \'id\';
        return (\$lang === \'id\' || empty(\$en_text)) ? \$id_text : \$en_text;
    }
}

// Global Role Menu Permission Helper
if (!function_exists(\'has_menu_permission\')) {
    function has_menu_permission(\$role, \$menu) {
        global \$sys_settings;
        
        // Selalu izinkan superadmin ke pengaturan dan kelola_user untuk menghindari lockout tidak sengaja
        if (\$role === \'superadmin\' && in_array(\$menu, [\'pengaturan\', \'kelola_user\'])) {
            return true;
        }
        
        \$key = "perm_" . \$role . "_" . \$menu;
        if (isset(\$sys_settings[\$key])) {
            return \$sys_settings[\$key] === \'1\';
        }
        
        // Pilihan Izin Default jika belum diatur di database
        \$defaults = [
            \'superadmin\' => [
                \'dashboard\' => true,
                \'transaksi\' => true,
                \'laporan\' => true,
                \'anggaran\' => true,
                \'rekening\' => true,
                \'kategori\' => true,
                \'kelola_user\' => true,
                \'pengaturan\' => true
            ],
            \'admin\' => [
                \'dashboard\' => true,
                \'transaksi\' => true,
                \'laporan\' => true,
                \'anggaran\' => true,
                \'rekening\' => true,
                \'kategori\' => true,
                \'kelola_user\' => false,
                \'pengaturan\' => true
            ],
            \'user\' => [
                \'dashboard\' => true,
                \'transaksi\' => true,
                \'laporan\' => true,
                \'anggaran\' => true,
                \'rekening\' => true,
                \'kategori\' => false,
                \'kelola_user\' => false,
                \'pengaturan\' => true
            ]
        ];
        
        return \$defaults[\$role][\$menu] ?? false;
    }
}
?>`;
}

export function getSqlSchema(config: DbConfig): string {
  const dbName = config.name || 'keuangan_db';
  return `-- db.sql
-- Script SQL Pembuatan Database, Tabel Pengguna (Login) & Tabel Transaksi Keuangan

-- Buat database jika dijalankan di localhost (Di cPanel biasanya database dibuat manual lewat menu 'MySQL Database Wizard' lalu jalankan script ini)
CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE \`${dbName}\`;

-- Struktur Tabel users untuk Pengamanan Login
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama\` VARCHAR(100) NOT NULL,
  \`role\` VARCHAR(20) NOT NULL DEFAULT 'admin',
  \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending',
  \`theme\` VARCHAR(30) NOT NULL DEFAULT 'slate',
  \`lang\` VARCHAR(10) NOT NULL DEFAULT 'id',
  \`show_card_in\` INT(1) NOT NULL DEFAULT 1,
  \`show_card_out\` INT(1) NOT NULL DEFAULT 1,
  \`show_card_balance\` INT(1) NOT NULL DEFAULT 1,
  \`show_chart_trend\` INT(1) NOT NULL DEFAULT 1,
  \`show_chart_prop\` INT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Database dimulai dalam kondisi bersih tanpa data bawaan agar pendaftar pertama otomatis menjadi Super Admin (ACC).

-- Struktur Tabel Kategori Transaksi
CREATE TABLE IF NOT EXISTS \`kategori\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Isi Default Kategori
INSERT INTO \`kategori\` (\`id\`, \`nama\`) VALUES
(1, 'Gaji'),
(2, 'Belanja'),
(3, 'Transportasi'),
(4, 'Makan & Minum'),
(5, 'Tagihan'),
(6, 'Freelance'),
(7, 'Lainnya')
ON DUPLICATE KEY UPDATE nama=nama;

-- Struktur Tabel transaksi
CREATE TABLE IF NOT EXISTS \`transaksi\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`tanggal\` DATE NOT NULL,
  \`keterangan\` VARCHAR(255) NOT NULL,
  \`kategori\` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
  \`jenis\` ENUM('pemasukan','pengeluaran') NOT NULL,
  \`jumlah\` INT(11) NOT NULL,
  \`dompet\` VARCHAR(100) NOT NULL DEFAULT 'Tunai',
  \`username\` VARCHAR(50) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Dummy Awal
INSERT INTO \`transaksi\` (\`id\`, \`tanggal\`, \`keterangan\`, \`kategori\`, \`jenis\`, \`jumlah\`, \`dompet\`, \`username\`) VALUES
(1, '2026-06-01', 'Gaji Bulanan Utama', 'Gaji', 'pemasukan', 5000000, 'Bank BCA', 'admin'),
(2, '2026-06-02', 'Membeli Hosting & Domain CPanel', 'Tagihan', 'pengeluaran', 250000, 'Bank BCA', 'admin'),
(3, '2026-06-03', 'Projek Pembuatan Jasa Website UMKM', 'Freelance', 'pemasukan', 1750000, 'Gopay', 'admin'),
(4, '2026-06-05', 'Membayar Tagihan Listrik Bulanan', 'Tagihan', 'pengeluaran', 190000, 'Tunai', 'admin'),
(5, '2026-06-06', 'Membeli Buku Panduan Pemrograman PHP', 'Belanja', 'pengeluaran', 95000, 'OVO', 'admin'),
(6, '2026-06-08', 'Menerima Komisi Afiliasi Landing Page', 'Freelance', 'pemasukan', 600000, 'Gopay', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Struktur Tabel dompet (Multi-Wallet Management)
CREATE TABLE IF NOT EXISTS \`dompet\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`nama\` VARCHAR(100) NOT NULL UNIQUE,
  \`saldo_awal\` INT(11) NOT NULL DEFAULT 0,
  \`nama_rekening\` VARCHAR(100) NOT NULL DEFAULT '-',
  \`no_rekening\` VARCHAR(50) NOT NULL DEFAULT '-',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Isi Default Dompet/Rekening
INSERT INTO \`dompet\` (\`id\`, \`nama\`, \`saldo_awal\`, \`nama_rekening\`, \`no_rekening\`) VALUES
(1, 'Tunai', 1000000, '-', '-'),
(2, 'Bank BCA', 5000000, 'Dosen Komputer', '1234567890'),
(3, 'Gopay', 250000, 'Dosen Komputer', '081234567890'),
(4, 'OVO', 100000, 'Dosen Komputer', '081234567890')
ON DUPLICATE KEY UPDATE nama=nama;

-- Struktur Tabel anggaran (Limit Kategori Transaksi)
CREATE TABLE IF NOT EXISTS \`anggaran\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`kategori\` VARCHAR(100) NOT NULL UNIQUE,
  \`limit_bulanan\` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Limit Default
INSERT INTO \`anggaran\` (\`kategori\`, \`limit_bulanan\`) VALUES
('Belanja', 3000000),
('Transportasi', 1000000),
('Makan & Minum', 2000000),
('Tagihan', 1500000),
('Lainnya', 500000)
ON DUPLICATE KEY UPDATE \`limit_bulanan\`=VALUES(\`limit_bulanan\`);

-- Struktur Tabel pengaturan_sistem
CREATE TABLE IF NOT EXISTS \`pengaturan_sistem\` (
  \`kunci\` VARCHAR(50) NOT NULL UNIQUE,
  \`nilai\` TEXT NOT NULL,
  PRIMARY KEY (\`kunci\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Isi Default Pengaturan Sistem
INSERT INTO \`pengaturan_sistem\` (\`kunci\`, \`nilai\`) VALUES
('nama_aplikasi', 'KeuanganKu'),
('logo_icon', 'bi-wallet2'),
('logo_image_url', ''),
('app_favicon_url', 'https://cdn-icons-png.flaticon.com/512/2920/2920083.png'),
('app_footer', ''),
('print_header_title', 'LAPORAN CATATAN TRANSAKSI KEUANGAN'),
('print_header_subtitle', ''),
('print_header_logo', '0'),
('print_header_color', '#0f172a'),
('print_divider_style', 'double'),
('print_footer_note', '')
ON DUPLICATE KEY UPDATE nilai=nilai;
`;
}

export const INDEX_PHP = `<?php
// index.php
// Halaman dashboard utama dengan proteksi session login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Fungsi Helper format mata uang Rupiah
function rupiah($angka) {
    return "Rp " . number_format($angka, 0, ',', '.');
}

$user_role = $_SESSION['role'] ?? 'admin';
$user_username = $_SESSION['username'] ?? 'user';

// Ambil Filter Bulan & Tahun Aktif
$selected_month = isset($_GET['filter_month']) && $_GET['filter_month'] !== 'all' ? (int)$_GET['filter_month'] : 'all';
$selected_year = isset($_GET['filter_year']) ? (int)$_GET['filter_year'] : (int)date('Y');

// PROSES SINKRONISASI DATABASE (TRANSAKSI BERULANG)
$sync_msg = '';
if (isset($_GET['sync']) && $_GET['sync'] === '1') {
    $berulang_q = mysqli_query($koneksi, "SELECT * FROM transaksi_berulang");
    $sync_count = 0;
    if ($berulang_q) {
        while ($b_row = mysqli_fetch_assoc($berulang_q)) {
            $desc = mysqli_real_escape_string($koneksi, $b_row['keterangan']);
            $cat = mysqli_real_escape_string($koneksi, $b_row['kategori']);
            $type = mysqli_real_escape_string($koneksi, $b_row['jenis']);
            $amount = intval($b_row['jumlah']);
            
            // Cek apakah sudah tersinkronisasi bulan ini
            $u_filter = ($user_role === 'user') ? "AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'" : "";
            $check_exist = mysqli_query($koneksi, "
                SELECT 1 FROM transaksi 
                WHERE keterangan='$desc' 
                  AND jenis='$type' 
                  AND jumlah=$amount 
                  AND MONTH(tanggal) = MONTH(CURRENT_DATE())
                  AND YEAR(tanggal) = YEAR(CURRENT_DATE())
                  $u_filter
                LIMIT 1
            ");
            
            if ($check_exist && mysqli_num_rows($check_exist) == 0) {
                // Insert as new transaction for current date
                $today = date('Y-m-d');
                $def_wallet = 'Tunai';
                $t_user = ($user_role === 'user') ? $user_username : 'admin';
                mysqli_query($koneksi, "
                    INSERT INTO transaksi (tanggal, keterangan, kategori, jenis, jumlah, dompet, username) 
                    VALUES ('$today', '$desc', '$cat', '$type', $amount, '$def_wallet', '$t_user')
                ");
                $sync_count++;
            }
        }
    }
    header("Location: index.php?sync_done=" . $sync_count);
    exit();
}

if (isset($_GET['sync_done'])) {
    $inserted_qty = (int)$_GET['sync_done'];
    if ($inserted_qty > 0) {
        $sync_msg = "Sinkronisasi berhasil! Berhasil mengenerate " . $inserted_qty . " transaksi rutin baru untuk periode ini.";
    } else {
        $sync_msg = "Database sudah sinkron! Tidak ada transaksi rutin baru yang perlu digenerate.";
    }
}

// Ambil kustomisasi dashboard saat ini milik pengguna ini
$show_card_in = 1;
$show_card_out = 1;
$show_card_balance = 1;
$show_chart_trend = 1;
$show_chart_prop = 1;

if (isset($koneksi)) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $config_query = mysqli_query($koneksi, "SELECT show_card_in, show_card_out, show_card_balance, show_chart_trend, show_chart_prop FROM users WHERE username = '$db_username_escaped'");
    if ($config_query && mysqli_num_rows($config_query) > 0) {
        $config_row = mysqli_fetch_assoc($config_query);
        $show_card_in = isset($config_row['show_card_in']) ? (int)$config_row['show_card_in'] : 1;
        $show_card_out = isset($config_row['show_card_out']) ? (int)$config_row['show_card_out'] : 1;
        $show_card_balance = isset($config_row['show_card_balance']) ? (int)$config_row['show_card_balance'] : 1;
        $show_chart_trend = isset($config_row['show_chart_trend']) ? (int)$config_row['show_chart_trend'] : 1;
        $show_chart_prop = isset($config_row['show_chart_prop']) ? (int)$config_row['show_chart_prop'] : 1;
    }
}

// 1. Ambil & hitung total pemasukan
if ($user_role === 'user') {
    $query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'";
} else {
    $query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan'";
}
$res_pemasukan = mysqli_query($koneksi, $query_pemasukan);
$row_pemasukan = mysqli_fetch_assoc($res_pemasukan);
$total_pemasukan = $row_pemasukan['total'] ?? 0;

// 2. Ambil & hitung total pengeluaran
if ($user_role === 'user') {
    $query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'";
} else {
    $query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran'";
}
$res_pengeluaran = mysqli_query($koneksi, $query_pengeluaran);
$row_pengeluaran = mysqli_fetch_assoc($res_pengeluaran);
$total_pengeluaran = $row_pengeluaran['total'] ?? 0;

// 3. Hitung saldo per dompet secara acak & otomatis
$wallets_list = [];
$total_saldo_semua_dompet = 0;
$wl_q = mysqli_query($koneksi, "SELECT * FROM dompet ORDER BY id ASC");
if ($wl_q) {
    while ($w_row = mysqli_fetch_assoc($wl_q)) {
        $w_name = $w_row['nama'];
        $w_initial = intval($w_row['saldo_awal']);
        
        // Hitung total pemasukan ke dompet ini
        if ($user_role === 'user') {
            $in_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'");
        } else {
            $in_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pemasukan' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "'");
        }
        $in_row = mysqli_fetch_assoc($in_q);
        $w_in = $in_row['total'] ?? 0;
        
        // Hitung total pengeluaran dari dompet ini
        if ($user_role === 'user') {
            $out_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "' AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "'");
        } else {
            $out_q = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi WHERE jenis='pengeluaran' AND dompet='" . mysqli_real_escape_string($koneksi, $w_name) . "'");
        }
        $out_row = mysqli_fetch_assoc($out_q);
        $w_out = $out_row['total'] ?? 0;
        
        $current_balance = $w_initial + $w_in - $w_out;
        $total_saldo_semua_dompet += $current_balance;
        
        $wallets_list[] = [
            'id' => $w_row['id'],
            'nama' => $w_name,
            'saldo_awal' => $w_initial,
            'saldo_akhir' => $current_balance
        ];
    }
}
$saldo_akhir = $total_saldo_semua_dompet;

// 4. Ambil daftar transaksi dari database diurutkan dari tanggal terbaru
if ($user_role === 'user') {
    $query_transaksi = "SELECT * FROM transaksi WHERE username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ORDER BY tanggal DESC, id DESC";
} else {
    $query_transaksi = "SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC";
}
$result_transaksi = mysqli_query($koneksi, $query_transaksi);

// 5. Ambil data tren harian untuk grafik (disaring berdasarkan bulan terpilih jika diset)
$chart_dates = [];
$chart_pemasukan = [];
$chart_pengeluaran = [];

$query_chart = "SELECT tanggal, 
                SUM(CASE WHEN jenis='pemasukan' THEN jumlah ELSE 0 END) as total_masuk,
                SUM(CASE WHEN jenis='pengeluaran' THEN jumlah ELSE 0 END) as total_keluar
                FROM transaksi WHERE 1=1 ";
if ($user_role === 'user') {
    $query_chart .= "AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ";
}
if ($selected_month !== 'all') {
    $query_chart .= "AND MONTH(tanggal) = " . (int)$selected_month . " ";
    $query_chart .= "AND YEAR(tanggal) = " . (int)$selected_year . " ";
}
$query_chart .= "GROUP BY tanggal ORDER BY tanggal ASC";
if ($selected_month === 'all') {
    $query_chart .= " LIMIT 10";
}

$res_chart = mysqli_query($koneksi, $query_chart);
if ($res_chart && mysqli_num_rows($res_chart) > 0) {
    while ($row = mysqli_fetch_assoc($res_chart)) {
        $chart_dates[] = date('d M', strtotime($row['tanggal']));
        $chart_pemasukan[] = (int)$row['total_masuk'];
        $chart_pengeluaran[] = (int)$row['total_keluar'];
    }
} else {
    // Fallback data jika kosong
    if ($selected_month !== 'all') {
        // Tampilkan beberapa tanggal acak di bulan terpilih untuk visualisasi kosong yang rapi
        for ($i = 1; $i <= 5; $i++) {
            $formatted_d = sprintf('%04d-%02d-%02d', $selected_year, $selected_month, $i * 5);
            $chart_dates[] = date('d M', strtotime($formatted_d));
            $chart_pemasukan[] = 0;
            $chart_pengeluaran[] = 0;
        }
    } else {
        for ($i = 5; $i >= 0; $i--) {
            $chart_dates[] = date('d M', strtotime("-$i days"));
            $chart_pemasukan[] = 0;
            $chart_pengeluaran[] = 0;
        }
    }
}

// 6. Ambil data kategori untuk grafik donat distribusi (disaring berdasarkan bulan terpilih jika diset)
$category_labels = [];
$category_totals = [];
$query_cat_chart = "SELECT kategori, SUM(jumlah) as total FROM transaksi WHERE 1=1 ";
if ($user_role === 'user') {
    $query_cat_chart .= "AND username='" . mysqli_real_escape_string($koneksi, $user_username) . "' ";
}
if ($selected_month !== 'all') {
    $query_cat_chart .= "AND MONTH(tanggal) = " . (int)$selected_month . " ";
    $query_cat_chart .= "AND YEAR(tanggal) = " . (int)$selected_year . " ";
}
$query_cat_chart .= "GROUP BY kategori ORDER BY total DESC LIMIT 5";
$res_cat_chart = mysqli_query($koneksi, $query_cat_chart);
if ($res_cat_chart && mysqli_num_rows($res_cat_chart) > 0) {
    while ($row = mysqli_fetch_assoc($res_cat_chart)) {
        $category_labels[] = $row['kategori'];
        $category_totals[] = (int)$row['total'];
    }
} else {
    $category_labels = ['Tidak Ada Data'];
    $category_totals = [0];
}

// 7. Cek Peringatan Anggaran (>90% penggunaan)
$current_month = date('m');
$current_year = date('Y');

// Ambil pengeluaran aktual bulan ini per kategori
$spending_actuals = [];
$sp_q = mysqli_query($koneksi, "
    SELECT kategori, SUM(jumlah) AS total_spent 
    FROM transaksi 
    WHERE jenis = 'pengeluaran' 
      AND MONTH(tanggal) = $current_month 
      AND YEAR(tanggal) = $current_year 
    GROUP BY kategori
");
if ($sp_q) {
    while ($row = mysqli_fetch_assoc($sp_q)) {
        $spending_actuals[$row['kategori']] = intval($row['total_spent']);
    }
}

// Ambil semua limit anggaran yang aktif (> 0)
$budget_warnings_to_show = [];
$bg_q = mysqli_query($koneksi, "SELECT kategori, limit_bulanan FROM anggaran WHERE limit_bulanan > 0");
if ($bg_q) {
    while ($row = mysqli_fetch_assoc($bg_q)) {
        $cat = $row['kategori'];
        $limit = intval($row['limit_bulanan']);
        $actual = $spending_actuals[$cat] ?? 0;
        
        $percentage = ($actual / $limit) * 100;
        if ($percentage >= 90) {
            $budget_warnings_to_show[] = [
                'kategori' => $cat,
                'limit' => $limit,
                'actual' => $actual,
                'percentage' => number_format($percentage, 1)
            ];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($app_name); ?> - Dashboard Keuangan</title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Google Fonts Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.04), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
            background: #ffffff;
            border: 1px solid rgba(226, 232, 240, 0.8);
        }
        /* Premium Dual-Tone Gradient Metric Cards with Glass Refraction Matte Shine */
        .gradient-card {
            position: relative;
            border: none !important;
            border-radius: 20px;
            color: #ffffff !important;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background-size: 200% 200%;
        }
        .gradient-card:hover {
            transform: translateY(-6px);
        }
        .gradient-card-info {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            box-shadow: 0 12px 28px -4px rgba(59, 130, 246, 0.35);
        }
        .gradient-card-info:hover {
            box-shadow: 0 20px 38px -5px rgba(59, 130, 246, 0.5);
        }
        .gradient-card-success {
            background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);
            box-shadow: 0 12px 28px -4px rgba(16, 185, 129, 0.35);
        }
        .gradient-card-success:hover {
            box-shadow: 0 20px 38px -5px rgba(16, 185, 129, 0.5);
        }
        .gradient-card-danger {
            background: linear-gradient(135deg, #881337 0%, #f43f5e 100%);
            box-shadow: 0 12px 28px -4px rgba(244, 63, 94, 0.35);
        }
        .gradient-card-danger:hover {
            box-shadow: 0 20px 38px -5px rgba(244, 63, 94, 0.5);
        }
        .gradient-card-primary {
            background: linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%);
            box-shadow: 0 12px 28px -4px rgba(139, 92, 246, 0.35);
        }
        .gradient-card-primary:hover {
            box-shadow: 0 20px 38px -5px rgba(139, 92, 246, 0.5);
        }
        .gradient-card-warning {
            background: linear-gradient(135deg, #78350f 0%, #f59e0b 100%);
            box-shadow: 0 12px 28px -4px rgba(245, 158, 11, 0.35);
        }
        .gradient-card-warning:hover {
            box-shadow: 0 20px 38px -5px rgba(245, 158, 11, 0.5);
        }
        
        .card-pattern {
            position: absolute;
            top: -15px;
            right: -15px;
            width: 110px;
            height: 110px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.75rem;
            transform: rotate(15deg);
            transition: all 0.4s ease;
        }
        .gradient-card:hover .card-pattern {
            transform: rotate(25deg) scale(1.15);
            background: rgba(255, 255, 255, 0.16);
        }
        .gradient-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-25deg);
            transition: none;
        }
        .gradient-card:hover::after {
            left: 150%;
            transition: all 0.85s ease-in-out;
        }
        .text-pemasukan {
            color: #10b981 !important;
        }
        .text-pengeluaran {
            color: #ef4444 !important;
        }
        .btn-add {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: #ffffff;
            border: none;
            font-weight: 600;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
            transition: all 0.2s ease;
        }
        .btn-add:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
            transform: translateY(-1px);
            color: #ffffff;
        }
        .badge-pemasukan {
            background-color: rgba(16, 185, 129, 0.08);
            color: #065f46;
            border: 1px solid rgba(16, 185, 129, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
        .badge-pengeluaran {
            background-color: rgba(239, 68, 68, 0.08);
            color: #991b1b;
            border: 1px solid rgba(239, 68, 68, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }
        .badge-kategori {
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
        }

        /* Modern Table Customization */
        .table-custom {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
        }
        .table-custom thead th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            padding: 14px 16px;
            border-top: none;
            border-bottom: 1.5px solid #e2e8f0;
        }
        .table-custom tbody tr {
            transition: all 0.2s ease;
        }
        .table-custom tbody tr:hover {
            background-color: #fafafa !important;
        }
        .table-custom tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 0.85rem;
        }
        .table-custom tbody tr:last-child td {
            border-bottom: none;
        }
    </style>
</head>
<body>

<?php
$active_page = 'dashboard';
include 'sidebar.php';
?>
<div class="container-fluid py-2">
    
    <!-- Notifikasi Hasil Sinkronisasi Database -->
    <?php if (!empty($sync_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 shadow-xs p-3.5 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
            <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
            <div>
                <strong class="text-success d-block">Sinkronisasi Selesai</strong>
                <span class="small text-slate-700"><?= htmlspecialchars($sync_msg); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <!-- Notifikasi Error/Gagal dari Aksi Halaman Lain -->
    <?php if (isset($_GET['err'])): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 shadow-xs p-3.5 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
            <div>
                <strong class="text-danger d-block">Akses Terbatasi!</strong>
                <span class="small text-slate-700"><?= htmlspecialchars($_GET['err']); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Banner Peringatan Anggaran Bulanan (>90%) -->
    <?php if (!empty($budget_warnings_to_show)): ?>
        <div class="alert alert-danger border-0 rounded-4 shadow-sm p-4 mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.08); border-left: 6px solid #ef4444 !important;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="bg-danger text-white rounded-circle p-2.5 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-exclamation-triangle-fill fs-4"></i>
                    </div>
                </div>
                <div class="col">
                    <h5 class="alert-heading fw-bold mb-1" style="color: #991b1b; font-size: 1.1rem;">
                        <i class="bi bi-shield-fill-exclamation me-1"></i>Peringatan Kuota Anggaran Bulanan Lampaui Batas!
                    </h5>
                    <p class="text-slate-600 mb-0 small" style="line-height: 1.5;">Beberapa kategori transaksi di bawah telah melampaui atau mendekati <strong>90%</strong> dari limit kuota pengeluaran bulanan Anda. Gunakan halaman <strong class="text-indigo-600"><a href="anggaran.php" class="text-indigo-600 text-decoration-underline">Anggaran</a></strong> untuk menyesuaikan.</p>
                </div>
            </div>
            <hr class="my-3 border-danger-subtle" style="opacity: 0.15;">
            <div class="row g-3">
                <?php foreach ($budget_warnings_to_show as $warning): ?>
                    <?php 
                    $is_over = $warning['actual'] >= $warning['limit'];
                    $text_lbl = $is_over ? 'OVER LIMIT' : 'KRITIS (>90%)';
                    $bg_badge = $is_over ? 'bg-danger text-white' : 'bg-warning text-dark';
                    ?>
                    <div class="col-md-6 col-lg-4">
                        <div class="bg-white p-3 rounded-4 border border-danger-subtle h-100 d-flex flex-column justify-content-between">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold text-slate-800 d-block text-truncate" style="font-size: 0.85rem;" title="<?= htmlspecialchars($warning['kategori']); ?>"><?= htmlspecialchars($warning['kategori']); ?></span>
                                <span class="badge <?= $bg_badge; ?> font-monospace" style="font-size: 0.65rem;"><?= $text_lbl; ?></span>
                            </div>
                            <div>
                                <span class="text-muted d-block small mb-1" style="font-size: 0.72rem;">Kuota Terpakai: <span class="fw-bold text-danger"><?= $warning['percentage']; ?>%</span></span>
                                <div class="progress" style="height: 6px; border-radius: 99px; background-color: #f1f5f9;">
                                    <div class="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" style="width: <?= min($warning['percentage'], 100); ?>%"></div>
                                </div>
                                <span class="text-muted d-block mt-2 font-monospace" style="font-size: 0.7rem; font-weight: 500;">
                                    <?= rupiah($warning['actual']); ?> / <?= rupiah($warning['limit']); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>
    
    <!-- Bagian Ringkasan Anggaran Premium -->
    <?php 
    $visible_cards_count = $show_card_in + $show_card_out + $show_card_balance;
    $card_col = 12;
    if ($visible_cards_count == 3) {
        $card_col = 4;
    } elseif ($visible_cards_count == 2) {
        $card_col = 6;
    }
    if ($visible_cards_count > 0): 
    ?>
    <div class="row g-4 mb-4">
        
        <!-- Pemasukan -->
        <?php if ($show_card_in): ?>
        <div class="col-md-<?= $card_col; ?>">
            <div class="card gradient-card gradient-card-success p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-up-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Pemasukan</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pemasukan); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-down-left-circle"></i> Kas Masuk Terakumulasi</p>
                </div>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Pengeluaran -->
        <?php if ($show_card_out): ?>
        <div class="col-md-<?= $card_col; ?>">
            <div class="card gradient-card gradient-card-danger p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-down-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Pengeluaran</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pengeluaran); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-up-right-circle"></i> Kas Keluar Terakumulasi</p>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Saldo Akhir -->
        <?php if ($show_card_balance): ?>
        <div class="col-md-<?= $card_col; ?>">
            <?php 
            $is_surplus = $saldo_akhir >= 0;
            $gradient_class = $is_surplus ? 'gradient-card-primary' : 'gradient-card-warning';
            $icon_class = $is_surplus ? 'bi-stars' : 'bi-exclamation-triangle';
            $status_msg = $is_surplus ? 'Keuangan Sehat & Aman' : 'Keuangan Defisit!';
            ?>
            <div class="card gradient-card <?= $gradient_class; ?> p-4 h-100">
                <div class="card-pattern">
                    <i class="bi <?= $icon_class; ?>"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Saldo Akhir</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($saldo_akhir); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-shield-check"></i> <?= $status_msg; ?></p>
                </div>
            </div>
        </div>
        <?php endif; ?>

    </div>
    <?php endif; ?>

    <!-- SEKTOR DAFTAR DOMPET / REKENING -->
    <div class="row g-3 mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center mb-1">
            <div>
                <h5 class="fw-bold text-slate-800 mb-1"><i class="bi bi-wallet2 text-primary me-2"></i>Status Rekening & Dompet</h5>
                <p class="text-xs text-muted mb-0" style="font-size: 0.72rem;">Monitoring saldo internal secara otomatis terpisah per instrumen simpanan</p>
            </div>
            <a href="rekening.php" class="btn btn-sm btn-outline-primary rounded-3 text-xs font-semibold px-3 py-1.5" style="font-size: 0.72rem;">
                <i class="bi bi-wallet2 me-1"></i> Kelola Dompet
            </a>
        </div>
        
        <?php foreach ($wallets_list as $w): ?>
        <div class="col-6 col-md-3">
            <div class="card border-0 rounded-4 shadow-sm p-3 bg-white" style="border-left: 4px solid #3b82f6 !important; height: 100%;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-slate-700 truncate d-block w-75" style="font-size: 0.8rem;" title="<?= htmlspecialchars($w['nama']); ?>"><?= htmlspecialchars($w['nama']); ?></span>
                    <i class="bi bi-wallet2 text-muted" style="font-size: 0.9rem;"></i>
                </div>
                <div>
                    <span class="text-uppercase font-monospace text-slate-400 d-block" style="font-size: 0.6rem; letter-spacing: 0.05em;">Saldo Aktual</span>
                    <span class="fw-bold text-dark font-monospace" style="font-size: 0.92rem;"><?= rupiah($w['saldo_akhir']); ?></span>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- Panel Visualisasi Grafik Interaktif -->
    <?php if ($show_chart_trend || $show_chart_prop): ?>
    
    <!-- Filter Periodik Grafik Bulanan Kecil -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 bg-white p-3 rounded-4 border border-light-subtle shadow-xs">
        <div class="d-flex align-items-center gap-2">
            <div class="bg-primary-subtle text-primary rounded-3 p-1.5 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                <i class="bi bi-funnel-fill fs-6"></i>
            </div>
            <div>
                <span class="text-xs text-muted d-block" style="font-size: 0.7rem;">FILTRASI DATA</span>
                <span class="fw-bold text-slate-800 text-xs" style="font-size: 0.8rem;">Filter Periode Grafik Utama</span>
            </div>
        </div>
        <form method="GET" action="index.php" class="d-flex align-items-center gap-2" id="chartFilterForm">
            <select name="filter_month" class="form-select form-select-sm border-light-subtle rounded-3 text-xs shadow-xs" style="width: 140px; font-weight: 500; height: 34px;" onchange="this.form.submit()">
                <option value="all" <?= $selected_month === 'all' ? 'selected' : ''; ?>>Semua Bulan</option>
                <?php
                $months_id = [
                    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
                    7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
                ];
                foreach ($months_id as $m_num => $m_name) {
                    $sel = ($selected_month !== 'all' && $selected_month == $m_num) ? 'selected' : '';
                    echo "<option value='$m_num' $sel>$m_name</option>";
                }
                ?>
            </select>
            <select name="filter_year" class="form-select form-select-sm border-light-subtle rounded-3 text-xs shadow-xs" style="width: 85px; font-weight: 500; height: 34px;" onchange="this.form.submit()">
                <?php
                $curr_yr = (int)date('Y');
                for ($y = $curr_yr - 3; $y <= $curr_yr + 2; $y++) {
                    $sel = ($selected_year == $y) ? 'selected' : '';
                    echo "<option value='$y' $sel>$y</option>";
                }
                ?>
            </select>
            <?php if ($selected_month !== 'all'): ?>
                <a href="index.php?filter_month=all" class="btn btn-sm btn-outline-secondary rounded-3 text-xs px-2.5 d-flex align-items-center justify-content-center" style="height: 34px;" title="Reset Filter">
                    <i class="bi bi-x-lg"></i>
                </a>
            <?php endif; ?>
        </form>
    </div>

    <div class="row g-4 mb-4">
        <!-- Grafik Tren Aliran Kas -->
        <?php if ($show_chart_trend): ?>
        <div class="col-lg-<?= $show_chart_prop ? '8' : '12'; ?>">
            <div class="card main-card p-4 h-100">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 class="fw-bold text-slate-800 mb-1">Tren Aliran Dana</h5>
                        <p class="text-muted small mb-0">Statistik real-time pergerakan arus kas harian</p>
                    </div>
                    <a href="index.php?sync=1" class="btn btn-sm btn-light text-secondary border border-light-subtle px-3 py-2 rounded-3 text-xs fw-semibold d-inline-flex align-items-center gap-1.5 transition-all text-decoration-none hover-shadow" style="transition: all 0.2s ease;">
                        <i class="bi bi-arrow-repeat text-primary" style="font-size: 0.95rem;"></i> Sinkron database
                    </a>
                </div>
                <div style="height: 300px; position: relative;">
                    <canvas id="cashflowChart"></canvas>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Grafik Distribusi Kategori -->
        <?php if ($show_chart_prop): ?>
        <div class="col-lg-<?= $show_chart_trend ? '4' : '12'; ?>">
            <div class="card main-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                    <h5 class="fw-bold text-slate-800 mb-1">Proporsi Kategori</h5>
                    <p class="text-muted small mb-3">Distribusi volume dana tertinggi per kategori</p>
                </div>
                <div style="height: 200px; position: relative;" class="d-flex align-items-center justify-content-center">
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="text-center mt-3 pt-3 border-top border-light-subtle">
                    <span class="text-muted small font-monospace"><i class="bi bi-pie-chart-fill text-muted me-1"></i> Top 5 Kategori Aktif</span>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>
    <?php endif; ?>

    <!-- Tabel Riwayat Data Transaksi -->
    <div class="card main-card overflow-hidden">
        <div class="card-header bg-white py-3 border-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center">
                <i class="bi bi-database-check text-primary fs-4 me-2"></i>
                <h5 class="fw-bold mb-0">Riwayat Catatan Transaksi</h5>
            </div>
            <div>
                <a href="tambah.php?add=1" class="btn btn-add rounded-3 px-3.5 py-2 text-xs">
                    <i class="bi bi-plus-circle-fill me-2"></i>Tambah Transaksi
                </a>
            </div>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-custom" style="font-size: 0.85rem;">
                    <thead class="bg-light table-light">
                        <tr>
                            <th class="ps-4 py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 70px;">No</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 140px;">Tanggal</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace">Keterangan</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 135px;">Kategori</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 130px;">Jenis</th>
                            <th class="text-end text-muted text-uppercase fw-bold font-monospace" style="width: 180px; padding-right: 20px;">Nominal</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (mysqli_num_rows($result_transaksi) > 0): ?>
                            <?php 
                            $no = 1;
                            while ($row = mysqli_fetch_assoc($result_transaksi)): 
                            ?>
                                <tr class="border-bottom border-light-subtle">
                                    <td class="ps-4 fw-medium text-muted"><?= $no++; ?></td>
                                    <td>
                                        <div class="fw-semibold">
                                            <?= date('d/m/Y', strtotime($row['tanggal'])); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="fw-semibold text-dark"><?= htmlspecialchars($row['keterangan']); ?></span>
                                    </td>
                                    <td>
                                        <span class="badge badge-kategori"><?= !empty($row['kategori']) ? htmlspecialchars($row['kategori']) : 'Umum'; ?></span>
                                    </td>
                                    <td class="text-center">
                                        <?php if ($row['jenis'] === 'pemasukan'): ?>
                                            <span class="badge badge-pemasukan fw-semibold"><i class="bi bi-arrow-down-left me-1"></i>Pemasukan</span>
                                        <?php else: ?>
                                            <span class="badge badge-pengeluaran fw-semibold"><i class="bi bi-arrow-up-right me-1"></i>Pengeluaran</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end fw-bold font-monospace" style="padding-right: 20px;">
                                        <?php if ($row['jenis'] === 'pemasukan'): ?>
                                            <span class="text-pemasukan">+ <?= rupiah($row['jumlah']); ?></span>
                                        <?php else: ?>
                                            <span class="text-pengeluaran">- <?= rupiah($row['jumlah']); ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-center">
                                        <div class="btn-group gap-1">
                                            <a href="edit.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-primary rounded-2" title="Edit Transaksi">
                                                <i class="bi bi-pencil-square"></i>
                                            </a>
                                            <a href="hapus.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-danger rounded-2" onclick="return confirm('Apakah Anda yakin ingin menghapus transaksi ini?');" title="Hapus Transaksi">
                                                <i class="bi bi-trash"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="bi bi-journals fs-1 mb-3 text-secondary d-block"></i>
                                    <h5>Belum Ada Data Transaksi</h5>
                                    <p class="small text-muted mb-0">Klik tombol "Tambah Transaksi" di atas untuk memasukkan data pertama Anda.</p>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
</div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // 1. Inisialisasi Grafik Aliran Kas (Pemasukan v.s. Pengeluaran)
    const elCashflow = document.getElementById('cashflowChart');
    if (elCashflow) {
        const ctxCashflow = elCashflow.getContext('2d');
        
        // Konversi tanggal, data pemasukan & pengeluaran dari PHP secara aman
        const chartDates = <?= json_encode($chart_dates); ?>;
        const chartPemasukan = <?= json_encode($chart_pemasukan); ?>;
        const chartPengeluaran = <?= json_encode($chart_pengeluaran); ?>;
        
        new Chart(ctxCashflow, {
            type: 'line',
            data: {
                labels: chartDates,
                datasets: [
                    {
                        label: 'Pemasukan',
                        data: chartPemasukan,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        borderWidth: 3.5,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Pengeluaran',
                        data: chartPengeluaran,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        borderWidth: 3.5,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11,
                                weight: '600'
                            },
                            color: '#64748b',
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 15
                        }
                    },
                    tooltip: {
                        padding: 12,
                        backgroundColor: '#1e293b',
                        titleColor: '#fff',
                        titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
                        bodyColor: '#cbd5e1',
                        bodyFont: { family: "'Inter', sans-serif" },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10
                            },
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return 'Rp ' + (value / 1000000).toFixed(1) + ' jt';
                                } else if (value >= 1000) {
                                    return 'Rp ' + (value / 1000) + ' rb';
                                }
                                return 'Rp ' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // 2. Inisialisasi Grafik Distribusi Kategori (Doughnut)
    const elCategory = document.getElementById('categoryChart');
    if (elCategory) {
        const ctxCategory = elCategory.getContext('2d');
        const catLabels = <?= json_encode($category_labels); ?>;
        const catTotals = <?= json_encode($category_totals); ?>;
        
        const paletteTheme = [
            '#2563eb', // Blue
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#8b5cf6'  // Violet
        ];

        new Chart(ctxCategory, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catTotals,
                    backgroundColor: paletteTheme.slice(0, catLabels.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 10,
                                weight: '500'
                            },
                            color: '#64748b',
                            boxWidth: 8,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 10
                        }
                    },
                    tooltip: {
                        padding: 10,
                        backgroundColor: '#1e293b',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                },
                cutout: '68%'
            }
        });
    }
});
</script>
</body>
</html>`;

export const TAMBAH_PHP = `<?php
// tambah.php
// Mengurus penambahan transaksi baru beserta validasi input server-side dengan proteksi login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$error = '';
$filter_jenis = $_GET['filter_jenis'] ?? 'semua';

// Tetapkan detail menu aktif berdasarkan filter_jenis
$active_page = 'transaksi';  // Default menu aktif di sidebar
$header_title = 'Semua Transaksi';
$header_subtitle = 'Kelola rincian mutasi kas masuk dan keluar secara real-time demi akurasi finansial.';

if ($filter_jenis === 'pemasukan') {
    $active_page = 'pemasukan';
    $header_title = 'Daftar Transaksi Pemasukan';
    $header_subtitle = 'Pantau rincian arus kas masuk, gaji, hasil freelance, dan omzet profit bisnis.';
} elseif ($filter_jenis === 'pengeluaran') {
    $active_page = 'pengeluaran';
    $header_title = 'Daftar Transaksi Pengeluaran';
    $header_subtitle = 'Pantau rincian biaya operasional, belanja, konsumsi, tagihan, dan pengeluaran rutin.';
} elseif ($filter_jenis === 'berulang') {
    $active_page = 'transaksi_berulang';
    $header_title = 'Transaksi Berulang / Rutin';
    $header_subtitle = 'Definisikan template transaksi terjadwal otomatis seperti tagihan bulanan atau pemasukan tetap.';
}

// Menangani Tambah Transaksi (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $keterangan = trim($_POST['keterangan']);
    $kategori = trim($_POST['kategori']);
    $jenis = trim($_POST['jenis']);
    $jumlah = trim($_POST['jumlah']);
    
    // Periksa kolom tambahan jika transaksi berulang
    if ($filter_jenis === 'berulang') {
        $frekuensi = trim($_POST['frekuensi'] ?? 'Bulanan');
        
        // Validasi input
        if (empty($keterangan) || empty($kategori) || empty($jenis) || empty($jumlah) || empty($frekuensi)) {
            $error = "Peringatan: Semua data transaksi berulang wajib diisi!";
        } elseif ($jumlah <= 0) {
            $error = "Peringatan: Nominal jumlah harus lebih besar dari Rp 0!";
        } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
            $error = "Peringatan: Tipe transaksi tidak dikenal!";
        } else {
            $jumlah_int = (int)$jumlah;
            
            // Simpan ke tabel transaksi_berulang
            $query_insert = "INSERT INTO transaksi_berulang (keterangan, kategori, jenis, jumlah, frekuensi) VALUES (?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($koneksi, $query_insert);
            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "ssssi", $keterangan, $kategori, $jenis, $jumlah_int, $frekuensi);
                if (mysqli_stmt_execute($stmt)) {
                    mysqli_stmt_close($stmt);
                    header("Location: tambah.php?filter_jenis=berulang&status=success");
                    exit();
                } else {
                    $error = "Gagal memproses transaksi berulang: " . mysqli_stmt_error($stmt);
                }
            } else {
                $error = "Gagal menyusun query transaksi berulang: " . mysqli_error($koneksi);
            }
        }
    } else {
        // Transaksi Reguler
        $tanggal = trim($_POST['tanggal']);
        $dompet = trim($_POST['dompet'] ?? 'Tunai');
        
        // Validasi input
        if (empty($tanggal) || empty($keterangan) || empty($kategori) || empty($jenis) || empty($jumlah)) {
            $error = "Peringatan: Semua data wajib diisi dan tidak boleh dibiarkan kosong!";
        } elseif ($jumlah <= 0) {
            $error = "Peringatan: Nominal jumlah harus lebih besar dari Rp 0!";
        } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
            $error = "Peringatan: Tipe transaksi tidak dikenal!";
        } else {
            $jumlah_int = (int)$jumlah;
            $user_username = $_SESSION['username'] ?? 'admin';
            
            // Simpan ke tabel transaksi reguler dengan username & dompet info
            $query_insert = "INSERT INTO transaksi (tanggal, keterangan, kategori, jenis, jumlah, dompet, username) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($koneksi, $query_insert);
            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "ssssiss", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $dompet, $user_username);
                if (mysqli_stmt_execute($stmt)) {
                    mysqli_stmt_close($stmt);
                    header("Location: tambah.php?filter_jenis=" . urlencode($filter_jenis) . "&status=success");
                    exit();
                } else {
                    $error = "Gagal memproses transaksi reguler: " . mysqli_stmt_error($stmt);
                }
            } else {
                $error = "Gagal menyusun query transaksi reguler: " . mysqli_error($koneksi);
            }
        }
    }
}

$user_role = $_SESSION['role'] ?? 'admin';
$user_username = $_SESSION['username'] ?? 'admin';
$db_username = mysqli_real_escape_string($koneksi, $user_username);

// Ambil data transaksi sesuai filter dan role
if ($filter_jenis === 'berulang') {
    $query_transaksi = "SELECT * FROM transaksi_berulang ORDER BY id DESC";
} elseif ($filter_jenis === 'pemasukan') {
    if ($user_role === 'user') {
        $query_transaksi = "SELECT * FROM transaksi WHERE jenis = 'pemasukan' AND username = '$db_username' ORDER BY tanggal DESC, id DESC";
    } else {
        $query_transaksi = "SELECT * FROM transaksi WHERE jenis = 'pemasukan' ORDER BY tanggal DESC, id DESC";
    }
} elseif ($filter_jenis === 'pengeluaran') {
    if ($user_role === 'user') {
        $query_transaksi = "SELECT * FROM transaksi WHERE jenis = 'pengeluaran' AND username = '$db_username' ORDER BY tanggal DESC, id DESC";
    } else {
        $query_transaksi = "SELECT * FROM transaksi WHERE jenis = 'pengeluaran' ORDER BY tanggal DESC, id DESC";
    }
} else {
    if ($user_role === 'user') {
        $query_transaksi = "SELECT * FROM transaksi WHERE username = '$db_username' ORDER BY tanggal DESC, id DESC";
    } else {
        $query_transaksi = "SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC";
    }
}

$result_transaksi = mysqli_query($koneksi, $query_transaksi);

// Olah data transaksi ke array untuk memudahkan visualisasi dan kalkulasi cepat
$list_transaksi = [];
$total_nominal = 0;
if ($result_transaksi) {
    while ($row = mysqli_fetch_assoc($result_transaksi)) {
        $list_transaksi[] = $row;
        $total_nominal += (int)$row['jumlah'];
    }
}
$total_rows = count($list_transaksi);

// Preservasi value input formulir saat terjadi kesalahan validasi
$val_tanggal = isset($_POST['tanggal']) ? htmlspecialchars($_POST['tanggal']) : date('Y-m-d');
$val_kategori = isset($_POST['kategori']) ? $_POST['kategori'] : '';
$val_jenis = isset($_POST['jenis']) ? $_POST['jenis'] : ($filter_jenis === 'pengeluaran' ? 'pengeluaran' : 'pemasukan');
$val_jumlah = isset($_POST['jumlah']) ? htmlspecialchars($_POST['jumlah']) : '';
$val_keterangan = isset($_POST['keterangan']) ? htmlspecialchars($_POST['keterangan']) : '';
$val_frekuensi = isset($_POST['frekuensi']) ? $_POST['frekuensi'] : 'Bulanan';

$isOpen = !empty($error) || isset($_GET['add']);

// Fungsi Helper format Rupiah
if (!function_exists('rupiah')) {
    function rupiah($angka) {
        return "Rp " . number_format($angka, 0, ',', '.');
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $header_title; ?> - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
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
            max-width: 100%;
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

        /* Modern Custom Badges with Perfect Contrast and Visibility */
        .badge-kategori {
            background-color: #f1f5f9;
            color: #475569 !important;
            border: 1px solid #cbd5e1;
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
            font-weight: 600;
            display: inline-block;
        }
        .badge-pemasukan {
            background-color: rgba(16, 185, 129, 0.08);
            color: #065f46 !important;
            border: 1px solid rgba(16, 185, 129, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .badge-pengeluaran {
            background-color: rgba(239, 68, 68, 0.08);
            color: #991b1b !important;
            border: 1px solid rgba(239, 68, 68, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        /* Modern Table Customization with Elite Spacing and Elegance */
        .table-custom {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
        }
        .table-custom thead th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            padding: 14px 16px;
            border-top: none;
            border-bottom: 1.5px solid #e2e8f0;
        }
        .table-custom tbody tr {
            transition: all 0.2s ease;
        }
        .table-custom tbody tr:hover {
            background-color: #fafafa !important;
        }
        .table-custom tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 0.85rem;
        }
        .table-custom tbody tr:last-child td {
            border-bottom: none;
        }
    </style>
</head>
<body>

<?php
include 'sidebar.php';
?>

    <!-- Header Action Bar -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3" style="border-bottom: 1px solid #e2e8f0;">
        <div>
            <h4 class="fw-bold text-slate-800 mb-1"><?= $header_title; ?></h4>
            <p class="text-muted small mb-0"><?= $header_subtitle; ?></p>
        </div>
        <div>
            <button class="btn btn-primary rounded-3 px-4 py-2.5 fw-bold text-uppercase tracking-wider shadow-sm d-flex align-items-center gap-2" type="button" data-bs-toggle="modal" data-bs-target="#modalForm">
                <i class="bi bi-pencil-square"></i> <span>Input Baru</span>
            </button>
        </div>
    </div>

    <!-- Contextual Elegant Metric Summary Widget -->
    <?php if ($filter_jenis === 'pemasukan'): ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #064e3b 0%, #059669 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Ringkasan Pendapatan Masuk</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;">Rp <?= number_format($total_nominal, 0, ',', '.'); ?></h3>
                    <p class="small mb-0 text-success-subtle" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-check2-circle"></i> Terakumulasi sehat dari total <strong><?= $total_rows; ?></strong> entri transaksi pemasukan aktif.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-graph-up-arrow fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php elseif ($filter_jenis === 'pengeluaran'): ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #450a0a 0%, #dc2626 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Total Belanja & Tagihan</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;">Rp <?= number_format($total_nominal, 0, ',', '.'); ?></h3>
                    <p class="small mb-0 text-danger-subtle" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-arrow-up-right-circle"></i> Alokasi arus kas keluar terdata pada <strong><?= $total_rows; ?></strong> jenis pengeluaran.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-graph-down-arrow fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php elseif ($filter_jenis === 'berulang'): ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Template Rutin Terdaftar</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;"><?= $total_rows; ?> Template Aktif</h3>
                    <p class="small mb-0 text-white-50" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-alarm"></i> Sistem mengelompokkan template bulanan/mingguan agar proyeksi keuangan Anda termonitor terarah.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-arrow-clockwise fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php else: ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Rangkuman Mutasi Kas Gabungan</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;"><?= $total_rows; ?> Entri Tercatat</h3>
                    <p class="small mb-0 text-slate-300" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-layers-half text-primary"></i> Menampilan rincian penuh seluruh mutasi tanpa filter pembatas aliran kas.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-wallet2 fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Alert status and actions -->
    <?php if (isset($_GET['status']) && $_GET['status'] === 'success'): ?>
        <div class="alert alert-success px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0" role="alert" style="background-color: rgba(16, 185, 129, 0.1); color: #047857;">
            <i class="bi bi-check-circle-fill me-2.5 fs-5 text-success"></i>
            <div class="small fw-semibold">Berhasil: Catatan baru telah berhasil disimpan ke dalam database!</div>
        </div>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0" role="alert" style="background-color: rgba(239, 68, 68, 0.1); color: #b91c1c;">
            <i class="bi bi-exclamation-triangle-fill me-2.5 fs-5 text-danger"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
        </div>
    <?php endif; ?>

    <!-- Modal Input Form Pop-up -->
    <div class="modal fade" id="modalForm" tabindex="-1" aria-labelledby="modalFormLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 bg-white" style="border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,0.12);">
                <div class="modal-header border-0 pb-0" style="padding: 1.5rem 1.75rem 0.5rem 1.75rem;">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="bi bi-pencil-square fs-5"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-semibold text-slate-800 mb-0" id="modalFormLabel">Formulir Input <?= ($filter_jenis === 'berulang') ? 'Transaksi Berulang' : 'Transaksi Baru'; ?></h5>
                            <p class="text-muted small mb-0" style="font-size: 0.73rem;">Input data dengan integritas keamanan terpadu</p>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="padding: 1.5rem 1.75rem 1.75rem 1.75rem;">
                    <form action="tambah.php?filter_jenis=<?= htmlspecialchars($filter_jenis); ?>" method="POST">
                        <div class="row g-3 mb-3">
                            <?php if ($filter_jenis !== 'berulang'): ?>
                                <div class="col-md-6">
                                    <label for="tanggal" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Tanggal Transaksi</label>
                                    <input type="date" class="form-control py-2 px-3 focus-border-primary" id="tanggal" name="tanggal" value="<?= $val_tanggal; ?>" required>
                                </div>
                            <?php else: ?>
                                <div class="col-md-6">
                                    <label for="frekuensi" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Frekuensi Tagihan/Masukan</label>
                                    <select class="form-select py-2 px-3 focus-border-primary fw-bold" id="frekuensi" name="frekuensi" required>
                                        <option value="Harian" <?= ($val_frekuensi === 'Harian') ? 'selected' : ''; ?>>Harian</option>
                                        <option value="Mingguan" <?= ($val_frekuensi === 'Mingguan') ? 'selected' : ''; ?>>Mingguan</option>
                                        <option value="Bulanan" <?= ($val_frekuensi === 'Bulanan') ? 'selected' : ''; ?>>Bulanan</option>
                                        <option value="Tahunan" <?= ($val_frekuensi === 'Tahunan') ? 'selected' : ''; ?>>Tahunan</option>
                                    </select>
                                </div>
                            <?php endif; ?>
                            
                            <div class="col-md-6">
                                <label for="kategori" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Kategori Transaksi</label>
                                <select class="form-select py-2 px-3 focus-border-primary fw-bold" id="kategori" name="kategori" required>
                                    <?php
                                    $cat_query = mysqli_query($koneksi, "SELECT nama FROM kategori ORDER BY id ASC");
                                    if ($cat_query) {
                                        while ($cat_row = mysqli_fetch_assoc($cat_query)) {
                                            $cat_name = htmlspecialchars($cat_row['nama']);
                                            $selected = ($cat_name === $val_kategori || (empty($val_kategori) && $cat_name === 'Lainnya')) ? 'selected' : '';
                                            echo "<option value=\\\"$cat_name\\\" $selected>$cat_name</option>";
                                        }
                                    } else {
                                        echo '<option value="Lainnya" selected>Lainnya</option>';
                                    }
                                    ?>
                                </select>
                            </div>
                        </div>

                        <!-- Context-aware intelligent type locking -->
                        <div class="mb-4">
                            <label class="form-label text-uppercase text-muted font-monospace tracking-wider d-block" style="font-size: 0.68rem; font-weight: 800; margin-bottom: 10px;">Jenis Aliran Dana</label>
                            
                            <?php if ($filter_jenis === 'pemasukan'): ?>
                                <input type="hidden" name="jenis" value="pemasukan">
                                <div class="p-3 rounded-3 d-flex align-items-center gap-3 bg-semibold" style="background-color: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.2); color: #059669;">
                                    <i class="bi bi-arrow-down-left-circle-fill fs-3 text-success"></i>
                                    <div>
                                        <span class="d-block fw-bold" style="font-size: 0.85rem; letter-spacing: 0.025em;">TIPE FORM: PEMASUKAN</span>
                                        <span class="text-xs text-muted" style="font-size: 0.72rem;">Otomatis dikonfigurasikan khusus untuk mencatat penerimaan kas.</span>
                                    </div>
                                </div>
                            <?php elseif ($filter_jenis === 'pengeluaran'): ?>
                                <input type="hidden" name="jenis" value="pengeluaran">
                                <div class="p-3 rounded-3 d-flex align-items-center gap-3 bg-semibold" style="background-color: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.2); color: #dc2626;">
                                    <i class="bi bi-arrow-up-right-circle-fill fs-3 text-danger"></i>
                                    <div>
                                        <span class="d-block fw-bold" style="font-size: 0.85rem; letter-spacing: 0.025em;">TIPE FORM: PENGELUARAN</span>
                                        <span class="text-xs text-muted" style="font-size: 0.72rem;">Otomatis dikonfigurasikan khusus untuk mencatat pengeluaran kas.</span>
                                    </div>
                                </div>
                            <?php else: ?>
                                <div class="row g-3">
                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="jenis" id="pemasukan" value="pemasukan" <?= ($val_jenis === 'pemasukan') ? 'checked' : ''; ?> autocomplete="off">
                                        <label class="btn btn-outline-success w-100 py-3 rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 fw-bold" for="pemasukan" style="transition: all 0.25s ease;">
                                            <i class="bi bi-arrow-down-left-circle-fill fs-4 text-success"></i>
                                            <span style="font-size: 0.8rem;">DANA MASUK (PEMASUKAN)</span>
                                        </label>
                                    </div>
                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="jenis" id="pengeluaran" value="pengeluaran" <?= ($val_jenis === 'pengeluaran') ? 'checked' : ''; ?> autocomplete="off">
                                        <label class="btn btn-outline-danger w-100 py-3 rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 fw-bold" for="pengeluaran" style="transition: all 0.25s ease;">
                                            <i class="bi bi-arrow-up-right-circle-fill fs-4 text-danger"></i>
                                            <span style="font-size: 0.8rem;">DANA KELUAR (PENGELUARAN)</span>
                                        </label>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Nominal values input with numeric validation -->
                        <div class="mb-3">
                            <label for="jumlah" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nominal Uang (Rupiah Rp)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-slate-500 font-monospace fw-bold" style="font-size: 0.9rem;">Rp</span>
                                <input type="number" class="form-control font-monospace fw-bold" id="jumlah" name="jumlah" placeholder="Contoh: 100000" min="1" value="<?= $val_jumlah; ?>" required style="font-size: 1.05rem;">
                            </div>
                            <small class="text-muted d-block mt-1 pl-1" style="font-size: 0.68rem; font-weight: 500;">* Hanya masukkan angka murni saja tanpa tanda titik (.) atau koma (,).</small>
                        </div>

                        <?php if ($filter_jenis !== 'berulang'): ?>
                            <!-- Dropdown Dompet / Sumber Rekening -->
                            <div class="mb-3">
                                <label for="dompet" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Penyimpanan / Dompet</label>
                                <select class="form-select py-2 px-3 focus-border-primary fw-bold" id="dompet" name="dompet" required>
                                    <?php
                                    $dompet_opts = mysqli_query($koneksi, "SELECT nama FROM dompet ORDER BY id ASC");
                                    if ($dompet_opts) {
                                        while ($dp = mysqli_fetch_assoc($dompet_opts)) {
                                            $dp_name = htmlspecialchars($dp['nama']);
                                            echo "<option value=\\\"$dp_name\\\">$dp_name</option>";
                                        }
                                    } else {
                                        echo '<option value="Tunai" selected>Tunai</option>';
                                    }
                                    ?>
                                </select>
                                <small class="text-muted d-block mt-1 pl-1" style="font-size: 0.68rem; font-weight: 500;">* Pilih rekening/dompet internal yang akan dialiri dana ini.</small>
                            </div>
                        <?php endif; ?>

                        <!-- Descriptions notes -->
                        <div class="mb-4">
                            <label for="keterangan" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Keterangan Catatan</label>
                            <textarea class="form-control text-xs" id="keterangan" name="keterangan" placeholder="Ketik rincian detail catatan..." rows="3" required style="font-size: 0.8rem;"><?= $val_keterangan; ?></textarea>
                        </div>

                        <!-- Action click save -->
                        <div class="modal-footer border-0 p-0 pt-2 d-flex gap-2">
                            <button type="button" class="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-bold" data-bs-dismiss="modal">Batal</button>
                            <button type="submit" class="btn btn-primary flex-grow-1 py-2.5 rounded-3 fw-bold text-uppercase tracking-wider">
                                <i class="bi bi-save-fill me-1.5"></i> Simpan Catatan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MAIN COMPREHENSIVE TABLE CARD -->
    <div class="card border-0 rounded-4 shadow-sm overflow-hidden bg-white mb-4">
        <!-- Interactive search bar and filters section -->
        <div class="card-header bg-white py-3.5 border-0 bg-slate-50/50">
            <div class="row g-3 align-items-center">
                <div class="col-md-<?= ($filter_jenis === 'semua' || empty($filter_jenis)) ? '5' : '8'; ?>">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
                        <input type="text" id="tableSearch" class="form-control border-start-0 text-sm py-2" placeholder="Cari keterangan transaksi...">
                    </div>
                </div>
                <?php if ($filter_jenis === 'semua' || empty($filter_jenis)): ?>
                    <div class="col-md-3">
                        <select id="filterType" class="form-select text-sm py-2">
                            <option value="">Semua Jenis Aliran</option>
                            <option value="pemasukan">Hanya Pemasukan</option>
                            <option value="pengeluaran">Hanya Pengeluaran</option>
                        </select>
                    </div>
                <?php endif; ?>
                <div class="col-md-4">
                    <select id="filterCategory" class="form-select text-sm py-2">
                        <option value="">Semua Kategori</option>
                        <?php
                        $cat_opts = mysqli_query($koneksi, "SELECT nama FROM kategori ORDER BY id ASC");
                        if ($cat_opts) {
                            while($o = mysqli_fetch_assoc($cat_opts)) {
                                echo '<option value="'.htmlspecialchars($o['nama']).'">'.htmlspecialchars($o['nama']).'</option>';
                            }
                        }
                        ?>
                    </select>
                </div>
            </div>
        </div>

        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-custom" id="txTable">
                    <thead class="bg-light table-light">
                        <tr>
                            <th class="ps-4 py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 70px;">No</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 145px;"><?= ($filter_jenis === 'berulang') ? 'Frekuensi' : 'Tanggal'; ?></th>
                            <th class="text-muted text-uppercase fw-bold font-monospace">Keterangan Catatan</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 140px;">Kategori</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 135px;">Jenis</th>
                            <th class="text-end text-muted text-uppercase fw-bold font-monospace" style="width: 190px;">Nominal</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($total_rows > 0): ?>
                            <?php 
                            $no = 1;
                            foreach ($list_transaksi as $row): 
                                $r_id = $row['id'];
                                $r_jenis = $row['jenis'];
                                $r_kategori = (!empty($row['kategori'])) ? htmlspecialchars($row['kategori']) : 'Umum';
                                $r_keterangan = htmlspecialchars($row['keterangan']);
                            ?>
                                <tr data-jenis="<?= $r_jenis; ?>" data-kategori="<?= $r_kategori; ?>" data-keterangan="<?= strtolower($r_keterangan); ?>">
                                    <td class="ps-4 fw-medium text-muted"><?= $no++; ?></td>
                                    <td>
                                        <div class="fw-semibold text-primary">
                                            <?php if ($filter_jenis === 'berulang'): ?>
                                                <span class="badge bg-primary-subtle text-primary font-monospace" style="font-size:0.75rem;"><i class="bi bi-alarm-fill me-1"></i><?= htmlspecialchars($row['frekuensi']); ?></span>
                                            <?php else: ?>
                                                <?= date('d M Y', strtotime($row['tanggal'])); ?>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="fw-bold text-dark d-block"><?= $r_keterangan; ?></span>
                                        <?php if ($filter_jenis !== 'berulang'): ?>
                                            <span class="text-xs text-muted d-flex align-items-center gap-1 mt-1" style="font-size: 0.72rem;">
                                                <i class="bi bi-wallet2 text-primary" style="font-size: 0.75rem;"></i>
                                                <?= htmlspecialchars($row['dompet'] ?? 'Tunai'); ?>
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="badge-kategori"><?= $r_kategori; ?></span>
                                    </td>
                                    <td class="text-center">
                                        <?php if ($r_jenis === 'pemasukan'): ?>
                                            <span class="badge badge-pemasukan fw-semibold"><i class="bi bi-arrow-down-left-circle-fill"></i> Pemasukan</span>
                                        <?php else: ?>
                                            <span class="badge badge-pengeluaran fw-semibold"><i class="bi bi-arrow-up-right-circle-fill"></i> Pengeluaran</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-end fw-black font-monospace">
                                        <?php if ($r_jenis === 'pemasukan'): ?>
                                            <span class="text-success">+ <?= rupiah($row['jumlah']); ?></span>
                                        <?php else: ?>
                                            <span class="text-danger">- <?= rupiah($row['jumlah']); ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="text-center">
                                        <div class="btn-group gap-1">
                                            <?php if ($filter_jenis !== 'berulang'): ?>
                                                <a href="edit.php?id=<?= $r_id; ?>&from=<?= htmlspecialchars($filter_jenis); ?>" class="btn btn-sm btn-outline-primary rounded-2" title="Edit Transaksi">
                                                    <i class="bi bi-pencil-square"></i>
                                                </a>
                                                <a href="hapus.php?id=<?= $r_id; ?>&from=<?= htmlspecialchars($filter_jenis); ?>" class="btn btn-sm btn-outline-danger rounded-2" onclick="return confirm('Apakah Anda yakin ingin menghapus transaksi ini?');" title="Hapus Transaksi">
                                                    <i class="bi bi-trash"></i>
                                                </a>
                                            <?php else: ?>
                                                <a href="hapus.php?id=<?= $r_id; ?>&type=berulang&from=berulang" class="btn btn-sm btn-outline-danger rounded-2" onclick="return confirm('Apakah Anda yakin ingin menghapus template transaksi rutin ini?');" title="Hapus Transaksi Rutin">
                                                    <i class="bi bi-trash"></i>
                                                </a>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr class="no-data-row">
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="bi bi-journals fs-1 mb-3 text-secondary d-block"></i>
                                    <h5>Belum Ada Data Transaksi</h5>
                                    <p class="small text-muted mb-0">Klik tombol "Input Baru" di atas untuk memasukkan data pertama Anda.</p>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        // Simple Real-time JS Filter for premium experience
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('tableSearch');
            const typeFilter = document.getElementById('filterType');
            const categoryFilter = document.getElementById('filterCategory');
            const tableRows = document.querySelectorAll('#txTable tbody tr:not(.no-data-row)');

            function filterTable() {
                const searchVal = searchInput.value.toLowerCase().trim();
                const typeVal = typeFilter ? typeFilter.value : '';
                const catVal = categoryFilter.value;

                tableRows.forEach(row => {
                    const rowDesc = row.getAttribute('data-keterangan') || '';
                    const rowJenis = row.getAttribute('data-jenis') || '';
                    const rowCat = row.getAttribute('data-kategori') || '';

                    const matchesSearch = rowDesc.includes(searchVal);
                    const matchesType = !typeFilter || typeVal === '' || rowJenis === typeVal;
                    const matchesCat = catVal === '' || rowCat === catVal;

                    if (matchesSearch && matchesType && matchesCat) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }

            if(searchInput) searchInput.addEventListener('input', filterTable);
            if(typeFilter) typeFilter.addEventListener('change', filterTable);
            if(categoryFilter) categoryFilter.addEventListener('change', filterTable);

            // Auto-show modal if there is errors or manual add query trigger
            <?php if ($isOpen): ?>
            var myModal = new bootstrap.Modal(document.getElementById('modalForm'));
            myModal.show();
            <?php endif; ?>
        });
    </script>

        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

export const EDIT_PHP = `<?php
// edit.php
// Mengedit transaksi yang sudah ada di database secara aman dengan Prepared Statements dan proteksi login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Pastikan parameter id tersedia di URL
if (!isset($_GET['id']) || empty(trim($_GET['id']))) {
    header("Location: index.php");
    exit();
}

$id = (int)$_GET['id'];
$error = '';

// 1. Ambil data transaksi lama berdasarkan ID untuk ditaruh di form
$query_select = "SELECT * FROM transaksi WHERE id = ?";
$stmt_select = mysqli_prepare($koneksi, $query_select);

if ($stmt_select) {
    mysqli_stmt_bind_param($stmt_select, "i", $id);
    mysqli_stmt_execute($stmt_select);
    $result = mysqli_stmt_get_result($stmt_select);
    
    // Alihkan jika data id tidak terdapat di database
    if (mysqli_num_rows($result) === 0) {
        header("Location: index.php");
        exit();
    }
    
    $old_data = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt_select);

    // Proteksi: Jika role adalah 'user', pastikan transaksi milik dia
    $user_role = $_SESSION['role'] ?? 'admin';
    $user_username = $_SESSION['username'] ?? 'user';
    if ($user_role === 'user' && $old_data['username'] !== $user_username) {
        header("Location: index.php?err=" . urlencode("Akses ditolak! Anda tidak diizinkan mengubah transaksi milik pengguna lain."));
        exit();
    }
} else {
    die("Kegagalan memproses kueri database SELECT.");
}

// 2. Proses edit data setelah form di-submit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tanggal = trim($_POST['tanggal']);
    $keterangan = trim($_POST['keterangan']);
    $kategori = trim($_POST['kategori']);
    $jenis = trim($_POST['jenis']);
    $jumlah = trim($_POST['jumlah']);
    $dompet = trim($_POST['dompet'] ?? 'Tunai');

    // Validasi data masukan
    if (empty($tanggal) || empty($keterangan) || empty($kategori) || empty($jenis) || empty($jumlah) || empty($dompet)) {
        $error = "Peringatan: Semua kolom isian formulir wajib dilengkapi!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah transaksi wajib di atas Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Jenis transaksi tidak valid.";
    } else {
        $jumlah_int = (int) $jumlah;

        // Persingkat pembaruan menggunakan parameterized set statement
        $query_update = "UPDATE transaksi SET tanggal = ?, keterangan = ?, kategori = ?, jenis = ?, jumlah = ?, dompet = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($koneksi, $query_update);

        if ($stmt_update) {
            mysqli_stmt_bind_param($stmt_update, "ssssisi", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $dompet, $id);

            if (mysqli_stmt_execute($stmt_update)) {
                // Alihkan setelah sukses diupdate
                header("Location: index.php");
                exit();
            } else {
                $error = "Gagal memproses eksekusi pembaruan database: " . mysqli_stmt_error($stmt_update);
            }
            mysqli_stmt_close($stmt_update);
        } else {
            $error = "Masalah kueri: Gagal memproses prepared update statement.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ubah Transaksi - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
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
$active_page = 'dashboard';
include 'sidebar.php';
?>
    <div class="card main-card p-4 p-sm-5 mt-3">
        <div class="d-flex items-center gap-2 mb-4">
            <a href="index.php" class="btn btn-sm btn-outline-secondary rounded-3 me-2">
                <i class="bi bi-arrow-left"></i> Kembali
            </a>
            <h4 class="fw-bold text-slate-800 mb-0">Ubah Detail Transaksi</h4>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger px-3 py-2.5 rounded-3 d-flex align-items-center mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #b91c1c;">
                <i class="bi bi-exclamation-triangle-fill me-2 fs-5 text-danger"></i>
                <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
            </div>
        <?php endif; ?>

        <form action="edit.php?id=<?= $id; ?>" method="POST">
            <div class="mb-3">
                <label for="tanggal" class="form-label">Tanggal Transaksi</label>
                <input type="date" class="form-control" id="tanggal" name="tanggal" value="<?= htmlspecialchars($old_data['tanggal']); ?>" required>
            </div>

            <div class="mb-3">
                <label class="form-label d-block">Jenis Aliran Dana</label>
                <div class="form-check form-check-inline me-4">
                    <input class="form-check-input" type="radio" name="jenis" id="pemasukan" value="pemasukan" <?= $old_data['jenis'] === 'pemasukan' ? 'checked' : ''; ?>>
                    <label class="form-check-label fw-semibold text-success" for="pemasukan">
                        <i class="bi bi-box-arrow-in-down-left me-1"></i> Pemasukan
                    </label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="jenis" id="pengeluaran" value="pengeluaran" <?= $old_data['jenis'] === 'pengeluaran' ? 'checked' : ''; ?>>
                    <label class="form-check-label fw-semibold text-danger" for="pengeluaran">
                        <i class="bi bi-box-arrow-up-right me-1"></i> Pengeluaran
                    </label>
                </div>
            </div>

            <div class="mb-3">
                <label for="kategori" class="form-label">Kategori Transaksi</label>
                <select class="form-select" id="kategori" name="kategori" required>
                    <?php
                    $cat_query = mysqli_query($koneksi, "SELECT nama FROM kategori ORDER BY id ASC");
                    if ($cat_query) {
                        $found_any_selected = false;
                        while ($cat_row = mysqli_fetch_assoc($cat_query)) {
                            $cat_name = htmlspecialchars($cat_row['nama']);
                            $selected = ($old_data['kategori'] === $cat_name) ? 'selected' : '';
                            if ($selected) $found_any_selected = true;
                            echo "<option value=\\"$cat_name\\" $selected>$cat_name</option>";
                        }
                        // Jika kategori lama tidak terdaftar lagi (dihapus/lainnya), tambahkan pilihan cadangan
                        if (!$found_any_selected && !empty($old_data['kategori'])) {
                            $cat_name_old = htmlspecialchars($old_data['kategori']);
                            echo "<option value=\\"$cat_name_old\\" selected>$cat_name_old (Kustom/Non-Aktif)</option>";
                        }
                    } else {
                        echo '<option value="Lainnya" selected>Lainnya</option>';
                    }
                    ?>
                </select>
            </div>

            <div class="mb-3">
                <label for="jumlah" class="form-label">Jumlah Uang (Rupiah Rp)</label>
                <div class="input-group">
                    <span class="input-group-text bg-light text-slate-500 font-monospace fw-bold">Rp</span>
                    <input type="number" class="form-control font-monospace fw-bold" id="jumlah" name="jumlah" value="<?= htmlspecialchars($old_data['jumlah']); ?>" min="1" required>
                </div>
            </div>

            <div class="mb-3">
                <label for="dompet" class="form-label">Penyimpanan / Dompet</label>
                <select class="form-select" id="dompet" name="dompet" required>
                    <?php
                    $dompet_query = mysqli_query($koneksi, "SELECT nama FROM dompet ORDER BY id ASC");
                    if ($dompet_query) {
                        $found_any_selected = false;
                        while ($dompet_row = mysqli_fetch_assoc($dompet_query)) {
                            $d_name = htmlspecialchars($dompet_row['nama']);
                            $selected = ($old_data['dompet'] === $d_name) ? 'selected' : '';
                            if ($selected) $found_any_selected = true;
                            echo "<option value=\\"$d_name\\" $selected>$d_name</option>";
                        }
                        if (!$found_any_selected && !empty($old_data['dompet'])) {
                            $d_name_old = htmlspecialchars($old_data['dompet']);
                            echo "<option value=\\"$d_name_old\\" selected>$d_name_old (Kustom/Non-Aktif)</option>";
                        }
                    } else {
                        echo '<option value="Tunai" selected>Tunai</option>';
                    }
                    ?>
                </select>
            </div>

            <div class="mb-4">
                <label for="keterangan" class="form-label">Keterangan Catatan</label>
                <textarea class="form-control" id="keterangan" name="keterangan" rows="3" required><?= htmlspecialchars($old_data['keterangan']); ?></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2.5 rounded-3 fw-bold shadow-sm text-uppercase tracking-wider">
                <i class="bi bi-check-circle me-1.5"></i> Simpan Perubahan Transaksi
            </button>
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

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

export const HAPUS_PHP = `<?php
// hapus.php
// Memproses penghapusan denga keamanan parameterized query MySQLi dan proteksi login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Memastikan parameter ID terisi
if (isset($_GET['id']) && !empty(trim($_GET['id']))) {
    $id = (int) $_GET['id'];
    $user_role = $_SESSION['role'] ?? 'admin';
    $user_username = $_SESSION['username'] ?? 'user';

    // Verifikasi penanggung jawab / pemilik kueri jika role adalah 'user'
    $can_delete = true;
    $query_check = "SELECT username FROM transaksi WHERE id = ?";
    $stmt_check = mysqli_prepare($koneksi, $query_check);
    if ($stmt_check) {
        mysqli_stmt_bind_param($stmt_check, "i", $id);
        mysqli_stmt_execute($stmt_check);
        $res_check = mysqli_stmt_get_result($stmt_check);
        if ($row_check = mysqli_fetch_assoc($res_check)) {
            if ($user_role === 'user' && $row_check['username'] !== $user_username) {
                $can_delete = false;
            }
        }
        mysqli_stmt_close($stmt_check);
    }

    if ($can_delete) {
        // Siapkan prepared statement untuk mencegah serangan SQL Injection
        $query_delete = "DELETE FROM transaksi WHERE id = ?";
        $stmt = mysqli_prepare($koneksi, $query_delete);
        
        if ($stmt) {
            // Ikat parameter integer
            mysqli_stmt_bind_param($stmt, "i", $id);
            
            // Jalankan perintah hapus
            mysqli_stmt_execute($stmt);
            
            // Selesai membebaskan memori kueri
            mysqli_stmt_close($stmt);
        }
    } else {
        header("Location: index.php?err=" . urlencode("Gagal menghapus! Anda tidak diizinkan menghapus transaksi milik orang lain."));
        exit();
    }
}

// Redirect otomatis dialihkan mengarah kembali ke index.php
header("Location: index.php");
exit();
?>`;

export const README_CPANEL = `# Panduan Singkat Deployment Aplikasi Keuangan ke cPanel

Berikut adalah instruksi langkah-demi-langkah bagi Anda untuk mengupload, mengatur database, dan menjalankan aplikasi keuangan berbasis PHP Native ini di hosting cPanel standar milik Anda.

---

## Langkah 1: Persiapan Database di cPanel

1. **Masuk ke cPanel** menggunakan akun hosting Anda.
2. Cari dan klik menu **MySQL Database Wizard** (rekomendasi untuk pemula) atau **MySQL Databases**.
3. **Buat Database Baru**:
   - Ketikkan nama database, contoh: \`keuangan_db\` atau \`namauser_keuangan\`.
   - Simpan nama lengkap database ini karena cPanel biasanya menambahkan prefix nama pengguna Anda (cth: \`u1234567_keuangan_db\`). Klik **Next Step**.
4. **Buat User Database**:
   - Ketikkan nama user baru, contoh: \`keuangan_user\` (akan menjadi \`u1234567_keuangan_user\`).
   - Buat/generate password yang kuat. **Catat nama user dan password ini baik-baik!**
   - Klik **Create User**.
5. **Hubungkan User ke Database**:
   - Centang opsi **ALL PRIVILEGES** untuk memberikan akses penuh kepada user tersebut atas database.
   - Klik **Make Changes** atau **Next Step**.

---

## Langkah 2: Import Tabel Struktur SQL lewat phpMyAdmin

1. Pada halaman utama cPanel, hubungi menu bernama **phpMyAdmin**.
2. Di sidebar sisi kiri, klik nama database Anda yang baru saja dibuat di Langkah 1.
3. Klik tab menu **Import** di bagian atas halaman.
4. Pada kolom "File to import", klik **Choose File** (Pilih File) dan pilih berkas \`db.sql\` yang ada dalam folder unduhan ini.
5. Gulir ke bawah dan klik tombol **Go** atau **Import** di kanan bawah.
6. Tunggu hingga muncul pesan hijau sukses ("Import has been successfully finished..."). Tabel \`transaksi\` kini telah selesai dibuat beserta data percontohan!

---

## Langkah 3: Konfigurasi File Koneksi di \`koneksi.php\`

Sebelum atau setelah mengunggah, Anda harus menyunting file koneksi database:

1. Buka file \`koneksi.php\`.
2. Ubah baris data konfigurasi dengan kesesuaian dari cPanel Anda di Langkah 1:
   \`\`\`php
   $db_host = "localhost";        // Biarkan tetap localhost
   $db_user = "u1234567_userdb";  // Username MySQL dari Langkah 1
   $db_pass = "password_anda";    // Password MySQL dari Langkah 1
   $db_name = "u1234567_namedb";  // Nama Database dari Langkah 1
   \`\`\`
3. Simpan perubahan file tersebut.

---

## Langkah 4: Upload File ke File Manager cPanel

1. Di beranda cPanel, klik menu **File Manager**.
2. Masuklah ke dalam direktori/folder bernama **public_html** (ini adalah folder publik tempat website Anda diakses).
3. Unggah seluruh file PHP berikut langsung ke dalam \`public_html\`:
   - \`index.php\`
   - \`login.php\`
   - \`logout.php\`
   - \`tambah.php\`
   - \`edit.php\`
   - \`hapus.php\`
   - \`koneksi.php\`
4. *Tips:* Untuk mempercepat proses, Anda dapat meng-compress seluruh file di atas menjadi satu file \`.zip\`, unggah file ZIP tersebut via File Manager, lalu klik kanan file ZIP tersebut di File Manager cPanel dan pilih **Extract**.

---

## Langkah 5: Selesai! Uji Coba Aplikasi

Aplikasi Anda kini sudah siap dijalankan! Buka browser Anda dan akses domain website Anda:
- \`http://nama-domain-anda.com/\` (jika di-upload langsung di folder utama \`public_html\`)
- Atau \`http://nama-domain-anda.com/keuangan/\` (jika di-upload ke dalam subfolder baru bernama \`keuangan\` di dalam \`public_html\`).
`;

export const LOGIN_PHP = `<?php
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
            <span class="opacity-75 font-monospace" style="font-size: 0.72rem;"><?= htmlspecialchars($login_version); ?></span>
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
`;

export const LOGOUT_PHP = `<?php
// logout.php
// Menghancurkan session login untuk memutus hubungan akses pengguna secara aman

session_start();

// Hapus seluruh variabel session
$_SESSION = array();

// Bersihkan session cookie di web browser pengguna
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Hancurkan session data di sisi server
session_destroy();

// Alihkan halaman ke form masuk login kembali
header("Location: login.php");
exit();
?>`;

export const KELOLA_USER_PHP = `<?php
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

// Proses data ke array untuk kalkulasi metrik visual yang stylish
$list_users = [];
$total_users = 0;
$total_approved = 0;
$total_pending = 0;

if ($result_users) {
    while ($row = mysqli_fetch_assoc($result_users)) {
        $list_users[] = $row;
        $total_users++;
        if (($row['status'] ?? 'approved') === 'approved') {
            $total_approved++;
        } else {
            $total_pending++;
        }
    }
}

// Helper untuk inisial nama avatar
if (!function_exists('getInitials')) {
    function getInitials($name) {
        $words = explode(" ", trim($name));
        $initials = "";
        $count = 0;
        foreach ($words as $w) {
            if (!empty($w)) {
                $initials .= strtoupper($w[0]);
                $count++;
                if ($count >= 2) break;
            }
        }
        return !empty($initials) ? $initials : "?";
    }
}

// Helper untuk generator warna avatar background yang konsisten
if (!function_exists('getAvatarColor')) {
    function getAvatarColor($name) {
        $colors = [
            '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444'
        ];
        $hash = crc32($name);
        return $colors[abs($hash) % count($colors)];
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Pengguna - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body { 
            background-color: #f8fafc; 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
            color: #1e293b; 
        }
        .main-card { 
            border: none; 
            border-radius: 16px; 
            box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.12); 
            background: #ffffff; 
            transition: all 0.3s ease;
        }
        .main-card:hover {
            box-shadow: 0 10px 25px -5px rgba(148, 163, 184, 0.18);
        }
        
        /* Premium Gradient Metric Cards */
        .gradient-card-primary {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            border: none;
            border-radius: 16px;
            color: #ffffff;
            box-shadow: 0 8px 24px -4px rgba(99, 102, 241, 0.35);
            position: relative;
            overflow: hidden;
        }
        .gradient-card-success {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            border: none;
            border-radius: 16px;
            color: #ffffff;
            box-shadow: 0 8px 24px -4px rgba(16, 185, 129, 0.35);
            position: relative;
            overflow: hidden;
        }
        .gradient-card-warning {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
            border: none;
            border-radius: 16px;
            color: #ffffff;
            box-shadow: 0 8px 24px -4px rgba(245, 158, 11, 0.35);
            position: relative;
            overflow: hidden;
        }
        
        .card-pattern {
            position: absolute;
            top: -20px;
            right: -20px;
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.12);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            transform: rotate(15deg);
            transition: all 0.4s ease;
        }
        
        .gradient-card-primary:hover .card-pattern,
        .gradient-card-success:hover .card-pattern,
        .gradient-card-warning:hover .card-pattern {
            transform: rotate(30deg) scale(1.1);
            background: rgba(255, 255, 255, 0.18);
        }

        /* Modern Table Customization */
        .table-custom {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
        }
        .table-custom thead th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            padding: 14px 16px;
            border-top: none;
            border-bottom: 1.5px solid #e2e8f0;
        }
        .table-custom tbody tr {
            transition: all 0.2s ease;
        }
        .table-custom tbody tr:hover {
            background-color: #fafafa !important;
        }
        .table-custom tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 0.85rem;
        }
        .table-custom tbody tr:last-child td {
            border-bottom: none;
        }

        /* Avatar Circle */
        .avatar-circle {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 0.85rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .badge-premium {
            font-size: 0.72rem;
            padding: 0.4rem 0.75rem;
            border-radius: 12px;
            font-weight: 600;
            letter-spacing: 0.025em;
        }
    </style>
</head>
<body>

<?php
$active_page = 'kelola_user';
include 'sidebar.php';
?>

    <?php if (isset($_GET['msg'])): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 py-3.5 mb-4 shadow-sm" role="alert" style="background-color: rgba(16, 185, 129, 0.1); color: #047857;">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-check-circle-fill text-success fs-5"></i>
                <div class="fw-semibold small"><?= htmlspecialchars($_GET['msg']); ?></div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>
    
    <?php if (isset($_GET['err'])): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 py-3.5 mb-4 shadow-sm" role="alert" style="background-color: rgba(239, 68, 68, 0.1); color: #b91c1c;">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                <div class="fw-semibold small"><?= htmlspecialchars($_GET['err']); ?></div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Header Action Bar -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3" style="border-bottom: 1px solid #e2e8f0;">
        <div>
            <h3 class="fw-bold text-slate-800 tracking-tight mb-1" style="font-size: 1.6rem;">Kelola Pengguna & Akses</h3>
            <p class="text-muted mb-0 small">Manajemen otorisasi akun masuk sistem, status approval, serta perubahan identitas operasional.</p>
        </div>
        <div>
            <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                <button class="btn btn-primary rounded-3 px-4 py-2.5 fw-bold text-uppercase d-flex align-items-center gap-2 shadow-sm" style="background-color: #4f46e5; border-color: #4f46e5;" data-bs-toggle="modal" data-bs-target="#modalTambahUser">
                    <i class="bi bi-person-plus-fill fs-5"></i> <span>Tambah User Baru</span>
                </button>
            <?php else: ?>
                <button class="btn btn-outline-secondary rounded-3 px-4 py-2.5 fw-bold text-uppercase d-flex align-items-center gap-2 shadow-sm bg-white" disabled title="Hanya Super Admin yang diizinkan menambah user">
                    <i class="bi bi-lock-fill fs-5"></i> <span>Tambah User</span>
                </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Live Premium Metrics Widget Row -->
    <div class="row g-4 mb-4">
        <!-- Metric Active Users -->
        <div class="col-md-4">
            <div class="card gradient-card-primary p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-people-fill"></i>
                </div>
                <div class="position-relative z-1">
                    <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.72rem; opacity: 0.9; letter-spacing: 0.05em">Total Anggota Terdaftar</span>
                    <h3 class="fw-black mb-1 text-white" style="font-size: 2rem;"><?= $total_users; ?> Pengguna</h3>
                    <p class="small mb-0 text-white-50" style="font-size: 0.75rem;"><i class="bi bi-shield-check"></i> Seluruh akun yang terdata di sistem KeuanganKu</p>
                </div>
            </div>
        </div>
        
        <!-- Metric Approved Users -->
        <div class="col-md-4">
            <div class="card gradient-card-success p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-shield-fill-check"></i>
                </div>
                <div class="position-relative z-1">
                    <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.72rem; opacity: 0.9; letter-spacing: 0.05em">User Terverifikasi (Approved)</span>
                    <h3 class="fw-black mb-1 text-white" style="font-size: 2rem;"><?= $total_approved; ?> Diizinkan</h3>
                    <p class="small mb-0 text-white-50" style="font-size: 0.75rem;"><i class="bi bi-person-check-fill"></i> Memiliki akses login penuh ke sistem saat ini</p>
                </div>
            </div>
        </div>

        <!-- Metric Pending Request -->
        <div class="col-md-4">
            <div class="card gradient-card-warning p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-hourglass-split"></i>
                </div>
                <div class="position-relative z-1">
                    <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.72rem; opacity: 0.9; letter-spacing: 0.05em">Menunggu Persetujuan (Pending)</span>
                    <h3 class="fw-black mb-1 text-white" style="font-size: 2rem;"><?= $total_pending; ?> Tertunda</h3>
                    <p class="small mb-0 text-white-50" style="font-size: 0.75rem;"><i class="bi bi-exclamation-circle-fill"></i> Memerlukan evaluasi langsung dari Super Admin</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Otorisasi Keterangan Sandbox -->
    <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 5px solid #3b82f6 !important;">
        <div class="d-flex align-items-start gap-3">
            <div class="bg-blue-600 bg-opacity-10 p-2.5 rounded-3 text-blue-600 d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; color: #2563eb; background-color: rgba(37, 99, 235, 0.08);">
                <i class="bi bi-shield-lock-fill fs-4"></i>
            </div>
            <div>
                <h6 class="fw-bold text-slate-800 mb-1" style="font-size: 0.95rem;">Informasi Aturan Hak Akses Otoritas Peran (Role)</h6>
                <div class="small text-slate-600 leading-relaxed font-semibold" style="font-size: 0.82rem;">
                    Sistem mengimplementasikan otorisasi berbasis tingkatan yang aman:<br>
                    <span class="text-primary">• Super Admin</span> memiliki kendali istimewa penuh (CRUD) untuk menambah, mengonfigurasi sandi, menyetujui pendaftaran, serta melenyapkan entri user.<br>
                    <span class="text-secondary">• Admin</span> berstatus peninjau (Read-Only) yang dapat memantau entri user namun terblokir secara otomatis dari operasi manipulasi.
                </div>
            </div>
        </div>
    </div>

    <!-- Panel Pengguna -->
    <div class="card main-card overflow-hidden">
        <div class="card-header bg-white py-3.5 px-4 border-0 bg-slate-50/50 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-table text-indigo-600"></i> Daftar Informasi Kredensial Pengguna
            </h5>
            <span class="badge bg-slate-100 text-slate-600 border px-3 py-1.5 rounded-pill fw-semibold font-monospace" style="font-size: 0.72rem;">
                <?= count($list_users); ?> Pengguna Terdaftar
            </span>
        </div>
        
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-custom" style="font-size: 0.85rem;">
                    <thead>
                        <tr>
                            <th class="ps-4 py-3" style="width: 80px;">No</th>
                            <th>Profil Pengguna</th>
                            <th>Username</th>
                            <th style="width: 160px;">Level Peran</th>
                            <th style="width: 150px;">Status ACC</th>
                            <th class="text-center" style="width: 240px;">Rincian Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        $no = 1;
                        if (count($list_users) > 0):
                            foreach ($list_users as $row): 
                                $u_nama = $row['nama'];
                                $initials = getInitials($u_nama);
                                $avatar_bg = getAvatarColor($u_nama);
                        ?>
                            <tr>
                                <td class="ps-4 fw-bold text-slate-400"><?= $no++; ?></td>
                                <td>
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="avatar-circle" style="background-color: <?= $avatar_bg; ?>;">
                                            <?= $initials; ?>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-slate-800" style="font-size: 0.9rem;"><?= htmlspecialchars($u_nama); ?></div>
                                            <small class="text-muted" style="font-size: 0.75rem;">ID Pengguna: #<?= $row['id']; ?></small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="font-monospace text-secondary fw-semibold">
                                        @<?= htmlspecialchars($row['username']); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($row['role'] === 'superadmin'): ?>
                                        <span class="badge bg-primary-subtle border border-primary-200 text-primary badge-premium"><i class="bi bi-shield-fill me-1"></i>Super Admin</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary-subtle border border-secondary text-secondary badge-premium"><i class="bi bi-person-fill me-1 font-semibold"></i>Admin</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (($row['status'] ?? 'approved') === 'approved'): ?>
                                        <span class="badge bg-success-subtle border border-success-200 text-success badge-premium"><i class="bi bi-check-circle-fill me-1"></i>APPROVED</span>
                                    <?php else: ?>
                                        <span class="badge bg-warning-subtle border border-warning-200 text-warning badge-premium"><i class="bi bi-hourglass-split me-1 animate-pulse"></i>PENDING</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center">
                                    <?php if (($_SESSION['role'] ?? '') === 'superadmin'): ?>
                                        <div class="px-2 d-flex justify-content-center gap-1.5">
                                            <?php if (($row['status'] ?? 'approved') === 'pending'): ?>
                                                <a href="kelola_user.php?act=approve&id=<?= $row['id']; ?>" class="btn btn-sm btn-success rounded-3 text-white px-3 fw-bold d-flex align-items-center gap-1" style="font-size: 0.75rem; border: none; background-color: #10b981; box-shadow: 0 2px 4px rgba(16,185,129,0.2);" title="Setujui Akun (ACC)">
                                                    <i class="bi bi-check-circle-fill"></i> ACC
                                                </a>
                                            <?php endif; ?>
                                            <button type="button" data-bs-toggle="modal" data-bs-target="#modalEditUser<?= $row['id']; ?>" class="btn btn-sm btn-outline-primary rounded-3 px-2.5 d-flex align-items-center justify-content-center" style="height: 32px;" title="Edit Akun & Ganti Password">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            
                                            <?php if ($row['id'] == ($_SESSION['user_id'] ?? 0) || $row['username'] === 'admin'): ?>
                                                <button class="btn btn-sm btn-outline-secondary rounded-3 px-2.5 d-flex align-items-center justify-content-center" style="height: 32px;" disabled title="Keamanan: Tidak diizinkan menghapus akun Anda sendiri atau Superadmin utama">
                                                    <i class="bi bi-trash-fill"></i>
                                                </button>
                                            <?php else: ?>
                                                <a href="hapus_user.php?id=<?= $row['id']; ?>" class="btn btn-sm btn-outline-danger rounded-3 px-2.5 d-flex align-items-center justify-content-center" style="height: 32px;" onclick="return confirm('Apakah Anda yakin ingin mendelete user ini secara permanen?');" title="Delete Akun">
                                                    <i class="bi bi-trash"></i>
                                                </a>
                                            <?php endif; ?>
                                        </div>
                                    <?php else: ?>
                                        <span class="badge border bg-light text-slate-400 py-2 px-3 rounded-pill" style="font-size: 0.72rem;"><i class="bi bi-lock-fill me-1"></i>Aksi Terkunci</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php 
                            endforeach;
                        else:
                        ?>
                            <tr>
                                <td colspan="6" class="text-center py-5 text-muted">
                                    <i class="bi bi-people fs-1 mb-3 text-secondary d-block"></i>
                                    <h5 class="fw-bold">Tidak Ada Anggota</h5>
                                    <p class="small text-muted mb-0">Klik tombol Tambah User Baru di atas untuk menambah pengguna perdana.</p>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
        </div> <!-- End of inner container from sidebar layout -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<!-- MODAL TAMBAH USER -->
<div class="modal fade" id="modalTambahUser" tabindex="-1" aria-labelledby="modalTambahUserLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold text-slate-800" id="modalTambahUserLabel">
                    <i class="bi bi-person-plus-fill text-indigo-600 me-2 animate-bounce"></i>Tambah Pengguna Baru
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body px-4 py-3">
                <p class="text-muted small mb-4">Daftarkan akun administrator baru ke dalam database administrasi KeuanganKu.</p>
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

                    <div class="d-flex justify-content-end gap-2 pb-2">
                        <button type="button" class="btn btn-outline-secondary rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary rounded-3 px-4" style="background-color: #4f46e5 !important; border-color: #4f46e5 !important;">Simpan Akun</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- MODAL EDIT USER DYNAMIC GENERATOR -->
<?php 
if (count($list_users) > 0 && ($_SESSION['role'] ?? '') === 'superadmin'):
    foreach ($list_users as $row):
?>
<div class="modal fade" id="modalEditUser<?= $row['id']; ?>" tabindex="-1" aria-labelledby="modalEditUserLabel<?= $row['id']; ?>" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold text-slate-800" id="modalEditUserLabel<?= $row['id']; ?>">
                    <i class="bi bi-pencil-square text-indigo-600 me-2"></i>Ubah Pengguna
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body px-4 py-3">
                <p class="text-muted small mb-4">Modifikasi rincian data kredensial dan hak akses pengguna ini.</p>
                <form action="edit_user.php?id=<?= $row['id']; ?>" method="POST">
                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Nama Lengkap</label>
                        <input type="text" name="nama" class="form-control rounded-3" value="<?= htmlspecialchars($row['nama']); ?>" required>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Username</label>
                        <input type="text" name="username" class="form-control rounded-3 font-monospace" value="<?= htmlspecialchars($row['username']); ?>" required <?= $row['username'] === 'admin' ? 'readonly' : ''; ?>>
                        <?php if ($row['username'] === 'admin'): ?>
                            <div class="form-text text-danger small">Username admin utama dilarang diedit demi kestabilan.</div>
                        <?php endif; ?>
                    </div>

                    <div class="mb-3">
                        <label class="form-label text-slate-700 small fw-bold">Password Baru (Bila Diganti)</label>
                        <input type="password" name="password" class="form-control rounded-3" placeholder="Biarkan kosong jika tidak diganti">
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-slate-700 small fw-bold">Level Peran (Role)</label>
                        <select name="role" class="form-select rounded-3" <?= $row['username'] === 'admin' ? 'disabled' : ''; ?>>
                            <option value="admin" <?= $row['role'] === 'admin' ? 'selected' : ''; ?>>Admin (Melihat/Menulis Transaksi)</option>
                            <option value="superadmin" <?= $row['role'] === 'superadmin' ? 'selected' : ''; ?>>Super Admin (Akses Mutlak Server)</option>
                        </select>
                    </div>

                    <div class="d-flex justify-content-end gap-2 pb-2">
                        <button type="button" class="btn btn-outline-secondary rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary rounded-3 px-4" style="background-color: #4f46e5 !important; border-color: #4f46e5 !important;">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<?php 
    endforeach;
endif;
?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

export const TAMBAH_USER_PHP = `<?php
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
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

</body>
</html>`;

export const EDIT_USER_PHP = `<?php
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
    <title>Edit Pengguna - <?= htmlspecialchars($app_name); ?></title>
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
            <h4 class="fw-bold text-slate-800 mb-0">Ubah Data Pengguna</h4>
        </div>
        <p class="text-muted small mb-4">Silakan sesuaikan pengaturan data user di bawah.</p>

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
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

</body>
</html>`;

export const HAPUS_USER_PHP = `<?php
// hapus_user.php
// Menghapus akun dari database secara permanen (Khusus Super Admin)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

if (($_SESSION['role'] ?? '') !== 'superadmin') {
    header("Location: kelola_user.php?err=Akses ditolak! Anda bukan Super Admin!");
    exit();
}

require_once 'koneksi.php';

$id = $_GET['id'] ?? 0;

// Blokir penghapusan diri sendiri
if ($id == ($_SESSION['user_id'] ?? 0)) {
    header("Location: kelola_user.php?err=Keamanan: Anda dilarang mendelete akun sendiri!");
    exit();
}

// Blokir penghapusan admin utama
$query_check = "SELECT username FROM users WHERE id = ?";
$stmt_check = mysqli_prepare($koneksi, $query_check);
mysqli_stmt_bind_param($stmt_check, "i", $id);
mysqli_stmt_execute($stmt_check);
$username_res = mysqli_stmt_get_result($stmt_check)->fetch_assoc();
mysqli_stmt_close($stmt_check);

if ($username_res && $username_res['username'] === 'admin') {
    header("Location: kelola_user.php?err=Keamanan: User admin utama dilarang dihapus!");
    exit();
}

// Lakukan penghapusan secara aman lewat prepared statement
$query_del = "DELETE FROM users WHERE id = ?";
$stmt_del = mysqli_prepare($koneksi, $query_del);
mysqli_stmt_bind_param($stmt_del, "i", $id);

if (mysqli_stmt_execute($stmt_del)) {
    mysqli_stmt_close($stmt_del);
    header("Location: kelola_user.php?msg=User berhasil dihapus secara permanen dari server database!");
    exit();
} else {
    header("Location: kelola_user.php?err=Database: Terjadi kegagalan memproses query penghapusan.");
    exit();
}
?>`;

export const SIDEBAR_PHP = `<?php
// sidebar.php
// Sidebar layout shared across index.php, kelola_user.php, tambah.php, edit.php, dsb.

// Ensure session is started safely
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($koneksi)) {
    include_once 'koneksi.php';
}

$active_page = $active_page ?? 'dashboard';
$user_nama = htmlspecialchars($_SESSION['nama'] ?? 'Pengguna');
$user_role = htmlspecialchars($_SESSION['role'] ?? 'admin');
$user_username = htmlspecialchars($_SESSION['username'] ?? 'user');

// Cek hak akses menu dinamis untuk page aktif
$permission_page_mapping = [
    'dashboard' => 'dashboard',
    'transaksi' => 'transaksi',
    'pemasukan' => 'transaksi',
    'pengeluaran' => 'transaksi',
    'transaksi_berulang' => 'transaksi',
    'laporan' => 'laporan',
    'anggaran' => 'anggaran',
    'rekening' => 'rekening',
    'kategori' => 'kategori',
    'kelola_user' => 'kelola_user',
    'pengaturan' => 'pengaturan'
];

$required_menu = $permission_page_mapping[$active_page] ?? 'dashboard';
if (!has_menu_permission($user_role, $required_menu)) {
    if (basename($_SERVER['PHP_SELF']) !== 'index.php') {
        header("Location: index.php?error=no_permission");
        exit();
    } else {
        $allowed_urls = [
            'transaksi' => 'tambah.php?filter_jenis=semua',
            'laporan' => 'laporan.php',
            'anggaran' => 'anggaran.php',
            'rekening' => 'rekening.php',
            'kategori' => 'kategori.php',
            'kelola_user' => 'kelola_user.php',
            'pengaturan' => 'pengaturan.php'
        ];
        $fallback_target = '';
        foreach ($allowed_urls as $menu_key => $target_url) {
            if (has_menu_permission($user_role, $menu_key)) {
                $fallback_target = $target_url;
                break;
            }
        }
        if (!empty($fallback_target)) {
            header("Location: " . $fallback_target);
            exit();
        } else {
            echo "<div style='font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0f172a; color: #f1f5f9; padding: 20px;'><div style='text-align: center; max-width: 500px; background: rgba(255,255,255,0.05); padding: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);'><i class='bi bi-shield-slash' style='font-size: 3rem; color: #ef4444;'></i><h2 style='font-weight: 700; margin-top:20px;'>Akses Ditolak</h2><p style='color: #94a3b8; font-size: 0.9rem; line-height: 1.5; margin-top: 10px;'>Akun Anda tidak memiliki izin untuk melihat menu manapun. Hubungi Superadmin Anda.</p><a href='logout.php' style='display:inline-block; font-size: 0.85rem; font-weight: 600; text-decoration:none; color:#ffffff; background:#ef4444; padding: 10px 20px; border-radius: 8px; margin-top: 15px;'>Keluar Akun</a></div></div>";
            exit();
        }
    }
}

// Ambil & Terapkan Tema Warna Dinamis dari Pengaturan User
if (isset($koneksi) && !isset($_SESSION['theme'])) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $theme_query = mysqli_query($koneksi, "SELECT theme FROM users WHERE username = '$db_username_escaped'");
    if ($theme_query && mysqli_num_rows($theme_query) > 0) {
        $theme_row = mysqli_fetch_assoc($theme_query);
        $_SESSION['theme'] = $theme_row['theme'];
    } else {
        $_SESSION['theme'] = 'slate';
    }
}
$current_theme = $_SESSION['theme'] ?? 'slate';

// Ambil & Terapkan Bahasa Dinamis dari Pengaturan User
if (isset($koneksi) && !isset($_SESSION['lang'])) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $lang_query = mysqli_query($koneksi, "SELECT lang FROM users WHERE username = '$db_username_escaped'");
    if ($lang_query && mysqli_num_rows($lang_query) > 0) {
        $lang_row = mysqli_fetch_assoc($lang_query);
        $_SESSION['lang'] = !empty($lang_row['lang']) ? $lang_row['lang'] : 'id';
    } else {
        $_SESSION['lang'] = 'id';
    }
}
$current_lang = $_SESSION['lang'] ?? 'id';

$theme_colors = [
    'slate' => [
        'name' => 'Modern Slate',
        'primary' => '#2563eb', // Blue 600
        'hover' => '#1d4ed8',
        'rgb' => '37, 99, 235',
        'bg_sidebar' => '#0f172a', // Slate 900
        'text_sidebar' => '#cbd5e1',
        'sidebar_active' => '#2563eb'
    ],
    'emerald' => [
        'name' => 'Emerald Forest',
        'primary' => '#059669', // Emerald 600
        'hover' => '#047857',
        'rgb' => '5, 150, 105',
        'bg_sidebar' => '#064e3b', // Emerald 900
        'text_sidebar' => '#d1fae5',
        'sidebar_active' => '#059669'
    ],
    'violet' => [
        'name' => 'Royal Violet',
        'primary' => '#7c3aed', // Violet 600
        'hover' => '#6d28d9',
        'rgb' => '124, 58, 237',
        'bg_sidebar' => '#2e1065', // Violet 900
        'text_sidebar' => '#f5f3ff',
        'sidebar_active' => '#7c3aed'
    ],
    'crimson' => [
        'name' => 'Charcoal Crimson',
        'primary' => '#dc2626', // Red 600
        'hover' => '#b91c1c',
        'rgb' => '220, 38, 38',
        'bg_sidebar' => '#450a0a', // Red 900
        'text_sidebar' => '#fee2e2',
        'sidebar_active' => '#dc2626'
    ],
    'amber' => [
        'name' => 'Amber Sunset',
        'primary' => '#d97706', // Amber 600
        'hover' => '#b45309',
        'rgb' => '217, 119, 6',
        'bg_sidebar' => '#451a03', // Amber 900
        'text_sidebar' => '#fffbeb',
        'sidebar_active' => '#d97706'
    ]
];

$selected_theme = isset($theme_colors[$current_theme]) ? $current_theme : 'slate';
$theme_cfg = $theme_colors[$selected_theme];
?>
<script>
    // Lindungi dari Cumulative Layout Shift (CLS) saat browser pertama kali memuat layout halaman
    (function() {
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (isCollapsed && window.innerWidth >= 768) {
            document.write('<style>@media(min-width:768px){.sidebar-container{width:80px !important;}.sidebar-brand-text, .sidebar-nav-link span, .toggle-chevron, .sub-menu-nav, .collapse.show, .collapse, .user-profile-text-wrapper, .dropdown-toggle::after{display:none !important;}.sidebar-container .sidebar-brand{padding:20px 0 !important;justify-content:center !important;flex-direction:column !important;gap:8px !important;}.sidebar-container .sidebar-brand a{justify-content:center !important;width:auto !important;}.sidebar-container .sidebar-brand img,.sidebar-container .sidebar-brand i{margin-right:0 !important;}.sidebar-container .sidebar-toggle-btn{position:static !important;transform:none !important;margin-top:4px !important;}.sidebar-container .sidebar-nav-link{padding:12px 0 !important;margin:4px 12px !important;justify-content:center !important;}.sidebar-container .sidebar-nav-link i{margin-right:0 !important;font-size:1.45rem !important;}.sidebar-container .user-profile-section{padding:10px 0 !important;margin:16px 8px !important;justify-content:center !important;}.sidebar-container .user-profile-section a{justify-content:center !important;}}</style>');
        }
    })();
</script>
<style>
    /* Styling khusus Sidebar Premium dengan Tema Dinamis */
    .sidebar-container {
        width: 280px;
        background-color: <?= $theme_cfg['bg_sidebar']; ?>;
        color: <?= $theme_cfg['text_sidebar']; ?>;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 1000;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    .sidebar-container::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
    
    .sidebar-brand {
        position: relative;
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: padding 0.25s ease;
    }

    .sidebar-brand a {
        transition: opacity 0.22s ease;
        cursor: pointer;
    }

    .sidebar-brand a:hover {
        opacity: 0.8 !important;
    }
    
    .sidebar-nav-link {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 600;
        text-decoration: none;
        border-radius: 12px;
        margin: 4px 16px;
        transition: all 0.2s ease;
    }
    
    .sidebar-nav-link:hover {
        background-color: rgba(255, 255, 255, 0.07);
        color: #ffffff;
    }
    
    .sidebar-nav-link.active {
        background-color: <?= $theme_cfg['sidebar_active']; ?> !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(<?= $theme_cfg['rgb']; ?>, 0.35);
    }
    
    .sidebar-nav-link i {
        font-size: 1.25rem;
        margin-right: 12px;
    }

    /* Sub-menu styling for Transaksi dropdown */
    .sub-menu-nav {
        padding-left: 12px;
        margin-bottom: 6px;
    }
    
    .sidebar-sub-link {
        display: flex;
        align-items: center;
        padding: 9px 16px;
        color: rgba(255, 255, 255, 0.55);
        font-weight: 500;
        text-decoration: none;
        border-radius: 10px;
        margin: 2px 16px 2px 28px;
        font-size: 0.85rem;
        transition: all 0.2s ease;
    }
    
    .sidebar-sub-link:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
    }
    
    .sidebar-sub-link.active {
        color: #ffffff !important;
        font-weight: 750;
        background-color: rgba(255, 255, 255, 0.1);
        border-left: 3px solid <?= $theme_cfg['sidebar_active']; ?>;
    }
    
    .sidebar-sub-link i {
        font-size: 0.9rem;
        margin-right: 10px;
        opacity: 0.7;
    }

    [aria-expanded="true"] .toggle-chevron {
        transform: rotate(180deg);
    }
    .toggle-chevron {
        transition: transform 0.2s ease;
    }

    .user-profile-section {
        background-color: rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 12px;
        margin: 16px;
        border: 1px solid rgba(255, 255, 255, 0.03);
        transition: all 0.2s ease;
    }
    .user-profile-section:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    .user-profile-section .dropdown-toggle::after {
        margin-left: auto;
        color: rgba(255, 255, 255, 0.4);
    }
    .user-profile-section .dropdown-menu {
        background-color: #1e293b !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
        padding: 6px !important;
    }
    .user-profile-section .dropdown-item {
        color: #e2e8f0 !important;
        border-radius: 8px;
        transition: all 0.15s ease;
    }
    .user-profile-section .dropdown-item:hover {
        background-color: rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
    }
    .user-profile-section .dropdown-item.text-danger:hover {
        background-color: rgba(239, 68, 68, 0.15) !important;
        color: #ef4444 !important;
    }

    .mobile-header {
        background-color: <?= $theme_cfg['bg_sidebar']; ?>;
        color: #ffffff;
        padding: 15px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Penyesuaian layout fluid */
    .app-layout-wrapper {
        display: flex;
        min-height: 100vh;
        width: 100%;
    }

    .main-canvas-area {
        flex-grow: 1;
        background-color: #f8fafc;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    /* Override Warna Booster Bootstrap secara Dinamis */
    .btn-primary {
        background-color: <?= $theme_cfg['primary']; ?> !important;
        border-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .btn-primary:hover, .btn-primary:active, .btn-primary:focus {
        background-color: <?= $theme_cfg['hover']; ?> !important;
        border-color: <?= $theme_cfg['hover']; ?> !important;
    }
    .btn-outline-primary {
        color: <?= $theme_cfg['primary']; ?> !important;
        border-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .btn-outline-primary:hover {
        background-color: <?= $theme_cfg['primary']; ?> !important;
        color: #ffffff !important;
    }
    .text-primary {
        color: <?= $theme_cfg['primary']; ?> !important;
    }
    .bg-primary {
        background-color: <?= $theme_cfg['primary']; ?> !important;
    }
    .badge.bg-primary-subtle {
        background-color: rgba(<?= $theme_cfg['rgb']; ?>, 0.12) !important;
        color: <?= $theme_cfg['primary']; ?> !important;
        border: 1px solid rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }
    .border-primary-200 {
        border-color: rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }

    @media (max-width: 767.98px) {
        .sidebar-container {
            position: fixed;
            left: -280px;
            top: 0;
            bottom: 0;
            width: 280px;
            height: 100vh;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        .sidebar-container.show {
            left: 0;
        }

        .sidebar-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            z-index: 999;
        }

        .sidebar-backdrop.show {
            display: block;
        }
    }

    /* Collapsed state styles for medium and larger devices */
    @media (min-width: 768px) {
        .sidebar-container.collapsed {
            width: 80px;
        }
        .sidebar-container.collapsed .sidebar-brand-text,
        .sidebar-container.collapsed .sidebar-nav-link span,
        .sidebar-container.collapsed .sidebar-nav-link .toggle-chevron,
        .sidebar-container.collapsed .collapse,
        .sidebar-container.collapsed .collapse.show,
        .sidebar-container.collapsed .user-profile-text-wrapper,
        .sidebar-container.collapsed .dropdown-toggle::after {
            display: none !important;
        }
        .sidebar-container.collapsed .sidebar-brand {
            padding: 24px 0 !important;
            display: flex;
            justify-content: center !important;
        }
        .sidebar-container.collapsed .sidebar-brand a {
            justify-content: center !important;
            width: 100%;
        }
        .sidebar-container.collapsed .sidebar-brand img,
        .sidebar-container.collapsed .sidebar-brand i {
            margin-right: 0 !important;
        }
        .sidebar-container.collapsed .sidebar-nav-link {
            padding: 12px 0 !important;
            margin: 4px 12px !important;
            justify-content: center !important;
        }
        .sidebar-container.collapsed .sidebar-nav-link i {
            margin-right: 0 !important;
            font-size: 1.45rem !important;
        }
        .sidebar-container.collapsed .user-profile-section {
            padding: 10px 0 !important;
            margin: 16px 8px !important;
            justify-content: center !important;
        }
        .sidebar-container.collapsed .user-profile-section a {
            justify-content: center !important;
        }
    }

    /* Premium frosted glass and backdrop-blur overlays for floating modals */
    body.modal-open .app-layout-wrapper {
        transition: filter 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .modal-backdrop {
        background-color: rgba(15, 23, 42, 0.3) !important;
        backdrop-filter: blur(6px);
        transition: all 0.3s ease;
    }
    .modal-content {
        border: none !important;
        border-radius: 20px !important;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25) !important;
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
    }
    .modal-header {
        border-bottom: 1.5px solid rgba(241, 245, 249, 0.85) !important;
    }
    .modal-footer {
        border-top: 1.5px solid rgba(241, 245, 249, 0.85) !important;
    }
</style>

<div class="app-layout-wrapper">
    <!-- Backdrop untuk mobile menu -->
    <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebarMenu()"></div>

    <!-- Sidebar Container -->
    <aside class="sidebar-container d-flex flex-column" id="sidebarMenu">
        <!-- Brand Header Logo -->
        <div class="sidebar-brand">
            <?php
            $app_name_len = mb_strlen($app_name, 'UTF-8');
            $title_font_size = '1.14rem';
            if ($app_name_len > 20) {
                $title_font_size = '0.84rem';
            } elseif ($app_name_len > 15) {
                $title_font_size = '0.94rem';
            } elseif ($app_name_len > 10) {
                $title_font_size = '1.04rem';
            }
            ?>
            <a href="javascript:void(0)" onclick="toggleSidebarCollapse(); return false;" class="d-flex align-items-center text-white text-decoration-none" style="flex-grow: 1; min-width: 0;" title="Sembunyikan/Tampilkan Menu">
                <?php if (!empty($app_logo_image_url)): ?>
                    <img src="<?= htmlspecialchars($app_logo_image_url); ?>" alt="Logo" class="rounded-pill bg-white p-1" style="width: 34px; height: 34px; object-fit: contain; flex-shrink: 0; margin-right: 10px; align-self: center;">
                <?php else: ?>
                    <i class="bi <?= htmlspecialchars($app_logo_icon); ?> text-white fs-3" style="flex-shrink: 0; margin-right: 10px; align-self: center;"></i>
                <?php endif; ?>
                <div class="sidebar-brand-text d-flex flex-column justify-content-center" style="min-width: 0; line-height: 1.1;">
                    <h5 class="fw-bold mb-0 tracking-tight text-truncate" style="letter-spacing: -0.025em; color: #ffffff; font-size: <?= $title_font_size; ?>; line-height: 1.25;" title="<?= htmlspecialchars($app_name); ?>"><?= htmlspecialchars($app_name); ?></h5>
                    <span class="badge bg-primary-subtle text-primary font-monospace mt-1" style="font-size: 0.54rem; padding: 2px 4px; border-radius: 4px; width: fit-content; letter-spacing: 0.025em; font-weight: 700;"><?= htmlspecialchars($app_version); ?></span>
                </div>
            </a>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-grow-1 py-4">
            <?php if (has_menu_permission($user_role, 'dashboard')): ?>
            <a href="index.php" class="sidebar-nav-link <?= ($active_page === 'dashboard') ? 'active' : ''; ?>">
                <i class="bi bi-grid-fill"></i>
                <span><?= __('Dashboard', 'Dashboard'); ?></span>
            </a>
            <?php endif; ?>
            
            <!-- Dropdown Menu Transaksi -->
            <?php if (has_menu_permission($user_role, 'transaksi')): ?>
            <?php 
            $is_transaksi_active = in_array($active_page, ['transaksi', 'pemasukan', 'pengeluaran', 'transaksi_berulang']);
            ?>
            <a href="#menuTransaksi" data-bs-toggle="collapse" class="sidebar-nav-link d-flex justify-content-between align-items-center <?= $is_transaksi_active ? 'active' : ''; ?>" aria-expanded="<?= $is_transaksi_active ? 'true' : 'false'; ?>">
                <div class="d-flex align-items-center">
                    <i class="bi bi-cash-stack"></i>
                    <span><?= __('Transaksi', 'Transactions'); ?></span>
                </div>
                <i class="bi bi-chevron-down ms-auto toggle-chevron" style="font-size: 0.8rem; margin-right: 0;"></i>
            </a>
            <div class="collapse <?= $is_transaksi_active ? 'show' : ''; ?>" id="menuTransaksi">
                <div class="sub-menu-nav">
                    <a href="tambah.php?filter_jenis=semua" class="sidebar-sub-link <?= ($active_page === 'transaksi') ? 'active' : ''; ?>">
                        <i class="bi bi-arrow-repeat"></i>
                        <span><?= __('Semua Transaksi', 'All Transactions'); ?></span>
                    </a>
                    <a href="tambah.php?filter_jenis=pemasukan" class="sidebar-sub-link <?= ($active_page === 'pemasukan') ? 'active' : ''; ?>">
                        <i class="bi bi-graph-up-arrow"></i>
                        <span><?= __('Pemasukan', 'Income'); ?></span>
                    </a>
                    <a href="tambah.php?filter_jenis=pengeluaran" class="sidebar-sub-link <?= ($active_page === 'pengeluaran') ? 'active' : ''; ?>">
                        <i class="bi bi-graph-down-arrow"></i>
                        <span><?= __('Pengeluaran', 'Expense'); ?></span>
                    </a>
                    <a href="tambah.php?filter_jenis=berulang" class="sidebar-sub-link <?= ($active_page === 'transaksi_berulang') ? 'active' : ''; ?>">
                        <i class="bi bi-arrow-clockwise"></i>
                        <span><?= __('Transaksi Berulang', 'Recurring'); ?></span>
                    </a>
                </div>
            </div>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'laporan')): ?>
            <a href="laporan.php" class="sidebar-nav-link <?= ($active_page === 'laporan') ? 'active' : ''; ?>">
                <i class="bi bi-file-earmark-bar-graph-fill"></i>
                <span><?= __('Laporan', 'Reports'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'anggaran')): ?>
            <a href="anggaran.php" class="sidebar-nav-link <?= ($active_page === 'anggaran') ? 'active' : ''; ?>">
                <i class="bi bi-pie-chart-fill"></i>
                <span><?= __('Anggaran', 'Budgets'); ?></span>
            </a>
            <?php endif; ?>
 
            <?php if (has_menu_permission($user_role, 'rekening')): ?>
            <a href="rekening.php" class="sidebar-nav-link <?= ($active_page === 'rekening') ? 'active' : ''; ?>">
                <i class="bi bi-wallet2"></i>
                <span><?= __('Dompet / Rekening', 'Wallets / Accounts'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'kategori')): ?>
            <a href="kategori.php" class="sidebar-nav-link <?= ($active_page === 'kategori') ? 'active' : ''; ?>">
                <i class="bi bi-tag-fill"></i>
                <span><?= __('Kategori', 'Categories'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'kelola_user')): ?>
            <a href="kelola_user.php" class="sidebar-nav-link <?= ($active_page === 'kelola_user') ? 'active' : ''; ?>">
                <i class="bi bi-people-fill"></i>
                <span><?= __('Kelola User', 'Manage Users'); ?></span>
            </a>
            <?php endif; ?>
            
            <?php if (has_menu_permission($user_role, 'pengaturan')): ?>
            <a href="pengaturan.php" class="sidebar-nav-link <?= ($active_page === 'pengaturan') ? 'active' : ''; ?>">
                <i class="bi bi-gear-fill"></i>
                <span><?= __('Pengaturan', 'Settings'); ?></span>
            </a>
            <?php endif; ?>
        </nav>
 
        <!-- User Profile & Dropdown Box at Bottom -->
        <div class="mt-auto">
            <div class="user-profile-section dropdown">
                <a href="#" class="d-flex align-items-center gap-2 text-decoration-none dropdown-toggle w-100" id="userProfDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="outline: none;">
                    <div class="bg-primary rounded-circle text-center d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; flex-shrink: 0;">
                        <i class="bi bi-person-fill text-white fs-6"></i>
                    </div>
                    <div class="overflow-hidden flex-grow-1 text-start user-profile-text-wrapper">
                        <h6 class="fw-bold text-white mb-0 text-truncate" style="font-size: 0.8rem;"><?= $user_nama; ?></h6>
                        <span class="text-uppercase font-monospace text-slate-400 d-block text-truncate" style="font-size: 0.6rem;"><?= $user_role; ?></span>
                    </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-dark shadow border-0 mt-2" aria-labelledby="userProfDropdown" style="background-color: #1e293b; border-radius: 12px; font-size: 0.8rem; width: 100%;">
                    <li>
                        <div class="px-3 py-1.5 text-slate-400 font-monospace border-bottom border-secondary mb-1" style="font-size: 0.65rem; opacity: 0.8;">
                            <?= __('Sesi:', 'Session:'); ?> @<?= htmlspecialchars($user_username); ?>
                        </div>
                    </li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-white" href="pengaturan.php" style="font-size: 0.75rem;">
                            <i class="bi bi-gear-fill text-muted"></i> <?= __('Pengaturan', 'Settings'); ?>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-white" href="rekening.php" style="font-size: 0.75rem;">
                            <i class="bi bi-wallet2 text-muted"></i> <?= __('Dompet Saya', 'My Wallets'); ?>
                        </a>
                    </li>
                    <li><hr class="dropdown-divider border-secondary" style="opacity: 0.15; margin: 4px 0;"></li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger fw-semibold" href="logout.php" onclick="return confirm('<?= __('Apakah Anda yakin ingin keluar?', 'Are you sure you want to log out?'); ?>');" style="font-size: 0.75rem;">
                            <i class="bi bi-box-arrow-right"></i> <?= __('Keluar Akun', 'Log Out'); ?>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </aside>

    <!-- Main Canvas Area -->
    <div class="main-canvas-area col">
        <!-- Mobile Header Bar -->
        <header class="mobile-header d-md-none d-flex justify-content-between align-items-center">
            <a href="index.php" class="d-flex align-items-center text-white text-decoration-none">
                \<?php if (!empty(\$app_logo_image_url)): ?>
                    <img src="\<?= htmlspecialchars(\$app_logo_image_url); ?>" alt="Logo" class="rounded-pill me-2 bg-white p-0.5" style="width: 28px; height: 28px; object-fit: contain;">
                \<?php else: ?>
                    <i class="bi \<?= htmlspecialchars(\$app_logo_icon); ?> text-primary fs-4 me-2"></i>
                \<?php endif; ?>
                <h6 class="fw-bold mb-0 text-truncate" style="max-width: 180px;">\<?= htmlspecialchars(\$app_name); ?></h6>
            </a>
            <button class="btn btn-dark border-secondary px-2.5 py-1.5 rounded-3" onclick="toggleSidebarMenu()">
                <i class="bi bi-list fs-4 font-extrabold text-white"></i>
            </button>
        </header>

        <!-- Top breadcrumb bar for large screens -->
        <header class="bg-white border-bottom py-3 px-4 d-none d-md-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <span class="text-muted text-uppercase fw-bold font-monospace text-xs" style="font-size: 0.7rem; letter-spacing: 0.05em">Aplikasi \<?= htmlspecialchars(\$app_name); ?> Native PHP</span>
                <i class="bi bi-chevron-right text-muted" style="font-size: 0.8rem;"></i>
                <span class="text-dark fw-bold text-xs" style="font-size: 0.8rem;"><?= htmlspecialchars(ucwords(str_replace('_', ' ', $active_page))); ?></span>
            </div>
            
            <div class="d-flex align-items-center gap-2 font-monospace text-xs bg-light px-3 py-1.5 rounded-3 text-muted" style="font-size: 0.75rem;">
                <i class="bi bi-clock-fill text-primary"></i>
                <span>Waktu Server: <?= date('d M Y'); ?></span>
            </div>
        </header>

        <!-- Container for inner contents -->
        <div class="p-3 p-md-4 flex-grow-1 overflow-auto">
<script>
    function toggleSidebarMenu() {
        const sidebar = document.getElementById('sidebarMenu');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (sidebar && backdrop) {
            sidebar.classList.toggle('show');
            backdrop.classList.toggle('show');
        }
    }

    function toggleSidebarCollapse() {
        const sidebar = document.getElementById('sidebarMenu');
        const desktopIcon = document.getElementById('desktopToggleIcon');
        if (!sidebar) return;
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        if (isCollapsed) {
            sidebar.classList.remove('collapsed');
            localStorage.setItem('sidebar-collapsed', 'false');
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-left text-white opacity-75 fs-6';
            }
        } else {
            sidebar.classList.add('collapsed');
            localStorage.setItem('sidebar-collapsed', 'true');
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-right text-white opacity-75 fs-6';
            }
        }
    }

    // Set status tombol & ikon dari localStorage saat halaman termuat
    document.addEventListener('DOMContentLoaded', function() {
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        const sidebar = document.getElementById('sidebarMenu');
        const desktopIcon = document.getElementById('desktopToggleIcon');
        
        if (isCollapsed) {
            if (sidebar && window.innerWidth >= 768) {
                sidebar.classList.add('collapsed');
            }
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-right text-white opacity-75 fs-6';
            }
        } else {
            if (desktopIcon) {
                desktopIcon.className = 'bi bi-chevron-bar-left text-white opacity-75 fs-6';
            }
        }
    });
</script>

`;

export const PENGATURAN_PHP = `<?php
// pengaturan.php
// Halaman Pengaturan Aplikasi (Kelola Kategori Transaksi dan Pilih Tema Warna)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_username = $_SESSION['username'] ?? 'user';
$user_role = $_SESSION['role'] ?? 'admin';
$success_msg = "";
$error_msg = "";

// 1. Array Kategori Proteksi Sistem (Tidak boleh dihapus)
$system_categories = ['Gaji', 'Belanja', 'Transportasi', 'Makan & Minum', 'Tagihan', 'Freelance', 'Lainnya'];

// 2. Aksi: Ubah Tema Warna Aplikasi
if (isset($_POST['update_theme'])) {
    $new_theme = mysqli_real_escape_string($koneksi, $_POST['theme'] ?? 'slate');
    $valid_themes = ['slate', 'emerald', 'violet', 'crimson', 'amber'];
    
    if (in_array($new_theme, $valid_themes)) {
        $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
        $update_query = "UPDATE users SET theme = '$new_theme' WHERE username = '$db_username_escaped'";
        
        if (mysqli_query($koneksi, $update_query)) {
            $_SESSION['theme'] = $new_theme;
            $success_msg = "Tema warna aplikasi berhasil diperbarui menjadi " . ucwords($new_theme) . "!";

            // Sync login design with chosen theme colors automatically
            $theme_login_colors = [
                'slate' => [
                    'start' => '#1e293b',
                    'mid' => '#0f172a',
                    'end' => '#020617',
                    'accent' => '#2563eb',
                    'hover' => '#1d4ed8'
                ],
                'emerald' => [
                    'start' => '#064e3b',
                    'mid' => '#022c22',
                    'end' => '#081d33',
                    'accent' => '#059669',
                    'hover' => '#047857'
                ],
                'violet' => [
                    'start' => '#4c1d95',
                    'mid' => '#2e1065',
                    'end' => '#0f052d',
                    'accent' => '#7c3aed',
                    'hover' => '#6d28d9'
                ],
                'crimson' => [
                    'start' => '#7f1d1d',
                    'mid' => '#450a0a',
                    'end' => '#1c0202',
                    'accent' => '#dc2626',
                    'hover' => '#b91c1c'
                ],
                'amber' => [
                    'start' => '#78350f',
                    'mid' => '#451a03',
                    'end' => '#1e0800',
                    'accent' => '#d97706',
                    'hover' => '#b45309'
                ]
            ];

            if (isset($theme_login_colors[$new_theme])) {
                $cols = $theme_login_colors[$new_theme];
                $start_val = mysqli_real_escape_string($koneksi, $cols['start']);
                $mid_val = mysqli_real_escape_string($koneksi, $cols['mid']);
                $end_val = mysqli_real_escape_string($koneksi, $cols['end']);
                $accent_val = mysqli_real_escape_string($koneksi, $cols['accent']);
                $hover_val = mysqli_real_escape_string($koneksi, $cols['hover']);

                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_start', '$start_val') ON DUPLICATE KEY UPDATE nilai = '$start_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_mid', '$mid_val') ON DUPLICATE KEY UPDATE nilai = '$mid_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_end', '$end_val') ON DUPLICATE KEY UPDATE nilai = '$end_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_accent_color', '$accent_val') ON DUPLICATE KEY UPDATE nilai = '$accent_val'");
                mysqli_query($koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_hover_color', '$hover_val') ON DUPLICATE KEY UPDATE nilai = '$hover_val'");
                
                $login_grad_start = $cols['start'];
                $login_grad_mid = $cols['mid'];
                $login_grad_end = $cols['end'];
                $login_accent_color = $cols['accent'];
                $login_hover_color = $cols['hover'];
            }
        } else {
            $error_msg = "Gagal memperbarui tema di database.";
        }
    } else {
        $error_msg = "Pilihan tema tidak valid.";
    }
}

// 2b. Aksi: Ubah Bahasa Aplikasi (Indonesian & English support)
if (isset($_POST['update_lang'])) {
    $new_lang = mysqli_real_escape_string($koneksi, $_POST['lang'] ?? 'id');
    $valid_langs = ['id', 'en'];
    
    if (in_array($new_lang, $valid_langs)) {
        $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
        $update_query = "UPDATE users SET lang = '$new_lang' WHERE username = '$db_username_escaped'";
        
        if (mysqli_query($koneksi, $update_query)) {
            $_SESSION['lang'] = $new_lang;
            $success_msg = ($new_lang === 'id') ? "Bahasa aplikasi berhasil diubah menjadi Bahasa Indonesia!" : "Application language updated to English successfully!";
        } else {
            $error_msg = "Gagal memperbarui bahasa di database.";
        }
    } else {
        $error_msg = "Pilihan bahasa tidak valid.";
    }
}

// Kategori Transaksi telah dipindahkan ke halaman khusus kategori.php

// 5. Aksi: Ubah Kustomisasi Tampilan Dashboard
if (isset($_POST['update_dashboard_config'])) {
    $show_card_in = isset($_POST['show_card_in']) ? 1 : 0;
    $show_card_out = isset($_POST['show_card_out']) ? 1 : 0;
    $show_card_balance = isset($_POST['show_card_balance']) ? 1 : 0;
    $show_chart_trend = isset($_POST['show_chart_trend']) ? 1 : 0;
    $show_chart_prop = isset($_POST['show_chart_prop']) ? 1 : 0;

    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $update_query = "UPDATE users SET 
        show_card_in = $show_card_in, 
        show_card_out = $show_card_out, 
        show_card_balance = $show_card_balance, 
        show_chart_trend = $show_chart_trend, 
        show_chart_prop = $show_chart_prop 
        WHERE username = '$db_username_escaped'";
        
    if (mysqli_query(\$koneksi, \$update_query)) {
        \$success_msg = "Pengaturan tampilan dashboard berhasil diperbarui!";
    } else {
        \$error_msg = "Gagal memperbarui pengaturan dashboard di database.";
    }
}

// 6. Aksi: Ubah Layout Desain Sistem
if (isset(\$_POST['update_system_design'])) {
    if (\$user_role === 'user') {
        \$error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan mengubah desain sistem.";
    } else {
        \$new_app_name = trim(\$_POST['nama_aplikasi'] ?? '');
        \$new_logo_icon = trim(\$_POST['logo_icon'] ?? 'bi-wallet2');
        \$new_app_footer = trim(\$_POST['app_footer'] ?? '');
        \$new_app_version = trim(\$_POST['app_version'] ?? 'v1.3 - Pro');

        if (empty(\$new_app_name)) {
            \$error_msg = "Nama aplikasi tidak boleh kosong!";
        } else {
            \$upload_ok = true;
            \$new_logo_img = \$app_logo_image_url; // default keep existing
            \$new_app_favicon = \$app_favicon; // default keep existing

            // Handle Logo Upload
            if (isset(\$_FILES['logo_upload']) && \$_FILES['logo_upload']['error'] === UPLOAD_ERR_OK) {
                \$file_tmp = \$_FILES['logo_upload']['tmp_name'];
                \$file_name = \$_FILES['logo_upload']['name'];
                \$file_ext = strtolower(pathinfo(\$file_name, PATHINFO_EXTENSION));
                \$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];

                if (in_array(\$file_ext, \$allowed_extensions)) {
                    if (!is_dir('uploads')) {
                        @mkdir('uploads', 0777, true);
                    }

                    // Hapus file lama jika ada dan merupakan file lokal
                    if (!empty(\$app_logo_image_url) && strpos(\$app_logo_image_url, 'uploads/') === 0 && file_exists(\$app_logo_image_url)) {
                        @unlink(\$app_logo_image_url);
                    }

                    \$new_filename = 'logo_' . time() . '.' . \$file_ext;
                    \$dest_path = 'uploads/' . \$new_filename;

                    if (move_uploaded_file(\$file_tmp, \$dest_path)) {
                        \$new_logo_img = \$dest_path;
                    } else {
                        \$error_msg = "Gagal memindahkan file ke direktori uploads. Cek perijinan folder.";
                        \$upload_ok = false;
                    }
                } else {
                    \$error_msg = "Format gambar tidak didukung! Format yang diperbolehkan: JPG, JPEG, PNG, GIF, SVG, WEBP.";
                    \$upload_ok = false;
                }
            } elseif (isset(\$_POST['clear_logo']) && \$_POST['clear_logo'] == '1') {
                if (!empty(\$app_logo_image_url) && strpos(\$app_logo_image_url, 'uploads/') === 0 && file_exists(\$app_logo_image_url)) {
                    @unlink(\$app_logo_image_url);
                }
                \$new_logo_img = '';
            }

            // Handle Favicon Upload
            if (\$upload_ok && isset(\$_FILES['favicon_upload']) && \$_FILES['favicon_upload']['error'] === UPLOAD_ERR_OK) {
                \$fav_tmp = \$_FILES['favicon_upload']['tmp_name'];
                \$fav_name = \$_FILES['favicon_upload']['name'];
                \$fav_ext = strtolower(pathinfo(\$fav_name, PATHINFO_EXTENSION));
                \$fav_allowed = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'];

                if (in_array(\$fav_ext, \$fav_allowed)) {
                    if (!is_dir('uploads')) {
                        @mkdir('uploads', 0777, true);
                    }

                    // Hapus favicon lama jika ada dan merupakan file lokal
                    if (!empty(\$app_favicon) && strpos(\$app_favicon, 'uploads/') === 0 && file_exists(\$app_favicon)) {
                        @unlink(\$app_favicon);
                    }

                    \$new_fav_filename = 'favicon_' . time() . '.' . \$fav_ext;
                    \$fav_dest_path = 'uploads/' . \$new_fav_filename;

                    if (move_uploaded_file(\$fav_tmp, \$fav_dest_path)) {
                        \$new_app_favicon = \$fav_dest_path;
                    } else {
                        \$error_msg = "Gagal memindahkan favicon ke direktori uploads.";
                        \$upload_ok = false;
                    }
                } else {
                    \$error_msg = "Format favicon tidak didukung! Format yang diperbolehkan: JPG, JPEG, PNG, GIF, SVG, WEBP, ICO.";
                    \$upload_ok = false;
                }
            } elseif (\$upload_ok && isset(\$_POST['clear_favicon']) && \$_POST['clear_favicon'] == '1') {
                if (!empty(\$app_favicon) && strpos(\$app_favicon, 'uploads/') === 0 && file_exists(\$app_favicon)) {
                    @unlink(\$app_favicon);
                }
                \$new_app_favicon = 'https://cdn-icons-png.flaticon.com/512/2920/2920083.png'; // default fallback
            }

            if (\$upload_ok) {
                \$escaped_name = mysqli_real_escape_string(\$koneksi, \$new_app_name);
                \$escaped_icon = mysqli_real_escape_string(\$koneksi, \$new_logo_icon);
                \$escaped_img = mysqli_real_escape_string(\$koneksi, \$new_logo_img);
                \$escaped_favicon = mysqli_real_escape_string(\$koneksi, \$new_app_favicon);
                \$escaped_footer = mysqli_real_escape_string(\$koneksi, \$new_app_footer);
                \$escaped_version = mysqli_real_escape_string(\$koneksi, \$new_app_version);

                \$q1 = mysqli_query(\$koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('nama_aplikasi', '\$escaped_name') ON DUPLICATE KEY UPDATE nilai = '\$escaped_name'");
                \$q2 = mysqli_query(\$koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('logo_icon', '\$escaped_icon') ON DUPLICATE KEY UPDATE nilai = '\$escaped_icon'");
                \$q3 = mysqli_query(\$koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('logo_image_url', '\$escaped_img') ON DUPLICATE KEY UPDATE nilai = '\$escaped_img'");
                \$q4 = mysqli_query(\$koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('app_favicon_url', '\$escaped_favicon') ON DUPLICATE KEY UPDATE nilai = '\$escaped_favicon'");
                \$q5 = mysqli_query(\$koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('app_footer', '\$escaped_footer') ON DUPLICATE KEY UPDATE nilai = '\$escaped_footer'");
                \$q6 = mysqli_query(\$koneksi, "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('app_version', '\$escaped_version') ON DUPLICATE KEY UPDATE nilai = '\$escaped_version'");

                if (\$q1 && \$q2 && \$q3 && \$q4 && \$q5 && \$q6) {
                    \$success_msg = "Desain sistem & identitas aplikasi berhasil diperbarui!";
                    \$app_name = \$new_app_name;
                    \$app_logo_icon = \$new_logo_icon;
                    \$app_logo_image_url = \$new_logo_img;
                    \$app_favicon = \$new_app_favicon;
                    \$app_footer = \$new_app_footer;
                    \$app_version = \$new_app_version;
                } else {
                    \$error_msg = "Gagal memperbarui konfigurasi desain sistem.";
                }
            }
        }
    }
}

// 6b. Aksi: Ubah Desain Form Login
if (isset(\$_POST['update_login_design'])) {
    if (\$user_role === 'user') {
        \$error_msg = "Akses Ditolak: Peran 'user' tidak diizinkan mengubah desain portal login.";
    } else {
        \$login_title = trim(\$_POST['login_title'] ?? 'Selamat Datang');
        \$login_subtitle = trim(\$_POST['login_subtitle'] ?? '');
        \$login_slogan_1 = trim(\$_POST['login_slogan_1'] ?? '');
        \$login_slogan_2 = trim(\$_POST['login_slogan_2'] ?? '');
        \$login_desc = trim(\$_POST['login_desc'] ?? '');
        \$login_badge_title = trim(\$_POST['login_badge_title'] ?? '');
        \$login_badge_desc = trim(\$_POST['login_badge_desc'] ?? '');
        \$login_version = trim(\$_POST['login_version'] ?? 'v1.4 SECURE');

        \$login_grad_start = trim(\$_POST['login_grad_start'] ?? '#064e3b');
        \$login_grad_mid = trim(\$_POST['login_grad_mid'] ?? '#022c22');
        \$login_grad_end = trim(\$_POST['login_grad_end'] ?? '#081d33');
        \$login_accent_color = trim(\$_POST['login_accent_color'] ?? '#059669');
        \$login_hover_color = trim(\$_POST['login_hover_color'] ?? '#047857');

        \$esc_title = mysqli_real_escape_string(\$koneksi, \$login_title);
        \$esc_subtitle = mysqli_real_escape_string(\$koneksi, \$login_subtitle);
        \$esc_slogan_1 = mysqli_real_escape_string(\$koneksi, \$login_slogan_1);
        \$esc_slogan_2 = mysqli_real_escape_string(\$koneksi, \$login_slogan_2);
        \$esc_desc = mysqli_real_escape_string(\$koneksi, \$login_desc);
        \$esc_b_title = mysqli_real_escape_string(\$koneksi, \$login_badge_title);
        \$esc_b_desc = mysqli_real_escape_string(\$koneksi, \$login_badge_desc);
        \$esc_login_version = mysqli_real_escape_string(\$koneksi, \$login_version);

        \$esc_grad_start = mysqli_real_escape_string(\$koneksi, \$login_grad_start);
        \$esc_grad_mid = mysqli_real_escape_string(\$koneksi, \$login_grad_mid);
        \$esc_grad_end = mysqli_real_escape_string(\$koneksi, \$login_grad_end);
        \$esc_accent = mysqli_real_escape_string(\$koneksi, \$login_accent_color);
        \$esc_hover = mysqli_real_escape_string(\$koneksi, \$login_hover_color);

        \$queries = [
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_title', '\$esc_title') ON DUPLICATE KEY UPDATE nilai = '\$esc_title'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_subtitle', '\$esc_subtitle') ON DUPLICATE KEY UPDATE nilai = '\$esc_subtitle'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_slogan_1', '\$esc_slogan_1') ON DUPLICATE KEY UPDATE nilai = '\$esc_slogan_1'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_slogan_2', '\$esc_slogan_2') ON DUPLICATE KEY UPDATE nilai = '\$esc_slogan_2'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_desc', '\$esc_desc') ON DUPLICATE KEY UPDATE nilai = '\$esc_desc'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_badge_title', '\$esc_b_title') ON DUPLICATE KEY UPDATE nilai = '\$esc_b_title'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_badge_desc', '\$esc_b_desc') ON DUPLICATE KEY UPDATE nilai = '\$esc_b_desc'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_version', '\$esc_login_version') ON DUPLICATE KEY UPDATE nilai = '\$esc_login_version'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_start', '\$esc_grad_start') ON DUPLICATE KEY UPDATE nilai = '\$esc_grad_start'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_mid', '\$esc_grad_mid') ON DUPLICATE KEY UPDATE nilai = '\$esc_grad_mid'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_grad_end', '\$esc_grad_end') ON DUPLICATE KEY UPDATE nilai = '\$esc_grad_end'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_accent_color', '\$esc_accent') ON DUPLICATE KEY UPDATE nilai = '\$esc_accent'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('login_hover_color', '\$esc_hover') ON DUPLICATE KEY UPDATE nilai = '\$esc_hover'"
        ];

        \$all_ok = true;
        foreach (\$queries as \$q) {
            if (!mysqli_query(\$koneksi, \$q)) {
                \$all_ok = false;
            }
        }

        if (\$all_ok) {
            \$success_msg = "Desain halaman login berhasil diperbarui!";
            \$sys_settings['login_title'] = \$login_title;
            \$sys_settings['login_subtitle'] = \$login_subtitle;
            \$sys_settings['login_slogan_1'] = \$login_slogan_1;
            \$sys_settings['login_slogan_2'] = \$login_slogan_2;
            \$sys_settings['login_desc'] = \$login_desc;
            \$sys_settings['login_badge_title'] = \$login_badge_title;
            \$sys_settings['login_badge_desc'] = \$login_badge_desc;
            \$sys_settings['login_version'] = \$login_version;
            \$sys_settings['login_grad_start'] = \$login_grad_start;
            \$sys_settings['login_grad_mid'] = \$login_grad_mid;
            \$sys_settings['login_grad_end'] = \$login_grad_end;
            \$sys_settings['login_accent_color'] = \$login_accent_color;
            \$sys_settings['login_hover_color'] = \$login_hover_color;
        } else {
            \$error_msg = "Gagal memperbarui konfigurasi desain form login.";
        }
    }
}

// 6c. Aksi: Ubah Desain Cetak Laporan Keuangan
if (isset(\$_POST['update_print_design'])) {
    if (\$user_role === 'user') {
        \$error_msg = "Akses Ditolak: Peran 'user' tidak diizinkan mengubah desain cetak laporan.";
    } else {
        \$p_title = trim(\$_POST['print_header_title'] ?? 'LAPORAN CATATAN TRANSAKSI KEUANGAN');
        \$p_subtitle = trim(\$_POST['print_header_subtitle'] ?? '');
        \$p_logo = isset(\$_POST['print_header_logo']) ? '1' : '0';
        \$p_color = trim(\$_POST['print_header_color'] ?? '#0f172a');
        \$p_divider = trim(\$_POST['print_divider_style'] ?? 'double');
        \$p_footer = trim(\$_POST['print_footer_note'] ?? '');

        \$esc_p_title = mysqli_real_escape_string(\$koneksi, \$p_title);
        \$esc_p_subtitle = mysqli_real_escape_string(\$koneksi, \$p_subtitle);
        \$esc_p_logo = mysqli_real_escape_string(\$koneksi, \$p_logo);
        \$esc_p_color = mysqli_real_escape_string(\$koneksi, \$p_color);
        \$esc_p_divider = mysqli_real_escape_string(\$koneksi, \$p_divider);
        \$esc_p_footer = mysqli_real_escape_string(\$koneksi, \$p_footer);

        \$queries = [
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('print_header_title', '\$esc_p_title') ON DUPLICATE KEY UPDATE nilai = '\$esc_p_title'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('print_header_subtitle', '\$esc_p_subtitle') ON DUPLICATE KEY UPDATE nilai = '\$esc_p_subtitle'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('print_header_logo', '\$esc_p_logo') ON DUPLICATE KEY UPDATE nilai = '\$esc_p_logo'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('print_header_color', '\$esc_p_color') ON DUPLICATE KEY UPDATE nilai = '\$esc_p_color'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('print_divider_style', '\$esc_p_divider') ON DUPLICATE KEY UPDATE nilai = '\$esc_p_divider'",
            "INSERT INTO pengaturan_sistem (kunci, nilai) VALUES ('print_footer_note', '\$esc_p_footer') ON DUPLICATE KEY UPDATE nilai = '\$esc_p_footer'"
        ];

        \$all_ok = true;
        foreach (\$queries as \$q) {
            if (!mysqli_query(\$koneksi, \$q)) {
                \$all_ok = false;
            }
        }

        if (\$all_ok) {
            \$success_msg = "Desain cetak laporan keuangan berhasil diperbarui!";
            \$print_header_title = \$p_title;
            \$print_header_subtitle = \$p_subtitle;
            \$print_header_logo = \$p_logo;
            \$print_header_color = \$p_color;
            \$print_divider_style = \$p_divider;
            \$print_footer_note = \$p_footer;
        } else {
            \$error_msg = "Gagal memperbarui konfigurasi desain cetak laporan.";
        }
    }
}

// Ambil kustomisasi dashboard saat ini milik pengguna ini
$show_card_in = 1;
$show_card_out = 1;
$show_card_balance = 1;
$show_chart_trend = 1;
$show_chart_prop = 1;

if (isset($koneksi)) {
    $db_username_escaped = mysqli_real_escape_string($koneksi, $user_username);
    $config_query = mysqli_query($koneksi, "SELECT show_card_in, show_card_out, show_card_balance, show_chart_trend, show_chart_prop FROM users WHERE username = '$db_username_escaped'");
    if ($config_query && mysqli_num_rows($config_query) > 0) {
        $config_row = mysqli_fetch_assoc($config_query);
        $show_card_in = isset($config_row['show_card_in']) ? (int)$config_row['show_card_in'] : 1;
        $show_card_out = isset($config_row['show_card_out']) ? (int)$config_row['show_card_out'] : 1;
        $show_card_balance = isset($config_row['show_card_balance']) ? (int)$config_row['show_card_balance'] : 1;
        $show_chart_trend = isset($config_row['show_chart_trend']) ? (int)$config_row['show_chart_trend'] : 1;
        $show_chart_prop = isset($config_row['show_chart_prop']) ? (int)$config_row['show_chart_prop'] : 1;
    }
}

// Set active page for sidebar
$active_page = 'pengaturan';
$current_lang = $_SESSION['lang'] ?? 'id';
?>
<!DOCTYPE html>
<html lang="<?= $current_lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= __('Pengaturan', 'Settings') ?> <?= $app_name; ?> - Pro</title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
        }
        
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            background-color: #ffffff;
        }

        .theme-selection-card {
            border: 2px solid #f1f5f9;
            border-radius: 16px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .theme-selection-card:hover {
            border-color: #cbd5e1;
            transform: translateY(-2px);
        }

        .theme-selection-card.selected {
            border-color: var(--primary-color, #2563eb);
            background-color: rgba(var(--primary-rgb, 37, 99, 235), 0.03);
            box-shadow: 0 4px 12px rgba(var(--primary-rgb, 37, 99, 235), 0.08);
        }

        .badge-theme-dot {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-block;
        }

        .badge-cat {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 500;
            font-size: 0.85rem;
            padding: 8px 14px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #e2e8f0;
        }

        .badge-cat-system {
            background-color: #f8fafc;
            color: #64748b;
            border-style: dashed;
        }

        /* Custom Tab Styling */
        .settings-nav {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            margin-bottom: 24px;
        }
        
        .settings-nav .nav-link {
            color: #475569;
            font-weight: 600;
            font-size: 0.9rem;
            border-radius: 10px;
            padding: 10px 20px;
            border: none;
            transition: all 0.25s ease;
            background: transparent;
        }
        
        .settings-nav .nav-link:hover {
            color: #1e293b;
            background-color: #f1f5f9;
        }
    </style>
</head>
<body>

<?php include 'sidebar.php'; ?>

<style>
    /* Dynamic Active state colored based on active theme config */
    .settings-nav .nav-link.active {
        color: #ffffff !important;
        background-color: <?= $theme_cfg['primary']; ?> !important;
        box-shadow: 0 4px 12px rgba(<?= $theme_cfg['rgb']; ?>, 0.2) !important;
    }
</style>

<!-- Content Area -->
<div class="container-fluid py-2">
    
    <!-- Notifikasi Sukses / Gagal -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
            <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
            <div>
                <strong class="text-success-800 d-block">Berhasil!</strong>
                <span class="small text-slate-600"><?= $success_msg; ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
            <div>
                <strong class="text-danger-800 d-block">Terjadi Kesalahan!</strong>
                <span class="small text-slate-600"><?= $error_msg; ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Tabs Navigation -->
    <div class="row mb-2">
        <div class="col-12 col-md-10 col-lg-8 mx-auto">
            <ul class="nav nav-pills nav-fill settings-nav p-1" id="settingsTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="tab-tema" data-bs-toggle="pill" data-bs-target="#pane-tema" type="button" role="tab" aria-controls="pane-tema" aria-selected="true">
                        <i class="bi bi-palette-fill me-2"></i><?= __('Tema Warna', 'Color Theme') ?>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-dashboard" data-bs-toggle="pill" data-bs-target="#pane-dashboard" type="button" role="tab" aria-controls="pane-dashboard" aria-selected="false">
                        <i class="bi bi-sliders me-2"></i><?= __('Desain Dashboard', 'Dashboard Design') ?>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-bahasa" data-bs-toggle="pill" data-bs-target="#pane-bahasa" type="button" role="tab" aria-controls="pane-bahasa" aria-selected="false">
                        <i class="bi bi-translate me-2"></i><?= __('Ubah Bahasa', 'Change Language') ?>
                    </button>
                </li>
                \<?php if (\$user_role !== 'user'): ?>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-desainsistem" data-bs-toggle="pill" data-bs-target="#pane-desainsistem" type="button" role="tab" aria-controls="pane-desainsistem" aria-selected="false">
                        <i class="bi bi-window-sidebar me-2"></i><?= __('Desain Sistem', 'System Design') ?>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-desainlogin" data-bs-toggle="pill" data-bs-target="#pane-desainlogin" type="button" role="tab" aria-controls="pane-desainlogin" aria-selected="false">
                        <i class="bi bi-lock-fill me-2"></i><?= __('Desain Form Login', 'Login Form Design') ?>
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-desaincetak" data-bs-toggle="pill" data-bs-target="#pane-desaincetak" type="button" role="tab" aria-controls="pane-desaincetak" aria-selected="false">
                        <i class="bi bi-printer-fill me-2"></i><?= __('Desain Cetak Laporan', 'Report Print Design') ?>
                    </button>
                </li>
                \<?php endif; ?>
                \<?php if (\$user_role === 'superadmin'): ?>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="tab-otoritas" data-bs-toggle="pill" data-bs-target="#pane-otoritas" type="button" role="tab" aria-controls="pane-otoritas" aria-selected="false">
                        <i class="bi bi-shield-lock-fill me-2"></i><?= __('Otoritas Peran', 'Role Settings') ?>
                    </button>
                </li>
                \<?php endif; ?>
            </ul>
        </div>
    </div>

    <!-- Tabs Content Panes -->
    <div class="tab-content" id="settingsTabContent">
        
        <!-- 1. TAB TEMA WARNA -->
        <div class="tab-pane fade show active" id="pane-tema" role="tabpanel" aria-labelledby="tab-tema">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block">
                                <i class="bi bi-palette-fill text-primary class-fs-4 fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Tema Warna Aplikasi</h4>
                                <p class="text-muted small mb-0">Ubah nuansa visual dasbor & sidebar personal Anda</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST">
                            <input type="hidden" name="update_theme" value="1">
                            
                            <div class="d-flex flex-column gap-3 mb-4">
                                <!-- Theme Slate -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'slate') ? 'selected' : ''; ?>" for="theme_slate">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #2563eb;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Modern Slate (Default)</h6>
                                            <span class="text-muted small">Warna biru korporat profesional dengan sidebar gelap</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_slate" value="slate" <?= ($current_theme === 'slate') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Emerald -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'emerald') ? 'selected' : ''; ?>" for="theme_emerald">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #059669;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Emerald Forest</h6>
                                            <span class="text-muted small">Sentuhan hijau segar yang melambangkan kemakmuran finansial</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_emerald" value="emerald" <?= ($current_theme === 'emerald') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Violet -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'violet') ? 'selected' : ''; ?>" for="theme_violet">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #7c3aed;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Royal Violet</h6>
                                            <span class="text-muted small">Nuansa ungu mewah dengan visual modern yang eksklusif</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_violet" value="violet" <?= ($current_theme === 'violet') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Crimson -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'crimson') ? 'selected' : ''; ?>" for="theme_crimson">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #dc2626;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Charcoal Crimson</h6>
                                            <span class="text-muted small">Aksen merah gelap elegan yang berani dan energik</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_crimson" value="crimson" <?= ($current_theme === 'crimson') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- Theme Amber -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_theme === 'amber') ? 'selected' : ''; ?>" for="theme_amber">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <div class="badge-theme-dot" style="background-color: #d97706;"></div>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Amber Sunset</h6>
                                            <span class="text-muted small">Warna jingga hangat yang bersahabat dan penuh semangat</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="theme" id="theme_amber" value="amber" <?= ($current_theme === 'amber') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>
                            </div>

                            <div class="d-grid col-md-8 mx-auto">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> Simpan Pilihan Tema Warna
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. TAB DESAIN DASHBOARD -->
        <div class="tab-pane fade" id="pane-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block">
                                <i class="bi bi-sliders text-primary fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Atur Komponen Dashboard</h4>
                                <p class="text-muted small mb-0">Aktifkan atau sembunyikan grafik dan kartu keuangan Anda</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST">
                            <input type="hidden" name="update_dashboard_config" value="1">
                            
                            <h6 class="fw-bold text-slate-800 mb-3 border-bottom pb-2">
                                <i class="bi bi-card-checklist text-primary me-2"></i>Kartu Ringkasan (Cards)
                            </h6>
                            
                            <div class="mb-4">
                                <!-- Card Pemasukan Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(16, 185, 129, 0.1); color: #10b981;">
                                            <i class="bi bi-graph-up-arrow"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_card_in">Kartu Total Pemasukan</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_card_in" name="show_card_in" value="1" <?= $show_card_in ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>

                                <!-- Card Pengeluaran Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444;">
                                            <i class="bi bi-graph-down-arrow"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_card_out">Kartu Total Pengeluaran</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_card_out" name="show_card_out" value="1" <?= $show_card_out ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>

                                <!-- Card Saldo Akhir Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(37, 99, 235, 0.1); color: #2563eb;">
                                            <i class="bi bi-cash-stack"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_card_balance">Kartu Saldo Akhir</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_card_balance" name="show_card_balance" value="1" <?= $show_card_balance ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>
                            </div>

                            <h6 class="fw-bold text-slate-800 mb-3 border-bottom pb-2">
                                <i class="bi bi-pie-chart text-primary me-2"></i>Komponen Grafik (Charts)
                            </h6>

                            <div class="mb-4">
                                <!-- Chart Arus Kas Toggle -->
                                <div class="form-check form-switch mb-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(6, 182, 212, 0.1); color: #06b6d4;">
                                            <i class="bi bi-activity"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_chart_trend">Grafik Tren Aliran Dana (Garis)</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_chart_trend" name="show_chart_trend" value="1" <?= $show_chart_trend ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>

                                <!-- Chart Proporsi Kategori Toggle -->
                                <div class="form-check form-switch mb-4 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-3">
                                        <span class="p-2 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 38px; height: 38px; background-color: rgba(245, 158, 11, 0.1); color: #f59e0b;">
                                            <i class="bi bi-pie-chart-fill"></i>
                                        </span>
                                        <label class="form-check-label fw-semibold text-slate-800 cursor-pointer m-0" for="show_chart_prop">Grafik Proporsi Kategori (Donat)</label>
                                    </div>
                                    <input class="form-check-input ms-3 cursor-pointer" type="checkbox" role="switch" id="show_chart_prop" name="show_chart_prop" value="1" <?= $show_chart_prop ? 'checked' : ''; ?> style="width: 2.85em; height: 1.5em;">
                                </div>
                            </div>

                            <div class="d-grid col-md-8 mx-auto">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-save2-fill me-1.5"></i> Simpan Konfigurasi Dashboard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. TAB UBAH BAHASA -->
        <div class="tab-pane fade" id="pane-bahasa" role="tabpanel" aria-labelledby="tab-bahasa">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-7">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 rounded-4 bg-primary-subtle d-inline-block">
                                <i class="bi bi-translate text-primary fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0"><?= __('Pengaturan Bahasa', 'Language Settings'); ?></h4>
                                <p class="text-muted small mb-0"><?= __('Pilih bahasa pengantar antarmuka aplikasi Anda', 'Choose the language for your application interface'); ?></p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST">
                            <input type="hidden" name="update_lang" value="1">
                            
                            <div class="d-flex flex-column gap-3 mb-4">
                                <!-- Bahasa Indonesia -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_lang === 'id') ? 'selected' : ''; ?>" for="lang_id">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <span class="fs-3">🇮🇩</span>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">Bahasa Indonesia</h6>
                                            <span class="text-muted small">Gunakan Bahasa Indonesia sebagai bahasa default aplikasi</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="lang" id="lang_id" value="id" <?= ($current_lang === 'id') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>

                                <!-- English -->
                                <label class="theme-selection-card d-flex align-items-center justify-between w-full <?= ($current_lang === 'en') ? 'selected' : ''; ?>" for="lang_en">
                                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                                        <span class="fs-3">🇬🇧</span>
                                        <div>
                                            <h6 class="fw-bold text-slate-800 mb-0">English</h6>
                                            <span class="text-muted small">Use English as the application display language</span>
                                        </div>
                                    </div>
                                    <div class="form-check m-0">
                                        <input class="form-check-input" type="radio" name="lang" id="lang_en" value="en" <?= ($current_lang === 'en') ? 'checked' : ''; ?> style="pointer-events: none;">
                                    </div>
                                </label>
                            </div>

                            <div class="d-grid col-md-8 mx-auto">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> <?= __('Simpan Pengaturan Bahasa', 'Save Language Settings'); ?>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Kategori Transaksi telah dipindahkan ke halaman terpisah kategori.php -->

        <!-- 4. TAB LAYOUT DESAIN SISTEM -->
        \<?php if (\$user_role !== 'user'): ?>
        <div class="tab-pane fade" id="pane-desainsistem" role="tabpanel" aria-labelledby="tab-desainsistem">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-4 rounded-4 bg-primary-subtle d-inline-block text-primary">
                                <i class="bi bi-window-sidebar fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Layout Desain Sistem</h4>
                                <p class="text-muted small mb-0">Atur kustomisasi nama aplikasi dan ganti logo perusahaan pada header dan login</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST" id="form-sys-design" enctype="multipart/form-data">
                            <input type="hidden" name="update_system_design" value="1">
                            
                            <!-- Input: Nama Aplikasi -->
                            <div class="mb-4">
                                <label for="nama_aplikasi" class="form-label fw-bold text-slate-800 mb-2">Nama Aplikasi / Perusahaan</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-window"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0" id="nama_aplikasi" name="nama_aplikasi" value="\<?= htmlspecialchars(\$app_name); ?>" placeholder="Contoh: KeuanganKu, Cahaya Corp" required maxlength="50">
                                </div>
                                <div class="form-text text-muted mt-1 small">Nama ini akan diletakkan pada Header Sidebar, Breadcrumb, dan Form Login.</div>
                            </div>

                            <!-- Input: Upload Logo File -->
                            <div class="mb-4">
                                <label for="logo_upload" class="form-label fw-bold text-slate-800 mb-2">Logo Perusahaan (Pilihan Utama - Upload dari Komputer)</label>
                                <div class="p-3 border rounded-3 bg-light d-flex flex-column gap-3">
                                    \<?php if (!empty(\$app_logo_image_url)): ?>
                                        <div class="current-logo-preview d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-success-subtle">
                                            <div class="d-flex align-items-center gap-3">
                                                <img src="\<?= htmlspecialchars(\$app_logo_image_url); ?>?t=\<?= time(); ?>" alt="Logo Saat Ini" class="rounded-3 border" style="width: 50px; height: 50px; object-fit: contain; padding: 4px; background: #fafafa;">
                                                <div>
                                                    <span class="small fw-bold text-success d-block"><i class="bi bi-patch-check-fill"></i> Logo Aktif Terpasang</span>
                                                    <span class="text-muted font-monospace" style="font-size: 0.72rem;">\<?= htmlspecialchars(basename(\$app_logo_image_url)); ?></span>
                                                </div>
                                            </div>
                                            <div class="form-check form-switch m-0">
                                                <input class="form-check-input" type="checkbox" role="switch" name="clear_logo" id="clear_logo" value="1">
                                                <label class="form-check-label small fw-bold text-danger" for="clear_logo">Hapus Logo</label>
                                            </div>
                                        </div>
                                    \<?php endif; ?>
                                    
                                    <div class="input-group">
                                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-upload"></i></span>
                                        <input type="file" class="form-control border-start-0" id="logo_upload" name="logo_upload" accept="image/*">
                                    </div>
                                    
                                    <div class="form-text text-muted m-0 small">
                                        <i class="bi bi-info-circle-fill text-primary"></i> Unggah file gambar logo (.jpg, .png, .svg, .webp) langsung dari komputer Anda. Jika berhasil diunggah, logo ini akan diprioritaskan ketimbang icon cadangan di bawah.
                                    </div>
                                </div>
                            </div>

                            <!-- Seleksi: Icon Cadangan (Bootstrap Icons) -->
                            <div class="mb-4">
                                <label class="form-label fw-bold text-slate-800 mb-2">Pilih Icon Cadangan (Apabila URL Logo Gambar Kosong)</label>
                                <div class="row g-2">
                                    \<?php
                                    \$available_icons = [
                                        'bi-wallet2' => 'Dompet wallet2',
                                        'bi-bank' => 'Bank Klasik',
                                        'bi-cash-coin' => 'Koin Kas',
                                        'bi-briefcase' => 'Bisnis Mandiri',
                                        'bi-building' => 'Gedung Kantor',
                                        'bi-calculator' => 'Akuntansi',
                                        'bi-graph-up-arrow' => 'Investasi Tren',
                                        'bi-shield-check' => 'Sistem Aman'
                                    ];
                                    foreach (\$available_icons as \$ico_class => \$ico_lbl):
                                        \$is_sel = (\$app_logo_icon === \$ico_class);
                                    ?>
                                        <div class="col-6 col-sm-3">
                                            <div class="border rounded-3 p-2 text-center style-icon-card cursor-pointer \<?= \$is_sel ? 'border-primary bg-primary-subtle text-primary fw-bold' : 'bg-light text-secondary'; ?>" data-icon="\<?= \$ico_class; ?>" style="transition: all 0.2s; cursor: pointer;">
                                                <i class="bi \<?= \$ico_class; ?> fs-3 d-block mb-1"></i>
                                                <span class="small d-block text-truncate" style="font-size: 0.75rem;">\<?= \$ico_lbl; ?></span>
                                            </div>
                                        </div>
                                    \<?php endforeach; ?>
                                </div>
                                <input type="hidden" name="logo_icon" id="selected_logo_icon" value="\<?= htmlspecialchars(\$app_logo_icon); ?>">
                            </div>

                            <!-- Ganti Favicon Setting -->
                            <div class="mb-4">
                                <label for="favicon_upload" class="form-label fw-bold text-slate-800 mb-2">Favicon Aplikasi (Icon Tab Browser - Upload dari Komputer)</label>
                                <div class="p-3 border rounded-3 bg-light d-flex flex-column gap-3">
                                    \<?php if (!empty(\$app_favicon)): ?>
                                        <div class="current-favicon-preview d-flex align-items-center justify-content-between p-2 bg-white rounded-3 border border-success-subtle">
                                            <div class="d-flex align-items-center gap-3">
                                                <img src="\<?= htmlspecialchars(\$app_favicon); ?>?t=\<?= time(); ?>" alt="Favicon Saat Ini" class="rounded-3 border" style="width: 34px; height: 34px; object-fit: contain; padding: 4px; background: #fafafa;">
                                                <div>
                                                    <span class="small fw-bold text-success d-block"><i class="bi bi-patch-check-fill"></i> Favicon Aktif Terpasang</span>
                                                    <span class="text-muted font-monospace text-truncate d-inline-block" style="font-size: 0.72rem; max-width: 250px;">\<?= htmlspecialchars(basename(\$app_favicon)); ?></span>
                                                </div>
                                            </div>
                                            <div class="form-check form-switch m-0">
                                                <input class="form-check-input" type="checkbox" role="switch" name="clear_favicon" id="clear_favicon" value="1">
                                                <label class="form-check-label small fw-bold text-danger" for="clear_favicon">Hapus Favicon</label>
                                            </div>
                                        </div>
                                    \<?php endif; ?>
                                    
                                    <div class="input-group">
                                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-upload"></i></span>
                                        <input type="file" class="form-control border-start-0" id="favicon_upload" name="favicon_upload" accept="image/*">
                                    </div>
                                    
                                    <div class="form-text text-muted m-0 small">
                                        <i class="bi bi-info-circle-fill text-primary"></i> Unggah file gambar favicon (.jpg, .png, .svg, .webp, .ico) langsung dari komputer Anda. Jika tidak diunggah atau dihapus, sistem akan menggunakan ikon bawaan.
                                    </div>
                                </div>
                            </div>

                            <!-- Edit Dashboard Footer Setting -->
                            <div class="mb-4">
                                <label for="app_footer" class="form-label fw-bold text-slate-800 mb-2">Teks Hak Cipta (Footer) Dashboard</label>
                                <div class="input-group mb-2">
                                    <span class="input-group-text bg-white text-muted"><i class="bi bi-c-circle"></i></span>
                                    <input type="text" class="form-control" id="app_footer" name="app_footer" value="\<?= htmlspecialchars(\$app_footer); ?>" placeholder="Contoh: &copy; \<?= date('Y'); ?> KeuanganKu | All Rights Reserved" required>
                                </div>
                                <div class="form-text text-muted small"><i class="bi bi-info-circle"></i> Modifikasi teks pengenal hak cipta di bagian bawah dashboard halaman administrasi. Anda bebas menggunakan penanda HTML.</div>
                            </div>

                            <!-- Edit App Version Setting -->
                            <div class="mb-4">
                                <label for="app_version" class="form-label fw-bold text-slate-800 mb-2">Versi Aplikasi (Sidebar Header)</label>
                                <div class="input-group mb-2">
                                    <span class="input-group-text bg-white text-muted"><i class="bi bi-info-square"></i></span>
                                    <input type="text" class="form-control" id="app_version" name="app_version" value="\<?= htmlspecialchars(\$app_version); ?>" placeholder="Contoh: v1.3 - Pro, v2.0-Alpha" required maxlength="20">
                                </div>
                                <div class="form-text text-muted small"><i class="bi bi-info-circle"></i> Tentukan label versi aplikasi yang akan diletakkan di sebelah kanan/bawah nama aplikasi di sidebar.</div>
                            </div>

                            <!-- Real-time Live Preview Box -->
                            <div class="mb-4 p-3 bg-light rounded-4 border border-light-subtle">
                                <span class="text-muted small fw-bold" style="font-size: 0.75rem;"><i class="bi bi-eye-fill me-1 text-primary"></i> Live Pratinjau Desain Header Sidebar:</span>
                                <div class="d-flex align-items-center mt-2.5 p-3 rounded-3" style="background-color: #0f172a; color: white;">
                                    <div id="preview-logo-container" class="me-3 d-flex align-items-center justify-content-center bg-white p-1 rounded-circle" style="width: 38px; height: 38px;">
                                        <!-- Will be filled by JS -->
                                    </div>
                                    <div>
                                        <h6 class="fw-bold mb-0 text-white" id="preview-app-name">\<?= htmlspecialchars(\$app_name); ?></h6>
                                        <span class="badge bg-primary-subtle text-primary font-monospace" style="font-size: 0.62rem;" id="preview-app-version">\<?= htmlspecialchars(\$app_version); ?></span>
                                    </div>
                                </div>
                            </div>

                            <div class="d-grid col-md-8 mx-auto mt-4">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> Simpan Desain Sistem Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 5. TAB DESAIN FORM LOGIN -->
        <div class="tab-pane fade" id="pane-desainlogin" role="tabpanel" aria-labelledby="tab-desainlogin">
            <div class="row justify-content-center">
                <div class="col-lg-12">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 p-md-4 rounded-4 bg-primary-subtle d-inline-block text-primary">
                                <i class="bi bi-lock fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Custom Desain Form Login</h4>
                                <p class="text-muted small mb-0">Ubah seluruh teks penjelas/slogan dan buat gradasi warna kustom pada panel portal login Anda</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST" id="form-login-design">
                            <input type="hidden" name="update_login_design" value="1">
                            
                            <div class="row pb-3">
                                <!-- LEFT COLUMN: FORM INPUTS -->
                                <div class="col-xl-6">
                                    <h5 class="fw-bold mb-3 text-slate-700 pb-2 border-bottom" style="font-size: 1.05rem;"><i class="bi bi-fonts me-2 text-primary"></i>Kustomisasi Kata-Kata (Konten Teks)</h5>
                                    
                                    <div class="mb-3">
                                        <label for="login_title" class="form-label fw-semibold text-muted small mb-1">Judul Utama Panel Kanan (Welcome Title)</label>
                                        <input type="text" class="form-control" id="login_title" name="login_title" value="\<?= htmlspecialchars(\$login_title); ?>" required maxlength="100">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="login_subtitle" class="form-label fw-semibold text-muted small mb-1">Sub-judul Penjelas Panel Kanan (Welcome Subtitle)</label>
                                        <textarea class="form-control" id="login_subtitle" name="login_subtitle" rows="2" required maxlength="255">\<?= htmlspecialchars(\$login_subtitle); ?></textarea>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="login_slogan_1" class="form-label fw-semibold text-muted small mb-1">Slogan Kiri - Baris 1 (Putih)</label>
                                            <input type="text" class="form-control" id="login_slogan_1" name="login_slogan_1" value="\<?= htmlspecialchars(\$login_slogan_1); ?>" required maxlength="100">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="login_slogan_2" class="form-label fw-semibold text-muted small mb-1">Slogan Kiri - Baris 2 (Gradasi Hijau)</label>
                                            <input type="text" class="form-control" id="login_slogan_2" name="login_slogan_2" value="\<?= htmlspecialchars(\$login_slogan_2); ?>" required maxlength="100">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="login_desc" class="form-label fw-semibold text-muted small mb-1">Deskripsi Slogan Kiri (Penjelasan Aplikasi)</label>
                                        <textarea class="form-control" id="login_desc" name="login_desc" rows="3" required maxlength="500">\<?= htmlspecialchars(\$login_desc); ?></textarea>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="login_badge_title" class="form-label fw-semibold text-muted small mb-1">Judul Lencana / Badge Melayang</label>
                                            <input type="text" class="form-control" id="login_badge_title" name="login_badge_title" value="\<?= htmlspecialchars(\$login_badge_title); ?>" required maxlength="100">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="login_badge_desc" class="form-label fw-semibold text-muted small mb-1">Deskripsi Lencana Melayang</label>
                                            <input type="text" class="form-control" id="login_badge_desc" name="login_badge_desc" value="\<?= htmlspecialchars(\$login_badge_desc); ?>" required maxlength="100">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="login_version" class="form-label fw-semibold text-muted small mb-1">Teks Versi / Label Footer Halaman Login</label>
                                        <input type="text" class="form-control" id="login_version" name="login_version" value="\<?= htmlspecialchars(\$login_version); ?>" required placeholder="Contoh: v1.4 SECURE" maxlength="50">
                                        <div class="form-text text-muted small"><i class="bi bi-info-circle"></i> Teks versi yang diletakkan di bagian footer halaman masuk (login).</div>
                                    </div>

                                    <h5 class="fw-bold mt-4 mb-3 text-slate-700 pb-2 border-bottom" style="font-size: 1.05rem;"><i class="bi bi-palette me-2 text-primary"></i>Kustomisasi Skema Warna (Gradasi & Aksen)</h5>
                                    
                                    <div class="row">
                                        <div class="col-md-4 mb-3">
                                            <label for="login_grad_start" class="form-label fw-semibold text-muted small mb-1 mb-2 d-block">Warna Gradasi Kiri 1</label>
                                            <input type="color" class="form-control form-control-color w-100 rounded-3 border p-1" style="height:44px;" id="login_grad_start" name="login_grad_start" value="\<?= htmlspecialchars(\$login_grad_start); ?>" title="Pilih warna mulai gradasi">
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label for="login_grad_mid" class="form-label fw-semibold text-muted small mb-1 mb-2 d-block">Warna Gradasi Kiri 2</label>
                                            <input type="color" class="form-control form-control-color w-100 rounded-3 border p-1" style="height:44px;" id="login_grad_mid" name="login_grad_mid" value="\<?= htmlspecialchars(\$login_grad_mid); ?>" title="Pilih warna tengah gradasi">
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label for="login_grad_end" class="form-label fw-semibold text-muted small mb-1 mb-2 d-block">Warna Gradasi Kiri 3</label>
                                            <input type="color" class="form-control form-control-color w-100 rounded-3 border p-1" style="height:44px;" id="login_grad_end" name="login_grad_end" value="\<?= htmlspecialchars(\$login_grad_end); ?>" title="Pilih warna akhir gradasi">
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="login_accent_color" class="form-label fw-semibold text-muted small mb-1 mb-2 d-block">Warna Aksen / Tombol Utama</label>
                                            <input type="color" class="form-control form-control-color w-100 rounded-3 border p-1" style="height:44px;" id="login_accent_color" name="login_accent_color" value="\<?= htmlspecialchars(\$login_accent_color); ?>" title="Pilih warna aksen tombol">
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="login_hover_color" class="form-label fw-semibold text-muted small mb-1 mb-2 d-block">Warna Hover Tombol</label>
                                            <input type="color" class="form-control form-control-color w-100 rounded-3 border p-1" style="height:44px;" id="login_hover_color" name="login_hover_color" value="\<?= htmlspecialchars(\$login_hover_color); ?>" title="Pilih warna hover tombol">
                                        </div>
                                    </div>
                                </div>

                                <!-- RIGHT COLUMN: PREMIUM REAL-TIME LIVE PREVIEW MOCKUP -->
                                <div class="col-xl-6 mt-4 mt-xl-0">
                                    <h5 class="fw-bold mb-3 text-slate-700 pb-2 border-bottom" style="font-size: 1.05rem;"><i class="bi bi-eye-fill me-2 text-primary"></i>Live Real-time Pratinjau Portal Login</h5>
                                    
                                    <div class="p-3 bg-secondary-subtle rounded-4 border d-flex flex-column align-items-center justify-content-center" style="min-height: 480px; background-color: #f1f5f9; background-image: radial-gradient(at 0% 0%, rgba(16,185,129,0.06) 0, transparent 50%);">
                                        <div class="mock-card w-100 shadow-lg border rounded-4 overflow-hidden bg-white" style="max-width: 500px; display: grid; grid-template-columns: 1.1fr 1fr; min-height: 330px; font-size: 0.65rem;">
                                            
                                            <!-- MOCK LEFT PANEL -->
                                            <div id="mock-left" class="p-3 text-white d-flex flex-column justify-content-between position-relative overflow-hidden" style="background: linear-gradient(135deg, \<?= htmlspecialchars(\$login_grad_start); ?> 0%, \<?= htmlspecialchars(\$login_grad_mid); ?> 35%, \<?= htmlspecialchars(\$login_grad_end); ?> 100%);">
                                                <div class="mock-top d-flex align-items-center gap-1 opacity-75">
                                                    <i class="bi bi-wallet2 text-xs"></i>
                                                    <span class="fw-bold text-uppercase font-sans" style="font-size: 0.5rem; letter-spacing: 0.05em;">\<?= htmlspecialchars(\$app_name); ?></span>
                                                </div>
                                                <div class="mock-mid my-auto" style="line-height: 1.3;">
                                                    <h6 id="mock-slogan" class="fw-black mb-1 text-white" style="font-size: 0.8rem; font-weight: 850;">
                                                        <span id="mock-slogan1" class="d-block text-truncate" style="max-width:140px;">\<?= htmlspecialchars(\$login_slogan_1); ?></span>
                                                        <span id="mock-slogan2" class="d-block text-truncate" style="max-width:140px; background: linear-gradient(135deg, #a7f3d0 0%, #34d399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">\<?= htmlspecialchars(\$login_slogan_2); ?></span>
                                                    </h6>
                                                    <p id="mock-desc" class="opacity-75 mb-2 overflow-hidden" style="font-size: 0.45rem; font-weight: 400; max-height:45px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical;">\<?= htmlspecialchars(\$login_desc); ?></p>
                                                    <div id="mock-badge" class="p-1 px-2 border rounded-2 d-inline-flex align-items-center gap-1" style="background-color: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); max-width: 100%;">
                                                        <i class="bi bi-shield-lock-fill" id="mock-badge-icon" style="color: \<?= htmlspecialchars(\$login_accent_color); ?>;"></i>
                                                        <div style="line-height:1.1;">
                                                            <div id="mock-badge-title" class="fw-bold text-white text-truncate" style="font-size: 0.42rem; max-width:100px;">\<?= htmlspecialchars(\$login_badge_title); ?></div>
                                                            <div id="mock-badge-desc" class="text-white-50 text-truncate" style="font-size: 0.38rem; max-width:100px;">\<?= htmlspecialchars(\$login_badge_desc); ?></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="mock-foot opacity-50 font-sans" style="font-size: 0.42rem;" id="mock-login-version">\<?= htmlspecialchars(\$login_version); ?></div>
                                            </div>

                                            <!-- MOCK RIGHT PANEL -->
                                            <div class="p-3 bg-white d-flex flex-column justify-content-center">
                                                <div class="auth-header mb-2">
                                                    <h6 id="mock-title" class="fw-black text-dark mb-0 text-truncate" style="font-size: 0.72rem; font-weight: 850; max-width:160px;">\<?= htmlspecialchars(\$login_title); ?></h6>
                                                    <p id="mock-subtitle" class="text-muted mb-0" style="font-size: 0.45rem; line-height: 1.2; max-height:30px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">\<?= htmlspecialchars(\$login_subtitle); ?></p>
                                                </div>
                                                
                                                <!-- Form template -->
                                                <div class="mb-1">
                                                    <div class="bg-light p-1 border rounded" style="font-size: 0.45rem; color: #a1a1a1;">Username</div>
                                                </div>
                                                <div class="mb-2">
                                                    <div class="bg-light p-1 border rounded" style="font-size: 0.45rem; color: #a1a1a1;">Password</div>
                                                </div>

                                                <button type="button" id="mock-btn" class="btn text-white w-100 p-1.5 fw-bold rounded-2 text-center" style="font-size: 0.52rem; background-color: \<?= htmlspecialchars(\$login_accent_color); ?>; border:none; transition:all 0.2s;">
                                                    Masuk
                                                </button>
                                            </div>
                                        </div>
                                        <p class="text-muted text-xs text-center mt-3 mb-0"><i class="bi bi-info-circle-fill text-primary"></i> Cobalah mengubah teks dan warna apa pun di panel kiri untuk melihat pratinjau instan!</p>
                                    </div>
                                </div>
                            </div>

                            <div class="d-grid col-md-6 mx-auto mt-4">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> Simpan Desain Login Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- 6. TAB DESAIN CETAK LAPORAN -->
        <div class="tab-pane fade" id="pane-desaincetak" role="tabpanel" aria-labelledby="tab-desaincetak">
            <div class="row justify-content-center">
                <div class="col-lg-12">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 p-md-4 rounded-4 bg-primary-subtle d-inline-block text-primary">
                                <i class="bi bi-printer fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Custom Desain Cetak Laporan Keuangan</h4>
                                <p class="text-muted small mb-0">Sesuaikan kop surat, alamat instansi, nama pembukuan, warna utama, jenis garis, dan catatan kaki legal untuk laporan cetak PDF Anda.</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST" id="form-print-design">
                            <input type="hidden" name="update_print_design" value="1">
                            
                            <div class="row pb-3">
                                <!-- LEFT COLUMN: FORM INPUTS -->
                                <div class="col-xl-6">
                                    <h5 class="fw-bold mb-3 text-slate-700 pb-2 border-bottom" style="font-size: 1.05rem;"><i class="bi bi-gear-wide-connected me-2 text-primary"></i>Konfigurasi Kop Cetak</h5>
                                    
                                    <!-- Judul Laporan -->
                                    <div class="mb-4">
                                        <label for="print_header_title" class="form-label fw-bold text-slate-800 mb-1">Judul Utama Kop Laporan</label>
                                        <input type="text" class="form-control rounded-3" id="print_header_title" name="print_header_title" value="\<?= htmlspecialchars(\$print_header_title); ?>" placeholder="Contoh: LAPORAN KEUANGAN MASJID JAMI" required>
                                        <div class="form-text small text-muted">Judul utama yang akan tercetak paling atas dengan huruf kapital tebal.</div>
                                    </div>
                                    
                                    <!-- Sub-judul / Info Tambahan -->
                                    <div class="mb-4">
                                        <label for="print_header_subtitle" class="form-label fw-bold text-slate-800 mb-1">Sub-Kop / Alamat & Kontak Instansi</label>
                                        <textarea class="form-control rounded-3" id="print_header_subtitle" name="print_header_subtitle" rows="3" placeholder="Contoh: Jl. Raya Kebayoran Lama No. 12, Jakarta Selatan | Telp: 021-xxxxxx">\<?= htmlspecialchars(\$print_header_subtitle); ?></textarea>
                                        <div class="form-text small text-muted">Akan ditampilkan di baris kedua. Sangat cocok ditaruh alamat institusi, Slogan, atau Nomor Surat Keputusan.</div>
                                    </div>

                                    <div class="row g-3 mb-4">
                                        <!-- Warna Utama Cetak -->
                                        <div class="col-sm-6">
                                            <label for="print_header_color" class="form-label fw-bold text-slate-800 mb-1">Warna Aksen Kop & Garis</label>
                                            <div class="d-flex gap-2">
                                                <input type="color" class="form-control form-control-color rounded-2" id="print_header_color" name="print_header_color" value="\<?= htmlspecialchars(\$print_header_color); ?>" style="width: 50px; height: 38px;">
                                                <input type="text" class="form-control text-uppercase font-monospace text-xs" id="print_header_color_text" value="\<?= htmlspecialchars(\$print_header_color); ?>" readonly style="max-width: 100px;">
                                            </div>
                                        </div>
                                        
                                        <!-- Jenis Garis Pembatas -->
                                        <div class="col-sm-6">
                                            <label for="print_divider_style" class="form-label fw-bold text-slate-800 mb-1">Garis Pembatas Kop</label>
                                            <select class="form-select rounded-3" id="print_divider_style" name="print_divider_style">
                                                <option value="double" \<?= \$print_divider_style === 'double' ? 'selected' : ''; ?>>Garis Dua Elegan</option>
                                                <option value="solid" \<?= \$print_divider_style === 'solid' ? 'selected' : ''; ?>>Satu Garis Tebal</option>
                                                <option value="dashed" \<?= \$print_divider_style === 'dashed' ? 'selected' : ''; ?>>Garis Putus-Putus</option>
                                                <option value="none" \<?= \$print_divider_style === 'none' ? 'selected' : ''; ?>>Sembunyikan Garis</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Toggle Logo -->
                                    <div class="mb-4">
                                        <div class="p-3 rounded-3 bg-light border">
                                            <div class="form-check form-switch m-0">
                                                <input class="form-check-input" type="checkbox" role="switch" id="print_header_logo" name="print_header_logo" value="1" \<?= \$print_header_logo === '1' ? 'checked' : ''; ?>>
                                                <label class="form-check-label fw-bold text-slate-800" for="print_header_logo">Tampilkan Logo Aplikasi pada Kop Surat</label>
                                            </div>
                                            <div class="form-text small text-muted ms-4 mt-1">Status: Jika dicentang, logo sistem yang Anda upload di tab "Desain Sistem" otomatis tersemat rapi di atas judul laporan cetak.</div>
                                        </div>
                                    </div>

                                    <!-- Catatan Kaki Laporan / Disclaimer -->
                                    <div class="mb-4">
                                        <label for="print_footer_note" class="form-label fw-bold text-slate-800 mb-1">Catatan Kaki Cetak (Footer Note)</label>
                                        <input type="text" class="form-control rounded-3" id="print_footer_note" name="print_footer_note" value="\<?= htmlspecialchars(\$print_footer_note); ?>" placeholder="Contoh: Laporan dicetak secara sah dan otomatis via sistem KeuanganKu.">
                                        <div class="form-text small text-muted">Teks tipis bergaris putus-putus yang diletakkan di bagian paling bawah halaman sebelum tanda tangan.</div>
                                    </div>
                                    
                                </div>

                                <!-- RIGHT COLUMN: PREMIUM REAL-TIME LIVE PRINT PREVIEW MOCKUP -->
                                <div class="col-xl-6 mt-4 mt-xl-0">
                                    <h5 class="fw-bold mb-3 text-slate-700 pb-2 border-bottom" style="font-size: 1.05rem;"><i class="bi bi-eye-fill me-2 text-primary"></i>Pratinjau Kertas Format Cetak (Live)</h5>
                                    
                                    <div class="p-4 bg-light rounded-4 border d-flex flex-column align-items-center justify-content-center" style="min-height: 480px; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 15px 15px;">
                                        <!-- Paper representation -->
                                        <div class="p-4 bg-white shadow-lg border border-slate-300 rounded mb-2" id="mock-paper-root" style="width: 100%; max-width: 440px; min-height: 380px; color: #1e293b; font-size: 11px; line-height: 1.3; font-family: sans-serif; position: relative; box-sizing: border-box;">
                                            
                                            <!-- MOCK PRINT KOP -->
                                            <div id="mock-print-header" class="text-center mb-3">
                                                <div id="mock-print-logo-row" class="text-center mb-2" style="display-items: center; justify-content: center;">
                                                    <!-- Mock logo img if toggled, otherwise hidden -->
                                                </div>
                                                <h4 id="mock-print-title" class="fw-bold text-uppercase m-0" style="font-size: 0.95rem; letter-spacing: -0.01em; color: #0f172a; line-height: 1.2;">LAPORAN CATATAN TRANSAKSI KEUANGAN</h4>
                                                <div id="mock-print-subtitle" class="text-muted m-0 mt-1 small" style="white-space: pre-line; font-size: 0.68rem; line-height: 1.3;"></div>
                                                
                                                <div id="mock-print-meta" class="text-muted mt-2 d-flex justify-content-center flex-wrap gap-2 text-uppercase font-monospace" style="font-size: 0.55rem; opacity: 0.8;">
                                                    <span>Periode: 12-2026</span> • <span>Tipe: Semua</span> • <span>Petugas: Admin</span>
                                                </div>
                                                
                                                <!-- Mock Line Divider -->
                                                <div id="mock-print-divider" style="margin-top: 10px;"></div>
                                            </div>
                                            
                                            <!-- Mock table preview -->
                                            <div class="my-3 opacity-25">
                                                <div class="border-bottom pb-1 mb-1 fw-bold d-flex justify-content-between text-uppercase" style="font-size: 7px; border-color: #64748b !important;">
                                                    <span>Klip Keterangan Arus</span>
                                                    <span>Jumlah</span>
                                                </div>
                                                <div class="d-flex justify-content-between" style="font-size: 7px; margin-bottom: 2px;">
                                                    <span>Gaji Pokok Utama</span>
                                                    <span>Rp 5.500.000</span>
                                                </div>
                                                <div class="d-flex justify-content-between" style="font-size: 7px;">
                                                    <span>Biaya Sewa Domain & Hosting cPanel</span>
                                                    <span>(Rp 250.000)</span>
                                                </div>
                                            </div>
                                            
                                            <!-- Mock Print Footer Note -->
                                            <div id="mock-print-footer-note" class="text-center text-muted border-top pt-2 mt-4" style="font-size: 0.55rem; font-style: italic; border-top: 1px dashed #cbd5e1 !important; white-space: normal; word-break: break-all;">
                                                <!-- Mock footer note text -->
                                            </div>
                                            
                                            <!-- Mock Tanda Tangan -->
                                            <div style="display: flex; justify-content: space-between; margin-top: 25px; padding: 0 15px; font-size: 0.55rem; opacity: 0.4;">
                                                <div class="text-center">
                                                    <div>Verifikasi,</div>
                                                    <div style="margin-top: 20px; border-bottom: 1px solid #1e293b; width: 60px;"></div>
                                                </div>
                                                <div class="text-center">
                                                    <div>Disusun Oleh,</div>
                                                    <div style="margin-top: 20px; border-bottom: 1px solid #1e293b; width: 60px;"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <span class="text-muted text-center font-monospace" style="font-size: 0.65rem;"><i class="bi bi-info-circle-fill"></i> Skenario di atas menyimulasikan halaman cetakan PDF Anda.</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="d-grid col-md-6 mx-auto mt-4">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm">
                                    <i class="bi bi-check2-circle me-1.5"></i> Simpan Desain Cetak Baru
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        \<?php endif; ?>

        \<?php if (\$user_role === 'superadmin'): ?>
        <!-- 6. TAB OTORITAS PERAN -->
        <div class="tab-pane fade" id="pane-otoritas" role="tabpanel" aria-labelledby="tab-otoritas">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="card main-card p-4 p-md-5 shadow-sm mb-4">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="p-3 p-md-4 rounded-4 bg-primary-subtle d-inline-block text-primary">
                                <i class="bi bi-shield-lock-fill fs-4"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-0">Otoritas & Izin Hak Akses Peran</h4>
                                <p class="text-muted small mb-0">Tentukan menu dan halaman aplikasi mana saja yang berhak diakses oleh masing-masing tingkat peran pengguna.</p>
                            </div>
                        </div>

                        <form action="pengaturan.php" method="POST" id="form-role-settings">
                            <input type="hidden" name="update_role_permissions" value="1">
                            
                            <div class="alert alert-warning border-0 rounded-4 p-3 mb-4 d-flex align-items-start gap-3" style="background-color: rgba(217, 119, 6, 0.1); color: #b45309;">
                                <i class="bi bi-exclamation-triangle-fill fs-5 mt-0.5"></i>
                                <div style="font-size: 0.85rem;">
                                    <strong class="d-block mb-1">Proteksi Keamanan Sistem & Lockout:</strong>
                                    Sebagai bagian dari pengamanan ketat, tingkat peran <strong>Superadmin</strong> dijamin akan selalu memiliki hak akses penuh ke menu <strong>Pengaturan</strong> dan <strong>Kelola User</strong>. Hal ini untuk memastikan Anda tidak terkunci dari sistem secara tidak sengaja.
                                </div>
                            </div>

                            <div class="table-responsive rounded-3 border">
                                <table class="table table-hover align-middle mb-0 text-center">
                                    <thead class="table-light">
                                        <tr class="text-uppercase font-monospace small text-slate-500" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                                            <th class="text-start ps-4 py-3" style="width: 40%;">Menu Utama Aplikasi</th>
                                            <th style="width: 20%;" class="text-danger fw-bold py-3"><i class="bi bi-shield-fill text-danger me-1"></i>Superadmin</th>
                                            <th style="width: 20%;" class="text-primary fw-bold py-3"><i class="bi bi-person-fill-gear text-primary me-1"></i>Admin</th>
                                            <th style="width: 20%;" class="text-success fw-bold py-3"><i class="bi bi-person-fill text-success me-1"></i>User</th>
                                        </tr>
                                    </thead>
                                    <tbody style="font-size: 0.88rem;">
                                        \<?php
                                        \$menus_list = [
                                            'dashboard' => ['name' => 'Dashboard Utama', 'desc' => 'Halaman ringkasan statistik, grafik arus kas, dan dompet.', 'icon' => 'bi-grid-fill'],
                                            'transaksi' => ['name' => 'Transaksi & Riwayat', 'desc' => 'Mencatat pemasukan, pengeluaran, dan transaksi berulang.', 'icon' => 'bi-cash-stack'],
                                            'laporan' => ['name' => 'Laporan Rekapitulasi', 'desc' => 'Filter bulanan/tahunan, cetak/ekspor PDF, pratinjau tabel.', 'icon' => 'bi-file-earmark-bar-graph-fill'],
                                            'anggaran' => ['name' => 'Anggaran Bulanan', 'desc' => 'Menetapkan batasan anggaran tiap kategori pengeluaran.', 'icon' => 'bi-pie-chart-fill'],
                                            'rekening' => ['name' => 'Dompet / Rekening', 'desc' => 'Manajemen multi-wallet & saldo awal atau mutasi dompet.', 'icon' => 'bi-wallet2'],
                                            'kategori' => ['name' => 'Kategori Transaksi', 'desc' => 'Menambah atau mengelola nama kategori arus keuangan.', 'icon' => 'bi-tag-fill'],
                                            'kelola_user' => ['name' => 'Kelola Pengguna', 'desc' => 'Melihat daftar serta melakukan edit/hapus akun pengguna.', 'icon' => 'bi-people-fill'],
                                            'pengaturan' => ['name' => 'Pengaturan Global', 'desc' => 'Mengubah tema, logo, konten login, serta izin otoritas.', 'icon' => 'bi-gear-fill']
                                        ];

                                        foreach (\$menus_list as \$m_key => \$m_data):
                                        ?\>
                                        <tr>
                                            <td class="text-start ps-4 py-3.5">
                                                <div class="d-flex align-items-center gap-3">
                                                    <div class="p-2 rounded-3 bg-light text-muted d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                                        <i class="bi \<?= \$m_data['icon']; ?\> fs-5"></i>
                                                    </div>
                                                    <div>
                                                        <strong class="text-slate-800 d-block mb-0.5">\<?= \$m_data['name']; ?\></strong>
                                                        <span class="text-muted text-xs d-block" style="font-size: 0.72rem;">\<?= \$m_data['desc']; ?\></span>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <!-- Superadmin Switch -->
                                            <td class="py-3.5">
                                                <div class="form-check form-switch d-inline-block">
                                                    <input class="form-check-input" type="checkbox" name="perm_superadmin_\<?= \$m_key; ?\>" value="1" \<?= has_menu_permission('superadmin', \$m_key) ? 'checked' : ''; ?\> \<?= in_array(\$m_key, ['pengaturan', 'kelola_user']) ? 'disabled' : ''; ?\> style="width: 2.8em; height: 1.4em; cursor: pointer;">
                                                    \<?php if (in_array(\$m_key, ['pengaturan', 'kelola_user'])): ?\>
                                                        <input type="hidden" name="perm_superadmin_\<?= \$m_key; ?\>" value="1">
                                                    \<?php endif; ?\>
                                                </div>
                                            </td>

                                            <!-- Admin Switch -->
                                            <td class="py-3.5">
                                                <div class="form-check form-switch d-inline-block">
                                                    <input class="form-check-input" type="checkbox" name="perm_admin_\<?= \$m_key; ?\>" value="1" \<?= has_menu_permission('admin', \$m_key) ? 'checked' : ''; ?\> style="width: 2.8em; height: 1.4em; cursor: pointer;">
                                                </div>
                                            </td>

                                            <!-- User Switch -->
                                            <td class="py-3.5">
                                                <div class="form-check form-switch d-inline-block">
                                                    <input class="form-check-input" type="checkbox" name="perm_user_\<?= \$m_key; ?\>" value="1" \<?= has_menu_permission('user', \$m_key) ? 'checked' : ''; ?\> style="width: 2.8em; height: 1.4em; cursor: pointer;">
                                                </div>
                                            </td>
                                        </tr>
                                        \<?php endforeach; ?\>
                                    </tbody>
                                </table>
                            </div>

                            <div class="d-grid col-md-6 mx-auto mt-4">
                                <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold shadow-sm text-uppercase font-sans tracking-wider" style="font-size: 0.85rem;">
                                    <i class="bi bi-shield-check me-2 fs-5"></i> Simpan Hak Akses Peran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        \<?php endif; ?>
        
    </div>

</div>

<!-- Footer area -->
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
    // Tab persistence with localStorage
    const activeTabId = localStorage.getItem('activeSettingsTab');
    if (activeTabId) {
        const tabEl = document.querySelector('#' + activeTabId);
        if (tabEl) {
            const tab = new bootstrap.Tab(tabEl);
            tab.show();
        }
    }

    document.querySelectorAll('button[data-bs-toggle="pill"]').forEach(tabBtn => {
        tabBtn.addEventListener('shown.bs.tab', function (event) {
            localStorage.setItem('activeSettingsTab', event.target.id);
        });
    });

    // Penanganan interaksi UI klik pada kartu seleksi tema kustom agar radio otomatis terceklis
    document.querySelectorAll('.theme-selection-card').forEach(card => {
        card.addEventListener('click', function() {
            // Uncheck other selections visually
            document.querySelectorAll('.theme-selection-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            // Check the internal radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                
                // Real-time synchronization option settings
                const val = radio.value;
                const themeLoginColors = {
                    'slate': {
                        'start': '#1e293b',
                        'mid': '#0f172a',
                        'end': '#020617',
                        'accent': '#2563eb',
                        'hover': '#1d4ed8'
                    },
                    'emerald': {
                        'start': '#064e3b',
                        'mid': '#022c22',
                        'end': '#081d33',
                        'accent': '#059669',
                        'hover': '#047857'
                    },
                    'violet': {
                        'start': '#4c1d95',
                        'mid': '#2e1065',
                        'end': '#0f052d',
                        'accent': '#7c3aed',
                        'hover': '#6d28d9'
                    },
                    'crimson': {
                        'start': '#7f1d1d',
                        'mid': '#450a0a',
                        'end': '#1c0202',
                        'accent': '#dc2626',
                        'hover': '#b91c1c'
                    },
                    'amber': {
                        'start': '#78350f',
                        'mid': '#451a03',
                        'end': '#1e0800',
                        'accent': '#d97706',
                        'hover': '#b45309'
                    }
                };

                if (themeLoginColors[val]) {
                    const c = themeLoginColors[val];
                    const gStart = document.getElementById('login_grad_start');
                    const gMid = document.getElementById('login_grad_mid');
                    const gEnd = document.getElementById('login_grad_end');
                    const cAccent = document.getElementById('login_accent_color');
                    const cHover = document.getElementById('login_hover_color');

                    if (gStart) gStart.value = c.start;
                    if (gMid) gMid.value = c.mid;
                    if (gEnd) gEnd.value = c.end;
                    if (cAccent) cAccent.value = c.accent;
                    if (cHover) cHover.value = c.hover;

                    if (typeof updateLoginPreview === 'function') {
                        updateLoginPreview();
                    }
                }
            }
        });
    });

    // --- SCRIPT LAYOUT DESAIN SISTEM INTERACTIVE ---
    const appNameInput = document.getElementById('nama_aplikasi');
    const appVersionInput = document.getElementById('app_version');
    const logoUploadInput = document.getElementById('logo_upload');
    const clearLogoCheckbox = document.getElementById('clear_logo');
    const previewAppName = document.getElementById('preview-app-name');
    const previewAppVersion = document.getElementById('preview-app-version');
    const previewLogoContainer = document.getElementById('preview-logo-container');
    const selectedLogoIconInput = document.getElementById('selected_logo_icon');

    let localLogoPreviewUrl = '';

    function updateHeaderPreview() {
        if (!appNameInput || !previewAppName) return;
        
        // Update live app name text
        previewAppName.textContent = appNameInput.value.trim() || 'KeuanganKu';
        
        // Update live app version text
        if (appVersionInput && previewAppVersion) {
            previewAppVersion.textContent = appVersionInput.value.trim() || 'v1.3 - Pro';
        }
        
        // Get image URL or fallback to chosen icon
        let hasLogo = false;
        let logoSrc = '';
        
        const isCleared = clearLogoCheckbox && clearLogoCheckbox.checked;
        
        if (!isCleared) {
            if (localLogoPreviewUrl) {
                hasLogo = true;
                logoSrc = localLogoPreviewUrl;
            } else {
                const existingLogo = '\<?= !empty(\$app_logo_image_url) ? htmlspecialchars(\$app_logo_image_url) : "" ?>';
                if (existingLogo) {
                    hasLogo = true;
                    logoSrc = existingLogo;
                }
            }
        }
        
        if (hasLogo) {
            previewLogoContainer.className = 'me-3 d-flex align-items-center justify-content-center bg-white p-1 rounded-circle border';
            previewLogoContainer.style.width = '38px';
            previewLogoContainer.style.height = '38px';
            previewLogoContainer.innerHTML = '<img src="' + escapeHtml(logoSrc) + '" alt="Logo" class="rounded-circle" style="width: 28px; height: 28px; object-fit: contain;">';
        } else {
            const selectedIcon = selectedLogoIconInput.value || 'bi-wallet2';
            previewLogoContainer.className = 'me-3 d-flex align-items-center justify-content-center text-primary bg-primary-subtle rounded-circle';
            previewLogoContainer.style.width = '38px';
            previewLogoContainer.style.height = '38px';
            previewLogoContainer.innerHTML = '<i class="bi ' + selectedIcon + ' fs-4"></i>';
        }
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    if (appNameInput) {
        appNameInput.addEventListener('input', updateHeaderPreview);
        if (appVersionInput) {
            appVersionInput.addEventListener('input', updateHeaderPreview);
        }
        
        if (logoUploadInput) {
            logoUploadInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        localLogoPreviewUrl = evt.target.result;
                        if (clearLogoCheckbox) clearLogoCheckbox.checked = false;
                        updateHeaderPreview();
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (clearLogoCheckbox) {
            clearLogoCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    if (logoUploadInput) logoUploadInput.value = '';
                    localLogoPreviewUrl = '';
                }
                updateHeaderPreview();
            });
        }
        
        // Select icon cards on click
        document.querySelectorAll('.style-icon-card').forEach(card => {
            card.addEventListener('click', function() {
                // Remove selected attributes
                document.querySelectorAll('.style-icon-card').forEach(c => {
                    c.classList.remove('border-primary', 'bg-primary-subtle', 'text-primary', 'fw-bold');
                    c.classList.add('bg-light', 'text-secondary');
                });
                // Highlight selected card
                this.classList.add('border-primary', 'bg-primary-subtle', 'text-primary', 'fw-bold');
                this.classList.remove('bg-light', 'text-secondary');
                
                selectedLogoIconInput.value = this.getAttribute('data-icon');
                updateHeaderPreview();
            });
        });

        // Run preview load
        updateHeaderPreview();
    }

    // --- PORTAL LOGIN LIVE DESIGNER REAL-TIME PREVIEW ---
    const loginTitleInput = document.getElementById('login_title');
    const loginSubtitleInput = document.getElementById('login_subtitle');
    const loginSlogan1Input = document.getElementById('login_slogan_1');
    const loginSlogan2Input = document.getElementById('login_slogan_2');
    const loginDescInput = document.getElementById('login_desc');
    const loginBadgeTitleInput = document.getElementById('login_badge_title');
    const loginBadgeDescInput = document.getElementById('login_badge_desc');
    const loginVersionInput = document.getElementById('login_version');

    const gradStartInput = document.getElementById('login_grad_start');
    const gradMidInput = document.getElementById('login_grad_mid');
    const gradEndInput = document.getElementById('login_grad_end');
    const accentColorInput = document.getElementById('login_accent_color');
    const hoverColorInput = document.getElementById('login_hover_color');

    // Preview elements
    const mockLeft = document.getElementById('mock-left');
    const mockSlogan1 = document.getElementById('mock-slogan1');
    const mockSlogan2 = document.getElementById('mock-slogan2');
    const mockDesc = document.getElementById('mock-desc');
    const mockBadgeIcon = document.getElementById('mock-badge-icon');
    const mockBadgeTitle = document.getElementById('mock-badge-title');
    const mockBadgeDesc = document.getElementById('mock-badge-desc');
    const mockTitle = document.getElementById('mock-title');
    const mockSubtitle = document.getElementById('mock-subtitle');
    const mockBtn = document.getElementById('mock-btn');
    const mockLoginVersionStr = document.getElementById('mock-login-version');

    function updateLoginPreview() {
        if (loginTitleInput && mockTitle) mockTitle.textContent = loginTitleInput.value.trim() || 'Selamat Datang';
        if (loginSubtitleInput && mockSubtitle) mockSubtitle.textContent = loginSubtitleInput.value.trim() || '';
        if (loginSlogan1Input && mockSlogan1) mockSlogan1.textContent = loginSlogan1Input.value.trim() || '';
        if (loginSlogan2Input && mockSlogan2) mockSlogan2.textContent = loginSlogan2Input.value.trim() || '';
        if (loginDescInput && mockDesc) mockDesc.textContent = loginDescInput.value.trim() || '';
        if (loginBadgeTitleInput && mockBadgeTitle) mockBadgeTitle.textContent = loginBadgeTitleInput.value.trim() || '';
        if (loginBadgeDescInput && mockBadgeDesc) mockBadgeDesc.textContent = loginBadgeDescInput.value.trim() || '';
        if (loginVersionInput && mockLoginVersionStr) mockLoginVersionStr.textContent = loginVersionInput.value.trim() || 'v1.4 SECURE';

        // Colors
        const gStart = gradStartInput ? gradStartInput.value : '#064e3b';
        const gMid = gradMidInput ? gradMidInput.value : '#022c22';
        const gEnd = gradEndInput ? gradEndInput.value : '#081d33';
        const accent = accentColorInput ? accentColorInput.value : '#059669';

        if (mockLeft) {
            mockLeft.style.background = 'linear-gradient(135deg, ' + gStart + ' 0%, ' + gMid + ' 35%, ' + gEnd + ' 100%)';
        }
        if (mockBadgeIcon) {
            mockBadgeIcon.style.color = accent;
        }
        if (mockBtn) {
            mockBtn.style.backgroundColor = accent;
        }
    }

    // Attach listeners
    const inputsToWatch = [
        loginTitleInput, loginSubtitleInput, loginSlogan1Input, loginSlogan2Input,
        loginDescInput, loginBadgeTitleInput, loginBadgeDescInput, loginVersionInput,
        gradStartInput, gradMidInput, gradEndInput, accentColorInput, hoverColorInput
    ];

    inputsToWatch.forEach(inp => {
        if (inp) {
            inp.addEventListener('input', updateLoginPreview);
        }
    });

    // Execute on tab active
    const loginTabBtn = document.getElementById('tab-desainlogin');
    if (loginTabBtn) {
        loginTabBtn.addEventListener('shown.bs.tab', function() {
            updateLoginPreview();
        });
    }

    // Initially execute once
    updateLoginPreview();

    // --- PRINT DESIGN LIVE REAL-TIME PREVIEWER ---
    const printTitleInput = document.getElementById('print_header_title');
    const printSubtitleInput = document.getElementById('print_header_subtitle');
    const printColorInput = document.getElementById('print_header_color');
    const printColorTextInput = document.getElementById('print_header_color_text');
    const printDividerInput = document.getElementById('print_divider_style');
    const printLogoInput = document.getElementById('print_header_logo');
    const printFooterInput = document.getElementById('print_footer_note');

    const mockPrintTitle = document.getElementById('mock-print-title');
    const mockPrintSubtitle = document.getElementById('mock-print-subtitle');
    const mockPrintDivider = document.getElementById('mock-print-divider');
    const mockPrintLogoRow = document.getElementById('mock-print-logo-row');
    const mockPrintFooterNote = document.getElementById('mock-print-footer-note');

    function updatePrintPreview() {
        if (!printTitleInput) return;

        const titleVal = printTitleInput.value.trim() || 'LAPORAN CATATAN TRANSAKSI KEUANGAN';
        const subtitleVal = printSubtitleInput ? printSubtitleInput.value.trim() : '';
        const colorVal = printColorInput ? printColorInput.value : '#0f172a';
        const dividerVal = printDividerInput ? printDividerInput.value : 'double';
        const showLogo = printLogoInput ? printLogoInput.checked : false;
        const footerVal = printFooterInput ? printFooterInput.value.trim() : '';

        // Update title and color
        if (mockPrintTitle) {
            mockPrintTitle.textContent = titleVal;
            mockPrintTitle.style.color = colorVal;
        }

        // Subtitle
        if (mockPrintSubtitle) {
            mockPrintSubtitle.textContent = subtitleVal;
            mockPrintSubtitle.style.display = subtitleVal ? 'block' : 'none';
        }

        // Color text helper
        if (printColorTextInput && printColorInput) {
            printColorTextInput.value = colorVal.toUpperCase();
        }

        // Divider styling
        if (mockPrintDivider) {
            if (dividerVal === 'double') {
                mockPrintDivider.style.borderTop = '3px solid ' + colorVal;
                mockPrintDivider.style.borderBottom = '1px solid ' + colorVal;
                mockPrintDivider.style.height = '5px';
                mockPrintDivider.style.display = 'block';
            } else if (dividerVal === 'solid') {
                mockPrintDivider.style.borderTop = '2px solid ' + colorVal;
                mockPrintDivider.style.borderBottom = 'none';
                mockPrintDivider.style.height = '0';
                mockPrintDivider.style.display = 'block';
            } else if (dividerVal === 'dashed') {
                mockPrintDivider.style.borderTop = '2px dashed ' + colorVal;
                mockPrintDivider.style.borderBottom = 'none';
                mockPrintDivider.style.height = '0';
                mockPrintDivider.style.display = 'block';
            } else {
                mockPrintDivider.style.display = 'none';
            }
        }

        // Logo row mockup
        if (mockPrintLogoRow) {
            mockPrintLogoRow.innerHTML = '';
            if (showLogo) {
                // Get active logo if uploaded or configured
                let logoSrc = '';
                if (localLogoPreviewUrl) {
                    logoSrc = localLogoPreviewUrl;
                } else {
                    const existingLogo = '<?= !empty($app_logo_image_url) ? htmlspecialchars($app_logo_image_url) : "" ?>';
                    if (existingLogo) {
                        logoSrc = existingLogo;
                    }
                }

                if (logoSrc) {
                    mockPrintLogoRow.innerHTML = '<img src="' + escapeHtml(logoSrc) + '" alt="Logo Kop" style="max-height: 35px; max-width: 100px; object-fit: contain;">';
                    mockPrintLogoRow.style.display = 'block';
                } else {
                    // Fallback to wallet icon mockup representation
                    mockPrintLogoRow.innerHTML = '<div style="width: 25px; height: 25px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 1.5px solid ' + colorVal + '; color: ' + colorVal + '"><span style="font-size: 10px; font-weight: bold;">Ku</span></div>';
                    mockPrintLogoRow.style.display = 'block';
                }
            } else {
                mockPrintLogoRow.style.display = 'none';
            }
        }

        // Footer note
        if (mockPrintFooterNote) {
            mockPrintFooterNote.textContent = footerVal;
            mockPrintFooterNote.style.display = footerVal ? 'block' : 'none';
        }
    }

    // Attach print configuration event listeners
    if (printTitleInput) {
        [printTitleInput, printSubtitleInput, printColorInput, printDividerInput, printLogoInput, printFooterInput].forEach(inp => {
            if (inp) {
                inp.addEventListener('input', updatePrintPreview);
                inp.addEventListener('change', updatePrintPreview);
            }
        });

        // Live color synchronization text input
        if (printColorInput) {
            printColorInput.addEventListener('input', function() {
                if (printColorTextInput) printColorTextInput.value = this.value.toUpperCase();
            });
        }

        // Trigger on tab active
        const printTabBtn = document.getElementById('tab-desaincetak');
        if (printTabBtn) {
            printTabBtn.addEventListener('shown.bs.tab', function() {
                updatePrintPreview();
            });
        }
        
        updatePrintPreview();
    }
</script>
</body>
</html>`;

export const LAPORAN_PHP = `<?php
// laporan.php
// Halaman laporan keuangan dengan filter dinamis dan ekspor Excel & PDF

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_role = $_SESSION['role'] ?? 'admin';
$user_username = $_SESSION['username'] ?? 'user';

// Ambil parameter filter dari GET
$filter_jenis = $_GET['jenis'] ?? '';
$filter_kategori = $_GET['kategori'] ?? '';
$filter_mulai = $_GET['start_date'] ?? '';
$filter_selesai = $_GET['end_date'] ?? '';
$filter_bulan = $_GET['bulan'] ?? '';
$filter_tahun = $_GET['tahun'] ?? '';

// Hitung rentang tanggal secara otomatis jika menggunakan filter bulanan / tahunan
if (!empty($filter_bulan) && $filter_bulan !== 'semua' && !empty($filter_tahun) && $filter_tahun !== 'semua') {
    $formatted_month = str_pad($filter_bulan, 2, '0', STR_PAD_LEFT);
    $filter_mulai = "{$filter_tahun}-{$formatted_month}-01";
    $filter_selesai = date("Y-m-t", strtotime($filter_mulai));
} elseif (!empty($filter_tahun) && $filter_tahun !== 'semua') {
    $filter_mulai = "{$filter_tahun}-01-01";
    $filter_selesai = "{$filter_tahun}-12-31";
} elseif (!empty($filter_bulan) && $filter_bulan !== 'semua') {
    $curr_year = date('Y');
    $formatted_month = str_pad($filter_bulan, 2, '0', STR_PAD_LEFT);
    $filter_mulai = "{$curr_year}-{$formatted_month}-01";
    $filter_selesai = date("Y-m-t", strtotime($filter_mulai));
}

// Membangun query bersyarat dinamis
$conds = [];

// Proteksi level 'user' -> hanya bisa akses transaksi milik dia sendiri
if ($user_role === 'user') {
    $conds[] = "username = '" . mysqli_real_escape_string($koneksi, $user_username) . "'";
}

if (!empty($filter_jenis) && in_array($filter_jenis, ['pemasukan', 'pengeluaran'])) {
    $conds[] = "jenis = '" . mysqli_real_escape_string($koneksi, $filter_jenis) . "'";
}

if (!empty($filter_kategori)) {
    $conds[] = "kategori = '" . mysqli_real_escape_string($koneksi, $filter_kategori) . "'";
}

if (!empty($filter_mulai)) {
    $conds[] = "tanggal >= '" . mysqli_real_escape_string($koneksi, $filter_mulai) . "'";
}

if (!empty($filter_selesai)) {
    $conds[] = "tanggal <= '" . mysqli_real_escape_string($koneksi, $filter_selesai) . "'";
}

$where_clause = "";
if (count($conds) > 0) {
    $where_clause = "WHERE " . implode(" AND ", $conds);
}

// 1. Ekspor Excel jika diminta
if (isset($_GET['export']) && $_GET['export'] === 'excel') {
    header("Content-Type: application/vnd.ms-excel; charset=UTF-8");
    header("Content-Disposition: attachment; filename=Laporan_Keuangan_" . date('Ymd_His') . ".xls");
    header("Pragma: no-cache");
    header("Expires: 0");

    // Hitung Saldo Awal sebelum tanggal filter_mulai untuk Excel
    $saldo_awal = 0;
    $conds_awal = [];
    if ($user_role === 'user') {
        $conds_awal[] = "username = '" . mysqli_real_escape_string($koneksi, $user_username) . "'";
    }
    if (!empty($filter_kategori)) {
        $conds_awal[] = "kategori = '" . mysqli_real_escape_string($koneksi, $filter_kategori) . "'";
    }
    if (!empty($filter_mulai)) {
        $conds_awal[] = "tanggal < '" . mysqli_real_escape_string($koneksi, $filter_mulai) . "'";
        $where_awal = "WHERE " . implode(" AND ", $conds_awal);
        
        $q_pem_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pemasukan'");
        $q_pen_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pengeluaran'");
        
        $val_pem_awal = mysqli_fetch_assoc($q_pem_awal)['total'] ?? 0;
        $val_pen_awal = mysqli_fetch_assoc($q_pen_awal)['total'] ?? 0;
        $saldo_awal = $val_pem_awal - $val_pen_awal;
    }

    // Query data berdasarkan filter untuk Excel
    $query_excel = "SELECT * FROM transaksi \$where_clause ORDER BY tanggal ASC, id ASC";
    $result_excel = mysqli_query($koneksi, $query_excel);

    // Ambil rekap untuk Excel
    $q_pem_excel = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pemasukan'" : "WHERE jenis='pemasukan'");
    $q_pen_excel = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pengeluaran'" : "WHERE jenis='pengeluaran'");
    
    $res_pem = mysqli_query($koneksi, $q_pem_excel);
    $row_pem = mysqli_fetch_assoc($res_pem);
    $total_pem = $row_pem['total'] ?? 0;

    $res_pen = mysqli_query($koneksi, $q_pen_excel);
    $row_pen = mysqli_fetch_assoc($res_pen);
    $total_pen = $row_pen['total'] ?? 0;
    
    $saldo_akhir = $saldo_awal + $total_pem - $total_pen;
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
        <style>
            table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
            th { background-color: #2563eb; color: #ffffff; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 8px; }
            .judul { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-align: center; }
            .subjudul { font-size: 12px; color: #64748b; margin-bottom: 20px; text-align: center; }
            .text-success { color: #10b981; font-weight: bold; }
            .text-danger { color: #ef4444; font-weight: bold; }
            .rekap-table { margin-bottom: 20px; width: 350px; }
            .rekap-table th { background-color: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; }
        </style>
    </head>
    <body>
        <div class="judul">LAPORAN REKAPITULASI KEUANGAN (DEBIT & KREDIT)</div>
        <div class="subjudul">Diekspor Pada: <?= date('d-m-Y H:i:s'); ?> | Pengguna: <?= htmlspecialchars($user_username); ?></div>

        <table class="rekap-table">
            <tr>
                <th colspan="2">RINGKASAN REKAPITULASI KEUANGAN</th>
            </tr>
            <tr>
                <td>Saldo Awal Periode</td>
                <td><strong>Rp <?= number_format($saldo_awal, 0, ',', '.'); ?></strong></td>
            </tr>
            <tr>
                <td>Total Kas Masuk (Debit)</td>
                <td class="text-success">Rp <?= number_format($total_pem, 0, ',', '.'); ?></td>
            </tr>
            <tr>
                <td>Total Kas Keluar (Kredit)</td>
                <td class="text-danger">Rp <?= number_format($total_pen, 0, ',', '.'); ?></td>
            </tr>
            <tr>
                <td><strong>Saldo Akhir Kumulatif</strong></td>
                <td><strong>Rp <?= number_format($saldo_akhir, 0, ',', '.'); ?></strong></td>
            </tr>
        </table>

        <table>
            <thead>
                <tr>
                    <th style="width: 50px;">No</th>
                    <th style="width: 120px;">Tanggal</th>
                    <th>Keterangan Transaksi</th>
                    <th style="width: 150px;">Kategori</th>
                    <th style="width: 150px; text-align: right;">Debit (Pemasukan)</th>
                    <th style="width: 150px; text-align: right;">Kredit (Pengeluaran)</th>
                    <th style="width: 150px; text-align: right;">Saldo Berjalan</th>
                </tr>
            </thead>
            <tbody>
                <!-- Baris Saldo Awal -->
                <tr style="background-color: #f8fafc; font-weight: bold;">
                    <td>-</td>
                    <td>-</td>
                    <td><strong>SALDO AWAL ACUAN</strong></td>
                    <td>-</td>
                    <td style="text-align: right;">-</td>
                    <td style="text-align: right;">-</td>
                    <td style="text-align: right;">Rp <?= number_format($saldo_awal, 0, ',', '.'); ?></td>
                </tr>
                <?php 
                $num = 1;
                $running_balance = $saldo_awal;
                if (mysqli_num_rows($result_excel) > 0): 
                    while ($row = mysqli_fetch_assoc($result_excel)): 
                        if ($row['jenis'] === 'pemasukan') {
                            $running_balance += $row['jumlah'];
                            $debit = $row['jumlah'];
                            $kredit = 0;
                        } else {
                            $running_balance -= $row['jumlah'];
                            $debit = 0;
                            $kredit = $row['jumlah'];
                        }
                        ?>
                        <tr>
                            <td><?= $num++; ?></td>
                            <td><?= date('d-m-Y', strtotime($row['tanggal'])); ?></td>
                            <td><?= htmlspecialchars($row['keterangan']); ?></td>
                            <td><?= htmlspecialchars($row['kategori']); ?></td>
                            <td style="text-align: right; color: #10b981;">
                                <?= $debit > 0 ? 'Rp ' . number_format($debit, 0, ',', '.') : '-'; ?>
                            </td>
                            <td style="text-align: right; color: #ef4444;">
                                <?= $kredit > 0 ? 'Rp ' . number_format($kredit, 0, ',', '.') : '-'; ?>
                            </td>
                            <td style="text-align: right; font-weight: bold;">
                                Rp <?= number_format($running_balance, 0, ',', '.'); ?>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                    <!-- Baris Total Paling Bawah -->
                    <tr style="background-color: #f1f5f9; font-weight: bold;">
                        <td colspan="4" style="text-align: right;">TOTAL:</td>
                        <td style="text-align: right; color: #10b981;">Rp <?= number_format($total_pem, 0, ',', '.'); ?></td>
                        <td style="text-align: right; color: #ef4444;">Rp <?= number_format($total_pen, 0, ',', '.'); ?></td>
                        <td style="text-align: right; color: <?= $saldo_akhir >= 0 ? '#2563eb' : '#ef4444'; ?>;">Rp <?= number_format($saldo_akhir, 0, ',', '.'); ?></td>
                    </tr>
                <?php else: ?>
                    <tr>
                        <td colspan="7" style="text-align: center;">Tidak ada data transaksi yang cocok dengan filter.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </body>
    </html>
    <?php
    exit();
}

// Hitung Saldo Awal sebelum tanggal filter_mulai untuk Tampilan Web
$saldo_awal = 0;
$conds_awal = [];
if ($user_role === 'user') {
    $conds_awal[] = "username = '" . mysqli_real_escape_string($koneksi, $user_username) . "'";
}
if (!empty($filter_kategori)) {
    $conds_awal[] = "kategori = '" . mysqli_real_escape_string($koneksi, $filter_kategori) . "'";
}
if (!empty($filter_mulai)) {
    $conds_awal[] = "tanggal < '" . mysqli_real_escape_string($koneksi, $filter_mulai) . "'";
    $where_awal = "WHERE " . implode(" AND ", $conds_awal);
    
    $q_pem_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pemasukan'");
    $q_pen_awal = mysqli_query($koneksi, "SELECT SUM(jumlah) AS total FROM transaksi \$where_awal AND jenis='pengeluaran'");
    
    $val_pem_awal = mysqli_fetch_assoc($q_pem_awal)['total'] ?? 0;
    $val_pen_awal = mysqli_fetch_assoc($q_pen_awal)['total'] ?? 0;
    $saldo_awal = $val_pem_awal - $val_pen_awal;
}

// Formulasi query untuk halaman HTML interaktif
$query_pemasukan = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pemasukan'" : "WHERE jenis='pemasukan'");
$res_pemasukan = mysqli_query($koneksi, $query_pemasukan);
$row_pemasukan = mysqli_fetch_assoc($res_pemasukan);
$total_pemasukan = $row_pemasukan['total'] ?? 0;

$query_pengeluaran = "SELECT SUM(jumlah) AS total FROM transaksi " . ($where_clause ? \$where_clause . " AND jenis='pengeluaran'" : "WHERE jenis='pengeluaran'");
$res_pengeluaran = mysqli_query($koneksi, $query_pengeluaran);
$row_pengeluaran = mysqli_fetch_assoc($res_pengeluaran);
$total_pengeluaran = $row_pengeluaran['total'] ?? 0;

$saldo_akhir = $saldo_awal + $total_pemasukan - $total_pengeluaran;

$query_transaksi = "SELECT * FROM transaksi \$where_clause ORDER BY tanggal ASC, id ASC";
$result_transaksi = mysqli_query($koneksi, $query_transaksi);

// Ambil daftar kategori unik untuk filter dropdown
$query_cats = mysqli_query($koneksi, "SELECT * FROM kategori ORDER BY nama ASC");
$all_categories = [];
if ($query_cats) {
    while ($c = mysqli_fetch_assoc($query_cats)) {
        $all_categories[] = $c;
    }
}

// Fungsi Helper format Rupiah
if (!function_exists('rupiah')) {
    function rupiah($angka) {
        return "Rp " . number_format($angka, 0, ',', '.');
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($app_name); ?> - Laporan Komprehensif</title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
        }
        .main-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.12);
            background: #ffffff;
            transition: all 0.3s ease;
        }
        .main-card:hover {
            box-shadow: 0 10px 25px -5px rgba(148, 163, 184, 0.18);
        }
        .filter-card {
            background: linear-gradient(145deg, #ffffff, #f8fafc);
            border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .text-pemasukan {
            color: #10b981 !important;
        }
        .text-pengeluaran {
            color: #ef4444 !important;
        }
        
        /* Premium Dual-Tone Gradient Metric Cards with Glass Refraction Matte Shine */
        .gradient-card {
            position: relative;
            border: none !important;
            border-radius: 20px;
            color: #ffffff !important;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background-size: 200% 200%;
        }
        .gradient-card:hover {
            transform: translateY(-6px);
        }
        .gradient-card-info {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            box-shadow: 0 12px 28px -4px rgba(59, 130, 246, 0.35);
        }
        .gradient-card-info:hover {
            box-shadow: 0 20px 38px -5px rgba(59, 130, 246, 0.5);
        }
         .gradient-card-success {
            background: linear-gradient(135deg, #064e3b 0%, #10b981 100%);
            box-shadow: 0 12px 28px -4px rgba(16, 185, 129, 0.35);
        }
        .gradient-card-success:hover {
            box-shadow: 0 20px 38px -5px rgba(16, 185, 129, 0.5);
        }
        .gradient-card-danger {
            background: linear-gradient(135deg, #881337 0%, #f43f5e 100%);
            box-shadow: 0 12px 28px -4px rgba(244, 63, 94, 0.35);
        }
        .gradient-card-danger:hover {
            box-shadow: 0 20px 38px -5px rgba(244, 63, 94, 0.5);
        }
        .gradient-card-primary {
            background: linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%);
            box-shadow: 0 12px 28px -4px rgba(139, 92, 246, 0.35);
        }
        .gradient-card-primary:hover {
            box-shadow: 0 20px 38px -5px rgba(139, 92, 246, 0.5);
        }
        .gradient-card-warning {
            background: linear-gradient(135deg, #78350f 0%, #f59e0b 100%);
            box-shadow: 0 12px 28px -4px rgba(245, 158, 11, 0.35);
        }
        .gradient-card-warning:hover {
            box-shadow: 0 20px 38px -5px rgba(245, 158, 11, 0.5);
        }
        
        .card-pattern {
            position: absolute;
            top: -15px;
            right: -15px;
            width: 110px;
            height: 110px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.75rem;
            transform: rotate(15deg);
            transition: all 0.4s ease;
        }
        .gradient-card:hover .card-pattern {
            transform: rotate(25deg) scale(1.15);
            background: rgba(255, 255, 255, 0.16);
        }
        .gradient-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-25deg);
            transition: none;
        }
        .gradient-card:hover::after {
            left: 150%;
            transition: all 0.85s ease-in-out;
        }

        .badge-cat {
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
            padding: 4px 8px;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 6px;
        }

        /* Form Label and control styling */
        .form-label-custom {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 6px;
        }
        .form-control-custom {
            border-radius: 10px;
            padding: 0.65rem 1rem;
            border: 1px solid #cbd5e1;
            font-size: 0.85rem;
            background-color: #ffffff;
            color: #1e293b;
            font-weight: 500;
        }
        .form-control-custom:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
            background-color: #ffffff;
        }

        /* Modern Table Customization */
        .table-custom {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
        }
        .table-custom thead th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            padding: 14px 16px;
            border-top: none;
            border-bottom: 1.5px solid #e2e8f0;
        }
        .table-custom tbody tr {
            transition: all 0.2s ease;
        }
        .table-custom tbody tr:hover {
            background-color: #fafafa !important;
        }
        .table-custom tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 0.85rem;
        }
        .table-custom tbody tr:last-child td {
            border-bottom: none;
        }
        
        /* Media Print Styling kustom untuk Ekspor PDF Sempurna */
        @media print {
            @page {
                size: A4 portrait;
                margin: 15mm 12mm 15mm 12mm;
            }

            /* Sembunyikan elemen navigasi sidebar, filter card, tombol, dll */
            .sidebar-container, 
            .mobile-header, 
            .top-header-bar, 
            header,
            .no-print,
            .filter-card, 
            .btn-export-group, 
            .btn, 
            hr, 
            .user-profile-section,
            .card-header,
            footer {
                display: none !important;
            }
            
            /* Netralkan pembungkus layout flexbox agar halaman mengalir biasa tanpa batasan kontainer */
            html, body {
                height: auto !important;
                min-height: auto !important;
                overflow: visible !important;
                background: #ffffff !important;
                color: #0d131e !important;
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .app-layout-wrapper {
                display: block !important;
                width: 100% !important;
                min-height: auto !important;
                height: auto !important;
                overflow: visible !important;
            }

            .main-canvas-area {
                display: block !important;
                width: 100% !important;
                height: auto !important;
                min-height: auto !important;
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
            }

            .container-fluid {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            /* Hilangkan bayangan, border, dan batasan overflow pada card/tabel */
            .card {
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
            }

            .card-body {
                padding: 0 !important;
                overflow: visible !important;
            }

            /* Netralkan scrollbar table-responsive agar table merentang utuh secara horizontal */
            .table-responsive {
                overflow: visible !important;
                overflow-x: visible !important;
                overflow-y: visible !important;
                display: block !important;
                width: 100% !important;
            }

            table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: auto !important;
            }

            tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
            }

            .table th {
                background-color: #f1f5f9 !important;
                color: #0f172a !important;
                border: 1px solid #94a3b8 !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
                font-size: 0.72rem !important;
                letter-spacing: 0.02em !important;
                padding: 8px 10px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .table td {
                border: 1px solid #cbd5e1 !important;
                padding: 8px 10px !important;
                background-color: transparent !important;
                color: #1e293b !important;
                font-size: 0.75rem !important;
            }

            /* Penyesuaian baris info saldo awal dan total */
            tr.table-info {
                background-color: #f0f9ff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            tr.bg-light-subtle {
                background-color: #f8fafc !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .badge-cat {
                border: 1px solid #e2e8f0 !important;
                background-color: #f8fafc !important;
                color: #475569 !important;
                font-size: 0.68rem !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                display: inline-block !important;
            }

            .print-header {
                display: block !important;
                margin-top: 5px;
                margin-bottom: 20px;
            }

            .print-footer {
                display: block !important;
                margin-top: 35px;
            }
        }
    </style>
</head>
<body>

<?php
$active_page = 'laporan';
include 'sidebar.php';
?>

<div class="container-fluid py-4">
    
    <?php
    // Definisikan informasi periode lapor untuk cetak PDF/Laporan yang rapi
    $periode_nama = 'Semua Periode';
    if (!empty($filter_mulai) || !empty($filter_selesai)) {
        $periode_nama = '' . ($filter_mulai ? date('d-m-Y', strtotime($filter_mulai)) : 'Awal') . ' s/d ' . ($filter_selesai ? date('d-m-Y', strtotime($filter_selesai)) : 'Akhir');
    } else {
        $months_id = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        $b_name = ($filter_bulan !== 'semua' && !empty($filter_bulan) && isset($months_id[$filter_bulan])) ? $months_id[$filter_bulan] : 'Semua Bulan';
        $t_name = ($filter_tahun !== 'semua' && !empty($filter_tahun)) ? $filter_tahun : 'Semua Tahun';
        $periode_nama = "$b_name $t_name";
    }

    $aliran_nama = 'Semua Transaksi';
    if ($filter_jenis === 'pemasukan') {
        $aliran_nama = 'Hanya Pemasukan (Debit)';
    } elseif ($filter_jenis === 'pengeluaran') {
        $aliran_nama = 'Hanya Pengeluaran (Kredit)';
    }
    ?>

    <!-- Bagian Kepala Print (Disembunyikan di layar, ditampilkan hanya ketika dicetak) -->
    <div class="print-header d-none">
        <div style="text-align: center; margin-bottom: 25px;">
            <?php if ($print_header_logo === '1' && !empty($app_logo_image_url)): ?>
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="<?= htmlspecialchars($app_logo_image_url); ?>" alt="Logo Kop" style="max-height: 60px; max-width: 160px; object-fit: contain;">
                </div>
            <?php endif; ?>
            
            <h2 style="font-size: 1.5rem; font-weight: 800; color: <?= htmlspecialchars($print_header_color); ?>; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: -0.025em; font-family: sans-serif;"><?= htmlspecialchars($print_header_title); ?></h2>
            
            <?php if (!empty($print_header_subtitle)): ?>
                <div style="font-size: 0.82rem; color: #475569; font-weight: 500; font-family: sans-serif; white-space: pre-line; margin-bottom: 10px; line-height: 1.45;"><?= htmlspecialchars($print_header_subtitle); ?></div>
            <?php endif; ?>

            <div style="font-size: 0.74rem; color: #64748b; font-family: sans-serif; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                Petugas: <strong><?= htmlspecialchars($_SESSION['nama']); ?></strong> &nbsp;&bull;&nbsp;
                Periode Laporan: <strong style="color: #0f172a;"><?= $periode_nama; ?></strong> &nbsp;&bull;&nbsp;
                Waktu Cetak: <strong><?= date('d-m-Y H:i:s'); ?></strong>
            </div>
            <div style="font-size: 0.70rem; color: #94a3b8; font-family: sans-serif; margin-top: 3px;">
                Tipe Aliran: <strong><?= $aliran_nama; ?></strong> &nbsp;&bull;&nbsp; 
                Kategori: <strong><?= empty($filter_kategori) ? 'Semua Kategori' : htmlspecialchars($filter_kategori); ?></strong>
            </div>

            <?php
            $real_divider_css = '';
            if ($print_divider_style === 'double') {
                $real_divider_css = "border-top: 3px solid {$print_header_color}; border-bottom: 1px solid {$print_header_color}; height: 6px; margin-top: 15px;";
            } elseif ($print_divider_style === 'solid') {
                $real_divider_css = "border-top: 2.5px solid {$print_header_color}; border-bottom: none; height: 0; margin-top: 15px;";
            } elseif ($print_divider_style === 'dashed') {
                $real_divider_css = "border-top: 2px dashed {$print_header_color}; border-bottom: none; height: 0; margin-top: 15px;";
            } else {
                $real_divider_css = "display: none;";
            }
            ?>
            <div style="<?= $real_divider_css; ?>"></div>
        </div>

        <!-- Ringkasan Khusus Cetak (Sangat Indah & Rapih) -->
        <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 25px; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                <div style="flex: 1; text-align: center; border-right: 1.5px solid #cbd5e1; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">SALDO AWAL ACUAN</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #334155;"><?= rupiah($saldo_awal); ?></div>
                </div>
                <div style="flex: 1; text-align: center; border-right: 1.5px solid #cbd5e1; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #16a34a; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">TOTAL KAS MASUK</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #16a34a;"><?= rupiah($total_pemasukan); ?></div>
                </div>
                <div style="flex: 1; text-align: center; border-right: 1.5px solid #cbd5e1; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #dc2626; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">TOTAL KAS KELUAR</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #dc2626;"><?= rupiah($total_pengeluaran); ?></div>
                </div>
                <div style="flex: 1; text-align: center; padding: 2px 4px;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #2563eb; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">SALDO AKHIR KUMULATIF</div>
                    <div style="font-size: 1rem; font-weight: 700; color: #2563eb;"><?= rupiah($saldo_akhir); ?></div>
                </div>
            </div>
        </div>

        <!-- Judul Tabel Khusus Cetak -->
        <h5 style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin-bottom: 12px; margin-top: 15px; text-transform: uppercase; letter-spacing: -0.01em; font-family: sans-serif;">
            <i class="bi bi-list-columns-reverse"></i> Rincian Buku Kas Transaksi Terlampir
        </h5>
    </div>

    <!-- Header & Tombol Print Utama -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 no-print">
        <div>
            <h3 class="fw-black text-slate-800 tracking-tight mb-1">Laporan Keuangan</h3>
            <p class="text-muted mb-0 small">Saring data arus kas secara akurat dan ekspor ke lembar kerja Excel atau cetak PDF langsung.</p>
        </div>
        
        <!-- Action Group -->
        <div class="d-flex flex-wrap gap-2 btn-export-group">
            <button type="button" data-bs-toggle="modal" data-bs-target="#exportModalModal" class="btn btn-outline-primary d-flex align-items-center gap-2 rounded-3 px-3.5 py-2 fw-bold text-xs" style="background-color: rgba(37, 99, 235, 0.05); border-color: rgba(37, 99, 235, 0.2)">
                <i class="bi bi-download text-primary fs-5"></i>
                <span>Cetak / Ekspor Laporan</span>
            </button>
        </div>
    </div>

    <!-- Panel Filter Komprehensif -->
    <div class="card main-card filter-card p-4 mb-4">
        <form action="laporan.php" method="GET" class="row g-3">
            <div class="col-md-2">
                <label for="jenis" class="form-label text-xs fw-extrabold text-slate-700">Tipe Aliran</label>
                <select class="form-select rounded-3 text-xs" id="jenis" name="jenis">
                    <option value="" <?= ($filter_jenis === '') ? 'selected' : ''; ?>>Semua Aliran</option>
                    <option value="pemasukan" <?= ($filter_jenis === 'pemasukan') ? 'selected' : ''; ?>>Pemasukan (+)</option>
                    <option value="pengeluaran" <?= ($filter_jenis === 'pengeluaran') ? 'selected' : ''; ?>>Pengeluaran (-)</option>
                </select>
            </div>
            
            <div class="col-md-2">
                <label for="kategori" class="form-label text-xs fw-extrabold text-slate-700">Kategori</label>
                <select class="form-select rounded-3 text-xs" id="kategori" name="kategori">
                    <option value="" <?= ($filter_kategori === '') ? 'selected' : ''; ?>>Semua Kategori</option>
                    <?php foreach ($all_categories as $cat): ?>
                        <option value="<?= htmlspecialchars($cat['nama']); ?>" <?= ($filter_kategori === $cat['nama']) ? 'selected' : ''; ?>>
                            <?= htmlspecialchars($cat['nama']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="col-md-2">
                <label for="filter_mode" class="form-label text-xs fw-extrabold text-slate-700">Metode Saring</label>
                <select class="form-select rounded-3 text-xs" id="filter_mode" onchange="toggleFilterFields()">
                    <option value="bulanan" <?= (!empty($filter_bulan) || !empty($filter_tahun) || (empty($filter_bulan) && empty($filter_tahun) && empty($filter_mulai) && empty($filter_selesai))) ? 'selected' : ''; ?>>Saring Bulanan</option>
                    <option value="tanggal" <?= (empty($filter_bulan) && empty($filter_tahun) && (!empty($filter_mulai) || !empty($filter_selesai))) ? 'selected' : ''; ?>>Rentang Tanggal</option>
                </select>
            </div>

            <!-- Fields for Monthly Filter -->
            <div class="col-md-2 col-sm-6 filter-bulanan-field">
                <label for="bulan" class="form-label text-xs fw-extrabold text-slate-700">Pilih Bulan</label>
                <select class="form-select rounded-3 text-xs" id="bulan" name="bulan">
                    <option value="semua" <?= ($filter_bulan === 'semua' || empty($filter_bulan)) ? 'selected' : ''; ?>>Semua Bulan</option>
                    <?php
                    $months = [
                        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
                        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
                    ];
                    foreach ($months as $num => $name):
                    ?>
                        <option value="<?= $num; ?>" <?= ($filter_bulan == $num) ? 'selected' : ''; ?>><?= $name; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="col-md-2 col-sm-6 filter-bulanan-field">
                <label for="tahun" class="form-label text-xs fw-extrabold text-slate-700">Pilih Tahun</label>
                <select class="form-select rounded-3 text-xs" id="tahun" name="tahun">
                    <option value="semua" <?= ($filter_tahun === 'semua' || empty($filter_tahun)) ? 'selected' : ''; ?>>Semua Tahun</option>
                    <?php
                    // Ambil daftar tahun unik dari database
                    $q_years = mysqli_query($koneksi, "SELECT DISTINCT YEAR(tanggal) AS thn FROM transaksi ORDER BY thn DESC");
                    $db_years = [];
                    if ($q_years) {
                        while ($yr_row = mysqli_fetch_assoc($q_years)) {
                            if (!empty($yr_row['thn'])) $db_years[] = (int)$yr_row['thn'];
                        }
                    }
                    // Tambahkan jangkauan tahun yang sangat luas untuk fleksibilitas maksimal
                    for ($y = 2020; $y <= 2035; $y++) {
                        $db_years[] = $y;
                    }
                    if (!in_array(date('Y'), $db_years)) $db_years[] = (int)date('Y');
                    if (!in_array(2026, $db_years)) $db_years[] = 2026;
                    sort($db_years);
                    $db_years = array_reverse(array_unique($db_years));
                    foreach ($db_years as $yr):
                    ?>
                        <option value="<?= $yr; ?>" <?= ($filter_tahun == $yr) ? 'selected' : ''; ?>><?= $yr; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Fields for Date Filter -->
            <div class="col-md-2 col-sm-6 filter-tanggal-field" style="display: none;">
                <label for="start_date" class="form-label text-xs fw-extrabold text-slate-700">Tanggal Mulai</label>
                <input type="date" class="form-control rounded-3 text-xs" id="start_date" name="start_date" value="<?= htmlspecialchars($filter_mulai); ?>">
            </div>

            <div class="col-md-2 col-sm-6 filter-tanggal-field" style="display: none;">
                <label for="end_date" class="form-label text-xs fw-extrabold text-slate-700">Tanggal Akhir</label>
                <input type="date" class="form-control rounded-3 text-xs" id="end_date" name="end_date" value="<?= htmlspecialchars($filter_selesai); ?>">
            </div>

            <div class="col-md-2 col-sm-12 d-grid align-items-end">
                <button type="submit" class="btn btn-primary rounded-3 text-center fw-extrabold py-2 d-flex align-items-center justify-content-center gap-1" style="min-height: 38px;">
                    <i class="bi bi-funnel-fill"></i>
                    <span>Saring</span>
                </button>
            </div>
        </form>
    </div>

    <!-- Ringkasan Filter Terkait dengan Gradient Elegan (Bento Grid 4 Kolom) -->
    <div class="row g-4 mb-4 no-print">
        <!-- 1. Saldo Awal Acuan -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card gradient-card-info p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-hourglass-split"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Saldo Awal Acuan</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($saldo_awal); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-info-circle"></i> Saldo kumulatif sebelum filter tanggal</p>
                </div>
            </div>
        </div>

        <!-- 2. Pemasukan Terfilter -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card gradient-card-success p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-up-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Kas Masuk (Debit)</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pemasukan); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-down-left-circle"></i> Mutasi penambahan saldo (+)</p>
                </div>
            </div>
        </div>
        
        <!-- 3. Pengeluaran Terfilter -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card gradient-card-danger p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-graph-down-arrow"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.85; letter-spacing: 0.05em">Total Kas Keluar (Kredit)</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;"><?= rupiah($total_pengeluaran); ?></h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;"><i class="bi bi-arrow-up-right-circle"></i> Mutasi pengurangan dana (-)</p>
                </div>
            </div>
        </div>

        <!-- 4. Saldo Akhir Berjalan -->
        <div class="col-sm-6 col-xl-3">
            <div class="card gradient-card <?= ($saldo_akhir >= 0) ? 'gradient-card-primary' : 'gradient-card-warning'; ?> p-4 h-100">
                <div class="card-pattern">
                    <i class="bi bi-stars"></i>
                </div>
                <div class="position-relative z-1 d-flex flex-column h-100 justify-content-between">
                    <div>
                        <span class="text-uppercase small fw-bold d-block mb-1" style="font-size: 0.68rem; opacity: 0.9; letter-spacing: 0.05em">Saldo Akhir Kumulatif</span>
                        <h3 class="fw-black mb-2 text-white" style="font-size: 1.6rem; letter-spacing: -0.025em;">
                            <?= rupiah($saldo_akhir); ?>
                        </h3>
                    </div>
                    <p class="small mb-0 text-white-50" style="font-size: 0.72rem;">
                        <span class="fw-bold"><i class="bi bi-shield-check"></i> Saldo Bersih Berjalan</span>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Tabel Data Utama Terlapor -->
    <div class="card main-card overflow-hidden">
        <div class="card-header bg-white py-3.5 px-4 border-0 bg-slate-50/50 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold text-slate-800 mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-table text-indigo-600"></i> Rincian Buku Kas Transaksi
            </h5>
            <span class="badge bg-slate-100 text-slate-600 border px-3 py-1.5 rounded-pill fw-semibold font-monospace" style="font-size: 0.72rem;">
                <?= mysqli_num_rows($result_transaksi); ?> Entri Terkait
            </span>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-custom" style="font-size: 0.85rem;">
                    <thead class="bg-light table-light">
                        <tr>
                            <th class="py-3 px-4 text-center text-muted text-uppercase fw-bold font-monospace" style="width: 60px;">No</th>
                            <th class="py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 120px;">Tanggal</th>
                            <th class="py-3 text-muted text-uppercase fw-bold font-monospace">Keterangan</th>
                            <th class="py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 140px;">Kategori</th>
                            <th class="py-3 text-end text-muted text-uppercase fw-bold font-monospace" style="width: 155px;">Debit (Pemasukan)</th>
                            <th class="py-3 text-end text-muted text-uppercase fw-bold font-monospace" style="width: 155px;">Kredit (Pengeluaran)</th>
                            <th class="py-3 text-end text-muted text-uppercase fw-bold font-monospace" style="width: 170px; padding-right: 24px;">Saldo Berjalan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Baris Saldo Awal Acuan -->
                        <tr class="table-info border-bottom border-light-subtle" style="background-color: rgba(13, 202, 240, 0.05);">
                            <td class="py-3 text-center font-monospace font-semibold text-muted">-</td>
                            <td class="py-3 font-monospace font-medium text-muted">-</td>
                            <td class="py-3 fw-bold text-slate-800">
                                <i class="bi bi-wallet2 text-info me-2"></i> SALDO AWAL PERIODE
                            </td>
                            <td class="py-3 text-muted">-</td>
                            <td class="py-3 text-end text-muted">-</td>
                            <td class="py-3 text-end text-muted">-</td>
                            <td class="py-3 text-end font-monospace fw-bold text-info" style="padding-right: 24px;">
                                <?= rupiah($saldo_awal); ?>
                            </td>
                        </tr>

                        <?php 
                        $no = 1;
                        $running_balance = $saldo_awal;
                        if (mysqli_num_rows($result_transaksi) > 0): 
                            while ($row = mysqli_fetch_assoc($result_transaksi)): 
                                if ($row['jenis'] === 'pemasukan') {
                                    $running_balance += $row['jumlah'];
                                    $debit = $row['jumlah'];
                                    $kredit = 0;
                                } else {
                                    $running_balance -= $row['jumlah'];
                                    $debit = 0;
                                    $kredit = $row['jumlah'];
                                }
                                ?>
                                <tr class="border-bottom border-light-subtle">
                                    <td class="py-3.5 text-center font-monospace font-semibold text-slate-500"><?= $no++; ?></td>
                                    <td class="py-3.5 font-monospace font-medium">
                                        <?= date('d-m-Y', strtotime($row['tanggal'])); ?>
                                    </td>
                                    <td class="py-3.5">
                                        <div class="fw-semibold text-slate-800 text-truncate" style="max-width: 300px;" title="<?= htmlspecialchars($row['keterangan']); ?>">
                                            <?= htmlspecialchars($row['keterangan']); ?>
                                        </div>
                                    </td>
                                    <td class="py-3.5">
                                        <span class="badge-cat">
                                            <?= !empty($row['kategori']) ? htmlspecialchars($row['kategori']) : 'Umum'; ?>
                                        </span>
                                    </td>
                                    <td class="py-3.5 text-end font-monospace font-semibold text-success">
                                        <?= $debit > 0 ? rupiah($debit) : '-'; ?>
                                    </td>
                                    <td class="py-3.5 text-end font-monospace font-semibold text-danger">
                                        <?= $kredit > 0 ? rupiah($kredit) : '-'; ?>
                                    </td>
                                    <td class="py-3.5 text-end font-monospace font-bold card-text-val align-middle" style="padding-right: 24px; color: <?= $running_balance >= 0 ? '#1e293b' : '#ef4444'; ?>;">
                                        <?= rupiah($running_balance); ?>
                                    </td>
                                </tr>
                            <?php endwhile; ?>

                            <!-- Baris Total Kumulatif -->
                            <tr class="bg-light-subtle table-light border-top border-dark-subtle" style="border-width: 2px !important; font-size: 0.9rem;">
                                <td colspan="4" class="py-3 text-end fw-bold text-uppercase text-slate-700">Total Periode Ini:</td>
                                <td class="py-3 text-end font-monospace fw-bold text-success">
                                    <?= rupiah($total_pemasukan); ?>
                                </td>
                                <td class="py-3 text-end font-monospace fw-bold text-danger">
                                    <?= rupiah($total_pengeluaran); ?>
                                </td>
                                <td class="py-3 text-end font-monospace fw-black text-primary" style="padding-right: 24px; color: <?= $saldo_akhir >= 0 ? '#2563eb' : '#ef4444'; ?> !important;">
                                    <?= rupiah($saldo_akhir); ?>
                                </td>
                            </tr>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="bi bi-journal-x fs-1 mb-3 text-secondary d-block"></i>
                                    <h5>Tidak Ada Data Yang Ditemukan</h5>
                                    <p class="small text-muted mb-0">Sesuaikan kriteria filter di atas untuk mengeksplorasi kembali catatan.</p>
                                </td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Teks Catatan Kaki Cetak & Tanda Tangan (Ditampilkan hanya pada media cetak) -->
    <div class="print-footer d-none mt-5" style="font-family: sans-serif;">
        <?php if (!empty($print_footer_note)): ?>
            <div style="text-align: center; text-transform: none; font-size: 0.72rem; font-style: italic; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-bottom: 35px; word-wrap: break-word;">
                <?= htmlspecialchars($print_footer_note); ?>
            </div>
        <?php endif; ?>
        
        <div style="display: flex; justify-content: space-between; padding: 0 40px; font-size: 0.8rem; color: #1e293b; page-break-inside: avoid;">
            <div class="text-center" style="width: 200px;">
                <div style="color: #64748b; margin-bottom: 55px;">Verifikasi,</div>
                <div style="border-bottom: 1.5px solid #1e293b; font-weight: 700; padding-bottom: 2px;"></div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">Pemeriksa Keuangan</div>
            </div>
            <div class="text-center" style="width: 200px;">
                <div style="color: #64748b; margin-bottom: 55px;">Disusun Oleh,</div>
                <div style="border-bottom: 1.5px solid #1e293b; font-weight: 700; padding-bottom: 2px;"><?= htmlspecialchars($_SESSION['nama'] ?? 'Bendahara'); ?></div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">Bendahara / Petugas</div>
            </div>
        </div>
    </div>
    
</div>
        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Modal Ekspor dengan Pilihan Bulan & Tahun sebelum Download -->
<div class="modal fade" id="exportModalModal" tabindex="-1" aria-labelledby="exportModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header border-bottom-0 pb-0">
                <h5 class="modal-title fw-black text-slate-800" id="exportModalLabel">
                    <i class="bi bi-download text-primary me-2"></i> Ekspor Laporan Keuangan
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <form action="laporan.php" method="GET" target="_blank" id="formEkspor">
                <!-- Keep existing non-date filters -->
                <input type="hidden" name="jenis" value="<?= htmlspecialchars($filter_jenis) ?>">
                <input type="hidden" name="kategori" value="<?= htmlspecialchars($filter_kategori) ?>">
                <input type="hidden" name="export" id="export_type" value="">
                <input type="hidden" name="print" id="print_trigger" value="">

                <div class="modal-body py-4">
                    <div class="alert alert-primary rounded-3 text-xs mb-4" style="background-color: rgba(37,99,235,0.06); border-color: rgba(37,99,235,0.12); color: #1e3a8a; font-size: 0.75rem;">
                        <i class="bi bi-info-circle-fill me-1.5 text-primary"></i>
                        Pilih rentang bulan dan tahun yang ingin Anda cetak atau unduh sebelum memproses file.
                    </div>
                    
                    <div class="row g-3">
                        <div class="col-6">
                            <label for="export_bulan" class="form-label text-xs fw-extrabold text-slate-700" style="font-size: 0.72rem;">Pilih Bulan</label>
                            <select class="form-select text-xs rounded-3" id="export_bulan" name="bulan">
                                <option value="semua" <?= ($filter_bulan === 'semua' || empty($filter_bulan)) ? 'selected' : ''; ?>>Semua Bulan</option>
                                <?php
                                $months = [
                                    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
                                    7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
                                ];
                                foreach ($months as $num => $name):
                                ?>
                                    <option value="<?= $num; ?>" <?= ($filter_bulan == $num) ? 'selected' : ''; ?>><?= $name; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-6">
                            <label for="export_tahun" class="form-label text-xs fw-extrabold text-slate-700" style="font-size: 0.72rem;">Pilih Tahun</label>
                            <select class="form-select text-xs rounded-3" id="export_tahun" name="tahun">
                                <option value="semua" <?= ($filter_tahun === 'semua' || empty($filter_tahun)) ? 'selected' : ''; ?>>Semua Tahun</option>
                                <?php
                                foreach ($db_years as $yr):
                                ?>
                                    <option value="<?= $yr; ?>" <?= ($filter_tahun == $yr) ? 'selected' : ''; ?>><?= $yr; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer border-top-0 pt-0 d-flex gap-2">
                    <button type="button" onclick="submitExport('pdf')" class="btn btn-outline-danger w-50 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2.5 fw-bold text-xs" style="background-color: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2)">
                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                        Cetak / PDF
                    </button>
                    <button type="button" onclick="submitExport('excel')" class="btn btn-outline-success w-50 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2.5 fw-bold text-xs" style="background-color: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2)">
                        <i class="bi bi-file-earmark-spreadsheet-fill text-success fs-5"></i>
                        Excel (.XLS)
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function toggleFilterFields() {
    const mode = document.getElementById('filter_mode').value;
    const monthlyFields = document.querySelectorAll('.filter-bulanan-field');
    const dateFields = document.querySelectorAll('.filter-tanggal-field');
    
    if (mode === 'bulanan') {
        monthlyFields.forEach(el => el.style.display = 'block');
        dateFields.forEach(el => el.style.display = 'none');
        document.getElementById('start_date').value = '';
        document.getElementById('end_date').value = '';
    } else {
        monthlyFields.forEach(el => el.style.display = 'none');
        dateFields.forEach(el => el.style.display = 'block');
        document.getElementById('bulan').value = 'semua';
        document.getElementById('tahun').value = 'semua';
    }
}

function submitExport(type) {
    const form = document.getElementById('formEkspor');
    const expTypeInput = document.getElementById('export_type');
    const printTrigger = document.getElementById('print_trigger');
    const modalEl = document.getElementById('exportModalModal');
    
    if (type === 'excel') {
        expTypeInput.value = 'excel';
        printTrigger.value = '';
    } else {
        expTypeInput.value = '';
        printTrigger.value = 'true';
    }
    
    form.submit();
    
    // Auto close modal
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if(modalInstance) {
        modalInstance.hide();
    }
}

// Jalankan ketika dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    toggleFilterFields();
});
</script>

<?php if (isset($_GET['print']) && $_GET['print'] === 'true'): ?>
<script>
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.print();
    }, 500);
});
</script>
<?php endif; ?>
</body>
</html>`;

export const KATEGORI_PHP = `<?php
// kategori.php
// Halaman Manajemen Kategori Transaksi (Pindahan dari pengaturan.php)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_username = $_SESSION['username'] ?? 'user';
$user_role = $_SESSION['role'] ?? 'admin';
$success_msg = "";
$error_msg = "";

// 1. Array Kategori Proteksi Sistem (Tidak boleh dihapus)
$system_categories = ['Gaji', 'Belanja', 'Transportasi', 'Makan & Minum', 'Tagihan', 'Freelance', 'Lainnya'];

// 2. Aksi: Tambah Kategori Baru
if (isset($_POST['add_category'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menambah kategori transaksi.";
    } else {
        $new_cat = trim($_POST['nama_kategori'] ?? '');
        $new_cat_clean = htmlspecialchars($new_cat);
        
        if (empty($new_cat)) {
            $error_msg = "Nama kategori tidak boleh kosong.";
        } else {
            $new_cat_escaped = mysqli_real_escape_string($koneksi, $new_cat);
            // Cek duplikasi
            $check_query = mysqli_query($koneksi, "SELECT id FROM kategori WHERE nama = '$new_cat_escaped'");
            if (mysqli_num_rows($check_query) > 0) {
                $error_msg = "Kategori dengan nama '$new_cat_clean' sudah terdaftar.";
            } else {
                $insert_query = "INSERT INTO kategori (nama) VALUES ('$new_cat_escaped')";
                if (mysqli_query($koneksi, $insert_query)) {
                    $success_msg = "Kategori baru '$new_cat_clean' berhasil ditambahkan!";
                } else {
                    $error_msg = "Gagal menambahkan kategori ke database.";
                }
            }
        }
    }
}

// 3. Aksi: Hapus Kategori
if (isset($_GET['delete_category'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menghapus kategori transaksi.";
    } else {
        $cat_id = intval($_GET['delete_category']);
        
        // Cari nama kategori berdasarkan ID
        $cat_query = mysqli_query($koneksi, "SELECT nama FROM kategori WHERE id = $cat_id");
        if ($cat_query && mysqli_num_rows($cat_query) > 0) {
            $cat_row = mysqli_fetch_assoc($cat_query);
            $cat_nama = $cat_row['nama'];
            
            // Cek proteksi sistem
            if (in_array($cat_nama, $system_categories)) {
                $error_msg = "Kategori bawaan system '$cat_nama' dilindungi dan tidak boleh dihapus.";
            } else {
                // Cek apakah ada transaksi aktif menggunakan kategori ini
                $cat_escaped = mysqli_real_escape_string($koneksi, $cat_nama);
                $check_trans = mysqli_query($koneksi, "SELECT COUNT(*) AS total FROM transaksi WHERE kategori = '$cat_escaped'");
                $trans_row = mysqli_fetch_assoc($check_trans);
                
                if ($trans_row['total'] > 0) {
                    $error_msg = "Kategori '$cat_nama' sedang digunakan oleh " . $trans_row['total'] . " transaksi aktif. Ubah atau hapus transaksi tersebut terlebih dahulu.";
                } else {
                    // Eksekusi hapus aman
                    $delete_query = "DELETE FROM kategori WHERE id = $cat_id";
                    if (mysqli_query($koneksi, $delete_query)) {
                        $success_msg = "Kategori '$cat_nama' berhasil dihapus dari database.";
                    } else {
                        $error_msg = "Gagal menghapus kategori.";
                    }
                }
            }
        } else {
            $error_msg = "Kategori tidak ditemukan.";
        }
    }
}

// Ambil semua kategori untuk ditampilkan
$all_categories = [];
$res_categories = mysqli_query($koneksi, "SELECT * FROM kategori ORDER BY id ASC");
if ($res_categories) {
    while ($row = mysqli_fetch_assoc($res_categories)) {
        $all_categories[] = $row;
    }
}

// Set active page for sidebar
$active_page = 'kategori';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Kategori - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
        }
        
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
            background-color: #ffffff;
            border: 1px solid rgba(241, 245, 249, 1);
        }

        .category-grid-item {
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            padding: 20px;
            background-color: #ffffff;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .category-grid-item:hover {
            border-color: #e2e8f0;
            box-shadow: 0 12px 24px -8px rgba(148, 163, 184, 0.2);
            transform: translateY(-2px);
        }

        .category-icon-wrapper {
            width: 48px;
            height: 48px;
            border-radius: 25%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            font-weight: 700;
            flex-shrink: 0;
            transition: background-color 0.2s ease;
        }

        .delete-cat-btn {
            opacity: 0.5;
            transition: all 0.2s ease;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
            border: none;
        }

        .category-grid-item:hover .delete-cat-btn {
            opacity: 1;
        }

        .delete-cat-btn:hover {
            color: #ffffff;
            background: #ef4444;
            transform: scale(1.05);
        }

        .badge-locked {
            font-size: 0.7rem;
            font-weight: 700;
            color: #64748b;
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .info-panel {
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.04), transparent);
            border: 1px dashed rgba(99, 102, 241, 0.2);
            border-radius: 16px;
        }
    </style>
</head>
<body>

<?php include 'sidebar.php'; ?>

<!-- Content Area -->
<div class="container-fluid py-3">
    
    <!-- Header Title Bar with neat layout -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 bg-white p-4 rounded-4 border border-slate-100 shadow-xs">
                <div class="d-flex align-items-center gap-3">
                    <div class="p-3 rounded-4 text-white d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, <?= $theme_cfg['primary']; ?>, <?= $theme_cfg['hover']; ?>); width: 54px; height: 54px; box-shadow: 0 4px 14px rgba(<?= $theme_cfg['rgb']; ?>, 0.35);">
                        <i class="bi bi-tags-fill fs-3"></i>
                    </div>
                    <div>
                        <h4 class="fw-bold text-slate-800 mb-0 font-sans">Kategori Transaksi</h4>
                        <p class="text-muted small mb-0">Kelola dan kelompokan transaksi finansial perusahaan secara aman</p>
                    </div>
                </div>
                <div class="text-md-end">
                    <span class="badge bg-primary-subtle text-primary font-monospace px-3 py-2 rounded-3" style="font-size: 0.75rem;">
                        <i class="bi bi-bookmark-star-fill me-1"></i> <?= count($all_categories); ?> Total Kategori
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Notifikasi Sukses / Gagal -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
            <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
            <div>
                <strong class="text-success-800 d-block">Berhasil!</strong>
                <span class="small text-slate-600"><?= $success_msg; ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
            <div>
                <strong class="text-danger-800 d-block">Gagal Proses!</strong>
                <span class="small text-slate-600"><?= $error_msg; ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="row g-4">
        <!-- 1. KANAN: LIST KATEGORI (8 COLS) -->
        <div class="col-lg-8 order-lg-1 order-2">
            <div class="card main-card p-4 h-100 shadow-sm">
                <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-folder2-open text-primary me-2"></i>Daftar Kategori Terdaftar
                    </h5>
                    <span class="text-muted small">Sorot untuk memunculkan tombol hapus custom</span>
                </div>

                <div class="row g-3">
                    <?php if (empty($all_categories)): ?>
                        <div class="col-12 py-5 text-center">
                            <i class="bi bi-tags text-muted fs-1 mb-2 d-block"></i>
                            <p class="text-muted mb-0 italic">Belum ada kategori terdafar dalam sistem database.</p>
                        </div>
                    <?php else: ?>
                        <?php 
                        // Map specific beautiful color palettes for categories based on name
                        $color_maps = [
                            'Gaji' => ['bg' => 'rgba(16, 185, 129, 0.1)', 'color' => '#10b981', 'icon' => 'bi-cash-coin'],
                            'Belanja' => ['bg' => 'rgba(239, 68, 68, 0.1)', 'color' => '#ef4444', 'icon' => 'bi-cart-fill'],
                            'Transportasi' => ['bg' => 'rgba(59, 130, 246, 0.1)', 'color' => '#3b82f6', 'icon' => 'bi-truck'],
                            'Makan & Minum' => ['bg' => 'rgba(245, 158, 11, 0.1)', 'color' => '#f59e0b', 'icon' => 'bi-cup-hot-fill'],
                            'Tagihan' => ['bg' => 'rgba(139, 92, 246, 0.1)', 'color' => '#8b5cf6', 'icon' => 'bi-receipt'],
                            'Freelance' => ['bg' => 'rgba(236, 72, 153, 0.1)', 'color' => '#ec4899', 'icon' => 'bi-laptop'],
                            'Lainnya' => ['bg' => 'rgba(100, 116, 139, 0.1)', 'color' => '#64748b', 'icon' => 'bi-three-dots']
                        ];
                        
                        foreach ($all_categories as $index => $cat): 
                            $cat_name = $cat['nama'];
                            $is_system = in_array($cat_name, $system_categories);
                            
                            // Get visual configuration
                            if (isset($color_maps[$cat_name])) {
                                $cfg = $color_maps[$cat_name];
                            } else {
                                // Dynamic pastel colors based on ASCII/Index value
                                $colors = [
                                    ['bg' => 'rgba(14, 165, 233, 0.1)', 'color' => '#0ea5e9', 'icon' => 'bi-tag-fill'],
                                    ['bg' => 'rgba(168, 85, 247, 0.1)', 'color' => '#a855f7', 'icon' => 'bi-bookmarks-fill'],
                                    ['bg' => 'rgba(20, 184, 166, 0.1)', 'color' => '#20b8a6', 'icon' => 'bi-bookmark-heart-fill'],
                                    ['bg' => 'rgba(234, 179, 8, 0.1)', 'color' => '#eab308', 'icon' => 'bi-wallet2'],
                                    ['bg' => 'rgba(251, 146, 60, 0.1)', 'color' => '#fb923c', 'icon' => 'bi-patch-plus-fill']
                                ];
                                $cfg = $colors[$index % count($colors)];
                            }
                        ?>
                            <div class="col-md-6 col-xl-4">
                                <div class="category-grid-item">
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="category-icon-wrapper" style="background-color: <?= $cfg['bg']; ?>; color: <?= $cfg['color']; ?>;">
                                            <i class="bi <?= $cfg['icon']; ?>"></i>
                                        </div>
                                        <div class="overflow-hidden">
                                            <span class="h6 fw-bold text-slate-800 mb-0 d-block text-truncate" title="<?= htmlspecialchars($cat_name); ?>">
                                                <?= htmlspecialchars($cat_name); ?>
                                            </span>
                                            <span class="text-muted d-block" style="font-size: 0.68rem;">ID Kategori: #<?= $cat['id']; ?></span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <?php if ($is_system): ?>
                                            <span class="badge-locked" title="Kategori Sistem: Tidak Bisa Dihapus">
                                                <i class="bi bi-shield-lock-fill"></i> Locked
                                            </span>
                                        <?php else: ?>
                                            <a href="kategori.php?delete_category=<?= $cat['id']; ?>" class="delete-cat-btn" onclick="return confirm('Apakah Anda yakin ingin mendelete kategori custom \'<?= htmlspecialchars($cat_name); ?>\'?');" title="Hapus Kategori">
                                                <i class="bi bi-trash-fill"></i>
                                            </a>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- 2. KIRI: FORM TAMBAH KATEGORI (4 COLS) -->
        <div class="col-lg-4 order-lg-2 order-1">
            <div class="card main-card p-4 shadow-sm h-100 mb-4 mb-lg-0">
                <div class="border-bottom pb-3 mb-4">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-plus-circle-fill text-primary me-2"></i>Tambah Kategori
                    </h5>
                    <p class="text-muted small mb-0 mt-1">Daftarkan label kategori anggaran baru kedalam sistem database</p>
                </div>

                <form action="kategori.php" method="POST" class="mb-4">
                    <input type="hidden" name="add_category" value="1">
                    
                    <div class="mb-3">
                        <label for="nama_kategori" class="form-label fw-bold text-slate-700 small">Nama Kategori Baru</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-tag-fill text-primary"></i></span>
                            <input type="text" class="form-control border-start-0 ps-1 rounded-end-3" id="nama_kategori" name="nama_kategori" placeholder="Misal: Investasi, Kesehatan" required maxlength="50" style="font-weight: 500;">
                        </div>
                        <div class="form-text text-muted small mt-2">Gunakan nama kategori yang padat dan mudah dipahami. Maksimal 50 karakter.</div>
                    </div>

                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 shadow-sm">
                            <i class="bi bi-plus-lg fs-5"></i><span>Simpan Kategori</span>
                        </button>
                    </div>
                </form>

                <!-- Guideline Panel Info -->
                <div class="p-3 info-panel mt-auto">
                    <h6 class="fw-bold text-indigo-800 d-flex align-items-center gap-2" style="font-size: 0.82rem; color: #3730a3;">
                        <i class="bi bi-info-circle-fill"></i> Panduan Pengelolaan
                    </h6>
                    <p class="text-muted mb-0 leading-relaxed" style="font-size: 0.72rem; line-height: 1.5;">
                        Kategori default bersistem (<span class="font-bold text-dark">Locked</span>) dikunci otomatis untuk kelancaran komparasi grafik dashboard utama. Anda dipersilahkan membuat kategori kustom sesuka hati guna mencatat rincian transaksi kas secara lebih spesifik.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

export const ANGGARAN_PHP = `<?php
// anggaran.php
// Halaman Manajemen Anggaran & Limit Kategori Transaksi (Proaktif Control)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

\$user_username = \$_SESSION['username'] ?? 'user';
\$user_role = \$_SESSION['role'] ?? 'admin';
\$success_msg = "";
\$error_msg = "";

// 1. Aksi: Simpan / Update Limit Kategori
if (isset(\$_POST['set_budget'])) {
    if (\$user_role === 'user') {
        \$error_msg = "Akses Ditolak: Peran 'user' hanya diizinkan untuk melihat visualisasi anggaran.";
    } else {
        \$kat_nama = trim(\$_POST['kategori_nama'] ?? '');
        \$limit_bulanan = intval(\$_POST['limit_bulanan'] ?? '0');

        if (empty(\$kat_nama)) {
            \$error_msg = "Silakan pilih atau tentukan kategori pengeluaran.";
        } elseif (\$limit_bulanan < 0) {
            \$error_msg = "Limit bulanan tidak boleh kurang dari Rp 0.";
        } else {
            \$kat_escaped = mysqli_real_escape_string(\$koneksi, \$kat_nama);
            
            // Cek apakah data anggaran untuk kategori ini sudah ada
            \$check_query = mysqli_query(\$koneksi, "SELECT id FROM anggaran WHERE kategori = '\$kat_escaped'");
            if (mysqli_num_rows(\$check_query) > 0) {
                // Update
                \$save_query = "UPDATE anggaran SET limit_bulanan = \$limit_bulanan WHERE kategori = '\$kat_escaped'";
            } else {
                // Insert
                \$save_query = "INSERT INTO anggaran (kategori, limit_bulanan) VALUES ('\$kat_escaped', \$limit_bulanan)";
            }

            if (mysqli_query(\$koneksi, \$save_query)) {
                \$success_msg = "Batas kuota anggaran untuk '" . htmlspecialchars(\$kat_nama) . "' berhasil disimpan!";
            } else {
                \$error_msg = "Gagal memperbarui database anggaran.";
            }
        }
    }
}

// 2. Ambil pengeluaran aktual bulan ini per kategori
\$current_month = date('m');
\$current_year = date('Y');

\$spending_data = [];
\$spending_query = mysqli_query(\$koneksi, "
    SELECT kategori, SUM(jumlah) AS total_spent 
    FROM transaksi 
    WHERE jenis = 'pengeluaran' 
      AND MONTH(tanggal) = \$current_month 
      AND YEAR(tanggal) = \$current_year 
    GROUP BY kategori
");

if (\$spending_query) {
    while (\$row = mysqli_fetch_assoc(\$spending_query)) {
        \$spending_data[\$row['kategori']] = intval(\$row['total_spent']);
    }
}

// 3. Ambil semua kategori dari tabel kategori
\$all_categories = [];
\$cat_query = mysqli_query(\$koneksi, "SELECT nama FROM kategori ORDER BY nama ASC");
if (\$cat_query) {
    while (\$row = mysqli_fetch_assoc(\$cat_query)) {
        \$all_categories[] = \$row['nama'];
    }
}

// 4. Ambil konfigurasi limit anggaran terdaftar
\$budget_limits = [];
\$budget_query = mysqli_query(\$koneksi, "SELECT * FROM anggaran");
if (\$budget_query) {
    while (\$row = mysqli_fetch_assoc(\$budget_query)) {
        \$budget_limits[\$row['kategori']] = intval(\$row['limit_bulanan']);
    }
}

// Set active page for sidebar navigation
\$active_page = 'anggaran';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Anggaran - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
        }
        
        .main-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
            background-color: #ffffff;
            border: 1px solid rgba(241, 245, 249, 1);
        }

        .progress-compact {
            height: 10px;
            border-radius: 99px;
            background-color: #e2e8f0;
            overflow: hidden;
        }

        .budget-card {
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            background: #ffffff;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .budget-card:hover {
            border-color: #e2e8f0;
            box-shadow: 0 12px 24px -8px rgba(148, 163, 184, 0.25);
            transform: translateY(-2px);
        }

        .budget-card.warning-near {
            border-left: 5px solid #eab308;
            background: linear-gradient(90deg, rgba(234, 179, 8, 0.02) 0%, #ffffff 100%);
        }

        .budget-card.danger-limit {
            border-left: 5px solid #ef4444;
            background: linear-gradient(90deg, rgba(239, 68, 68, 0.02) 0%, #ffffff 100%);
        }

        .budget-card.safe-limit {
            border-left: 5px solid #10b981;
        }

        .budget-icon-wrapper {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .info-panel {
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.04), transparent);
            border: 1px dashed rgba(99, 102, 241, 0.2);
            border-radius: 16px;
        }

        .status-badge {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
    </style>
</head>
<body>

<?php include 'sidebar.php'; ?>

<!-- Content Area -->
<div class="container-fluid py-3">
    
    <!-- Header Title Bar -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 bg-white p-4 rounded-4 border border-slate-100 shadow-xs">
                <div class="d-flex align-items-center gap-3">
                    <div class="p-3 rounded-4 text-white d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #4f46e5, #6366f1); width: 54px; height: 54px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);">
                        <i class="bi bi-pie-chart-fill fs-3"></i>
                    </div>
                    <div>
                        <h4 class="fw-bold text-slate-800 mb-0 font-sans">Anggaran Belanja</h4>
                        <p class="text-muted small mb-0">Kontrol pengeluaran bulanan secara proaktif dengan batas kuota kategori</p>
                    </div>
                </div>
                <div class="text-md-end">
                    <span class="badge bg-primary-subtle text-primary font-monospace px-3 py-2 rounded-3" style="font-size: 0.75rem;">
                        <i class="bi bi-calendar3 me-1"></i> Bulan: \<?= date('F Y'); ?>
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Notifikasi Sukses / Gagal -->
    <?php if (!empty(\$success_msg)): ?>
        <div class="alert alert-success alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2) !important;">
            <i class="bi bi-check-circle-fill text-success fs-4 me-3"></i>
            <div>
                <strong class="text-success-800 d-block">Simpan Anggaran Sukses!</strong>
                <span class="small text-slate-600">\<?= htmlspecialchars(\$success_msg); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <?php if (!empty(\$error_msg)): ?>
        <div class="alert alert-danger alert-dismissible fade show rounded-4 border-0 shadow-xs p-3 mb-4 d-flex align-items-center" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2) !important;">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
            <div>
                <strong class="text-danger-800 d-block">Terjadi Kendala!</strong>
                <span class="small text-slate-600">\<?= htmlspecialchars(\$error_msg); ?></span>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <div class="row g-4">
        <!-- 1. KIRI: FORM CONFIGURATION (Untuk Admin/Superadmin) -->
        <div class="col-lg-4">
            <div class="card main-card p-4 shadow-sm h-100">
                <div class="border-bottom pb-3 mb-4">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-shield-lock-fill text-primary me-2"></i>Setel Batas Kuota
                    </h5>
                    <p class="text-muted small mb-0 mt-1">Ubah atau tentukan batas maksimal spending per kategori bulanan</p>
                </div>

                <?php if (\$user_role === 'user'): ?>
                    <div class="alert alert-info rounded-4 border-0 p-3 mb-4" style="background-color: rgba(99, 102, 241, 0.08);">
                        <i class="bi bi-info-circle-fill text-primary me-2 fs-5"></i>
                        <span class="small text-slate-700">Akun Anda berpangkat <strong>User</strong>. Hanya <strong>Admin / Superadmin</strong> yang diizinkan mengedit budget limit kategori.</span>
                    </div>
                <?php endif; ?>

                <form action="anggaran.php" method="POST" class="mb-4">
                    <input type="hidden" name="set_budget" value="1">
                    
                    <div class="mb-3">
                        <label for="kategori_nama" class="form-label fw-bold text-slate-700 small">Pilih Kategori Transaksi</label>
                        <select class="form-select border-slate-200 py-2.5 rounded-3 fw-medium" id="kategori_nama" name="kategori_nama" required \<?= \$user_role === 'user' ? 'disabled' : ''; ?>>
                            <option value="">-- Silakan Pilih Kategori --</option>
                            <?php foreach (\$all_categories as \$item_cat): ?>
                                <option value="\<?= htmlspecialchars(\$item_cat); ?>">\<?= htmlspecialchars(\$item_cat); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="limit_bulanan" class="form-label fw-bold text-slate-700 small">Batas Kuota Bulanan (Rp)</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light text-muted border-end-0 fw-bold">Rp</span>
                            <input type="number" class="form-control border-start-0 ps-1 rounded-end-3" id="limit_bulanan" name="limit_bulanan" placeholder="Misal: 3000000" min="0" required \<?= \$user_role === 'user' ? 'disabled' : ''; ?> style="font-weight: 500;">
                        </div>
                        <div class="form-text text-muted small mt-2">Masukkan nilai 0 untuk menonaktifkan kontrol budget kategori (unlimited).</div>
                    </div>

                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary rounded-3 py-2.5 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 shadow-sm" \<?= \$user_role === 'user' ? 'disabled' : ''; ?>>
                            <i class="bi bi-check2-circle fs-5"></i><span>Terapkan Limit</span>
                        </button>
                    </div>
                </form>

                <!-- Guideline Panel Info -->
                <div class="p-3 info-panel mt-auto">
                    <h6 class="fw-bold text-indigo-800 d-flex align-items-center gap-2" style="font-size: 0.82rem; color: #3730a3;">
                        <i class="bi bi-lightning-charge-fill"></i> Efek Kontrol Proaktif
                    </h6>
                    <p class="text-muted mb-0 leading-relaxed" style="font-size: 0.72rem; line-height: 1.55;">
                        Sistem memonitor total transaksi berjenis <strong>pengeluaran</strong> sepanjang bulan berjalan secara real-time. Banner peringatan akan otomatis tampil di beranda ketika pengeluaran di salah satu kategori melewati <strong>90%</strong> kuota limit.
                    </p>
                </div>
            </div>
        </div>

        <!-- 2. KANAN: LIVE BUDGET STATUS LIST (8 COLS) -->
        <div class="col-lg-8">
            <div class="card main-card p-4 shadow-sm h-100">
                <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                    <h5 class="fw-bold text-slate-800 mb-0">
                        <i class="bi bi-speedometer2 text-primary me-2"></i>Status Kepatuhan Anggaran
                    </h5>
                    <span class="text-muted small">Update Terakhir: \<?= date('d M Y H:i'); ?></span>
                </div>

                <div class="row g-3">
                    <?php if (empty(\$all_categories)): ?>
                        <div class="col-12 py-5 text-center">
                            <i class="bi bi-pie-chart text-muted fs-1 mb-2 d-block"></i>
                            <p class="text-muted mb-0 italic">Belum ada kategori transaksi yang terdaftar.</p>
                        </div>
                    <?php else: ?>
                        <?php 
                        foreach (\$all_categories as \$index => \$cat_name): 
                            \$limit = \$budget_limits[\$cat_name] ?? 0;
                            \$spent = \$spending_data[\$cat_name] ?? 0;

                            \$pct = 0;
                            if (\$limit > 0) {
                                \$pct = (\$spent / \$limit) * 100;
                            }
                            
                            \$pct_formatted = number_format(\$pct, 1);
                            
                            // Visual properties based on limit compliance
                            if (\$limit === 0) {
                                \$card_class = "safe-limit";
                                \$status_text = "Tanpa Batas";
                                \$status_badge_bg = "background-color: rgba(100, 116, 139, 0.08); color: #64748b; border: 1px solid #cbd5e1;";
                                \$prog_color = "bg-secondary";
                                \$text_color = "text-secondary";
                                \$icon_char = "bi-infinity";
                            } elseif (\$pct >= 100) {
                                \$card_class = "danger-limit";
                                \$status_text = "Over Limit";
                                \$status_badge_bg = "background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);";
                                \$prog_color = "bg-danger";
                                \$text_color = "text-danger";
                                \$icon_char = "bi-exclamation-octagon-fill";
                            } elseif (\$pct >= 90) {
                                \$card_class = "danger-limit";
                                \$status_text = "Sangat Kritis (>90%)";
                                \$status_badge_bg = "background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15);";
                                \$prog_color = "bg-danger";
                                \$text_color = "text-danger";
                                \$icon_char = "bi-exclamation-triangle-fill";
                            } elseif (\$pct >= 70) {
                                \$card_class = "warning-near";
                                \$status_text = "Waspada (>70%)";
                                \$status_badge_bg = "background-color: rgba(234, 179, 8, 0.1); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.2);";
                                \$prog_color = "bg-warning";
                                \$text_color = "text-warning";
                                \$icon_char = "bi-shield-exclamation";
                            } else {
                                \$card_class = "safe-limit";
                                \$status_text = "Aman";
                                \$status_badge_bg = "background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);";
                                \$prog_color = "bg-success";
                                \$text_color = "text-success";
                                \$icon_char = "bi-shield-fill-check";
                            }

                            // Palette for wrapping
                            \$icons_map = [
                                'Gaji' => 'bi-cash-coin',
                                'Belanja' => 'bi-cart-fill',
                                'Transportasi' => 'bi-truck',
                                'Makan & Minum' => 'bi-cup-hot-fill',
                                'Tagihan' => 'bi-receipt',
                                'Freelance' => 'bi-laptop',
                                'Lainnya' => 'bi-three-dots'
                            ];
                            \$curr_icon = \$icons_map[\$cat_name] ?? 'bi-tag-fill';
                        ?>
                            <div class="col-12">
                                <div class="budget-card p-3.5 \<?= \$card_class; ?>">
                                    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="budget-icon-wrapper bg-light text-dark">
                                                <i class="bi \<?= \$curr_icon; ?> text-primary"></i>
                                            </div>
                                            <div>
                                                <h6 class="fw-bold text-slate-800 mb-0">\<?= htmlspecialchars(\$cat_name); ?></h6>
                                                <span class="text-muted small">Aktual: <strong class="text-slate-700">\<?= rupiah(\$spent); ?></strong></span>
                                            </div>
                                        </div>
                                        
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="status-badge" style="\<?= \$status_badge_bg; ?>">
                                                <i class="bi \<?= \$icon_char; ?>"></i> \<?= \$status_text; ?>
                                            </span>
                                            <span class="text-muted small fw-bold font-monospace">
                                                / \<?= \$limit > 0 ? rupiah(\$limit) : 'Bebas Limit'; ?>
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Progress Loading bar -->
                                    <?php if (\$limit > 0): ?>
                                        <div class="row align-items-center g-2">
                                            <div class="col">
                                                <div class="progress progress-compact">
                                                    <div class="progress-bar \<?= \$prog_color; ?> progress-bar-striped progress-bar-animated" role="progressbar" style="width: \<?= min(\$pct, 100); ?>%" aria-valuenow="\<?= min(\$pct, 100); ?>" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                            <div class="col-auto">
                                                <span class="small font-monospace fw-bold \<?= \$text_color; ?>">\<?= \$pct_formatted; ?>%</span>
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <div class="row align-items-center g-2">
                                            <div class="col">
                                                <div class="progress progress-compact">
                                                    <div class="progress-bar bg-slate-300" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                            <div class="col-auto">
                                                <span class="small font-monospace text-muted fw-bold">Unlimited</span>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`;


export const REKENING_PHP = `<?php
// rekening.php
// Halaman Manajemen Rekening & Dompet Keuangan (Multi-Wallet Management)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_username = $_SESSION['username'] ?? 'user';
$user_role = $_SESSION['role'] ?? 'admin';
$success_msg = "";
$error_msg = "";

// 1. Aksi: Tambah Dompet Baru
if (isset($_POST['add_dompet'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menambah rekening/dompet.";
    } else {
        $nama = trim($_POST['nama_dompet'] ?? '');
        $saldo_awal = intval($_POST['saldo_awal'] ?? 0);
        $nama_rekening = trim($_POST['nama_rekening'] ?? '-');
        $no_rekening = trim($_POST['no_rekening'] ?? '-');
        $nama_clean = htmlspecialchars($nama);
        
        if (empty($nama)) {
            $error_msg = "Nama dompet tidak boleh kosong.";
        } else {
            $nama_escaped = mysqli_real_escape_string($koneksi, $nama);
            $nama_rekening_escaped = mysqli_real_escape_string($koneksi, $nama_rekening);
            $no_rekening_escaped = mysqli_real_escape_string($koneksi, $no_rekening);
            // Cek duplikasi
            $check_query = mysqli_query($koneksi, "SELECT id FROM dompet WHERE nama = '$nama_escaped'");
            if (mysqli_num_rows($check_query) > 0) {
                $error_msg = "Dompet atau Rekening dengan nama '$nama_clean' sudah terdaftar.";
            } else {
                $insert_query = "INSERT INTO dompet (nama, saldo_awal, nama_rekening, no_rekening) VALUES ('$nama_escaped', $saldo_awal, '$nama_rekening_escaped', '$no_rekening_escaped')";
                if (mysqli_query($koneksi, $insert_query)) {
                    $success_msg = "Dompet baru '$nama_clean' berhasil ditambahkan dengan saldo awal Rp " . number_format($saldo_awal, 0, ',', '.') . "!";
                } else {
                    $error_msg = "Gagal menyimpan data dompet baru.";
                }
            }
        }
    }
}

// 2. Aksi: Edit Dompet
if (isset($_POST['edit_dompet'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan memodifikasi rekening/dompet.";
    } else {
        $id = intval($_POST['id_dompet']);
        $nama_baru = trim($_POST['nama_dompet'] ?? '');
        $saldo_awal_baru = intval($_POST['saldo_awal'] ?? 0);
        $nama_rekening_baru = trim($_POST['nama_rekening'] ?? '-');
        $no_rekening_baru = trim($_POST['no_rekening'] ?? '-');
        $nama_baru_clean = htmlspecialchars($nama_baru);
        
        if (empty($nama_baru)) {
            $error_msg = "Nama dompet tidak boleh kosong.";
        } else {
            $nama_baru_escaped = mysqli_real_escape_string($koneksi, $nama_baru);
            $nama_rekening_baru_escaped = mysqli_real_escape_string($koneksi, $nama_rekening_baru);
            $no_rekening_baru_escaped = mysqli_real_escape_string($koneksi, $no_rekening_baru);
            
            // Ambil nama lama
            $curr_q = mysqli_query($koneksi, "SELECT nama FROM dompet WHERE id = $id");
            if ($curr_q && mysqli_num_rows($curr_q) > 0) {
                $curr_row = mysqli_fetch_assoc($curr_q);
                $nama_lama = $curr_row['nama'];
                
                if ($nama_lama === 'Tunai' && $nama_baru !== 'Tunai') {
                    $error_msg = "Nama rekening utama 'Tunai' dilindungi sistem dan tidak boleh diubah.";
                } else {
                    // Cek duplikasi di baris lain
                    $chk_dup = mysqli_query($koneksi, "SELECT id FROM dompet WHERE nama = '$nama_baru_escaped' AND id != $id");
                    if (mysqli_num_rows($chk_dup) > 0) {
                        $error_msg = "Nama dompet '$nama_baru_clean' sudah digunakan oleh rekening lain.";
                    } else {
                        // Secara kaskade mengupdate nama dompet di histori transaksi jika nama berubah
                        $update_tx_success = true;
                        if ($nama_lama !== $nama_baru) {
                            $nama_lama_escaped = mysqli_real_escape_string($koneksi, $nama_lama);
                            $update_tx_success = mysqli_query($koneksi, "UPDATE transaksi SET dompet = '$nama_baru_escaped' WHERE dompet = '$nama_lama_escaped'");
                        }
                        
                        if ($update_tx_success) {
                            $q_update = "UPDATE dompet SET nama = '$nama_baru_escaped', saldo_awal = $saldo_awal_baru, nama_rekening = '$nama_rekening_baru_escaped', no_rekening = '$no_rekening_baru_escaped' WHERE id = $id";
                            if (mysqli_query($koneksi, $q_update)) {
                                $success_msg = "Perubahan rekening '$nama_baru_clean' berhasil disimpan dan terintegrasi kaskade!";
                            } else {
                                $error_msg = "Gagal menyimpan perubahan rekening.";
                            }
                        } else {
                            $error_msg = "Gagal memperbarui relasi riwayat transaksi.";
                        }
                    }
                }
            }
        }
    }
}

// 3. Aksi: Hapus Dompet
if (isset($_GET['delete_dompet'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menghapus rekening/dompet.";
    } else {
        $dompet_id = intval($_GET['delete_dompet']);
        
        $q_find = mysqli_query($koneksi, "SELECT nama FROM dompet WHERE id = $dompet_id");
        if ($q_find && mysqli_num_rows($q_find) > 0) {
            $row = mysqli_fetch_assoc($q_find);
            $dompet_nama = $row['nama'];
            
            if ($dompet_nama === 'Tunai') {
                $error_msg = "Dompet dasar 'Tunai' dilindungi dan tidak boleh dihapus.";
            } else {
                // Cek ketersediaan transaksi terhubung
                $nama_escaped = mysqli_real_escape_string($koneksi, $dompet_nama);
                $check_tx = mysqli_query($koneksi, "SELECT id FROM transaksi WHERE dompet = '$nama_escaped'");
                if (mysqli_num_rows($check_tx) > 0) {
                    $error_msg = "Gagal menghapus: Rekening '$dompet_nama' masih memiliki rentetan riwayat transaksi terikat. Silakan hapus atau alihkan transaksi tersebut terlebih dahulu.";
                } else {
                    $delete_query = "DELETE FROM dompet WHERE id = $dompet_id";
                    if (mysqli_query($koneksi, $delete_query)) {
                        $success_msg = "Rekening '" . htmlspecialchars($dompet_nama) . "' berhasil dihapus dari database.";
                    } else {
                        $error_msg = "Gagal menghapus rekening dari database.";
                    }
                }
            }
        }
    }
}

// Ambil semua daftar dompet
$dompet_list = [];
$q_dompet = mysqli_query($koneksi, "SELECT * FROM dompet ORDER BY id ASC");
if ($q_dompet) {
    while($r = mysqli_fetch_assoc($q_dompet)) {
        $dompet_list[] = $r;
    }
}

$active_page = 'rekening';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Dompet & Rekening - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <!-- Google Fonts Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .rekening-card {
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transition: all 0.25s ease;
        }
        .rekening-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e1;
        }
        .card-form {
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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

<?php include 'sidebar.php'; ?>

    <!-- Header Action Bar -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3" style="border-bottom: 1px solid #e2e8f0;">
        <div>
            <h4 class="fw-bold text-slate-800 mb-1">Manajemen Dompet / Rekening</h4>
            <p class="text-muted small mb-0">Kelola rekening penyimpanan uang kustom secara terpisah dan pantau saldo berjalan riil Anda.</p>
        </div>
        <div>
            <?php if ($user_role !== 'user'): ?>
            <button class="btn btn-primary rounded-3 px-4 py-2.5 fw-bold text-uppercase tracking-wider shadow-sm d-flex align-items-center gap-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForm" aria-expanded="false" aria-controls="collapseForm">
                <i class="bi bi-wallet-fill"></i> <span>Buat Dompet</span>
            </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Alert status and actions -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0 shadow-sm" role="alert" style="background-color: rgba(16, 185, 129, 0.1); color: #047857;">
            <i class="bi bi-check-circle-fill me-2.5 fs-5 text-success"></i>
            <div class="small fw-semibold">Sukses: <?= $success_msg; ?></div>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="alert alert-danger px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0 shadow-sm" role="alert" style="background-color: rgba(239, 68, 68, 0.1); color: #b91c1c;">
            <i class="bi bi-exclamation-triangle-fill me-2.5 fs-5 text-danger"></i>
            <div class="small fw-semibold"><?= $error_msg; ?></div>
        </div>
    <?php endif; ?>

    <!-- Collapsible Form row -->
    <div class="collapse mb-4" id="collapseForm">
        <div class="row">
            <div class="col-lg-12">
                <div class="card-form p-4 p-md-5 bg-white border">
                    <div class="d-flex align-items-center gap-2 mb-4 pb-3" style="border-bottom: 1px solid #f1f5f9;">
                        <div class="bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="bi bi-wallet2 fs-5"></i>
                        </div>
                        <div>
                            <h5 class="fw-bold text-slate-800 mb-0">Tambah Penyimpanan Baru</h5>
                            <p class="text-muted small mb-0" style="font-size: 0.73rem;">Menambahkan tempat penyimpanan baru seperti Kas, Rekening Bank, atau Dompet Digital.</p>
                        </div>
                    </div>

                    <form action="rekening.php" method="POST">
                        <input type="hidden" name="add_dompet" value="1">
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label for="nama_dompet" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Penyedia (Bank/e-Wallet)</label>
                                <input type="text" class="form-control py-2 px-3 focus-border-primary fw-bold" id="nama_dompet" name="nama_dompet" placeholder="Contoh: Bank BCA, Gopay, OVO, Tunai" required>
                            </div>
                            <div class="col-md-6">
                                <label for="saldo_awal" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Saldo Awal (Rupiah Rp)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light text-slate-500 font-monospace" style="font-size: 0.9rem;">Rp</span>
                                    <input type="number" class="form-control font-monospace fw-bold" id="saldo_awal" name="saldo_awal" value="0" min="0" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label for="nama_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Pemilik Rekening (Atas Nama)</label>
                                <input type="text" class="form-control py-2 px-3 fw-bold" id="nama_rekening" name="nama_rekening" value="-" placeholder="Nama Pemilik Rekening" required>
                            </div>
                            <div class="col-md-6">
                                <label for="no_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nomor Rekening</label>
                                <input type="text" class="form-control py-2 px-3 fw-bold" id="no_rekening" name="no_rekening" value="-" placeholder="Nomor Rekening / No Telepon" required>
                            </div>
                        </div>

                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-bold" data-bs-toggle="collapse" data-bs-target="#collapseForm">Batal</button>
                            <button type="submit" class="btn btn-primary flex-grow-1 py-2.5 rounded-3 fw-bold text-uppercase tracking-wider">
                                <i class="bi bi-plus-circle-fill me-1.5"></i> Daftarkan Penyimpanan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MAIN GRID CARDS OF ACCOUNT WALLETS -->
    <div class="row g-4 mb-4">
        <?php if (count($dompet_list) > 0): ?>
            <?php foreach ($dompet_list as $dp): 
                $nama_dp = $dp['nama'];
                $dp_id = $dp['id'];
                $saldo_awal_val = intval($dp['saldo_awal']);
                
                // Cari total mutasi secara aman
                $nama_dp_escaped = mysqli_real_escape_string($koneksi, $nama_dp);
                $q_flow = mysqli_query($koneksi, "
                    SELECT 
                        COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END), 0) AS total_in,
                        COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END), 0) AS total_out
                    FROM transaksi 
                    WHERE dompet = '$nama_dp_escaped'
                ");
                $flow_row = mysqli_fetch_assoc($q_flow);
                $total_masuk = intval($flow_row['total_in']);
                $total_keluar = intval($flow_row['total_out']);
                $saldo_berjalan = $saldo_awal_val + $total_masuk - $total_keluar;

                // Customize branding colors based on identity
                $badge_bg = "bg-primary";
                $border_left_color = "border-left: 5px solid #2563eb;";
                $card_icon = "bi-wallet2";

                if (stripos($nama_dp, 'bca') !== false) {
                    $border_left_color = "border-left: 5px solid #1e3a8a;";
                    $badge_bg = "bg-info text-dark";
                    $card_icon = "bi-bank2";
                } elseif (stripos($nama_dp, 'ovo') !== false) {
                    $border_left_color = "border-left: 5px solid #6d28d9;";
                    $badge_bg = "bg-purple text-white";
                    $card_icon = "bi-phone-fill";
                } elseif (stripos($nama_dp, 'gopay') !== false) {
                    $border_left_color = "border-left: 5px solid #06b6d4;";
                    $badge_bg = "bg-cyan text-white";
                    $card_icon = "bi-phone-fill";
                } elseif ($nama_dp === 'Tunai') {
                    $border_left_color = "border-left: 5px solid #10b981;";
                    $badge_bg = "bg-success";
                    $card_icon = "bi-cash";
                } elseif (stripos($nama_dp, 'kas') !== false) {
                    $border_left_color = "border-left: 5px solid #f59e0b;";
                    $badge_bg = "bg-warning text-dark";
                    $card_icon = "bi-briefcase-fill";
                }
            ?>
                <div class="col-md-6 col-lg-4">
                    <div class="rekening-card p-4 h-100 d-flex flex-column justify-content-between" style="<?= $border_left_color; ?>">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge <?= $badge_bg; ?> px-2.5 py-1.5 rounded-3 d-flex align-items-center gap-1.5 fw-bold font-monospace" style="font-size: 0.73rem;">
                                    <i class="bi <?= $card_icon; ?> fs-6"></i>
                                    <?= htmlspecialchars($nama_dp); ?>
                                </span>
                                <?php if ($nama_dp !== 'Tunai' && $user_role !== 'user'): ?>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-light rounded-circle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="width: 32px; height: 32px;">
                                            <i class="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 rounded-3 text-sm">
                                            <li>
                                                <button class="dropdown-item rounded-2 fw-semibold d-flex align-items-center gap-2 py-2" type="button" onclick="openEditDompetModal(<?= $dp_id; ?>, '<?= addslashes($nama_dp); ?>', <?= $saldo_awal_val; ?>, '<?= addslashes($dp['nama_rekening'] ?? ''); ?>', '<?= addslashes($dp['no_rekening'] ?? ''); ?>')">
                                                    <i class="bi bi-pencil-square text-primary"></i> Edit Rekening
                                                </button>
                                            </li>
                                            <li>
                                                <a class="dropdown-item rounded-2 text-danger fw-semibold d-flex align-items-center gap-2 py-2" href="rekening.php?delete_dompet=<?= $dp_id; ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus rekening <?= addslashes($nama_dp); ?> ini? Semua transaksi didalamnya harus kosong.');">
                                                    <i class="bi bi-trash"></i> Hapus Rekening
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <span class="text-uppercase font-monospace tracking-wider text-muted py-1 d-block" style="font-size: 0.65rem; font-weight: 800;">Saldo Terkini / Berjalan</span>
                            <h3 class="fw-black mb-1 font-monospace <?= ($saldo_berjalan < 0) ? 'text-danger' : 'text-slate-900'; ?>" style="font-size: 1.65rem; font-weight: 900;">
                                Rp <?= number_format($saldo_berjalan, 0, ',', '.'); ?>
                            </h3>

                            <div class="small text-muted mb-3 mt-2" style="font-size: 0.77rem;">
                                <div class="d-flex align-items-center gap-1.5 justify-content-between mb-1 bg-light p-1.5 px-2 rounded-2">
                                    <span class="text-secondary fw-semibold"><i class="bi bi-person me-1"></i> A/N:</span>
                                    <span class="fw-bold text-slate-800 text-truncate text-end" style="max-width: 140px;"><?= htmlspecialchars($dp['nama_rekening'] ?? '-'); ?></span>
                                </div>
                                <div class="d-flex align-items-center gap-1.5 justify-content-between bg-light p-1.5 px-2 rounded-2">
                                    <span class="text-secondary fw-semibold"><i class="bi bi-credit-card me-1"></i> Rek:</span>
                                    <span class="fw-bold font-monospace text-slate-850"><?= htmlspecialchars($dp['no_rekening'] ?? '-'); ?></span>
                                </div>
                            </div>

                            <hr class="border-light-subtle my-3">

                            <div class="space-y-1.5 text-xs font-semibold text-slate-500">
                                <div class="d-flex justify-content-between mb-1.5">
                                    <span>Saldo Awal:</span>
                                    <span class="font-monospace text-slate-700">Rp <?= number_format($saldo_awal_val, 0, ',', '.'); ?></span>
                                </div>
                                <div class="d-flex justify-content-between mb-1.5 text-success">
                                    <span>Total Dana Masuk (+):</span>
                                    <span class="font-monospace">+ Rp <?= number_format($total_masuk, 0, ',', '.'); ?></span>
                                </div>
                                <div class="d-flex justify-content-between text-danger">
                                    <span>Total Dana Keluar (-):</span>
                                    <span class="font-monospace">- Rp <?= number_format($total_keluar, 0, ',', '.'); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="col-12 py-5 text-center text-muted">
                <i class="bi bi-wallet2 fs-1 text-secondary mb-3 d-block"></i>
                <h5>Belum Ada Data Rekening</h5>
                <p class="small">Koneksi data dompet Anda terindikasi kosong.</p>
            </div>
        <?php endif; ?>
    </div>

    <!-- Edit Dompet Modal -->
    <div class="modal fade" id="editDompetModal" tabindex="-1" aria-labelledby="editDompetModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold text-slate-800" id="editDompetModalLabel"><i class="bi bi-pencil-square text-primary me-2"></i> Ubah Detail Rekening</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form action="rekening.php" method="POST">
                    <input type="hidden" name="edit_dompet" value="1">
                    <input type="hidden" name="id_dompet" id="edit_id_dompet">
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label for="edit_nama_dompet" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Penyedia (Bank/e-Wallet)</label>
                            <input type="text" class="form-control py-2 px-3 fw-bold" id="edit_nama_dompet" name="nama_dompet" required>
                        </div>
                        <div class="mb-3">
                            <label for="edit_saldo_awal" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Saldo Awal (Rupiah Rp)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-slate-500 font-monospace" style="font-size: 0.9rem;">Rp</span>
                                <input type="number" class="form-control font-monospace fw-bold" id="edit_saldo_awal" name="saldo_awal" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="edit_nama_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Pemilik (Atas Nama)</label>
                            <input type="text" class="form-control py-2 px-3 fw-bold" id="edit_nama_rekening" name="nama_rekening" required>
                        </div>
                        <div class="mb-0">
                            <label for="edit_no_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nomor Rekening / HP</label>
                            <input type="text" class="form-control py-2 px-3 fw-bold" id="edit_no_rekening" name="no_rekening" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary px-5 py-2 rounded-3 fw-bold text-uppercase tracking-wider">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

<div class="mt-auto pt-4">
    <footer class="footer bg-white border-top py-4 text-center text-muted small">
        <div class="container">
            <span><?= $app_footer; ?></span>
        </div>
    </footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
    function openEditDompetModal(id, nama, saldo_awal, nama_rekening, no_rekening) {
        document.getElementById('edit_id_dompet').value = id;
        document.getElementById('edit_nama_dompet').value = nama;
        document.getElementById('edit_saldo_awal').value = saldo_awal;
        document.getElementById('edit_nama_rekening').value = nama_rekening || '-';
        document.getElementById('edit_no_rekening').value = no_rekening || '-';
        
        // Block name edit if 'Tunai'
        if (nama === 'Tunai') {
            document.getElementById('edit_nama_dompet').readOnly = true;
        } else {
            document.getElementById('edit_nama_dompet').readOnly = false;
        }
        
        var editModal = new bootstrap.Modal(document.getElementById('editDompetModal'));
        editModal.show();
    }
</script>
</body>
</html>
`;



