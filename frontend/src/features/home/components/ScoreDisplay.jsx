// import useAnimatedNumber from "@hooks/useAnimatedNumber";
// import { SOUNDS } from "@constants/sounds";

// // Score uses a generous width and fixed font sizing so it never overflows
// // on any Android device.  Bodoni Moda renders 15-20% wider on Android
// // WebView than desktop Chrome, so we size for the worst case.
// const POS = {
//   left: "6%",
//   top: "10%",
//   width: "14%",
//   height: "8%",
//   fontSize: "clamp(6px, 1.4vw, 30px)",
// };

// const ScoreDisplay = ({ score = 0 }) => {
//   const display = useAnimatedNumber(score, { snapDown: true, sound: SOUNDS.BET });
//   return (
//     <div
//       className="absolute pointer-events-none text-gray-900 flex items-center"
//       style={{
//         left: POS.left,
//         top: POS.top,
//         width: POS.width,
//         height: POS.height,
//         fontSize: POS.fontSize,
//         fontFamily: '"Bodoni Moda", serif',
//         fontWeight: 700,
//         whiteSpace: "nowrap",
//         overflow: "visible",
//       }}
//     >
//       {display}.00
//     </div>
//   );
// };

// export { POS as scorePos };
// export default ScoreDisplay;

import useAnimatedNumber from "@hooks/useAnimatedNumber";
import { SOUNDS } from "@constants/sounds";

const POS = {
  left: "6%",
  top: "10%",
  width: "14%",
  height: "8%",
  fontSize: "clamp(6px, 1.4vw, 30px)",
};

const ScoreDisplay = ({ score = 0 }) => {
  const exactScore = Number(score) || 0;

  return (
    <div
      className="absolute pointer-events-none text-gray-900 flex items-center"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        fontSize: POS.fontSize,
        fontFamily: '"Bodoni Moda", serif',
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "visible",
      }}
    >
      {exactScore}
    </div>
  );
};

export { POS as scorePos };
export default ScoreDisplay;
