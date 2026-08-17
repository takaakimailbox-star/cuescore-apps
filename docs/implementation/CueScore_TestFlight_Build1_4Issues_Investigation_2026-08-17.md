# CueScore Apps — TestFlight Build 1 追加実戦テスト4件 調査記録

Date: 2026-08-17  
Status: Minimal source fixes implemented / physical-device verification pending

## Evidence boundary

- Primary sources: current `main`, Official Decision 022, Official Spec 023, current implementation, Build 1 readiness history, and four Product Owner screenshots.
- The saved Match record JSON and the uploaded `.xcarchive` are not available in the repository or local Xcode Archives directory. Exact iPhone exception object and the complete event sequence therefore cannot be recovered.
- Screenshots are used to confirm the visible symptom, not to infer hidden events.

## Issue 1 — Main Player is cleared when another Player is added

Reproduced in code and automated regression test.

`savePlayerEditor()` always called `setExclusivePrimaryPlayerV1()` for the saved Player. Its false branch removed `isPrimary` from every Player, so adding non-primary Player B cleared primary Player A persistently. The helper now clears only the saved Player when the toggle is off; when the toggle is on it still enforces one exclusive primary Player. Player schema is unchanged.

## Issue 2 — Completed Match storage error

The exact physical-device exception cannot be recovered without the device console or exported raw storage. A concrete quota-bound failure path was reproduced automatically: the completed Match record was written while the replaceable in-progress snapshot, including bounded Undo snapshots, still occupied WebKit local storage.

`persistCompletedMatchRecordsV162()` now removes that replaceable snapshot before the verified Match-record write. If the write fails, it restores the snapshot and rethrows, preserving the existing result-screen recovery behavior. Successful writes remain verified by read-back and no schema or Match content changes were made.

## Issue 3 — Game Result presentation differs

The screenshot matches the existing save-failure fallback modal. The adopted path first saves the Match, then opens the shared `openMatchDetailV1(recordId,{source:"result"})` renderer. When saving throws, that renderer has no saved record ID and the fallback result modal is intentionally retained. This links the observed presentation to Issue 2; it does not establish that an older stylesheet or renderer was bundled.

At investigation start, source `index.html`, generated `native-web/index.html`, and Xcode `ios/App/App/public/index.html` had identical SHA-256 values. Code did not change between commit `13e0aad` and the documented Build 1 upload commit `3a346e8`; intervening commits were verification documentation. This identifies the code content available at upload, but the missing uploaded Archive prevents a byte-for-byte reconstruction of Apple's Build 1 artifact.

## Issue 4 — Masuwari displays zero

Official Decision 022 and Spec 023 require the breaker to win without a foul or turn transfer and require events proving that all balls 1–9 left the table. All Result, Detail, Player, and Analytics paths still use `rackGameMasuwariCountsV1(record)`.

The visible history includes opponent turns/fouls in several racks. In the apparent uninterrupted fifth rack, the screenshot does not visibly account for ball 6. The screenshots therefore do not prove a formal masuwari. Because the raw saved record is unavailable, the Product Owner's expected count of one cannot be confirmed or disproved from the complete event data. The official evaluator was not weakened to infer a count from incomplete evidence.

Regression coverage includes valid run-out=1, turn transfer=0, foul=0, early 9=0, all balls cleared=1, shared consumers, JSON save/reload stability, and equality of source/generated/copied native assets.

## Verification after the minimal fixes

- Full automated suite: 152 pass / 0 fail.
- Native asset generation and Capacitor iOS copy: PASS.
- Source `index.html`, generated `native-web/index.html`, and copied `ios/App/App/public/index.html`: exact equality PASS.
- Xcode Debug simulator build with signing disabled: PASS.
- Xcode Release simulator build with signing disabled: PASS.
- Physical-iPhone regression verification: pending as a separate gate.

## Common-cause conclusion

- Issue 1 is an independent Player-save logic error.
- Issues 2 and 3 share the completed-Match persistence failure path.
- Issue 4 is not confirmed as an implementation defect from available evidence; a raw Match JSON export is required for a definitive field-record ruling.

## Release boundary

No Build Number change, distribution Archive, App Store validation, TestFlight upload, internal distribution change, App Review submission, or public release was performed.
