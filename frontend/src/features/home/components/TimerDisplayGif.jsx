import { memo } from "react";
import FTlogoGif from "@assets/images/gifs/timerDisplay.webp";

const POS = {
  left: "1.5%",
  top: "32.2%",
  width: "21%",
  height: "8.5%",
};

const GifTimerDisplay = ({ time }) => {
  // Blinks strictly at 5, 4, 3 seconds during final countdown
  const show = time != null && time >= 3 && time <= 5;

  if (!show) return null;

  return (
    <img
      decoding="async"
      src={FTlogoGif}
      alt="celebration"
      className="absolute pointer-events-none select-none z-[5]"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
      }}
    />
  );
};

export { POS as gifPos };

export default memo(GifTimerDisplay, (prev, next) => {
  const prevShow = prev.time != null && prev.time >= 3 && prev.time <= 5;
  const nextShow = next.time != null && next.time >= 3 && next.time <= 5;
  return prevShow === nextShow;
});
