import React, { useState } from 'react';
import { X, Download, FileText, Image as ImageIcon, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName?: string;
  title?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName = 'lampiran-dokumen',
  title = 'Pratinjau Lampiran Bukti Transfer'
}) => {
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !fileUrl) return null;

  // Determine file format
  const isPdf =
    fileUrl.startsWith('data:application/pdf') ||
    fileUrl.toLowerCase().endsWith('.pdf') ||
    fileUrl.includes('application/pdf');

  // Fallback valid image for broken external sample links
  const defaultFallbackImage = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName.endsWith('.pdf') || fileName.endsWith('.jpg') || fileName.endsWith('.png') 
        ? fileName 
        : `${fileName}${isPdf ? '.pdf' : '.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-800 overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            {isPdf ? (
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-white truncate">{title}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">{fileName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
              title="Unduh Berkas Ke Perangkat"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 p-4 sm:p-6 bg-slate-950/80 overflow-auto flex items-center justify-center min-h-[360px]">
          {isPdf ? (
            <div className="w-full h-[65vh] flex flex-col items-center justify-center bg-slate-900 rounded-xl border border-slate-800 p-2 shadow-inner">
              <object
                data={fileUrl}
                type="application/pdf"
                className="w-full h-full rounded-lg"
              >
                <iframe
                  src={fileUrl}
                  className="w-full h-full rounded-lg"
                  title="Pratinjau PDF Bukti Transfer"
                />
              </object>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center max-h-[70vh] w-full">
              {!imageError ? (
                <img
                  src={fileUrl}
                  alt={title}
                  onError={() => setImageError(true)}
                  className="max-h-[66vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-md">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-200 mb-1">Gagal Memuat Berkas Asli</h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Berkas asli belum tersimpan di Cloud Storage atau tautan telah kedaluwarsa. Menampilkan sampel bukti kwitansi resmi.
                  </p>
                  <img
                    src={defaultFallbackImage}
                    alt="Sample Kwitansi"
                    className="max-h-56 rounded-lg border border-slate-700 shadow-md mb-4"
                  />
                  <button
                    onClick={() => setImageError(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Coba Muat Ulang</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px] truncate max-w-md">
            Format: {isPdf ? 'Dokumen PDF (.pdf)' : 'Format Gambar (Data URL / Image)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-all cursor-pointer text-xs"
          >
            Tutup Pratinjau
          </button>
        </div>

      </div>
    </div>
  );
};
