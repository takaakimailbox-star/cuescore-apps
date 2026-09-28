# CueScore Match Sharing v1 — Stage 5A Physical Scanner FAIL / Root Cause Fix Evidence

- Date: 2026-09-28 JST
- Baseline / current Git HEAD: `0dfb82372f0555de7c29a77d2e58835708aa90a5`
- Initial physical result: `FAIL — CAMERA PREVIEW / CAPTURE DID NOT START`
- Current Gate: `READY FOR PRODUCT OWNER STAGE 5A PHYSICAL SCANNER RETEST`
- Commit / push: not performed

## Product Owner physical Evidence

The supplied screenshots were copied without image-content modification to `outputs/match-sharing-stage5a/physical-fail-2026-09-28/`.

| Evidence | SHA-256 | What it proves |
| --- | --- | --- |
| `IMG_3771.PNG` | `aa274216d88f5154e915c3d3e9031f9ee3a30216056fd08cc21929aced8f7c20` | History Receiver Entry is visible. |
| `IMG_3773.PNG` | `9ee8d103bec93c78f7448e29961a5e8351b0c272b1bc6370e148c11c79b60b9b` | Scanner route/chrome/guide is visible, but the 280 pt area remains the Web placeholder; it does not prove a native camera preview. |
| `IMG_3772.PNG` | `6674537b35d1e430a81279ac2cd4561cc1c959bca9872ebd623145946484a73d` | Generic read failure and Retry UI are visible. Product Owner confirmed Retry returns to Scanner without starting Camera. |

Physical PASS: History entry display, entry tap, Scanner transition, Scanner chrome/guide, error display, Retry return to Scanner.

Physical FAIL: native Camera preview, AVCaptureSession scanning, QR recognition.

`QR A / B / C`, production physical decode, permission-dialog behavior and metadata callback are `NOT TESTED`. UI transition PASS is not treated as Camera PASS.

## Confirmed root cause

The initial source contained multiple concrete native-integration defects that match the observed blank preview:

1. Capacitor invokes Objective-C plugin methods on its bridge dispatch context. `startScan` performed UIKit host-view discovery and preview insertion without an explicit `DispatchQueue.main` hop. The previous `@MainActor` annotation on an Objective-C selector was not an adequate runtime dispatch boundary.
2. The Web layer passed `getBoundingClientRect()` coordinates, but the native layer applied that rectangle directly to the bridge root view. It did not convert from WKWebView coordinates to the actual preview host.
3. The preview was added without an explicit relationship to the WKWebView, so its z-order was not guaranteed. The screenshot proves only the opaque Web placeholder was visible.
4. JavaScript resolved only `Capacitor.Plugins.CueScoreQRScanner`; unlike the established StoreKit bridge, it did not use the `registerPlugin` fallback.
5. A native/bridge startup exception escaped to the outer generic QR-data error path, producing `この試合データを読み込めませんでした` even when no QR payload had been captured.
6. Retry started again without first defensively stopping a stale session/preview state.

These defects are source-confirmed. The exact first-build runtime stop point inside authorization/device/input/output/start cannot be recovered from the screenshots and was not logged; it is not invented.

## Permission state

- `NSCameraUsageDescription` is present in source and the installed fixed app: `プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。`
- Source handles `notDetermined`, `authorized`, `denied`, `restricted` and unavailable separately.
- The Product Owner did not report whether an iOS permission dialog appeared. `AVCaptureDevice.authorizationStatus(for: .video)` from the failed run is therefore `NOT VERIFIED`.
- The official device command surface exposes installed-app and lock information but not per-app TCC Camera authorization. No authorization state is inferred.

## Capture and preview fix

- `startScan` now explicitly dispatches all UIKit work to the main queue.
- It resolves the active WKWebView and its host, converts the requested preview rectangle with `webView.convert(rect, to: hostView)`, then inserts and brings the native preview above the WKWebView.
- `ScannerPreviewView.layoutSubviews()` keeps `AVCaptureVideoPreviewLayer.frame` equal to current bounds and draws the existing four white guide corners in the native layer that now sits above Web content.
- Device, `AVCaptureDeviceInput`, input/output admission, `AVCaptureMetadataOutput`, `.qr` restriction and `startRunning()` remain on the dedicated capture queue.
- `startScan` resolves success only after `session.isRunning == true`; otherwise it removes the preview and returns `SESSION_NOT_RUNNING`.
- Successful native start returns non-sensitive diagnostics for authorization, device/input/output, QR metadata, preview attachment and dimensions. No frame, image, QR payload or personal data is logged.
- Foreground/background/stop state mutation is serialized on the capture queue; listener notification and preview removal occur on main.

