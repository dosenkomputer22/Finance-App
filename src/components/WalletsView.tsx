import React, { useState } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  Trash, 
  Check, 
  X, 
  Building2, 
  CreditCard, 
  Smartphone, 
  Briefcase, 
  CircleDollarSign, 
  AlertCircle, 
  AlertTriangle,
  PiggyBank, 
  Edit3
} from 'lucide-react';
import { Wallet as WalletType, Transaction, UserSim } from '../types';

interface WalletsViewProps {
  wallets: WalletType[];
  setWallets: React.Dispatch<React.SetStateAction<WalletType[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currentUser?: UserSim;
}

export default function WalletsView({ 
  wallets, 
  setWallets, 
  transactions, 
  setTransactions,
  currentUser 
}: WalletsViewProps) {
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState<number>(0);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit State
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState<number>(0);

  // Custom action dialogs (instead of window.alert/confirm)
  const [deleteTarget, setDeleteTarget] = useState<WalletType | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const userRole = currentUser?.role ?? 'superadmin';

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const getWalletStats = (walletName: string, initialBalance: number) => {
    const totalIn = transactions
      .filter((t) => t.dompet === walletName && t.jenis === 'pemasukan')
      .reduce((sum, t) => sum + t.jumlah, 0);
    
    const totalOut = transactions
      .filter((t) => t.dompet === walletName && t.jenis === 'pengeluaran')
      .reduce((sum, t) => sum + t.jumlah, 0);
    
    return {
      totalIn,
      totalOut,
      currentBalance: initialBalance + totalIn - totalOut
    };
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (userRole === 'user') {
      setError('Akses Ditolak: Peran "user" tidak diizinkan membuat dompet/rekening.');
      return;
    }

    const trimmedName = newWalletName.trim();
    if (!trimmedName) {
      setError('Nama dompet tidak boleh kosong!');
      return;
    }

    if (wallets.some((w) => w.nama.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`Dompet "${trimmedName}" sudah terdaftar.`);
      return;
    }

    const newId = String(wallets.length > 0 ? Math.max(...wallets.map(w => Number(w.id))) + 1 : 1);
    const newW: WalletType = {
      id: newId,
      nama: trimmedName,
      saldo_awal: newWalletBalance
    };

    setWallets([...wallets, newW]);
    setSuccess(`Dompet "${trimmedName}" berhasil ditambahkan!`);
    setNewWalletName('');
    setNewWalletBalance(0);

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditInit = (w: WalletType) => {
    if (userRole === 'user') {
      setError('Akses Ditolak: Peran "user" tidak diizinkan mengubah dompet/rekening.');
      return;
    }
    setEditingWallet(w);
    setEditName(w.nama);
    setEditBalance(w.saldo_awal);
    setError('');
    setSuccess('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    setError('');
    setSuccess('');

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setError('Nama dompet tidak boleh kosong!');
      return;
    }

    if (editingWallet.nama === 'Tunai' && trimmedName !== 'Tunai') {
      setError('Nama dompet utama "Tunai" dilindungi sistem.");');
      return;
    }

    if (
      wallets.some(
        (w) => w.id !== editingWallet.id && w.nama.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setError(`Nama dompet "${trimmedName}" sudah digunakan oleh rekening lain.`);
      return;
    }

    // Cascade name update down to transactions
    if (editingWallet.nama !== trimmedName) {
      const updatedTx = transactions.map((t) => {
        if (t.dompet === editingWallet.nama) {
          return { ...t, dompet: trimmedName };
        }
        return t;
      });
      setTransactions(updatedTx);
    }

    // Update wallet
    const updatedWallets = wallets.map((w) => {
      if (w.id === editingWallet.id) {
        return { ...w, nama: trimmedName, saldo_awal: editBalance };
      }
      return w;
    });

    setWallets(updatedWallets);
    setSuccess(`Dompet "${trimmedName}" berhasil disimpan!`);
    setEditingWallet(null);

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteRequest = (w: WalletType) => {
    if (userRole === 'user') {
      setError('Akses Ditolak: Peran "user" tidak diizinkan menghapus dompet/rekening.');
      return;
    }
    if (w.nama === 'Tunai') {
      setError('Dompet dasar "Tunai" dilindungi dan tidak boleh dihapus.');
      return;
    }

    // Check if there are simulated transactions referencing this wallet
    const hasTransactions = transactions.some((t) => t.dompet === w.nama);
    if (hasTransactions) {
      setWarningMessage(
        `Gagal menghapus: Rekening "${w.nama}" masih memiliki transaksi berjalan terikat. Silakan ubah atau hapus transaksi tersebut terlebih dahulu.`
      );
      return;
    }

    setDeleteTarget(w);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setWallets(wallets.filter((w) => w.id !== deleteTarget.id));
      setSuccess(`Rekening dan dompet "${deleteTarget.nama}" berhasil dihapus.`);
      setDeleteTarget(null);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const getBranding = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes('bca') || norm.includes('bank bca')) {
      return {
        leftBorder: 'border-l-4 border-blue-800',
        badgeBg: 'bg-blue-900/10 text-blue-800',
        icon: Building2,
        logoColorText: 'text-blue-800'
      };
    }
    if (norm.includes('ovo')) {
      return {
        leftBorder: 'border-l-4 border-purple-600',
        badgeBg: 'bg-purple-50 text-purple-700',
        icon: Smartphone,
        logoColorText: 'text-purple-700'
      };
    }
    if (norm.includes('gopay')) {
      return {
        leftBorder: 'border-l-4 border-cyan-500',
        badgeBg: 'bg-cyan-50 text-cyan-700',
        icon: Smartphone,
        logoColorText: 'text-cyan-700'
      };
    }
    if (norm === 'tunai') {
      return {
        leftBorder: 'border-l-4 border-emerald-500',
        badgeBg: 'bg-emerald-50 text-emerald-700',
        icon: CircleDollarSign,
        logoColorText: 'text-emerald-700'
      };
    }
    if (norm.includes('kas')) {
      return {
        leftBorder: 'border-l-4 border-amber-500',
        badgeBg: 'bg-amber-50 text-amber-700',
        icon: Briefcase,
        logoColorText: 'text-amber-700'
      };
    }
    return {
      leftBorder: 'border-l-4 border-slate-400',
      badgeBg: 'bg-slate-100 text-slate-800',
      icon: CreditCard,
      logoColorText: 'text-slate-800'
    };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner Area */}
      <div className="bg-white p-5 border border-gray-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base font-sans">
              Manajemen Rekening & Dompet
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-px">
              Kelola penyimpanan terpisah (Kas, Bank, E-Wallet) dan pantau saldo berjalan masing-masing.
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1.2 rounded-full font-bold uppercase tracking-wider font-mono">
            {wallets.length} Akun Penyimpanan
          </span>
        </div>
      </div>

      {/* Alert Notices */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-semibold">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-rose-600 hover:text-rose-950 font-bold">X</button>
        </div>
      )}

      {warningMessage && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs p-3.5 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-600" />
          <div className="flex-grow">
            <span className="font-semibold block">{warningMessage}</span>
          </div>
          <button 
            onClick={() => setWarningMessage(null)} 
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 rounded-lg px-2.5 py-1 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Grid Layout Form and Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CREATE FORMS (4 cols) */}
        {userRole !== 'user' && (
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-xs">
              <h4 className="font-extrabold text-slate-800 text-sm mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                Tambah Dompet Baru
              </h4>
              <form onSubmit={handleAddWallet} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 font-mono">
                    Nama Dompet / Rekening
                  </label>
                  <input 
                    type="text" 
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    placeholder="E.g. Bank Mandiri, Gopay, Kas Kantor"
                    className="w-full text-xs font-bold p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 font-mono">
                    Saldo Awal (Rp)
                  </label>
                  <input 
                    type="number" 
                    value={newWalletBalance}
                    onChange={(e) => setNewWalletBalance(Number(e.target.value))}
                    min="0"
                    placeholder="0"
                    className="w-full text-xs font-bold p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors"
                >
                  Daftarkan Akun
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ACCOUNT LIST (8 cols or 12 cols if user role) */}
        <div className={`${userRole !== 'user' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">
            Akun Rekening Terdaftar & Saldo Berjalan
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map((w) => {
              const stats = getWalletStats(w.nama, w.saldo_awal);
              const customBrand = getBranding(w.nama);
              const CustomIcon = customBrand.icon;

              return (
                <div 
                  key={w.id} 
                  className={`bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:translate-y-[-2px] ${customBrand.leftBorder}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase font-mono ${customBrand.badgeBg}`}>
                        <CustomIcon className="w-3.5 h-3.5 shrink-0" />
                        {w.nama}
                      </span>

                      {/* Dropdown / Action menu simulation */}
                      {w.nama !== 'Tunai' && userRole !== 'user' && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEditInit(w)}
                            className="p-1 px-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Dompet"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(w)}
                            className="p-1 px-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus Dompet"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                        Saldo Terkini / Berjalan
                      </span>
                      <h3 className={`text-xl font-extrabold mt-0.5 font-mono ${stats.currentBalance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {formatRupiah(stats.currentBalance)}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-1 text-slate-500 text-[11px] font-semibold">
                      <div className="flex justify-between">
                        <span>Saldo Awal:</span>
                        <span className="font-mono text-slate-700">{formatRupiah(w.saldo_awal)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600/90">
                        <span>Pemasukan (+):</span>
                        <span className="font-mono font-medium">+{formatRupiah(stats.totalIn)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600/90">
                        <span>Pengeluaran (-):</span>
                        <span className="font-mono font-medium">-{formatRupiah(stats.totalOut)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Edit Wallet Modal Popup Overlay */}
      {editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setEditingWallet(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              Ubah Informasi Rekening
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 font-mono">
                  Nama Dompet / Rekening
                </label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={editingWallet.nama === 'Tunai'}
                  className="w-full text-xs font-bold p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  required
                />
                {editingWallet.nama === 'Tunai' && (
                  <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                    Nama akun 'Tunai' bersifat global protektif.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 font-mono">
                  Saldo Awal (Rp)
                </label>
                <input 
                  type="number" 
                  value={editBalance}
                  onChange={(e) => setEditBalance(Number(e.target.value))}
                  min="0"
                  className="w-full text-xs font-bold p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingWallet(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <h3 className="font-extrabold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Hapus Akun Penyimpanan?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-5">
              Apakah Anda yakin ingin menghapus rekening <strong className="text-slate-800 font-bold">"{deleteTarget.nama}"</strong> permanent? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-2">
              <button 
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
