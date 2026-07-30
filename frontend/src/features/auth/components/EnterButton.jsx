// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
const POS = {
  left: "55%",
  top: "89%",
  width: "15%",
  height: "6%",
};

const EnterButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Enter"
      className="
        absolute bg-transparent outline-none p-0 m-0 cursor-pointer
        border-2 border-dashed border-green-400/70
        min-h-[44px] min-w-[80px] hover:text-white hover:bg-black/50
        transition-colors duration-150
      "
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
      }}
    />
  );
};

export { POS as enterPos };
export default EnterButton;
