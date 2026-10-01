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

// Spin takes 5.2 seconds, finishing safely before timer reaches 54s (at 6.0s)
const SPIN_DURATION_MS = 5200;
const SPIN_EASING = "cubic-bezier(0.17, 0.67, 0.12, 0.80)";

const angleFor = (w) =>
  ((SECTORS - (Number(w) % SECTORS)) % SECTORS) * SECTOR_ANGLE;

const ALIGN_OFFSET = Number(
  new URLSearchParams(window.location.search).get("align") || 0,
);

const targetAngle = (w) => angleFor(w) + ALIGN_OFFSET;

// Calculates next clockwise target rotation without snapping backward
const calculateFinalRotation = (currentRot, winnerNum, minSpins = 5) => {
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
  const [transitionMs, setTransitionMs] = useState(SPIN_DURATION_MS);

  const rotationRef = useRef(0);
  const initializedRef = useRef(false);
  const targetRotationRef = useRef(0);
  const spinningRef = useRef(false);
  const winnerRef = useRef(null);
  const spunTriggerRef = useRef(spinTrigger);
  const spinStartTimeRef = useRef(0);
  const { play, stop } = useSound();

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
    setRotationTracked(targetAngle(targetWinner));
  }, [targetWinner, joker, setRotationTracked]);

  const completeSpin = useCallback(
    (w) => {
      if (!spinningRef.current) return;
      spinningRef.current = false;
      setSpinning(false);
      stop("SPIN");
      const winNum = w != null ? w : winnerRef.current;
      if (winNum != null) {
        setResultJoker(jokerImageFor(joker, winNum));
        if (onComplete) onComplete(winNum);
      }
    },
    [joker, onComplete, stop],
  );

  const handleTransitionEnd = useCallback(() => {
    if (!spinningRef.current) return;
    completeSpin(winnerRef.current);
  }, [completeSpin]);

  // ── Wheel spin starts IMMEDIATELY at :00 boundary ──────────────────
  // The wheel never waits for network responses. It starts rotating right away
  // at 00.000s, guaranteeing it finishes and stops by 54s.
  useEffect(() => {
    if (!initializedRef.current) return;
    if (spunTriggerRef.current === spinTrigger) return;
    spunTriggerRef.current = spinTrigger;

    spinStartTimeRef.current = performance.now();
    spinningRef.current = true;
    setSpinning(true);
    setResultJoker(null);
    play("SPIN", { loop: true });

    if (targetWinner != null) {
      const w = targetWinner;
      setWinner(w);
      winnerRef.current = w;
      const finalRot = calculateFinalRotation(rotationRef.current, w, 5);
      targetRotationRef.current = finalRot;
      setTransitionMs(SPIN_DURATION_MS);
      setRotationTracked(finalRot);
    } else {
      // If result is still in flight, start fast rotation immediately
      const initialSpin = rotationRef.current + 360 * 6;
      targetRotationRef.current = initialSpin;
      setTransitionMs(SPIN_DURATION_MS);
      setRotationTracked(initialSpin);
    }
  }, [spinTrigger, targetWinner, setRotationTracked, play]);

  // ── When targetWinner arrives while already spinning ───────────────
  // If the result arrived shortly after :00, adjust the landing angle seamlessly
  // across the remaining duration so it still lands exactly on target by 54s.
  useEffect(() => {
    if (targetWinner == null || !spinningRef.current) return;
    if (winnerRef.current === targetWinner && targetRotationRef.current !== 0) {
      return;
    }

    const w = targetWinner;
    setWinner(w);
    winnerRef.current = w;

    const elapsed =
      performance.now() - (spinStartTimeRef.current || performance.now());
    const remainingMs = Math.max(1200, SPIN_DURATION_MS - elapsed);
    const minSpins = Math.max(2, Math.round(remainingMs / 1000));
    const finalRot = calculateFinalRotation(rotationRef.current, w, minSpins);
    targetRotationRef.current = finalRot;
    setTransitionMs(remainingMs);
    setRotationTracked(finalRot);
  }, [targetWinner, setRotationTracked]);

  // ── Watchdog Safeguard: Wheel MUST stop by 54s ─────────────────────
  // "wheel kabhi bhi 00 se start honga and 54 per stop ho jayenga iske bad nhi ghumnge any how"
  useEffect(() => {
    const s = istSeconds();
    const remaining = secondsToNextMinute(s);
    if (remaining <= 54 && remaining > 10 && spinningRef.current) {
      completeSpin(winnerRef.current);
    }
  });

  // Background-tab recovery
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (!spinningRef.current) return;
      if (secondsToNextMinute(istSeconds()) > 54) return;
      completeSpin(targetWinner ?? winnerRef.current);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [completeSpin, targetWinner]);

  useEffect(
    () => () => {
      stop("SPIN");
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
