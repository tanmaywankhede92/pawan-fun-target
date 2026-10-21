// Utility to detect if running on Android TV
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
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua) && /TV|LargeScreen|Leanback|AndroidTV|AFT/i.test(ua);
};
