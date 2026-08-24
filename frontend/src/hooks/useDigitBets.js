import { useEffect } from "react";

const useDigitBets = (onDigit) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (!/^[0-9]$/.test(e.key)) return;
      e.preventDefault();
      onDigit(Number(e.key));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDigit]);
};

export default useDigitBets;
