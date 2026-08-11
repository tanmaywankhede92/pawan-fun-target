import { useEffect, useState } from "react";
import prevImg from "@assets/images/background/prevImg.webp";

const SPLASH_MS = 2000;

const SplashScreen = () => {
  const [phase, setPhase] = useState("show");

  useEffect(() => {
    const tFade = setTimeout(() => setPhase("fade"), SPLASH_MS - 300);
    const tHide = setTimeout(() => setPhase("hide"), SPLASH_MS);
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
        src={prevImg}
        alt="Fun Target"
        className="h-full w-full object-fill"
      />
    </div>
  );
};

export default SplashScreen;
