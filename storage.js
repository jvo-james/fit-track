// storage.js
// A small ES‑module that wraps localStorage and lets you subscribe to changes.

export const Storage = (() => {
  const listeners = {};

  // Listen for other‑tab storage events
  window.addEventListener('storage', e => {
    if (listeners[e.key]) {
      listeners[e.key].forEach(fn => fn(e.newValue, e.oldValue));
    }
  });

  return {
    /**
     * Get a value from localStorage, parsed from JSON.
     * If the key is missing or invalid JSON, returns def.
     */
    get(key, def = null) {
      const v = localStorage.getItem(key);
      if (v === null) return def;
      try {
        return JSON.parse(v);
      } catch {
        return def;
      }
    },

    /**
     * Set a JSON‑serializable value into localStorage.
     * Also notifies same‑tab listeners immediately.
     */
    set(key, value) {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      if (listeners[key]) {
        // notify same‑tab
        listeners[key].forEach(fn => fn(json, null));
      }
    },

    /**
     * Subscribe to changes on a given key.
     * Your callback fn will be called with (newValueJSON, oldValueJSON).
     */
    onChange(key, fn) {
      listeners[key] = listeners[key] || [];
      listeners[key].push(fn);
    }
  };
})();
