import React from 'react';
import { 
  Wallet, 
  LayoutDashboard, 
  ArrowLeftRight, 
  PlusSquare, 
  FileText, 
  Tags, 
  Settings, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  X,
  DollarSign,
  TrendingUp,
  Coins,
  CreditCard,
  PiggyBank,
  Users
} from 'lucide-react';
import { ActiveTab, UserSim } from '../types';

const LogoIconMap: Record<string, React.ComponentType<any>> = {
  Wallet,
  DollarSign,
  TrendingUp,
  Coins,
  CreditCard,
  PiggyBank
};

const getColorClass = (colorName: string) => {
  switch (colorName) {
    case 'emerald': return 'bg-emerald-600 hover:bg-emerald-500';
    case 'indigo': return 'bg-indigo-600 hover:bg-indigo-500';
    case 'rose': return 'bg-rose-600 hover:bg-rose-500';
    case 'amber': return 'bg-amber-500 hover:bg-amber-400';
    case 'violet': return 'bg-violet-600 hover:bg-violet-500';
    default: return 'bg-blue-600 hover:bg-blue-500'; // blue
  }
};

const getActiveColorClass = (colorName: string) => {
  switch (colorName) {
    case 'emerald': return 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/15';
    case 'indigo': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15';
    case 'rose': return 'bg-rose-600 text-white shadow-lg shadow-rose-600/15';
    case 'amber': return 'bg-amber-500 text-white shadow-lg shadow-amber-500/15';
    case 'violet': return 'bg-violet-600 text-white shadow-lg shadow-violet-600/15';
    default: return 'bg-blue-600 text-white shadow-lg shadow-blue-600/15'; // blue
  }
};

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  handleDownloadZip: () => void;
  isZipping: boolean;
  zipSuccess: boolean;
  appName?: string;
  appLogo?: string;
  appLogoColor?: string;
  currentUser?: UserSim;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  handleDownloadZip,
  isZipping,
  zipSuccess,
  appName = 'KeuanganKu',
  appLogo = 'Wallet',
  appLogoColor = 'blue',
  currentUser
}: SidebarProps) {
  
  const SelectedLogoIcon = LogoIconMap[appLogo] || Wallet;
  
  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'Transaksi', icon: ArrowLeftRight },
    { id: 'add-transaction' as ActiveTab, label: 'Tambah Transaksi', icon: PlusSquare },
    { id: 'reports' as ActiveTab, label: 'Laporan', icon: FileText },
    { id: 'categories' as ActiveTab, label: 'Kategori', icon: Tags },
    { id: 'users' as ActiveTab, label: 'Kelola User', icon: Users },
    { id: 'settings' as ActiveTab, label: 'Pengaturan', icon: Settings },
  ];

  const renderSidebarContent = (forceExpanded = false) => {
    const showFull = !isCollapsed || forceExpanded;
    const visibleMenuItems = menuItems.filter(item => {
      const role = currentUser?.role ?? 'superadmin';
      if (role === 'user') {
        return item.id !== 'categories' && item.id !== 'users';
      }
      return true;
    });

    return (
      <div className="flex flex-col h-full bg-[#131926] text-slate-300">
        {/* Brand logo header */}
        <div className={`border-b border-slate-800/60 shrink-0 ${showFull ? 'p-6' : 'p-4 flex justify-center'}`}>
          <div className="flex items-center gap-2.5">
            <div 
              className={`rounded-xl p-2.5 flex items-center justify-center text-white shadow-md cursor-pointer transition-colors ${getColorClass(appLogoColor)}`}
              onClick={() => {
                setActiveTab('dashboard');
                if (!showFull && setIsCollapsed) setIsCollapsed(false);
              }}
              title="Dashboard Utama"
            >
              <SelectedLogoIcon className="w-5 h-5 fill-white/10" />
            </div>
            {showFull && (
              <div>
                <h1 className="font-extrabold text-white text-base xl:text-lg tracking-tight font-sans truncate max-w-[120px] xl:max-w-[140px]" title={appName}>
                  {appName}
                </h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-px">cPanel PHP Native Ready</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Area */}
        <nav className={`flex-grow p-4 space-y-1 overflow-y-auto ${showFull ? 'space-y-1' : 'space-y-3.5 flex flex-col items-center'}`}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  showFull 
                    ? 'gap-3.5 px-4 py-3' 
                    : 'justify-center p-3 w-11 h-11'
                } ${
                  isActive
                    ? getActiveColorClass(appLogoColor)
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={!showFull ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {showFull && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Export cPanel Project ZIP Area */}
        <div className={`border-t border-slate-800 bg-[#0f141f] ${showFull ? 'p-4' : 'p-3 flex justify-center'}`}>
          {showFull ? (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`w-full flex items-center justify-center gap-2 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 ${getColorClass(appLogoColor)}`}
            >
              {isZipping ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Mengepak ZIP...
                </>
              ) : zipSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  ZIP Terunduh!
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download Zip Project
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center justify-center text-white rounded-xl p-3 transition-all hover:scale-110 shadow-md cursor-pointer disabled:opacity-50 w-11 h-11 ${getColorClass(appLogoColor)}`}
              title="Download Zip Project PHP/cPanel"
            >
              {isZipping ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : zipSuccess ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Copyright Footer */}
        <div className="p-4 text-center shrink-0 border-t border-slate-800/40 text-[10px] text-slate-500 font-semibold select-none">
          {showFull ? (
            <>
              © {new Date().getFullYear()} {appName}<br />All rights reserved.
            </>
          ) : (
            '©'
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Sidebar with dynamic width class and transition */}
      <aside className={`hidden lg:flex bg-[#131926] shrink-0 border-r border-slate-800/20 flex-col h-screen sticky top-0 z-20 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64 xl:w-68'
      }`}>
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop screen lock */}
          <div 
            className="fixed inset-0 bg-[#0a0f1d]/75 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer Body container with Slide In CSS Animation */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-sm bg-[#131926] shadow-2xl flex flex-col z-50 animate-slide-in">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 border border-slate-700/60 cursor-pointer transition-colors"
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
