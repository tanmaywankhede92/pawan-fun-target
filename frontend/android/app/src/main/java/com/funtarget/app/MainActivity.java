package com.funtarget.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fullscreen immersive: hide status bar + navigation bar.
        hideSystemUI();

        // Keep screen on while the game is running.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Re-apply immersive mode when the window gains/loses focus.
        final Window window = getWindow();
        window.getDecorView().setOnSystemUiVisibilityChangeListener(visibility -> {
            if ((visibility & View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
                hideSystemUI();
            }
        });

        // After Capacitor bridge initialises, configure the WebView and inject
        // the native → JS bridge that closeApplication.js and the session
        // guard hook look for.
        getBridge().getWebView().postDelayed(this::configureWebView, 500);
    }

    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }

    private void configureWebView() {
        WebView webView = getBridge().getWebView();

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

        // WebView settings for smooth game performance.
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Re-apply immersive mode when app regains focus (e.g. after notification).
        if (hasFocus) {
            hideSystemUI();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Fallback: if visibilitychange doesn't fire in the WebView,
        // trigger the frontend session guard from native side.
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
        // Prevent back button from navigating away from the game.
        WebView webView = getBridge().getWebView();
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        }
        // Do NOT call super — blocks back navigation entirely.
    }
}
