import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { useAuth, getAvatarInitials } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Boxes,
  Building,
  PlaneTakeoff,
  BookOpen,
  Landmark,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  LogOut,
  X
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  allowedTabs: string[];
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  allowedTabs,
  isCollapsed,
  setIsCollapsed
}) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (itemId: string) => {
    setActiveTab(itemId);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'jamaah', label: 'Tagihan & Piutang Jamaah', icon: Users },
    { id: 'packages', label: 'Master Paket & Harga', icon: Boxes },
    { id: 'mitra', label: 'Manajemen Mitra & Komisi', icon: UserCheck },
    { id: 'vendors', label: 'Vendor & HPP Operasional', icon: Building },
    { id: 'kloter', label: 'Kloter & Pengakuan Pendapatan', icon: PlaneTakeoff },
    { id: 'journals', label: 'Jurnal Umum & Buku Besar', icon: BookOpen },
    { id: 'coa', label: 'Chart of Accounts (COA)', icon: Landmark },
    { id: 'reports', label: 'Laporan Keuangan & Margin', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan & Backup Data', icon: Settings }
  ];

  const visibleNavItems = allNavItems.filter((item) => allowedTabs.includes(item.id));

  return (
    <>
      {/* Backdrop for Mobile Overlay when Expanded */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden cursor-pointer"
          onClick={() => setIsCollapsed(true)}
          title="Tutup Menu Sidebar"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen flex flex-col justify-between bg-[#0F172A] text-slate-100 border-r border-slate-800 transition-all duration-300 ease-in-out overflow-x-hidden ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobile && !isCollapsed ? 'z-50 shadow-2xl' : 'z-40'}`}
      >
        {/* Sidebar Header / Branding */}
        <div
          className={`h-16 flex items-center border-b border-slate-800 shrink-0 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-sm bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shrink-0 text-xs font-mono">
              KA
            </div>
            {!isCollapsed && (
              <div className="truncate transition-opacity duration-300">
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-bold text-sm text-white tracking-tight truncate">
                    Khadim Alharamain
                  </h1>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Sistem Informasi Keuangan
                </p>
              </div>
            )}
          </div>

          {/* Minimize Toggle Button on Header */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kecilkan Sidebar"
            >
              {isMobile ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Sidebar Nav List (Scrollable Area with Hidden Scrollbar) */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isCollapsed ? 'py-3 px-2 space-y-1.5' : 'py-4 px-3 space-y-1'
          }`}
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full py-2.5 rounded-sm text-xs font-medium flex items-center transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center px-2' : 'justify-start px-3 space-x-3'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md ring-1 ring-blue-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>

                {/* Tooltip on Collapsed Hover */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 border border-slate-700 flex items-center space-x-1">
                    <span>{item.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer / Expand Toggle & Logout */}
        <div className={`border-t border-slate-800 shrink-0 bg-[#0F172A] ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {!isCollapsed && user && (
            <div className="mb-2 p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 pr-1">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-mono shadow-xs">
                  {getAvatarInitials(user)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-blue-400 font-medium truncate">{user.roleTitle}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors shrink-0 cursor-pointer"
                title="Keluar / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isCollapsed ? (
            <div className="space-y-1.5 flex flex-col items-center">
              {/* User Avatar Circle on Collapsed */}
              {user && (
                <div className="relative group w-full flex justify-center py-1">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs font-mono shadow-md border border-blue-400/40 shrink-0 cursor-default">
                    {getAvatarInitials(user)}
                  </div>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-[10px] text-blue-400 font-medium">{user.roleTitle}</p>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <div className="relative group w-full">
                <button
                  onClick={logout}
                  className="w-full py-2 flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-sm transition-colors cursor-pointer"
                  title="Keluar dari Sistem (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-rose-950 text-rose-200 text-xs rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50 border border-rose-800 shadow-lg">
                  Keluar (Logout)
                </div>
              </div>

              {/* Expand Sidebar Button */}
              <div className="relative group w-full">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="w-full py-2 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm transition-colors cursor-pointer"
                  title="Perluas Sidebar"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50 border border-slate-700 shadow-lg">
                  Perluas Menu
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="font-mono text-[10px] uppercase text-slate-500">v2.5 ERP</span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs font-medium py-1 px-2 rounded hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sembunyikan</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
