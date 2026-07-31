import { useState } from "react";
import cancelBetGlow from "@assets/images/buttons/cancelBetglow.png";
import previewGlow from "@assets/images/buttons/cancelBetglow.png";
import exitGlow from "@assets/images/buttons/exitglow.png";
import takeBetGlow from "@assets/images/buttons/cancelBetglow.png";
import cancelBtn from "@assets/images/buttons/cancelBtn.png";

const BUTTONS = [
  {
    id: "cancelBet",
    name: "Cancel Bet",
    base: cancelBtn, 
    glow: cancelBetGlow,
    zoom: 1.2,
    box: { left: "20%", bottom: "17%", width: "13%", height: "16%" },
  },
  {
    id: "takeBet",
    name: "Take Bet",
    base: null,
    glow: takeBetGlow,
    zoom: 1.2,
    box: { right: "85.6%", bottom: "15%", width: "15%", height: "17.6%" },
  },
  {
    id: "preview",
    name: "Preview",
    base: null,
    glow: previewGlow,
    zoom: 1.2,
    box: { left: "85%", bottom: "15.8%", width: "16%", height: "16%" },
  },
  {
    id: "exit",
    name: "Exit",
    base: null,
    glow: exitGlow,
    zoom: 1.2,
    box: { left: "90.8%", top: "92%", width: "10.2%", height: "10%" },
  },
];

const ButtonDisplay = ({ onAction }) => {
  const [hovered, setHovered] = useState(null);

  const handleClick = (btn) => {
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
            <span className="relative z-10 text-white font-bold text-lg ">
              {btn.name}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default ButtonDisplay;
