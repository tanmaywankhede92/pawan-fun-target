import p1 from "@assets/images/panels/1.webp";
import p1glow from "@assets/images/panels/1glow.webp";
import p5 from "@assets/images/panels/5.webp";
import p5glow from "@assets/images/panels/5glow.webp";
import p10 from "@assets/images/panels/10.webp";
import p10glow from "@assets/images/panels/10glow.png";
import p50 from "@assets/images/panels/50.webp";
import p50glow from "@assets/images/panels/50glow.webp";
import p100 from "@assets/images/panels/100.webp";
import p100Glow from "@assets/images/panels/100Glow.webp";
import p500 from "@assets/images/panels/500.webp";
import p1000 from "@assets/images/panels/1000.webp";
import p5000 from "@assets/images/panels/5000.webp";
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
  1: { box: { right: "94%", top: "47%", width: "6.5%", height: "6%" } },
  5: { box: { right: "87.8%", top: "46.5%", width: "7.5%", height: "7.5%" } },
  10: { box: { right: "82.5%", top: "47%", width: "6.5%", height: "6%" } },
  50: { box: { right: "77.5%", top: "47%", width: "6%", height: "6%" } },
  100: { box: { right: "16.7%", top: "47.6%", width: "6%", height: "5.1%" } },
  500: { box: { right: "10.2%", top: "45.6%", width: "8%", height: "9%" } },
  1000: { box: { right: "5%", top: "45.6%", width: "7.5%", height: "9%" } },
  5000: { box: { left: "92.5%", top: "45.6%", width: "9%", height: "9%" } },
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
        const { box } = PANEL_CONFIG[value];
        const img = IMAGES[value];
        const glowImg = GLOW_IMAGES[value];
        const isSelected = selectedValue === value;

        return (
          <div
            key={value}
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
                src={isSelected && glowImg ? glowImg : img}
                alt={`panel-${value}`}
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default PanelDisplay;
