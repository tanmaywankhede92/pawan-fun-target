// In-memory store for auth API responses (login / logout) shown on the
// login page. Survives SPA navigation (logout -> back to /login) but is
// cleared automatically on a page reload, so the box always starts clean.

let store = {};
let seq = 0;
const listeners = new Set();

let statusStore = null;
let statusSeq = 0;
const statusListeners = new Set();
let isLogoutPending = false;

const emit = () => listeners.forEach((fn) => fn(store));
const emitStatus = () => statusListeners.forEach((fn) => fn(statusStore));

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

  // If login response received with message
  if (type === "login" && payload?.body?.message) {
    setResponseStatus(payload.body.message, 7);
  }

  // If logout occurred, set logout response status with 7 blinks
  if (type === "logout") {
    isLogoutPending = true;
    const msg = payload?.body?.message || "User Logged Out Successfully";
    setResponseStatus(msg, 7);
  }
};

export const consumeLogoutFlag = () => {
  const pending = isLogoutPending;
  isLogoutPending = false;
  return pending;
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

export const setResponseStatus = (message, blinkCount = 7) => {
  if (!message) return;
  // Prevent duplicate emissions within 250ms with the exact same message
  if (statusStore?.message === message && Date.now() - (statusStore?.time || 0) < 250) {
    return;
  }
  statusSeq += 1;
  statusStore = {
    message,
    blinkCount,
    seq: statusSeq,
    time: Date.now(),
  };
  emitStatus();
};

export const getResponseStatus = () => statusStore;

export const subscribeResponseStatus = (fn) => {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
};
