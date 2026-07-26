import React from 'react';
import { UserRole } from '../types';
import { getRoleBadge } from '../utils/formatters';
import { ShieldCheck, UserCheck, RefreshCw, ChevronDown, PanelLeft, PanelLeftClose } from 'lucide-react';

interface HeaderNavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onRefreshData: () => void;
  isLoading: boolean;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRole,
  setCurrentRole,
  onRefreshData,
  isLoading,
  isCollapsed,
  setIsCollapsed
}) => {
  const roles: { role: UserRole; label: string }[] = [
    { role: 'ADMIN_CS', label: 'Admin CS / Pendaftaran' },
    { role: 'KASIR_FINANCE', label: 'Kasir & Keuangan' },
    { role: 'ACCOUNTANT', label: 'Senior Accountant' },
    { role: 'DIREKSI_OWNER', label: 'Direksi / Owner' },
  ];

  const roleInfo = getRoleBadge(currentRole);

  const getShortRoleCode = (role: UserRole) => {
    switch (role) {
      case 'ADMIN_CS': return 'CS';
      case 'KASIR_FINANCE': return 'KSR';
      case 'ACCOUNTANT': return 'SA';
      case 'DIREKSI_OWNER': return 'DIR';
      default: return 'SA';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0F172A] text-white border-b border-slate-800 shadow-sm px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between shrink-0 w-full max-w-full overflow-x-hidden min-w-0">
      
      {/* Left: Sidebar Toggle + System Real-time Sync Indicator */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-sm transition-colors border border-slate-700 flex items-center space-x-1 shrink-0"
          title={isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4 text-blue-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Real-time Status Indicator (Compact on Mobile, Full on Desktop) */}
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

      {/* Right: Sync Data Button + Role Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Refresh / Sync Button (Compact Icon on Mobile) */}
        <button
          onClick={onRefreshData}
          disabled={isLoading}
          className="p-2 sm:px-3 sm:py-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-sm transition-colors flex items-center justify-center space-x-1.5 text-xs border border-slate-700 font-medium shrink-0"
          title="Sync / Refresh Data Transaksi"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline">Sync Data</span>
        </button>

        {/* RBAC Role Selector Dropdown */}
        <div className="relative group shrink-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 py-1.5 rounded-sm border border-slate-700 cursor-pointer transition-colors">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            
            {/* Desktop Full View */}
            <div className="hidden sm:block text-left">
              <div className="text-[9px] text-slate-400 leading-none uppercase tracking-widest font-bold">Role Akses</div>
              <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                <span>{roleInfo.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Mobile Compact View */}
            <div className="flex sm:hidden items-center space-x-1 text-xs font-bold text-slate-200">
              <span className="px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded text-[10px] font-mono">
                {getShortRoleCode(currentRole)}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-1 w-52 sm:w-56 bg-[#0F172A] border border-slate-700 rounded-sm shadow-2xl py-1 hidden group-hover:block z-50">
            <div className="px-3 py-2 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Ganti Hak Akses:
            </div>
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => setCurrentRole(r.role)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 transition-colors ${
                  currentRole === r.role
                    ? 'bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <UserCheck className={`w-3.5 h-3.5 ${currentRole === r.role ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </header>
  );
};

