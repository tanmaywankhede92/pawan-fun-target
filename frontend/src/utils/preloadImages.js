import loginBg from "../assets/images/login/login-bg.webp";
import prevBg from "../assets/images/background/PrevBG.webp";
import homeBg from "../assets/images/home/homeImg.webp";
import prevImg from "../assets/images/background/prevImg.webp";
import wheelImg from "../assets/images/wheel/wheel.webp";

// 16 gamelist thumbnails
import iconFunTarget from "../assets/gamelist/Icon.webp";
import imgTripleFun from "../assets/gamelist/TripleFun.jpeg";
import img7up7Down from "../assets/gamelist/7up7Down.jpeg";
import imgBingo from "../assets/gamelist/Bingo.jpeg";
import imgChampionPoker from "../assets/gamelist/ChampionPoker.jpeg";
import imgChecker from "../assets/gamelist/Checker.jpeg";
import imgFeverJokerBonus from "../assets/gamelist/FeverJokerBonus.jpeg";
import imgFunAndarBahar from "../assets/gamelist/FunAndarBahar.jpeg";
import imgFunAviator from "../assets/gamelist/FunAviator.jpeg";
import imgFunRoulette from "../assets/gamelist/FunRoulette.jpeg";
import imgGiantJackpot from "../assets/gamelist/GiantJackpot.jpeg";
import imgJokerBonus from "../assets/gamelist/JokerBonus.jpeg";
import imgKeno from "../assets/gamelist/Keno.jpeg";
import imgLucky8Line from "../assets/gamelist/Lucky8Line.jpeg";
import imgNohold from "../assets/gamelist/Nohold.jpeg";
import imgSuperGoldenWheel from "../assets/gamelist/SuperGoldenWheel.jpeg";

const allFlowImages = [
  loginBg,
  prevBg,
  homeBg,
  prevImg,
  wheelImg,
  iconFunTarget,
  imgTripleFun,
  img7up7Down,
  imgBingo,
  imgChampionPoker,
  imgChecker,
  imgFeverJokerBonus,
  imgFunAndarBahar,
  imgFunAviator,
  imgFunRoulette,
  imgGiantJackpot,
  imgJokerBonus,
  imgKeno,
  imgLucky8Line,
  imgNohold,
  imgSuperGoldenWheel,
];

// Global cache with explicit release capability for account transitions
if (typeof window !== "undefined" && !window.__permanentImageCache) {
  window.__permanentImageCache = new Map();
}

export const clearPermanentImageCache = () => {
  if (typeof window === "undefined" || !window.__permanentImageCache) return;
  try {
    for (const img of window.__permanentImageCache.values()) {
      if (img) {
        img.src = "";
        img.onload = null;
        img.onerror = null;
      }
    }
  } catch {
    // ignore
  }
  window.__permanentImageCache.clear();
};

const preloadImages = () => {
  if (typeof window === "undefined") return;

  allFlowImages.forEach((src) => {
    if (!src || window.__permanentImageCache.has(src)) return;
    try {
      const img = new Image();
      img.src = src;
      window.__permanentImageCache.set(src, img);
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
