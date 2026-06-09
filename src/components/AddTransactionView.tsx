import React, { useState, useEffect } from 'react';
import { PlusSquare, ArrowDownLeft, ArrowUpRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Transaction } from '../types';

interface AddTransactionViewProps {
  categories: string[];
  onAddTransaction: (tx: { tanggal: string; jenis: 'pemasukan' | 'pengeluaran'; kategori: string; jumlah: number; keterangan: string }) => void;
  onCancel: () => void;
}

export default function AddTransactionView({
  categories,
  onAddTransaction,
  onCancel
}: AddTransactionViewProps) {
  const [addTanggal, setAddTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [addKeterangan, setAddKeterangan] = useState('');
  const [addJenis, setAddJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [addKategori, setAddKategori] = useState('Gaji');
  const [addJumlah, setAddJumlah] = useState('');
  const [addError, setAddError] = useState('');

  // Sychronize default category when type button toggle changes
  useEffect(() => {
    if (addJenis === 'pemasukan') {
      setAddKategori('Gaji');
    } else {
      setAddKategori('Makan & Minum');
    }
  }, [addJenis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!addTanggal || !addKeterangan || !addJenis || !addJumlah || !addKategori) {
      setAddError('Harap lengkapi seluruh kolom formulir pendataan!');
      return;
    }

    const nominalValue = parseInt(addJumlah, 10);
    if (isNaN(nominalValue) || nominalValue <= 0) {
      setAddError('Nilai nominal uang wajib lebih besar dari 0!');
      return;
    }

    onAddTransaction({
      tanggal: addTanggal,
      jenis: addJenis,
      kategori: addKategori,
      jumlah: nominalValue,
      keterangan: addKeterangan.trim()
    });

    // Reset Form
    setAddKeterangan('');
    setAddJumlah('');
    setAddJenis('pemasukan');
    setAddTanggal(new Date().toISOString().substring(0, 10));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 shadow-xs max-w-2xl mx-auto">
      {/* View Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-100 text-blue-600 rounded-xl p-2 flex items-center justify-center">
            <PlusSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base md:text-lg font-sans">
              Tambah Transaksi Baru
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-px">Catat aliran pemasukan atau pengeluaran kas keuangan</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-850 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {addError && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-px" />
            <span>{addError}</span>
          </div>
        )}

        {/* 1. Date select */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Tanggal Transaksi
          </label>
          <input
            type="date"
            value={addTanggal}
            onChange={(e) => setAddTanggal(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            required
          />
        </div>

        {/* 2. Toggle buttons logic */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Jenis Transaksi
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAddJenis('pemasukan')}
              className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                addJenis === 'pemasukan'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-4 ring-emerald-500/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownLeft className="w-4.5 h-4.5 stroke-[2.5]" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setAddJenis('pengeluaran')}
              className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                addJenis === 'pengeluaran'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 ring-4 ring-rose-500/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="w-4.5 h-4.5 stroke-[2.5]" />
              Pengeluaran
            </button>
          </div>
        </div>

        {/* 3. Category selection drop down */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Kategori
          </label>
          <select
            value={addKategori}
            onChange={(e) => setAddKategori(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
          >
            {categories.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* 4. Value / Price amount input with label */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Nominal Rp (Rupiah)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-400 font-extrabold text-sm">
              Rp
            </span>
            <input
              type="number"
              placeholder="Contoh: 50000"
              min="1"
              value={addJumlah}
              onChange={(e) => setAddJumlah(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1.5 block leading-none">
            Masukkan angka murni saja tanpa tanda titik separator desimal.
          </span>
        </div>

        {/* 5. Descriptions notes textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Keterangan / Deskripsi Transaksi
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan catatan peruntukan kas (contoh: Pembelian alat fotic, Honor bulanan dll)..."
            value={addKeterangan}
            onChange={(e) => setAddKeterangan(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            required
          />
        </div>

        {/* Action submit button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-98"
          >
            Simpan Transaksi Baru
          </button>
        </div>
      </form>
    </div>
  );
}
