# CueScore Match Sharing v1 — Stage 5A Native Scanner Evidence

- Date: 2026-09-28 JST
- Baseline: `0dfb82372f0555de7c29a77d2e58835708aa90a5`
- Gate: `STAGE 5A PHYSICAL SCANNER PASS / STAGE 5B NOT STARTED`
- Commit / push: pending final audit; Product Owner physical Gate is PASS

## Implemented scope

- Added the adopted History header action `QR glyph + 受け取る`, visible label `受け取る`, accessibility label `試合を受け取る`, and a 44×44 pt minimum target. Demo hides the entry and the receiver service rejects direct Demo invocation before permission, camera, decode or state creation.
- Added an AVFoundation custom Capacitor bridge with `authorizationStatus`, `requestPermission`, `startScan`, `stopScan` and `openSettings`. It uses `AVCaptureSession`, the back camera, `AVCaptureMetadataOutput` restricted to `.qr`, and one `AVCaptureVideoPreviewLayer` in the Web screen's requested rectangle.
- The native callback is one-shot: the first QR string stops capture before emitting `scanResult`. No frame, photo or video is persisted, uploaded, sent to analytics or included in Backup.
- Added the adopted `試合を受け取る` scanner screen, short instructions, 280×280 pt guide, Back, permission recovery, product-safe errors and retry. The bottom navigation is hidden only while this scanner screen is open.
- Added the receiver service boundary. It accepts only bounded Stage 1 `CSM1:` input, decodes, verifies integrity, validates Format v1, checks Stage 2 duplicate identity against the full saved normal collection, and retains only `{status, sharedMatchId, logicalMatch}` in memory.
- No Player or Match write, receiver-side `sharedMatchId` persistence, Stage 3 transaction connection, Match Preview, mapping, Import UI or Stage 5B behavior is present.

## Permission and lifecycle

- `notDetermined`: request the iOS system permission once, then start only when authorized.
- `authorized`: start the scanner directly.
- `denied`: do not request in a loop; show an explanation and `設定を開く`.
- `restricted` / camera unavailable: show a non-technical unavailable state and do not continue.
- Back stops the session, removes the native preview, removes listeners, clears memory and returns focus to `受け取る`.
- Background stops capture. Foreground resumes only when the scanner is still the requested active view and authorization is still granted. Back/cancel prevents later resume.
- Native preview is hidden from VoiceOver. Header, instructions, error status announcement, Settings recovery and focus return remain Web accessibility elements.

## Info.plist

`NSCameraUsageDescription` now matches both actual uses:

> プレーヤーのプロフィール写真の撮影と、試合共有QRコードの読み取りにカメラを使用します。

Version remains `1.1`; Build remains `79`. No distribution signing, Archive, Upload, TestFlight or App Store Connect operation was performed.

## Production decode and error boundary

- All 18 Stage 1 production fixtures decode, validate and remain memory-only.
- Stage 4 production equivalents A/B/C decode and validate at ECC-M Versions 19, 25 and 30.
- Non-CueScore, malformed Base45, digest mismatch, unsupported version, invalid schema, oversize and duplicate inputs are rejected with product-facing messages; retry is available where appropriate.
- A duplicate performs zero storage writes and zero Player writes. The later Stage 3 final duplicate gate remains unchanged.
- Unknown version is distinct from corrupted/invalid input. The app never opens an arbitrary URL from a scanned QR.

## Automated verification

- Stage 5A dedicated final audit: `16 PASS / 0 FAIL / 0 SKIPPED`.
- Stage 1–5A focused final audit: `81 PASS / 0 FAIL / 0 SKIPPED`.
- Match Sharing plus History / Match Detail / Player / Statistics / Analytics / Backup / Demo / Free-Pro / Undo / delete focused: `242 PASS / 0 FAIL / 0 SKIPPED`.
- Full Node regression final audit: `540 PASS / 0 FAIL / 0 SKIPPED`.
- Source / native-web / iOS public `index.html` parity: SHA-256 `5c53d7196a815289968e5cf2e9846282066c457255e119f2174c473628c3193e`.
- Receiver runtime parity: SHA-256 `e3362d7910ba8ef54927bf5e05e708feba554a525ccd472ee358c2e2b87f1189`.
- Fixed dependency identity remains `capacitor-swift-pm 8.0.2`, `ion-ios-filesystem 1.1.2`; `Package.resolved` SHA-256 `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`.
- Release Simulator Build, Xcode 27 / iOS Simulator 27.0 SDK / Release: `BUILD SUCCEEDED`.

