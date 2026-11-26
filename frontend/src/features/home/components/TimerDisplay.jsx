const POS = {
  left: "3.0%",
  top: "33%",
  width: "18.0%",
  height: "7.2%",
  fontSize: "clamp(22px, min(3.8vw, 5.2vh), 40px)",
};

const TimerDisplay = ({ time }) => {
  const formattedTime = time != null ? String(time) : "0";
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-center z-10 ft-timer-text"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: "'Digital Readout Thick Upright', 'Digital Readout Upright', 'Digital Readout', monospace, sans-serif",
        fontVariantNumeric: "lining-nums tabular-nums",
        color: "#1b0e00",
        fontWeight: "bold",
        lineHeight: 1,
        whiteSpace: "nowrap",
        overflow: "visible",
        transform: "scaleX(1.42) translateZ(0)",
        transformOrigin: "center center",
        backfaceVisibility: "hidden",
        contain: "paint layout",
        paddingTop: "0.2vh",
        zIndex: 30,
      }}
    >
      <span>0</span>
      <span style={{ margin: "0 0.10em" }}>:</span>
      <span>{formattedTime}</span>
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
