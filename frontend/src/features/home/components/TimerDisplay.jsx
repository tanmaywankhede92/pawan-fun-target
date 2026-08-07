const POS = {
  left: "9%",
  top: "32.5%",
  width: "15%",
  height: "8%",
  fontSize: "clamp(6px, 2.2vw, 28px)",
};

const TimerDisplay = ({ time }) => {
  return (
    <div
      className="absolute pointer-events-none text-gray-900 flex items-center text-center z-10"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: "'Digital-7', Arial, sans-serif",
        fontWeight: "bold",
      }}
    >
        {`00:${String(time).padStart(2, "0")}`}
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
