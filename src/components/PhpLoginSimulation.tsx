import React, { useState } from 'react';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Coins, 
  CreditCard, 
  PiggyBank, 
  Lock, 
  User, 
  AlertCircle,
  Database,
  Terminal,
  Server,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  UserCheck,
  UserPlus
} from 'lucide-react';

import { UserSim } from '../types';

interface PhpLoginSimulationProps {
  appName: string;
  appLogo: string;
  appLogoColor: string;
  users: UserSim[];
  onLoginSuccess: (user: UserSim) => void;
  onRegisterUser?: (username: string, nama: string, password?: string) => void;
  onClearDb?: () => void;
}

export default function PhpLoginSimulation({
  appName,
  appLogo,
  appLogoColor,
  users,
  onLoginSuccess,
  onRegisterUser,
  onClearDb
}: PhpLoginSimulationProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form states
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState(0);

  const getLogoIcon = () => {
    switch (appLogo) {
      case 'Wallet': return Wallet;
      case 'DollarSign': return DollarSign;
      case 'TrendingUp': return TrendingUp;
      case 'Coins': return Coins;
      case 'CreditCard': return CreditCard;
      case 'PiggyBank': return PiggyBank;
      default: return Wallet;
    }
  };

  const IconComponent = getLogoIcon();

  const getColorClasses = () => {
    switch (appLogoColor) {
      case 'emerald': return { bg: 'from-emerald-600 to-teal-600', text: 'text-emerald-400', border: 'border-emerald-200/20' };
      case 'indigo': return { bg: 'from-indigo-600 to-violet-600', text: 'text-indigo-400', border: 'border-indigo-200/20' };
      case 'rose': return { bg: 'from-rose-600 to-pink-600', text: 'text-rose-400', border: 'border-rose-200/20' };
      case 'amber': return { bg: 'from-amber-500 to-orange-500', text: 'text-amber-400', border: 'border-amber-200/20' };
      case 'violet': return { bg: 'from-violet-600 to-purple-600', text: 'text-violet-400', border: 'border-violet-200/20' };
      default: return { bg: 'from-blue-600 to-indigo-600', text: 'text-blue-400', border: 'border-blue-200/20' };
    }
  };

  const colors = getColorClasses();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Peringatan: Username dan password tidak boleh kosong!');
      return;
    }

    const matchedUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (matchedUser) {
      // Check approval status first
      if (matchedUser.status === 'pending') {
        setError(`Peringatan Keamanan: Akun Anda (@${matchedUser.username}) belum disetujui (ACC) oleh Super Admin! Silakan hubungi Super Admin untuk persetujuan.`);
        return;
      }

      // Check password simulation
      const expectedPassword = matchedUser.password || 'admin123';
      if (password === expectedPassword) {
        setLoading(true);
        setAuthStep(1);

        // Programmed delay steps to simulate dynamic loading log outputs from native PHP execution
        setTimeout(() => setAuthStep(2), 400);
        setTimeout(() => setAuthStep(3), 850);
        setTimeout(() => setAuthStep(4), 1300);
        setTimeout(() => setAuthStep(5), 1700);
        setTimeout(() => {
          onLoginSuccess(matchedUser);
          setLoading(false);
          setAuthStep(0);
        }, 2100);
       } else {
        setError('Password salah! Silakan periksa kembali kata sandi akun.');
       }
    } else {
      setError('Username tidak terdaftar di database keuangan!');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regNama.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError('Peringatan: Seluruh kolom pendaftaran harus dilengkapi!');
      return;
    }

    const cleanedUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanedUsername.length < 4) {
      setError('Username minimal harus 4 karakter (huruf kecil/angka/underscore)!');
      return;
    }

    const exists = users.some(u => u.username.toLowerCase() === cleanedUsername);
    if (exists) {
      setError(`Username @${cleanedUsername} sudah digunakan. Pilih username lain!`);
      return;
    }

    if (onRegisterUser) {
      const isFirst = users.length === 0;
      onRegisterUser(cleanedUsername, regNama.trim(), regPassword.trim());
      
      if (isFirst) {
        setSuccessMsg(`Registrasi Sukses! Karena Anda adalah pendaftar pertama di database, akun @${cleanedUsername} otomatis disetujui menjadi Super Admin. Silakan masuk langsung menggunakan password Anda!`);
      } else {
        setSuccessMsg(`Registrasi Sukses! Akun @${cleanedUsername} didaftarkan dengan status 'Pending ACC'. Anda baru dapat masuk setelah disetujui (ACC) oleh Super Admin.`);
      }
      
      // Reset pendaftaran
      setRegNama('');
      setRegUsername('');
      setRegPassword('');
      setActiveTab('login');
      setUsername(cleanedUsername);
    }
  };

  const toggleTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Lights glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Main card panel wrapper */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/85 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-8 relative z-10 transition-all">
        
        {/* Realtime Terminal Step Log Simulator during submission */}
        {loading ? (
          <div className="space-y-5 py-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-2 font-black">PHP Server Engine</span>
            </div>

            <div className="space-y-3 font-mono text-[11px] leading-relaxed">
              <p className={`flex items-center gap-2 ${authStep >= 1 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 1 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[PHP] <code className="text-blue-400">session_start()</code> terinisialisasi...</span>
              </p>
              
              <p className={`flex items-center gap-2 ${authStep >= 2 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 2 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[SQL] Memuat file konfigurasi <code className="text-emerald-400">koneksi.php</code>... OK!</span>
              </p>

              <p className={`flex items-center gap-2 ${authStep >= 3 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 3 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[SQL] Memproses prepared query <code className="text-amber-400 font-bold">SELECT * FROM users WHERE username = ?</code></span>
              </p>

              <p className={`flex items-center gap-2 ${authStep >= 4 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 4 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[PHP] Verifikasi Bcrypt hash: <code className="text-purple-400">password_verify()</code> ... COCOK!</span>
              </p>

              <p className={`flex items-center gap-2 ${authStep >= 5 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 5 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block animate-spin" />}
                <span>[PHP] Pintu gerbang terbuka! Mengalihkan ke halaman <code className="text-emerald-400">index.php</code>...</span>
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Keamanan Database Aktif</p>
                <p className="text-[10px] text-slate-300 font-mono font-semibold truncate leading-tight">Bcrypt Hash Verification System</p>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Tab Forms UI */
          <div className="space-y-5">
            <div className="text-center">
              <button className="relative group/logo">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-40 blur-md group-hover/logo:opacity-75 transition-all duration-300" />
                <div className="relative p-4 bg-slate-950 border border-slate-800 rounded-2xl inline-flex items-center justify-center text-slate-100 shadow-xl">
                  <IconComponent className="w-8 h-8 stroke-[1.8] text-blue-400 group-hover/logo:scale-110 transition-all duration-350" />
                </div>
              </button>
              <h4 className="text-xl font-bold bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight mt-3 mb-1">{appName || 'KeuanganKu'} Portal</h4>
              <p className="text-[11px] text-slate-400 font-medium">Sistem Autentikasi Laporan & Manajemen Keuangan</p>
            </div>

            {/* Pill-style Switching Tabs */}
            <div className="grid grid-cols-2 bg-slate-950/60 p-1 rounded-full border border-slate-850/60 mb-2">
              <button
                type="button"
                onClick={() => toggleTab('login')}
                className={`py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'login' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Masuk
              </button>
              <button
                type="button"
                onClick={() => toggleTab('register')}
                className={`py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'register' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Daftar Baru
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-2xl flex items-start gap-2.5 animate-bounce-short">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <span className="text-[11px] font-bold leading-normal">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-2xl flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <span className="text-[11px] font-bold leading-normal">{successMsg}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Username Login
                    </label>
                    <div className="relative group/input">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-500 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/65 border border-slate-800/80 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-slate-650"
                        placeholder="Masukkan username Anda"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Password Akun
                    </label>
                    <div className="relative group/input">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-500 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/65 border border-slate-800/80 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-slate-650"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-115 active:scale-[0.98] text-white rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  Masuk Sekarang
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Nama Lengkap Anda
                    </label>
                    <input
                      type="text"
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/65 border border-slate-800/80 rounded-2xl text-slate-100 text-xs font-bold focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-slate-650"
                      placeholder="Masukkan nama lengkap, misal: Andi Wijaya"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Username Baru
                    </label>
                    <div className="relative group/input">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-500">@</span>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full pl-7 pr-4 py-3 bg-slate-950/65 border border-slate-800/80 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-slate-650"
                        placeholder="budi_s"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Password Baru
                    </label>
                    <div className="relative group/input">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-500 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/65 border border-slate-800/80 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-slate-650"
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-115 active:scale-[0.98] text-white rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftar Sekarang
                </button>
              </form>
            )}

            {/* Instruction Box - ONLY shown when database has ZERO accounts */}
            {users.length === 0 && (
              <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl transition-all duration-300">
                <div className="flex items-start gap-2.5 text-left">
                  <HelpCircle className="w-4.5 h-4.5 shrink-0 text-indigo-400 mt-0.5" />
                  <div className="text-[11px] leading-relaxed text-slate-300">
                    <p className="font-bold text-slate-200 mb-1.5"><i className="bi bi-info-circle-fill text-primary"></i> Aturan Sistem Sandbox:</p>
                    <p className="mb-1 text-slate-400 font-medium">
                      Karena database <code>users</code> dalam keadaan kosong:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 font-medium">
                      <li>Akun pertama yang mendaftar otomatis menjadi <strong className="text-indigo-400">Super Admin (Approved)</strong>.</li>
                      <li>Akun ke-2 dan seterusnya didaftarkan sebagai <strong className="text-amber-500">Admin Biasa (Pending ACC)</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Developer Sandbox Panel - Beautifully nestled at the bottom of the card */}
      <div className="mt-5 w-full max-w-md bg-slate-900/25 backdrop-blur-md border border-slate-900/60 p-4 rounded-2xl text-center shadow-md relative z-10">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Daftar Akun Sandbox Aktif</span>
          </div>
          <span className="text-[9px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-blue-400">{users.length} Akun</span>
        </div>

        <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
          {users.length === 0 ? (
            <p className="text-slate-500 italic text-[10px] py-1.5">Belum ada akun terdaftar (Instalasi Kosong)</p>
          ) : (
            users.map(u => (
              <div key={u.id} className="flex justify-between items-center text-[10px] bg-slate-950/60 border border-slate-850 p-2 rounded-xl text-slate-400 font-mono">
                <span className="font-bold">@{u.username} (<span className="text-slate-300">{u.nama.split(' ')[0]}</span>)</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    u.role === 'superadmin' ? 'text-indigo-400 bg-indigo-950/60 border border-indigo-900/40' : 'text-slate-400 bg-slate-800 border border-slate-700'
                  }`}>{u.role === 'superadmin' ? 'Super' : 'Admin'}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    u.status === 'pending' ? 'text-amber-500 bg-amber-950/60 border border-amber-900/40' : 'text-emerald-400 bg-emerald-900/60 border border-emerald-990/40'
                  }`}>{u.status || 'approved'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {onClearDb && users.length > 0 && (
          <button
            type="button"
            onClick={onClearDb}
            className="mt-3.5 w-full py-2 px-3 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-black text-[9px] uppercase tracking-wider rounded-xl border border-rose-900/40 hover:border-rose-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Database className="w-3.5 h-3.5" />
            Kosongkan Database (Hapus Semua User)
          </button>
        )}
      </div>
    </div>
  );
}

