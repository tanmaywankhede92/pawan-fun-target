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

// Android Chrome / Samsung Internet can auto-rotate the screen into
// landscape (requires fullscreen). iOS Safari has no orientation.lock, so
// this silently no-ops there.
const isMobileCoarse = () =>
  window.matchMedia("(hover: none)").matches &&
  window.matchMedia("(pointer: coarse)").matches;

const lockLandscape = () => {
  if (!isMobileCoarse()) return;
  try {
    const o = window.screen?.orientation;
    if (o?.lock) o.lock("landscape").catch(() => {});
  } catch {
    // unsupported / blocked — fall back to the physical rotate prompt
  }
};

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
      lockLandscape();
    };

    const onFsChange = () => {
      // If the user left fullscreen, re-enter on the next interaction.
      if (!isFullscreen() && everActed.current) requestFs();
      lockLandscape();
    };

    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("touchstart", onGesture);
    window.addEventListener("keydown", onGesture);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    // Dynamic orientation handling: whenever the physical orientation changes
    // (e.g. the device is rotated back to portrait), re-lock to landscape
    // immediately. While fullscreen is active a lock needs no user gesture,
    // so the screen snaps back on its own instead of waiting for a tap.
    const onOrientationChange = () => lockLandscape();
    const orient = window.screen?.orientation;
    orient?.addEventListener?.("change", onOrientationChange);
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("keydown", onGesture);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      orient?.removeEventListener?.("change", onOrientationChange);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, []);

  return null;
};

export default FullscreenHandler;
