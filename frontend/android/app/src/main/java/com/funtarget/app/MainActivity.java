package com.funtarget.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Every fresh process start clears the web session so the user
    // always lands on the login page.  This covers force-kill from
    // Recents, close button, normal exit — all scenarios.
    private boolean pendingSessionClear = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Full-screen immersive: hide status bar + navigation bar.
        hideSystemUI();

        // Keep screen on while the game is running.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // After Capacitor bridge initialises, configure the WebView and inject
        // the native → JS bridge that closeApplication.js and the session
        // guard hook look for.
        getBridge().getWebView().postDelayed(this::configureWebView, 500);
    }

    private void clearWebSession() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.evaluateJavascript(
                    "localStorage.removeItem('ft_user');",
                    null
                );
            }
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
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Black background — prevents white flash before web content loads.
        webView.setBackgroundColor(0xFF000000);

        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

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

                // Fallback for the session guard hook: when the app goes to
                // background, call the JS logout function.
                @android.webkit.JavascriptInterface
                public void lockApp() {
                    runOnUiThread(() -> {
                        webView.evaluateJavascript(
                            "if(window.__appLock) window.__appLock()", null
                        );
                    });
                }
            },
            "Android"
        );

        // Clear localStorage now that JavaScript is enabled and the bridge
        // is ready.  Every fresh process start wipes the session so the
        // user always lands on the login page.
        if (pendingSessionClear) {
            pendingSessionClear = false;
            clearWebSession();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        hideSystemUI();
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
