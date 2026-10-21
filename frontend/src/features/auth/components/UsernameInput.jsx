import { useRef } from "react";
import { isAndroidTv } from "@utils/isTv";

const POS = {
  left: "25.2%",
  top: "78.6%",
  width: "23%",
  height: "4.7%",
  fontSize: "clamp(12px, 2.5vh, 19px)",
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
      className="absolute ft-login-pos flex items-center bg-white cursor-text"
      onClick={() => inputRef.current?.focus()}
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        boxSizing: "border-box",
        paddingLeft: "14px",
        paddingRight: "10px",
        borderRadius: "4px",

        overflow: "hidden",
      }}
    >
      <span
        className="select-none pointer-events-none flex-shrink-0"
        style={{
          fontSize: POS.fontSize,
          lineHeight: 1,
          paddingRight: "0px",
          color: "#1a1a1a",
          fontWeight: 400,
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          letterSpacing: "0.5px",
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
        spellCheck="false"
        className="flex-1 min-w-0 w-full h-full border-none outline-none caret-black cursor-text p-0 m-0 ft-login-field text-left bg-transparent"
        style={{
          fontSize: POS.fontSize,
          lineHeight: 1,
          fontWeight: 400,
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          color: "#1a1a1a",
          letterSpacing: "0.5px",
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

export default UsernameInput;
