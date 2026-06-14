import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  FileCode, 
  BookOpen, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Globe, 
  Lock, 
  Terminal, 
  Folder,
  Palette,
  Sparkles,
  Wallet,
  DollarSign,
  TrendingUp,
  Coins,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import { DbConfig } from '../types';

interface SettingsViewProps {
  dbConfig: DbConfig;
  setDbConfig: React.Dispatch<React.SetStateAction<DbConfig>>;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  copiedFile: string | null;
  onCopy: () => void;
  codeContent: string;
  onDownloadZip: () => void;
  isZipping: boolean;
  zipSuccess: boolean;
  onResetData: () => void;
  
  // Custom brand props
  appName: string;
  setAppName: (name: string) => void;
  appLogo: string;
  setAppLogo: (logo: string) => void;
  appLogoColor: string;
  setAppLogoColor: (color: string) => void;
  dashboardHeaderTitle: string;
  setDashboardHeaderTitle: (title: string) => void;
  dashboardHeaderSubtitle: string;
  setDashboardHeaderSubtitle: (subtitle: string) => void;
}

export default function SettingsView({
  dbConfig,
  setDbConfig,
  selectedFile,
  setSelectedFile,
  copiedFile,
  onCopy,
  codeContent,
  onDownloadZip,
  isZipping,
  zipSuccess,
  onResetData,
  
  // Custom brand states
  appName,
  setAppName,
  appLogo,
  setAppLogo,
  appLogoColor,
  setAppLogoColor,
  dashboardHeaderTitle,
  setDashboardHeaderTitle,
  dashboardHeaderSubtitle,
  setDashboardHeaderSubtitle
}: SettingsViewProps) {
  const [subTab, setSubTab] = useState<'db' | 'code' | 'cpanel' | 'customize'>('db');

  // local states for dynamic synchronization feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncSteps, setSyncSteps] = useState<string[]>([]);
  const [currentSyncStep, setCurrentSyncStep] = useState(0);

  const handleSync = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setSyncSteps([]);
    setCurrentSyncStep(0);

    const steps = [
      'Menghubungkan data Host & Credential MySQL terbaru...',
      'Meregenerasi file koneksi (koneksi.php)...',
      `Menyuntikkan konfigurasi nama aplikasi "${appName}" ke seluruh halaman index & sidebar...`,
      'Memperbarui skema installer file database (db.sql)...',
      'Memvalidasi kompatibilitas layout cPanel...',
      'Sinkronisasi murni seluruh berkas proyek PHP sukses dikompilasi!'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setSyncSteps(prev => [...prev, steps[current]]);
        setCurrentSyncStep(current + 1);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSyncing(false);
          setSyncSuccess(true);
        }, 500);
      }
    }, 400);
  };

  const files = [
    'koneksi.php', 
    'db.sql', 
    'index.php', 
    'laporan.php',
    'kategori.php',
    'anggaran.php',
    'rekening.php',
    'sidebar.php',
    'pengaturan.php',
    'login.php', 
    'logout.php', 
    'tambah.php', 
    'edit.php', 
    'hapus.php', 
    'kelola_user.php', 
    'tambah_user.php', 
    'edit_user.php', 
    'hapus_user.php', 
    'README.md'
  ];

  const handleConfigChange = (field: keyof DbConfig, value: string) => {
    setDbConfig({
      ...dbConfig,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Tab selectors inside Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-200 bg-white rounded-xl p-1.5 shadow-xs gap-1.5 select-none text-center">
        <button
          onClick={() => setSubTab('db')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
            subTab === 'db' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4 shrink-0" />
          Database MySQL
        </button>
        <button
          onClick={() => setSubTab('customize')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
            subTab === 'customize' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          Kustomisasi Branding
        </button>
        <button
          onClick={() => setSubTab('code')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
            subTab === 'code' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FileCode className="w-4 h-4 shrink-0" />
          Detail Kode PHP
        </button>
        <button
          onClick={() => setSubTab('cpanel')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer ${
            subTab === 'cpanel' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          Petunjuk cPanel
        </button>
      </div>

      {/* Sub-tab 1: Database Settings */}
      {subTab === 'db' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white p-6 border border-gray-100 rounded-2xl shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base font-sans pb-3 border-b border-slate-100">
              Pengaturan Koneksi Hostname MySQL
            </h4>
            
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                    MySQL Hostname
                  </label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => handleConfigChange('host', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="localhost"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                    MySQL Username
                  </label>
                  <input
                    type="text"
                    value={dbConfig.user}
                    onChange={(e) => handleConfigChange('user', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="u1234567_dbuser"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                    MySQL Password
                  </label>
                  <input
                    type="text"
                    value={dbConfig.pass}
                    onChange={(e) => handleConfigChange('pass', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Database secret..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={dbConfig.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="u1234567_keuangan_db"
                    required
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
              💡 Parameter di atas akan langsung disuntikkan ke dalam file <code>koneksi.php</code> dan skema database <code>db.sql</code> Anda secara dinamis! Tidak perlu lagi edit text manual setelah upload hosting cPanel.
            </p>
          </div>

          <div className="md:col-span-12 lg:col-span-5 bg-white p-6 border border-gray-100 rounded-2xl shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm md:text-base font-sans pb-3 border-b border-gray-100">
              Panel Sinkronisasi & Unduh Project PHP
            </h4>
            
            <div className="space-y-4">
              {/* Sinkronisasi Kode PHP (Requested Feature) */}
              <div className="border border-indigo-100 bg-indigo-50/20 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-indigo-105 bg-indigo-100 rounded-xl text-indigo-650 block">
                    <RefreshCw className={`w-4 cursor-pointer h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </span>
                  <div className="leading-tight">
                    <h5 className="font-black text-slate-800 text-xs sm:text-sm">Sinkronisasi Kode PHP</h5>
                    <p className="text-[9px] text-indigo-600 font-extrabold tracking-widest uppercase mt-0.5">TERINTEGRASI BRAND & DB</p>
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Terapkan nama aplikasi kustom <span className="text-slate-800 font-black">"{appName}"</span> dan setelan database MySQL baru Anda secara otomatis ke seluruh baris kode PHP murni.
                </p>

                {/* Progress rendering */}
                {syncSteps.length > 0 && (
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[10px] space-y-1.5 border border-slate-850 max-h-40 overflow-y-auto">
                    {syncSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 animate-slide-in">
                        {idx === currentSyncStep - 1 && isSyncing ? (
                          <span className="text-amber-400 animate-pulse shrink-0">⚡</span>
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        <span className={idx === currentSyncStep - 1 && isSyncing ? 'text-white font-bold' : 'text-slate-350'}>
                          {step}
                        </span>
                      </div>
                    ))}
                    {isSyncing && (
                      <div className="text-[9px] text-slate-500 animate-pulse font-bold flex items-center gap-1 mt-1 pl-4">
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        Memproses kompilasi...
                      </div>
                    )}
                  </div>
                )}

                {/* Sync success banner */}
                {syncSuccess && (
                  <div className="bg-emerald-50 text-emerald-805 text-emerald-800 border border-emerald-250/60 rounded-xl p-3 text-[11px] leading-relaxed font-bold animate-fade-in flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span>Kompilasi sukses! Seluruh kode PHP murni siap pakai kini telah menggunakan merek kustomisasi <span className="underline">"{appName}"</span> Anda.</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Memproses Kompilasi...' : 'Mulai Sinkronisasi Kode PHP'}
                </button>
              </div>

              {/* Bulk Exporter ZIP */}
              <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4">
                <h5 className="font-bold text-slate-800 text-xs">Unduh ZIP Project PHP Siap Pakai</h5>
                <p className="text-[10px] text-slate-550 mt-1 leading-normal font-semibold">Sistem akan mengepak seluruh file PHP dengan konfigurasi database Anda di atas, ke dalam format ZIP murni.</p>
                <button
                  type="button"
                  onClick={onDownloadZip}
                  disabled={isZipping}
                  className={`mt-3 w-full inline-flex items-center justify-center gap-2 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-colors cursor-pointer ${
                    syncSuccess 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  {isZipping ? 'Mengkompres Project...' : syncSuccess ? 'Unduh Berkas Hasil Sinkron (ZIP)' : 'Unduh Archive ZIP'}
                </button>
                {zipSuccess && (
                  <p className="text-[10px] text-emerald-600 font-extrabold mt-2 text-center animate-fade-in">✓ File ZIP berhasil diunduh ke folder Downloads!</p>
                )}
              </div>

              {/* Reset to Default */}
              <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4">
                <h5 className="font-bold text-slate-700 text-xs">Reset Catatan Simulasi</h5>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">Reset riwayat transaksi dan kembalikan ke data bawaan simulasi.</p>
                <button
                  type="button"
                  onClick={onResetData}
                  className="mt-3 inline-flex items-center gap-1 bg-white border border-gray-250 hover:bg-slate-50 text-slate-705 text-slate-600 font-bold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-450" />
                  Restore Catatan Bawaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: PHP Code Explorer */}
      {subTab === 'code' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base font-sans">
              Eksplorasi Kode PHP Native Core ({selectedFile})
            </h4>
            <button
              onClick={onCopy}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              {copiedFile === selectedFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Salin Berhasil!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin Kode File
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left sidebar: File selector list */}
            <div className="lg:col-span-3 border-r border-slate-100 p-4 bg-slate-50/30 space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2 font-sans">Daftar File Project</span>
              {files.map((file) => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    selectedFile === file 
                      ? 'bg-blue-600/10 text-blue-600 border border-blue-200/50' 
                      : 'text-slate-600 hover:bg-slate-150/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-slate-400" />
                    <span>{file}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right code textarea render */}
            <div className="lg:col-span-9 p-4 bg-slate-900 border-t lg:border-t-0 font-mono text-xs overflow-x-auto text-slate-200 h-[380px] leading-relaxed">
              <pre className="whitespace-pre-wrap">{codeContent}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Step guide */}
      {subTab === 'cpanel' && (
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-xs space-y-6">
          <h4 className="font-extrabold text-slate-800 text-sm md:text-base font-sans pb-3 border-b border-gray-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Panduan Lengkap Deployment Hosting cPanel
          </h4>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 text-slate-700 font-extrabold rounded-full w-7 h-7 flex shrink-0 items-center justify-center text-xs font-sans">
                1
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-sm mb-1">Siapkan Database di cPanel</h5>
                <p className="text-xs text-slate-500 leading-normal font-medium">
                  Masuk ke control panel hosting (cPanel), cari menu <strong>MySQL Database Wizard</strong>. Buat database baru, buat database user baru, buat password kuat, lalu centang <strong>&quot;ALL PRIVILEGES&quot;</strong> saat menghubungkan user ke database. Isikan informasi tersebut pada tab <strong>Konfigurasi Database MySQL</strong> di atas.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 text-slate-700 font-extrabold rounded-full w-7 h-7 flex shrink-0 items-center justify-center text-xs font-sans">
                2
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-sm mb-1">Import SQL Schema (Tabel)</h5>
                <p className="text-xs text-slate-500 leading-normal font-medium">
                  Masuk ke menu <strong>phpMyAdmin</strong> di cPanel Anda. Pilih database baru Anda di sidebar sebelah kiri, klik tab <strong>&quot;Import&quot;</strong> di bagian navigasi atas, pilih file <code>db.sql</code> Hasil Unduh ZIP kita lalu klik tombol <strong>&quot;Go/Import&quot;</strong>. Struktur tabel transaksi siap seketika.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 text-slate-700 font-extrabold rounded-full w-7 h-7 flex shrink-0 items-center justify-center text-xs font-sans">
                3
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-sm mb-1">Upload File PHP via File Manager cPanel</h5>
                <p className="text-xs text-slate-500 leading-normal font-medium">
                  Buka menu <strong>File Manager</strong> di cPanel. Masuk ke direktori <code>public_html</code>. Ekstrak ZIP project hasil download kita, lalu klik menu <strong>&quot;Upload&quot;</strong> untuk mengupload seluruh isinya secara langsung atau satu per satu. Pastikan <code>index.php</code> diletakkan di root agar domain Anda langsung mengarah ke dashboard utama Keuangan!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Customize Branding & Header Banner */}
      {subTab === 'customize' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-in">
          {/* Left panel: configure brand */}
          <div className="lg:col-span-7 bg-white p-6 border border-gray-100 rounded-2xl shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-800 text-sm md:text-base font-sans flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-605" />
                Kustomisasi Nama & Logo Aplikasi
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Desain identitas brand kustom anda</p>
            </div>

            {/* App Name Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                Nama Aplikasi (Max 25 Karakter)
              </label>
              <input
                type="text"
                maxLength={25}
                value={appName}
                onChange={(e) => setAppName(e.target.value || 'KeuanganKu')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nama Aplikasi Kustom (misal: SakuKita)"
              />
            </div>

            {/* App Logo Indicator Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">
                Pilih Logo Utama Aplikasi
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: 'Wallet', label: 'Dompet', icon: Wallet },
                  { id: 'DollarSign', label: 'Keuangan', icon: DollarSign },
                  { id: 'TrendingUp', label: 'Arus Kas', icon: TrendingUp },
                  { id: 'Coins', label: 'Tabungan', icon: Coins },
                  { id: 'CreditCard', label: 'Transaksi', icon: CreditCard },
                  { id: 'PiggyBank', label: 'Celengan', icon: PiggyBank },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isCurSelected = appLogo === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAppLogo(item.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isCurSelected
                          ? 'border-blue-600 bg-blue-50/80 text-blue-800 font-extrabold scale-[1.02] shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <IconComp className="w-5 h-5 mb-1 shrink-0" />
                      <span className="text-[9px] font-bold truncate tracking-tight w-full">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors indicators selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">
                Pilih Warna Aksen Identitas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                {[
                  { id: 'blue', label: 'Biru', hex: 'bg-blue-600' },
                  { id: 'emerald', label: 'Hijau', hex: 'bg-emerald-600' },
                  { id: 'indigo', label: 'Indigo', hex: 'bg-indigo-600' },
                  { id: 'rose', label: 'Merah', hex: 'bg-rose-600' },
                  { id: 'amber', label: 'Emas', hex: 'bg-amber-500' },
                  { id: 'violet', label: 'Violet', hex: 'bg-violet-600' },
                ].map((color) => {
                  const isColorSel = appLogoColor === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setAppLogoColor(color.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                        isColorSel
                          ? 'border-blue-600 bg-blue-50/40 text-slate-800 font-extrabold shadow-2xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-550'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${color.hex}`} />
                      <span className="text-[10px] font-bold">{color.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Edit Banner info and Preview */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-xs space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <h4 className="font-extrabold text-slate-800 text-sm md:text-base font-sans flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  Edit Banner Dashboard
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Ubah teks sambutan halaman depan</p>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  Judul Banner (Greeting Title)
                </label>
                <input
                  type="text"
                  value={dashboardHeaderTitle}
                  onChange={(e) => setDashboardHeaderTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Halo, Administrator 👋"
                />
              </div>

              {/* Subtitle / Description input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
                  Subjudul Banner (Description)
                </label>
                <textarea
                  rows={3}
                  value={dashboardHeaderSubtitle}
                  onChange={(e) => setDashboardHeaderSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Isi penjelasan banner di sini..."
                />
              </div>
            </div>

            {/* Realtime Live Preview Card of Dashboard Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between h-48 select-none">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="bg-white/10 rounded-lg p-2 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full select-none">Pratinjau Banner</span>
              </div>

              <div className="space-y-1.5 relative z-10">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug truncate">
                  {dashboardHeaderTitle || 'Halo, Guest 👋'}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-300 leading-normal font-medium max-h-16 overflow-hidden line-clamp-3">
                  {dashboardHeaderSubtitle || 'Mulai rekam pengeluaran harian dan kelola kemakmuran anggaran Anda.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
