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
        const ctx = canvas.getContext('2d');
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
        for (const idx of samplePoints) {
          bgLumSum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        }
        const avgBgLum = bgLumSum / samplePoints.length;
        const threshold = Math.max(150, Math.min(225, avgBgLum - 28));

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const sat = maxC - minC;

          // Light/neutral paper pixel -> transparent
          if (lum > threshold && sat < 55) {
            data[i + 3] = 0;
          } else if (lum > threshold - 25 && sat < 45) {
            // Smooth edge anti-aliasing
            const factor = (threshold - lum) / 25;
            data[i + 3] = Math.max(0, Math.min(255, Math.round(255 * factor)));
          } else {
            // Crisp dark/blue ink stroke
            data[i] = Math.max(0, Math.round(r * 0.85));
            data[i + 1] = Math.max(0, Math.round(g * 0.85));
            data[i + 2] = Math.max(0, Math.round(b * 0.9));
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
