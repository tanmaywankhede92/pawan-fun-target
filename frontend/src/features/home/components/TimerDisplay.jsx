const POS = {
  left: "3.0%",
  top: "32.5%",
  width: "18.0%",
  height: "8.0%",
  fontSize: "clamp(13px, min(2.0vw, 4.5vh), 30px)",
};

const TimerDisplay = ({ time }) => {
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-center z-10 ft-timer-text tracking-[.13em] "
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: "'Digital-7', sans-serif",
        color: "#1b0e00",
        fontWeight: "bold",
        lineHeight: 1,
        WebkitTextStroke: "0.4px #1b0e00",
        textShadow: "0 0 0.5px #1b0e00",
        whiteSpace: "nowrap",
        overflow: "visible",
      }}
    >
      <span>0</span>
      <span style={{ margin: "0 0.22em" }}>:</span>
      <span>{time ?? 0}</span>
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
