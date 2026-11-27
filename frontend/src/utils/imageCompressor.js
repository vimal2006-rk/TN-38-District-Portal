/**
 * Converts and resizes an uploaded image file (JPG, PNG, WebP) to an optimized WebP File
 * in the browser before upload, cutting transfer payload and ensuring fast loading.
 */
const CONVERTIBLE_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

export async function convertImageToWebp(
  file,
  { maxDim = 1200, quality = 0.85, maxOutputBytes = 5 * 1024 * 1024 } = {}
) {
  if (!file) throw new Error('No file provided');
  if (!CONVERTIBLE_MIME.has(file.type)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
        const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
        const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error('Failed to process image'));
              return;
            }
            if (blob.size > maxOutputBytes) {
              reject(new Error(`Compressed image exceeds ${(maxOutputBytes / (1024 * 1024)).toFixed(0)}MB limit.`));
              return;
            }
            const isWebp = blob.type === 'image/webp';
            const ext = isWebp ? '.webp' : '.png';
            const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
            const convertedFile = new File([blob], `${baseName}${ext}`, { type: blob.type });
            resolve(convertedFile);
          },
          'image/webp',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid or corrupted image file.'));
    };

    img.src = objectUrl;
  });
}
