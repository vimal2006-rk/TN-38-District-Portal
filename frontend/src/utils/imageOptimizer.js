/**
 * Injects Cloudinary automatic format (WebP/AVIF), quality, and width transformations
 * when serving uploaded images, drastically reducing payload size without changing layout.
 */
const CLOUDINARY_UPLOAD_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\/(?!.*?(?:f_auto|q_auto|w_\d+))(.*)$/;

export function optimizeImageUrl(url, { width = 800, quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;
  const match = url.match(CLOUDINARY_UPLOAD_RE);
  if (!match) return url;
  const [, prefix, rest] = match;
  const transforms = width
    ? `f_auto,q_${quality},w_${width},c_limit`
    : `f_auto,q_${quality}`;
  return `${prefix}/${transforms}/${rest}`;
}
