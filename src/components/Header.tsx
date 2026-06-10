import React, { useState } from 'react';
import { Menu, Calendar, ChevronDown, User, LogOut } from 'lucide-react';

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onLogoutSim?: () => void;
  currentUser?: { nama: string; username: string; role: 'admin' | 'superadmin' };
}

export default function Header({ 
  setIsMobileOpen, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed,
  onLogoutSim,
  currentUser = { nama: 'Administrator Keuangan', username: 'admin', role: 'superadmin' }
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const getFormattedDateIndo = () => {
    const date = new Date();
    const monthsInIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${monthsInIndo[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <header className="bg-white border-b border-gray-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-xs">
      {/* Left side: Hamburger button on mobile & desktop */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Desktop sidebar collapse trigger */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-xs"
          title={isSidebarCollapsed ? "Sembunyikan Menu Samping" : "Tampilkan Menu Samping"}
        >
          <Menu className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Right side: Calendar display and Admin status info */}
      <div className="flex items-center gap-4 relative">
        {/* Date indication */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-600 text-xs sm:text-sm font-semibold shadow-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{getFormattedDateIndo()}</span>
        </div>

        {/* Profile indicator */}
        <div className="relative">
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3 cursor-pointer hover:bg-slate-100/70 transition-colors shadow-xs"
          >
            <div className="bg-blue-600/10 text-blue-600 rounded-lg p-1.5 flex items-center justify-center">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 max-w-[120px] truncate" title={currentUser.nama}>
              {currentUser.nama}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </div>

          {/* Expanded Dropdown Panel */}
          {showDropdown && (
            <>
              {/* Backing overlay to close */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)} 
              />
              
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Sistem Aktif</p>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                      currentUser.role === 'superadmin' 
                        ? 'text-indigo-600 bg-indigo-55/10 border-indigo-100' 
                        : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {currentUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-700 mt-1 truncate" title={currentUser.nama}>
                    {currentUser.nama}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">@{currentUser.username}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    if (confirm('Simulasi PHP: Anda akan melakukan Logout Session PHP dan diarahkan ke Halaman Form Login PHP.')) {
                      onLogoutSim?.();
                    }
                  }}
                  className="w-full text-left flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  Keluar (Simulasi PHP)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
