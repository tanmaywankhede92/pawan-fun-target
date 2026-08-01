// === ADJUST THESE VALUES TO MATCH YOUR IMAGE ===
import { useState } from "react";

const POS = {
  left: "25%",
  top: "89%",
  width: "24%",
  height: "5.8%",
  fontSize: "clamp(14px, 1.6vw, 24px)",
};

const EyeOpenIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
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
    className="w-5 h-5"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const PasswordInput = ({ value, onChange, onKeyDown }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="absolute"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
      }}
    >
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="current-password"
        className="absolute inset-0 border-none outline-none text-black caret-black cursor-text p-0 m-0 ft-login-field"
        style={{
          width: "100%",
          height: "100%",
          fontSize: POS.fontSize,
          paddingRight: "12%",
        }}
      />
      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center border-none cursor-pointer text-gray-600 hover:text-gray-900"
        style={{ width: "12%", height: "100%" }}
      >
        {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
};

export { POS as passwordPos };
export default PasswordInput;
