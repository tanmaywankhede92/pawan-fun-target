import { useEffect, useState } from "react";
import { SplashScreen as CapSplash } from "@capacitor/splash-screen";
import prevImg from "@assets/images/background/prevImg.webp";

const SPLASH_MS = 2000;

// Preload images while splash is showing so they're ready instantly.
const PRELOAD_IMAGES = [
  // Login background
  import("@assets/images/background/PrevBG.webp"),
  // Game wheel
  import("@assets/images/wheel/wheel.webp"),
  // Game GIFs
  import("@assets/images/gifs/joker_gif1_slow.webp"),
  import("@assets/images/gifs/joker1.webp"),
  import("@assets/images/gifs/joker2.webp"),
  import("@assets/images/gifs/joker3.webp"),
  import("@assets/images/gifs/joker4.webp"),
  import("@assets/images/gifs/DG.webp"),
  import("@assets/images/gifs/FTlogo2.webp"),
  import("@assets/images/gifs/timerDisplay.webp"),
];

const SplashScreen = () => {
  const [phase, setPhase] = useState("show");

  useEffect(() => {
    // Preload all critical images in background.
    PRELOAD_IMAGES.forEach((p) => p.catch(() => {}));

    const tFade = setTimeout(() => setPhase("fade"), SPLASH_MS - 300);
    const tHide = setTimeout(() => {
      setPhase("hide");
      // Hide the native Capacitor splash after our web splash fades out.
      CapSplash.hide().catch(() => {});
    }, SPLASH_MS);
    return () => {
      clearTimeout(tFade);
      clearTimeout(tHide);
    };
  }, []);

  if (phase === "hide") return null;

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden bg-black"
      style={{
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.3s ease",
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      <img
        decoding="async"
        src={prevImg}
        alt="Fun Target"
        className="h-full w-full object-fill"
      />
    </div>
  );
};

export default SplashScreen;
