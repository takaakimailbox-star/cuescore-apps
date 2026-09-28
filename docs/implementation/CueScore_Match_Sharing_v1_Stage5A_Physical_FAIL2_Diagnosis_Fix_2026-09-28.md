# CueScore Match Sharing v1 — Stage 5A Physical FAIL #2 Diagnosis / Fix Evidence

- Date: 2026-09-28 JST
- Baseline / current Git HEAD: `0dfb82372f0555de7c29a77d2e58835708aa90a5`
- Product Owner result: `FAIL — APP REPORTS CAMERA UNAVAILABLE`
- Root cause: `CONFIRMED`
- Current Gate: `STAGE 5A PHYSICAL SCANNER PASS / STAGE 5B NOT STARTED`
- Commit / push: not performed

## Physical Evidence

The supplied screenshot was copied without image-content modification to `outputs/match-sharing-stage5a/physical-fail-2-2026-09-28/IMG_3775.PNG`.

- Original and preserved-copy SHA-256: `c40f26566cb68111878a4d416761b0057dc6c4a58a1a90f68474becd7f711ab0`
- Original dimensions: 1170 × 2532.
- Sanitized runtime sequence: `outputs/match-sharing-stage5a/physical-fail-2-2026-09-28/runtime-diagnostic-sanitized.log`.
- The screenshot proves the Stage 5A app reached the product-facing Camera-unavailable state. It does not prove that iOS Camera discovery or `AVCaptureSession` failed.
- PASS: Receiver entry, Scanner flow start, native/Web error mapping, unavailable UI.
- FAIL at that time: preview, capture and recognition were not reached.
- QR A / B / C and production physical decode: `NOT TESTED`.

## Exact failure point and confirmed root cause

Temporary non-sensitive runtime tracing was added and the Product Owner invoked `履歴 → 受け取る`. The failed build produced this sequence:

1. Receiver controller creation requested.
2. Native plugin resolved successfully (`pluginResolved=true`).
3. Controller creation rejected with JavaScript `ReferenceError: Can't find variable: readRecords`.
4. Native `authorizationStatus` invocation count: zero.
5. Camera device discovery, input/output configuration, preview attachment and `startRunning`: not reached.

`ensureMatchSharingScannerControllerV1()` passed the shorthand identifier `readRecords`, but the existing production reader is named `readMatchRecords`. Object construction therefore threw before `createScannerController()` returned. The outer safety boundary correctly rendered a non-technical unavailable state, but that message obscured the programming error.

This is the confirmed cause of Physical FAIL #2. It was not an iPhone 16e Camera-device failure.

## Minimum fix

Only the dependency wiring was corrected:

```js
readRecords: readMatchRecords
```

A regression assertion now requires this exact mapping and rejects the invalid shorthand. No scanner strategy, Match schema, storage contract, Backup/Restore, Player mapping, Version or Build number changed.

Temporary `NSLog` / console tracing used to locate the failure was removed from the final candidate. Typed native error codes remain for permission, preview, device/input/output, QR metadata and session-start boundaries. No Camera image, frame, QR content, unique device ID or personal data was recorded.

## Physical runtime read-back after the fix

On the same physical iPhone 16e, the Product Owner opened `履歴 → 受け取る` after the diagnostic build was reinstalled. Runtime Evidence showed:

- Authorization before request: `notDetermined`.
- iOS permission result: `authorized`.
- Camera discovery: 2 video devices (back and front wide-angle cameras).
- Selected device: back wide-angle camera.
- `AVCaptureDeviceInput` creation: success.
- `canAddInput`: true.
- `canAddOutput`: true.
- Metadata type: `.qr`.
- Native preview attached: true, 280 × 280 pt.
- `startRunning()` requested and `session.isRunning`: true.
- Product Owner visual confirmation: `カメラ起動したよ。`

This establishes physical Camera authorization, discovery, preview attachment and capture-session start as PASS.

## Product Owner QR retest result

On 2026-09-28, the Product Owner reported `QR A/B/C大丈夫。確認したよ。` for the final installed Stage 5A candidate.

- QR A, ECC-M Version 19: physical in-app scan PASS.
- QR B, ECC-M Version 25: physical in-app scan PASS.
- QR C, ECC-M Version 30: physical in-app scan PASS.
- CueScore validation success state for A/B/C: PASS.
- Back stops Camera: PASS.
- Result: `PASS — PRODUCT OWNER PHYSICAL IPHONE IN-APP QR TEST 3/3`.

Successful in-app recognition and validation establish the production scanner callback/decode/validation route for those three cases. Back cleanup is also physical PASS. This result is not generalized to untested QR versions, devices or display conditions. Retry was not needed during the successful test and remains `NOT TESTED — NOT FAILED`.

## Installed app / Build evidence

- Device: physical iPhone 16e (`iPhone17,5`), iOS 26.6.2 (23G90).
- App / Bundle: `CueScore Stage5A` / `com.takaakimailboxstar.cuescoreapps.stage5a`.
- Version / Build: `1.1 (79)`; repository Version/Build unchanged.
- Installed app contains `NSCameraUsageDescription`: `プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。`
- Signing: Apple Development, Team `U26DF88PRW`; development entitlement only, no Camera-specific entitlement is required or missing.
- Final no-debug-log executable SHA-256: `c3aeb7d0df11802b8da043e295a4e59040289068b3fa68af648bfacbaf3981a7`.
- `.storekit`: 0.
- Final no-debug-log build reinstall: PASS.

## Verification

- Stage 5A dedicated: `16 PASS / 0 FAIL / 0 SKIPPED`.
- Stage 1–5A focused: `81 PASS / 0 FAIL / 0 SKIPPED`.
- Full Node regression: `540 PASS / 0 FAIL / 0 SKIPPED`.
- Source / `native-web` / iOS public `index.html` parity SHA-256: `b6592444a4cc24358894590579376431293c4b19bc42f826711888e0c1d43025`.
- Receiver runtime parity SHA-256: `e3362d7910ba8ef54927bf5e05e708feba554a525ccd472ee358c2e2b87f1189`.
- Release Simulator Build: PASS, Version `1.1 (79)`.
- Dependency identity unchanged: `capacitor-swift-pm 8.0.2`, `ion-ios-filesystem 1.1.2`; `Package.resolved` SHA-256 `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- `git diff --check`: PASS.

## Remaining physical boundary

The final no-debug-log candidate is installed. Camera start, production QR A/B/C recognition, CueScore validation and Back Camera stop are physical PASS. Retry restart was not needed during the successful test and remains `NOT TESTED — NOT FAILED`.

Stage 5B, Match Preview, mapping, Import UI, Free History, Version/Build, Archive, TestFlight and App Store Connect were not changed or started.
