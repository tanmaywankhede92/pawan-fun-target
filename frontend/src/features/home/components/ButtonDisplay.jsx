import { useState } from "react";
import { useSound } from "@hooks/useSound";
import cancelBetGlow from "@assets/images/buttons/cancelBetglow.png";
import previewGlow from "@assets/images/buttons/BetOk_Glow.jpg";
import exitGlow from "@assets/images/buttons/takeglow.png";
import takeBetGlow from "@assets/images/buttons/Take_Glow.jpg";
import cancelBtn from "@assets/images/buttons/cancelBtn.png";
import previewBtn from "@assets/images/buttons/bet1.jpg";
import takeBtn from "@assets/images/buttons/take.jpg";
import exitBtn from "@assets/images/buttons/bet1.jpg";

const BUTTONS = [
  {
    id: "cancelBet",
    name: "Cancel Bet",
    sound: "CANCEL",
    base: cancelBtn,
    glow: cancelBetGlow,
    zoom: 1.2,
    box: { left: "20%", bottom: "12%", width: "15%", height: "23%" },
  },
  {
    id: "takeBet",
    name: "Take",
    sound: "TAKE",
    base: takeBtn,
    glow: takeBetGlow,
    zoom: 1.2,
    box: { right: "85.6%", bottom: "20%", width: "15%", height: "7%" },
  },
  {
    id: "preview",
    name: "Preview",
    sound: "CLICK",
    base: previewBtn,
    glow: previewGlow,
    zoom: 1.2,
    box: { left: "85%", bottom: "21%", width: "16%", height: "5%" },
  },
  {
    id: "exit",
    name: "Exit",
    sound: "CLICK",
    base: exitBtn,
    glow: exitGlow,
    zoom: 1.2,
    box: { left: "90.8%", top: "95%", width: "9.5%", height: "5%" },
  },
];

const ButtonDisplay = ({ onAction }) => {
  const [hovered, setHovered] = useState(null);
  const { play } = useSound();

  const handleClick = (btn) => {
    play(btn.sound || "CLICK");
    if (onAction) onAction(btn.id);
  };

  return (
    <>
      {BUTTONS.map((btn) => {
        const isHovered = hovered === btn.id;

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
            onMouseEnter={() => setHovered(btn.id)}
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
            {isHovered && btn.glow && (
              <img
                src={btn.glow}
                alt={`${btn.name} glow`}
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
            <span
              className="relative z-10 w-full text-center text-white font-bold text-[clamp(8px,1.6vw,20px)] leading-none"
              style={{
                fontFamily: '"Times New Roman", serif',
                transform: "translateY(-10%)",
              }}
            >
              {btn.name}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default ButtonDisplay;
