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
import { getNowFast, secondsToNextMinute, onCalibrate } from "@utils/istTime";

export const useTimer = ({ onMinuteStart }) => {
  const [time, setTime] = useState(() => {
    const initial = getNowFast();
    return secondsToNextMinute(initial.second, initial.msInSecond);
  });

  const mountedRef = useRef(true);
  const onMinuteStartRef = useRef(onMinuteStart);
  onMinuteStartRef.current = onMinuteStart;

  // The IST minute we have already processed.  On every tick, if the
  // current minute differs, the boundary was crossed (or missed while
  // throttled) — fire once and advance.
  const targetMinuteRef = useRef(getNowFast().minute);

  const tick = () => {
    const now = getNowFast();
    const s = now.second;
    const ms = now.msInSecond;
    const currentMinute = now.minute;

    // Update the countdown display only when integer second changes.
    // Prevents 10 React state updates per second on slow Android TV.
    const remaining = secondsToNextMinute(s, ms);
    setTime((prev) => (prev !== remaining ? remaining : prev));

    // Minute boundary: fires on normal crossing.
    // If the app experiences an execution pause (OS sleep / tab throttle / freeze) and resumes mid-round
    // (e.g. at 26 seconds), we advance targetMinuteRef to stay in sync with the current minute, but
    // DO NOT trigger onMinuteStart mid-round! The wheel must only execute at scheduled :00 boundaries.
    if (targetMinuteRef.current !== currentMinute) {
      targetMinuteRef.current = currentMinute;
      const isLegitimateBoundary = s >= 58 || s <= 2;
      if (isLegitimateBoundary && onMinuteStartRef.current) {
        try {
          onMinuteStartRef.current();
        } catch (e) {
          console.error("[useTimer] onMinuteStart error:", e);
        }
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Calibration re-sync ────────────────────────────────────────
  // When calibrateTime() detects an offset jump, re-sync targetMinuteRef
  // to the newly-calibrated minute so we don't fire a false onMinuteStart.
  useEffect(() => {
    return onCalibrate(() => {
      const now = getNowFast();
      targetMinuteRef.current = now.minute;
      const remaining = secondsToNextMinute(now.second, now.msInSecond);
      setTime((prev) => (prev !== remaining ? remaining : prev));
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
