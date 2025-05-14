
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
    },
      // ▶︎ Allow clearing every ft_* and user data at once
    clear() {
      localStorage.clear();
      // notify all listeners of a “reset”
      Object.keys(listeners).forEach(key =>
        listeners[key].forEach(fn => fn(null, null))
      );
    }
  };
})();


document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.menu-item.sign-out')
    .forEach(btn =>
      btn.addEventListener('click', () => Storage.clear())
    );
});


Storage.onChange('ft_current', (newVal, oldVal) => {
  // only on initial set or when switching accounts
  if (newVal && newVal !== oldVal) {
    Storage.set('ft_activities',   []);  // so “0 workouts” still renders chart axes
    Storage.set('ft_leaderboard',  []);  // show empty leaderboard immediately
    Storage.set('ft_liveSessions', []);  // empty live sessions grid
    Storage.set('ft_mySchedules',  []);  // no scheduled sessions
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const cur = Storage.get('ft_current', null);
  if (cur) {
    // Only set each key if it's missing (so we don't clobber real data)
    if (Storage.get('ft_activities', null)   === null) Storage.set('ft_activities',   []);
    if (Storage.get('ft_leaderboard', null)  === null) Storage.set('ft_leaderboard',  []);
    if (Storage.get('ft_liveSessions', null) === null) Storage.set('ft_liveSessions', []);
    if (Storage.get('ft_mySchedules', null)  === null) Storage.set('ft_mySchedules',  []);
  }
});
