import React, { useState, useEffect } from 'react';
import { PlusSquare, ArrowDownLeft, ArrowUpRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Transaction, Wallet } from '../types';

interface AddTransactionViewProps {
  categories: string[];
  wallets: Wallet[];
  onAddTransaction: (tx: { tanggal: string; jenis: 'pemasukan' | 'pengeluaran'; kategori: string; jumlah: number; keterangan: string; dompet?: string }) => void;
  onCancel: () => void;
}

export default function AddTransactionView({
  categories,
  wallets,
  onAddTransaction,
  onCancel
}: AddTransactionViewProps) {
  const [addTanggal, setAddTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [addKeterangan, setAddKeterangan] = useState('');
  const [addJenis, setAddJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [addKategori, setAddKategori] = useState('Gaji');
  const [addDompet, setAddDompet] = useState('Tunai');
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

    if (!addTanggal || !addKeterangan || !addJenis || !addJumlah || !addKategori || !addDompet) {
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
      keterangan: addKeterangan.trim(),
      dompet: addDompet
    });

    // Reset Form
    setAddKeterangan('');
    setAddJumlah('');
    setAddJenis('pemasukan');
    setAddTanggal(new Date().toISOString().substring(0, 10));
    setAddDompet('Tunai');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* LEFT COLUMN: Detailed Input Form (Col-span 7/8 on lg screens) */}
      <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-gray-150 p-6 md:p-8 shadow-xs">
        {/* View Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 flex items-center justify-center shrink-0 shadow-xs">
              <PlusSquare className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base md:text-lg tracking-tight">
                Tambah Transaksi Baru
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-px">Formulir terproteksi prepared query & enkripsi session</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-150/60 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-5">
          {addError && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-750 flex items-start gap-2.5 animate-pulse">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-px" />
              <span className="font-bold">{addError}</span>
            </div>
          )}

          {/* Grid Row 1: Date & Category & Wallet */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-2">
                Tanggal Transaksi
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={addTanggal}
                  onChange={(e) => setAddTanggal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-2">
                Kategori Transaksi
              </label>
              <select
                value={addKategori}
                onChange={(e) => setAddKategori(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all cursor-pointer"
              >
                {categories.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-2">
                Dompet / Rekening
              </label>
              <select
                value={addDompet}
                onChange={(e) => setAddDompet(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all cursor-pointer font-sans"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.nama}>{w.nama}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle buttons logic */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-2">
              Jenis Aliran Dana
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAddJenis('pemasukan')}
                className={`py-3.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addJenis === 'pemasukan'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 ring-4 ring-emerald-500/10'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-55'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[3] text-emerald-600" />
                Pemasukan (Uang Masuk)
              </button>
              <button
                type="button"
                onClick={() => setAddJenis('pengeluaran')}
                className={`py-3.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addJenis === 'pengeluaran'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-800 ring-4 ring-rose-500/10'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-55'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 stroke-[3] text-rose-600" />
                Pengeluaran (Uang Keluar)
              </button>
            </div>
          </div>

          {/* Nominal amount input */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-2">
              Nominal Rp (Rupiah)
            </label>
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs font-mono">
                Rp
              </span>
              <input
                type="number"
                placeholder="Contoh: 100000"
                min="1"
                value={addJumlah}
                onChange={(e) => setAddJumlah(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-black font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400 font-bold mt-1.5 block leading-none pl-1">
              * Tuliskan nilai angka bulat saja tanpa menggunakan titik (.) atau koma (,).
            </span>
          </div>

          {/* Descriptions notes textarea */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-2">
              Keterangan Catatan
            </label>
            <textarea
              rows={3}
              placeholder="Ketik keterangan detail pembayaran / peruntukan dana..."
              value={addKeterangan}
              onChange={(e) => setAddKeterangan(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold transition-all"
              required
            />
          </div>

          {/* Action submit button */}
          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
            >
              Simpan Catatan Keuangan
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Interactive Information Sidebar (Col-span 5/4 on lg screens) */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        
        {/* Dynamic Visualizer Ticket Preview Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-150 shadow-sm bg-white">
          <div className={`p-4 text-center text-white ${
            addJenis === 'pemasukan' 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
              : 'bg-gradient-to-r from-rose-600 to-pink-600'
          }`}>
            <span className="text-[10px] uppercase tracking-widest font-black opacity-85">Rincian Slip Transaksi</span>
            <h4 className="text-sm font-bold tracking-tight mt-0.5">Peninjau Arus Kas Dinamis</h4>
          </div>
          
          <div className="p-5 space-y-4 relative bg-slate-55">
            {/* Visual ticket strip lines */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-b from-slate-200/50 to-transparent"></div>
            
            <div className="space-y-3.5 bg-white p-4.5 rounded-xl border border-dashed border-slate-200 shadow-2xs font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold">STATUS CATATAN</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  addJenis === 'pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {addJenis === 'pemasukan' ? 'DANA MASUK' : 'DANA KELUAR'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-bold text-slate-800">{addTanggal || '-'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Kategori:</span>
                <span className="font-bold text-slate-800">{addKategori}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Penyimpanan:</span>
                <span className="font-bold text-slate-800">{addDompet}</span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-400 shrink-0">Catatan:</span>
                <span className="font-semibold text-slate-700 text-right truncate max-w-[180px]">
                  {addKeterangan ? `"${addKeterangan}"` : 'Belum ditulis...'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col items-center">
                <span className="text-[10px] text-slate-450 uppercase font-black tracking-wider mb-1">Nominal Tercatat:</span>
                <span className={`text-xl font-black ${
                  addJenis === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {addJenis === 'pemasukan' ? '+' : '-'} Rp {(parseInt(addJumlah, 10) || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            
            <div className="text-[10px] text-center text-slate-450 font-bold mt-1">
              Pratinjau ini diperbarui secara berkala sesuai form input.
            </div>
          </div>
        </div>

        {/* Informational guide box */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Standart Keamanan PHP</span>
          </div>
          
          <ul className="space-y-3.5 text-xs text-slate-300 font-medium list-none pl-0">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5 font-bold font-mono">✓</span>
              <span><strong>MySQLi SQL Injection Protection</strong> dengan syntax <code>mysqli_prepare</code> siap membentengi database.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5 font-bold font-mono">✓</span>
              <span>Input nominal uang dikonversi menjadi integer (<code>(int) $jumlah</code>) untuk validasi tipe data matematis di backend.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 mt-0.5 font-bold font-mono">✓</span>
              <span>Validasi server-side memastikan data tidak kosong sebelum diproses simpan ke tabel <code>transaksi</code>.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
