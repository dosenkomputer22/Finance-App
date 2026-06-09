<?php
// tambah.php
// Mengurus penambahan transaksi baru beserta validasi input server-side

require_once 'koneksi.php';

$error = '';

// Verifikasi jika form dikirimkan
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Escape dan amankan input mentah
    $tanggal = trim($_POST['tanggal']);
    $keterangan = trim($_POST['keterangan']);
    $jenis = trim($_POST['jenis']);
    $jumlah = trim($_POST['jumlah']);

    // Validasi sederhana: pastikan tidak ada data yang kosong
    if (empty($tanggal) || empty($keterangan) || empty($jenis) || empty($jumlah)) {
        $error = "Peringatan: Semua data wajib diisi dan tidak boleh dibiarkan kosong!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah harus lebih besar dari Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Tipe transaksi tidak dikenal!";
    } else {
        // Cast input ke nilai numerik integer
        $jumlah_int = (int) $jumlah;

        // Gunakan Prepared Statement demi pertahanan SQL Injection
        $query_insert = "INSERT INTO transaksi (tanggal, keterangan, jenis, jumlah) VALUES (?, ?, ?, ?)";
        $stmt = mysqli_prepare($koneksi, $query_insert);

        if ($stmt) {
            // Ikat parameter ("sssi" : s=string, i=integer)
            mysqli_stmt_bind_param($stmt, "sssi", $tanggal, $keterangan, $jenis, $jumlah_int);

            // Jalankan Statement
            if (mysqli_stmt_execute($stmt)) {
                // Berhasil ditambah, arahkan kembali ke index.php
                header("Location: index.php");
                exit();
            } else {
                $error = "Gagal memproses data masuk: " . mysqli_stmt_error($stmt);
            }

            // Membebaskan memori statement
            mysqli_stmt_close($stmt);
        } else {
            $error = "Kegagalan sistem internal MySQLi dalam penyusunan query.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Transaksi Keuangan</title>
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

            <!-- Form Card -->
            <div class="card main-card overflow-hidden">
                <div class="card-header bg-dark text-white p-3">
                    <h5 class="fw-bold mb-0"><i class="bi bi-plus-circle me-2 text-warning"></i>Tambah Transaksi Baru</h5>
                </div>
                <div class="card-body p-4">

                    <?php if (!empty($error)): ?>
                        <div class="alert alert-danger d-flex align-items-center" role="alert">
                            <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                            <div><?= $error; ?></div>
                        </div>
                    <?php endif; ?>

                    <form action="tambah.php" method="POST">
                        <div class="row g-3">
                            
                            <!-- Pilih Tanggal -->
                            <div class="col-md-6">
                                <label for="tanggal" class="form-label fw-semibold text-secondary">Tanggal Transaksi</label>
                                <input type="date" class="form-control" id="tanggal" name="tanggal" value="<?= date('Y-m-d'); ?>" required>
                            </div>

                            <!-- Pilih Aliran -->
                            <div class="col-md-6">
                                <label for="jenis" class="form-label fw-semibold text-secondary">Jenis Transaksi</label>
                                <select class="form-select" id="jenis" name="jenis" required>
                                    <option value="" disabled selected>-- Pilih Jenis --</option>
                                    <option value="pemasukan">Pemasukan (Uang Masuk)</option>
                                    <option value="pengeluaran">Pengeluaran (Uang Keluar)</option>
                                </select>
                            </div>

                            <!-- Input Jumlah -->
                            <div class="col-12">
                                <label for="jumlah" class="form-label fw-semibold text-secondary">Jumlah Nominal (Rupiah)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light fw-bold text-secondary">Rp</span>
                                    <input type="number" class="form-control" id="jumlah" name="jumlah" placeholder="Contoh: 100000" min="1" required>
                                </div>
                                <div class="form-text text-muted">Input hanya angka bulat murni tanpa pemisah titik atau simbol desimal.</div>
                            </div>

                            <!-- Input Keterangan -->
                            <div class="col-12">
                                <label for="keterangan" class="form-label fw-semibold text-secondary">Keterangan / Deskripsi</label>
                                <textarea class="form-control" id="keterangan" name="keterangan" rows="3" placeholder="Contoh: Membeli makan siang, Pembayaran projek web..." required></textarea>
                            </div>

                            <!-- Tombol Submit -->
                            <div class="col-12 border-top pt-3 mt-4 d-flex justify-content-end gap-2">
                                <a href="index.php" class="btn btn-outline-secondary px-4 py-2">Batal</a>
                                <button type="submit" class="btn btn-primary px-4 py-2">
                                    <i class="bi bi-check-circle-fill me-1"></i> Simpan Transaksi
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
