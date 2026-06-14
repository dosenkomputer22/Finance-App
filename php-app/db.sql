-- db.sql
-- Script SQL Pembuatan Database, Tabel Pengguna (Login) & Tabel Transaksi Keuangan

-- Buat database jika dijalankan di localhost (Di cPanel biasanya database dibuat manual lewat menu 'MySQL Database Wizard' lalu jalankan script ini)
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
  `theme` VARCHAR(30) NOT NULL DEFAULT 'slate',
  `lang` VARCHAR(10) NOT NULL DEFAULT 'id',
  `show_card_in` INT(1) NOT NULL DEFAULT 1,
  `show_card_out` INT(1) NOT NULL DEFAULT 1,
  `show_card_balance` INT(1) NOT NULL DEFAULT 1,
  `show_chart_trend` INT(1) NOT NULL DEFAULT 1,
  `show_chart_prop` INT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Database dimulai dalam kondisi bersih tanpa data bawaan agar pendaftar pertama otomatis menjadi Super Admin (ACC).

-- Struktur Tabel Kategori Transaksi
CREATE TABLE IF NOT EXISTS `kategori` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Isi Default Kategori
INSERT INTO `kategori` (`id`, `nama`) VALUES
(1, 'Gaji'),
(2, 'Belanja'),
(3, 'Transportasi'),
(4, 'Makan & Minum'),
(5, 'Tagihan'),
(6, 'Freelance'),
(7, 'Lainnya')
ON DUPLICATE KEY UPDATE nama=nama;

-- Struktur Tabel transaksi
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tanggal` DATE NOT NULL,
  `keterangan` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
  `jenis` ENUM('pemasukan','pengeluaran') NOT NULL,
  `jumlah` INT(11) NOT NULL,
  `dompet` VARCHAR(100) NOT NULL DEFAULT 'Tunai',
  `username` VARCHAR(50) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Dummy Awal
INSERT INTO `transaksi` (`id`, `tanggal`, `keterangan`, `kategori`, `jenis`, `jumlah`, `dompet`, `username`) VALUES
(1, '2026-06-01', 'Gaji Bulanan Utama', 'Gaji', 'pemasukan', 5000000, 'Bank BCA', 'admin'),
(2, '2026-06-02', 'Membeli Hosting & Domain CPanel', 'Tagihan', 'pengeluaran', 250000, 'Bank BCA', 'admin'),
(3, '2026-06-03', 'Projek Pembuatan Jasa Website UMKM', 'Freelance', 'pemasukan', 1750000, 'Gopay', 'admin'),
(4, '2026-06-05', 'Membayar Tagihan Listrik Bulanan', 'Tagihan', 'pengeluaran', 190000, 'Tunai', 'admin'),
(5, '2026-06-06', 'Membeli Buku Panduan Pemrograman PHP', 'Belanja', 'pengeluaran', 95000, 'OVO', 'admin'),
(6, '2026-06-08', 'Menerima Komisi Afiliasi Landing Page', 'Freelance', 'pemasukan', 600000, 'Gopay', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Struktur Tabel dompet (Multi-Wallet Management)
CREATE TABLE IF NOT EXISTS `dompet` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(100) NOT NULL UNIQUE,
  `saldo_awal` INT(11) NOT NULL DEFAULT 0,
  `nama_rekening` VARCHAR(100) NOT NULL DEFAULT '-',
  `no_rekening` VARCHAR(50) NOT NULL DEFAULT '-',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Isi Default Dompet/Rekening
INSERT INTO `dompet` (`id`, `nama`, `saldo_awal`, `nama_rekening`, `no_rekening`) VALUES
(1, 'Tunai', 1000000, '-', '-'),
(2, 'Bank BCA', 5000000, 'Dosen Komputer', '1234567890'),
(3, 'Gopay', 250000, 'Dosen Komputer', '081234567890'),
(4, 'OVO', 100000, 'Dosen Komputer', '081234567890')
ON DUPLICATE KEY UPDATE nama=nama;

-- Struktur Tabel anggaran (Limit Kategori Transaksi)
CREATE TABLE IF NOT EXISTS `anggaran` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `kategori` VARCHAR(100) NOT NULL UNIQUE,
  `limit_bulanan` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Limit Default
INSERT INTO `anggaran` (`kategori`, `limit_bulanan`) VALUES
('Belanja', 3000000),
('Transportasi', 1000000),
('Makan & Minum', 2000000),
('Tagihan', 1500000),
('Lainnya', 500000)
ON DUPLICATE KEY UPDATE `limit_bulanan`=VALUES(`limit_bulanan`);

-- Struktur Tabel pengaturan_sistem
CREATE TABLE IF NOT EXISTS `pengaturan_sistem` (
  `kunci` VARCHAR(50) NOT NULL UNIQUE,
  `nilai` TEXT NOT NULL,
  PRIMARY KEY (`kunci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Isi Default Pengaturan Sistem
INSERT INTO `pengaturan_sistem` (`kunci`, `nilai`) VALUES
('nama_aplikasi', 'KeuanganKu'),
('logo_icon', 'bi-wallet2'),
('logo_image_url', '')
ON DUPLICATE KEY UPDATE nilai=nilai;