const POS = {
  right: "1.7%",
  width: "20%",
  height: "20%",
  top: "26.5%",
  fontSize: "clamp(18px, 1.5vw, 48px  )",
  fontWeight: 600,
};

const DUMMY_WINS = [1, 3, 5, 6, 7, 8, 9, 1, 2, 3];

const LastWinningData = ({ data = DUMMY_WINS }) => {
  return (
    <div
      className="absolute flex items-center gap-2 overflow-x-auto pointer-events-none "
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
          className="flex-shrink-0  text-gray-700 text-center px-3 py-1 rounded"
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
