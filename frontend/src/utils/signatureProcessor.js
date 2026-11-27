/**
 * Automatically removes white/light paper background from an uploaded signature image
 * using HTML5 Canvas pixel processing, returning a clean transparent PNG File.
 */
export async function removeSignatureBackground(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const maxDim = 900;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Estimate paper background brightness from corner samples
        const samplePoints = [
          0,
          (width - 1) * 4,
          (height - 1) * width * 4,
          ((height - 1) * width + (width - 1)) * 4,
        ];
        let bgLumSum = 0;
        for (let s = 0; s < samplePoints.length; s++) {
          const idx = samplePoints[s];
          bgLumSum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        }
        const avgBgLum = bgLumSum / samplePoints.length;
        const threshold = Math.max(150, Math.min(225, avgBgLum - 28));
        const aaLower = threshold - 25;
        const invAaRange = 255 / 25;

        for (let i = 0, len = data.length; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxC = r > g ? (r > b ? r : b) : (g > b ? g : b);
          const minC = r < g ? (r < b ? r : b) : (g < b ? g : b);
          const sat = maxC - minC;

          if (lum > threshold && sat < 55) {
            data[i + 3] = 0;
          } else if (lum > aaLower && sat < 45) {
            const alpha = ((threshold - lum) * invAaRange + 0.5) | 0;
            data[i + 3] = alpha < 0 ? 0 : alpha > 255 ? 255 : alpha;
          } else {
            data[i] = (r * 0.85 + 0.5) | 0;
            data[i + 1] = (g * 0.85 + 0.5) | 0;
            data[i + 2] = (b * 0.9 + 0.5) | 0;
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error('Failed to process signature image'));
              return;
            }
            const cleanName = (file.name || 'signature').replace(/\.[^.]+$/, '') + '-transparent.png';
            const processedFile = new File([blob], cleanName, { type: 'image/png' });
            const previewUrl = URL.createObjectURL(blob);
            resolve({ file: processedFile, previewUrl });
          },
          'image/png',
          1
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load signature image'));
    };

    img.src = objectUrl;
  });
}
