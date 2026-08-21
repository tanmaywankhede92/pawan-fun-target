const POS = {
  right: "91%",
  top: "93.5%",
  width: "12%",
  height: "7%",
  fontSize: "clamp(6px, 1.5vw, 26px)",
};

const TotalBetDisplay = ({ total = 0 }) => {
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-white font-bold z-10"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        whiteSpace: "nowrap",
        overflow: "visible",
      }}
    >
      {total}
    </div>
  );
};

export { POS as totalBetPos };
export default TotalBetDisplay;
