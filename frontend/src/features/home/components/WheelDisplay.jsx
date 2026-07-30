import { useState, useRef, useCallback, useEffect } from "react";
import wheelImg from "@assets/images/wheel/wheel.png";

const POS = {
  left: "35%",
  top: "5%",
  width: "30%",
  height: "auto",
};

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
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-3xl leading-none pointer-events-none z-10"
          style={{ filter: "drop-shadow(0 0 4px black)" }}
        >
          ▲
        </div>
      </div>
    </div>
  );
};

export { POS as wheelPos };
export default WheelDisplay;
