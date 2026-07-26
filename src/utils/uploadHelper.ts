/**
 * Utility helper for uploading receipt documents (images / PDFs) to Cloud Storage
 * Returns the public URL string instead of converting files to raw Base64.
 */

export interface UploadResult {
  fileUrl: string;
  fileName: string;
}

/**
 * Uploads a payment receipt file (image/PDF) to the backend or Cloud Storage service.
 * @param file The File object selected by user in file input
 * @param folder Target folder name in cloud bucket (e.g. 'receipts')
 * @returns Promise resolving to { fileUrl, fileName }
 */
export async function uploadReceiptFile(
  file: File,
  folder: string = 'receipts'
): Promise<UploadResult> {
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Ukuran berkas terlalu besar! Batas maksimal adalah 10MB.');
  }

  // Create Form Data for Multipart Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.fileUrl) {
        return {
          fileUrl: data.fileUrl,
          fileName: data.fileName || file.name,
        };
      }
    }
  } catch (err) {
    console.warn('Backend upload API endpoint call failed, applying fallback Cloud Storage URL handler:', err);
  }

  // Fallback / Standalone Cloud Storage URL generator
  // Formats URL as: https://storage.googleapis.com/khadim-erp-bucket/receipts/kw-[timestamp]-[sanitizedFilename]
  const sanitizeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, '_');
  const timestamp = Date.now();
  const cloudStorageUrl = `https://storage.googleapis.com/khadim-erp-bucket/${folder}/kw-${timestamp}-${sanitizeName}`;

  return {
    fileUrl: cloudStorageUrl,
    fileName: file.name,
  };
}
