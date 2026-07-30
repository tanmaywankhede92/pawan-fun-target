const POS = {
  left: "5%",
  top: "5%",
  width: "20%",
  height: "8%",
  fontSize: "clamp(18px, 2vw, 28px)",
};

const ScoreDisplay = ({ score = 0 }) => {
  return (
    <div
      className="absolute pointer-events-none text-white font-bold flex items-center border-2 border-dashed border-red-400/70"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    >
      Score: {score}
    </div>
  );
};

export { POS as scorePos };
export default ScoreDisplay;
