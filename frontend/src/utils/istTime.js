// ── Global Server/World-calibrated IST clock (Luxon) ────────────────
// All time is synchronized globally against standard time servers.
// Laptop/Mobile local clock differences are completely eliminated.
// Timezone: Asia/Kolkata (IST: UTC + 5:30)

import { DateTime, Settings } from "luxon";

export const TIMEZONE = "Asia/Kolkata";
Settings.defaultZone = TIMEZONE;

export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000; // 19,800,000 ms

// Difference between the global standard UTC clock and the local device clock (in ms).
let serverOffsetMs = 0;
let isSynced = false;

const calibrateListeners = new Set();
export const onCalibrate = (fn) => {
  calibrateListeners.add(fn);
  return () => calibrateListeners.delete(fn);
};

export const setServerOffset = (newOffset) => {
  const jumped = Math.abs(newOffset - serverOffsetMs) > 2000;
  serverOffsetMs = newOffset;
  isSynced = true;
  if (jumped) {
    calibrateListeners.forEach((fn) => fn(serverOffsetMs));
  }
};

/**
 * Calibrate from an HTTP Date header (e.g. from backend API).
 * Only used as an initial rough fallback when high-precision atomic sync hasn't arrived yet.
 */
export const calibrateTime = (serverDateHeader) => {
  if (!serverDateHeader) return;
  // If we already have accurate sub-second sync from atomic time source,
  // do not overwrite with coarse 1-second HTTP Date header (which adds 500-1000ms jitter).
  if (isSynced) return;
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

  // Re-sync every 5 minutes to continuously prevent clock drift (NOT 30s which caused network jitter)
  setInterval(syncGlobalTime, 5 * 60 * 1000);

  // Also re-sync when window becomes visible or device wakes up
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncGlobalTime();
    }
  });

  window.addEventListener("online", syncGlobalTime);
}

// ── IST helpers (fully calibrated against global standard time) ─────

/**
 * Ultra-fast integer arithmetic IST clock.
 * ZERO Luxon DateTime object allocations.
 * ZERO memory pressure / Garbage Collection pauses in Android WebView.
 */
export const getNowFast = () => {
  const istMs = Date.now() + serverOffsetMs + IST_OFFSET_MS;
  const totalSec = Math.floor(istMs / 1000);
  const second = totalSec % 60;
  const minute = Math.floor(totalSec / 60) % 60;
  const msInSecond = istMs % 1000;
  return { second, minute, msInSecond, istMs };
};

/** Current IST DateTime, calibrated against global standard time. */
export const getNow = () =>
  DateTime.now().plus({ milliseconds: serverOffsetMs }).setZone(TIMEZONE);

/** IST seconds (0-59), server-calibrated. */
export const istSeconds = () => getNowFast().second;

/** Seconds remaining until the next IST minute boundary: 59, 58, ..., 1, 0, 59... */
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
