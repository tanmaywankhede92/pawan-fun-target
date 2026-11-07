import { memo } from "react";
import timerDisplayOriginal from "@assets/images/gifs/timerDisplay.webp";
import timerDisplayLowSpec from "@assets/images/gifs/timerDisplay_10f.webp";
import { isLowSpecAndroidTv } from "@utils/deviceProfile";

const POS = {
  left: "1.5%",
  top: "32.2%",
  width: "21%",
  height: "8.5%",
};

const GifTimerDisplay = ({ time }) => {
  // Blinks strictly at 5, 4, 3 seconds during final countdown
  const numTime = Number(time);
  const show = !isNaN(numTime) && numTime >= 3 && numTime <= 5;

  if (!show) return null;

  const isLowSpec = isLowSpecAndroidTv();
  const src = isLowSpec ? timerDisplayLowSpec : timerDisplayOriginal;

  return (
    <img
      decoding="async"
      src={src}
      alt="celebration"
      className="absolute pointer-events-none select-none"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        zIndex: 20,
      }}
    />
  );
};

export { POS as gifPos };
export default memo(GifTimerDisplay);