## 390×844 visual audit

- Evidence: `outputs/match-sharing-stage5a/Receiver_QR_Scanner_390x844.png`.
- Scanner overlay: 390×844; scan guide: x 55, y 149, 280×280; Back: 44×44.
- Clipping 0, overlap 0, horizontal overflow 0, unnecessary vertical scroll 0, Safe Area issue 0, Bottom Navigation overlap 0.
- Browser visual evidence represents the authorized scanner DOM/CSS with a camera placeholder; actual native camera preview and physical VoiceOver/Dynamic Type remain physical-device checks.

## Initial physical FAIL and retest build

- Product Owner initial result: `FAIL — CAMERA PREVIEW / CAPTURE DID NOT START`. Entry/transition/chrome/error/retry return passed; native preview, capture and recognition failed; A/B/C were not tested.
- Root-cause/fix Evidence: `docs/implementation/CueScore_Match_Sharing_v1_Stage5A_Physical_FAIL_Fix_2026-09-28.md`.

- A locally signed Debug device build was created without changing repository Version/Build or distribution signing.
- To protect the installed App Store app, the local test build uses temporary command-line-only bundle identity `com.takaakimailboxstar.cuescoreapps.stage5a` and display name `CueScore Stage5A`.
- The fixed test build remains Version `1.1 (79)`, has executable SHA-256 `82e550fa2f91aa6eb336f0056d6295e95acf17ec78e171e35d3ebab7eabfb778`, and contains zero `.storekit` files.
- Reinstallation to the paired physical iPhone succeeded. Device read-back shows both `CueScore Apps` / `com.takaakimailboxstar.cuescoreapps` and the separate `CueScore Stage5A` / `com.takaakimailboxstar.cuescoreapps.stage5a`, each at `1.1 (79)`; the public app was not overwritten. Fixed-build preview, permission, QR A/B/C recognition, CueScore validation and Back Camera stop are physical PASS. Retry was not needed and remains `NOT TESTED — NOT FAILED`.

## Physical Gate

Physical FAIL #2 and its confirmed pre-Native `readRecords` wiring root cause are documented in `docs/implementation/CueScore_Match_Sharing_v1_Stage5A_Physical_FAIL2_Diagnosis_Fix_2026-09-28.md`. The same iPhone 16e confirms authorization, Camera discovery, preview attachment and capture-session start. Product Owner subsequently confirmed physical in-app QR A/B/C recognition and CueScore validation `3/3 PASS`, plus Back Camera stop PASS. Retry was not needed and remains `NOT TESTED — NOT FAILED`.

The Product Owner used the installed `CueScore Stage5A` app, not the App Store `CueScore Apps` app, and scanned:

1. `outputs/match-sharing-stage4/MatchSharing_Production_QR_A_Light.png` (Version 19)
2. `outputs/match-sharing-stage4/MatchSharing_Production_QR_B_Medium.png` (Version 25)
3. `outputs/match-sharing-stage4/MatchSharing_Production_QR_C_Heavy.png` (Version 30)

For each, the camera preview was normal, the QR was recognized without opening Safari, and the app showed the non-technical valid CueScore QR state. Back stopped the camera and returned to History. A retry restart was not needed during the successful run, so physical Retry remains `NOT TESTED — NOT FAILED`. Stage 5A intentionally does not continue to Match Preview or Import.

## Boundary

- Initial physical Camera gate: FAIL. Fixed-build Camera start, QR A/B/C validation and Back Camera stop: PASS. Retry: `NOT TESTED — NOT FAILED`.
- Official 101/102, Match schema, Backup/Restore format, Free/Pro entitlement, Version/Build and dependency manifests are unchanged.
- Stage 5B, Match Preview, side selection, Self/Opponent mapping, Import connection, Success Detail and Free History UI are not started.
- Archive, Upload, TestFlight and App Store Connect operations were not performed. Stage 5A commit／push is the final approved operation for this Gate.
