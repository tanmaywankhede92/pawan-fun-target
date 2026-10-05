import { useState, useEffect } from "react";
import { resultService } from "@services/result.service";

const POS = {
  right: "3.5%",
  width: "17.8%",
  height: "7.8%",
  top: "32.2%",
  fontSize: "clamp(9px, min(1.2vw, 2.5vh), 18px)",
  fontWeight: 900,
  fontFamily: '"Bodoni Moda", serif',
};

const LastWinningData = ({ refreshTrigger = 0 }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data: res } = await resultService.getPreviousResults();
        if (mounted && res?.results?.length) {
          setData(res.results.map((r) => Number(r.result)));
        }
      } catch {
        // keep previous data on error
      }
    };
    load();
    return () => { mounted = false; };
  }, [refreshTrigger]);

  return (
    <div
      className="absolute flex items-center justify-between pointer-events-none ft-last-wins z-10"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontWeight: POS.fontWeight,
        fontFamily: POS.fontFamily,
        flexDirection: "row-reverse",
        padding: "0 0.6vw",
      }}
    >
      {data.map((num, i) => (
        <div
          key={i}
          className="text-center font-bold leading-none ft-last-wins-item"
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            fontSize: POS.fontSize,
            fontFamily: POS.fontFamily,
            color: "#1b0e00",
            textShadow: "0 0 0.5px #1b0e00",
          }}
        >
          {num}
        </div>
      ))}
    </div>
  );
};

export { POS as lastWinsPos };
export default LastWinningData;
