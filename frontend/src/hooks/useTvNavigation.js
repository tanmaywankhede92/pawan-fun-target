import { useEffect } from "react";

const FOCUSABLE = [
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
  "[role='button']:not([aria-disabled='true'])",
].join(",");

const isVisible = (el) => {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  if (typeof el.checkVisibility === "function") {
    return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  }
  return getComputedStyle(el).visibility !== "hidden";
};

const listCandidates = () =>
  Array.from(document.querySelectorAll(FOCUSABLE)).filter((el) => {
    if (el.getAttribute("aria-disabled") === "true") return false;
    if (el.disabled) return false;
    return isVisible(el);
  });

const centerOf = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const getDirection = (e) => {
  const k = e.key;
  const c = e.keyCode;
  if (k === "ArrowUp" || k === "Up" || c === 19 || c === 38) return { x: 0, y: -1 };
  if (k === "ArrowDown" || k === "Down" || c === 20 || c === 40) return { x: 0, y: 1 };
  if (k === "ArrowLeft" || k === "Left" || c === 21 || c === 37) return { x: -1, y: 0 };
  if (k === "ArrowRight" || k === "Right" || c === 22 || c === 39) return { x: 1, y: 0 };
  return null;
};

const isSelectKey = (e) => {
  const k = e.key;
  const c = e.keyCode;
  return (
    k === "Enter" ||
    k === "Select" ||
    k === "Ok" ||
    k === "Accept" ||
    c === 13 ||
    c === 23 // Android KEYCODE_DPAD_CENTER
  );
};

const findNext = (current, dir) => {
  const items = listCandidates();
  if (items.length === 0) return null;
  const origin = current
    ? centerOf(current)
    : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let best = null;
  let bestScore = Infinity;
  for (const el of items) {
    if (el === current) continue;
    const c = centerOf(el);
    const dx = c.x - origin.x;
    const dy = c.y - origin.y;
    const primary = dx * dir.x + dy * dir.y;
    if (primary <= 4) continue;
    const perp = Math.abs(dx * dir.y - dy * dir.x);
    const score = primary + perp * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
};

const activate = (el) => {
  if (!el || el === document.body || el === document.documentElement) return;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    el.focus();
    return;
  }
  // Click works for buttons, links, and divs with role='button'
  try {
    el.click();
  } catch {
    // fallback if native click fails
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }
};

const isTypingTarget = (target) =>
  target &&
  (target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable);

const useTvNavigation = () => {
  useEffect(() => {
    const onKeyDown = (e) => {
      const dir = getDirection(e);

      if (!dir) {
        if (isSelectKey(e)) {
          const el = document.activeElement;
          if (el && el !== document.body && el.matches && el.matches(FOCUSABLE)) {
            e.preventDefault();
            activate(el);
          } else {
            // Nothing focused: find default TV element or first candidate
            const defaultEl =
              document.querySelector("[data-tv-default]") ||
              document.querySelector(".funtarget-game") ||
              listCandidates()[0];
            if (defaultEl) {
              e.preventDefault();
              defaultEl.focus({ preventScroll: true });
              activate(defaultEl);
            }
          }
        }
        return;
      }

      if (isTypingTarget(e.target) && dir.x !== 0) return;

      e.preventDefault();

      const active = document.activeElement;
      const current =
        active && active !== document.body && active.matches?.(FOCUSABLE)
          ? active
          : null;

      let next = findNext(current, dir);
      if (!next && !current) {
        // First navigation from nothing: pick default element
        next =
          document.querySelector("[data-tv-default]") ||
          document.querySelector(".funtarget-game") ||
          listCandidates()[0];
      }

      if (next) {
        next.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
};

export default useTvNavigation;
