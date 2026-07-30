const POS = {
  right: "1%",
  width: "20%",
  height: "73%",
  fontSize: "clamp(14px, 1.5vw, 20px)",
};

const DUMMY_WINS = [3, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5];

const LastWinningData = ({ data = DUMMY_WINS }) => {
  return (
    <div
      className="absolute flex items-center gap-2 overflow-x-auto pointer-events-none border-2 border-dashed border-yellow-400/70"
      style={{
        right: POS.right,

        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    >
      {data.map((num, i) => (
        <div
          key={i}
          className="flex-shrink-0 bg-black/40 text-white text-center px-3 py-1 rounded"
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
