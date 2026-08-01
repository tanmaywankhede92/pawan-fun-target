// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
const POS = {
  right: "10%",
  top: "92%",
  width: "13%",
  height: "6%",
  minWidth: "36px",
  minHeight: "36px",
};

const CloseButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="
        absolute flex items-center justify-center cursor-pointer
        bg-black/30 text-white/80 hover:text-white hover:bg-black/50
        transition-colors duration-150
      "
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        minWidth: POS.minWidth,
        minHeight: POS.minHeight,
      }}
    ></button>
  );
};

export { POS as closePos };
export default CloseButton;
