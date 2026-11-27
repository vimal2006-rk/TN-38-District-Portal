import { useState, useEffect, memo } from 'react';

/**
 * Renders an image and cleanly switches to `fallback` if loading fails (e.g., 404/broken URL),
 * avoiding broken browser image icons in avatars and media cards.
 */
function SafeImage({ src, alt = '', fallback = null, onError, ...props }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return fallback;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        setFailed(true);
        if (onError) onError(e);
      }}
      {...props}
    />
  );
}

export default memo(SafeImage);
