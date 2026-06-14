<?php
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
?>