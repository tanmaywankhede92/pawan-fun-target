import { useEffect, useMemo, useRef, useState } from "react";
import wheelImg from "@assets/images/wheel/wheel.webp";
import { useSound } from "@hooks/useSound";

const STEPS = [
  "Connecting...",
  "Loading Assets...",
  "Loading Sounds...",
  "Preparing Lucky Draw...",
  "Entering Game...",
];

const TOTAL_MS = 4000;

const KEYFRAMES = `
@keyframes ft-wheel-drop {
  0%   { transform: translateY(-160px); opacity: 0; }
  55%  { transform: translateY(12px);   opacity: 1; }
  75%  { transform: translateY(-7px); }
  100% { transform: translateY(0); }
}
@keyframes ft-float {
  0%   { transform: translateY(0) scale(1);       opacity: 0; }
  15%  { opacity: 1; }
  100% { transform: translateY(-140px) scale(0.6); opacity: 0; }
}
@keyframes ft-orbit {
  from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
}
@keyframes ft-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes ft-glow-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%      { opacity: 0.7;  transform: scale(1.12); }
}
`;

const GameLoadingOverlay = ({ canFinish, onDone }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("spin");
  const [flash, setFlash] = useState(false);
  const [fade, setFade] = useState(false);

  const { play } = useSound();

  useEffect(() => {
    play("LOADING");
  }, [play]);

  const wheelRef = useRef(null);
  const rotationRef = useRef(0);
  const rafRef = useRef(null);
  const finishedRef = useRef(false);

  const stepIndex =
    progress < 20
      ? 0
      : progress < 40
        ? 1
        : progress < 60
          ? 2
          : progress < 80
            ? 3
            : 4;

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 57 + 13) % 100}%`,
        size: 3 + ((i * 7) % 6),
        delay: `${(i * 0.37) % 2.6}s`,
        duration: `${2.6 + ((i * 11) % 4)}s`,
      })),
    [],
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        r: `${70 + ((i * 13) % 40)}px`,
        delay: `${i * 0.55}s`,
        duration: `${2.4 + ((i * 17) % 20) / 10}s`,
        size: 4 + ((i * 5) % 6),
      })),
    [],
  );

  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(() => {
      const p = Math.min(100, ((performance.now() - start) / TOTAL_MS) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase !== "spin") return;
    const loop = () => {
      rotationRef.current = (rotationRef.current + 4) % 360000;
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== "slow") return;
    const startRot = rotationRef.current;
    const target = startRot + 1080;
    const dur = 2800;
    const t0 = performance.now();
    const loop = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const r = startRot + (target - startRot) * eased;
      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${r}deg)`;
      }
      if (t < 1) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    if (finishedRef.current) return;
    if (progress < 100 || !canFinish) return;
    finishedRef.current = true;

    const tSlow = setTimeout(() => setPhase("slow"), 0);
    const tZoom = setTimeout(() => setPhase("zoom"), 700);
    const tFlashOn = setTimeout(() => setFlash(true), 1500);
    const tFlashOff = setTimeout(() => setFlash(false), 2000);
    const tFade = setTimeout(() => setFade(true), 2100);
    const tEnter = setTimeout(() => play("ENTER"), 2300);
    const tDone = setTimeout(() => onDone?.(), 2600);

    return () => {
      [
        tSlow,
        tZoom,
        tFlashOn,
        tFlashOff,
        tFade,
        tEnter,
        tDone,
      ].forEach(clearTimeout);
    };
  }, [progress, canFinish, onDone, play]);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        opacity: fade ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: fade ? "none" : "auto",
      }}
    >
      <style>{KEYFRAMES}</style>

      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: `${30 + ((i * 23) % 50)}%`,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, #ffec80, #ffd700 60%, transparent)",
            boxShadow: "0 0 6px rgba(255,215,0,0.8)",
            animation: `ft-float ${p.duration} ease-in ${p.delay} infinite`,
          }}
        />
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{
            width: "clamp(130px, 20vw, 220px)",
            height: "clamp(130px, 20vw, 220px)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,215,0,0.5), transparent 70%)",
              animation: "ft-glow-pulse 2s ease-in-out infinite",
            }}
          />

          {sparkles.map((s, i) => {
            const orbitStyle = {
              left: "50%",
              top: "50%",
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              width: s.size,
              height: s.size,
              background:
                "radial-gradient(circle, #fffbe0, #ffd700 65%, transparent)",
              boxShadow: "0 0 8px rgba(255,215,0,0.9)",
              animation: `ft-orbit ${s.duration} linear ${s.delay} infinite`,
              opacity: phase === "zoom" || phase === "slow" ? 0.6 : 1,
              transition: "opacity 0.4s",
            };
            orbitStyle["--orbit-r"] = s.r;
            return (
              <span
                key={i}
                className="absolute rounded-full"
                style={orbitStyle}
              />
            );
          })}

          <div
            className="absolute inset-0"
            style={{
              animation:
                "ft-wheel-drop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                transform: phase === "zoom" ? "scale(0)" : "scale(1)",
                transition: "transform 1s cubic-bezier(0.5, 0, 0.5, 1)",
              }}
            >
              <img
                ref={wheelRef}
                decoding="async"
                src={wheelImg}
                alt="wheel"
                className="w-full h-auto"
                style={{ willChange: "transform" }}
              />
            </div>
          </div>
        </div>

        <h2
          className="mt-4 text-[clamp(16px, 4vw, 26px)] font-extrabold uppercase tracking-[0.25em] text-yellow-300"
          style={{ textShadow: "0 0 12px rgba(255,215,0,0.8)" }}
        >
          Fun Target
        </h2>

        <p
          className="mt-2 animate-pulse text-[clamp(11px, 2.8vw, 16px)] font-semibold text-gray-200"
          style={{ textShadow: "0 0 8px rgba(255,215,0,0.5)" }}
        >
          {STEPS[stepIndex]}
        </p>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "clamp(36px, 8vh, 80px)",
          width: "clamp(220px, 52vw, 440px)",
        }}
      >
        <div className="h-[clamp(6px, 1.4vh, 12px)] w-full overflow-hidden rounded-full bg-black/50 ring-1 ring-yellow-400/40">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #b8860b, #ffd700, #ffec80, #ffd700, #b8860b)",
              backgroundSize: "200% 100%",
              animation: "ft-shimmer 1.6s linear infinite",
              transition: "width 0.2s linear",
            }}
          />
        </div>
        <div className="mt-1 text-center text-[clamp(9px, 2.2vw, 13px)] font-bold text-yellow-200">
          {Math.round(progress)}%
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,140,0.95), rgba(255,215,0,0.6) 45%, rgba(180,130,0,0.4))",
          opacity: flash ? 1 : 0,
          transition: flash ? "opacity 0.25s ease" : "opacity 0.35s ease",
        }}
      />
    </div>
  );
};

export default GameLoadingOverlay;
