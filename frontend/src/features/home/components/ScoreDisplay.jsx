const POS = {
  left: "10%",
  top: "10%",
  width: "8%",
  height: "8%",
  fontSize: "clamp(16px, 2.2vw, 44px)",
};

const ScoreDisplay = ({ score = 0 }) => {
  return (
    <div
      className="absolute pointer-events-none text-gray-900 font-bold flex items-center "
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    >
      {score}
    </div>
  );
};

export { POS as scorePos };
export default ScoreDisplay;
