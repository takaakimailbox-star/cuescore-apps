# CueScore Post-Build 2 UI Unification — Implementation Report

Date: 2026-08-18
Starting `origin/main`: `eca0c0c8436fc91ecbd8d401380d17ef0ad95651`
Status: Source implementation and automated verification PASS / physical-device UI verification pending

## Verified baseline

- Rotation already used `foulLocked` and `turnLockReasonV62` after foul and safety, then cleared both through `switchPlayer()`.
- The lock state was already included in Undo and in-progress snapshot／restore data.
- 9-Ball／10-Ball, JPA 9-Ball, and ordinary 14-1 foul／safety paths automatically changed `current` before this change.
- JPA Dead followed Safety in the visible JPA action order.
- 3C uses separate controls and was not modified.

## Implementation

- Added `beginManualTurnChangeV1(reason)` as the shared entry to the existing Rotation lock state.
- Foul and safety for Rotation, 9-Ball, 10-Ball, JPA 9-Ball, and ordinary 14-1 now record the event and wait for the existing Switch action without changing Player automatically.
- Pocket, Safety, Foul, JPA Dead, and Push Out availability honor the lock. Switch and the existing Undo path remain available.
- Preserved 14-1's existing three-foul penalty／rerack／next-breaker branch because it is a competition transition rather than an ordinary turn switch.
- Moved JPA Dead before Safety in the action markup without changing its event implementation.
- Did not change scoring, rules, schemas, Undo limit, Analytics definitions, or 3C.

## Verification

- Added `tests/manual-turn-change-unification.test.mjs` covering all target branches, lock controls, Switch／Undo availability, snapshot／restore reuse, JPA Dead order, and 3C exclusion.
- Automated tests: 153 pass / 0 fail / 0 skipped.
- Native asset source／generated／Xcode-copy SHA-256: `23ae38c0a98413a7c8ef273a0af7dc888f92d9048a376bc59c14ed987b94bae9`.
- iOS Simulator Debug build: PASS.
- iOS Simulator Release build: PASS.
- `git diff --check`: PASS.
- Physical iPhone verification of this UI change: pending.

## Distribution boundary

TestFlight Build 2 was already uploaded and internally distributed before this implementation and therefore does not contain it. Build Number 2 will not be reused. No new TestFlight build, App Review submission, or public release was performed in this task.
