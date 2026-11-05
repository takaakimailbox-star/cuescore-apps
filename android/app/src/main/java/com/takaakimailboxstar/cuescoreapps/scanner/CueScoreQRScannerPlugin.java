package com.takaakimailboxstar.cuescoreapps.scanner;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.provider.Settings;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.NotFoundException;
import com.google.zxing.PlanarYUVLuminanceSource;
import com.google.zxing.Result;
import com.google.zxing.common.HybridBinarizer;
import java.nio.ByteBuffer;
import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Android implementation of the CueScoreQRScanner JS contract (see ios CueScoreQRScannerPlugin.swift):
 * authorizationStatus / requestPermission / startScan({previewRect}) / stopScan / openSettings and events
 * scanResult{value}, scannerError{code}, scannerLifecycle{state}. CameraX preview + ZXing QR decode.
 * The Match Sharing payload and validation contracts are untouched (decoding only returns the raw string).
 */
@CapacitorPlugin(
    name = "CueScoreQRScanner",
    permissions = { @Permission(strings = { Manifest.permission.CAMERA }, alias = "camera") }
)
public class CueScoreQRScannerPlugin extends Plugin {
    private static final String PREFS = "cuescore_qr_scanner";
    private static final String KEY_REQUESTED = "camera_permission_requested";

    private final ExecutorService analysisExecutor = Executors.newSingleThreadExecutor();
    private PreviewView previewView;
    private FrameLayout frame;
    private ProcessCameraProvider cameraProvider;
    private boolean requestedActive;
    private boolean didEmitResult;
    private boolean bound;
    private JSObject lastRect;

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private String currentStatus() {
        boolean granted = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
        boolean requested = prefs().getBoolean(KEY_REQUESTED, false);
        boolean rationale = getActivity() != null
            && ActivityCompat.shouldShowRequestPermissionRationale(getActivity(), Manifest.permission.CAMERA);
        return PermissionStatus.map(granted, requested, rationale);
    }

    @PluginMethod
    public void authorizationStatus(PluginCall call) {
        JSObject o = new JSObject();
        o.put("status", currentStatus());
        call.resolve(o);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (getPermissionState("camera") == PermissionState.GRANTED) {
            authorizationStatus(call);
            return;
        }
        prefs().edit().putBoolean(KEY_REQUESTED, true).apply();
        requestPermissionForAlias("camera", call, "permissionResult");
    }

