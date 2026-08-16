import { useEffect, useState } from "react";

const KEYFRAMES = `
@keyframes ft-rotate-device {
  0%, 100% { transform: rotate(0deg); }
  25%      { transform: rotate(-28deg); }
  75%      { transform: rotate(28deg); }
}
@keyframes ft-rotate-arrow {
  0%, 100% { transform: translateX(0); opacity: 0.5; }
  50%      { transform: translateX(4px); opacity: 1; }
}
`;

const isMobileDevice = () =>
  window.matchMedia("(max-width: 1024px)").matches &&
  window.matchMedia("(hover: none)").matches &&
  window.matchMedia("(pointer: coarse)").matches;

// Android Chrome / Samsung Internet can force the screen into landscape
// automatically via fullscreen + screen.orientation.lock. iOS Safari has
// no orientation.lock, so it still needs the physical rotate prompt.
const canAutoRotate = () =>
  typeof window !== "undefined" && Boolean(window.screen?.orientation?.lock);

const attemptAutoRotate = async () => {
  const el = document.documentElement;
  const fs =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  // screen.orientation.lock() only works while the document is fullscreen,
  // so wait for the fullscreen request to settle before locking.
  try {
    await fs?.call(el);
  } catch {
    // fullscreen blocked until a user gesture — the lock below is still
    // attempted for browsers that don't require fullscreen
  }
  try {
    const o = window.screen?.orientation;
    if (o?.lock) await o.lock("landscape");
  } catch {
    // orientation lock unsupported / failed (e.g. iOS Safari)
  }
};

const RotateDeviceOverlay = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      setShow(isMobileDevice() && portrait);
    };

    update();
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);

    // Auto-rotate the screen the moment the browser allows it (fullscreen
    // needs a user gesture): try on load and again on every tap. Once the
    // orientation lock succeeds, the portrait matchMedia flips and the
    // overlay hides on its own.
    attemptAutoRotate();
    const onGesture = () => attemptAutoRotate();
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("touchstart", onGesture);
    window.addEventListener("keydown", onGesture);

    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  if (!show) return null;

  const autoRotate = canAutoRotate();

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#0c1520] px-8 text-center"
      onClick={autoRotate ? attemptAutoRotate : undefined}
    >
      <style>{KEYFRAMES}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(245,197,66,0.12), transparent 60%)",
        }}
      />

      <div className="relative flex h-[120px] w-[170px] items-center justify-center">
        <div
          className="absolute rounded-[22px] border-4 border-[#f5c542] bg-gradient-to-b from-[#1c2b3a] to-[#121c28]"
          style={{
            width: "46px",
            height: "84px",
            animation: "ft-rotate-device 1.6s ease-in-out infinite",
            boxShadow: "0 0 25px rgba(245,197,66,0.35)",
          }}
        >
          <div className="absolute left-1/2 top-1.5 h-1 w-5 -translate-x-1/2 rounded-full bg-[#f5c542]/60" />
          <div className="absolute left-1/2 top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5c542]/40" />
        </div>
        <div
          className="absolute right-0 text-3xl text-[#f5c542]"
          style={{ animation: "ft-rotate-arrow 1.2s ease-in-out infinite", textShadow: "0 0 10px rgba(245,197,66,0.8)" }}
        >
          ↻
        </div>
      </div>

      <div
        className="mt-5 text-[clamp(16px,4.5vw,22px)] font-extrabold uppercase tracking-[0.3em] text-[#ffdf80]"
        style={{ textShadow: "0 0 12px rgba(255,215,0,0.6)" }}
      >
        {autoRotate ? "Tap to Enter" : "Rotate Your Device"}
      </div>

      <p className="mt-3 max-w-[300px] text-[clamp(12px,3.2vw,15px)] font-medium leading-relaxed text-[#d8c9a8]">
        {autoRotate ? (
          <>
            Tap anywhere to open the game in{" "}
            <span className="font-bold text-[#f5c542]">landscape</span> mode.
          </>
        ) : (
          <>
            For the best experience, please rotate your phone to{" "}
            <span className="font-bold text-[#f5c542]">landscape</span> mode.
          </>
        )}
      </p>
    </div>
  );
};

export default RotateDeviceOverlay;
