import p1 from "@assets/images/panels/1.webp";
import p1glow from "@assets/images/panels/1glow.webp";
import p5 from "@assets/images/panels/5.webp";
import p5glow from "@assets/images/panels/5glow.webp";
import p10 from "@assets/images/panels/10.webp";
import p10glow from "@assets/images/panels/10glow.webp";
import p50 from "@assets/images/panels/50.webp";
import p50glow from "@assets/images/panels/50glow.webp";
import p100 from "@assets/images/panels/100.webp";
import p100Glow from "@assets/images/panels/100Glow.webp";
import p500 from "@assets/images/panels/500.webp";
import p1000 from "@assets/images/panels/1000.webp";
import p5000 from "@assets/images/panels/5000.webp";
import { Fragment } from "react";
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

// Selected panels with a glow image show the glow; the rest keep the
// number image.
const GLOW_IMAGES = {
  1: p1glow,
  5: p5glow,
  10: p10glow,
  50: p50glow,
  100: p100Glow,
};

const PANEL_CONFIG = {
  1: {
    box: { right: "94.9%", top: "48.2%", width: "4.5%", height: "4%" },
    glow: { right: "94.5%", top: "47.8%", width: "5.6%", height: "5%" },
  },
  5: {
    box: { right: "89%", top: "48.5%", width: "5%", height: "4%" },
    glow: { right: "89%", top: "48.4%", width: "5%", height: "4%" },
  },
  10: {
    box: { right: "83.5%", top: "48.5%", width: "5%", height: "4%" },
    glow: { right: "83.2%", top: "47.5%", width: "5.6%", height: "5.5%" },
  },
  50: {
    box: { right: "78%", top: "48.5%", width: "4.9%", height: "4%" },
    glow: { right: "77%", top: "48.1%", width: "6.3%", height: "4.7%" },
  },
  100: {
    box: { right: "17.3%", top: "48.2%", width: "4.8%", height: "4%" },
    glow: { right: "16.7%", top: "47.8%", width: "6.1%", height: "4.7%" },
  },
  500: { box: { right: "10.2%", top: "47.4%", width: "8%", height: "6.3%" } },
  1000: { box: { right: "5%", top: "47.2%", width: "7%", height: "6.3%" } },
  5000: { box: { left: "93%", top: "47.2%", width: "8%", height: "6.3%" } },
};

const PanelDisplay = ({ selectedValue, onSelect, disabled = false }) => {
  const { play } = useSound();

  const handleSelect = (value) => {
    if (disabled) return;
    play("CLICK");
    onSelect(value);
  };

  return (
    <>
      {Object.keys(PANEL_CONFIG).map((key) => {
        const value = Number(key);
        const { box, glow: glowConfig } = PANEL_CONFIG[value];
        const img = IMAGES[value];
        const glowImg = GLOW_IMAGES[value];
        const isSelected = selectedValue === value;
        // Glow gets its own box so it can be positioned/sized independently
        // of the panel number image. Falls back to the panel box.
        const glowBox = glowConfig || box;

        return (
          <Fragment key={value}>
            <div
              className="absolute overflow-hidden cursor-pointer z-20 select-none"
              style={{
                left: box.left,
                right: box.right,
                top: box.top,
                width: box.width,
                height: box.height,
              }}
              onClick={() => handleSelect(value)}
            >
              {(isSelected || glowImg) && img && (
                <img
                  decoding="async"
                  src={img}
                  alt={`panel-${value}`}
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />
              )}
            </div>
            {isSelected && glowImg && (
              <div
                className="absolute overflow-hidden pointer-events-none z-30 select-none"
                style={{
                  left: glowBox.left,
                  right: glowBox.right,
                  top: glowBox.top,
                  width: glowBox.width,
                  height: glowBox.height,
                }}
              >
                <img
                  decoding="async"
                  src={glowImg}
                  alt={`panel-glow-${value}`}
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </>
  );
};

export default PanelDisplay;
