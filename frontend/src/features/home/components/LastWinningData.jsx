const POS = {
  right: "3.8%",
  width: "17.5%",
  height: "20%",
  top: "26.5%",
  fontSize: "clamp(6px, 1.5vw, 24px)",
  fontWeight: 700,
  fontFamily: '"Bodoni Moda", serif',
};

import { useState, useEffect } from "react";
import { resultService } from "@services/result.service";
import { istSeconds } from "@utils/istTime";

const LastWinningData = ({ refreshTrigger = 0 }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    let mounted = true;
    let prevSec = istSeconds();

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

    // Refresh on every IST minute boundary (:00), matching the draw cycle.
    const id = setInterval(() => {
      const s = istSeconds();
      if (s === 0 && prevSec === 59) {
        load();
      }
      prevSec = s;
    }, 500);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [refreshTrigger]);

  return (
    <div
      className="absolute flex items-center pointer-events-none ft-last-wins"
      style={{
        right: POS.right,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontWeight: POS.fontWeight,
        fontFamily: POS.fontFamily,
        flexDirection: "row-reverse",
      }}
    >
      {data.map((num, i) => (
        <div
          key={i}
          className="text-gray-700 text-center leading-none ft-last-wins-item"
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            fontSize: POS.fontSize,
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
