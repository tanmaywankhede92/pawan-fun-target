const POS = {
  right: "1%",
  top: "10%",
  width: "25%",
  height: "8%",
  fontSize: "clamp(8px, 2vw, 26px)",
};

const WinnerDisplay = ({ winner, winAmount }) => {
  return (
    <div
      className="absolute pointer-events-none text-gray-900 flex items-center text-center justify-center"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Times New Roman", serif',
        fontWeight: 700,
      }}
    >
      {winAmount != null ? `Rs. ${winAmount}` : "0"}
    </div>
  );
};

export { POS as winnerPos };
export default WinnerDisplay;
