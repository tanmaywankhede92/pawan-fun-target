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

// The Jackpot image belongs ONLY to joker = 2 — it must never appear
// randomly on any other value.
const NON_JACKPOT_IMAGES = [goldie, bonus, drum];

const randomNonJackpot = () =>
  NON_JACKPOT_IMAGES[Math.floor(Math.random() * NON_JACKPOT_IMAGES.length)];

// API sends a joker value (1-4). joker = 2 ALWAYS shows the Jackpot image;
// every other value (1, 3, 4, missing/out of range) shows a random joker
// from the NON-Jackpot set, so the Jackpot never appears on joker = 1.
const jokerImageFor = (value) => {
  if (Number(value) === 2) return jackpot;
  return randomNonJackpot();
};

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;
const MIN_SPINS = 5;
const MAX_SPINS = 8;

const angleFor = (w) => ((SECTORS - w) % SECTORS) * SECTOR_ANGLE;

const ALIGN_OFFSET = Number(
  new URLSearchParams(window.location.search).get("align") || 0,
);
// ============================================================

const WheelDisplay = ({ spinTrigger, targetWinner, joker, onComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [ready, setReady] = useState(false);
  const [resultJoker, setResultJoker] = useState(() => randomNonJackpot());

  const rotationRef = useRef(0);
  const prevTrigger = useRef(spinTrigger);
  const initializedRef = useRef(false);
  const targetRotationRef = useRef(0);
  const spinningRef = useRef(false);
  const winnerRef = useRef(null);
  const { play, stop } = useSound();

  const setRotationTracked = useCallback((r) => {
    rotationRef.current = r;
    setRotation(r);
  }, []);

  // Initial / reload positioning: the moment the first backend result
  // arrives, snap the wheel to its rest angle WITHOUT any animation so
  // the user never sees a temporary "0". The wheel stays hidden until
  // then.
  useEffect(() => {
    if (initializedRef.current) return;
    if (targetWinner == null) return;
    initializedRef.current = true;
    setWinner(targetWinner);
    winnerRef.current = targetWinner;
    setResultJoker(jokerImageFor(joker));
    setRotationTracked(angleFor(targetWinner) + ALIGN_OFFSET);
    setReady(true);
  }, [targetWinner, joker, setRotationTracked]);

  // New draw: spin from the CURRENT rotation (never from 0), always in
  // the same clockwise direction, 5-8 full rotations + the exact delta
  // needed to stop with the backend result centered under the pointer.
  useEffect(() => {
    if (!initializedRef.current) return;
    if (spinTrigger === prevTrigger.current) return;
    prevTrigger.current = spinTrigger;

    if (targetWinner == null) return; // no valid result -> never spin

    const w = targetWinner;
    setWinner(w);
    winnerRef.current = w;
    setResultJoker(null);

    const targetRest = angleFor(w) + ALIGN_OFFSET;
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const delta = (((targetRest - currentMod) % 360) + 360) % 360;
    const fullSpins =
      (MIN_SPINS + Math.floor(Math.random() * (MAX_SPINS - MIN_SPINS + 1))) *
      360;

    play("SPIN");
    setSpinning(true);
    spinningRef.current = true;
    targetRotationRef.current = rotationRef.current + fullSpins + delta;
    setRotationTracked(targetRotationRef.current);
  }, [spinTrigger, targetWinner, play, setRotationTracked]);

  const handleTransitionEnd = useCallback(() => {
    spinningRef.current = false;
    setSpinning(false);
    setResultJoker(jokerImageFor(joker));
    stop("SPIN");
    if (winner !== null && onComplete) {
      onComplete(winner); // the SAME backend result that targeted the spin
    }
  }, [winner, joker, onComplete, play, stop]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (!spinningRef.current) return;
      // Only snap when the draw is already over (the user was away through
      // the whole spin). If they return within the spin window, let the
      // animation resume normally — the active-tab experience is unchanged.
      if (secondsToNextMinute(istSeconds()) > 55) return;
      spinningRef.current = false;
      setRotationTracked(targetRotationRef.current);
      setSpinning(false);
      setResultJoker(jokerImageFor(joker));
      stop("SPIN");
      if (winnerRef.current !== null && onComplete) {
        onComplete(winnerRef.current);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [onComplete, play, stop, setRotationTracked, joker]);

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
              ? "transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
              : "none",
            transformOrigin: "center center",
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
          }}
        />
      </div>
    </div>
  );
};

export { POS as wheelPos };
export default WheelDisplay;
