import { useEffect, useRef } from 'react';
import { subscribeCacheInvalidation } from '../utils/clientCache';

/**
 * Automatically refreshes public page data when:
 * 1) Admin mutates matching data in another tab/window (instant via BroadcastChannel/storage), or
 * 2) User switches back to / focuses the browser tab (throttled to avoid redundant API hits).
 */
export function useAutoRefresh(cacheKeys, onRefresh, { minIntervalMs = 3000 } = {}) {
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;
  const lastRunRef = useRef(0);

  const keysSignature = Array.isArray(cacheKeys) ? cacheKeys.join('|') : String(cacheKeys || '');

  useEffect(() => {
    const trigger = (force = false) => {
      const now = Date.now();
      if (!force && now - lastRunRef.current < minIntervalMs) return;
      lastRunRef.current = now;
      refreshRef.current?.();
    };

    const unsubscribe = subscribeCacheInvalidation(cacheKeys, () => trigger(true));

    const onFocus = () => trigger(false);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        trigger(false);
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature, minIntervalMs]);
}
