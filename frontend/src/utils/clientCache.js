/**
 * Lightweight Stale-While-Revalidate sessionStorage cache with cross-tab live sync
 * so admin uploads and edits appear immediately across open tabs.
 */
const PREFIX = 'tmssa_swr_';
const CHANNEL_NAME = 'tnmssa_cache_sync';
const STORAGE_PING_KEY = 'tnmssa_cache_ping';
const LOCAL_EVENT_NAME = 'tnmssa:cache-invalidated';

let channel = null;
const getBroadcastChannel = () => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return channel;
};

const removeSessionKey = (key) => {
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore storage errors
  }
};

export const getCachedData = (key) => {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCachedData = (key, data) => {
  try {
    sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
};

export const clearCachedData = (key) => {
  removeSessionKey(key);
  if (typeof window === 'undefined') return;

  try {
    getBroadcastChannel()?.postMessage({ key, ts: Date.now() });
  } catch {
    // Ignore BroadcastChannel failures
  }

  try {
    localStorage.setItem(STORAGE_PING_KEY, JSON.stringify({ key, ts: Date.now() }));
  } catch {
    // Ignore localStorage quota/private mode errors
  }

  try {
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT_NAME, { detail: { key } }));
  } catch {
    // Ignore CustomEvent failure
  }
};

/**
 * Subscribes to live invalidations for one or more cache keys (exact or prefix ending with `_`).
 * Returns an unsubscribe cleanup function.
 */
export const subscribeCacheInvalidation = (keys, onInvalidate) => {
  if (typeof window === 'undefined' || typeof onInvalidate !== 'function') {
    return () => {};
  }

  const keyList = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
  const matches = (changedKey) =>
    changedKey &&
    keyList.some((target) =>
      changedKey === target ||
      (target.endsWith('_') && changedKey.startsWith(target)) ||
      (changedKey.endsWith('_') && target.startsWith(changedKey))
    );

  const handleKey = (changedKey, fromRemote = false) => {
    if (!matches(changedKey)) return;
    if (fromRemote) {
      removeSessionKey(changedKey);
      keyList.forEach((k) => {
        if (!k.endsWith('_')) removeSessionKey(k);
      });
    }
    onInvalidate(changedKey);
  };

  const bc = getBroadcastChannel();
  const onBcMessage = (event) => handleKey(event.data?.key, true);
  bc?.addEventListener('message', onBcMessage);

  const onStorage = (event) => {
    if (event.key !== STORAGE_PING_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      handleKey(parsed?.key, true);
    } catch {
      // Ignore malformed JSON
    }
  };
  window.addEventListener('storage', onStorage);

  const onLocalEvent = (event) => handleKey(event.detail?.key, false);
  window.addEventListener(LOCAL_EVENT_NAME, onLocalEvent);

  return () => {
    bc?.removeEventListener('message', onBcMessage);
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(LOCAL_EVENT_NAME, onLocalEvent);
  };
};
