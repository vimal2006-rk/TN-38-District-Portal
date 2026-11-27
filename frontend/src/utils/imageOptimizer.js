/**
 * 1) Injects Cloudinary automatic format (WebP/AVIF), quality, and width transformations.
 * 2) Routes backend /api/media/:id URLs through same-origin /media/:id on production
 *    so Vercel's Edge CDN caches uploaded images with immutable headers even if Render sleeps.
 */
const CLOUDINARY_UPLOAD_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\/(?!.*?(?:f_auto|q_auto|w_\d+))(.*)$/;
const BACKEND_MEDIA_RE = /^https?:\/\/[^/]+\/(?:api\/)?media\/([0-9a-f-]{16,64})$/i;

export function optimizeImageUrl(url, { width = 800, quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;

  const cloudMatch = url.match(CLOUDINARY_UPLOAD_RE);
  if (cloudMatch) {
    const [, prefix, rest] = cloudMatch;
    const transforms = width
      ? `f_auto,q_${quality},w_${width},c_limit`
      : `f_auto,q_${quality}`;
    return `${prefix}/${transforms}/${rest}`;
  }

  if (typeof window !== 'undefined') {
    const isLocalHost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const mediaMatch = url.match(BACKEND_MEDIA_RE);
    if (mediaMatch && (!isLocalHost || url.includes('localhost'))) {
      return `/media/${mediaMatch[1]}`;
    }
  }

  return url;
}
