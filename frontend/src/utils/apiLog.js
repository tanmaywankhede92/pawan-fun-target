// In-memory store for auth API responses (login / logout) shown on the
// login page. Survives SPA navigation (logout -> back to /login) but is
// cleared automatically on a page reload, so the box always starts clean.

let store = {};
let seq = 0;
const listeners = new Set();

const emit = () => listeners.forEach((fn) => fn(store));

export const recordApiResponse = (type, payload) => {
  seq += 1;
  store = {
    ...store,
    [type]: {
      type,
      seq,
      time: new Date().toLocaleTimeString(),
      ...payload,
    },
  };
  emit();
};

export const getApiLog = () => store;

export const clearApiLog = () => {
  store = {};
  emit();
};

export const subscribeApiLog = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
