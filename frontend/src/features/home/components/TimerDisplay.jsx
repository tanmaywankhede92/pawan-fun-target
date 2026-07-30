const POS = {
  left: "9%",
  top: "32.5%",
  width: "15%",
  height: "8%",
  fontSize: "clamp(18px, 2vw, 52px)",
};

const TimerDisplay = ({ time }) => {
  return (
    <div
      className="absolute pointer-events-none text-gray-900 font-bold flex items-center text-center z-10"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    >
      00: {time}
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
