import React, { useState } from 'react';
import { useAuth, DEFAULT_USERS } from '../context/AuthContext';
import { Building2, Lock, User, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Username atau Email wajib diisi!');
      return;
    }
    if (!password) {
      setErrorMsg('Kata sandi wajib diisi!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(username, password, rememberMe);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  const handleQuickLogin = (userCred: typeof DEFAULT_USERS[0]) => {
    setUsername(userCred.username);
    setPassword(userCred.passwordHash);
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      login(userCred.username, userCred.passwordHash, true);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 font-sans relative overflow-hidden">
      
      {/* Background Decorative Gradients & Geometric Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/20 via-blue-900/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Branding */}
      <div className="w-full max-w-md text-center pt-4 sm:pt-6 pb-2">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl shadow-blue-900/30 ring-1 ring-blue-400/30 mb-3">
          <Building2 className="w-8 h-8 text-white shrink-0" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
          PT. KHADIM ALHARAMAIN
        </h1>
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-0.5">
          TOUR & TRAVEL • PERIZINAN PPIU NO. 9120201920831
        </p>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Sistem Informasi Keuangan & Operasional Umrah & Haji Plus
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 my-auto relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>Masuk Sistem ERP</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Masukkan kredensial akun Anda untuk mengakses dashboard.</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Username atau Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <span>Ingat Sesi Saya</span>
            </label>
            <span className="text-slate-500 text-[11px]">Enkripsi Sesi Aktif</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memverifikasi Kredensial...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Login Options */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Demo Quick Login (1-Klik Masuk)</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {DEFAULT_USERS.map((usr) => (
              <button
                key={usr.id}
                type="button"
                onClick={() => handleQuickLogin(usr)}
                className="w-full p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-xl transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 font-mono">
                    {usr.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 truncate">
                      {usr.roleTitle}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      user: <span className="text-slate-300 font-semibold">{usr.username}</span> | pass: <span className="text-slate-300">{usr.passwordHash}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 ml-2">
                  Masuk
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="w-full text-center py-4 text-[11px] text-slate-500 font-medium">
        © 2026 PT. Khadim Alharamain Tour & Travel — Enterprise Financial ERP System V2.5
      </div>
    </div>
  );
};
