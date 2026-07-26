import React, { useState, useEffect } from 'react';
import { useAuth, getAvatarInitials } from '../context/AuthContext';
import { UserRole } from '../types';
import { RefreshCw, KeyRound, Eye, EyeOff, ShieldCheck, X, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSwitch?: (newRole: UserRole) => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccessSwitch
}) => {
  const { user, usersList, login } = useAuth();
  
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Set default target user when modal opens (select first user or another account)
  useEffect(() => {
    if (isOpen && usersList.length > 0) {
      // Pick first user that is not the current user if possible, otherwise first user
      const otherUser = usersList.find((u) => u.username !== user?.username) || usersList[0];
      setSelectedUsername(otherUser.username);
      setPasswordInput('');
      setShowPassword(false);
      setErrorMsg('');
      setSuccessMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen, usersList, user]);

  if (!isOpen) return null;

  const targetUser = usersList.find((u) => u.username === selectedUsername) || usersList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedUsername) {
      setErrorMsg('Silakan pilih akun tujuan terlebih dahulu!');
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Masukkan kata sandi akun tujuan!');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(selectedUsername, passwordInput);
      if (res.success) {
        setSuccessMsg(res.message || `Berhasil beralih ke akun ${targetUser?.name || selectedUsername}!`);
        if (targetUser && onSuccessSwitch) {
          onSuccessSwitch(targetUser.role);
        }
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 800);
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.message || 'Kata sandi salah. Silakan coba lagi.');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100 space-y-0">
        
        {/* Header Dialog */}
        <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
                <span>Ganti Akses Akun</span>
              </h3>
              <p className="text-[11px] text-slate-400">Re-autentikasi kata sandi untuk beralih sesi pengguna</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Active Logged-in Info */}
          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Sesi Aktif Sekarang:</span>
            <span className="font-bold text-blue-400 font-mono">@{user?.username} ({user?.name})</span>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-lg text-rose-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Account Select */}
          <div>
            <label className="block font-bold text-slate-200 mb-1.5">
              Pilih Akun Tujuan <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedUsername}
              onChange={(e) => {
                setSelectedUsername(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
            >
              {usersList.map((usr) => (
                <option key={usr.id} value={usr.username}>
                  {usr.name} — {usr.roleTitle || usr.role} (@{usr.username})
                </option>
              ))}
            </select>
          </div>

          {/* Target User Info Card Preview */}
          {targetUser && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-lg flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs font-mono shrink-0 shadow-md">
                {getAvatarInitials(targetUser)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-100 truncate">{targetUser.name}</div>
                <div className="text-[10px] text-blue-300 font-medium truncate">{targetUser.roleTitle} • @{targetUser.username}</div>
                <div className="text-[10px] text-slate-400 truncate">{targetUser.email}</div>
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block font-bold text-slate-200 mb-1.5">
              Masukkan Kata Sandi Akun Tujuan <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Kata sandi akun tujuan..."
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-lg shadow-md transition-colors text-xs flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-white" />
                  <span>Konfirmasi Ganti Akun</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
