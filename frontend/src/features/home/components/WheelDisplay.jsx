import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useSound } from "@hooks/useSound";
import wheelImg from "@assets/images/wheel/wheel.webp";
import wheelGif from "@assets/images/gifs/joker_gif1_slow.webp";
import jackpot from "@assets/images/gifs/joker1.webp";
import goldie from "@assets/images/gifs/joker2.webp";
import bonus from "@assets/images/gifs/joker3.webp";
import drum from "@assets/images/gifs/joker4.webp";
import pointerGif from "@assets/images/gifs/DG.webp";

// ========================================================
// 💻 1. DESKTOP / LAPTOP / BROWSER CONFIGURATION
// (Aapke desktop/laptop browser ke liye alag setting)
// ========================================================
const DESKTOP_POS = {
  left: "50%",
  top: "37%",
  width: "min(46vw, 66vh)",
  height: "min(46vw, 66vh)",
  aspectRatio: "1 / 1",
  scaleX: 1.23,
};

const DESKTOP_OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "33.3%",
  height: "33.3%",
};

const DESKTOP_POINTER_POS = {
  left: "50%",
  top: "2.0%",
  width: "11%",
  height: "auto",
};

// ========================================================
// 📱 📺 2. ANDROID APP & ANDROID TV CONFIGURATION
// (Android TV aur Android mobile APK ke liye alag setting)
// ========================================================
const ANDROID_POS = {
  left: "50%",
  top: "38%",
  width: "min(43vw, 62vh)",
  height: "min(43vw, 62vh)",
  aspectRatio: "1 / 1",
  scaleX: 1.12,
};

const ANDROID_OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "33.3%",
  height: "33.3%",
};

const ANDROID_POINTER_POS = {
  left: "50%",
  top: "2.0%",
  width: "11%",
  height: "auto",
};

// Auto-detect platform: Android App/TV vs Desktop Browser
const isAndroidPlatform = () => {
  if (typeof window === "undefined") return false;
  const search = window.location?.search || "";
  if (search.includes("platform=android")) return true;
  if (search.includes("platform=desktop")) return false;

  if (window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.() === "android") {
    return true;
  }
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua) && !/Windows NT|Macintosh|Mac OS X/i.test(ua);
};

const IS_ANDROID = isAndroidPlatform();

const POS = IS_ANDROID ? ANDROID_POS : DESKTOP_POS;
const OVERLAY_POS = IS_ANDROID ? ANDROID_OVERLAY_POS : DESKTOP_OVERLAY_POS;
const POINTER_POS = IS_ANDROID ? ANDROID_POINTER_POS : DESKTOP_POINTER_POS;

const NON_JACKPOT_IMAGES = [goldie, bonus, drum];

const jokerImageFor = (joker, winner) => {
  if (Number(joker) === 2) return jackpot;
  return NON_JACKPOT_IMAGES[Number(winner || 0) % NON_JACKPOT_IMAGES.length];
};

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;

// Spin takes exactly 6.0 seconds total: starts immediately at :00, stops smoothly at 54s countdown
const TOTAL_SPIN_DURATION_MS = 6000;
const MAX_SPEED = 0.9; // deg/ms = 900 deg/sec = 2.5 rev/sec
const ACCEL_TIME_MS = 600;

const angleFor = (w) =>
  ((SECTORS - (Number(w) % SECTORS)) % SECTORS) * SECTOR_ANGLE;

const ALIGN_OFFSET = Number(
  new URLSearchParams(window.location.search).get("align") || 0,
);

const targetAngle = (w) => angleFor(w) + ALIGN_OFFSET;

// Calculates next clockwise target rotation without snapping backward
const calculateFinalRotation = (currentRot, winnerNum, minSpins = 3) => {
  const target = targetAngle(winnerNum);
  const currentMod = ((currentRot % 360) + 360) % 360;
  const targetMod = ((target % 360) + 360) % 360;
  let diff = targetMod - currentMod;
  if (diff <= 0) diff += 360;
  return currentRot + diff + minSpins * 360;
};

