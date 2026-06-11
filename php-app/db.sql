-- db.sql
-- Script SQL Pembuatan Database, Tabel Pengguna (Login) & Tabel Transaksi Keuangan

-- Buat database jika dijalankan di localhost
CREATE DATABASE IF NOT EXISTS `keuangan_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `keuangan_db`;

-- Struktur Tabel users untuk Pengamanan Login
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Akun Default (username: admin -> Super Admin, username: budi -> Admin)
-- Password default adalah admin123 (telah di-hash menggunakan bcrypt password_hash())
INSERT INTO `users` (`id`, `username`, `password`, `nama`, `role`, `status`) VALUES
(1, 'admin', '$2y$10$vO.mXpX2xR10.C8UfPyX8.1X7N.TfKIdwN9YhEqO5C7h3ZHe.7S.e', 'Administrator Keuangan', 'superadmin', 'approved'),
(2, 'budi', '$2y$10$vO.mXpX2xR10.C8UfPyX8.1X7N.TfKIdwN9YhEqO5C7h3ZHe.7S.e', 'Budi Santoso', 'admin', 'approved')
ON DUPLICATE KEY UPDATE id=id;

-- Struktur Tabel transaksi
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tanggal` DATE NOT NULL,
  `keterangan` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
  `jenis` ENUM('pemasukan','pengeluaran') NOT NULL,
  `jumlah` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Dummy Awal
INSERT INTO `transaksi` (`id`, `tanggal`, `keterangan`, `kategori`, `jenis`, `jumlah`) VALUES
(1, '2026-06-01', 'Gaji Bulanan Utama', 'Gaji', 'pemasukan', 5000000),
(2, '2026-06-02', 'Membeli Hosting & Domain CPanel', 'Tagihan', 'pengeluaran', 250000),
(3, '2026-06-03', 'Projek Pembuatan Jasa Website UMKM', 'Freelance', 'pemasukan', 1750000),
(4, '2026-06-05', 'Membayar Tagihan Listrik Bulanan', 'Tagihan', 'pengeluaran', 190000),
(5, '2026-06-06', 'Membeli Buku Panduan Pemrograman PHP', 'Belanja', 'pengeluaran', 95000),
(6, '2026-06-08', 'Menerima Komisi Afiliasi Landing Page', 'Freelance', 'pemasukan', 600000);
