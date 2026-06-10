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
  HelpCircle
} from 'lucide-react';

import { UserSim } from '../types';

interface PhpLoginSimulationProps {
  appName: string;
  appLogo: string;
  appLogoColor: string;
  users: UserSim[];
  onLoginSuccess: (user: UserSim) => void;
}

export default function PhpLoginSimulation({
  appName,
  appLogo,
  appLogoColor,
  users,
  onLoginSuccess
}: PhpLoginSimulationProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Peringatan: Username dan password tidak boleh kosong!');
      return;
    }

    const matchedUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (matchedUser && password === 'admin123') {
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
      setError('Kredensial salah atau user tidak terdaftar! (Catatan: Semua user simulasi memakai password: admin123)');
    }
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
          /* Normal Login Form UI */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <div className={`p-3 bg-slate-950 border border-slate-800 rounded-2xl inline-flex items-center justify-center mb-3 text-slate-100 shadow-xs ${colors.text}`}>
                <IconComponent className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h4 className="text-lg font-black text-white tracking-tight">{appName || 'SakuKita'} Dashboard</h4>
              <p className="text-[11px] text-slate-400 font-medium">Masuk menggunakan Session PHP dan MySQLi</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <span className="text-[11px] font-bold leading-normal">{error}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-600"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 mb-1.5">
                  Password Admin
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs font-bold font-mono focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-600"
                    placeholder="Masukkan password"
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

            {/* Instruction Box */}
            <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl max-h-[140px] overflow-y-auto custom-scrollbar">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                <div className="text-[11px] leading-relaxed w-full">
                  <p className="font-bold text-slate-300">Daftar Akun Sandbox Aktif:</p>
                  <p className="text-slate-500 font-medium text-[10px] mt-0.5 mb-1.5">Semua user menggunakan password bawaan: <strong className="text-slate-300">admin123</strong></p>
                  <div className="space-y-1">
                    {users.map(u => (
                      <div key={u.id} className="flex justify-between text-[10px] bg-slate-900 border border-slate-800/60 p-1 px-1.5 rounded-lg text-slate-400">
                        <span>@{u.username} (<span className="text-slate-300">{u.nama.split(' ')[0]}</span>)</span>
                        <span className={`text-[8px] font-black uppercase px-1 rounded ${
                          u.role === 'superadmin' ? 'text-indigo-400 bg-indigo-950 border border-indigo-900' : 'text-slate-400 bg-slate-800 border border-slate-700'
                        }`}>{u.role === 'superadmin' ? 'Super' : 'Admin'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
