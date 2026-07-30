// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
const POS = {
  left: '36%',
  top: '72%',
  width: '10%',
  height: '6%',
};

const EnterButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Enter"
      className="
        absolute bg-transparent border-none outline-none p-0 m-0 cursor-pointer
        opacity-0 hover:opacity-30 active:opacity-60
        transition-opacity duration-100
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
