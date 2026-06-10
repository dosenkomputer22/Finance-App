<?php
// hapus.php
// Menghapus record transaksi dari database secara aman menggunakan Prepared Statements dan proteksi login

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

// Pastikan parameter id tersedia di query string
if (isset($_GET['id']) && !empty(trim($_GET['id']))) {
    // Cast ke integer untuk memastikan keamanan ekstra (menghindari SQL injection non-string parameter)
    $id = (int)$_GET['id'];

    // Menyiapkan parameterized DELETE query statement
    $query_delete = "DELETE FROM transaksi WHERE id = ?";
    $stmt_delete = mysqli_prepare($koneksi, $query_delete);

    if ($stmt_delete) {
        // Ikat parameter ID
        mysqli_stmt_bind_param($stmt_delete, "i", $id);

        // Eksekusi statement kueri
        mysqli_stmt_execute($stmt_delete);

        // Membebaskan statement memory
        mysqli_stmt_close($stmt_delete);
    }
}

// Alihkan kembali ke halaman riwayat utama index.php setelah tuntas
header("Location: index.php");
exit();
?>
