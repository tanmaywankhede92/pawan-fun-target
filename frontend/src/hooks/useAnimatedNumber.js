import { useEffect, useRef, useState } from "react";
import { useSound } from "@hooks/useSound";

// Rolls a displayed number toward `target` number by number. For small
// changes every integer is shown; for large changes the step scales up
// so the animation still finishes in a reasonable time.
//
// Options:
//   tick      - ms between each step (default 10)
//   maxSteps  - upper bound on the number of steps (default 150)
//   snapDown  - when true, decreases apply instantly (used for the score
//               while placing bets) and only increases are animated
//   sound     - a SOUNDS key to loop (e.g. SOUNDS.BET) while the number is
//               rolling up or down; it stops as soon as the roll ends
const useAnimatedNumber = (
  target,
  { tick = 25, maxSteps = 60, snapDown = false, sound = null } = {},
) => {
  const { play, stop } = useSound();
  const [value, setValue] = useState(() => Number(target) || 0);
  const currentRef = useRef(Number(target) || 0);

  useEffect(() => {
    const to = Number(target) || 0;
    const from = currentRef.current;
    if (from === to) return;

    // Snap instantly to decreases (e.g. score dropping as bets are placed).
    if (snapDown && to < from) {
      currentRef.current = to;
      setValue(to);
      return;
    }

    const diff = to - from;
    const stepSize = Math.max(1, Math.round(Math.abs(diff) / maxSteps));
    const step = diff > 0 ? stepSize : -stepSize;

    // Keep ticking while the number is rolling.
    if (sound) play(sound, { loop: true });

    const id = setInterval(() => {
      let next = currentRef.current + step;
      let done = false;
      if ((step > 0 && next >= to) || (step < 0 && next <= to)) {
        next = to;
        clearInterval(id);
        done = true;
      }
      currentRef.current = next;
      setValue(next);
      // Stop the ticking the moment the roll reaches its target.
      if (done && sound) stop(sound);
    }, tick);

    return () => {
      clearInterval(id);
      if (sound) stop(sound);
    };
  }, [target, tick, maxSteps, snapDown, sound, play, stop]);

  return value;
};

export default useAnimatedNumber;
