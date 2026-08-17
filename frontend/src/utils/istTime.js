// ── Server-calibrated IST clock (Luxon) ─────────────────────────────
// All time is stored/calculated in UTC internally.  Luxon handles the
// IANA → IST conversion for display.  A response interceptor in api.js
// feeds every HTTP Date header into calibrateTime() so the frontend
// stays locked to the backend regardless of the user's device clock.

import { DateTime, Settings } from "luxon";

// Default timezone — change to any IANA zone if the game expands.
export const TIMEZONE = "Asia/Kolkata";

// Luxon default zone so all DateTime.now() calls use IST automatically.
Settings.defaultZone = TIMEZONE;

// ── Server calibration ──────────────────────────────────────────────
// Difference between the server's UTC clock and the local device clock.
// Starts at 0; tightened by calibrateTime() on every API response.
let serverOffsetMs = 0;

/**
 * Calibrate from an HTTP Date header (e.g. "Tue, 17 Aug 2026 14:30:00 GMT").
 * Called automatically by the api.js response interceptor.
 * Safe to call repeatedly — each call tightens the sync.
 */
export const calibrateTime = (serverDateHeader) => {
  if (!serverDateHeader) return;
  const serverUtc = DateTime.fromHTTP(serverDateHeader);
  if (!serverUtc.isValid) return;
  serverOffsetMs = serverUtc.toMillis() - Date.now();
};

// ── IST helpers (server-calibrated) ─────────────────────────────────

/** Current IST DateTime, calibrated against the server. */
export const getNow = () =>
  DateTime.now().plus({ milliseconds: serverOffsetMs }).setZone(TIMEZONE);

/** IST seconds (0-59), server-calibrated. */
export const istSeconds = () => getNow().second;

/** Seconds remaining until the next IST minute boundary. */
export const secondsToNextMinute = (s) => (s === 0 ? 0 : 60 - s);

/** "2026-08-17" */
export const istDateStr = () => getNow().toFormat("yyyy-MM-dd");

/** "14:30:00" (24h with seconds) */
export const istTimeStr = () => getNow().toFormat("HH:mm:ss");

/** "02:30:00 PM" (12h, seconds fixed to 00). minuteOffset advances into the next minute. */
export const ist12hStr = (minuteOffset = 0) => {
  const t = getNow().plus({ minutes: minuteOffset });
  return t.toFormat("hh:mm") + ":00 " + t.toFormat("a");
};

/** "14:30:00" (24h, seconds fixed to 00). minuteOffset advances into the next minute. */
export const ist24hStr = (minuteOffset = 0) =>
  getNow()
    .plus({ minutes: minuteOffset })
    .toFormat("HH:mm") + ":00";

// Back-compat alias (used by old callers).
export const istNow = getNow;

// Kept for any legacy import.
export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
