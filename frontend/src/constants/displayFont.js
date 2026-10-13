// ============================================================================
// Display Font Configuration for WinnerDisplay, ScoreDisplay, and LastWinningData
// ============================================================================

export const DISPLAY_FONTS = {
  // Option 1: New Clear Font (Cinzel - 100% flat horizontal baseline, royal casino serif, 4 is crystal clear!)
  clear: '"Cinzel", "Times New Roman", serif',

  // Option 2: Original Font (Bodoni Moda - Didone hairline style)
  original: '"Bodoni Moda", serif',

  // Option 3: Playfair Display
  playfair: '"Playfair Display", "Times New Roman", serif',

  // Option 4: Classic Times New Roman (Crisp serif, 100% flat line on all screens)
  times: '"Times New Roman", Times, serif',
};

// ============================================================================
// ACTIVE DEFAULT FONT:
// Change between "clear" (New font with clear 4) and "original" (Bodoni Moda)
// anytime according to your need!
// ============================================================================
export const DEFAULT_FONT_KEY = "clear";

export const getDisplayFont = () => {
  if (typeof window !== "undefined") {
    // 1. Allows instant switching via URL: ?font=original or ?font=clear or ?font=times
    const urlParam = new URLSearchParams(window.location.search).get("font");
    if (urlParam && DISPLAY_FONTS[urlParam]) {
      return DISPLAY_FONTS[urlParam];
    }
    // 2. Allows instant switching via localStorage: localStorage.setItem('display_font', 'original')
    const saved = localStorage.getItem("display_font");
    if (saved && DISPLAY_FONTS[saved]) {
      return DISPLAY_FONTS[saved];
    }
  }
  return DISPLAY_FONTS[DEFAULT_FONT_KEY] || DISPLAY_FONTS.clear;
};

export const DISPLAY_FONT = getDisplayFont();
