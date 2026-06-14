import React, { useState } from 'react';
import { 
  PieChart, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  HelpCircle, 
  Flame, 
  Sparkles,
  Infinity as InfinityIcon
} from 'lucide-react';
import { Transaction, UserSim } from '../types';

interface BudgetingViewProps {
  categories: string[];
  budgetLimits: Record<string, number>;
  setBudgetLimits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  transactions: Transaction[];
  currentUser: UserSim;
}

export default function BudgetingView({
  categories,
  budgetLimits,
  setBudgetLimits,
  transactions,
  currentUser
}: BudgetingViewProps) {
  const [selectedCat, setSelectedCat] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const userRole = currentUser?.role ?? 'admin';

  // Format currency helper
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();

  const monthsMap = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calculate month-to-date spent per category
  const spendingMTD = transactions.reduce((acc, tx) => {
    if (tx.jenis === 'pengeluaran') {
      const txDate = new Date(tx.tanggal);
      if (!isNaN(txDate.getTime())) {
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          acc[tx.kategori] = (acc[tx.kategori] || 0) + tx.jumlah;
        }
      }
    }
    return acc;
  }, {} as Record<string, number>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (userRole === 'user') {
      setErrorMsg("Akses Ditolak: Peran 'user' hanya diizinkan untuk melihat visualisasi anggaran.");
      return;
    }

    if (!selectedCat) {
      setErrorMsg('Silakan pilih atau tentukan kategori pengeluaran.');
      return;
    }

    const limitVal = parseInt(limitInput, 10);
    if (isNaN(limitVal) || limitVal < 0) {
      setErrorMsg('Limit bulanan tidak boleh kurang dari Rp 0.');
      return;
    }

    setBudgetLimits((prev) => ({
      ...prev,
      [selectedCat]: limitVal
    }));

    setSuccessMsg(`Batas kuota anggaran untuk "${selectedCat}" berhasil disimpan!`);
    setSelectedCat('');
    setLimitInput('');

    // Clear alert after 4 seconds
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Get matching icon for default categories
  const getCategoryIconAndColor = (catName: string) => {
    const maps: Record<string, { bg: string; text: string; label: string }> = {
      'Gaji': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'bi-cash-coin' },
      'Belanja': { bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'bi-cart-fill' },
      'Transportasi': { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'bi-truck' },
      'Makan & Minum': { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'bi-cup-hot-fill' },
      'Tagihan': { bg: 'bg-violet-500/10', text: 'text-violet-500', label: 'bi-receipt' },
      'Freelance': { bg: 'bg-pink-500/10', text: 'text-pink-500', label: 'bi-laptop' },
      'Lainnya': { bg: 'bg-slate-500/10', text: 'text-slate-500', label: 'bi-three-dots' }
    };
    return maps[catName] || { bg: 'bg-indigo-500/10', text: 'text-indigo-500', label: 'bi-tag-fill' };
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-xl shadow-md shadow-indigo-200">
            <PieChart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Anggaran Belanja</h1>
            <p className="text-slate-500 text-xs">Kontrol pengeluaran bulanan secara proaktif dengan batas kuota kategori</p>
          </div>
        </div>
        <div className="bg-indigo-50/70 border border-indigo-100/50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Bulan: {monthsMap[currentMonth]} {currentYear}
        </div>
      </div>

      {/* Success/Error Notices */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200/50 text-emerald-800 rounded-xl shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <strong className="font-semibold block">Simpan Anggaran Sukses!</strong>
            <span className="text-emerald-700">{successMsg}</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200/50 text-rose-800 rounded-xl shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="text-xs">
            <strong className="font-semibold block">Terjadi Kendala!</strong>
            <span className="text-rose-700">{errorMsg}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SETUP FORM (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Setel Batas Kuota
                </h5>
                <p className="text-slate-400 text-xs mt-1">Ubah atau tentukan batas maksimal spending per kategori bulanan</p>
              </div>

              {userRole === 'user' && (
                <div className="p-3.5 bg-indigo-50/60 text-indigo-800 rounded-xl flex gap-2.5 mb-5 border border-indigo-100/30">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Akun Anda berpangkat <strong>User</strong>. Hanya <strong>Admin / Superadmin</strong> yang diizinkan mengedit budget limit kategori.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="kategori_nama" className="block text-xs font-semibold text-slate-600 mb-2">Pilih Kategori Transaksi</label>
                  <select
                    id="kategori_nama"
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    required
                    disabled={userRole === 'user'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">-- Silakan Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="limit_bulanan" className="block text-xs font-semibold text-slate-600 mb-2">Batas Kuota Bulanan (Rp)</label>
                  <div className="relative rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 overflow-hidden bg-white">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      id="limit_bulanan"
                      type="number"
                      placeholder="Misal: 3000000"
                      min="0"
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      required
                      disabled={userRole === 'user'}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium focus:outline-none bg-transparent disabled:text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Masukkan nilai 0 untuk menonaktifkan kontrol budget kategori (unlimited).</p>
                </div>

                <button
                  type="submit"
                  disabled={userRole === 'user'}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 hover:shadow-indigo-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  TERAPKAN LIMIT
                </button>
              </form>
            </div>

            {/* Informational Panel */}
            <div className="p-4 bg-gradient-to-tr from-slate-50 to-indigo-50/20 rounded-xl border border-indigo-100/30 mt-6 md:mt-10">
              <h6 className="text-xs font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Efek Kontrol Proaktif
              </h6>
              <p className="text-slate-500 text-[10px] leading-relaxed mt-1.5">
                Sistem memonitor total transaksi berjenis <strong>pengeluaran</strong> sepanjang bulan berjalan secara real-time. Banner peringatan akan otomatis tampil di beranda ketika pengeluaran di salah satu kategori melewati <strong>90%</strong> kuota limit.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUDGET LIST (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-100 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h5 className="font-bold text-slate-800 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                Status Kepatuhan Anggaran
              </h5>
              <span className="text-slate-400 text-2xs md:text-xs">Update: {now.toLocaleDateString('id-ID')}</span>
            </div>

            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="italic text-xs">Belum ada kategori transaksi yang terdaftar.</p>
                </div>
              ) : (
                categories.map((catName) => {
                  const limit = budgetLimits[catName] ?? 0;
                  const spent = spendingMTD[catName] ?? 0;
                  const pct = limit > 0 ? (spent / limit) * 100 : 0;
                  const visual = getCategoryIconAndColor(catName);

                  let borderClass = 'border-slate-100';
                  let badgeColors = 'bg-slate-50 text-slate-500 border border-slate-200/50';
                  let statusText = 'Aman';
                  let progressColor = 'bg-emerald-500';
                  let statusIcon = 'bi-shield-fill-check';

                  if (limit === 0) {
                    borderClass = 'border-slate-100';
                    badgeColors = 'bg-slate-50 text-slate-500 border border-slate-100';
                    statusText = 'Tanpa Batas';
                    progressColor = 'bg-slate-300';
                  } else if (pct >= 100) {
                    borderClass = 'border-red-100 border-l-4 border-l-red-500';
                    badgeColors = 'bg-red-50 text-red-600 border border-red-100';
                    statusText = 'Over Limit';
                    progressColor = 'bg-red-500';
                  } else if (pct >= 90) {
                    borderClass = 'border-red-100 border-l-4 border-l-red-500';
                    badgeColors = 'bg-red-50 text-red-500 border border-red-100';
                    statusText = 'Sangat Kritis (>90%)';
                    progressColor = 'bg-rose-500';
                  } else if (pct >= 70) {
                    borderClass = 'border-amber-100 border-l-4 border-l-amber-500';
                    badgeColors = 'bg-amber-50 text-amber-600 border border-amber-100';
                    statusText = 'Waspada (>70%)';
                    progressColor = 'bg-amber-500';
                  } else {
                    borderClass = 'border-emerald-100 border-l-4 border-l-emerald-500';
                    badgeColors = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                    statusText = 'Aman';
                    progressColor = 'bg-emerald-500';
                  }

                  return (
                    <div 
                      key={catName} 
                      className={`p-4 rounded-xl border ${borderClass} bg-white hover:shadow-md hover:shadow-slate-100/80 transition-all space-y-3.5`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${visual.bg} ${visual.text}`}>
                            <PieChart className="w-5 h-5" />
                          </div>
                          <div>
                            <h6 className="font-semibold text-xs text-slate-800">{catName}</h6>
                            <span className="text-[10px] text-slate-400">
                              Aktual: <strong className="text-slate-600 font-medium">{formatRupiah(spent)}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColors}`}>
                            {statusText}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">
                            / {limit > 0 ? formatRupiah(limit) : 'Bebas Limit'}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar container */}
                      {limit > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full ${progressColor} transition-all duration-500`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold font-mono text-slate-600 ml-3 shrink-0">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="h-full bg-slate-300 w-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono ml-3 shrink-0">
                              Unlimited
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
