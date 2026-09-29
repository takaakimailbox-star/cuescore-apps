# CueScore Match Sharing v1 — Revised Stage 3 + Stage 5B Evidence

- Date: 2026-09-29 JST
- Baseline: `6c556ccf8577c9444654245f06c6fad2231d4741`
- Decision: Official Decision Log v2.5 / Decision 030
- Gate: `REVISED STAGE 3 + STAGE 5B FINAL ACCEPTED / PRODUCT OWNER PHYSICAL PASS`
- Version / Build: `1.1 (79)` unchanged
- Commit / push: authorized by the Final Acceptance Gate; resulting SHA is reported in the completion report

## Historical Stage 5B result

The previous Receiver Flow passed automated verification and Product Owner physical iPhone E2E. That evidence remains valid for QR scan, transaction, normal Match Detail, and duplicate rejection. Decision 030 superseded only the Self/Opponent UX and mapping contract, so the revised candidate required a new physical E2E; that revised physical E2E is now complete and Product Owner PASS.

## Revised Stage 3 contract

- The primary input is `{ bySide: { 1, 2 } }`; both shared sides require an explicit receiver-local mapping.
- Legacy `selectedSide`, `self`, and `opponent` mapping keys are rejected.
- Each side may select an existing local Player or a deferred new Player draft.
- The same existing Player, pending key, or generated Player ID cannot be assigned to both sides.
- No name-only mapping, main-Player inference, or sender-local Player ID is used.
- Player creation and Match persistence remain one all-or-nothing transaction with duplicate recheck, semantic read-back, and rollback verification.

## Third-party import

The explicit third-party case `ゆな vs かいと` was imported on a receiver whose main Player is `貴章`.

- Shared Player 1 → receiver-local `ゆな`
- Shared Player 2 → receiver-local `かいと`
- Main Player `貴章` remained byte-equivalent and was not inserted into either Match side.
- Participant record selection returns one imported record for `ゆな`, one for `かいと`, and zero for `貴章`.

This confirms that Player Detail / History / aggregate consumers can use the existing `registeredPlayerId` contract without a main-Player dependency.

## Revised unified Receiver Flow

`History → 受け取る → Scanner → 試合を確認（Match Preview + Player 1 / 2 mapping）→ 取り込み内容を確認 → 試合を取り込む → normal Match Detail + success feedback`

- `あなたはどちらですか？`, Self Mapping, and Opponent Mapping are removed.
- Preview and both symmetric mapping rows are one screen.
- Both rows support existing Player selection and `新しいプレーヤーとして追加`.
- Mapping is explicit; selecting a row does not auto-advance.
- Back from confirmation preserves both mappings in memory.
- Before mapping and for pending new Players, the neutral default silhouette is used.
- Existing mappings use only receiver-local avatars. Sender avatars are neither transferred nor inferred.
- Final confirmation shows `shared name → receiver-local name` for Player 1 and Player 2.

## Duplicate UX

Duplicate validation is a dedicated state, separate from generic QR failure:

- Title: `この試合はすでに取り込み済みです`
- Body: `同じ試合が試合履歴に保存されています。`
- Action: `他の試合を読み取る`

The full normal collection, including Free-hidden and Restore-merged records, remains the duplicate source of truth. Duplicate attempts create zero Players and zero Matches.

## Free / Pro, Demo, and privacy

- Match Sharing remains available to Free and Pro with no badge, lock, paywall, or entitlement gate.
- Free Cases A/B retain normal newest-20 access. Case C retains the exact imported-local-ID, memory-only, consume-once Detail grant.
- Free History keeps the global hidden count and existing Pro CTA; it is not filtered per discipline.
- Demo remains blocked at entry, scanner, and import service boundaries.
- Format v1, `sharedMatchId`, Backup / Restore, and privacy Must Omit fields are unchanged.
- Sender IDs, avatars, memo/reflection, Category/Season, entitlement, device, and Demo metadata are not imported.

## Fixture and semantic coverage

- Six disciplines × Short / Medium / Long: `18/18 PASS`.
- All 18 production payloads pass encode → decode → unified Receiver UI → atomic import → semantic read-back.
- Re-encoding the receiver-local Match preserves the shared logical Match.
- Four Player combinations pass: existing/existing, new/existing, existing/new, new/new.
- Missing side 1, missing side 2, same local Player, missing/deleted local Player, duplicate/long/invalid draft, and generated ID collision are rejected before writes.

## Automated verification

- Revised Stage 3 dedicated: `26 PASS / 0 FAIL / 0 SKIPPED`.
- Revised Stage 3 + Stage 5B: `41 PASS / 0 FAIL / 0 SKIPPED`.
- Match Sharing Stage 1–5B focused: `99 PASS / 0 FAIL / 0 SKIPPED`.
- Full Node regression: `557 PASS / 0 FAIL / 0 SKIPPED`.
- Release Simulator Build, iOS 27 SDK: `BUILD SUCCEEDED`.
- Source / native-web / iOS public parity: PASS.
- `git diff --check`: PASS.

## Visual audit

Production DOM/CSS screenshots are in `outputs/match-sharing-stage5b/`:

1. Unified Preview / mappings incomplete
2. Unified Preview / mappings complete
3. Final confirmation
4. Dedicated duplicate state
5. Import success / normal Match Detail

