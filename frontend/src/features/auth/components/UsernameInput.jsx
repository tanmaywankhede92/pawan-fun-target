import { useRef } from "react";
import { isAndroidTv } from "@utils/isTv";

const POS = {
  left: "25%",
  top: "78%",
  width: "24%",
  height: "6%",
  fontSize: "clamp(11px, 3.2vh, 18px)",
};

const UsernameInput = ({ value, onChange, onKeyDown, onFocus, onBlur }) => {
  const isTv = isAndroidTv();
  const inputRef = useRef(null);

  const displayVal = (value || "").replace(/^gk/i, "");

  const handleChange = (e) => {
    const raw = e.target.value.toLowerCase().replace(/^gk/i, "");
    onChange(raw);
  };

  return (
    <div
      className="absolute ft-login-pos flex items-center bg-white cursor-text overflow-hidden"
      onClick={() => inputRef.current?.focus()}
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        boxSizing: "border-box",
        paddingLeft: "12px",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <span
        className="select-none pointer-events-none font-bold text-black flex-shrink-0"
        style={{
          fontSize: POS.fontSize,
          lineHeight: 1,
          paddingRight: "2px",
          color: "#000",
          fontWeight: 700,
          fontFamily: "inherit",
        }}
      >
        GK
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode={isTv ? "none" : undefined}
        value={displayVal}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete="off"
        className="flex-1 min-w-0 w-full h-full border-none outline-none text-black caret-black cursor-text p-0 m-0 ft-login-field font-bold text-left bg-transparent"
        style={{
          fontSize: POS.fontSize,
          lineHeight: 1,
          boxSizing: "border-box",
          paddingLeft: "0px",
          marginLeft: "0px",
          textTransform: "lowercase",
          minWidth: 0,
        }}
      />
    </div>
  );
};

export { POS as usernamePos };
export default UsernameInput;
