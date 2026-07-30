import { useState, useEffect } from "react";

const POS = {
  left: "60%",
  top: "5%",
  width: "15%",
  height: "8%",
  fontSize: "clamp(18px, 2vw, 28px)",
};

const TimerDisplay = () => {
  const [time, setTime] = useState(60);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute pointer-events-none text-white font-bold flex items-center border-2 border-dashed border-green-400/70"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
      }}
    >
      Time: {time}s
    </div>
  );
};

export { POS as timerPos };
export default TimerDisplay;
