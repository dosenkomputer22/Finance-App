<?php
// edit.php
// Mengedit transaksi yang sudah ada di database secara aman dengan Prepared Statements

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
    
    // Alihkan jika data id tidak ada di database
    if (mysqli_num_rows($result) === 0) {
        header("Location: index.php");
        exit();
    }
    
    $old_data = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt_select);
} else {
    die("Kegagalan memproses kueri database SELECT.");
}

// 2. Proses edit data setelah form di-submit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tanggal = trim($_POST['tanggal']);
    $keterangan = trim($_POST['keterangan']);
    $jenis = trim($_POST['jenis']);
    $jumlah = trim($_POST['jumlah']);

    // Validasi data masukan
    if (empty($tanggal) || empty($keterangan) || empty($jenis) || empty($jumlah)) {
        $error = "Peringatan: Semua kolom harus diisi!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah minimal harus lebih besar dari Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Pilihan jenis tidak tersedia di sistem!";
    } else {
        $jumlah_int = (int) $jumlah;

        // Persiapkan Query Update MySQLi
        $query_update = "UPDATE transaksi SET tanggal = ?, keterangan = ?, jenis = ?, jumlah = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($koneksi, $query_update);

        if ($stmt_update) {
            // Bind parameter ("sssii" : s=string, i=integer)
            mysqli_stmt_bind_param($stmt_update, "sssii", $tanggal, $keterangan, $jenis, $jumlah_int, $id);

            // Eksekusi statement update
            if (mysqli_stmt_execute($stmt_update)) {
                // Sukses mengedit, kembali ke beranda dashboard
                header("Location: index.php");
                exit();
            } else {
                $error = "Gagal memperbarui transaksi: " . mysqli_stmt_error($stmt_update);
            }
            mysqli_stmt_close($stmt_update);
        } else {
            $error = "Kegagalan sistem internal database MySQLi dalam pembaruan kueri.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ubah Data Transaksi - Aplikasi Keuangan</title>
    <!-- Bootstrap 5 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background-color: #f3f4f6;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .main-card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
    </style>
</head>
<body>

<nav class="navbar navbar-dark bg-dark py-3 mb-4 shadow">
    <div class="container">
        <a href="index.php" class="navbar-brand fw-bold mb-0 h1 d-flex align-items-center text-white">
            <i class="bi bi-piggy-bank-fill text-warning me-2"></i>
            Aplikasi Catatan Keuangan
        </a>
    </div>
</nav>

<div class="container py-2 pb-5">
    <div class="row justify-content-center">
        <div class="col-lg-7 col-md-10">
            
            <!-- Tombol Kembali -->
            <div class="mb-3">
                <a href="index.php" class="btn btn-link link-dark text-decoration-none p-0">
                    <i class="bi bi-arrow-left-circle-fill me-1 text-secondary"></i> Kembali ke Dashboard
                </a>
            </div>

            <!-- Form Edit Card -->
            <div class="card main-card overflow-hidden">
                <div class="card-header bg-dark text-white p-3">
                    <h5 class="fw-bold mb-0"><i class="bi bi-pencil-square me-2 text-warning"></i>Ubah / Edit Detail Transaksi</h5>
                </div>
                <div class="card-body p-4">

                    <?php if (!empty($error)): ?>
                        <div class="alert alert-danger d-flex align-items-center" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                            <div><?= $error; ?></div>
                        </div>
                    <?php endif; ?>

                    <form action="edit.php?id=<?= $id; ?>" method="POST">
                        <div class="row g-3">
                            
                            <!-- Pilih Tanggal -->
                            <div class="col-md-6">
                                <label for="tanggal" class="form-label fw-semibold text-secondary">Tanggal Transaksi</label>
                                <input type="date" class="form-control" id="tanggal" name="tanggal" value="<?= htmlspecialchars($old_data['tanggal']); ?>" required>
                            </div>

                            <!-- Pilih Aliran -->
                            <div class="col-md-6">
                                <label for="jenis" class="form-label fw-semibold text-secondary">Jenis Aliran Keuangan</label>
                                <select class="form-select" id="jenis" name="jenis" required>
                                    <option value="pemasukan" <?= $old_data['jenis'] === 'pemasukan' ? 'selected' : ''; ?>>Pemasukan (Uang Masuk)</option>
                                    <option value="pengeluaran" <?= $old_data['jenis'] === 'pengeluaran' ? 'selected' : ''; ?>>Pengeluaran (Uang Keluar)</option>
                                </select>
                            </div>

                            <!-- Input Jumlah -->
                            <div class="col-12">
                                <label for="jumlah" class="form-label fw-semibold text-secondary">Jumlah Nominal (Rupiah)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light fw-bold text-secondary">Rp</span>
                                    <input type="number" class="form-control" id="jumlah" name="jumlah" value="<?= htmlspecialchars($old_data['jumlah']); ?>" min="1" required>
                                </div>
                                <div class="form-text text-muted">Gunakan format angka bulat utuh (contoh: 2750000).</div>
                            </div>

                            <!-- Input Keterangan -->
                            <div class="col-12">
                                <label for="keterangan" class="form-label fw-semibold text-secondary">Keterangan / Deskripsi</label>
                                <textarea class="form-control" id="keterangan" name="keterangan" rows="3" required><?= htmlspecialchars($old_data['keterangan']); ?></textarea>
                            </div>

                            <!-- Tombol Submit -->
                            <div class="col-12 border-top pt-3 mt-4 d-flex justify-content-end gap-2">
                                <a href="index.php" class="btn btn-outline-secondary px-4 py-2">Batal</a>
                                <button type="submit" class="btn btn-warning text-dark fw-bold px-4 py-2">
                                    <i class="bi bi-save-fill me-1"></i> Simpan Perubahan
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>

        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
