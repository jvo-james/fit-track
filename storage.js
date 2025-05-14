export const Storage = (() => {
  const listeners = {};

  window.addEventListener('storage', e => {
    if (listeners[e.key]) {
      listeners[e.key].forEach(fn => fn(e.newValue, e.oldValue));
    }
  });

  return {
  
    get(key, def = null) {
      const v = localStorage.getItem(key);
      if (v === null) return def;
      try {
        return JSON.parse(v);
      } catch {
        return def;
      }
    },

  
    set(key, value) {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      if (listeners[key]) {

        listeners[key].forEach(fn => fn(json, null));
      }
    },

  
    onChange(key, fn) {
      listeners[key] = listeners[key] || [];
      listeners[key].push(fn);
    }
  };
})(); 
