const POS = {
  left: "25%",
  top: "78%",
  width: "24%",
  height: "6%",
  fontSize: "clamp(11px, 3.2vh, 18px)",
};

const UsernameInput = ({ value, onChange, onKeyDown, onFocus, onBlur }) => {
  return (
    <div
      className="absolute ft-login-pos flex items-center bg-white"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        boxSizing: "border-box",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete="off"
        className="w-full h-full border-none outline-none text-black caret-black cursor-text p-0 m-0 ft-login-field font-bold text-left bg-transparent"
        style={{
          fontSize: POS.fontSize,
          lineHeight: 1,
          boxSizing: "border-box",
          paddingLeft: "12px",
          marginLeft: "0px",
          textTransform: "lowercase",
        }}
      />
    </div>
  );
};

export { POS as usernamePos };
export default UsernameInput;
