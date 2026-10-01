import { useEffect, useState, useRef } from "react";

const LoginOverlay = ({ children }) => {
  const [shiftY, setShiftY] = useState(0);
  const baseHeightRef = useRef(window.innerHeight);

  useEffect(() => {
    // Record initial full unconstrained height before any keyboard opens
    baseHeightRef.current = Math.max(
      window.innerHeight,
      window.screen?.height || 0,
    );

    const vvApi = window.visualViewport;
    if (!vvApi) return;

    const handleViewportChange = () => {
      const currentVvHeight = vvApi.height;
      const baseHeight = baseHeightRef.current;

      // If visual viewport height dropped significantly (> 18% reduction), mobile keyboard is open
      if (currentVvHeight < baseHeight * 0.82) {
        const active = document.activeElement;
        const isPassword =
          active &&
          (active.type === "password" ||
            active.getAttribute("autocomplete") === "current-password");
        const isUsername =
          active &&
          (active.getAttribute("autocomplete") === "username" ||
            active.type === "text");

        if (isPassword) {
          // Password field is at ~89% of base height
          const targetY = currentVvHeight * 0.45;
          const neededShift = baseHeight * 0.89 - targetY;
          setShiftY(Math.max(0, neededShift));
        } else if (isUsername) {
          // Username field is at ~78% of base height
          const targetY = currentVvHeight * 0.45;
          const neededShift = baseHeight * 0.78 - targetY;
          setShiftY(Math.max(0, neededShift));
        } else {
          const neededShift = baseHeight * 0.82 - currentVvHeight * 0.5;
          setShiftY(Math.max(0, neededShift));
        }
      } else {
        // Keyboard closed: smoothly return to normal position
        setShiftY(0);
      }
    };

    vvApi.addEventListener("resize", handleViewportChange);
    vvApi.addEventListener("scroll", handleViewportChange);
    window.addEventListener("focusin", handleViewportChange);
    window.addEventListener("focusout", () => {
      setTimeout(handleViewportChange, 120);
    });

    return () => {
      vvApi.removeEventListener("resize", handleViewportChange);
      vvApi.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("focusin", handleViewportChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black ft-login-root">
      <div
        className="relative w-screen h-screen ft-login-inner"
        style={{
          transform: shiftY > 0 ? `translateY(-${shiftY}px)` : "none",
          transition: "transform 0.25s ease-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LoginOverlay;
