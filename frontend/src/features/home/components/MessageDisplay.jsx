const POS = {
  left: "50%",
  bottom: "0.6%",
  width: "68%",
  height: "5.0%",
  fontSize: "clamp(8px, 1.4vw, 20px)",
};

const MessageDisplay = ({ message = "" }) => {
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-center text-black z-20"
      style={{
        left: POS.left,
        bottom: POS.bottom,
        transform: "translateX(-50%)",
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Times New Roman", serif',
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "visible",
      }}
    >
      {message}
    </div>
  );
};

export { POS as messagePos };
export default MessageDisplay;
