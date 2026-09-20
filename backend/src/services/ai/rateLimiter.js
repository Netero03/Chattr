const MAX_TRACKED_KEYS = 10000;

export const createRateLimiter = ({ maxRequests, windowMs, store }) => {
  const state = new Map();

  const get = (key) => state.get(key);
  const set = (key, value) => state.set(key, value);
  const remove = (key) => state.delete(key);
  const size = () => state.size;
  const oldestKey = () => state.keys().next().value;

  const isRateLimited = async (key) => {
    if (store) {
      try {
        return (await store.increment(key, windowMs)) > maxRequests;
      } catch (error) {
        console.error("AI shared rate limiter unavailable; using local limiter.", error);
      }
    }

    const now = Date.now();
    const current = get(key);

    if (!current || now - current.startedAt >= windowMs) {
      if (!current && size() >= MAX_TRACKED_KEYS) {
        remove(oldestKey());
      }
      set(key, { startedAt: now, count: 1 });
      return false;
    }

    current.count += 1;
    return current.count > maxRequests;
  };

  const clear = async (key) => {
    if (store) {
      try {
        await store.delete(key);
      } catch (error) {
        console.error("AI shared rate limiter cleanup failed.", error);
      }
    }
    remove(key);
  };

  return { isRateLimited, clear };
};