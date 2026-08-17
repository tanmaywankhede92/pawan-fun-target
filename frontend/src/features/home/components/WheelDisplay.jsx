import { useState, useRef, useCallback, useEffect } from "react";
import { useSound } from "@hooks/useSound";
import { istSeconds, secondsToNextMinute } from "@utils/istTime";
import wheelImg from "@assets/images/wheel/wheel.webp";
import wheelGif from "@assets/images/gifs/joker_gif1_slow.webp";
import jackpot from "@assets/images/gifs/joker1.webp";
import goldie from "@assets/images/gifs/joker2.webp";
import bonus from "@assets/images/gifs/joker3.webp";
import drum from "@assets/images/gifs/joker4.webp";
import pointerGif from "@assets/images/gifs/DG.webp";

const POS = {
  left: "49%",
  top: "39%",
  width: "min(clamp(256px, 56%, 580px),78vh)",
};

const OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "35%",
  height: "auto",
};

const POINTER_POS = {
  left: "50%",
  top: "3%",
  width: "10%",
  height: "auto",
};

const NON_JACKPOT_IMAGES = [goldie, bonus, drum];

const jokerImageFor = (joker, winner) => {
  if (Number(joker) === 2) return jackpot;
  return NON_JACKPOT_IMAGES[Number(winner || 0) % NON_JACKPOT_IMAGES.length];
};

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;
const MIN_SPINS = 5;
const MAX_SPINS = 8;

const SPIN_DURATION_MS = 6000;
const SPIN_EASING = "cubic-bezier(0.17, 0.67, 0.12, 0.99)";

const angleFor = (w) => ((SECTORS - w) % SECTORS) * SECTOR_ANGLE;

const ALIGN_OFFSET = Number(
  new URLSearchParams(window.location.search).get("align") || 0,
);

const WheelDisplay = ({ spinTrigger, spinStartMs, targetWinner, joker, onComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [ready, setReady] = useState(false);
  const [resultJoker, setResultJoker] = useState(() => jokerImageFor(null, null));
  const [transitionMs, setTransitionMs] = useState(SPIN_DURATION_MS);

  const rotationRef = useRef(0);
  const initializedRef = useRef(false);
  const targetRotationRef = useRef(0);
  const spinningRef = useRef(false);
  const winnerRef = useRef(null);
  const spunTriggerRef = useRef(spinTrigger);
  const spinStartedRef = useRef(false);
  const { stop } = useSound();

  const setRotationTracked = useCallback((r) => {
    rotationRef.current = r;
    setRotation(r);
  }, []);

  // Initial / reload positioning: snap the wheel to the current result
  // without any animation.
  useEffect(() => {
    if (initializedRef.current) return;
    if (targetWinner == null) return;
    initializedRef.current = true;
    setWinner(targetWinner);
    winnerRef.current = targetWinner;
    setResultJoker(jokerImageFor(joker, targetWinner));
    setRotationTracked(angleFor(targetWinner) + ALIGN_OFFSET);
    setReady(true);
  }, [targetWinner, joker, setRotationTracked]);

  // ── Single-phase spin: triggered when API result arrives ─────────
  // Wheel starts ONLY when the backend returns a valid targetWinner.
  // We calculate remaining time from the :00 timestamp (spinStartMs)
  // so the wheel stops exactly at the 54-second mark (6 s from :00).
  useEffect(() => {
    if (!initializedRef.current) return;
    if (spunTriggerRef.current === spinTrigger) return;
    if (targetWinner == null) return;
    spunTriggerRef.current = spinTrigger;

    setResultJoker(null);
    spinStartedRef.current = true;

    const w = targetWinner;
    setWinner(w);
    winnerRef.current = w;

    // Random full spins (5-8) plus the exact sector delta.
    const fullSpins =
      (MIN_SPINS + Math.floor(Math.random() * (MAX_SPINS - MIN_SPINS + 1))) *
      360;
    const targetRest = angleFor(w) + ALIGN_OFFSET;

    const baseEnd = rotationRef.current + fullSpins;
    const currentMod = ((baseEnd % 360) + 360) % 360;
    const delta = (((targetRest - currentMod) % 360) + 360) % 360;

    // Remaining time from the :00 moment so the wheel stops at :54.
    const elapsed = performance.now() - spinStartMs;
    const remaining = Math.max(200, SPIN_DURATION_MS - elapsed);

    setSpinning(true);
    spinningRef.current = true;
    setTransitionMs(remaining);
    targetRotationRef.current = baseEnd + delta;
    setRotationTracked(targetRotationRef.current);
  }, [spinTrigger, targetWinner, spinStartMs, setRotationTracked]);

  const handleTransitionEnd = useCallback(() => {
    spinningRef.current = false;
    spinStartedRef.current = false;
    setSpinning(false);
    setResultJoker(jokerImageFor(joker, winner));
    stop("SPIN");
    if (winner !== null && onComplete) {
      onComplete(winner);
    }
  }, [winner, joker, onComplete, stop]);

  // If the tab is hidden during the spin and the draw is already over,
  // snap the wheel to its final position so nothing looks broken.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (!spinningRef.current) return;
      if (secondsToNextMinute(istSeconds()) > 55) return;
      if (istSeconds() <= 1) return;
      spinningRef.current = false;
      spinStartedRef.current = false;
      setRotationTracked(targetRotationRef.current);
      setSpinning(false);
      setResultJoker(jokerImageFor(joker, targetWinner));
      stop("SPIN");
      if (winnerRef.current !== null && onComplete) {
        onComplete(winnerRef.current);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [onComplete, setRotationTracked, joker, stop, targetWinner]);

  useEffect(
    () => () => {
      stop("SPIN");
    },
    [stop],
  );

  if (!ready) return null;

  const showGif = spinning;

  return (
    <div
      className="absolute pointer-events-none z-2"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        maxWidth: "100%",
        transform: "translate(-50%, -50%)",
        aspectRatio: "1 / 1",
        overflow: "visible",
      }}
    >
      <div className="relative w-full h-full">
        <img
          decoding="async"
          src={wheelImg}
          alt="wheel"
          className="w-full h-auto"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${transitionMs}ms ${SPIN_EASING}`
              : "none",
            transformOrigin: "center center",
            willChange: "transform",
          }}
          onTransitionEnd={handleTransitionEnd}
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
              transform: "translate(-50%, -50%)",
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
              height: OVERLAY_POS.height,
              transform: "translate(-50%, -50%)",
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
            height: POINTER_POS.height,
            transform: "translate(-50%, -50%)",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
          }}
        />
      </div>
    </div>
  );
};

export { POS as wheelPos };
export default WheelDisplay;
