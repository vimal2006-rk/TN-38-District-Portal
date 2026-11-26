/**
 * Lightweight Stale-While-Revalidate sessionStorage cache for instant public page loads.
 */
const PREFIX = 'tmssa_swr_';

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
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore
  }
};
