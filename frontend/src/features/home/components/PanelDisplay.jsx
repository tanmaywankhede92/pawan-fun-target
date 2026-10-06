import p1 from "@assets/images/panels/1.webp";
import p5 from "@assets/images/panels/5.webp";
import p10 from "@assets/images/panels/10.webp";
import p50 from "@assets/images/panels/50.webp";
import p100 from "@assets/images/panels/100.webp";
import p500 from "@assets/images/panels/500.webp";
import p1000 from "@assets/images/panels/1000.webp";
import p5000 from "@assets/images/panels/5000.webp";
import p1glow from "@assets/images/panels/1glow.webp";
import p5glow from "@assets/images/panels/5glow.webp";
import p10glow from "@assets/images/panels/10glow.webp";
import p50glow from "@assets/images/panels/50glow.webp";
import p100glow from "@assets/images/panels/100Glow.webp";
import { Fragment, memo, useState } from "react";
import { useSound } from "@hooks/useSound";

const IMAGES = {
  1: p1,
  5: p5,
  10: p10,
  50: p50,
  100: p100,
  500: p500,
  1000: p1000,
  5000: p5000,
};

const GLOW_IMAGES = {
  // 1: p1glow,
  // 5: p5glow,
  // 10: p10glow,
  // 50: p50glow,
  // 100: p100glow,
};

const PANEL_CONFIG = {
  1: { box: { right: "95%", top: "48.5%", width: "4.2%", height: "3.5%" } },
  5: { box: { right: "89.4%", top: "48.5%", width: "4.4%", height: "3.5%" } },
  10: { box: { right: "83.8%", top: "48.5%", width: "4.4%", height: "3.5%" } },
  50: { box: { right: "78.2%", top: "48.5%", width: "4.4%", height: "3.5%" } },
  100: { box: { right: "17.4%", top: "48.4%", width: "4.4%", height: "3.5%" } },
  500: { box: { right: "11.7%", top: "48.1%", width: "4.8%", height: "4%" } },
  1000: { box: { right: "6.2%", top: "48.4%", width: "4.6%", height: "3.5%" } },
  5000: { box: { left: "94.7%", top: "48.6%", width: "4.6%", height: "3.4%" } },
};

const PanelDisplay = ({ selectedValue, onSelect, disabled = false }) => {
  const { play } = useSound();
  const [focused, setFocused] = useState(null);
  const [hovered, setHovered] = useState(null);

  const handleSelect = (value) => {
    if (disabled) return;
    play("CLICK");
    onSelect(value);
  };

  return (
    <>
      {Object.keys(PANEL_CONFIG).map((key) => {
        const value = Number(key);
        const { box } = PANEL_CONFIG[value];
        const img = IMAGES[value];

        const isSelected = selectedValue === value;
        const isFocused = focused === value;
        const isHovered = hovered === value;
        const glowImg = GLOW_IMAGES[value];

        const ringFilter = isSelected
          ? "drop-shadow(0 0 1px #ffffff) drop-shadow(0 0 2.5px #fff97a) drop-shadow(0 0 4.5px rgba(255, 245, 100, 0.9))"
          : isHovered || isFocused
          ? "drop-shadow(0 0 1px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 2px #fff97a) drop-shadow(0 0 3.5px rgba(255, 245, 100, 0.75))"
          : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))";

        return (
          <Fragment key={value}>
            <div
              tabIndex={disabled ? -1 : 0}
              role="button"
              aria-disabled={disabled}
              className={`absolute overflow-visible cursor-pointer z-20 select-none transition-all duration-150 ${
                isSelected ? "scale-110" : isHovered || isFocused ? "scale-105" : "hover:scale-105"
              }`}
              style={{
                left: box.left,
                right: box.right,
                top: box.top,
                width: box.width,
                height: box.height,
                filter: ringFilter,
              }}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setFocused(value)}
              onBlur={() => setFocused(null)}
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
                  handleSelect(value);
                }
              }}
              onClick={() => handleSelect(value)}
            >
              {img && (
                <img
                  decoding="async"
                  src={isSelected && glowImg ? glowImg : img}
                  alt={`panel-${value}`}
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />
              )}
            </div>
          </Fragment>
        );
      })}
    </>
  );
};

export default memo(PanelDisplay);
