<?php
// hapus.php
// Memproses penghapusan denga keamanan parameterized query MySQLi dan mengalihkan ke dashboard

require_once 'koneksi.php';

// Memastikan parameter ID terisi
if (isset($_GET['id']) && !empty(trim($_GET['id']))) {
    $id = (int) $_GET['id'];
    
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
}

// Redirect otomatis dialihkan mengarah kembali ke index.php
header("Location: index.php");
exit();
?>
