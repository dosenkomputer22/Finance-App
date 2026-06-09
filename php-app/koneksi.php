<?php
// koneksi.php
// Konfigurasi koneksi database untuk cPanel / Shared Hosting maupun Localhost

$db_host = "localhost";      // Umumnya 'localhost' di sebagian besar cPanel
$db_user = "db_user_anda";   // Ganti dengan Username Database MySQL yang Anda buat di cPanel
$db_pass = "db_pass_anda";   // Ganti dengan Password User Database tersebut
$db_name = "keuangan_db";    // Ganti dengan Nama Database yang Anda buat di cPanel

// Melakukan koneksi ke server MySQL
$koneksi = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Setting charset ke UTF-8 agar mendukung karakter penulisan khusus secara aman
mysqli_set_charset($koneksi, "utf8mb4");

// Verifikasi keberhasilan koneksi
if (mysqli_connect_errno()) {
    die("Koneksi database MySQL gagal dilakukan: " . mysqli_connect_error());
}
?>
