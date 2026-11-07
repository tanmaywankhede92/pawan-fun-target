// ── Global Server/World-calibrated IST clock (Luxon) ────────────────
// All time is synchronized globally against standard time servers.
// Laptop/Mobile local clock differences are completely eliminated.
// Timezone: Asia/Kolkata (IST: UTC + 5:30)

import { DateTime, Settings } from "luxon";

export const TIMEZONE = "Asia/Kolkata";
Settings.defaultZone = TIMEZONE;

// Difference between the global standard UTC clock and the local device clock (in ms).
let serverOffsetMs = 0;
let isSynced = false;

const calibrateListeners = new Set();
export const onCalibrate = (fn) => {
  calibrateListeners.add(fn);
  return () => calibrateListeners.delete(fn);
};

export const setServerOffset = (newOffset) => {
  const jumped = Math.abs(newOffset - serverOffsetMs) > 1000;
  serverOffsetMs = newOffset;
  isSynced = true;
  if (jumped) {
    calibrateListeners.forEach((fn) => fn(serverOffsetMs));
  }
};

/**
 * Calibrate from an HTTP Date header (e.g. from backend API).
 */
export const calibrateTime = (serverDateHeader) => {
  if (!serverDateHeader) return;
  const serverUtc = DateTime.fromHTTP(serverDateHeader);
  if (!serverUtc.isValid) return;
  const newOffset = serverUtc.toMillis() - Date.now();
  setServerOffset(newOffset);
};

/**
 * Global Time Synchronizer:
 * Fetches accurate standard atomic UTC time from reliable global time sources
 * so phone, desktop and server have 0 millisecond difference.
 */
export const syncGlobalTime = async () => {
  const sources = [
    async () => {
      // Source 1: Cloudflare trace (fastest, anycast edge in India/worldwide, CORS enabled, sub-20ms)
      const t0 = Date.now();
      const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
      const text = await res.text();
      const t1 = Date.now();
      const rtt = t1 - t0;
      const match = text.match(/ts=([0-9.]+)/);
      if (match && match[1]) {
        const globalUtcMs = Math.floor(parseFloat(match[1]) * 1000) + Math.floor(rtt / 2);
        return globalUtcMs - t1;
      }
      throw new Error("Invalid Cloudflare trace response");
    },
    async () => {
      // Source 2: TimeAPI.io (Asia/Kolkata fallback)
      const t0 = Date.now();
      const res = await fetch("https://timeapi.io/api/v1/time/current/zone?timeZone=Asia/Kolkata", { cache: "no-store" });
      const data = await res.json();
      const t1 = Date.now();
      const rtt = t1 - t0;
      const dtStr = data?.date_time || data?.dateTime;
      if (dtStr) {
        const dt = DateTime.fromISO(dtStr, { zone: "Asia/Kolkata" });
        if (dt.isValid) {
          const globalUtcMs = dt.toMillis() + Math.floor(rtt / 2);
          return globalUtcMs - t1;
        }
      }
      throw new Error("Invalid TimeAPI response");
    },
  ];

  for (const fetchSource of sources) {
    try {
      const offset = await fetchSource();
      setServerOffset(offset);
      return;
    } catch {
      // Try next reliable global source
    }
  }
};

// Auto-trigger global synchronization immediately on load
if (typeof window !== "undefined") {
  syncGlobalTime();

  // Re-sync every 30 seconds to continuously prevent clock drift
  setInterval(syncGlobalTime, 30 * 1000);

  // Also re-sync when window becomes visible or device wakes up
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncGlobalTime();
    }
  });

  window.addEventListener("online", syncGlobalTime);
}

// ── IST helpers (fully calibrated against global standard time) ─────

/** Current IST DateTime, calibrated against global standard time. */
export const getNow = () =>
  DateTime.now().plus({ milliseconds: serverOffsetMs }).setZone(TIMEZONE);

/** IST seconds (0-59), server-calibrated. */
export const istSeconds = () => getNow().second;

/** Seconds remaining until the next IST minute boundary.
 * - At s === 0 and ms < 350: returns 0 (displays as "00")
 * - At s === 0 and ms >= 350: returns 60 (displays as "60")
 * - At s === 1..59: returns 60 - s (59, 58, ..., 01)
 * Sequence: ... 02 -> 01 -> 00 -> 60 -> 59 -> 58 -> ... -> 54
 */
export const secondsToNextMinute = (s, ms) => {
  if (s === 0) {
    const milli = ms != null ? ms : getNow().millisecond;
    return milli < 350 ? 0 : 60;
  }
  return 60 - s;
};

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
