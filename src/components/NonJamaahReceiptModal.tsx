import React, { useState, useEffect } from 'react';
import {
  X,
  Landmark,
  Calendar,
  DollarSign,
  FileText,
  UploadCloud,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ChartOfAccount, UserRole } from '../types';
import { formatIDR } from '../utils/formatters';
import { FileViewerModal } from './FileViewerModal';

interface NonJamaahReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  coaList: ChartOfAccount[];
  onRefreshData: () => Promise<void> | void;
  userRole?: UserRole;
}

export const NonJamaahReceiptModal: React.FC<NonJamaahReceiptModalProps> = ({
  isOpen,
  onClose,
  coaList,
  onRefreshData,
  userRole = 'KASIR_FINANCE'
}) => {
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'RETAINED_EARNINGS' | 'OWNER_CAPITAL' | 'NON_OPERATIONAL_INCOME'>('RETAINED_EARNINGS');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Attachment states
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [viewerFile, setViewerFile] = useState<{ url: string; name: string } | null>(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter Asset Cash/Bank accounts
  const bankAccounts = coaList.filter(
    (a) => a.category === 'ASSET' && ['1101', '1102', '1103', '1104', '1105'].includes(a.code)
  );

  useEffect(() => {
    if (bankAccounts.length > 0 && !bankAccountId) {
      setBankAccountId(bankAccounts[0].id);
    }
  }, [bankAccounts, bankAccountId]);

  if (!isOpen) return null;

  // Selected accounts for journal preview
  const selectedBankCoa = coaList.find((a) => a.id === bankAccountId || a.code === bankAccountId);
  
  let targetCreditCode = '3102';
  let targetCreditName = '3102 - Laba Ditahan Periode Lalu';
  if (category === 'OWNER_CAPITAL') {
    targetCreditCode = '3101';
    targetCreditName = '3101 - Modal Disetor Pemilik';
  } else if (category === 'NON_OPERATIONAL_INCOME') {
    targetCreditCode = '8101';
    targetCreditName = '8101 - Pendapatan Non-Operasional / Lain-Lain';
  }

  const selectedCreditCoa = coaList.find((a) => a.code === targetCreditCode);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentUrl(event.target?.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Nominal penerimaan kas harus lebih besar dari Rp 0.');
      return;
    }

    if (!bankAccountId) {
      setErrorMessage('Pilih Rekening Kas / Bank tujuan terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cash-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptDate,
          category,
          bankAccountId,
          amount: numAmount,
          notes: notes || 'Penerimaan Kas Non-Jamaah',
          attachmentUrl,
          attachmentName,
          createdBy: userRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan penerimaan kas.');
      }

      setSuccessMessage(data.message || 'Penerimaan Kas Lain-Lain berhasil dicatat!');
      await onRefreshData();

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);

    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Input Penerimaan Kas Lain-Lain (Non-Jamaah)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Setoran modal, laba ditahan, atau pendapatan non-operasional
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto min-h-0 flex-1">
            
            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Date & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tanggal Penerimaan</span>
                </label>
                <input
                  type="date"
                  required
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Penerimaan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="RETAINED_EARNINGS">
                    Sisa Saldo / Laba Ditahan Tahun Lalu (Kredit: 3102)
                  </option>
                  <option value="OWNER_CAPITAL">
                    Setoran Modal Pemilik / Pemegang Saham (Kredit: 3101)
                  </option>
                  <option value="NON_OPERATIONAL_INCOME">
                    Pendapatan Non-Operasional / Lain-Lain (Kredit: 8101)
                  </option>
                </select>
              </div>
            </div>

            {/* Target Account & Nominal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rekening Kas / Bank Tujuan (Debit)
                </label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name} ({formatIDR(b.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jumlah Uang Masuk (IDR)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 50000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {amount && !isNaN(parseFloat(amount)) && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                    {formatIDR(parseFloat(amount))}
                  </p>
                )}
              </div>
            </div>

            {/* Transaction Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Catatan / Keterangan Transaksi</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Injeksi modal kerja pemilik untuk awal musim Umrah 1448H"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Attachment File Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lampiran / Upload Bukti Penerimaan
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {attachmentUrl ? (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800 relative z-20">
                    <div className="flex items-center space-x-2.5 truncate">
                      {attachmentUrl.startsWith('data:image') ? (
                        <img
                          src={attachmentUrl}
                          alt="Bukti Preview"
                          className="w-9 h-9 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="text-left truncate">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {attachmentName || 'Bukti Penerimaan'}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          File Siap Diunggah
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setViewerFile({ url: attachmentUrl, name: attachmentName || 'Bukti Penerimaan' })
                      }
                      className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-[11px] font-bold rounded-md hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center space-x-1 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Berkas</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1 py-1 text-slate-500 dark:text-slate-400">
                    <UploadCloud className="w-6 h-6 text-blue-500" />
                    <span className="text-xs font-semibold">Klik atau seret foto / PDF bukti transaksi</span>
                    <span className="text-[10px] text-slate-400">Maksimal 5MB (JPG, PNG, PDF)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Double-Entry Preview Box */}
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-100 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Simulasi Posting Jurnal Otomatis (Double-Entry)</span>
                </span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  PSAK Compliant
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5 font-mono">
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">DEBIT (Penambahan Aset)</span>
                  <span className="text-emerald-400 font-bold block truncate">
                    {selectedBankCoa ? `${selectedBankCoa.code} - ${selectedBankCoa.name}` : 'Kas / Bank'}
                  </span>
                  <span className="text-slate-300 block font-bold mt-0.5">
                    +{formatIDR(parseFloat(amount) || 0)}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">KREDIT (Ekuitas / Pendapatan)</span>
                  <span className="text-blue-400 font-bold block truncate">
                    {selectedCreditCoa ? `${selectedCreditCoa.code} - ${selectedCreditCoa.name}` : targetCreditName}
                  </span>
                  <span className="text-slate-300 block font-bold mt-0.5">
                    +{formatIDR(parseFloat(amount) || 0)}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Transaksi langsung menambah saldo <strong className="text-emerald-400">Likuiditas Kas & Bank</strong> tanpa mengubah Unearned Revenue / Piutang Jamaah.
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan & Posting Jurnal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Attachment Viewer Modal */}
      {viewerFile && (
        <FileViewerModal
          isOpen={Boolean(viewerFile)}
          onClose={() => setViewerFile(null)}
          fileUrl={viewerFile.url}
          fileName={viewerFile.name}
          title="Bukti Penerimaan Kas Non-Jamaah"
        />
      )}
    </>
  );
};
