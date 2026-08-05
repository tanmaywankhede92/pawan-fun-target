import { useState, useMemo, useEffect } from "react";
import { useSound } from "@hooks/useSound";

const KEYFRAMES = `
@keyframes ft-modal-flash {
  0%   { opacity: 0; }
  25%  { opacity: 0.75; }
  60%  { opacity: 0.35; }
  100% { opacity: 0; }
}
@keyframes ft-modal-in {
  0%   { transform: scale(0.7); opacity: 0; }
  50%  { transform: scale(0.95); opacity: 1; }
  72%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ft-modal-out {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.7); opacity: 0; }
}
@keyframes ft-slow-float {
  0%   { transform: translateY(20px) scale(1); opacity: 0; }
  20%  { opacity: 0.85; }
  100% { transform: translateY(-180px) scale(0.5); opacity: 0; }
}
.ft-gold-btn {
  transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.25s ease;
}
.ft-gold-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 24px rgba(255, 215, 0, 0.9), 0 6px 22px rgba(245, 197, 66, 0.55);
  filter: brightness(1.08);
}
.ft-gold-btn:active {
  transform: scale(0.97);
}
.ft-leave-btn:hover {
  box-shadow: 0 0 24px rgba(255, 130, 60, 0.9), 0 6px 22px rgba(200, 90, 20, 0.55);
  filter: brightness(1.08);
}
`;

const CoinWheelIcon = () => {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    return (
      <line
        key={i}
        x1={24 + Math.cos(a) * 4}
        y1={24 + Math.sin(a) * 4}
        x2={24 + Math.cos(a) * 14}
        y2={24 + Math.sin(a) * 14}
        stroke="#8a5a00"
        strokeWidth="1.5"
      />
    );
  });

  return (
    <svg
      viewBox="0 0 48 48"
      className="h-14 w-14"
      style={{ filter: "drop-shadow(0 0 12px rgba(255,215,0,0.7))" }}
    >
      <defs>
        <radialGradient id="ftCoinGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="45%" stopColor="#f5c542" />
          <stop offset="100%" stopColor="#a8721a" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="21" fill="url(#ftCoinGrad)" stroke="#7c4d00" strokeWidth="2" />
      <circle cx="24" cy="24" r="16" fill="none" stroke="#7c4d00" strokeWidth="1.5" />
      {spokes}
      <circle cx="24" cy="24" r="4.5" fill="none" stroke="#7c4d00" strokeWidth="2" />
      <circle cx="19" cy="18" r="3" fill="#fff8d6" opacity="0.55" />
    </svg>
  );
};

const ExitConfirmModal = ({ open, onConfirm, onCancel }) => {
  const [closing, setClosing] = useState(false);
  const { play } = useSound();

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: `${(i * 47 + 9) % 100}%`,
        size: 2 + ((i * 5) % 5),
        delay: `${(i * 0.8) % 4}s`,
        duration: `${6 + ((i * 13) % 4)}s`,
      })),
    [],
  );

  useEffect(() => {
    if (open) play("EXIT");
  }, [open, play]);

  if (!open) return null;

  const handleContinue = () => {
    play("CLICK");
    setClosing(true);
    setTimeout(() => onCancel?.(), 380);
  };

  const handleLeave = () => {
    play("CLICK");
    setClosing(true);
    setTimeout(() => onConfirm?.(), 420);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <style>{KEYFRAMES}</style>

      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleContinue}
      />

      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(90,55,10,0.6) 100%)",
          opacity: closing ? 0 : 1,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255,225,130,0.9), rgba(255,200,60,0.45) 50%, transparent 75%)",
          animation: "ft-modal-flash 0.7s ease-out forwards",
        }}
      />

      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: `${20 + ((i * 29) % 60)}%`,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, #ffec80, #ffd700 60%, transparent)",
            boxShadow: "0 0 6px rgba(255,215,0,0.7)",
            animation: `ft-slow-float ${p.duration} ease-in ${p.delay} infinite`,
          }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-[min(92vw,420px)] rounded-[28px] border-[3px] border-[#f5c542]/90 p-[clamp(18px,5vw,28px)] text-center"
          style={{
            background: "linear-gradient(180deg, #2b1a0a 0%, #160b03 100%)",
            boxShadow:
              "inset 0 0 30px rgba(245,197,66,0.12), inset 0 0 60px rgba(0,0,0,0.55), 0 0 0 2px rgba(245,197,66,0.3), 0 0 40px rgba(245,197,66,0.4), 0 18px 50px rgba(0,0,0,0.6)",
            animation: closing
              ? "ft-modal-out 0.38s ease-in forwards"
              : "ft-modal-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          <div className="flex justify-center">
            <CoinWheelIcon />
          </div>

          <div className="mt-3 text-[clamp(10px,2.6vw,13px)] font-extrabold uppercase tracking-[0.35em] text-[#f5c542]">
            <span className="text-[#ffe9a0]">⚜</span> Fun Target{" "}
            <span className="text-[#ffe9a0]">⚜</span>
          </div>

          <div
            className="mx-auto mt-3 h-px w-3/4"
            style={{ background: "linear-gradient(90deg, transparent, #f5c542, transparent)" }}
          />

          <h2
            className="mt-4 text-[clamp(17px,4.8vw,23px)] font-extrabold uppercase tracking-wider text-[#ffdf80]"
            style={{ textShadow: "0 0 14px rgba(255,215,0,0.7)" }}
          >
            Leave Current Table?
          </h2>

          <p className="mt-3 text-[clamp(11px,3vw,14px)] font-medium leading-relaxed text-[#d8c9a8]">
            Your current game will end.
            <br />
            <span className="text-[#f0b95a]">Any unfinished bets will be lost.</span>
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleContinue}
              className="ft-gold-btn w-full rounded-xl border-2 border-[#ffe9a0]/80 px-6 py-3 text-[clamp(12px,3vw,15px)] font-extrabold uppercase tracking-widest text-[#3a2600]"
              style={{
                background: "linear-gradient(180deg, #ffecb0, #f5c542 55%, #b8860b)",
                boxShadow: "0 4px 16px rgba(245,197,66,0.45)",
              }}
            >
              Continue Playing
            </button>

            <button
              type="button"
              onClick={handleLeave}
              className="ft-gold-btn ft-leave-btn w-full rounded-xl border-2 border-[#ffd9a0]/70 px-6 py-3 text-[clamp(12px,3vw,15px)] font-extrabold uppercase tracking-widest text-[#fff3d6]"
              style={{
                background: "linear-gradient(180deg, #e8a33d, #b06a10 55%, #6e3f00)",
                boxShadow: "0 4px 16px rgba(176,106,16,0.45)",
              }}
            >
              Leave Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmModal;
