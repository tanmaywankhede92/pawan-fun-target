/**
 * useTimer — server-calibrated IST countdown hook.
 *
 * Fires onMinuteStart() exactly once per IST minute boundary.
 * Self-corrects after browser throttling / background tab pauses.
 * Re-syncs after a calibration offset jump to prevent false triggers.
 *
 * Ultra-optimized for Android TV / WebView:
 * - Uses getNowFast() with pure integer arithmetic (zero object allocations).
 * - Only triggers React state update when the remaining second actually changes.
 * - Tick rate 200ms ensures sub-frame responsiveness without CPU churn or GC freezes.
 */

import { useState, useEffect, useRef } from "react";
import { getNowFast, secondsToNextMinute, onCalibrate } from "@utils/istTime";

export const useTimer = ({ onMinuteStart }) => {
  const [time, setTime] = useState(() => secondsToNextMinute(getNowFast().second));

  const mountedRef = useRef(true);
  const onMinuteStartRef = useRef(onMinuteStart);
  onMinuteStartRef.current = onMinuteStart;

  // The IST minute we have already processed. On every tick, if the
  // current minute differs, the boundary was crossed (or missed while
  // throttled) — fire once and advance.
  const targetMinuteRef = useRef(getNowFast().minute);

  const tick = () => {
    const now = getNowFast();
    const s = now.second;
    const currentMinute = now.minute;

    // Update the countdown display only when second actually changes
    const remaining = secondsToNextMinute(s);
    setTime((prev) => (prev !== remaining ? remaining : prev));

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
    const id = setInterval(tick, 200);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, []);

  // ── Calibration re-sync ────────────────────────────────────────
  useEffect(() => {
    return onCalibrate(() => {
      const currentMinute = getNowFast().minute;
      targetMinuteRef.current = currentMinute;
      const remaining = secondsToNextMinute(getNowFast().second);
      setTime((prev) => (prev !== remaining ? remaining : prev));
    });
  }, []);

  // ── Background-tab recovery ────────────────────────────────────
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
