import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import FullscreenHandler from "@components/common/FullscreenHandler";
import useTvNavigation from "@hooks/useTvNavigation";
import prevImg from "@assets/images/background/prevImg.webp";
import { SplashScreen as CapSplash } from "@capacitor/splash-screen";

const App = () => {
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  useTvNavigation();

  useEffect(() => {
    CapSplash.hide({ fadeOutDuration: 150 }).catch(() => {});

    // Show the branded splash overlay briefly while the login page & background mount underneath,
    // then smoothly fade out. This completely eliminates any black screen hang on launch.
    const tFade = setTimeout(() => setSplashFade(true), 600);
    const tHide = setTimeout(() => setSplashVisible(false), 900);

    return () => {
      clearTimeout(tFade);
      clearTimeout(tHide);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#000000" }}>
      <BrowserRouter>
        <AuthProvider>
          <FullscreenHandler />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>

      {splashVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: splashFade ? 0 : 1,
            transition: "opacity 0.3s ease-out",
            pointerEvents: splashFade ? "none" : "auto",
          }}
        >
          <img
            src={prevImg}
            alt="Fun Target"
            style={{ width: "100%", height: "100%", objectFit: "fill" }}
          />
        </div>
      )}
    </div>
  );
};

export default App;