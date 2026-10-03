import { useState, useRef, useCallback, useEffect } from "react";
import { useSound } from "@hooks/useSound";
import wheelImg from "@assets/images/wheel/wheel.webp";
import wheelGif from "@assets/images/gifs/joker_gif1_slow.webp";
import jackpot from "@assets/images/gifs/joker1.webp";
import goldie from "@assets/images/gifs/joker2.webp";
import bonus from "@assets/images/gifs/joker3.webp";
import drum from "@assets/images/gifs/joker4.webp";
import pointerGif from "@assets/images/gifs/DG.webp";

const POS = {
  left: "50%",
  top: "35.0%",
  width: "min(46vw, 74vh)",
  height: "min(46vw, 74vh)",
};

const OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "41%",
  height: "auto",
};

const POINTER_POS = {
  left: "50%",
  top: "1.8%",
  width: "11%",
  height: "auto",
};

const NON_JACKPOT_IMAGES = [goldie, bonus, drum];

const jokerImageFor = (joker, winner) => {
  if (Number(joker) === 2) return jackpot;
  return NON_JACKPOT_IMAGES[Number(winner || 0) % NON_JACKPOT_IMAGES.length];
};

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;

// Spin takes 5.4 seconds total: starts immediately at 00s, stops smoothly at 54s countdown
const TOTAL_SPIN_DURATION_MS = 5400;
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
  const [rotation, setRotation] = useState(0);
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
    setRotation(initialAngle);
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
      setRotation(finalAngle);
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
    if (!initializedRef.current) return;
    if (spunTriggerRef.current === spinTrigger) return;
    spunTriggerRef.current = spinTrigger;

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
        const u = Math.min(1, decelElapsed / decelDurationRef.current);
        const easeOut = 1 - Math.pow(1 - u, 3);
        currentAngle =
          decelStartAngleRef.current +
          (decelFinalAngleRef.current - decelStartAngleRef.current) * easeOut;

        if (u >= 1 || elapsed >= TOTAL_SPIN_DURATION_MS) {
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

  return (
    <div
      className="absolute pointer-events-none z-2"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        maxWidth: "100%",
        maxHeight: "100%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
        overflow: "visible",
      }}
    >
      <div className="relative w-full h-full">
        <img
          ref={wheelImgRef}
          decoding="async"
          src={wheelImg}
          alt="wheel"
          className="w-full h-full object-contain"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "50% 50%",
            willChange: "transform",
          }}
        />

        {showGif && (
          <img
            decoding="async"
            src={wheelGif}
            alt="wheel gif"
            className="absolute pointer-events-none z-10"
            style={{
              left: OVERLAY_POS.left,
              top: OVERLAY_POS.top,
              width: OVERLAY_POS.width,
              height: OVERLAY_POS.width,
              transform: "translate(-50%, -50%)",
              objectFit: "contain",
            }}
          />
        )}

        {!showGif && resultJoker && (
          <img
            decoding="async"
            src={resultJoker}
            alt="joker result"
            className="absolute pointer-events-none z-20"
            style={{
              left: OVERLAY_POS.left,
              top: OVERLAY_POS.top,
              width: OVERLAY_POS.width,
              height: OVERLAY_POS.width,
              transform: "translate(-50%, -50%)",
              objectFit: "contain",
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
    </div>
  );
};

export { POS as wheelPos };
export default WheelDisplay;
