// Application / window exit logic, fully separated from React UI.
//
// Detects the runtime environment and uses the most appropriate close
// mechanism for it. It never navigates, never reloads, never opens a tab
// and never shows a blank page. If no permitted close mechanism exists
// (a normal user-opened browser tab), it reports the limitation so the
// caller can handle it gracefully.

export const CLOSE_RESULT = {
  CLOSED: "closed", // a close was initiated/executed successfully
  UNSUPPORTED: "unsupported", // no permitted close mechanism exists
};

const w = () => (typeof window !== "undefined" ? window : null);
const nav = () => (typeof navigator !== "undefined" ? navigator : null);

// Finds a native bridge object injected by a mobile/desktop wrapper.
const findBridge = (names) => {
  const win = w();
  if (!win) return null;
  for (const name of names) {
    const bridge = win[name];
    if (bridge && (typeof bridge === "object" || typeof bridge === "function")) {
      return bridge;
    }
  }
  return null;
};

const callBridgeMethod = (bridge, methods) => {
  for (const method of methods) {
    if (typeof bridge[method] === "function") {
      try {
        bridge[method]();
        return true;
      } catch {
        // try the next candidate method
      }
    }
  }
  return false;
};

// Tauri desktop wrapper — v1 exposes the API globally as window.__TAURI__.
const closeTauri = () => {
  const tauri = w()?.__TAURI__;
  if (!tauri) return false;
  const current =
    (typeof tauri.window?.getCurrentWindow === "function" &&
      tauri.window.getCurrentWindow()) ||
    null;
  if (!current || typeof current.close !== "function") return false;
  try {
    current.close();
    return true;
  } catch {
    return false;
  }
};

// Electron renderer — window.close() closes the owning BrowserWindow.
const closeElectron = () => {
  if (w()?.process?.type !== "renderer") return false;
  try {
    w().close();
    return true;
  } catch {
    return false;
  }
};

// Capacitor (Android/iOS native wrapper).
const closeCapacitor = () => {
  const app = w()?.Capacitor?.Plugins?.App;
  if (!app || typeof app.exitApp !== "function") return false;
  try {
    app.exitApp();
    return true;
  } catch {
    return false;
  }
};

// Cordova.
const closeCordova = () => {
  const app = nav()?.app;
  if (!app || typeof app.exitApp !== "function") return false;
  try {
    app.exitApp();
    return true;
  } catch {
    return false;
  }
};

// Android WebView bridge (exposed via addJavascriptInterface).
const closeAndroidBridge = () => {
  const bridge = findBridge([
    "Android",
    "AppBridge",
    "NativeBridge",
    "MobileApp",
    "HybridApp",
  ]);
  return bridge
    ? callBridgeMethod(bridge, ["closeApp", "exitApp", "close", "exit"])
    : false;
};

// iOS WKWebView message handlers (exposed via userContentController).
const closeIosWebview = () => {
  const handlers = w()?.webkit?.messageHandlers;
  if (!handlers) return false;
  for (const name of ["closeApp", "closeApplication", "exitApp", "nativeClose"]) {
    if (handlers[name]) {
      try {
        handlers[name].postMessage({ action: "close" });
        return true;
      } catch {
        // try the next handler
      }
    }
  }
  return false;
};

// Windows WebView2 (host listens for a close message on the webview channel).
const closeWebView2 = () => {
  const webview = w()?.chrome?.webview;
  if (!webview || typeof webview.postMessage !== "function") return false;
  try {
    webview.postMessage({ type: "close", action: "closeApplication" });
    return true;
  } catch {
    return false;
  }
};

const closeNativeBridge = () =>
  closeTauri() ||
  closeElectron() ||
  closeCapacitor() ||
  closeCordova() ||
  closeAndroidBridge() ||
  closeIosWebview() ||
  closeWebView2();

// Closes the running application/window using the mechanism best suited to
// the current runtime. Returns CLOSE_RESULT.CLOSED when a close was
// initiated, otherwise CLOSE_RESULT.UNSUPPORTED.
export const closeApplication = () => {
  if (!w()) return CLOSE_RESULT.UNSUPPORTED;

  // 1) Desktop/mobile wrapper or embedded WebView.
  if (closeNativeBridge()) return CLOSE_RESULT.CLOSED;

  // 2) Browser window/tab. Browsers only permit window.close() on windows
  //    script opened (launchers, kiosks, window.open()). Attempt it and
  //    verify the result — no hacks, no blank page, no navigation.
  w().close();
  return w().closed ? CLOSE_RESULT.CLOSED : CLOSE_RESULT.UNSUPPORTED;
};
