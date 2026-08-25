import { useEffect } from "react";

const FOCUSABLE = [
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
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
    return isVisible(el);
  });

const centerOf = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
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
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (
    tag === "BUTTON" ||
    tag === "A" ||
    (tag === "INPUT" && ["button", "submit"].includes(el.type))
  ) {
    return;
  }
  el.click();
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
      const dir = DIRECTIONS[e.key];

      if (!dir) {
        if (e.key === "Enter") {
          const el = document.activeElement;
          if (el && el.matches && el.matches(FOCUSABLE)) activate(el);
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
      const next = findNext(current, dir);
      if (next) next.focus({ preventScroll: true });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};

export default useTvNavigation;
