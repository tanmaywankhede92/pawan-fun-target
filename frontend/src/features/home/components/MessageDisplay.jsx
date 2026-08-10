const POS = {
  left: "50%",
  bottom: "0%",
  width: "70%",
  height: "5%",
  fontSize: "clamp(8px, 1.8vw, 22px)",
};

const MessageDisplay = ({ message = "" }) => {
  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center text-center text-black"
      style={{
        left: POS.left,
        bottom: POS.bottom,
        transform: "translateX(-50%)",
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Times New Roman", serif',
        fontWeight: 700,

        borderRadius: "10px",
      }}
    >
      {message}
    </div>
  );
};

export { POS as messagePos };
export default MessageDisplay;
