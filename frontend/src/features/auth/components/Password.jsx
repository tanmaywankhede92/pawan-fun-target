// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
import { useState } from "react";
import { useSound } from "@hooks/useSound";
import { isAndroidTv } from "@utils/isTv";

const POS = {
  left: "25%",
  top: "89%",
  width: "24%",
  height: "5.8%",
  fontSize: "clamp(11px, 3.2vh, 18px)",
};




const PasswordInput = ({ value, onChange, onKeyDown, onFocus, onBlur }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { play } = useSound();
  const isTv = isAndroidTv();

  return (
    <div
      className="absolute ft-login-pos overflow-hidden"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <input
        type={showPassword ? "text" : "password"}
        inputMode={isTv ? "none" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete="current-password"
        className="absolute inset-0 min-w-0 w-full h-full border-none outline-none text-black caret-black cursor-text p-0 px-3 m-0 ft-login-field font-bold text-left bg-transparent"
        style={{
          width: "100%",
          height: "100%",
          fontSize: POS.fontSize,
          lineHeight: 1,
          paddingRight: "14%",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      />
      <button
        type="button"
        onClick={() => {
          play("CLICK");
          setShowPassword((s) => !s);
        }}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center border-none cursor-pointer text-gray-600 hover:text-gray-900"
        style={{ width: "12%", height: "100%" }}
      >

      </button>
    </div>
  );
};

export { POS as passwordPos };
export default PasswordInput;
