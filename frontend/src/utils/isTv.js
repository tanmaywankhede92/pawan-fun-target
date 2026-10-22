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
