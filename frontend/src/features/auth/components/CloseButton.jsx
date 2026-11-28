import { useState, useRef, useCallback, useEffect } from "react";
import { useSound } from "@hooks/useSound";

// Hitbox position covering the Close Shield and CLOSE text area on login-bg:
const POS = {
  left: "70.10%",
  top: "62.80%",
  width: "17.80%",
  height: "35.90%",
};

const CloseButton = ({ onClick, onActiveChange }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { play } = useSound();
  const timerRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const showGlow = isPressed || isHovered || isFocused;

  // Notify parent (LoginPage) to seamlessly switch the background glow layer
  useEffect(() => {
    onActiveChange?.(showGlow);
  }, [showGlow, onActiveChange]);

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

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      aria-label="Close"
      tabIndex={0}
      className="absolute outline-none p-0 m-0  cursor-pointer "
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        zIndex: 25,
        pointerEvents: "auto",
      }}
    />
  );
};

export { POS as defaultPos, POS as glowPos, POS as closePos };
export default CloseButton;
