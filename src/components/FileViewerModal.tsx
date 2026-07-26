import React from 'react';
import { X, Download, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

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
  title = 'Pratinjau Lampiran Dokumen'
}) => {
  if (!isOpen || !fileUrl) return null;

  const isPdf = fileUrl.startsWith('data:application/pdf') || fileUrl.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            {isPdf ? (
              <FileText className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <h3 className="font-bold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-md">{fileName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-950 overflow-auto flex items-center justify-center min-h-[350px]">
          {isPdf ? (
            <div className="w-full h-[65vh] flex flex-col items-center">
              <iframe
                src={fileUrl}
                className="w-full h-full rounded-xl border border-slate-300 dark:border-slate-800 shadow-inner"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="relative flex items-center justify-center max-h-[70vh]">
              <img
                src={fileUrl}
                alt={title}
                className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
              />
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            Tipe Dokumen: {isPdf ? 'PDF Document (.pdf)' : 'Image File (.jpg/.png/.webp)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
