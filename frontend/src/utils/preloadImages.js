import loginBg from "../assets/images/login/login-bg.webp";
import prevBg from "../assets/images/background/PrevBG.webp";
import homeBg from "../assets/images/home/homeImg.webp";
import prevImg from "../assets/images/background/prevImg.webp";

// Preload and GPU-decode only the critical flow backgrounds so transitions
// between Boot -> Login -> Lobby -> Game are instantaneous with zero black or blank flashes.
const criticalImages = [loginBg, prevBg, homeBg, prevImg];

const preloadImages = () => {
  if (typeof window === "undefined") return;

  criticalImages.forEach((src) => {
    if (!src) return;
    try {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    } catch {
      // Ignore background decode errors
    }
  });
};

preloadImages();

export default preloadImages;
