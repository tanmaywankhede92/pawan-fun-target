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

const EyeOpenIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 max-h-[75%]"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 max-h-[75%]"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const PasswordInput = ({ value, onChange, onKeyDown, onFocus, onBlur }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { play } = useSound();
  const isTv = isAndroidTv();

  return (
    <div
      className="absolute ft-login-pos"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
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
        className="absolute inset-0 border-none outline-none text-black caret-black cursor-text p-0 px-3 m-0 ft-login-field font-bold text-left"
        style={{
          width: "100%",
          height: "100%",
          fontSize: POS.fontSize,
          lineHeight: 1,
          paddingRight: "14%",
          boxSizing: "border-box",
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
        {showPassword ? <EyeOpenIcon /> : <EyeOffIcon />}
      </button>
    </div>
  );
};

export { POS as passwordPos };
export default PasswordInput;
