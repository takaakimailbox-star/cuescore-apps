# CueScore Build 77 App Review Launch Crash — UIScene compatibility fix

Date: 2026-09-21
Submission ID: `7fd64b66-fe2e-424e-9038-a37cbddf8e87`
Reviewed version: `1.0 (77)`
Source baseline: `main` / `9c15e8507805702f72873aa9c6c2c022edcc5b41`

## Conclusion

`CONFIRMED ROOT CAUSE`

Build 77 was built with the iOS 27 SDK but still used only the legacy `UIApplicationDelegate` lifecycle. Its packaged `Info.plist` had no `UIApplicationSceneManifest`, the app target had no `SceneDelegate`, and `AppDelegate` did not implement `application(_:configurationForConnecting:options:)`. iOS 27 device build `24A435` trapped on the main thread while UIKit created the first scene, before the Capacitor web UI, StoreKit startup, Player data, or game code could run.

This is an iOS/iPadOS compatibility bug fix. It changes no official product behavior, design, persistence schema, game rules, IAP Product ID, Free/Pro policy, Player, or History contract. No Official specification or `docs/CURRENT_STATE.md` was promoted or rewritten.

## Primary Apple crash evidence

All three `.ips` files were parsed independently. The Build 77 Archive and dSYM remain available at `CueScoreBuild77.xcarchive`; both UUIDs exactly match all three crash logs, so the application frame was fully symbolicated.

| Crash log | Launch → capture | Termination | Faulting thread / first relevant frames | App frame |
| --- | ---: | --- | --- | --- |
| `crashlog-5F292644-9864-41BC-9944-257F0CD40429.ips` | 74.4 ms | `EXC_BREAKPOINT` / `SIGTRAP`; `SIGNAL`, code 5, `Trace/BPT trap: 5`; PID 2633 | Thread 0 / main: `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke + 700` → `dispatch_once` → `-[UIApplication workspace:didCreateScene:withTransitionContext:completion:] + 324` → `-[UIApplicationSceneClientAgent scene:didInitializeWithEvent:completion:] + 288` | offset 17316 → `main (/<compiler-generated>:0)` |
| `crashlog-D84846E2-7753-4E6A-8D25-289AD454BA2A.ips` | 59.7 ms | Same; PID 2636 | Same | Same |
| `crashlog-2A725ADD-9470-4867-AE2A-76F987EA37E2.ips` | 59.7 ms | Same; PID 2638 | Same | Same |

Common binary evidence:

- Bundle ID: `com.takaakimailboxstar.cuescoreapps`
- Version/build: `1.0 (77)`
- Architecture: `arm64`
- App, Archive binary, and dSYM UUID: `AB7750C2-18E3-3CDC-A491-F0DEBF966BBF`
- OS inside each `.ips`: `iPhone OS 27.0 (24A435)`, User release
- Device inside each `.ips`: `modelCode iPhone18,2`
- The Apple review note says `iPad Air 11-inch (M3)`, while all three primary `.ips` files say `iPhone18,2`. Both facts are retained; no device identity is inferred or rewritten.

SHA-256:

- `2A725ADD…`: `9ebc3e3f06f6f947a6b782966030b937ce97f53c5a33b3bb916e40f2f3169a1b`
- `5F292644…`: `338145efcc5e01d4546863fb59ef0f2194b04702d2e34326d2f98c1fdfe9c7f7`
- `D84846E2…`: `c121c894241af5a906ad1b63e3c42dff27dfc6bf9dadd84d4d7f4c70b77187e7`

## Source/configuration confirmation

Build 77 Archive evidence:

- Xcode 27 / iOS 27 SDK (`DTSDKBuild 24A430`)
- Minimum iOS 15.0
- iPhone-only target (`UIDeviceFamily = [1]` / `TARGETED_DEVICE_FAMILY = 1`)
- `UIMainStoryboardFile = Main`
- No `UIApplicationSceneManifest`

Build 77 source evidence before this fix:

- `ios/App/App/AppDelegate.swift` used `@UIApplicationMain`, owned `UIWindow`, and exposed only legacy application lifecycle callbacks.
- `ios/App/App/Info.plist` had no scene manifest.
- No `SceneDelegate.swift` was present or compiled.
- `Main.storyboard` correctly used `CueScoreBridgeViewController`; the crash occurred before this UI could initialize.

Apple's iOS 27 migration requirement, the three identical UIKit trap stacks, and the matching archived binary/dSYM establish the root cause without inference from the frame name alone.

## Related historical evidence

Repository evidence had already recorded the same compatibility warning/failure, but classified it as a future or environment constraint:

