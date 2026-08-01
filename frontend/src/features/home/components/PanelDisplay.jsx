import p10 from "@assets/images/panels/10.png";
import p20 from "@assets/images/panels/20.png";
import p50 from "@assets/images/panels/50.png";
import p100 from "@assets/images/panels/100.png";
import p200 from "@assets/images/panels/200.png";
import p500 from "@assets/images/panels/500.png";
import p1000 from "@assets/images/panels/1000.png";
import p5000 from "@assets/images/panels/5000.png";

const IMAGES = {
  10: p10,
  20: p20,
  50: p50,
  100: p100,
  200: p200,
  500: p500,
  1000: p1000,
  5000: p5000,
};

const PANEL_CONFIG = {
  10: { box: { right: "93.2%", top: "45.6%", width: "8%", height: "9%" } },
  20: { box: { right: "87.8%", top: "45.6%", width: "7.5%", height: "9%" } },
  50: { box: { right: "82.5%", top: "45.6%", width: "7%", height: "9%" } },
  100: { box: { right: "77%", top: "45.6%", width: "7%", height: "9%" } },
  200: { box: { right: "15.7%", top: "45.6%", width: "8%", height: "9%" } },
  500: { box: { right: "10.2%", top: "45.6%", width: "8%", height: "9%" } },
  1000: { box: { right: "5%", top: "45.6%", width: "7.5%", height: "9%" } },
  5000: { box: { left: "92.5%", top: "45.6%", width: "9%", height: "9%" } },
};

const PanelDisplay = ({ selectedValue, onSelect }) => {
  return (
    <>
      {Object.keys(PANEL_CONFIG).map((key) => {
        const value = Number(key);
        const { box } = PANEL_CONFIG[value];
        const img = IMAGES[value];
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
            onClick={() => onSelect(value)}
          >
            {isSelected && img && (
              <img
                src={img}
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
