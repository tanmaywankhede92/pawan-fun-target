import { useState, useEffect } from "react";
import { resultService } from "@services/result.service";
import { DISPLAY_FONT } from "@constants/displayFont";

const POS = {
  right: "2.4%",
  width: "20.3%",
  height: "7.8%",
  top: "32.5%",
  fontSize: "clamp(14px, min(1.6vw, 4.0vh), 26px)",
  fontWeight: 900,
  fontFamily: DISPLAY_FONT,
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
        fontVariantNumeric: "lining-nums tabular-nums",
        fontFeatureSettings: '"lnum" 1, "tnum" 1',
        flexDirection: "row-reverse",
        padding: "0 1.2vw",
      }}
    >
      {data.map((num, i) => (
        <div
          key={i}
          className="flex items-center justify-center text-center font-bold leading-none ft-last-wins-item"
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            fontSize: POS.fontSize,
            fontFamily: POS.fontFamily,
            fontVariantNumeric: "lining-nums tabular-nums",
            fontFeatureSettings: '"lnum" 1, "tnum" 1',
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
