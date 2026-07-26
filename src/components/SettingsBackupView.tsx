import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuth, getAvatarInitials, UserCredential } from '../context/AuthContext';
import {
  JamaahRegistration,
  Jamaah,
  TravelPackage,
  DepartureKloter,
  JournalEntry,
  ChartOfAccount,
  Vendor,
  VendorBill,
  VendorPayment,
  UserRole
} from '../types';
import { getRolePermissions } from '../utils/rbac';
import { formatIDR } from '../utils/formatters';
import {
  Settings,
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  HardDrive,
  ShieldCheck,
  FileJson,
  KeyRound,
  Eye,
  EyeOff,
  User,
  UserCog,
  Edit,
  ShieldAlert,
  X,
  Crown,
  Users
} from 'lucide-react';

interface SettingsBackupViewProps {
  registrations: JamaahRegistration[];
  jamaahList: Jamaah[];
  packages: TravelPackage[];
  kloters: DepartureKloter[];
  journals: JournalEntry[];
  coaList: ChartOfAccount[];
  vendors: Vendor[];
  vendorBills: VendorBill[];
  vendorPayments?: VendorPayment[];
  userRole?: UserRole;
  onRefreshData: () => void;
}

export const SettingsBackupView: React.FC<SettingsBackupViewProps> = ({
  registrations,
  jamaahList,
  packages,
  kloters,
  journals,
  coaList,
  vendors,
  vendorBills,
  vendorPayments = [],
  userRole = 'ACCOUNTANT',
  onRefreshData
}) => {
  const perm = getRolePermissions(userRole);
  const { user, changePassword, usersList, updateUserByAdmin, resetUserPasswordByAdmin } = useAuth();

  const isDirekturUtama = user?.role === 'DIREKSI_OWNER' || userRole === 'DIREKSI_OWNER';

  // Admin User Management State
  const [editingUser, setEditingUser] = useState<UserCredential | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editRole, setEditRole] = useState<UserRole>('ACCOUNTANT');

  const [resetPwdUser, setResetPwdUser] = useState<UserCredential | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState<string>('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState<string>('');

  const [userMgmtSuccessMsg, setUserMgmtSuccessMsg] = useState<string>('');
  const [userMgmtErrorMsg, setUserMgmtErrorMsg] = useState<string>('');

  const handleOpenEditUser = (usr: UserCredential) => {
    setEditingUser(usr);
    setEditName(usr.name);
    setEditEmail(usr.email);
    setEditUsername(usr.username);
    setEditRole(usr.role);
    setUserMgmtSuccessMsg('');
    setUserMgmtErrorMsg('');
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim()) {
      setUserMgmtErrorMsg('Nama lengkap tidak boleh kosong!');
      return;
    }
    if (!editEmail.trim()) {
      setUserMgmtErrorMsg('Email tidak boleh kosong!');
      return;
    }
    if (!editUsername.trim()) {
      setUserMgmtErrorMsg('Username tidak boleh kosong!');
      return;
    }

    const res = updateUserByAdmin(editingUser.id, {
      name: editName,
      email: editEmail,
      username: editUsername,
      role: editRole
    });

    if (res.success) {
      setUserMgmtSuccessMsg(res.message);
      setEditingUser(null);
    } else {
      setUserMgmtErrorMsg(res.message);
    }
  };

  const handleOpenResetPwd = (usr: UserCredential) => {
    setResetPwdUser(usr);
    setAdminNewPassword('');
    setAdminConfirmPassword('');
    setUserMgmtSuccessMsg('');
    setUserMgmtErrorMsg('');
  };

  const handleConfirmResetPwd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdUser) return;

    if (!adminNewPassword) {
      setUserMgmtErrorMsg('Password baru wajib diisi!');
      return;
    }
    if (adminNewPassword.length < 6) {
      setUserMgmtErrorMsg('Password baru minimal 6 karakter!');
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setUserMgmtErrorMsg('Konfirmasi password tidak cocok!');
      return;
    }

    const res = resetUserPasswordByAdmin(resetPwdUser.id, adminNewPassword);
    if (res.success) {
      setUserMgmtSuccessMsg(res.message);
      setResetPwdUser(null);
    } else {
      setUserMgmtErrorMsg(res.message);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassCurrent, setShowPassCurrent] = useState<boolean>(false);
  const [showPassNew, setShowPassNew] = useState<boolean>(false);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState<string>('');
  const [pwdErrorMsg, setPwdErrorMsg] = useState<string>('');
  const [isChangingPwd, setIsChangingPwd] = useState<boolean>(false);

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccessMsg('');
    setPwdErrorMsg('');

    if (!currentPassword) {
      setPwdErrorMsg('Kata sandi saat ini wajib diisi!');
      return;
    }
    if (!newPassword) {
      setPwdErrorMsg('Kata sandi baru wajib diisi!');
      return;
    }
    if (newPassword.length < 6) {
      setPwdErrorMsg('Kata sandi baru minimal 6 karakter!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    setIsChangingPwd(true);
    setTimeout(() => {
      const res = changePassword(currentPassword, newPassword);
      setIsChangingPwd(false);
      if (res.success) {
        setPwdSuccessMsg(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdErrorMsg(res.message);
      }
    }, 300);
  };

  // File Upload state for restore preview
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreDataPreview, setRestoreDataPreview] = useState<any | null>(null);

  const getTodayFormatted = () => new Date().toISOString().split('T')[0];

  // --- 1. Export Data Jamaah & Piutang (Excel & CSV) ---
  const handleExportJamaah = (format: 'xlsx' | 'csv') => {
    try {
      const dataRows = registrations.map((reg) => {
        const jam = jamaahList.find((j) => j.id === reg.jamaahId);
        const pkg = packages.find((p) => p.id === reg.packageId);
        const klt = kloters.find((k) => k.id === reg.kloterId);

        return {
          'No. Registrasi': reg.registrationNumber,
          'NIK Jamaah': jam?.nik || '-',
          'Nama Lengkap': jam?.fullName || 'Jamaah',
          'Jenis Kelamin': jam?.gender === 'MALE' ? 'Laki-Laki' : 'Perempuan',
          'No. Telepon': jam?.phone || '-',
          'Paket Selected': pkg?.name || '-',
          'Tipe Kamar': reg.roomType,
          'Kloter Keberangkatan': klt?.name || '-',
          'Tanggal Keberangkatan': klt?.departureDate || '-',
          'Harga Paket (IDR)': reg.totalBill,
          'Sudah Dibayar (IDR)': reg.paidAmount,
          'Sisa Piutang (IDR)': reg.balanceDue,
          'Status Pembayaran': reg.status
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Jamaah & Piutang');

      const filename = `Data_Jamaah_Piutang_${getTodayFormatted()}.${format}`;
      if (format === 'csv') {
        XLSX.writeFile(workbook, filename, { bookType: 'csv' });
      } else {
        XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
      }

      setSuccessMessage(`Berhasil mengunduh data jamaah & piutang (${filename})`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(`Gagal melakukan ekspor: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // --- 2. Export Laporan Jurnal & Keuangan (Excel) ---
  const handleExportFinancialReports = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Jurnal Umum
      const journalRows: any[] = [];
      journals.forEach((j) => {
        j.lines.forEach((l) => {
          journalRows.push({
            'No. Jurnal': j.journalNumber,
            Tanggal: j.transactionDate,
            'Tipe Ref': j.referenceType,
            'No. Ref': j.referenceId || '-',
            Deskripsi: j.description,
            'Kode Akun': l.accountCode,
            'Nama Akun': l.accountName,
            'Debit (IDR)': l.debit,
            'Kredit (IDR)': l.credit,
            Memo: l.memo || '-'
          });
        });
      });
      const wsJournals = XLSX.utils.json_to_sheet(journalRows);
      XLSX.utils.book_append_sheet(workbook, wsJournals, 'Jurnal Umum');

      // Sheet 2: Buku Besar (General Ledger)
      const ledgerRows: any[] = [];
      coaList.forEach((coa) => {
        let runningBalance = 0;
        journals.forEach((j) => {
          j.lines
            .filter((l) => l.accountId === coa.id || l.accountCode === coa.code)
            .forEach((l) => {
              if (coa.category === 'ASSET' || coa.category === 'COGS' || coa.category === 'EXPENSE') {
                runningBalance += l.debit - l.credit;
              } else {
                runningBalance += l.credit - l.debit;
              }

              ledgerRows.push({
                'Kode Akun': coa.code,
                'Nama Akun': coa.name,
                Kategori: coa.category,
                'No. Jurnal': j.journalNumber,
                Tanggal: j.transactionDate,
                'Ref / Memo': l.memo || j.description,
                'Debit (IDR)': l.debit,
                'Kredit (IDR)': l.credit,
                'Saldo Akhir (IDR)': runningBalance
              });
            });
        });
      });
      const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
      XLSX.utils.book_append_sheet(workbook, wsLedger, 'Buku Besar');

      // Sheet 3: Margin per Kloter
      const kloterRows = kloters.map((klt) => {
        const regs = registrations.filter((r) => r.kloterId === klt.id && r.status !== 'CANCELLED');
        const totalJamaah = regs.length;

        let revenue = 0;
        regs.forEach((r) => {
          if (klt.isRevenueRecognized) revenue += r.paidAmount;
        });

        const bills = vendorBills.filter((b) => b.kloterId === klt.id);
        const totalCOGS = bills.reduce((acc, b) => acc + b.totalAmount, 0);
        const grossProfit = revenue - totalCOGS;
        const marginPct = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) + '%' : '0%';

        return {
          'Nama Kloter': klt.name,
          'Kode Kloter': klt.code,
          'Tgl Keberangkatan': klt.departureDate,
          'Total Jamaah': totalJamaah,
          'Pengakuan Pendapatan': klt.isRevenueRecognized ? 'SUDAH DIAKUI' : 'DITUNDA (UNEARNED)',
          'Total Pendapatan Diakui (IDR)': revenue,
          'Total Realisasi HPP (IDR)': totalCOGS,
          'Laba Kotor (IDR)': grossProfit,
          'Profit Margin': marginPct,
          Status: klt.status
        };
      });
      const wsKloter = XLSX.utils.json_to_sheet(kloterRows);
      XLSX.utils.book_append_sheet(workbook, wsKloter, 'Laba Rugi per Kloter');

      const filename = `Laporan_Keuangan_Lengkap_${getTodayFormatted()}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setSuccessMessage(`Berhasil mengunduh Laporan Keuangan Lengkap (${filename})`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(`Gagal ekspor laporan keuangan: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // --- 3. Download Backup Database JSON ---
  const handleDownloadBackupJson = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Gagal mengambil data backup dari server.');

      const backupData = await res.json();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Backup_Khadim_Alharamain_ERP_${getTodayFormatted()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSuccessMessage('Backup database JSON berhasil diunduh!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(`Gagal mendownload backup: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  // --- 4. Restore Data JSON ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setErrorMessage('Mohon unggah file dengan ekstensi .json!');
      return;
    }

    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.coaList || !parsed.registrationList) {
          throw new Error('Struktur file JSON tidak valid. Pastikan file berasal dari menu backup aplikasi.');
        }
        setRestoreDataPreview(parsed);
      } catch (err: any) {
        setErrorMessage(err.message || 'File JSON rusak atau format tidak cocok.');
        setRestoreDataPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!restoreDataPreview) return;

    if (
      !confirm(
        'PERINGATAN DANGER ZONE!\n\nProses pemulihan akan MENGGANTIKAN seluruh data sistem saat ini dengan data dari file backup.\n\nApakah Anda yakin ingin melanjutkan?'
      )
    ) {
      return;
    }

    try {
      setIsRestoring(true);
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restoreDataPreview)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal melakukan restore.');

      setSuccessMessage(data.message || 'Database berhasil dipulihkan!');
      setRestoreFile(null);
      setRestoreDataPreview(null);
      setTimeout(() => setSuccessMessage(''), 5000);
      onRefreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memulihkan data.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Pengaturan & Backup Data Sistem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor data keuangan, jamaah, laporan akuntansi, keamanan kata sandi, dan pemeliharaan cadangan database (Backup & Restore)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-sm shadow-sm transition-all flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Security & Password Change Card */}
      <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        {/* User Badge Profile Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base font-mono shadow-md ring-2 ring-blue-400/20 shrink-0">
              {getAvatarInitials(user)}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {user?.name || 'Hafiva Rizky Balqis'}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-700/50">
                  {user?.roleTitle || 'Senior Accountant'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {user?.email || 'accountant@khadimalharamain.com'} • Username: <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.username}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 pt-1">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Keamanan & Kata Sandi Akun
            </h3>
            <p className="text-[11px] text-slate-500">Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data finansial.</p>
          </div>
        </div>

        {pwdSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pwdSuccessMsg}</span>
          </div>
        )}

        {pwdErrorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{pwdErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi Saat Ini <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassCurrent(!showPassCurrent)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassNew(!showPassNew)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPwd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs transition-colors text-xs flex items-center space-x-1.5 disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isChangingPwd ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Manajemen Pengguna Sistem (Direktur Utama Only) */}
      {!isDirekturUtama ? (
        <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-2">
            <UserCog className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Manajemen Pengguna Sistem (User Management)
            </h3>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-100">Akses Terbatas: Fitur Manajemen Pengguna hanya dapat diakses oleh Direktur Utama.</p>
              <p className="text-[11px] mt-0.5 text-amber-700 dark:text-amber-300">
                Silakan hubungi Direktur Utama (H. Indra Setiadi) jika Anda memerlukan perubahan role, username, atau reset password akun.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <UserCog className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Manajemen Pengguna Sistem</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-700/50 flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Akses Direktur Utama</span>
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kelola informasi akun personel, penugasan role/jabatan, dan reset kata sandi pengguna ERP.
                </p>
              </div>
            </div>
          </div>

          {userMgmtSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{userMgmtSuccessMsg}</span>
            </div>
          )}

          {userMgmtErrorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{userMgmtErrorMsg}</span>
            </div>
          )}

          {/* Table Daftar Pengguna */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Pengguna & Username</th>
                  <th className="p-3">Role / Jabatan</th>
                  <th className="p-3">Email Kontak</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi / Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs font-mono shadow-xs shrink-0">
                          {getAvatarInitials(usr)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{usr.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{usr.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] rounded border border-slate-200 dark:border-slate-700">
                        {usr.roleTitle || usr.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {usr.email}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Aktif</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditUser(usr)}
                          className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-[11px] font-bold flex items-center space-x-1 border border-blue-200 dark:border-blue-700/50 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={() => handleOpenResetPwd(usr)}
                          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded text-[11px] font-bold flex items-center space-x-1 border border-amber-200 dark:border-amber-700/50 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset Password</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit Detail Akun */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <UserCog className="w-4 h-4 text-blue-600" />
                <span>Edit Detail Akun Pengguna</span>
              </h4>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role / Hak Akses Sistem <span className="text-red-500">*</span>
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="DIREKSI_OWNER">Direktur Utama (Pemilik & Direksi)</option>
                  <option value="ACCOUNTANT">Senior Accountant (Akuntan)</option>
                  <option value="ADMIN_CS">Administrator ERP & CS / Sales</option>
                  <option value="KASIR_FINANCE">Tim Operasional & Kasir Keuangan</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetPwdUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Reset Password Pengguna</span>
              </h4>
              <button
                onClick={() => setResetPwdUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-800 dark:text-amber-200">
              Anda akan mereset kata sandi untuk akun <span className="font-bold">{resetPwdUser.name}</span> (@{resetPwdUser.username}).
            </div>

            <form onSubmit={handleConfirmResetPwd} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetPwdUser(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs shadow-xs"
                >
                  Konfirmasi Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-sm border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-sm border border-red-300 dark:border-red-800 text-xs font-semibold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Export Options & Database Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Ekspor Laporan & Jamaah */}
        <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ekspor Laporan Keuangan & Data Jamaah</h3>
              <p className="text-[11px] text-slate-500">Unduh data operasional dalam format Excel (.xlsx) atau CSV</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Action 1: Jamaah & Piutang */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Data Jamaah & Piutang</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Daftar seluruh jamaah, NIK, paket pilihan, status pelunasan, & sisa piutang ({registrations.length} Pendaftaran).
                </p>
              </div>

              <div className="flex space-x-2 shrink-0">
                <button
                  onClick={() => handleExportJamaah('xlsx')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-sm text-[11px] flex items-center space-x-1 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExportJamaah('csv')}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-sm text-[11px] flex items-center space-x-1 transition-colors"
                >
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Action 2: Laporan Keuangan Lengkap */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Jurnal Umum, Buku Besar, & Margin Kloter</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Workbook Excel multi-sheet berisi seluruh transaksi Jurnal, Buku Besar COA, & Laporan Laba Rugi Per Kloter.
                </p>
              </div>

              <button
                onClick={handleExportFinancialReports}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-[11px] flex items-center space-x-1.5 shadow-sm transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Workbook Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Backup Database JSON */}
        <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Backup Cadangan Database JSON</h3>
              <p className="text-[11px] text-slate-500">Simpan salinan cadangan offline dari seluruh master data & entri akuntansi</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-sm border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                    <FileJson className="w-4 h-4 text-amber-500" />
                    <span>Download Full Database JSON Backup</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mengunduh struktur Master Paket, Kloter, Jamaah, COA, Jurnal Umum, & HPP Vendor dalam satu file .json.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-500">Versi Skema ERP: v2.5</span>
                <button
                  onClick={handleDownloadBackupJson}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-sm text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Mengunduh...' : 'Unduh File JSON Backup'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Card 3: Restore Data (Danger Zone / Admin Only) */}
      <div className="bg-white dark:bg-slate-900 rounded-sm border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <HardDrive className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Pemulihan Database (Restore Data JSON)</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-[10px] font-bold rounded-full">
                Khusus Admin
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Unggah file backup `.json` untuk memulihkan seluruh data ERP jika terjadi migrasi atau kegagalan sistem</p>
          </div>
        </div>

        {perm.isReadOnly || !perm.canDeleteData ? (
          <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-sm border border-slate-300 dark:border-slate-700 text-slate-500 text-xs flex items-center space-x-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Peran akses Anda tidak memiliki izin untuk melakukan restore/pemulihan database.</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-sm p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Pilih atau Geser File Backup JSON ke sini
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Format yang didukung: file `.json` yang diekspor dari aplikasi Khadim Alharamain ERP.
              </p>

              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="mt-3 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-200 cursor-pointer"
              />
            </div>

            {/* Restore Preview */}
            {restoreDataPreview && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 rounded-sm space-y-3">
                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Ringkasan Data yang Akan Dipulihkan:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border border-amber-200 dark:border-slate-700">
                    <span className="text-slate-500 block text-[10px]">Total Jamaah:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{restoreDataPreview.jamaahList?.length || 0} orang</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border border-amber-200 dark:border-slate-700">
                    <span className="text-slate-500 block text-[10px]">Entri Jurnal:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{restoreDataPreview.journalList?.length || 0} entri</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border border-amber-200 dark:border-slate-700">
                    <span className="text-slate-500 block text-[10px]">Akun COA:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{restoreDataPreview.coaList?.length || 0} akun</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border border-amber-200 dark:border-slate-700">
                    <span className="text-slate-500 block text-[10px]">Tagihan Vendor:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{restoreDataPreview.vendorBillList?.length || 0} tagihan</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-amber-800/60">
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
                    * Data lama di server akan ditimpa secara penuh dengan data file backup ini.
                  </p>
                  <button
                    onClick={handleConfirmRestore}
                    disabled={isRestoring}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isRestoring ? 'Memproses Restore...' : 'Konfirmasi & Restore Data'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
