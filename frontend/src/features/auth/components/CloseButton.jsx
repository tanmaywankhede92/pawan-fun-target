import { useState, useRef, useCallback } from "react";
import closeDefaultImg from "@assets/images/login/credefault.png";
import glowingCloseImg from "@assets/images/login/creglow.png";
import { useSound } from "@hooks/useSound";

// === 1. DEFAULT (NORMAL) IMAGE POSITION & SIZE ===
const DEFAULT_POS = {
  left: "70.10%",
  top: "62.8%",
  width: "17.80%",
  height: "35.90%",
};

// === 2. GLOW (HOVER / CLICK) IMAGE POSITION & SIZE ===
const GLOW_POS = {
  left: "70.10%",
  top: "62.8%",
  width: "17.80%",
  height: "35.50%",
};

const CloseButton = ({ onClick }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { play } = useSound();
  const timerRef = useRef(null);
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
    if (isPressed) return;
    setIsPressed(true);
    try {
      play("CLICK");
    } catch (_) { }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onClick?.();
    }, 250);
  }, [isPressed, onClick, play]);

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
        src={closeDefaultImg}
        alt="Close"
        onClick={handleClick}
        onPointerDown={() => setIsPressed(true)}
        className="absolute cursor-pointer object-fill select-none "
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
        src={glowingCloseImg}
        alt="Close Glow"
        onClick={handleClick}
        onPointerDown={() => setIsPressed(true)}
        className={`absolute cursor-pointer object-fill select-none transition-opacity duration-150 ease-out ${showGlow ? "opacity-100" : "opacity-0  "
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
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setIsPressed(false);
        }}
        aria-label="Close"
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

export { DEFAULT_POS as defaultPos, GLOW_POS as glowPos, DEFAULT_POS as closePos };
export default CloseButton;
