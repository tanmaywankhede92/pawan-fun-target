import { useState, useRef, useEffect, memo } from "react";
import { useSound } from "@hooks/useSound";
import n0 from "@assets/images/numbers/0.webp";
import n1 from "@assets/images/numbers/1.webp";
import n2 from "@assets/images/numbers/2.webp";
import n3 from "@assets/images/numbers/3.webp";
import n4 from "@assets/images/numbers/4.webp";
import n5 from "@assets/images/numbers/5.webp";
import n6 from "@assets/images/numbers/6.webp";
import n7 from "@assets/images/numbers/7.webp";
import n8 from "@assets/images/numbers/8.webp";
import n9 from "@assets/images/numbers/9.webp";

const IMAGES = {
  0: n0,
  1: n1,
  2: n2,
  3: n3,
  4: n4,
  5: n5,
  6: n6,
  7: n7,
  8: n8,
  9: n9,
};

const NUMBER_CONFIG = {
  0: {
    box: { right: "2%", bottom: "6%", width: "6.5%", height: "8.2%" },
    imgWidth: "100%",
  },
  1: {
    box: { left: "2%", bottom: "6%", width: "6%", height: "8.2%" },
    imgWidth: "60%",
  },
  2: {
    box: { left: "11.3%", bottom: "5%", width: "7.5%", height: "10%" },
    imgWidth: "60%",
  },
  3: {
    box: { left: "20%", bottom: "4.8%", width: "10%", height: "9.5%" },
    imgWidth: "60%",
  },
  4: {
    box: { left: "30%", bottom: "4.8%", width: "10.2%", height: "9.2%" },
    imgWidth: "80%",
  },
  5: {
    box: { left: "40%", bottom: "4.5%", width: "10%", height: "10.5%" },
    imgWidth: "90%",
  },
  6: {
    box: { left: "49.5%", bottom: "4.5%", width: "10.5%", height: "10.2%" },
    imgWidth: "60%",
  },
  7: {
    box: { right: "30.1%", bottom: "4.5%", width: "10%", height: "10.2%" },
    imgWidth: "60%",
  },
  8: {
    box: { right: "21.9%", bottom: "5%", width: "6.5%", height: "9.4%" },
    imgWidth: "60%",
  },
  9: {
    box: { right: "11.8%", bottom: "5%", width: "6.4%", height: "9.6%" },
    imgWidth: "60%",
  },
};

const BET_BOX_CONFIG = {
  0: { right: "50%", bottom: "127%", width: "6%", height: "10%" },
  1: { left: "45%", bottom: "127%", width: "6%", height: "8%" },
  2: { left: "45%", bottom: "113%", width: "7.5%", height: "8%" },
  3: { left: "45%", bottom: "121%", width: "10%", height: "8%" },
  4: { left: "45%", bottom: "127%", width: "10.2%", height: "8%" },
  5: { left: "45%", bottom: "112%", width: "10%", height: "8%" },
  6: { left: "45%", bottom: "115%", width: "10.5%", height: "8%" },
  7: { right: "45%", bottom: "115%", width: "10%", height: "8%" },
  8: { right: "45%", bottom: "120%", width: "6.5%", height: "8%" },
  9: { right: "45%", bottom: "120%", width: "6.4%", height: "8%" },
};

const NumberDisplay = ({ bets, onBet, disabled = false, winnerBlink = null }) => {
  const [hoveredNum, setHoveredNum] = useState(null);
  const { play } = useSound();
  const holdTimer = useRef(null);

  const doBet = (num) => {
    if (disabled) return;
    play("BET");
    onBet(num);
  };

  // Press & hold keeps adding the same bet repeatedly; releasing or
  // leaving the number stops the repeat.
  const startHold = (num) => {
    doBet(num);
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = setInterval(() => doBet(num), 180);
  };

  const stopHold = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };

  useEffect(() => () => stopHold(), []);

  return (
    <>
      {Object.keys(NUMBER_CONFIG).map((key) => {
        const num = Number(key);
        const { box } = NUMBER_CONFIG[num];
        const betBox = BET_BOX_CONFIG[num];
        const img = IMAGES[num];
        const isHovered = !disabled && hoveredNum === num;
        const bet = bets[num] || 0;
        const isWinner = winnerBlink === num;

        return (
          <div
            key={num}
            className="absolute z-20"
            style={{
              left: box.left,
              bottom: box.bottom,
              right: box.right,
              width: box.width,
              height: box.height,
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden cursor-pointer select-none"
              onMouseEnter={() => setHoveredNum(num)}
              onMouseLeave={() => {
                setHoveredNum(null);
                stopHold();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                startHold(num);
              }}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
            >
              {(isHovered || bet > 0 || isWinner) && img && (
                <img
                  decoding="async"
                  src={img}
                  alt={`number-${num}`}
                  className={`absolute inset-0 w-full h-full object-fill pointer-events-auto ${
                    isWinner ? "ft-blink" : ""
                  }`}
                />
              )}
            </div>
            {bet > 0 && (
              <div
                className="absolute pointer-events-none flex items-center justify-center text-black leading-none"
                style={{
                  left: betBox.left,
                  right: betBox.right,
                  width: betBox.width,
                  top: betBox.top,
                  bottom: betBox.bottom,
                  height: betBox.height,
                  fontSize: "clamp(5px, 1.8vw, 24px)",
                  fontFamily: '"Times New Roman", serif',
                  fontWeight: 700,
                }}
              >
                {bet}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default memo(NumberDisplay);
