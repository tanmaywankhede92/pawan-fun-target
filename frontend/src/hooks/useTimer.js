/**
 * useTimer — server-calibrated IST countdown hook.
 *
 * Fires onMinuteStart() exactly once per IST minute boundary.
 * Self-corrects after browser throttling / background tab pauses.
 * Re-syncs after a calibration offset jump to prevent false triggers.
 *
 * Usage:
 *   const time = useTimer({ onMinuteStart: handleNewMinute });
 *   // `time` = seconds until next minute boundary (60 → 0)
 */

import { useState, useEffect, useRef } from "react";
import { getNow, secondsToNextMinute, onCalibrate } from "@utils/istTime";

export const useTimer = ({ onMinuteStart }) => {
  const [time, setTime] = useState(() => secondsToNextMinute(getNow().second));

  const mountedRef = useRef(true);
  const onMinuteStartRef = useRef(onMinuteStart);
  onMinuteStartRef.current = onMinuteStart;

  // The IST minute we have already processed.  On every tick, if the
  // current minute differs, the boundary was crossed (or missed while
  // throttled) — fire once and advance.
  const targetMinuteRef = useRef(getNow().minute);

  const tick = () => {
    const now = getNow();
    const s = now.second;
    const currentMinute = now.minute;

    // Update the countdown display.
    setTime(secondsToNextMinute(s));

    // Minute boundary: fires on normal crossing AND on missed (throttled)
    // boundaries — always exactly once per IST minute.
    if (targetMinuteRef.current !== currentMinute) {
      targetMinuteRef.current = currentMinute;
      onMinuteStartRef.current();
    }
  };

  // ── Start / stop ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    tick(); // immediate first tick
    const id = setInterval(tick, 1000);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Calibration re-sync ────────────────────────────────────────
  // When calibrateTime() detects a >1 s offset jump (e.g. first API
  // response on a device with a wrong clock), re-sync targetMinuteRef
  // to the newly-calibrated minute so we don't fire a false
  // onMinuteStart.
  useEffect(() => {
    return onCalibrate(() => {
      const currentMinute = getNow().minute;
      targetMinuteRef.current = currentMinute;
      // Also correct the displayed time immediately.
      setTime(secondsToNextMinute(getNow().second));
    });
  }, []);

  // ── Background-tab recovery ────────────────────────────────────
  // Browsers throttle setInterval to ≥1 s in hidden tabs, often
  // skipping the exact second boundary.  On return, force a tick so
  // a missed :00 is caught.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && mountedRef.current) {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return time;
};
