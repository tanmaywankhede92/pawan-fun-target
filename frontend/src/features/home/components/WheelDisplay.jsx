import { useState, useRef, useCallback, useEffect } from "react";
import wheelImg from "@assets/images/wheel/wheel.png";
import wheelGif from "@assets/images/gifs/joker_gif1.gif";
import joker1 from "@assets/images/gifs/joker1.png";
import joker2 from "@assets/images/gifs/joker2.png";
import joker3 from "@assets/images/gifs/joker3.png";
import joker4 from "@assets/images/gifs/joker4.png";
import pointerGif from "@assets/images/gifs/DG.gif";

const POS = {
  left: "35%",
  top: "5%",
  width: "28%",
  height: "auto",
};


const OVERLAY_POS = {
  left: "50%",
  top: "50%",
  width: "35%",
  height: "auto",
};


const POINTER_POS = {
  left: "50%",
  top: "0%",
  width: "16%",
  height: "auto",
};

const JOKER_IMAGES = [joker1, joker2, joker3, joker4];

const randomJoker = () =>
  JOKER_IMAGES[Math.floor(Math.random() * JOKER_IMAGES.length)];

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;
const MIN_SPINS = 5;
const MAX_SPINS = 8;

const randomWinner = () => Math.floor(Math.random() * SECTORS);

const calcTargetAngle = (winner) => 360 - (winner * SECTOR_ANGLE);

const WheelDisplay = ({ spinTrigger, onComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [resultJoker, setResultJoker] = useState(() => randomJoker());
  const prevTrigger = useRef(spinTrigger);

  const handleTransitionEnd = useCallback(() => {
    setSpinning(false);
    setResultJoker(randomJoker());
    if (winner !== null && onComplete) {
      onComplete(winner);
    }
  }, [winner, onComplete]);

  useEffect(() => {
    if (spinTrigger === prevTrigger.current) return;
    prevTrigger.current = spinTrigger;

    const w = randomWinner();
    setWinner(w);
    setResultJoker(null);

    const targetAngle = calcTargetAngle(w);
    const fullSpins =
      (MIN_SPINS + Math.floor(Math.random() * (MAX_SPINS - MIN_SPINS + 1))) *
      360;
    const total = fullSpins + targetAngle;

    setSpinning(true);
    setRotation((prev) => prev + total);
  }, [spinTrigger]);

  const showGif = spinning;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
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
              height: OVERLAY_POS.height,
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
