package com.takaakimailboxstar.cuescoreapps;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.takaakimailboxstar.cuescoreapps.billing.CueScoreStoreKitPlugin;
import com.takaakimailboxstar.cuescoreapps.scanner.CueScoreQRScannerPlugin;

/**
 * Hosts the shared CueScore web bundle. The two native adapters implement the same JS contracts that the
 * iOS plugins expose (CueScoreQRScanner / CueScoreStoreKit), so the shared web code is unchanged.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CueScoreQRScannerPlugin.class);
        registerPlugin(CueScoreStoreKitPlugin.class);
        super.onCreate(savedInstanceState);
        // Predictive Back: always-enabled callback (required for the OnBackInvokedCallback model). The web layer
        // decides asynchronously whether an in-app Back control consumed it; otherwise the task is minimized.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge == null || bridge.getWebView() == null) { moveTaskToBack(true); return; }
                bridge.getWebView().evaluateJavascript(
                    "(function(){try{return !!(window.CueScoreAndroidBackV1&&window.CueScoreAndroidBackV1.handle())}catch(e){return false}})()",
                    value -> { if (!"true".equals(value)) moveTaskToBack(true); });
            }
        });
    }
}
