<?php
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
            
            // Simpan ke tabel transaksi reguler dengan username
            $query_insert = "INSERT INTO transaksi (tanggal, keterangan, kategori, jenis, jumlah, username) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($koneksi, $query_insert);
            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "ssssis", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $user_username);
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
$total_rows = $result_transaksi ? mysqli_num_rows($result_transaksi) : 0;

// Preservasi value input formulir saat terjadi kesalahan validasi
$val_tanggal = isset($_POST['tanggal']) ? htmlspecialchars($_POST['tanggal']) : date('Y-m-d');
$val_kategori = isset($_POST['kategori']) ? $_POST['kategori'] : '';
$val_jenis = isset($_POST['jenis']) ? $_POST['jenis'] : ($filter_jenis === 'pengeluaran' ? 'pengeluaran' : 'pemasukan');
$val_jumlah = isset($_POST['jumlah']) ? htmlspecialchars($_POST['jumlah']) : '';
$val_keterangan = isset($_POST['keterangan']) ? htmlspecialchars($_POST['keterangan']) : '';
$val_frekuensi = isset($_POST['frekuensi']) ? $_POST['frekuensi'] : 'Bulanan';

$isOpen = !empty($error) || isset($_GET['add']);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $header_title; ?> - KeuanganKu</title>
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
include 'sidebar.php';
?>

    <!-- Header Action Bar -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3" style="border-bottom: 1px solid #e2e8f0;">
        <div>
            <h4 class="fw-bold text-slate-800 mb-1"><?= $header_title; ?></h4>
            <p class="text-muted small mb-0"><?= $header_subtitle; ?></p>
        </div>
        <div>
            <button class="btn btn-primary rounded-3 px-4 py-2.5 fw-bold text-uppercase tracking-wider shadow-sm" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForm" aria-expanded="<?= $isOpen ? 'true' : 'false'; ?>" aria-controls="collapseForm">
                <i class="bi bi-plus-circle-fill me-2"></i> Input Baru
            </button>
        </div>
    </div>

    <!-- Alert status and actions -->
    <?php if (isset($_GET['status']) && $_GET['status'] === 'success'): ?>
        <div class="alert alert-success px-3 py-3 rounded-3 d-flex align-items-center mb-4" role="alert" style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #047857;">
            <i class="bi bi-check-circle-fill me-2.5 fs-5 text-success"></i>
            <div class="small fw-semibold">Berhasil: Catatan baru telah berhasil tersimpan dan disinkronkan ke dalam database!</div>
        </div>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger px-3 py-3 rounded-3 d-flex align-items-center mb-4" role="alert" style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #b91c1c;">
            <i class="bi bi-exclamation-triangle-fill me-2.5 fs-5 text-danger"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
        </div>
    <?php endif; ?>

    <!-- Collapsible Form row -->
    <div class="collapse <?= $isOpen ? 'show' : ''; ?> mb-4" id="collapseForm">
        <div class="row g-4">
            
            <!-- Spacious Input form Column -->
            <div class="col-lg-8">
                <div class="card border-0 rounded-4 shadow-sm p-4 p-md-5 bg-white">
                    <div class="d-flex align-items-center gap-2 mb-4 pb-3" style="border-bottom: 1px solid #f1f5f9;">
                        <div class="bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center">
                            <i class="bi bi-pencil-square fs-5"></i>
                        </div>
                        <div>
                            <h5 class="fw-bold text-slate-800 mb-0">Formulir Catatan <?= ($filter_jenis === 'berulang') ? 'Transaksi Berulang' : 'Keuangan'; ?></h5>
                            <p class="text-muted small mb-0" style="font-size: 0.73rem;">Protected database query operation</p>
                        </div>
                    </div>

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
                                            echo "<option value=\"$cat_name\" $selected>$cat_name</option>";
                                        }
                                    } else {
                                        echo '<option value="Lainnya" selected>Lainnya</option>';
                                    }
                                    ?>
                                </select>
                            </div>
                        </div>

                        <!-- Radio button styled selection for cash flow type -->
                        <div class="mb-4">
                            <label class="form-label text-uppercase text-muted font-monospace tracking-wider d-block" style="font-size: 0.68rem; font-weight: 800; margin-bottom: 10px;">Jenis Aliran Dana</label>
                            <div class="row g-3">
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="jenis" id="pemasukan" value="pemasukan" <?= ($val_jenis === 'pemasukan') ? 'checked' : ''; ?> autocomplete="off">
                                    <label class="btn btn-outline-success w-100 py-3 rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 fw-bold" for="pemasukan">
                                        <i class="bi bi-arrow-down-left-circle-fill fs-4 text-success"></i>
                                        <span style="font-size: 0.8rem;">DANA MASUK (PEMASUKAN)</span>
                                    </label>
                                </div>
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="jenis" id="pengeluaran" value="pengeluaran" <?= ($val_jenis === 'pengeluaran') ? 'checked' : ''; ?> autocomplete="off">
                                    <label class="btn btn-outline-danger w-100 py-3 rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 fw-bold" for="pengeluaran">
                                        <i class="bi bi-arrow-up-right-circle-fill fs-4 text-danger"></i>
                                        <span style="font-size: 0.8rem;">DANA KELUAR (PENGELUARAN)</span>
                                    </label>
                                </div>
                            </div>
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

                        <!-- Descriptions notes -->
                        <div class="mb-4">
                            <label for="keterangan" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Keterangan Catatan</label>
                            <textarea class="form-control text-xs" id="keterangan" name="keterangan" placeholder="Ketik rincian detail catatan..." rows="3" required style="font-size: 0.8rem;"><?= $val_keterangan; ?></textarea>
                        </div>

                        <!-- Action click save -->
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-bold" data-bs-toggle="collapse" data-bs-target="#collapseForm">Batal</button>
                            <button type="submit" class="btn btn-primary flex-grow-1 py-2.5 rounded-3 fw-bold text-uppercase tracking-wider">
                                <i class="bi bi-save-fill me-1.5"></i> Simpan Catatan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Side audit guide column -->
            <div class="col-lg-4">
                <div class="card border-0 rounded-4 shadow-sm bg-dark text-white p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary text-info">
                            <i class="bi bi-shield-fill-check fs-5"></i>
                            <span class="text-uppercase fw-bold font-monospace" style="font-size: 0.70rem; letter-spacing: 0.05em; color: #a5f3fc;">Sandi Proteksi Database Aktif</span>
                        </div>
                        <p class="small text-slate-300 mb-2.5 leading-relaxed" style="font-size: 0.75rem;">Aplikasi ini menggunakan Prepared MySQL Statements demi memisahkan struktur query dari payload data input:</p>
                        <code class="d-block p-2.5 bg-black text-warning rounded-3 font-monospace mb-3" style="font-size: 0.68rem; line-height: 1.45;">
                            $stmt = mysqli_prepare($koneksi, "INSERT ... (?, ?, ?, ?)");
                        </code>
                        <p class="small text-muted mb-0 leading-normal" style="font-size: 0.7rem;">Operasi ini mencegah serangan SQL Injection secara tuntas pada sistem finansial.</p>
                    </div>
                </div>
            </div>
            
        </div>
    </div>

    <!-- MAIN COMPREHENSIVE TABLE CARD -->
    <div class="card border-0 rounded-4 shadow-sm overflow-hidden bg-white mb-4">
        <!-- Interactive search bar and filters section -->
        <div class="card-header bg-white py-3.5 border-0 bg-slate-50/50">
            <div class="row g-3 align-items-center">
                <div class="col-md-5">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
                        <input type="text" id="tableSearch" class="form-control border-start-0 text-sm py-2" placeholder="Cari keterangan transaksi...">
                    </div>
                </div>
                <div class="col-md-3">
                    <select id="filterType" class="form-select text-sm py-2">
                        <option value="">Semua Jenis Aliran</option>
                        <option value="pemasukan">Hanya Pemasukan</option>
                        <option value="pengeluaran">Hanya Pengeluaran</option>
                    </select>
                </div>
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
                <table class="table table-hover align-middle mb-0" id="txTable">
                    <thead class="table-light text-uppercase font-monospace text-muted" style="font-size: 0.7rem; font-weight: 700;">
                        <tr>
                            <th class="ps-4 py-3" style="width: 70px;">No</th>
                            <th style="width: 140px;"><?= ($filter_jenis === 'berulang') ? 'Frekuensi' : 'Tanggal'; ?></th>
                            <th>Keterangan Catatan</th>
                            <th style="width: 140px;">Kategori</th>
                            <th class="text-center" style="width: 130px;">Jenis</th>
                            <th class="text-end" style="width: 180px;">Nominal</th>
                            <th class="text-center" style="width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($total_rows > 0): ?>
                            <?php 
                            $no = 1;
                            while ($row = mysqli_fetch_assoc($result_transaksi)): 
                                $r_id = $row['id'];
                                $r_jenis = $row['jenis'];
                                $r_kategori = htmlspecialchars($row['kategori'] ?? 'Umum');
                                $r_keterangan = htmlspecialchars($row['keterangan']);
                            ?>
                                <tr data-jenis="<?= $r_jenis; ?>" data-kategori="<?= $r_kategori; ?>" data-keterangan="<?= strtolower($r_keterangan); ?>">
                                    <td class="ps-4 fw-bold text-muted"><?= $no++; ?></td>
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
                                    </td>
                                    <td>
                                        <span class="badge bg-light text-slate-600 border px-2.5 py-1.5 rounded-3 font-semibold"><?= $r_kategori; ?></span>
                                    </td>
                                    <td class="text-center">
                                        <?php if ($r_jenis === 'pemasukan'): ?>
                                            <span class="badge text-success fw-bold px-2.5 py-1.5 rounded-3 d-inline-flex align-items-center gap-1" style="background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.15);"><i class="bi bi-arrow-down-left-circle-fill"></i> Pemasukan</span>
                                        <?php else: ?>
                                            <span class="badge text-danger fw-bold px-2.5 py-1.5 rounded-3 d-inline-flex align-items-center gap-1" style="background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.15);"><i class="bi bi-arrow-up-right-circle-fill"></i> Pengeluaran</span>
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
                            <?php endwhile; ?>
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
                const typeVal = typeFilter.value;
                const catVal = categoryFilter.value;

                tableRows.forEach(row => {
                    const rowDesc = row.getAttribute('data-keterangan') || '';
                    const rowJenis = row.getAttribute('data-jenis') || '';
                    const rowCat = row.getAttribute('data-kategori') || '';

                    const matchesSearch = rowDesc.includes(searchVal);
                    const matchesType = typeVal === '' || rowJenis === typeVal;
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
        });
    </script>

        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span>Sistem Catatan Keuangan Native PHP &copy; <?= date('Y'); ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
