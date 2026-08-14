import useAnimatedNumber from "@hooks/useAnimatedNumber";
import { SOUNDS } from "@constants/sounds";

const POS = {
  left: "10%",
  top: "10%",
  width: "8%",
  height: "8%",
  fontSize: "clamp(6px, 1.7vw, 36px)",
};

// Balance rolls up number by number when it increases (e.g. winnings taken
// or balance added). Decreases snap instantly so betting stays responsive.
const ScoreDisplay = ({ score = 0 }) => {
  const display = useAnimatedNumber(score, { snapDown: true, sound: SOUNDS.BET });
  return (
    <div
      className="absolute pointer-events-none text-gray-900 flex items-center"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Bodoni Moda", serif',
        fontWeight: 700,
      }}
    >
      {display}.00
    </div>
  );
};

export { POS as scorePos };
export default ScoreDisplay;
