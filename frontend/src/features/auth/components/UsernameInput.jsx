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
      {/* Permanent SK prefix that cannot be deleted */}
      <span
        className="select-none font-bold text-black flex items-center justify-center pl-2 pr-0 pointer-events-none"
        style={{
          fontSize: POS.fontSize,
          lineHeight: 1,
          fontFamily: "inherit",
          letterSpacing: "normal",
        }}
      >
        SK
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          // In case user pasted or auto-filled with SK prefix, strip it so it doesn't duplicate
          if (val.toUpperCase().startsWith("SK")) {
            val = val.slice(2);
          }
          onChange(val);
        }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete="off"
        className="flex-1 h-full border-none outline-none text-black caret-black cursor-text p-0 m-0 ft-login-field font-bold text-left bg-transparent"
        style={{
          fontSize: POS.fontSize,
          lineHeight: 1,
          boxSizing: "border-box",
          paddingLeft: "0px",
          marginLeft: "0px",
        }}
      />
    </div>
  );
};

export { POS as usernamePos };
export default UsernameInput;
