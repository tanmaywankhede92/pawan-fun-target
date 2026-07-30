// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
const POS = {
  right: '1%',
  top: '1%',
  width: '3%',
  height: '4%',
};

const CloseButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="
        absolute bg-transparent border-none outline-none p-0 m-0 cursor-pointer
        opacity-0 hover:opacity-30 active:opacity-60
        transition-opacity duration-100
      "
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
      }}
    />
  );
};

export { POS as closePos };
export default CloseButton;
