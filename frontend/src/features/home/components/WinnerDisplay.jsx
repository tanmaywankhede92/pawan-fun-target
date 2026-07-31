const POS = {
  right: "1%",
  top: "10%",
  width: "25%",
  height: "8%",
  fontSize: "clamp(14px, 2vw, 36px)",
};

const WinnerDisplay = () => {
  return (
    <div
      className="absolute pointer-events-none text-gray-900 font-bold   flex items-center text-center justify-center"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    >
      90
    </div>
  );
};

export { POS as winnerPos };
export default WinnerDisplay;
