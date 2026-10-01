const POS = {
  left: "25%",
  top: "78%",
  width: "24%",
  height: "6%",
  fontSize: "clamp(11px, 3.2vh, 18px)",
};

const UsernameInput = ({ value, onChange, onKeyDown }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      autoComplete="username"
      className="absolute bg-transparent outline-none text-black caret-black cursor-text p-0 px-2 m-0 ft-login-field ft-login-pos justify-center text-center font-bold"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        lineHeight: 1,
        boxSizing: "border-box",
      }}
    />
  );
};

export { POS as usernamePos };
export default UsernameInput;
