import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { useAuth, getAvatarInitials } from '../context/AuthContext';
import { SwitchAccountModal } from './SwitchAccountModal';
import {
  RefreshCw,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  CheckCircle2
} from 'lucide-react';

interface HeaderNavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onRefreshData: () => void;
  isLoading: boolean;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigateTab?: (tab: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRole,
  setCurrentRole,
  onRefreshData,
  isLoading,
  isCollapsed,
  setIsCollapsed,
  onNavigateTab
}) => {
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800 shadow-sm px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between shrink-0 w-full min-w-0">
      
      {/* Left: Sidebar Toggle + System Real-time Sync Indicator */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-sm transition-colors border border-slate-700 flex items-center space-x-1 shrink-0 cursor-pointer"
          title={isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4 text-blue-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Real-time Status Indicator */}
        <div className="flex items-center space-x-2 shrink-0" title="Status: Real-time Sync">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <p className="text-xs font-semibold text-emerald-400 hidden sm:flex items-center space-x-1">
            <span>Status Sistem:</span>
            <span className="font-normal text-slate-300">Real-time Sync</span>
          </p>
        </div>
      </div>

      {/* Right: Sync Data Button + User Profile & Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Refresh / Sync Button */}
        <button
          onClick={onRefreshData}
          disabled={isLoading}
          className="p-2 sm:px-3 sm:py-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-sm transition-colors flex items-center justify-center space-x-1.5 text-xs border border-slate-700 font-medium shrink-0 cursor-pointer"
          title="Sync / Refresh Data Transaksi"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">Sync Data</span>
        </button>

        {/* User Account Trigger & Dropdown Menu Container */}
        <div className="relative shrink-0" ref={dropdownRef}>
          
          {/* Header Profile Trigger Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition-all hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {/* Avatar Circle with Initials */}
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0 font-mono shadow-md border border-blue-400/30">
              {getAvatarInitials(user)}
            </div>
            
            {/* Desktop Full Name & Role */}
            <div className="hidden sm:block text-left max-w-[150px]">
              <div className="text-xs font-bold text-slate-100 truncate leading-tight">
                {user?.name || 'H. Indra Setiadi'}
              </div>
              <div className="text-[10px] text-blue-400 font-medium truncate mt-0.5">
                {user?.roleTitle || 'Direktur Utama'}
              </div>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
          </button>

          {/* Floating Overlay Profile Dropdown Card */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-slate-900 border border-slate-700/90 shadow-2xl rounded-xl p-4 animate-in fade-in slide-in-from-top-2 text-slate-100">
              
              {/* Header Card: Large Avatar + Details */}
              <div className="flex items-start space-x-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm font-mono shadow-lg shrink-0 border-2 border-blue-400/40">
                  {getAvatarInitials(user)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-white truncate">{user?.name}</div>
                  <div className="mt-0.5 inline-block px-2 py-0.5 bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded-full text-[10px] font-bold">
                    {user?.roleTitle || 'Pengguna ERP'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-1">{user?.email}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">Username: <span className="text-slate-200 font-semibold">@{user?.username}</span></div>
                  
                  {/* Status Badge */}
                  <div className="mt-1.5 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Status: Aktif</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800 my-3"></div>

              {/* Menu Navigation Options */}
              <div className="space-y-1">
                {/* 1. Switch Hak Akses / Ganti Akun */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsSwitchModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">Switch Hak Akses / Ganti Akun</div>
                    <div className="text-[10px] text-slate-400 font-normal">Re-autentikasi password pengguna</div>
                  </div>
                </button>

                {/* 2. Pengaturan & Keamanan Akun */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onNavigateTab) {
                      onNavigateTab('settings');
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2.5 transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white flex items-center justify-center transition-colors shrink-0 border border-slate-700">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">Pengaturan & Keamanan Akun</div>
                    <div className="text-[10px] text-slate-400 font-normal">Ubah kata sandi & kelola profil</div>
                  </div>
                </button>

                {/* 3. Keluar dari Sistem */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center space-x-2.5 transition-colors cursor-pointer group mt-2 border-t border-slate-800/80 pt-2.5"
                >
                  <div className="w-7 h-7 rounded-md bg-rose-500/20 text-rose-400 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">Keluar dari Sistem (Logout)</div>
                    <div className="text-[10px] text-rose-400/80 font-normal">Akhiri sesi aplikasi saat ini</div>
                  </div>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Switch Account Re-Authentication Modal */}
      <SwitchAccountModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        onSuccessSwitch={(newRole) => {
          setCurrentRole(newRole);
        }}
      />

    </header>
  );
};
