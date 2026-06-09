import React from 'react';
import { Menu, Calendar, ChevronDown, User } from 'lucide-react';

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Header({ 
  setIsMobileOpen, 
  isSidebarCollapsed, 
  setIsSidebarCollapsed 
}: HeaderProps) {
  
  const getFormattedDateIndo = () => {
    const date = new Date();
    const monthsInIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    // We can show the current real year, or standard 2024 to match the screenshot timeline. Let's make it nicely dynamic!
    return `${date.getDate()} ${monthsInIndo[date.getMonth()]} ${date.getFullYear()}`;
    // Or we can use the exact date format: "23 Mei 2024" if the user wants it to look identical. Showing a live formatted date is standard practice!
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
      <div className="flex items-center gap-4">
        {/* Date indication */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-600 text-xs sm:text-sm font-semibold shadow-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{getFormattedDateIndo()}</span>
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3 cursor-pointer hover:bg-slate-100/70 transition-colors shadow-xs">
          <div className="bg-blue-600/10 text-blue-600 rounded-lg p-1.5 flex items-center justify-center">
            <User className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-700">Admin</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
