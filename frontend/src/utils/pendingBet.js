import { STORAGE_KEYS } from "@constants";

// Local snapshot of the current round's placed bet, keyed per user so one
// browser account never restores another's ticket. Restoring is draw-gated:
// a snapshot is only applied when its drawTime still matches the live draw.

const pendingBetKey = (username) => `${STORAGE_KEYS.PENDING_BET}_${username}`;

export const savePendingBet = (username, data) => {
  if (!username) return;
  try {
    localStorage.setItem(pendingBetKey(username), JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode / quota)
  }
};

export const loadPendingBet = (username) => {
  if (!username) return null;
  try {
    const raw = localStorage.getItem(pendingBetKey(username));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearPendingBet = (username) => {
  if (!username) return;
  try {
    localStorage.removeItem(pendingBetKey(username));
  } catch {
    // Ignore
  }
};

export const clearAllPendingBets = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key && key.startsWith(STORAGE_KEYS.PENDING_BET)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore
  }
};
