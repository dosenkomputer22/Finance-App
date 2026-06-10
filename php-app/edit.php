<?php
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

    // Validasi data masukan
    if (empty($tanggal) || empty($keterangan) || empty($kategori) || empty($jenis) || empty($jumlah)) {
        $error = "Peringatan: Semua kolom isian formulir wajib dilengkapi!";
    } elseif ($jumlah <= 0) {
        $error = "Peringatan: Nominal jumlah transaksi wajib di atas Rp 0!";
    } elseif ($jenis !== 'pemasukan' && $jenis !== 'pengeluaran') {
        $error = "Peringatan: Jenis transaksi tidak valid.";
    } else {
        $jumlah_int = (int) $jumlah;

        // Persingkat pembaruan menggunakan parameterized set statement
        $query_update = "UPDATE transaksi SET tanggal = ?, keterangan = ?, kategori = ?, jenis = ?, jumlah = ? WHERE id = ?";
        $stmt_update = mysqli_prepare($koneksi, $query_update);

        if ($stmt_update) {
            mysqli_stmt_bind_param($stmt_update, "ssssii", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $id);

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
    <title>Ubah Transaksi - KeuanganKu</title>
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

<nav class="navbar navbar-expand-lg navbar-dark bg-dark py-3 mb-4 shadow" style="background-color: #0f172a !important;">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="index.php">
            <i class="bi bi-wallet2 text-primary me-2 fs-4"></i>
            KeuanganKu <span class="badge bg-primary ms-2 fs-6">PHP + MySQL</span>
        </a>
    </div>
</nav>

<div class="container pb-5">
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
                    <option value="Gaji" <?= $old_data['kategori'] === 'Gaji' ? 'selected' : ''; ?>>Gaji / Penghasilan</option>
                    <option value="Belanja" <?= $old_data['kategori'] === 'Belanja' ? 'selected' : ''; ?>>Belanja Bulanan</option>
                    <option value="Transportasi" <?= $old_data['kategori'] === 'Transportasi' ? 'selected' : ''; ?>>Transportasi / Bensin</option>
                    <option value="Makan & Minum" <?= $old_data['kategori'] === 'Makan & Minum' ? 'selected' : ''; ?>>Makan & Minum</option>
                    <option value="Tagihan" <?= $old_data['kategori'] === 'Tagihan' ? 'selected' : ''; ?>>Tagihan WiFi / Listrik</option>
                    <option value="Freelance" <?= $old_data['kategori'] === 'Freelance' ? 'selected' : ''; ?>>Freelance / Projek</option>
                    <option value="Lainnya" <?= ($old_data['kategori'] === 'Lainnya' || empty($old_data['kategori'])) ? 'selected' : ''; ?>>Lainnya</option>
                </select>
            </div>

            <div class="mb-3">
                <label for="jumlah" class="form-label">Jumlah Uang (Rupiah Rp)</label>
                <div class="input-group">
                    <span class="input-group-text bg-light text-slate-500 font-monospace fw-bold">Rp</span>
                    <input type="number" class="form-control font-monospace fw-bold" id="jumlah" name="jumlah" value="<?= htmlspecialchars($old_data['jumlah']); ?>" min="1" required>
                </div>
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
</div>

</body>
</html>
