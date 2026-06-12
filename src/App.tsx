import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { 
  X, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Settings as SettingsIcon,
  HelpCircle,
  Database
} from 'lucide-react';
import { Transaction, DbConfig, ActiveTab, UserSim } from './types';

// Importing Custom Modular Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import ChartsSection from './components/ChartsSection';
import TransactionsTable from './components/TransactionsTable';
import AddTransactionView from './components/AddTransactionView';
import ReportsView from './components/ReportsView';
import CategoriesView from './components/CategoriesView';
import SettingsView from './components/SettingsView';
import PhpLoginSimulation from './components/PhpLoginSimulation';
import UsersView from './components/UsersView';

// PHP Code Templates
import { 
  getKoneksiCode, 
  getSqlSchema, 
  INDEX_PHP, 
  LOGIN_PHP,
  LOGOUT_PHP,
  TAMBAH_PHP, 
  EDIT_PHP, 
  HAPUS_PHP, 
  README_CPANEL,
  KELOLA_USER_PHP,
  TAMBAH_USER_PHP,
  EDIT_USER_PHP,
  HAPUS_USER_PHP,
  SIDEBAR_PHP,
  PENGATURAN_PHP,
  LAPORAN_PHP
} from './php-templates';

// Primary default transactions history
const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: '1', tanggal: '2026-05-23', keterangan: 'Gaji Bulanan Utama', jenis: 'pemasukan', jumlah: 10000000, kategori: 'Gaji' },
  { id: '2', tanggal: '2026-05-23', keterangan: 'Belanja Sayur & Sembako', jenis: 'pengeluaran', jumlah: 1250000, kategori: 'Belanja' },
  { id: '3', tanggal: '2026-05-22', keterangan: 'Bensin Motor Matic', jenis: 'pengeluaran', jumlah: 50000, kategori: 'Transportasi' },
  { id: '4', tanggal: '2026-05-21', keterangan: 'Freelance Desain Logo Brand', jenis: 'pemasukan', jumlah: 2500000, kategori: 'Freelance' },
  { id: '5', tanggal: '2026-05-21', keterangan: 'Makan Nasi Padang Siang', jenis: 'pengeluaran', jumlah: 25000, kategori: 'Makan & Minum' },
  { id: '6', tanggal: '2026-05-18', keterangan: 'Bayar Tagihan Wi-Fi', jenis: 'pengeluaran', jumlah: 150000, kategori: 'Tagihan' }
];

const DEFAULT_CATEGORIES = [
  'Gaji', 'Belanja', 'Transportasi', 'Makan & Minum', 'Tagihan', 'Freelance', 'Lainnya'
];

