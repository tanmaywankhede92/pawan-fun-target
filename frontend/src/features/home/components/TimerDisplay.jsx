const POS = {
  left: "3.0%",
  top: "33.1%",
  width: "18.0%",
  height: "7.2%",
  fontSize: "clamp(16px, min(2.7vw, 3.8vh), 38px)",
};

const TimerDisplay = ({ time }) => {
  const formattedTime =
    time != null ? String(time).padStart(2, "0") : "00";
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-center z-10 ft-timer-text tracking-[.13em]"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: "'Digital-7', monospace, sans-serif",
        fontVariantNumeric: "lining-nums tabular-nums",
        color: "#1b0e00",
        fontWeight: "bold",
        lineHeight: 1,
        whiteSpace: "nowrap",
        overflow: "visible",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        contain: "paint layout",
        paddingTop: "0.2vh",
        zIndex: 30,
      }}
    >
      <span>0</span>
      <span style={{ margin: "0 0.22em" }}>:</span>
      <span>{formattedTime}</span>
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