At 390×844, all five screens have horizontal overflow 0, clipping 0, undersized visible controls 0, and Match Sharing badges on normal Detail 0. The unified complete screen also passes at 360×780 with a long receiver-local Player name. The regenerated Duplicate image contains the complete dedicated copy with no stale success toast. Physical Dynamic Type and VoiceOver remain `NOT VERIFIED`.

## Native candidate

- Device target: physical iPhone 16e
- Display name: `CueScore Stage5B`
- Bundle ID: `com.takaakimailboxstar.cuescoreapps.stage5b`
- Version / Build: `1.1 (79)`
- Signed device Build: PASS
- Initial revised-candidate executable SHA-256: `d89b5649cbace582e8bc26472dadb2e0111bf061690d5719dbb70ace1c095c6e`
- Retry-fix #1 executable SHA-256: `e49850f492c6980f79dcdb1fb96ee753901de87a70291a3274dfbed185454d7e`
- Retry-fix #2 executable SHA-256: `523fe2a3b9ac602d4de923a0cc955754bb45626991ecd289635aebf76deceb6c`
- Camera usage description: present
- `.storekit`: 0
- Dependencies: `capacitor-swift-pm 8.0.2`, `ion-ios-filesystem 1.1.2`; no manifest change
- Device install: PASS
- Installed app read-back: `CueScore Stage5B` / `com.takaakimailboxstar.cuescoreapps.stage5b` / Version `1.1` / Build `79`
- Obsolete test app cleanup: `CueScore Stage5A` (`com.takaakimailboxstar.cuescoreapps.stage5a`) removed and absence read back

The public `CueScore Apps` Version `1.1 (79)` bundle remains separately installed and was not modified or overwritten. The unrelated CueSnapi app was retained.

## Product Owner physical observation and retry fix

Product Owner tested the initial revised candidate on the physical iPhone 16e:

- Stage 4 QR A was recognized and reached the dedicated duplicate state: PASS.
- Stage 4 QR C was recognized: PASS.
- QR B was not separately confirmed in this observation.
- After the duplicate state, tapping `他の試合を読み取る` returned to Scanner chrome but did not restart the live camera preview: FAIL.
- Returning to History and entering `受け取る` again restarted the camera: PASS.

Original screenshots are preserved without modification:

- `outputs/match-sharing-stage5b/physical-retest-2026-09-29/IMG_3790.PNG` — SHA-256 `3c54a33f13b47c4512d91551e7725ff387a9521bf7f58d6ac4f5bf7c1e23df27`
- `outputs/match-sharing-stage5b/physical-retest-2026-09-29/IMG_3791.PNG` — SHA-256 `8a869d4dedfd6b1652cd8b147867c7ce7b4e31d5f5a43c9914ee1a631767441c`

The retry path stopped native capture but retained old scanner listeners and bypassed the complete authorization/listener/start lifecycle used by a successful History re-entry. The minimal fix makes retry perform the same full teardown and `enter()` lifecycle: stop native capture, remove listeners, clear transient state, recheck authorization, reinstall listeners, and start a fresh native scan. No QR format, Import transaction, schema, Version, or Build change was made.

Retry fix #1 made the Scanner controller perform a full native/listener re-entry, but Product Owner physical retest still showed no live camera preview. This is recorded as FAIL; it was not promoted to PASS.

The remaining behavioral difference from the successful manual workaround was the Receiver overlay lifecycle itself. Retry fix #2 removes the in-place Scanner restart from the product route. The action now calls the same complete `closeMatchSharingReceiverV1()` followed by `startMatchSharingReceiverV1()` path as Back to History followed by Receiver re-entry, including overlay/body-state reset and the existing two-frame layout stabilization before preview coordinates are read.

Regression coverage asserts the full close/start product wiring. Stage 5A + 5B dedicated `31/31`, Stage 1–5B focused `99/99`, full Node `557/557`, native parity, and Release Simulator Build pass. A newly signed `CueScore Stage5B` `1.1 (79)` with retry fix #2 was installed and read back on the same iPhone.

Product Owner then completed physical retry retest #2 and reported `OK`. The verified sequence was: duplicate state → `他の試合を読み取る` → live camera preview resumed without leaving Receiver → another QR could be read. Result: `PASS — PRODUCT OWNER PHYSICAL RETRY RETEST #2`. No screenshot was supplied for this final retry retest, so no image Evidence is claimed.

## Physical Gate

`PASS — PRODUCT OWNER REVISED STAGE 5B PHYSICAL E2E`.

Product Owner confirmed on the physical iPhone:

1. Revised symmetric Receiver Flow: PASS.
2. Unified Match Preview + Player 1 / 2 mapping: PASS.
3. Import and return to normal Match Detail: PASS.
4. Duplicate rejection and dedicated duplicate UX: PASS.
5. `他の試合を読み取る`: PASS.
6. Camera preview restart: PASS.
7. Different QR scan after retry: PASS.

The final retry retest has no screenshot. Its exact status is `PRODUCT OWNER PHYSICAL PASS — NO FINAL SCREENSHOT EVIDENCE`; image Evidence is not claimed. The earlier physical FAIL screenshots remain preserved as historical Evidence.

## Remaining NOT VERIFIED

- Physical VoiceOver.
- Physical Dynamic Type / largest accessibility sizes.
- Physical iPad.
- Printed QR and low-light / adverse-angle scanning.
- TestFlight, App Store Connect, Archive, Upload, and Release readiness for Match Sharing.

Archive, Upload, TestFlight, App Store Connect, Release, and Version/Build changes were not performed.
