import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import FullscreenHandler from "@components/common/FullscreenHandler";
import prevImg from "@assets/images/background/prevImg.webp";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={prevImg}
          alt="Fun Target"
          style={{ width: "100%", height: "100%", objectFit: "fill" }}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <FullscreenHandler />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
