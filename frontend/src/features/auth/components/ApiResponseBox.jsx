import { useEffect, useMemo, useState } from "react";
import { getApiLog, subscribeApiLog } from "@utils/apiLog";

const ApiResponseBox = () => {
  const [log, setLog] = useState(getApiLog);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    return subscribeApiLog(setLog);
  }, []);

  const latest = useMemo(() => {
    const login = log.login;
    const logout = log.logout;

    if (!login?.body?.message && !logout?.body?.message) {
      return null;
    }

    if ((login?.seq || 0) > (logout?.seq || 0)) {
      return login;
    }

    return logout;
  }, [log]);

  useEffect(() => {
    if (!latest?.body?.message) return;

    setBlink(false);

    const timer = setTimeout(() => {
      setBlink(true);
    }, 10);

    return () => clearTimeout(timer);
  }, [latest]);

  return (
    <div className="ft-api-box">
      {latest?.body?.message && (
        <div className={blink ? "api-message-blink" : ""}>
          {latest.body.message}
        </div>
      )}

      <style>
        {`
          .ft-api-box {
            position: absolute;
            left: 16%;
            top: 1%;
            z-index: 50;

            font-family: monospace;
            font-size: clamp(12px, 1.5vw, 20px);
            color: #F8B500;
            white-space: nowrap;
            pointer-events: none;
          }

          .api-message-blink {
            animation: apiBlink 0.4s ease-in-out 3;
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

export default ApiResponseBox;
