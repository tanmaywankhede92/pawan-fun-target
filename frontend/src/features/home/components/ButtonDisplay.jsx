import { useState } from "react";
import { useSound } from "@hooks/useSound";
import cancelBetGlow from "@assets/images/buttons/cancelBetglow.webp";
import previewGlow from "@assets/images/buttons/BetOk_Glow.webp";
import exitGlow from "@assets/images/buttons/takeglow.webp";
import takeBetGlow from "@assets/images/buttons/Take_Glow.webp";
import cancelBtn from "@assets/images/buttons/cancelbtn.webp";
import previewBtn from "@assets/images/buttons/bet1.webp";
import takeBtn from "@assets/images/buttons/take.webp";
import exitBtn from "@assets/images/buttons/bet1.webp";

const BUTTONS = [
  {
    id: "cancelAll",
    name: "Cancel Bet",
    sound: "CANCEL",
    base: cancelBtn,
    glow: cancelBetGlow,
    zoom: 1.05,
    box: { left: "20.2%", bottom: "20.5%", width: "12%", height: "5%" },
  },
  {
    id: "takeBet",
    name: "Take",
    sound: "TAKE",
    base: takeBtn,
    glow: takeBetGlow,
    zoom: 1.05,
    box: { left: "0%", bottom: "21.2%", width: "14.2%", height: "5%" },
  },
  {
    id: "preview",
    name: "Bet Ok",
    sound: "CLICK",
    base: previewBtn,
    glow: previewGlow,
    zoom: 1.05,
    box: { left: "85.4%", bottom: "21.2%", width: "14.6%", height: "5%" },
  },
  {
    id: "exit",
    name: "Exit",
    sound: "CLICK",
    base: exitBtn,
    glow: exitGlow,
    zoom: 1.05,
    box: { left: "91%", top: "94.5%", width: "9%", height: "5%" },
  },
  {
    id: "cancelSpecific",
    name: "Cancel Specific Bet",
    sound: "CANCEL",
    base: cancelBtn,
    glow: cancelBetGlow,
    zoom: 1.05,
    box: { left: "65.5%", bottom: "20.5%", width: "17.5%", height: "5%" },
  },
];

const ButtonDisplay = ({
  onAction,
  hasBets = false,
  disabled = false,
  takeGlow = false,
  submitted = false,
  resultRevealed = false,
  takeLock = false,
  cancelSpecificLocked = false,
}) => {
  const [hovered, setHovered] = useState(null);
  const { play } = useSound();

  const isPreview = (btn) => btn.id === "preview";
  const isCancelAll = (btn) => btn.id === "cancelAll";
  const isCancelSpecific = (btn) => btn.id === "cancelSpecific";
  const isTake = (btn) => btn.id === "takeBet";
  const isExit = (btn) => btn.id === "exit";
  const isGlowButton = (btn) =>
    isPreview(btn) || isCancelAll(btn) || isCancelSpecific(btn);
  // Cancel Specific disables after its one-time use until a new bet is placed.
  const isCancelSpecificLocked = (btn) =>
    isCancelSpecific(btn) && cancelSpecificLocked;

  const handleClick = (btn) => {
    // Exit always works, regardless of any lock.
    if (isExit(btn)) {
      play(btn.sound || "CLICK");
      if (onAction) onAction(btn.id);
      return;
    }
    // Take is enabled ONLY while a winning result is pending on the board
    // (takeLock). Without a win it stays disabled: no sound, no click.
    if (isTake(btn)) {
      if (!takeLock) return;
    } else if (disabled || isCancelSpecificLocked(btn)) {
      return;
    }
    play(btn.sound || "CLICK");
    if (onAction) onAction(btn.id);
  };

  return (
    <>
      {BUTTONS.map((btn) => {
        // Take is locked unless a winning result is pending; all other
        // buttons lock while the Take window is active. Exit stays usable.
        const btnLocked = isExit(btn)
          ? false
          : isTake(btn)
            ? !takeLock
            : disabled || takeLock || isCancelSpecificLocked(btn);
        const isHovered = !btnLocked && hovered === btn.id;
        const name = isPreview(btn)
          ? hasBets && !resultRevealed
            ? "Bet Ok"
            : "Prev Bet"
          : btn.name;
        // Cancel All + Cancel Specific blink while bets are pending (not yet
        // accepted). Cancel Specific stops blinking once its one use is done.
        const blink =
          isGlowButton(btn) && hasBets && !submitted && !isCancelSpecificLocked(btn);
        const takeBlink = isTake(btn) && takeGlow;
        const showGlow = blink || takeBlink || isHovered;

        return (
          <div
            key={btn.id}
            tabIndex={btnLocked ? -1 : 0}
            role="button"
            aria-disabled={btnLocked}
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
            onFocus={() => {
              if (!btnLocked) setHovered(btn.id);
            }}
            onBlur={() => setHovered(null)}
            onKeyDown={(e) => {
              if (
                (e.key === "Enter" ||
                  e.key === "Select" ||
                  e.key === "Ok" ||
                  e.keyCode === 13 ||
                  e.keyCode === 23) &&
                !e.repeat
              ) {
                e.preventDefault();
                e.stopPropagation();
                handleClick(btn);
              }
            }}
            onClick={() => handleClick(btn)}
          >
            {btn.base && (
              <img
                decoding="async"
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
                decoding="async"
                src={btn.glow}
                alt={`${btn.name} glow`}
                className={`absolute pointer-events-none ${blink || takeBlink ? "ft-blink" : ""
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
              className="relative z-10 w-full text-center text-white font-bold leading-none select-none px-1"
              style={{
                fontFamily: '"Century Gothic", sans-serif',
                fontWeight: 700,
                fontSize:
                  btn.id === "cancelSpecific"
                    ? "clamp(6px, 0.85vw, 13px)"
                    : "clamp(7px, 1.25vw, 16px)",
                letterSpacing: "0.01em",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.65)",
                transform: "translateY(-10%)",
                whiteSpace: "nowrap",
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
