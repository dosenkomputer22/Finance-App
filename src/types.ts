// types.ts
// Interface definitions for the Financial Recording Application and cPanel configuration

export interface Transaction {
  id: string; // Unique simulation ID (will translate to auto_increment in MySQL)
  tanggal: string; // Format: YYYY-MM-DD
  keterangan: string;
  jenis: 'pemasukan' | 'pengeluaran';
  jumlah: number;
  kategori: string; // Category like Gaji, Belanja, Transportasi, Makan & Minum, etc.
}

export interface DbConfig {
  host: string;
  user: string;
  pass: string;
  name: string;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'add-transaction' | 'reports' | 'categories' | 'settings' | 'users';

export interface UserSim {
  id: string;
  username: string;
  nama: string;
  role: 'admin' | 'superadmin' | 'user';
}
