import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import FullscreenHandler from "@components/common/FullscreenHandler";
import useTvNavigation from "@hooks/useTvNavigation";
import { SplashScreen as CapSplash } from "@capacitor/splash-screen";
import { applyLowSpecDeviceProfile } from "@utils/deviceProfile";

const App = () => {
  useTvNavigation();

  useEffect(() => {
    applyLowSpecDeviceProfile();
  }, []);

  useEffect(() => {
    // Show splash screen cleanly, then smoothly fade out native splash screen
    const t = setTimeout(() => {
      CapSplash.hide({ fadeOutDuration: 400 }).catch(() => {});
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  // Global Shift + R keyboard shortcut to reload game instantly on any platform/TV
  useEffect(() => {
    const handleReloadShortcut = (e) => {
      if (e.shiftKey && (e.key === "R" || e.key === "r" || e.keyCode === 82)) {
        e.preventDefault();
        window.location.reload();
      }
    };
    window.addEventListener("keydown", handleReloadShortcut, true);
    return () => window.removeEventListener("keydown", handleReloadShortcut, true);
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1a0804" }}>
      <BrowserRouter>
        <AuthProvider>
          <FullscreenHandler />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
