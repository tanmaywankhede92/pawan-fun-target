import { useEffect, useRef } from "react";

const CHIP_VALUES = [1, 5, 10, 50, 100, 500, 1000, 5000];

/**
 * Dedicated keyboard controller for Fun Target game:
 * - Tab: Switch chip denomination (1 -> 5 -> 10 -> 50 -> 100 -> 500 -> 1000 -> 5000 -> 1)
 * - Enter: Bet OK / Repeat bet
 * - Space: Claim winning (Take)
 * - Esc: Back / Exit to lobby (/pre)
 */
const useGameKeyboard = ({
  onTabSwitch,
  onBetOk,
  onTake,
  onBack,
  disabled = false,
}) => {
  const handlersRef = useRef({ onTabSwitch, onBetOk, onTake, onBack, disabled });
  handlersRef.current = { onTabSwitch, onBetOk, onTake, onBack, disabled };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (handlersRef.current.disabled) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore held-down key repeats to avoid spamming actions
      if (e.repeat) return;

      // 1. Tab - switching chip denomination
      if (e.key === "Tab" || e.keyCode === 9) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if (handlersRef.current.onTabSwitch) {
          handlersRef.current.onTabSwitch(e.shiftKey);
        }
        return;
      }

      // 2. Enter - Bet OK
      if (
        e.key === "Enter" ||
        e.key === "Select" ||
        e.key === "Ok" ||
        e.code === "Enter" ||
        e.code === "NumpadEnter" ||
        e.keyCode === 13 ||
        e.keyCode === 23
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if (handlersRef.current.onBetOk) {
          handlersRef.current.onBetOk();
        }
        return;
      }

      // 3. Space - Take
      if (e.key === " " || e.code === "Space" || e.keyCode === 32) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if (handlersRef.current.onTake) {
          handlersRef.current.onTake();
        }
        return;
      }

      // 4. Esc - Back
      if (
        e.key === "Escape" ||
        e.key === "Esc" ||
        e.code === "Escape" ||
        e.keyCode === 27
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        if (handlersRef.current.onBack) {
          handlersRef.current.onBack();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);
};

export { CHIP_VALUES };
export default useGameKeyboard;
