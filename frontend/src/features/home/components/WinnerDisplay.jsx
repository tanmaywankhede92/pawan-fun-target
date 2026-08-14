import useAnimatedNumber from "@hooks/useAnimatedNumber";
import { SOUNDS } from "@constants/sounds";

const POS = {
  right: "1%",
  top: "10%",
  width: "25%",
  height: "8%",
  fontSize: "clamp(8px, 1.6vw, 26px)",
};

// Winner amount rolls number by number. It counts up when a win appears and
// counts down to 0 when the winnings are taken.
const WinnerDisplay = ({ winner, winAmount }) => {
  const display = useAnimatedNumber(
    winAmount != null ? Number(winAmount) : 0,
    { sound: SOUNDS.BET },
  );
  return (
    <div
      className="absolute pointer-events-none text-gray-900 flex items-center text-center justify-center"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Bodoni Moda", serif',
        fontWeight: 700,
      }}
    >
      {` ${display}`}
    </div>
  );
};

export { POS as winnerPos };
export default WinnerDisplay;
