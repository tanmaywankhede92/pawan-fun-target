const POS = {
  left: "10%",
  top: "10%",
  width: "8%",
  height: "8%",
  fontSize: "clamp(6px, 1.7vw, 36px)",
};

const ScoreDisplay = ({ score = 0 }) => {
  return (
    <div
      className="absolute pointer-events-none text-gray-900 flex items-center"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Times New Roman", serif',
        fontWeight: 700,
      }}
    >
      {score}
    </div>
  );
};

export { POS as scorePos };
export default ScoreDisplay;
