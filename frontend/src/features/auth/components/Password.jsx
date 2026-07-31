// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
const POS = {
  left: "25%",
  top: "89%",
  width: "24%",
  height: "5.8%",
  fontSize: "clamp(14px, 1.6vw, 24px)",
};

const PasswordInput = ({ value, onChange, onKeyDown }) => {
  return (
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      autoComplete="current-password"
      className="absolute  border-none outline-none text-black caret-black cursor-text p-0 m-0 min-h-[44px]"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    />
  );
};

export { POS as passwordPos };
export default PasswordInput;
