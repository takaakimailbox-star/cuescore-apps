package com.takaakimailboxstar.cuescoreapps.scanner;

/**
 * Maps Android camera-permission facts to the iOS-compatible status names the shared JS expects.
 * JS only calls requestPermission() for "notDetermined" and only offers "open settings" for "denied",
 * so a denial that Android can still re-prompt for is reported as "notDetermined" (re-operation after
 * denial), and a permanent denial ("Don't ask again") as "denied" (settings guidance).
 */
public final class PermissionStatus {
    private PermissionStatus() {}

    public static String map(boolean granted, boolean everRequested, boolean canShowRationale) {
        if (granted) return "authorized";
        if (!everRequested) return "notDetermined";
        return canShowRationale ? "notDetermined" : "denied";
    }
}
