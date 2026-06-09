-- db.sql
-- Script SQL Pembuatan Database & Tabel Transaksi Keuangan

-- Buat database jika dijalankan di localhost (Di cPanel biasanya database dibuat manual lewat menu 'MySQL Database Wizard' lalu jalankan script ini)
CREATE DATABASE IF NOT EXISTS `keuangan_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `keuangan_db`;

-- Struktur Tabel transaksi
CREATE TABLE IF NOT EXISTS `transaksi` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tanggal` DATE NOT NULL,
  `keterangan` VARCHAR(255) NOT NULL,
  `jenis` ENUM('pemasukan','pengeluaran') NOT NULL,
  `jumlah` INT(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Menambahkan Data Dummy Awal (Opsional - Bisa di-import sebagai data percobaan)
INSERT INTO `transaksi` (`tanggal`, `keterangan`, `jenis`, `jumlah`) VALUES
('2026-06-01', 'Modal Awal Kas Pribadi', 'pemasukan', 5000000),
('2026-06-02', 'Membeli Hosting & Domain CPanel', 'pengeluaran', 250000),
('2026-06-03', 'Projek Pembuatan Jasa Website UMKM', 'pemasukan', 1750000),
('2026-06-05', 'Membayar Tagihan Listrik Bulanan', 'pengeluaran', 190000),
('2026-06-06', 'Membeli Buku Panduan Pemrograman PHP', 'pengeluaran', 95000),
('2026-06-08', 'Menerima Komisi Afiliasi Landing Page', 'pemasukan', 600000);
