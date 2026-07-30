// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
const POS = {
  left: '17%',
  top: '57%',
  width: '22%',
  height: '6.5%',
  fontSize: 'clamp(11px, 1.1vw, 16px)',
};

const PasswordInput = ({ value, onChange, onKeyDown }) => {
  return (
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      autoComplete="current-password"
      className="absolute bg-transparent border-none outline-none text-transparent caret-white cursor-text p-0 m-0"
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
