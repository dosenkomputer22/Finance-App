import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Database 
} from 'lucide-react';
import { Transaction, Wallet as WalletType } from '../types';

interface StatsCardsProps {
  transactions: Transaction[];
  wallets: WalletType[];
  formatRupiah: (angka: number) => string;
}

export default function StatsCards({
  transactions,
  wallets,
  formatRupiah
}: StatsCardsProps) {
  const totalPemasukan = transactions
    .filter(t => t.jenis === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const totalPengeluaran = transactions
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  // Accurate multi-wallet net balance calculation
  const totalSaldoAwal = wallets.reduce((sum, w) => sum + w.saldo_awal, 0);
  const saldoAkhir = totalSaldoAwal + totalPemasukan - totalPengeluaran;
  const transactionsCount = transactions.length;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Card Pemasukan */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
              Total Pemasukan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 scroll-m-20 tracking-tight font-sans">
              {formatRupiah(totalPemasukan)}
            </h2>
          </div>
          <div className="bg-emerald-50 text-emerald-650 rounded-xl p-2.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5] text-emerald-500" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
            +12%
          </span>
          <span className="text-gray-450 font-medium">Bulan ini</span>
        </div>
      </div>

      {/* 2. Card Pengeluaran */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
              Total Pengeluaran
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-rose-600 mt-1 scroll-m-20 tracking-tight font-sans">
              {formatRupiah(totalPengeluaran)}
            </h2>
          </div>
          <div className="bg-rose-50 text-rose-650 rounded-xl p-2.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5] text-rose-500" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-md">
            +8%
          </span>
          <span className="text-gray-450 font-medium">Bulan ini</span>
        </div>
      </div>

      {/* 3. Card Saldo Akhir */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between group">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${saldoAkhir >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
              Saldo Akhir
            </span>
            <h2 className={`text-xl sm:text-2xl font-black mt-1 scroll-m-20 tracking-tight font-sans ${saldoAkhir >= 0 ? 'text-blue-600' : 'text-red-650'}`}>
              {formatRupiah(saldoAkhir)}
            </h2>
          </div>
          <div className={`rounded-xl p-2.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${
            saldoAkhir >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
          }`}>
            <Wallet className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-4 text-xs font-semibold flex items-center gap-1.5">
          {saldoAkhir >= 0 ? (
            <span className="text-blue-650 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Surplus Anggaran
            </span>
          ) : (
            <span className="text-red-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              Defisit Terdeteksi
            </span>
          )}
        </div>
      </div>

      {/* 4. Card Total Transaksi */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">
              Total Catatan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 scroll-m-20 tracking-tight font-sans">
              {transactionsCount} Transaksi
            </h2>
          </div>
          <div className="bg-indigo-50 text-indigo-650 rounded-xl p-2.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
            <Database className="w-5 h-5 text-indigo-505" />
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-450 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
          Simulasi LocalStorage Aktif
        </div>
      </div>
    </div>
  );
}
