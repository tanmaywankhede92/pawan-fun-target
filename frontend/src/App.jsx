// import { useState, useEffect } from "react";
// import { BrowserRouter } from "react-router-dom";
// import { AuthProvider } from "@context/AuthContext";
// import AppRoutes from "@routes/AppRoutes";
// import FullscreenHandler from "@components/common/FullscreenHandler";
// import prevImg from "@assets/images/background/prevImg.webp";
// import { Capacitor } from "@capacitor/core";
// import { SplashScreen as CapSplash } from "@capacitor/splash-screen";

// const SPLASH_LOGO_MS = 300;
// const SPLASH_PREV_MS = 2000;

// const App = () => {
//   const [phase, setPhase] = useState("logo");

//   useEffect(() => {
//     // Phase 1: Logo (native Capacitor splash shows for 1 sec)
//     // Phase 2: prevImg for 2 sec
//     // Phase 3: App
//     const t1 = setTimeout(() => {
//       setPhase("prev");
//       CapSplash.hide({ fadeOutDuration: 300 }).catch(() => {});
//     }, SPLASH_LOGO_MS);

//     const t2 = setTimeout(
//       () => setPhase("app"),
//       SPLASH_LOGO_MS + SPLASH_PREV_MS,
//     );

//     return () => {
//       clearTimeout(t1);
//       clearTimeout(t2);
//     };
//   }, []);

//   if (phase === "logo") return null;

//   if (phase === "prev") {
//     return (
//       <div
//         style={{
//           width: "100vw",
//           height: "100vh",
//           backgroundColor: "#000",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <img
//           src={prevImg}
//           alt="Fun Target"
//           style={{ width: "100%", height: "100%", objectFit: "fill" }}
//         />
//       </div>
//     );
//   }

//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <FullscreenHandler />
//         <AppRoutes />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// };

// export default App;

import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import AppRoutes from "@routes/AppRoutes";
import FullscreenHandler from "@components/common/FullscreenHandler";
import useTvNavigation from "@hooks/useTvNavigation";
import prevImg from "@assets/images/background/prevImg.webp";
import { SplashScreen as CapSplash } from "@capacitor/splash-screen";

const SPLASH_PREV_MS = 2000;

const App = () => {
  const [phase, setPhase] = useState("prev");
  useTvNavigation();

  useEffect(() => {
    // Phase 2: prevImg for 2 sec
    // Phase 3: App
    CapSplash.hide({ fadeOutDuration: 300 }).catch(() => {});

    const t = setTimeout(
      () => setPhase("app"),
      SPLASH_PREV_MS,
    );

    return () => {
      clearTimeout(t);
    };
  }, []);

  if (phase === "prev") {
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