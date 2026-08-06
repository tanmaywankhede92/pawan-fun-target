const POS = {
  right: "1.7%",
  width: "20%",
  height: "20%",
  top: "26.5%",
  fontSize: "clamp(4px, 1.4vw, 18px)",
  fontWeight: 700,
  fontFamily: '"Times New Roman", serif',
};

const DUMMY_WINS = [1, 3, 5, 6, 7, 8, 9, 1, 2, 3];

const LastWinningData = ({ data = DUMMY_WINS }) => {
  return (
    <div
      className="absolute flex items-center gap-2   px-2 sm:gap-1 overflow-x-auto pointer-events-none ft-last-wins"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontWeight: POS.fontWeight,
      }}
    >
      {data.map((num, i) => (
        <div
          key={i}
          className="flex-shrink-0  text-gray-700 text-center px-0 sm:px-1.5 py-0 sm:py-1 rounded ft-last-wins-item"
          style={{ fontSize: POS.fontSize }}
        >
          {num}
        </div>
      ))}
    </div>
  );
};

export { POS as lastWinsPos };
export default LastWinningData;
