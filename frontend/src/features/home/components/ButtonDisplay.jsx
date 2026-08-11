import { useState } from "react";
import { useSound } from "@hooks/useSound";
import cancelBetGlow from "@assets/images/buttons/cancelBetglow.webp";
import previewGlow from "@assets/images/buttons/BetOk_Glow.webp";
import exitGlow from "@assets/images/buttons/takeglow.webp";
import takeBetGlow from "@assets/images/buttons/Take_Glow.webp";
import cancelBtn from "@assets/images/buttons/cancelBtn.webp";
import previewBtn from "@assets/images/buttons/bet1.webp";
import takeBtn from "@assets/images/buttons/take.webp";
import exitBtn from "@assets/images/buttons/bet1.webp";

const BUTTONS = [
  {
    id: "cancelAll",
    name: "Cancel All",
    sound: "CANCEL",
    base: cancelBtn,
    glow: cancelBetGlow,
    zoom: 1.2,
    box: { left: "20%", bottom: "21%", width: "11%", height: "6%" },
  },
  {
    id: "takeBet",
    name: "Take",
    sound: "TAKE",
    base: takeBtn,
    glow: takeBetGlow,
    zoom: 1.2,
    box: { right: "85.9%", bottom: "21.5%", width: "14%", height: "5.5%" },
  },
  {
    id: "preview",
    name: "Prev",
    sound: "CLICK",
    base: previewBtn,
    glow: previewGlow,
    zoom: 1.2,
    box: { left: "85%", bottom: "21%", width: "16%", height: "6%" },
  },
  {
    id: "exit",
    name: "Exit",
    sound: "CLICK",
    base: exitBtn,
    glow: exitGlow,
    zoom: 1.2,
    box: { left: "91%", top: "95%", width: "9%", height: "5%" },
  },
  {
    id: "cancelSpecific",
    name: "Cancel specific bet",
    sound: "CANCEL",
    base: cancelBtn,
    glow: cancelBetGlow,
    zoom: 1.2,
    box: { left: "66%", bottom: "21%", width: "13%", height: "6%" },
  },
];

const ButtonDisplay = ({
  onAction,
  hasBets = false,
  disabled = false,
  takeGlow = false,
  submitted = false,
  cancelMode = false,
  takeLock = false,
}) => {
  const [hovered, setHovered] = useState(null);
  const { play } = useSound();

  const isPreview = (btn) => btn.id === "preview";
  const isCancelAll = (btn) => btn.id === "cancelAll";
  const isCancelSpecific = (btn) => btn.id === "cancelSpecific";
  const isTake = (btn) => btn.id === "takeBet";
  const isGlowButton = (btn) =>
    isPreview(btn) || isCancelAll(btn) || isCancelSpecific(btn);

  const handleClick = (btn) => {
    if (disabled || (takeLock && !isTake(btn))) return;
    play(btn.sound || "CLICK");
    if (onAction) onAction(btn.id);
  };

  return (
    <>
      {BUTTONS.map((btn) => {
        // While a winning Take is pending, every button locks except Take:
        // no hover, no glow, no click.
        const btnLocked = disabled || (takeLock && !isTake(btn));
        const isHovered = !btnLocked && hovered === btn.id;
        const name = isPreview(btn) ? (hasBets ? "OK Bet" : "Prev") : btn.name;
        // Cancel All + Cancel Specific blink while bets are pending (not yet
        // accepted), but only when cancel-specific mode is off.
        const blink = isGlowButton(btn) && hasBets && !submitted && !cancelMode;
        // Cancel Specific glows while cancel mode is on.
        const cancelModeGlow = isCancelSpecific(btn) && cancelMode;
        const takeBlink = isTake(btn) && takeGlow;
        const showGlow = blink || cancelModeGlow || takeBlink || isHovered;

        return (
          <div
            key={btn.id}
            className="absolute overflow-hidden cursor-pointer flex items-center justify-center z-20"
            style={{
              left: btn.box.left,
              right: btn.box.right,
              bottom: btn.box.bottom,
              top: btn.box.top,
              width: btn.box.width,
              height: btn.box.height,
            }}
            onMouseEnter={() => {
              if (!btnLocked) setHovered(btn.id);
            }}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleClick(btn)}
          >
            {btn.base && (
              <img
                src={btn.base}
                alt={`${btn.name} base`}
                className="absolute pointer-events-none"
                style={{
                  width: `${btn.zoom * 100}%`,
                  height: `${btn.zoom * 100}%`,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  objectFit: "fill",
                }}
              />
            )}
            {showGlow && btn.glow && (
              <img
                src={btn.glow}
                alt={`${btn.name} glow`}
                className={`absolute pointer-events-none ${
                  blink || cancelModeGlow || takeBlink ? "ft-blink" : ""
                }`}
                style={{
                  width: `${btn.zoom * 100}%`,
                  height: `${btn.zoom * 100}%`,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  objectFit: "fill",
                }}
              />
            )}
            <span
              className="relative z-10 w-full text-center text-white font-bold text-[clamp(6px,1.3vw,18px)] leading-none"
              style={{
                fontFamily: '"Times New Roman", serif',
                transform: "translateY(-10%)",
              }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default ButtonDisplay;
