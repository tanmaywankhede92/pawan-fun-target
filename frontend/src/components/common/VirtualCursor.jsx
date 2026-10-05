import { useEffect, useState, useRef } from "react";

/**
 * VirtualCursor provides a smooth, visible mouse pointer for Android TV
 * and devices where the operating system does not render a hardware mouse cursor.
 * It tracks standard pointer/mouse movements and renders an arcade-style pointer.
 */
const VirtualCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      // Ignore pure touch events on phones/tablets
      if (e.pointerType === "touch") {
        setVisible(false);
        return;
      }

      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);

      // Check if hovering over a clickable element
      try {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target) {
          const isClickable = target.closest(
            "button, a, [role='button'], [tabindex], input, select, textarea, .cursor-pointer"
          );
          setIsPointer(!!isClickable);
        }
      } catch {
        // ignored
      }

      // Auto-hide cursor after 4 seconds of inactivity
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    const handleDown = (e) => {
      if (e.pointerType === "touch") return;
      setIsDown(true);
      setVisible(true);
    };

    const handleUp = () => {
      setIsDown(false);
    };

    const handleKey = (e) => {
      // If TV remote navigation is used, smoothly hide the mouse cursor
      if (
        e.key?.startsWith("Arrow") ||
        e.key === "Enter" ||
        e.key === "Select" ||
        e.keyCode === 23 ||
        e.keyCode === 19 ||
        e.keyCode === 20 ||
        e.keyCode === 21 ||
        e.keyCode === 22
      ) {
        setVisible(false);
      }
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown, { passive: true });
    window.addEventListener("mousedown", handleDown, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });
    window.addEventListener("mouseup", handleUp, { passive: true });
    window.addEventListener("keydown", handleKey, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("keydown", handleKey);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: isDown ? "scale(0.85)" : "scale(1)",
        transformOrigin: "top left",
        pointerEvents: "none",
        zIndex: 9999999,
        transition: "transform 0.06s ease",
        filter: "drop-shadow(1px 2px 4px rgba(0,0,0,0.7))",
      }}
    >
      {isPointer ? (
        // Pointing Hand for buttons / numbers / chips
        <svg
          width="26"
          height="28"
          viewBox="0 0 24 24"
          fill="#ffd700"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      ) : (
        // Classic White & Black Pointer Arrow
        <svg
          width="24"
          height="26"
          viewBox="0 0 24 24"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="1.5"
        >
          <polygon points="0,0 20,11 11,13 15,22 11,24 7,15 0,18" />
        </svg>
      )}
    </div>
  );
};

export default VirtualCursor;
