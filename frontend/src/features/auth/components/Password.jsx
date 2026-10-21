import { useState, useRef } from "react";
import { useSound } from "@hooks/useSound";
import { isAndroidTv } from "@utils/isTv";

const POS = {
  left: "25.2%",
  top: "89.4%",
  width: "23%",
  height: "4.7%",
  fontSize: "clamp(12px, 2.5vh, 19px)",
};

const PasswordInput = ({ value = "", onChange, onKeyDown, onFocus, onBlur }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { play } = useSound();
  const isTv = isAndroidTv();
  const inputRef = useRef(null);

  const displayMask = showPassword ? (value || "") : "*".repeat((value || "").length);

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
      {/* Visual asterisks mask and blinking cursor matching reference TV photo */}
      <div
        className="flex items-center pointer-events-none select-none overflow-hidden"
        style={{
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          fontSize: POS.fontSize,
          fontWeight: 400,
          color: "#1a1a1a",
          letterSpacing: "1px",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        <span>{displayMask}</span>
        {isFocused && (
          <span
            className="ft-cursor-blink"
            style={{
              fontSize: POS.fontSize,
              fontWeight: 300,
              color: "#1a1a1a",
              marginLeft: "1px",
              lineHeight: 1,
            }}
          >
            |
          </span>
        )}
      </div>

      {/* Hidden functional input capturing typing and IME */}
      <input
        ref={inputRef}
        type="text"
        inputMode={isTv ? "none" : undefined}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        autoComplete="current-password"
        spellCheck="false"
        className="absolute inset-0 w-full h-full border-none outline-none cursor-text p-0 m-0 bg-transparent"
        style={{
          color: "transparent",
          caretColor: "transparent",
          background: "transparent",
          zIndex: 2,
        }}
      />
    </div>
  );
};

export default PasswordInput;