    @PermissionCallback
    private void permissionResult(PluginCall call) {
        authorizationStatus(call);
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            call.reject("Camera permission is not authorized.", "CAMERA_NOT_AUTHORIZED");
            return;
        }
        JSObject rect = call.getObject("previewRect");
        double w = rect == null ? 0 : rect.optDouble("width", 0);
        double h = rect == null ? 0 : rect.optDouble("height", 0);
        if (rect == null || w < 44 || h < 44) {
            call.reject("A valid camera preview rectangle is required.", "INVALID_PREVIEW_RECT");
            return;
        }
        lastRect = rect;
        getActivity().runOnUiThread(() -> {
            try {
                installPreview(rect);
                requestedActive = true;
                didEmitResult = false;
                bindCamera(call, true);
            } catch (Exception e) {
                requestedActive = false;
                removePreview();
                call.reject("Camera scanner could not start.", "SCANNER_START_FAILED", e);
            }
        });
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            requestedActive = false;
            unbindCamera();
            removePreview();
            JSObject o = new JSObject();
            o.put("active", false);
            call.resolve(o);
        });
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", getContext().getPackageName(), null));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject o = new JSObject();
            o.put("opened", true);
            call.resolve(o);
        } catch (Exception e) {
            call.reject("Settings could not be opened.", "SETTINGS_UNAVAILABLE", e);
        }
    }

    // ---- preview ---------------------------------------------------------------------------------

    /** previewRect is in CSS px relative to the WebView viewport; convert with display density. */
    private void installPreview(JSObject rect) {
        removePreview();
        float density = getContext().getResources().getDisplayMetrics().density;
        View web = getBridge().getWebView();
        ViewGroup host = (ViewGroup) web.getParent();
        int[] webLoc = new int[2];
        int[] hostLoc = new int[2];
        web.getLocationOnScreen(webLoc);
        host.getLocationOnScreen(hostLoc);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
            Math.round((float) rect.optDouble("width", 0) * density),
            Math.round((float) rect.optDouble("height", 0) * density));
        lp.leftMargin = (webLoc[0] - hostLoc[0]) + Math.round((float) rect.optDouble("x", 0) * density);
        lp.topMargin = (webLoc[1] - hostLoc[1]) + Math.round((float) rect.optDouble("y", 0) * density);
        frame = new FrameLayout(getContext());
        frame.setBackgroundColor(Color.BLACK);
        frame.setClickable(false);
        frame.setFocusable(false);
        frame.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        previewView = new PreviewView(getContext());
        previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);
        previewView.setImplementationMode(PreviewView.ImplementationMode.COMPATIBLE);
        frame.addView(previewView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        if (host instanceof FrameLayout) {
            host.addView(frame, lp);
        } else {
            ((ViewGroup) getActivity().findViewById(android.R.id.content)).addView(frame, lp);
        }
        frame.bringToFront();
    }

    private void removePreview() {
        if (frame != null && frame.getParent() instanceof ViewGroup) {
            ((ViewGroup) frame.getParent()).removeView(frame);
        }
        frame = null;
        previewView = null;
    }

    // ---- camera ----------------------------------------------------------------------------------

    private void bindCamera(PluginCall call, boolean resolveOnReady) {
        ListenableFuture<ProcessCameraProvider> future = ProcessCameraProvider.getInstance(getContext());
        future.addListener(() -> {
            try {
                cameraProvider = future.get();
                if (!requestedActive || previewView == null) {
                    if (call != null) { JSObject o = new JSObject(); o.put("active", false); call.resolve(o); }
                    return;
                }
                cameraProvider.unbindAll();
                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());
                ImageAnalysis analysis = new ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build();
                analysis.setAnalyzer(analysisExecutor, this::analyze);
                cameraProvider.bindToLifecycle((LifecycleOwner) getActivity(), CameraSelector.DEFAULT_BACK_CAMERA, preview, analysis);
                bound = true;
                if (call != null && resolveOnReady) {
                    JSObject o = new JSObject();
                    o.put("active", true);
                    o.put("authorization", "authorized");
                    o.put("deviceFound", true);
                    o.put("inputAdded", true);
                    o.put("outputAdded", true);
                    o.put("metadataType", "qr");
                    o.put("previewAttached", previewView.getParent() != null);
                    o.put("previewWidth", previewView.getWidth());
                    o.put("previewHeight", previewView.getHeight());
                    call.resolve(o);
                }
            } catch (Exception e) {
                requestedActive = false;
                removePreview();
                if (call != null) call.reject("Camera capture did not start.", "SESSION_NOT_RUNNING", e);
                else emitError("SESSION_NOT_RUNNING");
            }
        }, ContextCompat.getMainExecutor(getContext()));
    }

    private void unbindCamera() {
        if (cameraProvider != null && bound) cameraProvider.unbindAll();
        bound = false;
    }

    private final MultiFormatReader reader = new MultiFormatReader();
    {
        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
        hints.put(DecodeHintType.POSSIBLE_FORMATS, Collections.singletonList(BarcodeFormat.QR_CODE));
        hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
        reader.setHints(hints);
    }

    /** Runs on the analysis thread. Emits at most one scanResult per scan session (continuous-read control). */
    private void analyze(ImageProxy image) {
        try {
            if (!requestedActive || didEmitResult) return;
            ByteBuffer buffer = image.getPlanes()[0].getBuffer();
            byte[] data = new byte[buffer.remaining()];
            buffer.get(data);
            int rowStride = image.getPlanes()[0].getRowStride();
            PlanarYUVLuminanceSource source = new PlanarYUVLuminanceSource(
                data, rowStride, image.getHeight(), 0, 0, image.getWidth(), image.getHeight(), false);
            try {
                Result result = reader.decodeWithState(new BinaryBitmap(new HybridBinarizer(source)));
                synchronized (this) {
                    if (didEmitResult || !requestedActive) return;
                    didEmitResult = true;
                    requestedActive = false;
                }
                final String text = result.getText();
                Activity activity = getActivity();
                if (activity != null) {
                    activity.runOnUiThread(() -> {
                        unbindCamera();
                        JSObject o = new JSObject();
                        o.put("value", text);
                        notifyListeners("scanResult", o);
                    });
                }
            } catch (NotFoundException ignored) {
                // no QR in this frame
            } finally {
                reader.reset();
            }
        } finally {
            image.close();
        }
    }

    private void emitError(String code) {
        JSObject o = new JSObject();
        o.put("code", code);
        notifyListeners("scannerError", o);
    }

    // ---- lifecycle (background stop / foreground resume / Activity recreation safety) --------------

    @Override
    protected void handleOnPause() {
        if (requestedActive) {
            unbindCamera();
            JSObject o = new JSObject();
            o.put("state", "paused");
            notifyListeners("scannerLifecycle", o);
        }
    }

    @Override
    protected void handleOnResume() {
        if (!requestedActive) return;
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestedActive = false;
            removePreview();
            emitError("CAMERA_NOT_AUTHORIZED");
            return;
        }
        getActivity().runOnUiThread(() -> {
            if (previewView == null && lastRect != null) installPreview(lastRect);
            bindCamera(null, false);
            JSObject o = new JSObject();
            o.put("state", "resumed");
            notifyListeners("scannerLifecycle", o);
        });
    }

    @Override
    protected void handleOnDestroy() {
        requestedActive = false;
        unbindCamera();
        removePreview();
        analysisExecutor.shutdownNow();
    }
}
