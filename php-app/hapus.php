<?php
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
?>