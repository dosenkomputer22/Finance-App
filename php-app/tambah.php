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
        $dompet = trim($_POST['dompet'] ?? 'Tunai');
        
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
            
            // Simpan ke tabel transaksi reguler dengan username & dompet info
            $query_insert = "INSERT INTO transaksi (tanggal, keterangan, kategori, jenis, jumlah, dompet, username) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($koneksi, $query_insert);
            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "ssssiss", $tanggal, $keterangan, $kategori, $jenis, $jumlah_int, $dompet, $user_username);
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

// Olah data transaksi ke array untuk memudahkan visualisasi dan kalkulasi cepat
$list_transaksi = [];
$total_nominal = 0;
if ($result_transaksi) {
    while ($row = mysqli_fetch_assoc($result_transaksi)) {
        $list_transaksi[] = $row;
        $total_nominal += (int)$row['jumlah'];
    }
}
$total_rows = count($list_transaksi);

// Preservasi value input formulir saat terjadi kesalahan validasi
$val_tanggal = isset($_POST['tanggal']) ? htmlspecialchars($_POST['tanggal']) : date('Y-m-d');
$val_kategori = isset($_POST['kategori']) ? $_POST['kategori'] : '';
$val_jenis = isset($_POST['jenis']) ? $_POST['jenis'] : ($filter_jenis === 'pengeluaran' ? 'pengeluaran' : 'pemasukan');
$val_jumlah = isset($_POST['jumlah']) ? htmlspecialchars($_POST['jumlah']) : '';
$val_keterangan = isset($_POST['keterangan']) ? htmlspecialchars($_POST['keterangan']) : '';
$val_frekuensi = isset($_POST['frekuensi']) ? $_POST['frekuensi'] : 'Bulanan';

$isOpen = !empty($error) || isset($_GET['add']);

