const POS = {
  left: "30%",
  top: "5%",
  width: "25%",
  height: "8%",
  fontSize: "clamp(18px, 2vw, 28px)",
};

const WinnerDisplay = ({ winner = "Player1" }) => {
  return (
    <div
      className="absolute pointer-events-none text-yellow-400 font-bold flex items-center border-2 border-dashed border-blue-400/70"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    >
      Winner: {winner}
    </div>
  );
};

export { POS as winnerPos };
export default WinnerDisplay;
