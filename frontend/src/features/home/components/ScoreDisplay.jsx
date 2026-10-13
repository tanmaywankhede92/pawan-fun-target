
import useAnimatedNumber from "@hooks/useAnimatedNumber";
import { SOUNDS } from "@constants/sounds";
import { DISPLAY_FONT } from "@constants/displayFont";

const POS = {
  left: "3.0%",
  top: "10%",
  width: "18.0%",
  height: "8.0%",
  fontSize: "clamp(10px, min(1.8vw, 3.2vh), 28px)",
};

const ScoreDisplay = ({ score = 0 }) => {
  const display = useAnimatedNumber(Number(score) || 0, {
    snapDown: true,
    sound: SOUNDS.BET,
  });
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-center z-10 ft-score-text"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: DISPLAY_FONT,
        fontVariantNumeric: "lining-nums tabular-nums",
        fontFeatureSettings: '"lnum" 1, "tnum" 1',
        fontWeight: 800,
        lineHeight: 1,
        color: "#1b0e00",
        letterSpacing: "0.02em",
        textShadow: "0 0 0.5px #1b0e00",
        whiteSpace: "nowrap",
        overflow: "visible",
      }}
    >
      {display}.00
    </div>
  );
};

export { POS as scorePos };
export default ScoreDisplay;
