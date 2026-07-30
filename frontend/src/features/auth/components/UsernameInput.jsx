const POS = {
  left: '25%',
  top: '78%',
  width: '24%',
  height: '6%',
  fontSize: 'clamp(16px, 1.5vw, 22px)',
};

const UsernameInput = ({ value, onChange, onKeyDown }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      autoComplete="username"
      className="absolute bg-transparent outline-none text-white caret-white cursor-text p-1 m-0 min-h-[44px] border-2 border-dashed border-red-400/70"
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

export { POS as usernamePos };
export default UsernameInput;
