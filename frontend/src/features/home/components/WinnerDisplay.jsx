import useAnimatedNumber from "@hooks/useAnimatedNumber";
import { SOUNDS } from "@constants/sounds";

const POS = {
  right: "3.5%",
  top: "10%",
  width: "17.8%",
  height: "8.0%",
  fontSize: "clamp(8px, min(1.5vw, 2.5vh), 22px)",
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
      className="absolute pointer-events-none flex items-center justify-center text-center z-10 ft-winner-text"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Bodoni Moda", serif',
        fontWeight: 900,
        lineHeight: 1,
        color: "#1b0e00",
        textShadow: "0 0 0.5px #1b0e00",
        whiteSpace: "nowrap",
        overflow: "visible",
      }}
    >
      {display}
    </div>
  );
};

export { POS as winnerPos };
export default WinnerDisplay;
