import { useState, useRef } from "react";
import { useSound } from "@hooks/useSound";
import { isAndroidTv } from "@utils/isTv";

const POS = {
  left: "27.25%",
  top: "88.5%",
  width: "14.4%",
  height: "4.4%",
  fontSize: "clamp(12px, 2.5vh, 19px)",
};

const PasswordInput = ({ value = "", onChange, onKeyDown, onFocus, onBlur }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { play } = useSound();
  const isTv = isAndroidTv();
  const inputRef = useRef(null);

  // Maximum 15 characters allowed
  const safeVal = (value || "").slice(0, 15);
  const displayMask = "*".repeat(safeVal.length);

  const handleChange = (e) => {
    // Restrict strictly to max 15 characters; ignore anything beyond 15
    const clean = (e.target.value || "").slice(0, 15);
    onChange(clean);
  };

  return (
    <div
      className="absolute ft-login-pos flex items-center cursor-text select-none"
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
        zIndex: 10,
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Visual asterisks mask matching the exact font and style */}
      <div
        className="flex items-center pointer-events-none select-none overflow-hidden"
        style={{
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          fontSize: POS.fontSize,
          fontWeight: 400,
          color: "#1a1a1a",
          letterSpacing: "0.5px",
          lineHeight: 1,
          whiteSpace: "nowrap",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <span className="select-none" style={{ userSelect: "none", WebkitUserSelect: "none" }}>
          {displayMask}
        </span>
        {isFocused && (
          <span
            className="ft-cursor-blink select-none"
            style={{
              fontSize: POS.fontSize,
              fontWeight: 300,
              color: "#1a1a1a",
              marginLeft: "1px",
              lineHeight: 1,
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            |
          </span>
        )}
      </div>

      {/* Hidden functional input: type='password', maxLength=15, selection prevented */}
      <input
        ref={inputRef}
        type="password"
        inputMode={isTv ? "none" : "text"}
        maxLength={15}
        value={safeVal}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onSelect={(e) => {
          // Collapse selection so highlight never shows or reveals text
          e.target.selectionStart = e.target.selectionEnd;
        }}
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
        className="absolute inset-0 w-full h-full border-none outline-none cursor-text p-0 m-0 bg-transparent select-none ft-no-select"
        style={{
          color: "transparent",
          caretColor: "transparent",
          background: "transparent",
          zIndex: 2,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />

      <style>
        {`
          .ft-no-select::selection {
            background: transparent !important;
            color: transparent !important;
          }
          .ft-no-select::-moz-selection {
            background: transparent !important;
            color: transparent !important;
          }
        `}
      </style>
    </div>
  );
};

export default PasswordInput;
