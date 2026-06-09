import React, { useState } from 'react';
import { Tags, PlusCircle, Trash, AlertTriangle, Lock, HelpCircle, Check, X } from 'lucide-react';

interface CategoriesViewProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const FIXED_LIST = ['Gaji', 'Belanja', 'Transportasi', 'Makan & Minum', 'Tagihan', 'Lainnya'];

export default function CategoriesView({ categories, setCategories }: CategoriesViewProps) {
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Custom dialog state instead of blocked window.confirm / alert
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [systemWarningTarget, setSystemWarningTarget] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = newCat.trim();
    if (!trimmed) {
      setError('Nama kategori tidak boleh kosong!');
      return;
    }

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('Kategori dengan nama ini sudah terdaftar!');
      return;
    }

    setCategories([...categories, trimmed]);
    setSuccess(`Kategori "${trimmed}" berhasil ditambahkan!`);
    setNewCat('');

    // Clear success message after 3s
    setTimeout(() => setSuccess(''), 3000);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      const target = deleteTarget;
      setCategories(categories.filter((c) => c !== target));
      setSuccess(`Kategori "${target}" berhasil dihapus.`);
      setDeleteTarget(null);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const isSystemCategory = (name: string) => {
    return FIXED_LIST.includes(name);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-white p-5 border border-gray-150 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 flex items-center justify-center">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base font-sans">
              Manajemen Kategori Keuangan
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-px">Daftarkan pengelompokan anggaran sesuai kebutuhan Anda</p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
            {categories.length} Total Kategori
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Category lists (7 cols) */}
        <div className="md:col-span-7 bg-white p-6 border border-gray-100 rounded-2xl shadow-xs">
          <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider mb-4">Daftar Kategori Terdaftar</h4>
          
          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {categories.map((c, idx) => {
              const system = isSystemCategory(c);
              return (
                <div 
                  key={idx} 
                  className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-3 rounded-xl hover:bg-slate-100/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 font-bold text-slate-750 text-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${system ? 'bg-slate-400' : 'bg-blue-600'}`} />
                    <span className={system ? 'text-slate-505 font-medium' : ''}>{c}</span>
                    {system && (
                      <span className="inline-flex items-center gap-1 bg-slate-200/60 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1">
                        <Lock className="w-2.5 h-2.5" />
                        Sistem
                      </span>
                    )}
                  </div>
                  
                  {system ? (
                    <button
                      type="button"
                      onClick={() => setSystemWarningTarget(c)}
                      className="p-1.5 px-2 bg-slate-100/60 text-slate-400 rounded-lg transition-all border border-slate-200/50 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 group hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                      title="Kategori Sistem Tidak Bisa Dihapus"
                    >
                      <Lock className="w-3 h-3 text-slate-450 group-hover:text-amber-600" />
                      Locked
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 px-2.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-100 hover:border-transparent rounded-lg transition-all text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                      title="Hapus Kategori Custom"
                    >
                      <Trash className="w-3 h-3" />
                      Hapus
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input form (5 cols) */}
        <div className="md:col-span-5 bg-white p-6 border border-gray-100 rounded-2xl shadow-xs h-fit">
          <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider mb-4">Tambah Kategori Baru</h4>
          
          <form onSubmit={handleAdd} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-px" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Nama Kategori
              </label>
              <input
                type="text"
                placeholder="Contoh: Kesehatan, Investasi, Pajak"
                value={newCat}
                onChange={(e) => {
                  setNewCat(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                maxLength={25}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Simpan Kategori
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Informasi Kategori</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Kategori bawaan sistem yang dikunci (<span className="font-bold text-slate-650">Locked</span>) diperlukan agar rasio kalkulasi visual buku kas tetap berjalan stabil. Namun, Anda dibebaskan membuat berbagai kategori custom tersendiri dan mendeletenya kapan saja.
            </p>
          </div>
        </div>
      </div>

      {/* 
        MODAL 1: CUSTOM CONFIRMATION DIALOG (FOR DELETING NON-SYSTEM CATEGORY)
      */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 z-10 overflow-hidden transform transition-all">
            <div className="flex items-start gap-3">
              <div className="bg-rose-50 text-rose-600 rounded-xl p-2 flex items-center justify-center shrink-0">
                <Trash className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">Hapus Kategori Keuangan?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin mendelete kategori <strong className="text-slate-800">"{deleteTarget}"</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-55">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        MODAL 2: WARNING DIALOG (WHEN TRYING TO TOUCH PROTECTED SYSTEM CATEGORIES)
      */}
      {systemWarningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSystemWarningTarget(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 z-10 overflow-hidden transform transition-all">
            <div className="flex items-start gap-3">
              <div className="bg-amber-50 text-amber-600 rounded-xl p-2.5 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">Kategori Sistem Dilindungi</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Kategori bawaan <strong className="text-slate-800">"{systemWarningTarget}"</strong> merupakan data referensi internal sistem. Demi menjaga keutuhan visual grafik dan rekapitulasi data, kategori bawaan sistem dilarang keras untuk dimodifikasi atau dihapus.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-50">
              <button
                onClick={() => setSystemWarningTarget(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
