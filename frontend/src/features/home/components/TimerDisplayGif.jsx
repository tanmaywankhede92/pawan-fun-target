import { memo } from "react";
import FTlogoGif from "@assets/images/gifs/timerDisplay.webp";

const POS = {
  left: "1.5%",
  top: "32.2%",
  width: "21%",
  height: "8.5%",
};

const GifTimerDisplay = ({ time, wheelSpinning = false, timerFrozen = false }) => {
  // Blinks strictly at 5, 4, 3 seconds during the final countdown
  const show =
    time != null &&
    time >= 3 &&
    time <= 5 &&
    !wheelSpinning &&
    !timerFrozen;

  if (!show) return null;

  return (
    <img
      decoding="async"
      src={FTlogoGif}
      alt="timer-alert"
      className="absolute pointer-events-none select-none z-[5]"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        transform: "translateZ(0)",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    />
  );
};

export { POS as gifPos };

// Memoize with custom comparator:
// Mounts smoothly when time enters [5, 4, 3], remains mounted across 5 -> 4 -> 3
// without re-rendering or resetting the animation, and cleanly unmounts when time drops below 3.
export default memo(GifTimerDisplay, (prevProps, nextProps) => {
  const prevShow =
    prevProps.time != null &&
    prevProps.time >= 3 &&
    prevProps.time <= 5 &&
    !prevProps.wheelSpinning &&
    !prevProps.timerFrozen;

  const nextShow =
    nextProps.time != null &&
    nextProps.time >= 3 &&
    nextProps.time <= 5 &&
    !nextProps.wheelSpinning &&
    !nextProps.timerFrozen;

  return prevShow === nextShow;
});
