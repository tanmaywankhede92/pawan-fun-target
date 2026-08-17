// Global IST (Indian Standard Time = UTC+5:30) clock calibrated against the
// backend server.  A response interceptor in api.js feeds every HTTP Date
// header into calibrateTime() so the frontend stays locked to the server
// regardless of the user's device clock.

export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// How many ms the server clock is ahead of (or behind) the local clock.
// Starts at 0; corrected by calibrateTime() on the first API response.
let serverOffsetMs = 0;

const pad = (n) => String(n).padStart(2, "0");

// Calibrate from an HTTP Date header (e.g. "Tue, 17 Aug 2026 14:30:00 GMT").
// Called automatically by the api.js response interceptor; harmless to call
// repeatedly — each call tightens the sync.
export const calibrateTime = (serverDateHeader) => {
  if (!serverDateHeader) return;
  const serverUtcMs = new Date(serverDateHeader).getTime();
  if (Number.isNaN(serverUtcMs)) return;
  serverOffsetMs = serverUtcMs - Date.now();
};

// ── IST helpers (server-calibrated) ────────────────────────────────

export const istNow = () => new Date(Date.now() + serverOffsetMs + IST_OFFSET_MS);

export const istSeconds = () => istNow().getUTCSeconds();

export const secondsToNextMinute = (s) => (s === 0 ? 0 : 60 - s);

const getIstParts = () => {
  const d = istNow();
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
  };
};

// "2026-08-10"
export const istDateStr = () => {
  const p = getIstParts();
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

// "12:05" (24h, no seconds)
export const istTimeStr = () => {
  const p = getIstParts();
  return `${pad(p.hours)}:${pad(p.minutes)}`;
};

// "11:32:00 AM" (12h). minuteOffset lets callers pick the next minute.
export const ist12hStr = (minuteOffset = 0) => {
  const p = getIstParts();
  const totalMinutes = p.hours * 60 + p.minutes + minuteOffset;
  const h = ((Math.floor(totalMinutes / 60) % 24) + 24) % 24;
  const m = ((totalMinutes % 60) + 60) % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)}:00 ${ampm}`;
};

// "11:33:00" (24h). minuteOffset lets callers pick the next minute.
export const ist24hStr = (minuteOffset = 0) => {
  const p = getIstParts();
  const totalMinutes = p.hours * 60 + p.minutes + minuteOffset;
  const h = ((Math.floor(totalMinutes / 60) % 24) + 24) % 24;
  const m = ((totalMinutes % 60) + 60) % 60;
  return `${pad(h)}:${pad(m)}:00`;
};
