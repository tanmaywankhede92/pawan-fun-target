import { useState, useRef, useCallback, useEffect, useLayoutEffect, memo } from "react";
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
// ========================================================
const DESKTOP_POS = {
  left: "50%",
  top: "36.5%",
  width: "min(45vw, 58vh)",
  height: "min(45vw, 58vh)",
  aspectRatio: "1 / 1",
  scaleX: 1.36,
};

const DESKTOP_OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "33.3%",
  height: "33.3%",
};

const DESKTOP_POINTER_POS = {
  left: "50%",
  top: "2.6%",
  width: "11%",
  height: "auto",
};

// ========================================================
// 📱 📺 2. ANDROID APP & ANDROID TV CONFIGURATION
// (Reference photo matching: width 44.3vw, height 54vh, scaleX 1.46, top 37%)
// ========================================================
const ANDROID_POS = {
  left: "50%",
  top: "36.5%",
  width: "min(45vw, 58vh)",
  height: "min(45vw, 58vh)",
  aspectRatio: "1 / 1",
  scaleX: 1.36,
};

const ANDROID_OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "33.3%",
  height: "33.3%",
};

const ANDROID_POINTER_POS = {
  left: "50%",
  top: "2.6%",
  width: "11%",
  height: "auto",
};

// Auto-detect platform: Android App/TV vs Desktop Browser
const isAndroidPlatform = () => {
  if (typeof window === "undefined") return false;
  const search = window.location?.search || "";
  if (search.includes("platform=android")) return true;
  if (search.includes("platform=desktop")) return false;

  // Native Android bridge injected by MainActivity.java
  if (window.Android) return true;

  // Capacitor native platform
  if (window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.() === "android") {
    return true;
  }

  // Capacitor production webview origin (https://localhost without dev port)
  if (window.location.hostname === "localhost" && !window.location.port) {
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

// Parses CSS dimension strings ("35vw", "35vh", "min(46vw, 66vh)", "300px") to exact pixels
// Ensures 100% compatibility across both modern browsers and legacy Android TV WebViews (Chrome 74)
const parseCssDimension = (val, defaultPx = 280) => {
  if (typeof window === "undefined" || !val) return defaultPx;
  if (typeof val === "number") return val;
  const str = String(val).trim();

  // Handle min(...) e.g. min(46vw, 66vh) or min(35vw, 35vh)
  const minMatch = str.match(/min\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/i);
  if (minMatch) {
    const v1 = parseCssDimension(minMatch[1], defaultPx);
    const v2 = parseCssDimension(minMatch[2], defaultPx);
    return Math.min(v1, v2);
  }

  // Handle max(...)
  const maxMatch = str.match(/max\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/i);
  if (maxMatch) {
    const v1 = parseCssDimension(maxMatch[1], defaultPx);
    const v2 = parseCssDimension(maxMatch[2], defaultPx);
    return Math.max(v1, v2);
  }

  if (str.endsWith("vh")) {
    return Math.round((parseFloat(str) / 100) * window.innerHeight);
  }
  if (str.endsWith("vw")) {
    return Math.round((parseFloat(str) / 100) * window.innerWidth);
  }
  if (str.endsWith("px")) {
    return Math.round(parseFloat(str));
  }
  if (str.endsWith("%")) {
    return Math.round(
      (parseFloat(str) / 100) * Math.min(window.innerWidth, window.innerHeight),
    );
  }
  const num = parseFloat(str);
  return isNaN(num) ? defaultPx : num;
};

const getResponsiveScaleX = () => {
  if (typeof window === "undefined") return 1.36;
  const ar = window.innerWidth / Math.max(1, window.innerHeight);
  // Standard 16:9 is 1.777. Standard 4:3 is 1.333. Square 1:1 is 1.0.
  // On square / 4:3 displays, circular scale 1.0 fits the background stand perfectly.
  if (ar >= 1.75) return 1.36;
  if (ar <= 1.35) return 1.0;
  const t = (ar - 1.35) / (1.75 - 1.35);
  return Number((1.0 + t * (1.36 - 1.0)).toFixed(3));
};

const WheelDisplay = ({
  spinTrigger,
  spinStartMs,
  targetWinner,
  joker,
  onComplete,
}) => {
  const getDims = useCallback(() => {
    return {
      width: parseCssDimension(POS.width, 280),
      height: parseCssDimension(POS.height, 280),
      scaleX: getResponsiveScaleX(),
    };
  }, []);

  const [dims, setDims] = useState(getDims);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [resultJoker, setResultJoker] = useState(() =>
    jokerImageFor(null, null),
  );

  useEffect(() => {
    const onResize = () => setDims(getDims());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getDims]);

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
  // Guard: NEVER overwrite the transform while the 60fps rAF spin loop
  // is actively running. When not spinning, maintain translate3d to preserve
  // the GPU composition layer on Android TV.
  useLayoutEffect(() => {
    if (wheelImgRef.current && !spinningRef.current) {
      wheelImgRef.current.style.transform = `translate3d(0, 0, 0) rotate(${rotationRef.current}deg)`;
    }
  });

  return (
    <div
      data-wheel-container
      className={`absolute pointer-events-none select-none ${IS_ANDROID ? "ft-wheel-android" : "ft-wheel-desktop"}`}
      style={{
        left: POS.left,
        top: POS.top,
        width: `${dims.width}px`,
        height: `${dims.height}px`,
        transform: `translate(-50%, -50%) scaleX(${dims.scaleX || POS.scaleX || 1})`,
        transformOrigin: "50% 50%",
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
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
          }}
        />
      </div>

      <style>{`
        .ft-wheel-android,
        .ft-wheel-desktop {
          transform-origin: 50% 50%;
        }
      `}</style>
    </div>
  );
};

export { POS as wheelPos, DESKTOP_POS, ANDROID_POS };
export default memo(WheelDisplay);
