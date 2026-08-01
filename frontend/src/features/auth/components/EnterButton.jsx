// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
const POS = {
  left: "55%",
  top: "89%",
  width: "15%",
  height: "6%",
};

const EnterButton = ({ onClick, loading }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Enter"
      className="
        absolute bg-transparent outline-none p-0 m-0 cursor-pointer ft-login-field
        min-h-[44px] min-w-[80px] hover:text-white hover:bg-black/50
        transition-colors duration-150
      "
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        ...(loading && {
          boxShadow:
            "0 0 12px rgba(255,215,0,0.9), 0 0 30px rgba(255,215,0,0.6), inset 0 0 12px rgba(255,215,0,0.5)",
          borderRadius: "8px",
        }),
      }}
    />
  );
};

export { POS as enterPos };
export default EnterButton;
