<?php
// rekening.php
// Halaman Manajemen Rekening & Dompet Keuangan (Multi-Wallet Management)

session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] !== true) {
    header("Location: login.php");
    exit();
}

require_once 'koneksi.php';

$user_username = $_SESSION['username'] ?? 'user';
$user_role = $_SESSION['role'] ?? 'admin';
$success_msg = "";
$error_msg = "";

// 1. Aksi: Tambah Dompet Baru
if (isset($_POST['add_dompet'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menambah rekening/dompet.";
    } else {
        $nama = trim($_POST['nama_dompet'] ?? '');
        $saldo_awal = intval($_POST['saldo_awal'] ?? 0);
        $nama_rekening = trim($_POST['nama_rekening'] ?? '-');
        $no_rekening = trim($_POST['no_rekening'] ?? '-');
        $nama_clean = htmlspecialchars($nama);
        
        if (empty($nama)) {
            $error_msg = "Nama dompet tidak boleh kosong.";
        } else {
            $nama_escaped = mysqli_real_escape_string($koneksi, $nama);
            $nama_rekening_escaped = mysqli_real_escape_string($koneksi, $nama_rekening);
            $no_rekening_escaped = mysqli_real_escape_string($koneksi, $no_rekening);
            // Cek duplikasi
            $check_query = mysqli_query($koneksi, "SELECT id FROM dompet WHERE nama = '$nama_escaped'");
            if (mysqli_num_rows($check_query) > 0) {
                $error_msg = "Dompet atau Rekening dengan nama '$nama_clean' sudah terdaftar.";
            } else {
                $insert_query = "INSERT INTO dompet (nama, saldo_awal, nama_rekening, no_rekening) VALUES ('$nama_escaped', $saldo_awal, '$nama_rekening_escaped', '$no_rekening_escaped')";
                if (mysqli_query($koneksi, $insert_query)) {
                    $success_msg = "Dompet baru '$nama_clean' berhasil ditambahkan dengan saldo awal Rp " . number_format($saldo_awal, 0, ',', '.') . "!";
                } else {
                    $error_msg = "Gagal menyimpan data dompet baru.";
                }
            }
        }
    }
}

// 2. Aksi: Edit Dompet
if (isset($_POST['edit_dompet'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan memodifikasi rekening/dompet.";
    } else {
        $id = intval($_POST['id_dompet']);
        $nama_baru = trim($_POST['nama_dompet'] ?? '');
        $saldo_awal_baru = intval($_POST['saldo_awal'] ?? 0);
        $nama_rekening_baru = trim($_POST['nama_rekening'] ?? '-');
        $no_rekening_baru = trim($_POST['no_rekening'] ?? '-');
        $nama_baru_clean = htmlspecialchars($nama_baru);
        
        if (empty($nama_baru)) {
            $error_msg = "Nama dompet tidak boleh kosong.";
        } else {
            $nama_baru_escaped = mysqli_real_escape_string($koneksi, $nama_baru);
            $nama_rekening_baru_escaped = mysqli_real_escape_string($koneksi, $nama_rekening_baru);
            $no_rekening_baru_escaped = mysqli_real_escape_string($koneksi, $no_rekening_baru);
            
            // Ambil nama lama
            $curr_q = mysqli_query($koneksi, "SELECT nama FROM dompet WHERE id = $id");
            if ($curr_q && mysqli_num_rows($curr_q) > 0) {
                $curr_row = mysqli_fetch_assoc($curr_q);
                $nama_lama = $curr_row['nama'];
                
                if ($nama_lama === 'Tunai' && $nama_baru !== 'Tunai') {
                    $error_msg = "Nama rekening utama 'Tunai' dilindungi sistem dan tidak boleh diubah.";
                } else {
                    // Cek duplikasi di baris lain
                    $chk_dup = mysqli_query($koneksi, "SELECT id FROM dompet WHERE nama = '$nama_baru_escaped' AND id != $id");
                    if (mysqli_num_rows($chk_dup) > 0) {
                        $error_msg = "Nama dompet '$nama_baru_clean' sudah digunakan oleh rekening lain.";
                    } else {
                        // Secara kaskade mengupdate nama dompet di histori transaksi jika nama berubah
                        $update_tx_success = true;
                        if ($nama_lama !== $nama_baru) {
                            $nama_lama_escaped = mysqli_real_escape_string($koneksi, $nama_lama);
                            $update_tx_success = mysqli_query($koneksi, "UPDATE transaksi SET dompet = '$nama_baru_escaped' WHERE dompet = '$nama_lama_escaped'");
                        }
                        
                        if ($update_tx_success) {
                            $q_update = "UPDATE dompet SET nama = '$nama_baru_escaped', saldo_awal = $saldo_awal_baru, nama_rekening = '$nama_rekening_baru_escaped', no_rekening = '$no_rekening_baru_escaped' WHERE id = $id";
                            if (mysqli_query($koneksi, $q_update)) {
                                $success_msg = "Perubahan rekening '$nama_baru_clean' berhasil disimpan dan terintegrasi kaskade!";
                            } else {
                                $error_msg = "Gagal menyimpan perubahan rekening.";
                            }
                        } else {
                            $error_msg = "Gagal memperbarui relasi riwayat transaksi.";
                        }
                    }
                }
            }
        }
    }
}

// 3. Aksi: Hapus Dompet
if (isset($_GET['delete_dompet'])) {
    if ($user_role === 'user') {
        $error_msg = "Akses Ditolak: Tingkat peran 'user' tidak diperkenankan menghapus rekening/dompet.";
    } else {
        $dompet_id = intval($_GET['delete_dompet']);
        
        $q_find = mysqli_query($koneksi, "SELECT nama FROM dompet WHERE id = $dompet_id");
        if ($q_find && mysqli_num_rows($q_find) > 0) {
            $row = mysqli_fetch_assoc($q_find);
            $dompet_nama = $row['nama'];
            
            if ($dompet_nama === 'Tunai') {
                $error_msg = "Dompet dasar 'Tunai' dilindungi dan tidak boleh dihapus.";
            } else {
                // Cek ketersediaan transaksi terhubung
                $nama_escaped = mysqli_real_escape_string($koneksi, $dompet_nama);
                $check_tx = mysqli_query($koneksi, "SELECT id FROM transaksi WHERE dompet = '$nama_escaped'");
                if (mysqli_num_rows($check_tx) > 0) {
                    $error_msg = "Gagal menghapus: Rekening '$dompet_nama' masih memiliki rentetan riwayat transaksi terikat. Silakan hapus atau alihkan transaksi tersebut terlebih dahulu.";
                } else {
                    $delete_query = "DELETE FROM dompet WHERE id = $dompet_id";
                    if (mysqli_query($koneksi, $delete_query)) {
                        $success_msg = "Rekening '" . htmlspecialchars($dompet_nama) . "' berhasil dihapus dari database.";
                    } else {
                        $error_msg = "Gagal menghapus rekening dari database.";
                    }
                }
            }
        }
    }
}

// Ambil semua daftar dompet
$dompet_list = [];
$q_dompet = mysqli_query($koneksi, "SELECT * FROM dompet ORDER BY id ASC");
if ($q_dompet) {
    while($r = mysqli_fetch_assoc($q_dompet)) {
        $dompet_list[] = $r;
    }
}

$active_page = 'rekening';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Dompet & Rekening - <?= htmlspecialchars($app_name); ?></title>
    <link rel="shortcut icon" href="<?= htmlspecialchars($app_favicon); ?>" type="image/x-icon">
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <!-- Google Fonts Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .rekening-card {
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transition: all 0.25s ease;
        }
        .rekening-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e1;
        }
        .card-form {
            border-radius: 20px;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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

<?php include 'sidebar.php'; ?>

    <!-- Header Action Bar -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 pb-3" style="border-bottom: 1px solid #e2e8f0;">
        <div>
            <h4 class="fw-bold text-slate-800 mb-1">Manajemen Dompet / Rekening</h4>
            <p class="text-muted small mb-0">Kelola rekening penyimpanan uang kustom secara terpisah dan pantau saldo berjalan riil Anda.</p>
        </div>
        <div>
            <?php if ($user_role !== 'user'): ?>
            <button class="btn btn-primary rounded-3 px-4 py-2.5 fw-bold text-uppercase tracking-wider shadow-sm d-flex align-items-center gap-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForm" aria-expanded="false" aria-controls="collapseForm">
                <i class="bi bi-wallet-fill"></i> <span>Buat Dompet</span>
            </button>
            <?php endif; ?>
        </div>
    </div>

    <!-- Alert status and actions -->
    <?php if (!empty($success_msg)): ?>
        <div class="alert alert-success px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0 shadow-sm" role="alert" style="background-color: rgba(16, 185, 129, 0.1); color: #047857;">
            <i class="bi bi-check-circle-fill me-2.5 fs-5 text-success"></i>
            <div class="small fw-semibold">Sukses: <?= $success_msg; ?></div>
        </div>
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
        <div class="alert alert-danger px-3 py-3 rounded-3 d-flex align-items-center mb-4 border-0 shadow-sm" role="alert" style="background-color: rgba(239, 68, 68, 0.1); color: #b91c1c;">
            <i class="bi bi-exclamation-triangle-fill me-2.5 fs-5 text-danger"></i>
            <div class="small fw-semibold"><?= $error_msg; ?></div>
        </div>
    <?php endif; ?>

    <!-- Collapsible Form row -->
    <div class="collapse mb-4" id="collapseForm">
        <div class="row">
            <div class="col-lg-12">
                <div class="card-form p-4 p-md-5 bg-white border">
                    <div class="d-flex align-items-center gap-2 mb-4 pb-3" style="border-bottom: 1px solid #f1f5f9;">
                        <div class="bg-primary-subtle text-primary rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                            <i class="bi bi-wallet2 fs-5"></i>
                        </div>
                        <div>
                            <h5 class="fw-bold text-slate-800 mb-0">Tambah Penyimpanan Baru</h5>
                            <p class="text-muted small mb-0" style="font-size: 0.73rem;">Menambahkan tempat penyimpanan baru seperti Kas, Rekening Bank, atau Dompet Digital.</p>
                        </div>
                    </div>

                    <form action="rekening.php" method="POST">
                        <input type="hidden" name="add_dompet" value="1">
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label for="nama_dompet" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Penyedia (Bank/e-Wallet)</label>
                                <input type="text" class="form-control py-2 px-3 focus-border-primary fw-bold" id="nama_dompet" name="nama_dompet" placeholder="Contoh: Bank BCA, Gopay, OVO, Tunai" required>
                            </div>
                            <div class="col-md-6">
                                <label for="saldo_awal" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Saldo Awal (Rupiah Rp)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light text-slate-500 font-monospace" style="font-size: 0.9rem;">Rp</span>
                                    <input type="number" class="form-control font-monospace fw-bold" id="saldo_awal" name="saldo_awal" value="0" min="0" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label for="nama_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Pemilik Rekening (Atas Nama)</label>
                                <input type="text" class="form-control py-2 px-3 fw-bold" id="nama_rekening" name="nama_rekening" value="-" placeholder="Nama Pemilik Rekening" required>
                            </div>
                            <div class="col-md-6">
                                <label for="no_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nomor Rekening</label>
                                <input type="text" class="form-control py-2 px-3 fw-bold" id="no_rekening" name="no_rekening" value="-" placeholder="Nomor Rekening / No Telepon" required>
                            </div>
                        </div>

                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-bold" data-bs-toggle="collapse" data-bs-target="#collapseForm">Batal</button>
                            <button type="submit" class="btn btn-primary flex-grow-1 py-2.5 rounded-3 fw-bold text-uppercase tracking-wider">
                                <i class="bi bi-plus-circle-fill me-1.5"></i> Daftarkan Penyimpanan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MAIN GRID CARDS OF ACCOUNT WALLETS -->
    <div class="row g-4 mb-4">
        <?php if (count($dompet_list) > 0): ?>
            <?php foreach ($dompet_list as $dp): 
                $nama_dp = $dp['nama'];
                $dp_id = $dp['id'];
                $saldo_awal_val = intval($dp['saldo_awal']);
                
                // Cari total mutasi secara aman
                $nama_dp_escaped = mysqli_real_escape_string($koneksi, $nama_dp);
                $q_flow = mysqli_query($koneksi, "
                    SELECT 
                        COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END), 0) AS total_in,
                        COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END), 0) AS total_out
                    FROM transaksi 
                    WHERE dompet = '$nama_dp_escaped'
                ");
                $flow_row = mysqli_fetch_assoc($q_flow);
                $total_masuk = intval($flow_row['total_in']);
                $total_keluar = intval($flow_row['total_out']);
                $saldo_berjalan = $saldo_awal_val + $total_masuk - $total_keluar;

                // Customize branding colors based on identity
                $badge_bg = "bg-primary";
                $border_left_color = "border-left: 5px solid #2563eb;";
                $card_icon = "bi-wallet2";

                if (stripos($nama_dp, 'bca') !== false) {
                    $border_left_color = "border-left: 5px solid #1e3a8a;";
                    $badge_bg = "bg-info text-dark";
                    $card_icon = "bi-bank2";
                } elseif (stripos($nama_dp, 'ovo') !== false) {
                    $border_left_color = "border-left: 5px solid #6d28d9;";
                    $badge_bg = "bg-purple text-white";
                    $card_icon = "bi-phone-fill";
                } elseif (stripos($nama_dp, 'gopay') !== false) {
                    $border_left_color = "border-left: 5px solid #06b6d4;";
                    $badge_bg = "bg-cyan text-white";
                    $card_icon = "bi-phone-fill";
                } elseif ($nama_dp === 'Tunai') {
                    $border_left_color = "border-left: 5px solid #10b981;";
                    $badge_bg = "bg-success";
                    $card_icon = "bi-cash";
                } elseif (stripos($nama_dp, 'kas') !== false) {
                    $border_left_color = "border-left: 5px solid #f59e0b;";
                    $badge_bg = "bg-warning text-dark";
                    $card_icon = "bi-briefcase-fill";
                }
            ?>
                <div class="col-md-6 col-lg-4">
                    <div class="rekening-card p-4 h-100 d-flex flex-column justify-content-between" style="<?= $border_left_color; ?>">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge <?= $badge_bg; ?> px-2.5 py-1.5 rounded-3 d-flex align-items-center gap-1.5 fw-bold font-monospace" style="font-size: 0.73rem;">
                                    <i class="bi <?= $card_icon; ?> fs-6"></i>
                                    <?= htmlspecialchars($nama_dp); ?>
                                </span>
                                <?php if ($nama_dp !== 'Tunai' && $user_role !== 'user'): ?>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-light rounded-circle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="width: 32px; height: 32px;">
                                            <i class="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 rounded-3 text-sm">
                                            <li>
                                                <button class="dropdown-item rounded-2 fw-semibold d-flex align-items-center gap-2 py-2" type="button" onclick="openEditDompetModal(<?= $dp_id; ?>, '<?= addslashes($nama_dp); ?>', <?= $saldo_awal_val; ?>, '<?= addslashes($dp['nama_rekening'] ?? ''); ?>', '<?= addslashes($dp['no_rekening'] ?? ''); ?>')">
                                                    <i class="bi bi-pencil-square text-primary"></i> Edit Rekening
                                                </button>
                                            </li>
                                            <li>
                                                <a class="dropdown-item rounded-2 text-danger fw-semibold d-flex align-items-center gap-2 py-2" href="rekening.php?delete_dompet=<?= $dp_id; ?>" onclick="return confirm('Apakah Anda yakin ingin menghapus rekening <?= addslashes($nama_dp); ?> ini? Semua transaksi didalamnya harus kosong.');">
                                                    <i class="bi bi-trash"></i> Hapus Rekening
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <span class="text-uppercase font-monospace tracking-wider text-muted py-1 d-block" style="font-size: 0.65rem; font-weight: 800;">Saldo Terkini / Berjalan</span>
                            <h3 class="fw-black mb-1 font-monospace <?= ($saldo_berjalan < 0) ? 'text-danger' : 'text-slate-900'; ?>" style="font-size: 1.65rem; font-weight: 900;">
                                Rp <?= number_format($saldo_berjalan, 0, ',', '.'); ?>
                            </h3>

                            <div class="small text-muted mb-3 mt-2" style="font-size: 0.77rem;">
                                <div class="d-flex align-items-center gap-1.5 justify-content-between mb-1 bg-light p-1.5 px-2 rounded-2">
                                    <span class="text-secondary fw-semibold"><i class="bi bi-person me-1"></i> A/N:</span>
                                    <span class="fw-bold text-slate-800 text-truncate text-end" style="max-width: 140px;"><?= htmlspecialchars($dp['nama_rekening'] ?? '-'); ?></span>
                                </div>
                                <div class="d-flex align-items-center gap-1.5 justify-content-between bg-light p-1.5 px-2 rounded-2">
                                    <span class="text-secondary fw-semibold"><i class="bi bi-credit-card me-1"></i> Rek:</span>
                                    <span class="fw-bold font-monospace text-slate-850"><?= htmlspecialchars($dp['no_rekening'] ?? '-'); ?></span>
                                </div>
                            </div>

                            <hr class="border-light-subtle my-3">

                            <div class="space-y-1.5 text-xs font-semibold text-slate-500">
                                <div class="d-flex justify-content-between mb-1.5">
                                    <span>Saldo Awal:</span>
                                    <span class="font-monospace text-slate-700">Rp <?= number_format($saldo_awal_val, 0, ',', '.'); ?></span>
                                </div>
                                <div class="d-flex justify-content-between mb-1.5 text-success">
                                    <span>Total Dana Masuk (+):</span>
                                    <span class="font-monospace">+ Rp <?= number_format($total_masuk, 0, ',', '.'); ?></span>
                                </div>
                                <div class="d-flex justify-content-between text-danger">
                                    <span>Total Dana Keluar (-):</span>
                                    <span class="font-monospace">- Rp <?= number_format($total_keluar, 0, ',', '.'); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="col-12 py-5 text-center text-muted">
                <i class="bi bi-wallet2 fs-1 text-secondary mb-3 d-block"></i>
                <h5>Belum Ada Data Rekening</h5>
                <p class="small">Koneksi data dompet Anda terindikasi kosong.</p>
            </div>
        <?php endif; ?>
    </div>

    <!-- Edit Dompet Modal -->
    <div class="modal fade" id="editDompetModal" tabindex="-1" aria-labelledby="editDompetModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold text-slate-800" id="editDompetModalLabel"><i class="bi bi-pencil-square text-primary me-2"></i> Ubah Detail Rekening</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form action="rekening.php" method="POST">
                    <input type="hidden" name="edit_dompet" value="1">
                    <input type="hidden" name="id_dompet" id="edit_id_dompet">
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label for="edit_nama_dompet" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Penyedia (Bank/e-Wallet)</label>
                            <input type="text" class="form-control py-2 px-3 fw-bold" id="edit_nama_dompet" name="nama_dompet" required>
                        </div>
                        <div class="mb-3">
                            <label for="edit_saldo_awal" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Saldo Awal (Rupiah Rp)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light text-slate-500 font-monospace" style="font-size: 0.9rem;">Rp</span>
                                <input type="number" class="form-control font-monospace fw-bold" id="edit_saldo_awal" name="saldo_awal" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="edit_nama_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nama Pemilik (Atas Nama)</label>
                            <input type="text" class="form-control py-2 px-3 fw-bold" id="edit_nama_rekening" name="nama_rekening" required>
                        </div>
                        <div class="mb-0">
                            <label for="edit_no_rekening" class="form-label text-uppercase text-muted font-monospace tracking-wider" style="font-size: 0.68rem; font-weight: 800;">Nomor Rekening / HP</label>
                            <input type="text" class="form-control py-2 px-3 fw-bold" id="edit_no_rekening" name="no_rekening" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary px-5 py-2 rounded-3 fw-bold text-uppercase tracking-wider">Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

<div class="mt-auto pt-4">
    <footer class="footer bg-white border-top py-4 text-center text-muted small">
        <div class="container">
            <span><?= $app_footer; ?></span>
        </div>
    </footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script>
    function openEditDompetModal(id, nama, saldo_awal, nama_rekening, no_rekening) {
        document.getElementById('edit_id_dompet').value = id;
        document.getElementById('edit_nama_dompet').value = nama;
        document.getElementById('edit_saldo_awal').value = saldo_awal;
        document.getElementById('edit_nama_rekening').value = nama_rekening || '-';
        document.getElementById('edit_no_rekening').value = no_rekening || '-';
        
        // Block name edit if 'Tunai'
        if (nama === 'Tunai') {
            document.getElementById('edit_nama_dompet').readOnly = true;
        } else {
            document.getElementById('edit_nama_dompet').readOnly = false;
        }
        
        var editModal = new bootstrap.Modal(document.getElementById('editDompetModal'));
        editModal.show();
    }
</script>
</body>
</html>
