<?php
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
?>