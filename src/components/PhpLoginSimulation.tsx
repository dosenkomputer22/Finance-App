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
}

export default function PhpLoginSimulation({
  appName,
  appLogo,
  appLogoColor,
  users,
  onLoginSuccess,
  onRegisterUser
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
      case 'emerald': return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200', textAccent: 'text-emerald-400' };
      case 'indigo': return { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', textAccent: 'text-indigo-400' };
      case 'rose': return { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-200', textAccent: 'text-rose-400' };
      case 'amber': return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-200', textAccent: 'text-amber-400' };
      case 'violet': return { bg: 'bg-violet-600', text: 'text-violet-600', border: 'border-violet-200', textAccent: 'text-violet-400' };
      default: return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', textAccent: 'text-blue-400' };
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
      onRegisterUser(cleanedUsername, regNama.trim(), regPassword.trim());
      setSuccessMsg(`Registrasi Sukses! Akun @${cleanedUsername} berhasil dimasukkan dengan status 'Pending ACC'. Silakan masuk sebagai Super Admin (admin) untuk menyetujui akun ini di menu 'Kelola User'.`);
      
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
    <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Light glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${colors.bg}/5 rounded-full blur-3xl pointer-events-none`} />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
        
        {/* Realtime Terminal Step Log Simulator during submission */}
        {loading ? (
          <div className="space-y-5 py-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-2">PHP Server Sandbox</span>
            </div>

            <div className="space-y-3 font-mono text-[11px] leading-relaxed">
              <p className={`flex items-center gap-2 ${authStep >= 1 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 1 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[PHP] <code>session_start()</code> terinisialisasi...</span>
              </p>
              
              <p className={`flex items-center gap-2 ${authStep >= 2 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 2 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[SQL] Menghubungkan ke <code>koneksi.php</code>... database terkoneksi!</span>
              </p>

              <p className={`flex items-center gap-2 ${authStep >= 3 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 3 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[SQL] Memproses prepared query <code>SELECT * FROM users WHERE username = ?</code></span>
              </p>

              <p className={`flex items-center gap-2 ${authStep >= 4 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 4 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block" />}
                <span>[PHP] Mencari hash password: <code>password_verify()</code> ... COCOK!</span>
              </p>

              <p className={`flex items-center gap-2 ${authStep >= 5 ? 'text-slate-300' : 'text-slate-600'}`}>
                {authStep >= 5 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 border border-dashed border-slate-600 rounded-full inline-block animate-spin" />}
                <span>[PHP] Session terdaftar! Mengalihkan ke dashboard <code>index.php</code>...</span>
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Metode Proteksi Aktif</p>
                <p className="text-[10px] text-slate-300 font-mono font-semibold truncate">MySQLi Prepared Statement & Verification</p>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Tab Forms UI */
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className={`p-3 bg-slate-950 border border-slate-800 rounded-2xl inline-flex items-center justify-center mb-3 text-slate-100 shadow-xs ${colors.text}`}>
                <IconComponent className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h4 className="text-lg font-black text-white tracking-tight">{appName || 'SakuKita'} Portal</h4>
              <p className="text-[11px] text-slate-400 font-medium">Native PHP Applet & MySQLi Database Simulation Panel</p>
            </div>

            {/* Switching Tabs */}
            <div className="flex border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => toggleTab('login')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === 'login' ? 'border-blue-600 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-400'
                }`}
              >
                Log In (Masuk)
              </button>
              <button
                type="button"
                onClick={() => toggleTab('register')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === 'register' ? 'border-emerald-600 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-400'
                }`}
              >
                Sign Up (Daftarkan)
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-2xl flex items-start gap-2.5">
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
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-600"
                        placeholder="Contoh: admin atau budi"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Password Akun
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-600"
                        placeholder="Contoh: admin123"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 ${colors.bg} hover:brightness-110 text-white rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer flex items-center justify-center gap-2`}
                >
                  <Terminal className="w-4 h-4" />
                  Masuk Sekarang (Simulasi)
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
                      className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs font-bold focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all placeholder:text-slate-600"
                      placeholder="Masukkan nama lengkap, misal: Andi Wijaya"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Username Baru
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold font-mono">@</span>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full pl-7 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all placeholder:text-slate-600"
                        placeholder="andy_wi"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                      Password Rahasia Anda
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all placeholder:text-slate-600"
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:brightness-110 text-white rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftarkan Akun (Pending ACC)
                </button>
              </form>
            )}

            {/* Instruction Box */}
            <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl max-h-[140px] overflow-y-auto custom-scrollbar">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                <div className="text-[11px] leading-relaxed w-full">
                  <p className="font-bold text-slate-300">Daftar Akun Sandbox Aktif:</p>
                  <div className="space-y-1 mt-1.5">
                    {users.map(u => (
                      <div key={u.id} className="flex justify-between text-[10px] bg-slate-900 border border-slate-800/60 p-1 px-1.5 rounded-lg text-slate-400">
                        <span>@{u.username} (<span className="text-slate-300">{u.nama.split(' ')[0]}</span>)</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] font-black uppercase px-1 rounded ${
                            u.role === 'superadmin' ? 'text-indigo-400 bg-indigo-950 border border-indigo-900' : 'text-slate-400 bg-slate-800 border border-slate-700'
                          }`}>{u.role === 'superadmin' ? 'Super' : 'Admin'}</span>
                          <span className={`text-[8px] font-black uppercase px-1 rounded ${
                            u.status === 'pending' ? 'text-amber-500 bg-amber-950/80 border border-amber-900' : 'text-emerald-400 bg-emerald-900/50 border border-emerald-900'
                          }`}>{u.status || 'approved'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
