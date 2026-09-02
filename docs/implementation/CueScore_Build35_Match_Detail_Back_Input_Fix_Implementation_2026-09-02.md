# Build 35 Match Detail Back Input Fix — Implementation

Date: 2026-09-02
Baseline: `0bb701d3`

## Root cause

The formal Match Detail rendered a real Back button but depended only on inline `onclick` and the WebView producing a click. Build 34 wrapped the close function to restore an exact origin, but that wrapper could not help when the physical tap never reached the close function. No explicit physical pointer listener was registered on the formal button.

The inspected target is `button#recordDetailBackBtn`. No covering element was present at its center, and no blocking `pointer-events` rule was found. The older handler belongs to the superseded legacy renderer; the formal renderer replaces that markup. Later wrappers decorate `closeFormalMatchDetailV2`, so the input binding must resolve it at dispatch time rather than capture an earlier definition.

## Implementation

- Removed the formal button's inline handler.
- Bound `pointerdown`, validated `pointerup`, and `click` fallback to one local request function.
- Added a 450 ms duplicate-request latch.
- Kept Edge Swipe Back on programmatic click of the same DOM button.
- Added bounded in-memory pointer/click/close-request tracing for device diagnosis.
- Explicitly protected the hit target with stacking, pointer, and touch-action rules.
- Preserved Build 34 exact-origin restoration and made no Match Card C changes.

## Validation status

Browser inspection confirmed the actual button, 48×48 hit area, foreground hit-test ownership, and one-tap close/return from Global History. Automated and native build results are recorded in `docs/CURRENT_STATE.md`. Product acceptance is still pending the five-origin real-iPhone TestFlight matrix.

Build 35 was archived at `/private/tmp/CueScore-Build35.xcarchive` and uploaded through the personal App Store Connect API key. Delivery UUID `1feb29ed-95b4-423b-8ef5-9971b8c7ef54` completed with processing/import status `VALID` and `usesNonExemptEncryption=false`. The existing internal all-build-access group `CueScore Internal Testers` receives the build. No external testing, App Review submission, review-build linkage, or public release was performed.
