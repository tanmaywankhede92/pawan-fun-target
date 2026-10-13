import { useEffect, useRef } from "react";

/**
 * Automatically logs the user out when the app becomes hidden
 * (tab switch, minimize, Home button, Android background).
 *
 * Uses the existing logout() from AuthContext — no new auth system.
 * Idempotent: multiple hidden events will only trigger logout once.
 *
 * @param {Function} logout - The existing logout function from useAuth()
 * @param {Function} navigate - React Router navigate for redirect
 */
const useGameSessionGuard = (logout, navigate) => {
  const logoutFired = useRef(false);

  useEffect(() => {
    if (!logout || !navigate) return;

    const handleLogout = () => {
      if (logoutFired.current) return;
      logoutFired.current = true;

      logout()
        .catch(() => {})
        .finally(() => {
          navigate("/login", { replace: true });
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleLogout();
      }
    };

    // Android WebView fallback: the native wrapper calls
    // window.__appLock() from onPause() if visibilitychange
    // does not fire.
    window.__appLock = handleLogout;

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleLogout);
    window.addEventListener("beforeunload", handleLogout);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleLogout);
      window.removeEventListener("beforeunload", handleLogout);
      delete window.__appLock;
    };
  }, [logout, navigate]);
};

export default useGameSessionGuard;
