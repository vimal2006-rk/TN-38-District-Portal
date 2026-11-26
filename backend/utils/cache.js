/**
 * Lightweight in-memory TTL cache with prefix invalidation for fast public API responses.
 */
const store = new Map();

const getCache = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

const setCache = (key, value, ttlMs = 30000) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const invalidateCache = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};

module.exports = { getCache, setCache, invalidateCache };