- `CueScore_v1.0_Step7B_Native_iOS_Progress_2026-08-16.md`: `UIScene lifecycle will soon be required` warning.
- `CueScore_Build67_IAP_Diagnostic_TestFlight_2026-09-18.md`: iOS 27 Simulator UI-test launch blocked by UIScene lifecycle requirement.
- `CueScore_Build72_Current_Plan_Settings_UI_2026-09-18.md`: iOS 27 Simulator launch stopped immediately because scene lifecycle was not adopted.

Apple's three Build 77 device crash logs now prove this was a shipped-product compatibility defect, not merely an external Simulator limitation.

## Minimal fix

- `ios/App/App/Info.plist`
  - Added a single-scene `UIApplicationSceneManifest` for `UIWindowSceneSessionRoleApplication`, `Default Configuration`, `SceneDelegate`, and the existing `Main` storyboard.
- `ios/App/App/AppDelegate.swift`
  - Added `configurationForConnecting` and returned the matching scene configuration.
  - Removed AppDelegate's legacy ownership of the window.
- `ios/App/App/SceneDelegate.swift`
  - Added the minimal `UIWindowSceneDelegate` and retained Capacitor URL / user-activity forwarding.
  - The existing storyboard continues to instantiate `CueScoreBridgeViewController`, preserving native StoreKit plugin registration.
- `ios/App/App.xcodeproj/project.pbxproj`
  - Added `SceneDelegate.swift` to the App target.
- `tests/ios27-scene-lifecycle.test.mjs`
  - Added four focused guards for the manifest, AppDelegate configuration, SceneDelegate/Capacitor bridge, and unchanged release identity/device family.

## Verification

### Automated

- Scene + existing Race selector + Player Search focused Node tests: **11 passed / 0 failed**.
- Full Node regression: **443 passed / 0 failed**.
- Release Simulator build, Xcode 27 / iOS 27 SDK: **PASS**.
- Native UI test (`testProGateLoadsLocalStoreKitProductWithoutDiagnosticUI`): **1 passed / 0 failed**. This covers launch, Home, Settings, Pro screen, native bridge, and StoreKit product display.
- Native StoreKit unit test: **0 passed / 1 failed, then interrupted after no progress**. `SKTestSession` was explicitly configured for JPN/`ja_JP`, but iOS 27 Simulator returned USA / `$5.99` instead of the StoreKit configuration's JPN / `980`; the test then waited in the purchase path. This is a test-environment/storefront failure, not the UIKit launch crash. The app remained running and the separate native UI test passed.

### Launch/device evidence

- `CueScore iPhone iOS27 Launch QA`, iPhone 18 Pro, iOS 27.0 Simulator runtime build `24A434`: Release cold launch **3/3 passed**.
- `CueScore iPad iOS27 Launch QA`, iPad Air 11-inch (M4), iOS 27.0 Simulator runtime build `24A434`: Release cold launch **3/3 passed** in the supported iPhone compatibility presentation.
- Both Simulator logs created `com.takaakimailboxstar.cuescoreapps-default` scenes and contained **0** occurrences of `NoSceneLifecycleAdoption` after the fix.
- Local runtime `24A434` is not the exact Apple device runtime `24A435`. The pre-fix app did not reproduce Apple's trap on local `24A434`; therefore the Apple `.ips` files remain the primary failure evidence, while the local runs are fix verification.
- Apple named an iPad Air 11-inch (M3). The locally available closest iPad was iPad Air 11-inch (M4); no physical iPad or iPhone was used.

Visual evidence:

- `evidence/build77-launch-crash-fix/ios27-iphone-release-home.png` — SHA-256 `76ad8a9dd7b30443d827c499841aac135ab0f5ac94284912fb306482e5c7c485`
- `evidence/build77-launch-crash-fix/ios27-ipad-release-home.png` — SHA-256 `53668684ee09f8cd2ca1bc28c4b0fb3b7b499d3ecab672d2b24d9ca47bc8e8f6`

## Regression boundary

- Home: native Release visual PASS on iPhone and iPad.
- Settings / Pro / StoreKit startup: native UI test PASS.
- Player list, Player selection, History, and all six discipline entry contracts: covered by the 443/443 Node regression.
- Race selector / Bottom Navigation: focused test PASS; existing uncommitted implementation preserved.
- Player Search focus ring: focused test PASS; existing uncommitted implementation preserved.
- Persistence schema, Player schema, game rules, IAP Product ID, Free/Pro behavior, History, and App Store metadata: unchanged.

## Release boundary

- No commit or push was made.
- Build number remains 77; Build 78 was not created.
- No Archive was created for the fix.
- No App Store Connect upload, review withdrawal/resubmission, reviewer reply, or release was performed.

The code and automated launch evidence are ready for the next gate: review the known iOS 27 StoreKit test-environment mismatch, then authorize a new build/archive/upload as a separate operation.