## Retry fix

Retry now executes `stopScan` first, clearing a stale running/stopped native state and preview before requesting a new start. Bridge/start failures remain Camera-unavailable errors instead of being misreported as corrupted Match data. Back still stops capture, removes preview/listeners and clears memory.

## Verification

- Stage 5A dedicated: `15 PASS / 0 FAIL / 0 SKIPPED`.
- Stage 1–5A focused: `80 PASS / 0 FAIL / 0 SKIPPED`.
- Full Node regression: `539 PASS / 0 FAIL / 0 SKIPPED`.
- All 18 production fixtures and A/B/C equivalents remain automated decode/validation PASS; this is not physical Camera Evidence.
- Source / `native-web` / iOS public `index.html` parity SHA-256: `5c53d7196a815289968e5cf2e9846282066c457255e119f2174c473628c3193e`.
- Receiver runtime parity SHA-256: `e3362d7910ba8ef54927bf5e05e708feba554a525ccd472ee358c2e2b87f1189`.
- Fixed dependency identity remains `capacitor-swift-pm 8.0.2`, `ion-ios-filesystem 1.1.2`; `Package.resolved` SHA-256 `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- Release Simulator Build with Xcode 27 / iOS Simulator 27.0 SDK: `BUILD SUCCEEDED`.
- `git diff --check`: PASS.

## Physical retest build

- Signed device Build: PASS.
- Install/read-back: PASS on paired physical iPhone 16e.
- Display / bundle: `CueScore Stage5A` / `com.takaakimailboxstar.cuescoreapps.stage5a`.
- Version / Build: `1.1 (79)`; repository version/build unchanged.
- Executable SHA-256: `82e550fa2f91aa6eb336f0056d6295e95acf17ec78e171e35d3ebab7eabfb778`.
- `.storekit`: `0`.
- Published app `CueScore Apps` / `com.takaakimailboxstar.cuescoreapps` remains separately installed at `1.1 (79)` and was not overwritten.

## Physical FAIL #2 follow-up

The first fixed-build retest reached `カメラを使用できません`. A second runtime investigation proved the Native Camera path had not been called: controller construction failed first with `ReferenceError: Can't find variable: readRecords`. The one-line dependency mapping was corrected to `readRecords: readMatchRecords`.

After that correction on the same physical iPhone 16e, authorization changed from `notDetermined` to `authorized`, the back camera was selected, input/output and `.qr` metadata were configured, the 280 × 280 pt native preview attached, and `session.isRunning` became true. Product Owner confirmed the live Camera started. Full Evidence: `docs/implementation/CueScore_Match_Sharing_v1_Stage5A_Physical_FAIL2_Diagnosis_Fix_2026-09-28.md`.

Updated automated results are Stage 5A `16/16`, Stage 1–5A `81/81`, and full Node `540/540`. The final no-debug-log executable SHA-256 is `c3aeb7d0df11802b8da043e295a4e59040289068b3fa68af648bfacbaf3981a7` and was reinstalled successfully.

## Retest boundary

The fixed build is installed, but its physical Camera behavior is not self-certified. Product Owner must verify:

1. Open `CueScore Stage5A` → `履歴` → `受け取る`.
2. Confirm the scanner square shows a live camera image, not a uniform dark placeholder.
3. Scan A (Version 19), B (Version 25), C (Version 30).
4. Confirm valid CueScore QR recognition; Stage 5A stops at its valid state and does not open Match Preview.
5. Use Back and confirm Camera stops.
6. If Retry is shown, confirm a second start displays live preview and can recognize a QR.

Authorization, preview visibility and `session.isRunning` are physical PASS. Product Owner subsequently confirmed QR A/B/C physical in-app recognition and CueScore validation `3/3 PASS`, plus Back Camera stop PASS. Retry was not needed and remains `NOT TESTED — NOT FAILED`.

Stage 5B, Match Preview, mapping, Import, schema, Backup/Restore, Free History, Version/Build, Archive, TestFlight and App Store Connect were not changed or started.
