import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Database,
  Terminal,
  UserCheck
} from 'lucide-react';
import { UserSim } from '../types';

interface UsersViewProps {
  users: UserSim[];
  onAddUser: (username: string, nama: string, role: 'admin' | 'superadmin' | 'user') => void;
  onUpdateUser: (id: string, username: string, nama: string, role: 'admin' | 'superadmin' | 'user') => void;
  onDeleteUser: (id: string) => void;
  currentUser: { username: string; role: 'admin' | 'superadmin' | 'user' };
  appLogoColor?: string;
}

export default function UsersView({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  currentUser,
  appLogoColor = 'blue'
}: UsersViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [role, setRole] = useState<'admin' | 'superadmin' | 'user'>('admin');
  const [password, setPassword] = useState(''); // Simulated password field for audit logs
  const [formError, setFormError] = useState('');

  const getColorClasses = () => {
    switch (appLogoColor) {
      case 'emerald': return { text: 'text-emerald-600', bg: 'bg-emerald-600', bgLight: 'bg-emerald-500/10', border: 'border-emerald-200' };
      case 'indigo': return { text: 'text-indigo-600', bg: 'bg-indigo-600', bgLight: 'bg-indigo-500/10', border: 'border-indigo-200' };
      case 'rose': return { text: 'text-rose-600', bg: 'bg-rose-600', bgLight: 'bg-rose-500/10', border: 'border-rose-200' };
      case 'amber': return { text: 'text-amber-500', bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', border: 'border-amber-200' };
      case 'violet': return { text: 'text-violet-600', bg: 'bg-violet-600', bgLight: 'bg-violet-500/10', border: 'border-violet-200' };
      default: return { text: 'text-blue-600', bg: 'bg-blue-600', bgLight: 'bg-blue-500/10', border: 'border-blue-200' };
    }
  };

  const colors = getColorClasses();

  const handleOpenAdd = () => {
    setUsername('');
    setNama('');
    setRole('admin');
    setPassword('admin123'); // Default default testing password
    setFormError('');
    setIsAdding(true);
    setEditingId(null);
  };

  const handleOpenEdit = (user: UserSim) => {
    setUsername(user.username);
    setNama(user.nama);
    setRole(user.role);
    setFormError('');
    setEditingId(user.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !nama.trim()) {
      setFormError('Semua kolom nama dan username wajib dilengkapi!');
      return;
    }

    if (username.trim().toLowerCase() === 'admin' && !editingId) {
      // Check duplicate
      const exists = users.find(u => u.username.toLowerCase() === 'admin');
      if (exists) {
        setFormError('Username "admin" sudah terdaftar di database!');
        return;
      }
    }

    const isDuplicate = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== editingId);
    if (isDuplicate) {
      setFormError(`Username "${username}" sudah digunakan oleh user lain!`);
      return;
    }

    if (editingId) {
      onUpdateUser(editingId, username.trim(), nama.trim(), role);
      setEditingId(null);
    } else {
      onAddUser(username.trim(), nama.trim(), role);
      setIsAdding(false);
    }

    // Reset
    setUsername('');
    setNama('');
  };

  const handleDelete = (user: UserSim) => {
    if (user.username === currentUser.username) {
      alert('Peringatan Keamanan: Anda tidak diperbolehkan menghapus akun Anda sendiri yang sedang aktif digunakan saat ini!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.nama}" (${user.username}) dari database sistem?`)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className={`w-5 h-5 ${colors.text}`} />
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Manajemen Pengguna (User)</h2>
          </div>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Konfigurasikan akun administrator dengan tingkat otorisasi <strong className="text-slate-700">Admin</strong> atau <strong className="text-slate-700">Super Admin</strong>.
          </p>
        </div>
        
        {currentUser.role === 'superadmin' ? (
          <button
            onClick={handleOpenAdd}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md hover:scale-[1.01] hover:brightness-110 cursor-pointer ${colors.bg}`}
          >
            <UserPlus className="w-4 h-4" />
            Tambah User Baru
          </button>
        ) : (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center max-w-sm">
            <ShieldAlert className="w-4 h-4 inline-block me-1 text-amber-500 mt-px" />
            Hanya role <strong>Super Admin</strong> yang memiliki hak akses modifikasi data user.
          </span>
        )}
      </div>

      {/* Grid Layout Form and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column: User List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Daftar Akun Database MySQL</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-200/50 rounded-md px-2 py-0.5">Total: {users.length}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.username === currentUser.username;
                const isSuper = user.role === 'superadmin';

                return (
                  <div key={user.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/40 transition-colors">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-2xl shrink-0 ${isSuper ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {isSuper ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-800 truncate">{user.nama}</h4>
                          {isSelf && (
                            <span className="text-[9px] font-extrabold tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase">AKTIF</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-semibold font-mono mt-0.5">@{user.username}</p>
                        
                        {/* Role tag badge info */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {isSuper ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 font-extrabold px-2 py-0.5 rounded-full border border-indigo-100 uppercase">
                              <ShieldCheck className="w-3 h-3 text-indigo-500" />
                              Super Admin
                            </span>
                          ) : user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 font-extrabold px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                              Admin Keuangan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-55 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                              User Biasa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions button */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {currentUser.role === 'superadmin' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 cursor-pointer"
                            title="Edit User"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className={`p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 cursor-pointer ${isSelf ? 'opacity-30 cursor-not-allowed hover:text-slate-400 hover:bg-transparent hover:border-transparent' : ''}`}
                            disabled={isSelf}
                            title={isSelf ? 'Tidak bisa menghapus diri sendiri' : 'Hapus User'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Read-only (Admin)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MySQL Sync Simulation Indicator Box */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-slate-300">
            <div className="flex gap-3">
              <Database className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-extrabold text-white text-xs tracking-tight">Koneksi Database & Autentikasi Pengguna Aktif</p>
                <p className="text-slate-400 mt-1">
                  Seluruh penambahan dan perubahan level otorisasi di atas otomatis meng-update kueri schema penginstalan <code>db.sql</code> dan file simulasi autentikasi PHP <code>login.php</code> secara real-time.
                </p>
                <div className="mt-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>SELECT * FROM `users` WHERE `role` = '{currentUser.role}'; -- returns {users.length} rows</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Add/Edit Panel */}
        <div className="lg:col-span-1">
          {editingId || isAdding ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {editingId ? 'Ubah Akun User' : 'Form User Baru'}
                </h3>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-lg"
                >
                  Batal
                </button>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-2xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-bold leading-normal">{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                    Username Login
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      required
                      maxLength={50}
                      disabled={editingId !== null && username === 'admin'}
                      placeholder="username_baru"
                      className="w-full text-xs font-bold pl-7 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400 disabled:opacity-50"
                    />
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                      Password default
                    </label>
                    <input
                      type="text"
                      value={password}
                      disabled
                      className="w-full text-xs font-mono font-bold px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
                    />
                    <span className="text-[9px] text-slate-400 font-medium pl-1 mt-1 block">Password bawaan uji coba adalah <strong className="text-slate-500">admin123</strong> (hashed di MySQL)</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                    Role Hak Akses
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'superadmin' | 'user')}
                    disabled={editingId !== null && username === 'admin'} // Cannot downgrade primary admin
                    className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="user">User Biasa (Hanya Kelola Transaksi Sendiri)</option>
                    <option value="admin">Admin Keuangan (Akses Terbatas)</option>
                    <option value="superadmin">Super Admin (Akses Penuh)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 ${colors.bg} hover:brightness-110 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md`}
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan Akun'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-6 text-center text-slate-500">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight">Opsi Konfigurasi</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                {currentUser.role === 'superadmin' 
                  ? 'Klik tombol "Tambah User Baru" atau klik ikon pensil pada baris user untuk membuka formulir manajemen roles.'
                  : 'Gunakan akun ber-level "Super Admin" untuk dapat melakukan edit, tambah, maupun hapus administrator.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
