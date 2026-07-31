import { useState } from "react";
import n0 from "@assets/images/numbers/0.png";
import n1 from "@assets/images/numbers/1.png";
import n2 from "@assets/images/numbers/2.png";
import n3 from "@assets/images/numbers/3.png";
import n4 from "@assets/images/numbers/4.png";
import n5 from "@assets/images/numbers/5.png";
import n6 from "@assets/images/numbers/6.png";
import n7 from "@assets/images/numbers/7.png";
import n8 from "@assets/images/numbers/8.png";
import n9 from "@assets/images/numbers/9.png";

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

const NumberDisplay = () => {
  const [hoveredNum, setHoveredNum] = useState(null);

  return (
    <>
      {Object.keys(NUMBER_CONFIG).map((key) => {
        const num = Number(key);
        const { box } = NUMBER_CONFIG[num];
        const img = IMAGES[num];
        const isHovered = hoveredNum === num;

        return (
          <div
            key={num}
            className="absolute overflow-hidden"
            style={{
              left: box.left,
              bottom: box.bottom,
              right: box.right,
              width: box.width,
              height: box.height,
            }}
            onMouseEnter={() => setHoveredNum(num)}
            onMouseLeave={() => setHoveredNum(null)}
          >
            {isHovered && img && (
              <img
                src={img}
                alt={`number-${num}`}
                className="absolute inset-0 w-full h-full object-fill pointer-events-auto"
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default NumberDisplay;
