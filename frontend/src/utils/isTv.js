// Utility to detect if running on Android TV / Android device
export const isAndroidTv = () => {
  if (typeof window === "undefined") return false;
  try {
    if (window.Android && typeof window.Android.isAndroidTV === "function") {
      return Boolean(window.Android.isAndroidTV());
    }
  } catch {
    // fallback
  }
  const search = window.location?.search || "";
  if (search.includes("platform=tv") || search.includes("tv=1")) return true;
  if (search.includes("platform=mobile") || search.includes("mobile=1")) return false;

  const ua = navigator.userAgent || "";
  // Check for TV specific User-Agents (Android TV, GoogleTV, Leanback, Smart TVs)
  return /TV|GoogleTV|AndroidTV|SmartTV|BRAVIA|AFT|MiTV|NetCast|Tizen|WebOS/i.test(ua);
};

// Utility to detect handheld mobile phones (Android phone / iPhone)
// Returns false on Desktop (Windows, Mac, Linux) and Android TV.
export const isMobile = () => {
  if (typeof window === "undefined") return false;

  // Android TV is never mobile
  if (isAndroidTv()) return false;

  const search = window.location?.search || "";
  if (search.includes("platform=mobile") || search.includes("mobile=1")) return true;
  if (search.includes("platform=desktop") || search.includes("platform=tv") || search.includes("tv=1")) return false;

  const ua = navigator.userAgent || "";

  // 1. Desktop Operating Systems -> NEVER mobile
  const isDesktopOs = /Windows NT|Macintosh|Mac OS X(?!.*Mobile)|CrOS|X11; Linux x86_64/i.test(ua);
  if (isDesktopOs) return false;

  // 2. Native Capacitor Android App -> If not TV, it's a mobile phone/tablet
  try {
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform()) {
      return true;
    }
  } catch {}

  // 3. Mobile browser check (must have Mobile in UA and touch support)
  const isMobileUa = /Mobile|Android.*Mobile|iPhone|iPod|iPad|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const hasTouch = "ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  return Boolean(isMobileUa && hasTouch);
};