export default function App() {
  // --- Persistent Storage State Initializers ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('keuangan_transactions');
    return saved ? JSON.parse(saved) : DUMMY_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('keuangan_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [dbConfig, setDbConfig] = useState<DbConfig>(() => {
    const saved = localStorage.getItem('keuangan_db_config');
    return saved ? JSON.parse(saved) : {
      host: 'localhost',
      user: 'u1234567_dbuser',
      pass: 'database_secret',
      name: 'u1234567_keuangan_db'
    };
  });

  // --- Dynamic Branding Customize States ---
  const [appName, setAppName] = useState<string>(() => {
    return localStorage.getItem('keuangan_app_name') || 'KeuanganKu';
  });

  const [appLogo, setAppLogo] = useState<string>(() => {
    return localStorage.getItem('keuangan_app_logo') || 'Wallet';
  });

  const [appLogoColor, setAppLogoColor] = useState<string>(() => {
    return localStorage.getItem('keuangan_app_logo_color') || 'blue';
  });

  const [dashboardHeaderTitle, setDashboardHeaderTitle] = useState<string>(() => {
    return localStorage.getItem('keuangan_dashboard_title') || 'Halo, Administrator 👋';
  });

  const [dashboardHeaderSubtitle, setDashboardHeaderSubtitle] = useState<string>(() => {
    return localStorage.getItem('keuangan_dashboard_subtitle') || 'Kelola arus kas, unduh laporan, dan sinkronkan database secara realtime dengan aman.';
  });

  // --- UI Routing Navigation State ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('keuangan_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // --- Selected source codes simulation state ---
  const [selectedFile, setSelectedFile] = useState<string>('koneksi.php');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // --- Modal Edit state ---
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editError, setEditError] = useState('');

  // --- Zip compilation loading states ---
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // --- Persistent User Management ---
  const [usersSim, setUsersSim] = useState<UserSim[]>(() => {
    const saved = localStorage.getItem('keuangan_users_sim');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((u: any) => ({
          ...u,
          status: u.status || 'approved',
          password: u.password || 'admin123'
        }));
      } catch (e) {
        // Fallback
      }
    }
    // Start completely empty to allow testing "pendaftar pertama = superadmin" rule
    return [];
  });

  const [currentUser, setCurrentUser] = useState<UserSim>(() => {
    const saved = localStorage.getItem('keuangan_current_user_sim');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          status: parsed.status || 'approved',
          password: parsed.password || 'admin123'
        };
      } catch (e) {}
    }
    return { id: '', username: '', nama: '', role: 'admin', password: '', status: 'pending' };
  });

  // --- PHP Login simulation session state ---
  const [isLoggedInSim, setIsLoggedInSim] = useState<boolean>(() => {
    const saved = localStorage.getItem('keuangan_is_logged_in_sim');
    return saved === 'true'; // defaults to false to activate the login page
  });

  // --- Synchronize state changes to Local Storage ---
  useEffect(() => {
    localStorage.setItem('keuangan_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('keuangan_users_sim', JSON.stringify(usersSim));
  }, [usersSim]);

  useEffect(() => {
    localStorage.setItem('keuangan_current_user_sim', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('keuangan_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('keuangan_db_config', JSON.stringify(dbConfig));
  }, [dbConfig]);

  useEffect(() => {
    localStorage.setItem('keuangan_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('keuangan_app_name', appName);
  }, [appName]);

  useEffect(() => {
    localStorage.setItem('keuangan_app_logo', appLogo);
  }, [appLogo]);

  useEffect(() => {
    localStorage.setItem('keuangan_app_logo_color', appLogoColor);
  }, [appLogoColor]);

  useEffect(() => {
    localStorage.setItem('keuangan_dashboard_title', dashboardHeaderTitle);
  }, [dashboardHeaderTitle]);

  useEffect(() => {
    localStorage.setItem('keuangan_dashboard_subtitle', dashboardHeaderSubtitle);
  }, [dashboardHeaderSubtitle]);

  // --- Price rupiah converter currency helper ---
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka);
  };

  // --- Action Handlers ---
  const handleAddTransaction = (newTx: {
    tanggal: string;
    jenis: 'pemasukan' | 'pengeluaran';
    kategori: string;
    jumlah: number;
    keterangan: string;
  }) => {
    const tx: Transaction = {
      id: String(Date.now()),
      ...newTx
    };
    setTransactions([tx, ...transactions]);
    setActiveTab('dashboard'); // Redirect to dashboard after insert
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    if (!editingTransaction.tanggal || !editingTransaction.keterangan || !editingTransaction.jumlah || !editingTransaction.kategori) {
      setEditError('Harap lengkapi semua kolom formulir data!');
      return;
    }

    if (editingTransaction.jumlah <= 0) {
      setEditError('Nilai nominal uang wajib lebih besar dari 0!');
      return;
    }

    setTransactions(transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t));
    setEditingTransaction(null);
    setEditError('');
  };

  const handleDeleteTransaction = (id: string, keterangan: string) => {
    if (confirm(`Apakah Anda yakin ingin mendelete data transaksi "${keterangan}"?`)) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleAddUser = (username: string, nama: string, role: 'admin' | 'superadmin' | 'user', password?: string) => {
    const newUser: UserSim = {
      id: Date.now().toString(),
      username,
      nama,
      role,
      password: password || 'admin123',
      status: 'approved'
    };
    setUsersSim([...usersSim, newUser]);
  };

  const handleUpdateUser = (id: string, username: string, nama: string, role: 'admin' | 'superadmin' | 'user', password?: string, status?: 'pending' | 'approved') => {
    setUsersSim(usersSim.map(u => u.id === id ? { 
      ...u, 
      username, 
      nama, 
      role,
      ...(password ? { password } : {}),
      ...(status ? { status } : {})
    } : u));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ 
        ...prev, 
        username, 
        nama, 
        role,
        ...(status ? { status } : {})
      }));
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsersSim(usersSim.filter(u => u.id !== id));
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin me-restore catatan transaksi bawaan? Ini akan menghapus data simulasi saat ini.')) {
      setTransactions(DUMMY_TRANSACTIONS);
      setCategories(DEFAULT_CATEGORIES);
      setUsersSim([
        { id: '1', username: 'admin', nama: 'Administrator Keuangan', role: 'superadmin' },
        { id: '2', username: 'budi', nama: 'Budi Santoso', role: 'admin' }
      ]);
      setCurrentUser({ id: '1', username: 'admin', nama: 'Administrator Keuangan', role: 'superadmin' });
      setDbConfig({
        host: 'localhost',
        user: 'u1234567_dbuser',
        pass: 'database_secret',
        name: 'u1234567_keuangan_db'
      });
      alert('Data simulasi berhasil dikembalikan ke pengaturan bawaan!');
    }
  };

  const getReplacedPhpTemplate = (content: string) => {
    if (!content) return '';
    return content.replace(/KeuanganKu/g, appName);
  };

  // Retrieve code content dynamically based on selector tab item
  const getSelectedCodeContent = () => {
    let rawContent = '';
    switch (selectedFile) {
      case 'koneksi.php':
        rawContent = getKoneksiCode(dbConfig);
        break;
      case 'db.sql':
        rawContent = getSqlSchema(dbConfig);
        break;
      case 'index.php':
        rawContent = INDEX_PHP;
        break;
      case 'laporan.php':
        rawContent = LAPORAN_PHP;
        break;
      case 'login.php':
        rawContent = LOGIN_PHP;
        break;
      case 'logout.php':
        rawContent = LOGOUT_PHP;
        break;
      case 'tambah.php':
        rawContent = TAMBAH_PHP;
        break;
      case 'edit.php':
        rawContent = EDIT_PHP;
        break;
      case 'hapus.php':
        rawContent = HAPUS_PHP;
        break;
      case 'kelola_user.php':
        rawContent = KELOLA_USER_PHP;
        break;
      case 'tambah_user.php':
        rawContent = TAMBAH_USER_PHP;
        break;
      case 'edit_user.php':
        rawContent = EDIT_USER_PHP;
        break;
      case 'hapus_user.php':
        rawContent = HAPUS_USER_PHP;
        break;
      case 'sidebar.php':
        rawContent = SIDEBAR_PHP;
        break;
      case 'pengaturan.php':
        rawContent = PENGATURAN_PHP;
        break;
      case 'README.md':
        rawContent = README_CPANEL;
        break;
      default:
        rawContent = '';
    }
    return getReplacedPhpTemplate(rawContent);
  };

  const handleCopyCode = () => {
    const content = getSelectedCodeContent();
    navigator.clipboard.writeText(content);
    setCopiedFile(selectedFile);
    setTimeout(() => {
      setCopiedFile(null);
    }, 2000);
  };

  const handleDownloadZip = () => {
    setIsZipping(true);
    setZipSuccess(false);

    const zip = new JSZip();
    
    // Construct dynamic configuration dependencies and apply app name
    const koneksiCode = getReplacedPhpTemplate(getKoneksiCode(dbConfig));
    const sqlSchema = getReplacedPhpTemplate(getSqlSchema(dbConfig));

    // Append standard core system files
    zip.file('koneksi.php', koneksiCode);
    zip.file('db.sql', sqlSchema);
    zip.file('index.php', getReplacedPhpTemplate(INDEX_PHP));
    zip.file('laporan.php', getReplacedPhpTemplate(LAPORAN_PHP));
    zip.file('login.php', getReplacedPhpTemplate(LOGIN_PHP));
    zip.file('logout.php', getReplacedPhpTemplate(LOGOUT_PHP));
    zip.file('tambah.php', getReplacedPhpTemplate(TAMBAH_PHP));
    zip.file('edit.php', getReplacedPhpTemplate(EDIT_PHP));
    zip.file('hapus.php', getReplacedPhpTemplate(HAPUS_PHP));
    zip.file('kelola_user.php', getReplacedPhpTemplate(KELOLA_USER_PHP));
    zip.file('tambah_user.php', getReplacedPhpTemplate(TAMBAH_USER_PHP));
    zip.file('edit_user.php', getReplacedPhpTemplate(EDIT_USER_PHP));
    zip.file('hapus_user.php', getReplacedPhpTemplate(HAPUS_USER_PHP));
    zip.file('sidebar.php', getReplacedPhpTemplate(SIDEBAR_PHP));
    zip.file('pengaturan.php', getReplacedPhpTemplate(PENGATURAN_PHP));
    zip.file('README.md', getReplacedPhpTemplate(README_CPANEL));

    // Compile into blob payload and trigger anchor injection download
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(content);
      element.download = 'pendataan-keuangan-php-cpanel.zip';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setIsZipping(false);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    }).catch(err => {
      console.error(err);
      setIsZipping(false);
    });
  };

  if (!isLoggedInSim) {
    return (
      <PhpLoginSimulation
        appName={appName}
        appLogo={appLogo}
        appLogoColor={appLogoColor}
        users={usersSim}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedInSim(true);
          localStorage.setItem('keuangan_is_logged_in_sim', 'true');
        }}
        onRegisterUser={(username, nama, password) => {
          const isFirst = usersSim.length === 0;
          const newUser: UserSim = {
            id: Date.now().toString(),
            username,
            nama,
            role: isFirst ? 'superadmin' : 'admin',
            password: password || 'admin123',
            status: isFirst ? 'approved' : 'pending'
          };
          setUsersSim([...usersSim, newUser]);
        }}
        onClearDb={() => {
          localStorage.removeItem('keuangan_users_sim');
          localStorage.removeItem('keuangan_current_user_sim');
          localStorage.removeItem('keuangan_is_logged_in_sim');
          setUsersSim([]);
          setIsLoggedInSim(false);
          setCurrentUser({ id: '', username: '', nama: '', role: 'admin', password: '', status: 'pending' });
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        handleDownloadZip={handleDownloadZip}
        isZipping={isZipping}
        zipSuccess={zipSuccess}
        appName={appName}
        appLogo={appLogo}
        appLogoColor={appLogoColor}
        currentUser={currentUser}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Dynamic header row wrapper */}
        <Header 
          setIsMobileOpen={setIsMobileMenuOpen} 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          currentUser={currentUser}
          onLogoutSim={() => {
            setIsLoggedInSim(false);
            localStorage.setItem('keuangan_is_logged_in_sim', 'false');
          }}
        />

        {/* Dynamic Main Body with responsive scrolls */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-slide-in">
                  {/* Dynamic Custom Dashboard Banner */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between group">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      appLogoColor === 'emerald' ? 'bg-emerald-500' :
                      appLogoColor === 'indigo' ? 'bg-indigo-650' :
                      appLogoColor === 'rose' ? 'bg-rose-500' :
                      appLogoColor === 'amber' ? 'bg-amber-505' :
                      appLogoColor === 'violet' ? 'bg-violet-605' :
                      'bg-blue-600'
                    }`}></div>
                    
                    <div className="space-y-1">
                      <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight font-sans">
                        {dashboardHeaderTitle}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-4xl">
                        {dashboardHeaderSubtitle}
                      </p>
                    </div>
                  </div>

                  {/* Financial Stats Display Cards */}
                  <StatsCards 
                    transactions={transactions} 
                    formatRupiah={formatRupiah} 
                  />

                  {/* Dual Chart widgets (Bar & Circle) */}
                  <ChartsSection 
                    transactions={transactions} 
                    formatRupiah={formatRupiah} 
                  />

                  {/* Recent table data list (max 5) */}
                  <TransactionsTable 
                    transactions={transactions}
                    categories={categories}
                    onEdit={setEditingTransaction}
                    onDelete={handleDeleteTransaction}
                    onAddClick={() => {
                      setActiveTab('transactions');
                      setIsAddFormOpen(true);
                    }}
                    formatRupiah={formatRupiah}
                    isDashboardView={true}
                    onTabChange={(tab) => setActiveTab(tab)}
                  />
                </div>
              )}

              {/* TAB 2: TRANSACTIONS HISTORY LIST */}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  {isAddFormOpen && (
                    <AddTransactionView 
                      categories={categories}
                      onAddTransaction={(tx) => {
                        handleAddTransaction(tx);
                        setIsAddFormOpen(false);
                      }}
                      onCancel={() => setIsAddFormOpen(false)}
                    />
                  )}
                  <TransactionsTable 
                    transactions={transactions}
                    categories={categories}
                    onEdit={setEditingTransaction}
                    onDelete={handleDeleteTransaction}
                    onAddClick={() => setIsAddFormOpen(!isAddFormOpen)}
                    formatRupiah={formatRupiah}
                  />
                </div>
              )}

              {/* TAB 4: REPORTS SUMMARY DETAIL */}
              {activeTab === 'reports' && (
                <ReportsView 
                  transactions={transactions} 
                  formatRupiah={formatRupiah} 
                />
              )}

              {/* TAB 5: MANAGE CATEGORIES LIST */}
              {activeTab === 'categories' && (
                <CategoriesView 
                  categories={categories} 
                  setCategories={setCategories} 
                />
              )}

              {/* TAB 6: SETTINGS CONFIGURATION */}
              {activeTab === 'settings' && (
                <SettingsView 
                  dbConfig={dbConfig}
                  setDbConfig={setDbConfig}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  copiedFile={copiedFile}
                  onCopy={handleCopyCode}
                  codeContent={getSelectedCodeContent()}
                  onDownloadZip={handleDownloadZip}
                  isZipping={isZipping}
                  zipSuccess={zipSuccess}
                  onResetData={handleResetData}
                  appName={appName}
                  setAppName={setAppName}
                  appLogo={appLogo}
                  setAppLogo={setAppLogo}
                  appLogoColor={appLogoColor}
                  setAppLogoColor={setAppLogoColor}
                  dashboardHeaderTitle={dashboardHeaderTitle}
                  setDashboardHeaderTitle={setDashboardHeaderTitle}
                  dashboardHeaderSubtitle={dashboardHeaderSubtitle}
                  setDashboardHeaderSubtitle={setDashboardHeaderSubtitle}
                />
              )}

              {/* TAB 7: MANAGE SIMULATED USERS & ROLES */}
              {activeTab === 'users' && (
                <UsersView 
                  users={usersSim}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  currentUser={currentUser}
                  appLogoColor={appLogoColor}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info ribbon */}
        <div className="bg-white border-t border-gray-150 py-3.5 px-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2 select-none shrink-0 font-semibold font-sans">
          <span>Simulasi Dashboard &copy; {new Date().getFullYear()} {appName} Inc. All rights reserved.</span>
          <div className="flex items-center gap-1.5 text-blue-600">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Deployment cPanel Hosting support: PHP v7.4 - v8.3 + MySQLi</span>
          </div>
        </div>
      </div>


      {/* --- SEAMLESS EDIT TRANSACTION DIALOG MODAL --- */}
      <AnimatePresence>
        {editingTransaction && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="edit-transaction-modal">
            {/* Backdrop effect */}
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
              onClick={() => setEditingTransaction(null)}
            />
            
            {/* Dialog centering container */}
            <div className="flex min-h-screen items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-150/80 p-6 space-y-4"
              >
                {/* Modal close icon */}
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-extrabold text-slate-800 font-sans">
                    Ubah Detail Data Transaksi
                  </h3>
                </div>

                {editError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-px" />
                    <span>{editError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateTransaction} className="space-y-4">
                  
                  {/* Select parameters */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={editingTransaction.tanggal}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, tanggal: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Jenis toggle */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Jenis Transaksi
                    </label>
                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={() => setEditingTransaction({ ...editingTransaction, jenis: 'pemasukan' })}
                        className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          editingTransaction.jenis === 'pemasukan'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                        Pemasukan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTransaction({ ...editingTransaction, jenis: 'pengeluaran' })}
                        className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          editingTransaction.jenis === 'pengeluaran'
                            ? 'bg-rose-50 border-rose-500 text-rose-800 font-extrabold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        Pengeluaran
                      </button>
                    </div>
                  </div>

                  {/* Kategori choose option */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Kategori
                    </label>
                    <select
                      value={editingTransaction.kategori || 'Gaji'}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, kategori: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                    >
                      {categories.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Value */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Jumlah Uang (Rp)
                    </label>
                    <input
                      type="number"
                      value={editingTransaction.jumlah}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, jumlah: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Descriptions */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Keterangan
                    </label>
                    <textarea
                      rows={2}
                      value={editingTransaction.keterangan}
                      onChange={(e) => setEditingTransaction({ ...editingTransaction, keterangan: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Buttons logic */}
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingTransaction(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow-lg hover:scale-98"
                    >
                      Simpan Perubahan
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
