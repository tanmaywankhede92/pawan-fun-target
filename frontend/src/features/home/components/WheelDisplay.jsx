import { useState, useRef, useCallback, useEffect } from "react";
import { useSound } from "@hooks/useSound";
import wheelImg from "@assets/images/wheel/wheel.png";
import wheelGif from "@assets/images/gifs/joker_gif1.gif";
import joker1 from "@assets/images/gifs/joker1.png";
import joker2 from "@assets/images/gifs/joker2.png";
import joker3 from "@assets/images/gifs/joker3.png";
import joker4 from "@assets/images/gifs/joker4.png";
import pointerGif from "@assets/images/gifs/DG.gif";

const POS = {
  left: "50%",
  top: "37.5%",
  width: "min(clamp(256px, 56%, 580px),79vh)",
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

const JOKER_IMAGES = [joker1, joker2, joker3, joker4];

const randomJoker = () =>
  JOKER_IMAGES[Math.floor(Math.random() * JOKER_IMAGES.length)];

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;
const MIN_SPINS = 5;
const MAX_SPINS = 8;

// ============================================================
// WHEEL ALIGNMENT
// Backend result is the ONLY source of truth. The wheel never
// generates a winner by itself.
//
// Layout (verified against the wheel asset): with rotation = 0 the
// number under the fixed top pointer is 0, and the numbers run
// CLOCKWISE as 0,1,2,3,4,5,6,7,8,9. Each sector is 36°.
//
// Rest angles (rotation mod 360) that put each result under the
// pointer:
//   0 -> 0°,   1 -> 324°,  2 -> 288°,  3 -> 252°,  4 -> 216°,
//   5 -> 180°, 6 -> 144°,  7 -> 108°,  8 -> 72°,   9 -> 36°
const angleFor = (w) => ((SECTORS - w) % SECTORS) * SECTOR_ANGLE;

// Single calibration constant for the whole wheel (never per-number).
// ?align=36 / ?align=-36 in the URL tunes it without a rebuild.
const ALIGN_OFFSET = Number(
  new URLSearchParams(window.location.search).get("align") || 0,
);
// ============================================================

const WheelDisplay = ({ spinTrigger, targetWinner, onComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [ready, setReady] = useState(false);
  const [resultJoker, setResultJoker] = useState(() => randomJoker());

  const rotationRef = useRef(0);
  const prevTrigger = useRef(spinTrigger);
  const initializedRef = useRef(false);
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
    setResultJoker(randomJoker());
    setRotationTracked(angleFor(targetWinner) + ALIGN_OFFSET);
    setReady(true);
  }, [targetWinner, setRotationTracked]);

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
    setResultJoker(null);

    const targetRest = angleFor(w) + ALIGN_OFFSET;
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const delta = ((targetRest - currentMod) % 360 + 360) % 360;
    const fullSpins =
      (MIN_SPINS + Math.floor(Math.random() * (MAX_SPINS - MIN_SPINS + 1))) *
      360;

    play("SPIN");
    setSpinning(true);
    setRotationTracked(rotationRef.current + fullSpins + delta);
  }, [spinTrigger, targetWinner, play, setRotationTracked]);

  const handleTransitionEnd = useCallback(() => {
    setSpinning(false);
    setResultJoker(randomJoker());
    stop("SPIN");
    play("WIN");
    if (winner !== null && onComplete) {
      onComplete(winner); // the SAME backend result that targeted the spin
    }
  }, [winner, onComplete, play, stop]);

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
