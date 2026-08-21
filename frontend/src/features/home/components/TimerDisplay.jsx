const POS = {
  left: "9%",
  top: "32.5%",
  width: "15%",
  height: "8%",
  fontSize: "clamp(6px, 1.4vw, 30px)",
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
        fontFamily: "'Digit-Tech-7', 'Digital-7', Arial, sans-serif",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        overflow: "visible",
      }}
    >
      {`0`}
      <span style={{ fontFamily: "'Digital-7', Arial, sans-serif" }}>:</span>
      {String(time).padStart(2)}
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
