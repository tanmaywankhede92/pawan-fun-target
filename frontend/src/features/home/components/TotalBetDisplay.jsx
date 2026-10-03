const POS = {
  left: "1.2%",
  top: "94.2%",
  width: "8.5%",
  height: "4.8%",
  fontSize: "clamp(8px, 1.4vw, 20px)",
};

const TotalBetDisplay = ({ total = 0 }) => {
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-white font-bold z-20"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Times New Roman", serif',
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
