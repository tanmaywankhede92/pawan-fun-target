import { useState, useRef, useCallback, useEffect } from "react";
import wheelImg from "@assets/images/wheel/wheel.png";
import pointerGif from "@assets/images/gifs/DG.gif";

const POS = {
  left: "32%",
  top: "2%",
  width: "34%",
  height: "auto",
};

const POINTER_POS = {
  left: "50%",
  bottom: "85%",
  width: "16%",
  height: "auto",
};

const SECTORS = 10;
const SECTOR_ANGLE = 360 / SECTORS;
const MIN_SPINS = 5;
const MAX_SPINS = 8;

const randomWinner = () => Math.floor(Math.random() * SECTORS);

const calcTargetAngle = (winner) => 360 - winner * SECTOR_ANGLE;

const WheelDisplay = ({ spinTrigger, onComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const prevTrigger = useRef(spinTrigger);
  const wheelRef = useRef(null);

  const handleTransitionEnd = useCallback(() => {
    setSpinning(false);
    if (winner !== null && onComplete) {
      onComplete(winner);
    }
  }, [winner, onComplete]);

  useEffect(() => {
    if (spinTrigger === prevTrigger.current) return;
    prevTrigger.current = spinTrigger;

    const w = randomWinner();
    setWinner(w);

    const targetAngle = calcTargetAngle(w);
    const fullSpins =
      (MIN_SPINS + Math.floor(Math.random() * (MAX_SPINS - MIN_SPINS + 1))) *
      360;
    const total = fullSpins + targetAngle;

    setSpinning(true);
    setRotation((prev) => prev + total);
  }, [spinTrigger]);

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
          ref={wheelRef}
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
        <img
          src={pointerGif}
          alt="pointer"
          className="absolute pointer-events-none z-10"
          style={{
            left: POINTER_POS.left,
            bottom: POINTER_POS.bottom,
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
