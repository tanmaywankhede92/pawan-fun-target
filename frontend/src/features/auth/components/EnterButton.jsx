import { useState, useRef, useCallback } from "react";
import enterDefaultImg from "@assets/images/login/enter_default.png";
import enterGlowImg from "@assets/images/login/enter_glow.png";
import { useSound } from "@hooks/useSound";

// === 1. DEFAULT (NORMAL) ENTER IMAGE POSITION & SIZE ===
const DEFAULT_POS = {
  left: "47.20%",
  top: "91.80%",
  width: "11.10%",
  height: "4.83%",
};

// === 2. GLOW (HOVER / FOCUS / CLICK) ENTER IMAGE POSITION & SIZE ===
const GLOW_POS = {
  left: "46.90%",
  top: "91.50%",
  width: "11.10%",
  height: "5.50%",
};

const EnterButton = ({ onClick, loading }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { play } = useSound();
  const hoverTimerRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsPressed(false);
    }, 50);
  }, []);

  const handleClick = useCallback(() => {
    if (loading) return;
    setIsPressed(true);
    try {
      play("CLICK");
    } catch (_) { }
    onClick?.();
    setTimeout(() => {
      setIsPressed(false);
    }, 300);
  }, [loading, onClick, play]);

  const handleKeyDown = useCallback(
    (e) => {
      if (
        e.key === "Enter" ||
        e.key === "Select" ||
        e.key === "Ok" ||
        e.keyCode === 13 ||
        e.keyCode === 23
      ) {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const showGlow = isPressed || isHovered || isFocused;

  return (
    <div
      className="ft-login-pos"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Default Image (Normal state) */}
      <img
        src={enterDefaultImg}
        alt="Enter"
        onClick={handleClick}
        onPointerDown={(e) => {
          e.preventDefault();
          setIsPressed(true);
        }}
        className="absolute cursor-pointer object-fill select-none"
        style={{
          left: DEFAULT_POS.left,
          top: DEFAULT_POS.top,
          width: DEFAULT_POS.width,
          height: DEFAULT_POS.height,
          zIndex: 19,
          pointerEvents: "auto",
        }}
      />

      {/* 2. Glowing Image (Hover / Focus / Click state) */}
      <img
        src={enterGlowImg}
        alt="Enter Glow"
        onClick={handleClick}
        onPointerDown={(e) => {
          e.preventDefault();
          setIsPressed(true);
        }}
        className={`absolute cursor-pointer object-fill select-none transition-opacity duration-150 ease-out ${showGlow ? "opacity-100" : "opacity-0"
          }`}
        style={{
          left: GLOW_POS.left,
          top: GLOW_POS.top,
          width: GLOW_POS.width,
          height: GLOW_POS.height,
          zIndex: 20,
          pointerEvents: showGlow ? "auto" : "none",
        }}
      />

      {/* Focusable button for TV Remote D-Pad / Keyboard Tab navigation */}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setIsPressed(false);
        }}
        aria-label="Enter"
        tabIndex={0}
        className="absolute outline-none p-0 m-0 border-0 bg-transparent"
        style={{
          left: DEFAULT_POS.left,
          top: DEFAULT_POS.top,
          width: DEFAULT_POS.width,
          height: DEFAULT_POS.height,
          zIndex: 21,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export { DEFAULT_POS as enterPos, DEFAULT_POS as defaultPos, GLOW_POS as glowPos };
export default EnterButton;
