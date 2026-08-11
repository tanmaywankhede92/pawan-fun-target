import { useEffect, useRef } from "react";

const requestFs = () => {
  const el = document.documentElement;
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  try {
    fn?.call(el);
  } catch {
    // ignored — browsers that block it will re-try on the next gesture
  }
};

const isFullscreen = () =>
  Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement,
  );

// Keeps the whole app in fullscreen on mobile (Android Chrome etc.),
// for every page. iOS Safari has no Fullscreen API for web pages, so it
// silently no-ops there and the layout still fills the viewport.
const FullscreenHandler = () => {
  const everActed = useRef(false);

  useEffect(() => {
    requestFs();

    const onGesture = () => {
      everActed.current = true;
      if (!isFullscreen()) requestFs();
    };

    const onFsChange = () => {
      // If the user left fullscreen, re-enter on the next interaction.
      if (!isFullscreen() && everActed.current) requestFs();
    };

    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("touchstart", onGesture);
    window.addEventListener("keydown", onGesture);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("keydown", onGesture);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  return null;
};

export default FullscreenHandler;