const WheelDisplay = ({
  spinTrigger,
  spinStartMs,
  targetWinner,
  joker,
  onComplete,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [resultJoker, setResultJoker] = useState(() =>
    jokerImageFor(null, null),
  );

  const wheelImgRef = useRef(null);
  const rotationRef = useRef(0);
  const initializedRef = useRef(false);
  const spinningRef = useRef(false);
  const spunTriggerRef = useRef(spinTrigger);
  const rafIdRef = useRef(null);
  const safetyTimeoutRef = useRef(null);

  // Deceleration state refs for the rAF animation loop
  const decelStartTimeRef = useRef(null);
  const decelDurationRef = useRef(null);
  const decelStartAngleRef = useRef(0);
  const decelFinalAngleRef = useRef(0);
  const winnerResolvedRef = useRef(null);

  // Keep latest props in refs for direct frame-by-frame rAF loop access
  const targetWinnerRef = useRef(targetWinner);
  targetWinnerRef.current = targetWinner;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const jokerRef = useRef(joker);
  jokerRef.current = joker;

  const { play, stop } = useSound();

  // Initial / reload positioning: snap wheel to current result without animation
  useEffect(() => {
    if (initializedRef.current) return;
    if (targetWinner == null) return;
    initializedRef.current = true;
    const initialAngle = targetAngle(targetWinner);
    rotationRef.current = initialAngle;
    setWinner(targetWinner);
    setResultJoker(jokerImageFor(joker, targetWinner));
    if (wheelImgRef.current) {
      wheelImgRef.current.style.transform = `rotate(${initialAngle}deg)`;
    }
  }, [targetWinner, joker]);

  const finishSpin = useCallback(
    (winNum) => {
      if (!spinningRef.current) return;
      spinningRef.current = false;

      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (safetyTimeoutRef.current != null) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }

      const finalWinner =
        winNum != null
          ? winNum
          : winnerResolvedRef.current != null
          ? winnerResolvedRef.current
          : targetWinnerRef.current != null
          ? targetWinnerRef.current
          : 0;

      const finalAngle =
        decelFinalAngleRef.current ||
        calculateFinalRotation(rotationRef.current, finalWinner, 1);

      rotationRef.current = finalAngle;
      if (wheelImgRef.current) {
        wheelImgRef.current.style.transform = `rotate(${finalAngle}deg)`;
      }

      setSpinning(false);
      stop("SPIN");
      setWinner(finalWinner);
      setResultJoker(jokerImageFor(jokerRef.current, finalWinner));

      // onComplete is ONLY called after the wheel has reached complete rest
      if (onCompleteRef.current) {
        onCompleteRef.current(finalWinner);
      }
    },
    [stop],
  );

  // ── Wheel spin starts IMMEDIATELY at :00 boundary ──────────────────
  // Starts rotating right away at 00s without waiting on network.
  // Smoothly decelerates onto targetWinner when result arrives,
  // stopping unconditionally at 54s countdown.
  useEffect(() => {
    if (spunTriggerRef.current === spinTrigger) return;
    spunTriggerRef.current = spinTrigger;
    initializedRef.current = true;

    spinningRef.current = true;
    setSpinning(true);
    setResultJoker(null);
    play("SPIN", { loop: true });

    const startTime = performance.now();
    let lastTime = startTime;
    let currentAngle = rotationRef.current;

    winnerResolvedRef.current = null;
    decelStartTimeRef.current = null;
    decelDurationRef.current = null;
    decelStartAngleRef.current = currentAngle;
    decelFinalAngleRef.current = 0;

    // If targetWinner was already available at the moment spin triggered:
    if (targetWinnerRef.current != null) {
      const w = targetWinnerRef.current;
      winnerResolvedRef.current = w;
      decelStartTimeRef.current = startTime;
      decelDurationRef.current = TOTAL_SPIN_DURATION_MS;
      decelStartAngleRef.current = currentAngle;
      const minSpins = Math.max(2, Math.round(TOTAL_SPIN_DURATION_MS / 1200));
      decelFinalAngleRef.current = calculateFinalRotation(
        currentAngle,
        w,
        minSpins,
      );
    }

    const animate = (now) => {
      if (!spinningRef.current) return;

      const dt = Math.min(100, Math.max(1, now - lastTime));
      lastTime = now;
      const elapsed = now - startTime;

      // Check if targetWinner has arrived from the API
      if (winnerResolvedRef.current === null) {
        const w = targetWinnerRef.current;
        if (w != null) {
          winnerResolvedRef.current = w;
          decelStartTimeRef.current = now;
          decelDurationRef.current = Math.max(
            800,
            TOTAL_SPIN_DURATION_MS - elapsed,
          );
          decelStartAngleRef.current = currentAngle;
          const minSpins = Math.max(
            1,
            Math.round(decelDurationRef.current / 1200),
          );
          decelFinalAngleRef.current = calculateFinalRotation(
            currentAngle,
            w,
            minSpins,
          );
        } else if (elapsed >= TOTAL_SPIN_DURATION_MS - 600) {
          // Late fallback if API takes > 4.8s
          const fallbackW = 0;
          winnerResolvedRef.current = fallbackW;
          decelStartTimeRef.current = now;
          decelDurationRef.current = Math.max(
            400,
            TOTAL_SPIN_DURATION_MS - elapsed,
          );
          decelStartAngleRef.current = currentAngle;
          decelFinalAngleRef.current = calculateFinalRotation(
            currentAngle,
            fallbackW,
            1,
          );
        }
      }

      if (winnerResolvedRef.current === null) {
        // Accelerate and cruise phase
        const accel = Math.min(1, elapsed / ACCEL_TIME_MS);
        const speed = MAX_SPEED * accel;
        currentAngle += speed * dt;
      } else {
        // Deceleration phase: smooth cubic ease-out to target sector
        const decelElapsed = now - decelStartTimeRef.current;
        const u = Math.min(1, Math.max(0, decelElapsed / decelDurationRef.current));
        const easeOut = 1 - Math.pow(1 - u, 3);
        currentAngle =
          decelStartAngleRef.current +
          (decelFinalAngleRef.current - decelStartAngleRef.current) * easeOut;

        // Both wheel and center GIF must finish at the EXACT same instant (at TOTAL_SPIN_DURATION_MS)
        if (elapsed >= TOTAL_SPIN_DURATION_MS || (u >= 1 && elapsed >= TOTAL_SPIN_DURATION_MS - 50)) {
          currentAngle = decelFinalAngleRef.current;
          rotationRef.current = currentAngle;
          if (wheelImgRef.current) {
            wheelImgRef.current.style.transform = `translate3d(0, 0, 0) rotate(${currentAngle}deg)`;
          }
          finishSpin(winnerResolvedRef.current);
          return;
        }
      }

      rotationRef.current = currentAngle;
      if (wheelImgRef.current) {
        wheelImgRef.current.style.transform = `translate3d(0, 0, 0) rotate(${currentAngle}deg)`;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // Watchdog safety timeout: wheel MUST stop at 54s ("54 per stop ho jayenga iske bad nhi ghumnge any how")
    safetyTimeoutRef.current = setTimeout(() => {
      if (spinningRef.current) {
        finishSpin(winnerResolvedRef.current);
      }
    }, TOTAL_SPIN_DURATION_MS + 200);

    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (safetyTimeoutRef.current != null) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [spinTrigger, finishSpin, play]);

  // Background-tab recovery
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (!spinningRef.current) return;
      finishSpin(targetWinnerRef.current ?? winnerResolvedRef.current);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [finishSpin]);

  useEffect(
    () => () => {
      stop("SPIN");
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (safetyTimeoutRef.current != null)
        clearTimeout(safetyTimeoutRef.current);
    },
    [stop],
  );

  const showGif = spinning;

  // ── Glitch prevention ──────────────────────────────────────────────
  // The rAF loop writes directly to wheelImgRef.current.style.transform
  // at 60 fps. If React re-renders for ANY reason (timer tick, state change
  // in parent, setSpinning, etc.) it would overwrite the transform with the
  // stale `rotation` state value → visible snap/jump.
  // useLayoutEffect (no deps = runs after EVERY render, synchronously before
  // the browser paints) corrects the transform back to rotationRef.current
  // so the browser never sees the wrong value.
  useLayoutEffect(() => {
    if (wheelImgRef.current) {
      wheelImgRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
  });

  return (
    <div
      className={`absolute pointer-events-none select-none ${IS_ANDROID ? "ft-wheel-android" : "ft-wheel-desktop"}`}
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: "1 / 1",
        overflow: "visible",
        zIndex: 2,
        isolation: "isolate",
      }}
    >
      <div className="relative w-full h-full">
        <img
          ref={wheelImgRef}
          decoding="async"
          src={wheelImg}
          alt="wheel"
          className="w-full h-full block select-none pointer-events-none"
          style={{
            transformOrigin: "50% 50%",
            objectFit: "contain",
            willChange: "transform",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            imageRendering: "-webkit-optimize-contrast",
          }}
        />

        {/* Center spinning ball/wheel: pre-decoded in DOM for instant 0ms synchronized start */}
        <img
          decoding="async"
          src={wheelGif}
          alt="wheel gif"
          className="absolute pointer-events-none z-10"
          style={{
            left: OVERLAY_POS.left,
            top: OVERLAY_POS.top,
            width: OVERLAY_POS.width,
            height: OVERLAY_POS.height,
            transform: "translate(-50%, -50%)",
            objectFit: "contain",
            opacity: showGif ? 1 : 0,
            visibility: showGif ? "visible" : "hidden",
            pointerEvents: "none",
          }}
        />

        {/* Center winning result: reveals the exact instant the spin stops */}
        {resultJoker && (
          <img
            decoding="async"
            src={resultJoker}
            alt="joker result"
            className="absolute pointer-events-none z-20"
            style={{
              left: OVERLAY_POS.left,
              top: OVERLAY_POS.top,
              width: OVERLAY_POS.width,
              height: OVERLAY_POS.height,
              transform: "translate(-50%, -50%)",
              objectFit: "contain",
              opacity: !showGif ? 1 : 0,
              visibility: !showGif ? "visible" : "hidden",
              pointerEvents: "none",
            }}
          />
        )}

        <img
          decoding="async"
          src={pointerGif}
          alt="pointer"
          className="absolute pointer-events-none z-30"
          style={{
            left: POINTER_POS.left,
            top: POINTER_POS.top,
            width: POINTER_POS.width,
            height: POINTER_POS.width,
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
          }}
        />
      </div>

      <style>{`
        /* Android TV & Android App wheel styling */
        .ft-wheel-android {
          transform: translate(-50%, -50%) scaleX(${ANDROID_POS.scaleX});
          width: ${ANDROID_POS.width};
          height: ${ANDROID_POS.height};
        }

        /* Desktop & Laptop browser wheel styling */
        .ft-wheel-desktop {
          transform: translate(-50%, -50%) scaleX(${DESKTOP_POS.scaleX});
          width: ${DESKTOP_POS.width};
          height: ${DESKTOP_POS.height};
        }

        /* Semi-square screens (ratio <= 1.4, like tablets / 14:10 displays) */
        @media (max-aspect-ratio: 14/10) {
          .ft-wheel-desktop, .ft-wheel-android {
            transform: translate(-50%, -50%) scaleX(1.10);
            width: min(45vw, 65vh) !important;
            height: min(45vw, 65vh) !important;
          }
        }

        /* Square screens (ratio <= 1.2, like 4:3 displays / iPads) */
        @media (max-aspect-ratio: 12/10) {
          .ft-wheel-desktop, .ft-wheel-android {
            transform: translate(-50%, -50%) scaleX(1.0);
            width: min(48vw, 62vh) !important;
            height: min(48vw, 62vh) !important;
          }
        }
      `}</style>
    </div>
  );
};

export { POS as wheelPos, DESKTOP_POS, ANDROID_POS };
export default WheelDisplay;
