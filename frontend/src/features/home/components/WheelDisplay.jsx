import { useState, useRef, useCallback, useEffect, useLayoutEffect, memo } from "react";
import { useSound } from "@hooks/useSound";
import wheelImg from "@assets/images/wheel/wheel.webp";
import wheelGif from "@assets/images/gifs/joker_gif1_slow.webp";
import jackpot from "@assets/images/gifs/joker1.webp";
import goldie from "@assets/images/gifs/joker2.webp";
import bonus from "@assets/images/gifs/joker3.webp";
import drum from "@assets/images/gifs/joker4.webp";
import pointerGif from "@assets/images/gifs/DG.gif";
import { isMobile } from "@utils/isTv";
import { isLowSpecAndroidTv } from "@utils/deviceProfile";

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

// ========================================================
// 📱 3. HANDHELD MOBILE PHONE VIEW (Landscape)
// Wheel is larger, wider, and positioned safely without touching the top
// ========================================================
const MOBILE_POS = {
  left: "50%",
  top: "37%",
  width: "min(54vw, 63vh)",
  height: "min(54vw, 63vh)",
  aspectRatio: "1 / 1",
  scaleX: 1.45,
};

const MOBILE_OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "33.3%",
  height: "33.3%",
};

const MOBILE_POINTER_POS = {
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

const IS_MOBILE = isMobile();
const IS_ANDROID = isAndroidPlatform();

const POS = IS_MOBILE ? MOBILE_POS : IS_ANDROID ? ANDROID_POS : DESKTOP_POS;
const OVERLAY_POS = IS_MOBILE ? MOBILE_OVERLAY_POS : IS_ANDROID ? ANDROID_OVERLAY_POS : DESKTOP_OVERLAY_POS;
const POINTER_POS = IS_MOBILE ? MOBILE_POINTER_POS : IS_ANDROID ? ANDROID_POINTER_POS : DESKTOP_POINTER_POS;

const NON_JACKPOT_IMAGES = [goldie, bonus, drum];

const jokerImageFor = (joker, winner) => {
  if (Number(joker) === 2) return jackpot;
  return NON_JACKPOT_IMAGES[Number(winner || 0) % NON_JACKPOT_IMAGES.length];
};

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;

// Spin starts at 60s countdown and smoothly stops at 54s countdown (total 6.0s)
const MIN_CRUISE_MS = 1500; // Cruise through at least 1.5s of spinning before deceleration
const MAX_SPEED = 0.65; // deg/ms = 650 deg/sec (~1.8 rev/sec) - fast, exciting and clear
const ACCEL_TIME_MS = 400; // Smooth 0.4s spin-up
const TOTAL_MAX_SPIN_MS = 6000; // Unconditionally stops at exact 54s countdown // Unconditionally stops at 54s / 53.9s countdown

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
  if (isMobile()) return 1.45;
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
  const isLowSpec = isLowSpecAndroidTv();

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

    let startTime = null;
    let lastTime = null;
    let currentAngle = rotationRef.current;

    winnerResolvedRef.current = null;
    decelStartTimeRef.current = null;
    decelDurationRef.current = null;
    decelStartAngleRef.current = currentAngle;
    decelFinalAngleRef.current = 0;

    // Winner starts as null or whatever is already available in props
    winnerResolvedRef.current = targetWinnerRef.current != null ? targetWinnerRef.current : null;

    const animate = (now) => {
      if (!spinningRef.current) return;

      if (startTime === null) {
        startTime = now;
        lastTime = now;
      }

      const dt = Math.min(100, Math.max(1, now - lastTime));
      lastTime = now;
      const elapsed = now - startTime;

      // 1. Resolve winner from props ref if not yet resolved
      if (winnerResolvedRef.current === null && targetWinnerRef.current != null) {
        winnerResolvedRef.current = targetWinnerRef.current;
      }

      // Safety fallback: if no winner arrived after 3.5s of spinning, fallback to 0
      if (winnerResolvedRef.current === null && elapsed >= 3500) {
        winnerResolvedRef.current = 0;
      }

      // 2. Determine when to start deceleration:
      // Begins once winner is known AND minimum cruise time (1.5s) has passed.
      const canDecelerate =
        winnerResolvedRef.current !== null &&
        elapsed >= MIN_CRUISE_MS;

      if (decelStartTimeRef.current === null && canDecelerate) {
        const w = winnerResolvedRef.current;
        currentAngle += MAX_SPEED * dt;
        decelStartTimeRef.current = now;
        decelStartAngleRef.current = currentAngle;

        // Target stopping at TOTAL_MAX_SPIN_MS (6000ms / 54s countdown)
        const remainingToDeadline = Math.max(1500, TOTAL_MAX_SPIN_MS - elapsed);
        const idealDecelDist = Math.round((MAX_SPEED * remainingToDeadline) / 2);
        const currentMod = ((currentAngle % 360) + 360) % 360;
        const target = targetAngle(w);
        const targetMod = ((target % 360) + 360) % 360;
        let diff = targetMod - currentMod;
        if (diff <= 0) diff += 360;

        let extraSpins = Math.max(1, Math.round((idealDecelDist - diff) / 360));
        let totalDecelDist = diff + extraSpins * 360;
        let naturalDuration = (2 * totalDecelDist) / MAX_SPEED;

        if (elapsed + naturalDuration > TOTAL_MAX_SPIN_MS && extraSpins > 1) {
          extraSpins -= 1;
          totalDecelDist = diff + extraSpins * 360;
          naturalDuration = (2 * totalDecelDist) / MAX_SPEED;
        }

        decelFinalAngleRef.current = currentAngle + totalDecelDist;
        decelDurationRef.current = Math.min(naturalDuration, TOTAL_MAX_SPIN_MS - elapsed);
      }

      // 3. Motion calculation
      if (decelStartTimeRef.current === null) {
        // Cruise phase: accelerate up to MAX_SPEED and spin at full speed alongside center GIF
        const accel = Math.min(1, elapsed / ACCEL_TIME_MS);
        const speed = MAX_SPEED * accel;
        currentAngle += speed * dt;
      } else {
        // Deceleration phase: smooth quadratic ease-out (u * (2 - u))
        const decelElapsed = now - decelStartTimeRef.current;
        const u = Math.min(1, Math.max(0, decelElapsed / decelDurationRef.current));
        const easeOut = u * (2 - u);
        currentAngle =
          decelStartAngleRef.current +
          (decelFinalAngleRef.current - decelStartAngleRef.current) * easeOut;

        // Finish spin: Wheel naturally reaches speed 0 at target angle, stopping at 54s
        if (u >= 1 || elapsed >= TOTAL_MAX_SPIN_MS) {
          currentAngle = decelFinalAngleRef.current;
          rotationRef.current = currentAngle;
          if (wheelImgRef.current) {
            wheelImgRef.current.style.transform = `rotate(${currentAngle}deg)`;
          }
          finishSpin(winnerResolvedRef.current);
          return;
        }
      }

      rotationRef.current = currentAngle;
      if (wheelImgRef.current) {
        wheelImgRef.current.style.transform = `rotate(${currentAngle}deg)`;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // Watchdog safety timeout
    safetyTimeoutRef.current = setTimeout(() => {
      if (spinningRef.current) {
        finishSpin(winnerResolvedRef.current);
      }
    }, TOTAL_MAX_SPIN_MS + 200);

    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (safetyTimeoutRef.current != null) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      stop("SPIN");
      spinningRef.current = false;
    };
  }, [spinTrigger, finishSpin, play, stop]);

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
      wheelImgRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
  }, [spinning]);

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: POS.left,
        top: POS.top,
        width: `${dims.width}px`,
        height: `${dims.height}px`,
        transform: "translate(-50%, -50%)",
        transformOrigin: "50% 50%",
        overflow: "visible",
        zIndex: 2,
      }}
    >
      {/* 1. Independent GPU layer for the wheel + center jokers (scaled horizontally) */}
      <div
        data-wheel-container
        className={`w-full h-full relative ${IS_ANDROID ? "ft-wheel-android" : "ft-wheel-desktop"}`}
        style={{
          transform: `scaleX(${dims.scaleX || POS.scaleX || 1})`,
          transformOrigin: "50% 50%",
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          isolation: "isolate",
        }}
      >
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
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Center spinning ball/wheel: adaptive rendering.
            On low-spec TV, unmounted during stationary betting (54s) to free 31MB VRAM;
            On Desktop/high-end, remains pre-decoded in DOM for instant 0ms synchronized start. */}
        {(!isLowSpec || showGif) && (
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
        )}

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
      </div>

      {/* 2. Pointer moved completely OUTSIDE the wheel's scaleX GPU layer into its own isolated layer.
             Eliminates Chromium/Mali GPU damage rect clipping artifact (blinking golden box). */}
      <img
        decoding="async"
        src={pointerGif}
        alt="pointer"
        className="absolute pointer-events-none z-30"
        style={{
          left: POINTER_POS.left,
          top: POINTER_POS.top,
          width: "14%",
          height: "auto",
          transform: "translate(-50%, -50%) translateZ(0)",
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />

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
