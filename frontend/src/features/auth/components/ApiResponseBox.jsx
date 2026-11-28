import { useEffect, useState, useRef } from "react";
import { subscribeResponseStatus } from "@utils/apiLog";

// Calibrated to align directly with "Response :- " on 1672x941 login-bg.png:
const POS = {
  left: "16.5%",
  top: "1.4%",
};

const BLINK_CYCLE_MS = 450; // ~0.45s per blink cycle

const ApiResponseBox = () => {
  const [status, setStatus] = useState({
    message: "",
    blinkCount: 0,
    seq: 0,
  });
  const [isBlinking, setIsBlinking] = useState(false);
  const timerRef = useRef(null);

  // 1. Initial startup sequence & network connectivity handling:
  // - If connected: "Internet Connected" (2 blinks) + "Please Now Login" (5 blinks) = TOTAL 7 blinks -> then stable
  // - If offline: "Internet not Connected" (5 blinks -> stable until reconnected)
  useEffect(() => {
    const runStartupFlow = (online) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (online) {
        // Step 1: "Internet Connected" (blinks 2 times)
        setStatus({
          message: "Internet Connected",
          blinkCount: 2,
          seq: Date.now(),
        });
        setIsBlinking(true);

        // Step 2: After 2 blinks (2 * 450ms = 900ms), transition to "Please Now Login" (blinks 5 times: 2 + 5 = 7 total)
        timerRef.current = setTimeout(() => {
          setStatus({
            message: "Please Now Login",
            blinkCount: 5,
            seq: Date.now(),
          });
          setIsBlinking(true);

          // Step 3: After 5 blinks (5 * 450ms = 2250ms), stay stable
          timerRef.current = setTimeout(() => {
            setIsBlinking(false);
          }, 5 * BLINK_CYCLE_MS);
        }, 2 * BLINK_CYCLE_MS);
      } else {
        // Offline: "Internet not Connected" (blinks 5 times, then stays stable until reconnected)
        setStatus({
          message: "Internet not Connected",
          blinkCount: 5,
          seq: Date.now(),
        });
        setIsBlinking(true);

        timerRef.current = setTimeout(() => {
          setIsBlinking(false);
        }, 5 * BLINK_CYCLE_MS);
      }
    };

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    runStartupFlow(isOnline);

    const handleOnline = () => {
      runStartupFlow(true);
    };

    const handleOffline = () => {
      runStartupFlow(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. Subscribe to dynamic status updates (10-digit validation, empty password, backend error, etc.)
  useEffect(() => {
    return subscribeResponseStatus((newStatus) => {
      if (!newStatus?.message) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const blinks = newStatus.blinkCount || 7;
      setStatus({
        message: newStatus.message,
        blinkCount: blinks,
        seq: newStatus.seq || Date.now(),
      });
      setIsBlinking(true);

      timerRef.current = setTimeout(() => {
        setIsBlinking(false);
      }, blinks * BLINK_CYCLE_MS);
    });
  }, []);

  const handleAnimationEnd = () => {
    // Secondary safety: ensure blink animation stops cleanly once iterations finish
    setIsBlinking(false);
  };

  if (!status?.message) return null;

  return (
    <div
      className="ft-api-box"
      style={{
        left: POS.left,
        top: POS.top,
      }}
    >
      <span
        key={`${status.seq}-${status.message}`}
        className={isBlinking ? "api-message-blink" : ""}
        onAnimationEnd={handleAnimationEnd}
        style={{
          animationIterationCount: status.blinkCount || 7,
        }}
      >
        {status.message}
      </span>

      <style>
        {`
          .ft-api-box {
            position: absolute;
            z-index: 50;
            display: flex;
            align-items: center;
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
            
            font-size: clamp(12px, 1.6vw, 20px);
            color: #F8B500;
            white-space: nowrap;
            pointer-events: none;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.85);
            line-height: 1;
          }

          .api-message-blink {
            animation: apiBlink 0.45s ease-in-out forwards;
          }

          @keyframes apiBlink {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export { POS as responsePos };
export default ApiResponseBox;
