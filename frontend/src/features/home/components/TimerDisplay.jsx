const POS = {
  left: "3.0%",
  top: "33%",
  width: "18.0%",
  height: "7.2%",
  fontSize: "clamp(18px, min(3.1vw, 4.2vh), 33px)",
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
        color: "#27272a",
        fontWeight: "bold",
        lineHeight: 1,
        letterSpacing: "0.08em",
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
      <span style={{ display: "inline-block" }}>0</span>
      <span
        style={{
          display: "inline-block",
          fontFamily: "'Digital-7', monospace",
          margin: "0 0.12em",
          lineHeight: 1,
        }}
      >
        :
      </span>
      <span style={{ display: "inline-block" }}>{formattedTime}</span>
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
