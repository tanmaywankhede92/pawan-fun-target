package com.funtarget.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // CRITICAL: Pass null instead of savedInstanceState.
        // This prevents BridgeActivity from restoring the old WebView state
        // (URL, DOM, scroll position) after the activity was destroyed by
        // Android when the user killed the app from Recents. Without this,
        // the previous /game page is restored visually before our JS
        // session-clear code runs — creating a security leak and a jarring
        // flash of the old page.
        super.onCreate(null);

        // Full-screen immersive: hide status bar + navigation bar.
        hideSystemUI();

        // Keep screen on and force hardware acceleration on window
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // Suppress on-screen virtual keyboard on Android TV:
        // Hardware keyboard device is connected; soft keyboard must never display on screen.
        suppressSoftKeyboardIfTv();

        // After Capacitor bridge initialises, configure the WebView immediately and inject
        // the native → JS bridge that closeApplication.js and the session guard hook look for.
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            configureWebView();
        } else {
            getWindow().getDecorView().post(this::configureWebView);
        }
    }

    /**
     * Prevent Android from saving any activity / WebView state into the
     * instance-state bundle.  Combined with super.onCreate(null), this
     * guarantees that a killed-and-recreated activity always starts from
     * a completely blank WebView — no old URL, no old DOM, no old scroll.
     */
    @Override
    public void onSaveInstanceState(Bundle outState) {
        // Intentionally empty — do not save any state.
    }

    private void clearWebSession() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView == null) return;

            // 1) Clear localStorage (React session key).
            webView.evaluateJavascript(
                "try{localStorage.clear();}catch(e){}", null
            );

            // 2) Clear sessionStorage.
            webView.evaluateJavascript(
                "try{sessionStorage.clear();}catch(e){}", null
            );

            // 3) Clear all WebView cookies (session cookies, auth cookies).
            CookieManager.getInstance().removeAllCookies(null);
        } catch (Exception ignored) {
        }
    }

    private boolean isRunningOnTv() {
        try {
            android.app.UiModeManager uiModeManager = (android.app.UiModeManager) getSystemService(UI_MODE_SERVICE);
            if (uiModeManager != null && uiModeManager.getCurrentModeType() == android.content.res.Configuration.UI_MODE_TYPE_TELEVISION) {
                return true;
            }
            android.content.pm.PackageManager pm = getPackageManager();
            if (pm != null) {
                if (pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_LEANBACK)
                        || pm.hasSystemFeature("android.hardware.type.television")) {
                    return true;
                }
                // Many Android TV boxes identify as large non-touchscreen devices:
                if (!pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_TOUCHSCREEN)) {
                    return true;
                }
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private void suppressSoftKeyboardIfTv() {
        try {
            if (isRunningOnTv()) {
                // ANDROID TV: Suppress on-screen virtual keyboard completely
                // because a remote control or physical hardware keyboard is used.
                getWindow().addFlags(WindowManager.LayoutParams.FLAG_ALT_FOCUSABLE_IM);
                getWindow().setSoftInputMode(
                    WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN |
                    WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING
                );
            } else {
                // MOBILE / TABLET: Soft keyboard must show up when inputs are tapped!
                getWindow().clearFlags(WindowManager.LayoutParams.FLAG_ALT_FOCUSABLE_IM);
                getWindow().setSoftInputMode(
                    WindowManager.LayoutParams.SOFT_INPUT_STATE_UNSPECIFIED |
                    WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
                );
            }
        } catch (Exception ignored) {}
    }

    private void hideSystemUI() {
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // API 30+ (Android 11+): modern WindowInsetsController.
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars()
                        | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
            // Let content draw behind system bars.
            window.setDecorFitsSystemWindows(false);
        } else {
            // Legacy API for older devices.
            View decorView = window.getDecorView();
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
            );
        }
    }

    private void configureWebView() {
        WebView webView = getBridge().getWebView();

        // Enable Chrome DevTools inspection (chrome://inspect/#devices)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // WebView settings for smooth game performance.
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Black background prevents white flash while the app boots on weak TV hardware.
        webView.setBackgroundColor(0xFF000000);

        // Enable hardware-accelerated rendering for smooth 60 FPS gameplay on Android TV & mobile.
        // View.LAYER_TYPE_NONE allows Chromium to use the native GPU-backed hardware layer.
        try {
            webView.setLayerType(View.LAYER_TYPE_NONE, null);
        } catch (Exception ignored) {
        }

        // Android TV remote control & USB/Wireless mouse support
        try {
            webView.setMapTrackballToArrowKeys(false);
        } catch (Exception ignored) {}
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.requestFocus();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                webView.setPointerIcon(android.view.PointerIcon.getSystemIcon(this, android.view.PointerIcon.TYPE_DEFAULT));
            } catch (Exception ignored) {
            }
        }

        // JS bridge: window.Android.closeApp() — called by closeApplication.js
        // for a clean exit via finishAndRemoveTask().
        webView.addJavascriptInterface(
            new Object() {
                @android.webkit.JavascriptInterface
                public void closeApp() {
                    runOnUiThread(() -> {
                        finishAffinity();
                        finishAndRemoveTask();
                    });
                }

                // Detect if running on Android TV / client app
                @android.webkit.JavascriptInterface
                public boolean isAndroidTV() {
                    return isRunningOnTv();
                }
            },
            "Android"
        );

        // Always wipe the web session on every activity creation.
        // Since super.onCreate(null) is used, the WebView starts blank —
        // this clears any residual storage so the React app boots into
        // the login page.
        clearWebSession();
    }

    @Override
    public boolean dispatchKeyEvent(android.view.KeyEvent event) {
        if (event.getAction() == android.view.KeyEvent.ACTION_DOWN && event.isShiftPressed() && event.getKeyCode() == android.view.KeyEvent.KEYCODE_R) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.reload();
                return true;
            }
        }
        WebView webView = getBridge().getWebView();
        if (webView != null && !webView.hasFocus()) {
            webView.requestFocus();
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    public boolean dispatchTouchEvent(android.view.MotionEvent ev) {
        WebView webView = getBridge().getWebView();
        if (webView != null && !webView.hasFocus()) {
            webView.requestFocus();
        }
        return super.dispatchTouchEvent(ev);
    }

    @Override
    public boolean dispatchGenericMotionEvent(android.view.MotionEvent ev) {
        WebView webView = getBridge().getWebView();
        if (webView != null && !webView.hasFocus()) {
            webView.requestFocus();
        }
        return super.dispatchGenericMotionEvent(ev);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.requestFocus();
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        hideSystemUI();
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.requestFocus();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.evaluateJavascript(
                    "if(window.__appLock) window.__appLock()", null
                );
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onBackPressed() {
        WebView webView = getBridge().getWebView();
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        }
    }
}
