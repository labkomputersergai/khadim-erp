/**
 * Utility helper for uploading receipt documents (images / PDFs)
 * Converts uploaded file into a Data URL (Base64) or Object URL so it can be previewed
 * and downloaded natively in the browser without 404 / GCS NoSuchKey errors.
 */

export interface UploadResult {
  fileUrl: string;
  fileName: string;
}

/**
 * Reads a File object and converts it to a browser-compatible Data URL string.
 * @param file The File object selected by user in file input
 * @param _folder Target folder parameter (preserved for interface signature)
 * @returns Promise resolving to { fileUrl, fileName }
 */
export async function uploadReceiptFile(
  file: File,
  _folder: string = 'receipts'
): Promise<UploadResult> {
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Ukuran berkas terlalu besar! Batas maksimal adalah 10MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          fileUrl: reader.result,
          fileName: file.name
        });
      } else {
        reject(new Error('Gagal membaca berkas unggahan.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Terjadi kesalahan saat membaca berkas di browser.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Alternative helper to generate a temporary Object URL for immediate local preview
 */
export function createLocalObjectUrl(file: File): { fileUrl: string; fileName: string } {
  const objectUrl = URL.createObjectURL(file);
  return {
    fileUrl: objectUrl,
    fileName: file.name
  };
}
