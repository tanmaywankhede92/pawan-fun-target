import { useEffect, useState, useRef } from "react";

const isTvDevice = () => {
  // 1. Direct native Android bridge check (from MainActivity.java)
  try {
    if (window.Android && typeof window.Android.isAndroidTV === "function") {
      return Boolean(window.Android.isAndroidTV());
    }
  } catch {
    // ignored
  }

  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";

  // 2. Desktop check: Windows, Mac, Linux (non-Android) -> NEVER show virtual cursor!
  const isDesktop =
    /Windows NT|Macintosh|Mac OS X/i.test(ua) ||
    (/Linux/i.test(ua) && !/Android/i.test(ua));
  if (isDesktop) return false;

  // 3. Mobile phone check: Mobile phones with touch -> NEVER show virtual cursor!
  const isMobilePhone = /Mobile|iPhone|iPod|Android.*Mobile/i.test(ua);
  if (isMobilePhone) return false;

  // 4. TV User-Agent signatures (Android TV, Google TV, Fire TV, Mi TV, Sony Bravia, etc.)
  const isTV =
    /Android/i.test(ua) &&
    (/TV|GoogleTV|AndroidTV|SmartTV|BRAVIA|AFT|MiTV|NetCast|Tizen|WebOS/i.test(ua) ||
      !/Mobile/i.test(ua));

  return Boolean(isTV);
};

/**
 * VirtualCursor provides a smooth, visible mouse pointer ONLY for Android TV
 * where the operating system does not render a hardware mouse cursor.
 * On Desktop and Mobile Phones, this component is completely inactive.
 */
const VirtualCursor = () => {
  const [isTv, setIsTv] = useState(() => isTvDevice());
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const cursorRef = useRef(null);
  const posRef = useRef({ x: -100, y: -100 });
  const isDownRef = useRef(false);
  const isPointerRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Re-check once Capacitor Android bridge initialises
    if (!isTv && isTvDevice()) {
      setIsTv(true);
    }
  }, [isTv]);

  useEffect(() => {
    if (!isTv) return;

    const updateCursorDom = () => {
      if (cursorRef.current) {
        const { x, y } = posRef.current;
        const scale = isDownRef.current ? 0.85 : 1;
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      }
    };

    const handleMove = (e) => {
      // Ignore pure touch events on phones/tablets
      if (e.pointerType === "touch") {
        setVisible(false);
        return;
      }

      posRef.current = { x: e.clientX, y: e.clientY };
      updateCursorDom();
      setVisible(true);

      // Check if hovering over a clickable element using e.target (no expensive elementFromPoint)
      try {
        const target = e.target;
        if (target) {
          const isClickable = !!target.closest?.(
            "button, a, [role='button'], [tabindex], input, select, textarea, .cursor-pointer"
          );
          if (isClickable !== isPointerRef.current) {
            isPointerRef.current = isClickable;
            setIsPointer(isClickable);
          }
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
      isDownRef.current = true;
      updateCursorDom();
      setVisible(true);
    };

    const handleUp = () => {
      isDownRef.current = false;
      updateCursorDom();
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
  }, [isTv]);

  if (!isTv || !visible) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
        transformOrigin: "top left",
        pointerEvents: "none",
        zIndex: 9999999,
        willChange: "transform",
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