// Fungsi Helper format Rupiah
if (!function_exists('rupiah')) {
    function rupiah($angka) {
        return "Rp " . number_format($angka, 0, ',', '.');
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $header_title; ?> - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
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
            max-width: 100%;
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

        /* Modern Custom Badges with Perfect Contrast and Visibility */
        .badge-kategori {
            background-color: #f1f5f9;
            color: #475569 !important;
            border: 1px solid #cbd5e1;
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
            font-weight: 600;
            display: inline-block;
        }
        .badge-pemasukan {
            background-color: rgba(16, 185, 129, 0.08);
            color: #065f46 !important;
            border: 1px solid rgba(16, 185, 129, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .badge-pengeluaran {
            background-color: rgba(239, 68, 68, 0.08);
            color: #991b1b !important;
            border: 1px solid rgba(239, 68, 68, 0.15);
            font-size: 0.75rem;
            padding: 0.4em 0.8em;
            border-radius: 8px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        /* Modern Table Customization with Elite Spacing and Elegance */
        .table-custom {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
        }
        .table-custom thead th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            padding: 14px 16px;
            border-top: none;
            border-bottom: 1.5px solid #e2e8f0;
        }
        .table-custom tbody tr {
            transition: all 0.2s ease;
        }
        .table-custom tbody tr:hover {
            background-color: #fafafa !important;
        }
        .table-custom tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 0.85rem;
        }
        .table-custom tbody tr:last-child td {
            border-bottom: none;
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
            <button class="btn btn-primary rounded-3 px-4 py-2.5 fw-bold text-uppercase tracking-wider shadow-sm d-flex align-items-center gap-2" type="button" data-bs-toggle="modal" data-bs-target="#modalForm">
                <i class="bi bi-pencil-square"></i> <span>Input Baru</span>
            </button>
        </div>
    </div>

    <!-- Contextual Elegant Metric Summary Widget -->
    <?php if ($filter_jenis === 'pemasukan'): ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #064e3b 0%, #059669 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Ringkasan Pendapatan Masuk</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;">Rp <?= number_format($total_nominal, 0, ',', '.'); ?></h3>
                    <p class="small mb-0 text-success-subtle" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-check2-circle"></i> Terakumulasi sehat dari total <strong><?= $total_rows; ?></strong> entri transaksi pemasukan aktif.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-graph-up-arrow fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php elseif ($filter_jenis === 'pengeluaran'): ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #450a0a 0%, #dc2626 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Total Belanja & Tagihan</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;">Rp <?= number_format($total_nominal, 0, ',', '.'); ?></h3>
                    <p class="small mb-0 text-danger-subtle" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-arrow-up-right-circle"></i> Alokasi arus kas keluar terdata pada <strong><?= $total_rows; ?></strong> jenis pengeluaran.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-graph-down-arrow fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php elseif ($filter_jenis === 'berulang'): ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Template Rutin Terdaftar</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;"><?= $total_rows; ?> Template Aktif</h3>
                    <p class="small mb-0 text-white-50" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-alarm"></i> Sistem mengelompokkan template bulanan/mingguan agar proyeksi keuangan Anda termonitor terarah.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-arrow-clockwise fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php else: ?>
        <div class="card border-0 rounded-4 shadow-sm p-4 mb-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <span class="text-uppercase font-monospace tracking-wider text-xs" style="opacity: 0.75; font-size: 0.7rem; letter-spacing: 0.05em;">Rangkuman Mutasi Kas Gabungan</span>
                    <h3 class="fw-black mb-1 mt-1 text-white" style="font-size: 1.85rem;"><?= $total_rows; ?> Entri Tercatat</h3>
                    <p class="small mb-0 text-slate-300" style="opacity: 0.9; font-size: 0.8rem;"><i class="bi bi-layers-half text-primary"></i> Menampilan rincian penuh seluruh mutasi tanpa filter pembatas aliran kas.</p>
                </div>
                <div class="bg-white bg-opacity-10 rounded-pill p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                    <i class="bi bi-wallet2 fs-3 text-white"></i>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Alert status and actions -->
    <?php if (isset($_GET['status']) && $_GET['status'] === 'success'): ?>
        <div class="alert alert-success px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0" role="alert" style="background-color: rgba(16, 185, 129, 0.1); color: #047857;">
            <i class="bi bi-check-circle-fill me-2.5 fs-5 text-success"></i>
            <div class="small fw-semibold">Berhasil: Catatan baru telah berhasil disimpan ke dalam database!</div>
        </div>
    <?php endif; ?>

    <?php if (!empty($error)): ?>
        <div class="alert alert-danger px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0" role="alert" style="background-color: rgba(239, 68, 68, 0.1); color: #b91c1c;">
            <i class="bi bi-exclamation-triangle-fill me-2.5 fs-5 text-danger"></i>
            <div class="small fw-semibold"><?= htmlspecialchars($error); ?></div>
        </div>
    <?php endif; ?>

    <!-- Modal Input Form Pop-up -->
    <div class="modal fade" id="modalForm" tabindex="-1" aria-labelledby="modalFormLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content border-0 bg-white" style="border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,0.12);">
                <div class="modal-header border-0 pb-0" style="padding: 1.5rem 1.75rem 0.5rem 1.75rem;">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="bi bi-pencil-square fs-5"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-semibold text-slate-800 mb-0" id="modalFormLabel">Formulir Input <?= ($filter_jenis === 'berulang') ? 'Transaksi Berulang' : 'Transaksi Baru'; ?></h5>
                            <p class="text-muted small mb-0" style="font-size: 0.73rem;">Input data dengan integritas keamanan terpadu</p>
                        </div>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="padding: 1.5rem 1.75rem 1.75rem 1.75rem;">
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

                        <!-- Context-aware intelligent type locking -->
                        <div class="mb-4">
                            <label class="form-label text-uppercase text-muted font-monospace tracking-wider d-block" style="font-size: 0.68rem; font-weight: 800; margin-bottom: 10px;">Jenis Aliran Dana</label>
                            
                            <?php if ($filter_jenis === 'pemasukan'): ?>
                                <input type="hidden" name="jenis" value="pemasukan">
                                <div class="p-3 rounded-3 d-flex align-items-center gap-3 bg-semibold" style="background-color: rgba(16, 185, 129, 0.08); border: 1.5px solid rgba(16, 185, 129, 0.2); color: #059669;">
                                    <i class="bi bi-arrow-down-left-circle-fill fs-3 text-success"></i>
                                    <div>
                                        <span class="d-block fw-bold" style="font-size: 0.85rem; letter-spacing: 0.025em;">TIPE FORM: PEMASUKAN</span>
                                        <span class="text-xs text-muted" style="font-size: 0.72rem;">Otomatis dikonfigurasikan khusus untuk mencatat penerimaan kas.</span>
                                    </div>
                                </div>
                            <?php elseif ($filter_jenis === 'pengeluaran'): ?>
                                <input type="hidden" name="jenis" value="pengeluaran">
                                <div class="p-3 rounded-3 d-flex align-items-center gap-3 bg-semibold" style="background-color: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.2); color: #dc2626;">
                                    <i class="bi bi-arrow-up-right-circle-fill fs-3 text-danger"></i>
                                    <div>
                                        <span class="d-block fw-bold" style="font-size: 0.85rem; letter-spacing: 0.025em;">TIPE FORM: PENGELUARAN</span>
                                        <span class="text-xs text-muted" style="font-size: 0.72rem;">Otomatis dikonfigurasikan khusus untuk mencatat pengeluaran kas.</span>
                                    </div>
                                </div>
                            <?php else: ?>
                                <div class="row g-3">
                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="jenis" id="pemasukan" value="pemasukan" <?= ($val_jenis === 'pemasukan') ? 'checked' : ''; ?> autocomplete="off">
                                        <label class="btn btn-outline-success w-100 py-3 rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 fw-bold" for="pemasukan" style="transition: all 0.25s ease;">
                                            <i class="bi bi-arrow-down-left-circle-fill fs-4 text-success"></i>
                                            <span style="font-size: 0.8rem;">DANA MASUK (PEMASUKAN)</span>
                                        </label>
                                    </div>
                                    <div class="col-6">
                                        <input type="radio" class="btn-check" name="jenis" id="pengeluaran" value="pengeluaran" <?= ($val_jenis === 'pengeluaran') ? 'checked' : ''; ?> autocomplete="off">
                                        <label class="btn btn-outline-danger w-100 py-3 rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 fw-bold" for="pengeluaran" style="transition: all 0.25s ease;">
                                            <i class="bi bi-arrow-up-right-circle-fill fs-4 text-danger"></i>
                                            <span style="font-size: 0.8rem;">DANA KELUAR (PENGELUARAN)</span>
                                        </label>
                                    </div>
                                </div>
                            <?php endif; ?>
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

                        <?php if ($filter_jenis !== 'berulang'): ?>
                            <!-- Dropdown Dompet / Sumber Rekening -->
                            <div class="mb-3">
                                <label for="dompet" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Penyimpanan / Dompet</label>
                                <select class="form-select py-2 px-3 focus-border-primary fw-bold" id="dompet" name="dompet" required>
                                    <?php
                                    $dompet_opts = mysqli_query($koneksi, "SELECT nama FROM dompet ORDER BY id ASC");
                                    if ($dompet_opts) {
                                        while ($dp = mysqli_fetch_assoc($dompet_opts)) {
                                            $dp_name = htmlspecialchars($dp['nama']);
                                            echo "<option value=\"$dp_name\">$dp_name</option>";
                                        }
                                    } else {
                                        echo '<option value="Tunai" selected>Tunai</option>';
                                    }
                                    ?>
                                </select>
                                <small class="text-muted d-block mt-1 pl-1" style="font-size: 0.68rem; font-weight: 500;">* Pilih rekening/dompet internal yang akan dialiri dana ini.</small>
                            </div>
                        <?php endif; ?>

                        <!-- Descriptions notes -->
                        <div class="mb-4">
                            <label for="keterangan" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Keterangan Catatan</label>
                            <textarea class="form-control text-xs" id="keterangan" name="keterangan" placeholder="Ketik rincian detail catatan..." rows="3" required style="font-size: 0.8rem;"><?= $val_keterangan; ?></textarea>
                        </div>

                        <!-- Action click save -->
                        <div class="modal-footer border-0 p-0 pt-2 d-flex gap-2">
                            <button type="button" class="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-bold" data-bs-dismiss="modal">Batal</button>
                            <button type="submit" class="btn btn-primary flex-grow-1 py-2.5 rounded-3 fw-bold text-uppercase tracking-wider">
                                <i class="bi bi-save-fill me-1.5"></i> Simpan Catatan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MAIN COMPREHENSIVE TABLE CARD -->
    <div class="card border-0 rounded-4 shadow-sm overflow-hidden bg-white mb-4">
        <!-- Interactive search bar and filters section -->
        <div class="card-header bg-white py-3.5 border-0 bg-slate-50/50">
            <div class="row g-3 align-items-center">
                <div class="col-md-<?= ($filter_jenis === 'semua' || empty($filter_jenis)) ? '5' : '8'; ?>">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
                        <input type="text" id="tableSearch" class="form-control border-start-0 text-sm py-2" placeholder="Cari keterangan transaksi...">
                    </div>
                </div>
                <?php if ($filter_jenis === 'semua' || empty($filter_jenis)): ?>
                    <div class="col-md-3">
                        <select id="filterType" class="form-select text-sm py-2">
                            <option value="">Semua Jenis Aliran</option>
                            <option value="pemasukan">Hanya Pemasukan</option>
                            <option value="pengeluaran">Hanya Pengeluaran</option>
                        </select>
                    </div>
                <?php endif; ?>
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
                <table class="table table-hover align-middle mb-0 table-custom" id="txTable">
                    <thead class="bg-light table-light">
                        <tr>
                            <th class="ps-4 py-3 text-muted text-uppercase fw-bold font-monospace" style="width: 70px;">No</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 145px;"><?= ($filter_jenis === 'berulang') ? 'Frekuensi' : 'Tanggal'; ?></th>
                            <th class="text-muted text-uppercase fw-bold font-monospace">Keterangan Catatan</th>
                            <th class="text-muted text-uppercase fw-bold font-monospace" style="width: 140px;">Kategori</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 135px;">Jenis</th>
                            <th class="text-end text-muted text-uppercase fw-bold font-monospace" style="width: 190px;">Nominal</th>
                            <th class="text-center text-muted text-uppercase fw-bold font-monospace" style="width: 120px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($total_rows > 0): ?>
                            <?php 
                            $no = 1;
                            foreach ($list_transaksi as $row): 
                                $r_id = $row['id'];
                                $r_jenis = $row['jenis'];
                                $r_kategori = (!empty($row['kategori'])) ? htmlspecialchars($row['kategori']) : 'Umum';
                                $r_keterangan = htmlspecialchars($row['keterangan']);
                            ?>
                                <tr data-jenis="<?= $r_jenis; ?>" data-kategori="<?= $r_kategori; ?>" data-keterangan="<?= strtolower($r_keterangan); ?>">
                                    <td class="ps-4 fw-medium text-muted"><?= $no++; ?></td>
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
                                        <?php if ($filter_jenis !== 'berulang'): ?>
                                            <span class="text-xs text-muted d-flex align-items-center gap-1 mt-1" style="font-size: 0.72rem;">
                                                <i class="bi bi-wallet2 text-primary" style="font-size: 0.75rem;"></i>
                                                <?= htmlspecialchars($row['dompet'] ?? 'Tunai'); ?>
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <span class="badge-kategori"><?= $r_kategori; ?></span>
                                    </td>
                                    <td class="text-center">
                                        <?php if ($r_jenis === 'pemasukan'): ?>
                                            <span class="badge badge-pemasukan fw-semibold"><i class="bi bi-arrow-down-left-circle-fill"></i> Pemasukan</span>
                                        <?php else: ?>
                                            <span class="badge badge-pengeluaran fw-semibold"><i class="bi bi-arrow-up-right-circle-fill"></i> Pengeluaran</span>
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
                            <?php endforeach; ?>
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
                const typeVal = typeFilter ? typeFilter.value : '';
                const catVal = categoryFilter.value;

                tableRows.forEach(row => {
                    const rowDesc = row.getAttribute('data-keterangan') || '';
                    const rowJenis = row.getAttribute('data-jenis') || '';
                    const rowCat = row.getAttribute('data-kategori') || '';

                    const matchesSearch = rowDesc.includes(searchVal);
                    const matchesType = !typeFilter || typeVal === '' || rowJenis === typeVal;
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

            // Auto-show modal if there is errors or manual add query trigger
            <?php if ($isOpen): ?>
            var myModal = new bootstrap.Modal(document.getElementById('modalForm'));
            myModal.show();
            <?php endif; ?>
        });
    </script>

        </div> <!-- End of inner p-3 p-md-4 -->
        
        <footer class="footer bg-white border-top py-4 text-center text-muted small mt-auto">
            <div class="container">
                <span><?= $app_footer; ?></span>
            </div>
        </footer>
    </div> <!-- End of main-canvas-area -->
</div> <!-- End of app-layout-wrapper -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>