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

        // Keep screen on while the game is running.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // After Capacitor bridge initialises, configure the WebView and inject
        // the native → JS bridge that closeApplication.js and the session
        // guard hook look for.
        getBridge().getWebView().postDelayed(this::configureWebView, 500);
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

            // 4) Clear WebView cache to prevent stale page restores.
            webView.clearCache(false);
        } catch (Exception ignored) {
        }
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

        // Low-end Android TV hardware often struggles with WebView hardware
        // acceleration, which can produce blank/blue screens. Force software
        // rendering for this app to keep the login and game UI stable.
        try {
            webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
        } catch (Exception ignored) {
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
        }

        // Android TV remote control & USB/Wireless mouse support
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

                // Detect if the running device is an Android TV / Google TV
                @android.webkit.JavascriptInterface
                public boolean isAndroidTV() {
                    try {
                        android.app.UiModeManager uiModeManager = (android.app.UiModeManager) getSystemService(UI_MODE_SERVICE);
                        if (uiModeManager != null && uiModeManager.getCurrentModeType() == android.content.res.Configuration.UI_MODE_TYPE_TELEVISION) {
                            return true;
                        }
                        android.content.pm.PackageManager pm = getPackageManager();
                        return pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_LEANBACK)
                            || pm.hasSystemFeature("android.hardware.type.television");
                    } catch (Exception e) {
                        return false;
                    }
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
