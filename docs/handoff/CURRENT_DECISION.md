# CueScore Current Decision

- Decision ID: `CUESCORE-MATCH-SHARING-V1-SYMMETRIC-MAPPING-AMENDMENT-20260929`
- Date: 2026-09-29
- Product Owner / ChatGPT decision: `SYMMETRIC PLAYER A/B MAPPING + RECEIVER UX REVISION — APPROVED`
- Gate: `REVISED STAGE 5B FINAL ACCEPTED / COMMIT + PUSH AUTHORIZED / RELEASE READINESS NOT STARTED`

## Adopted amendment

- Remove `あなたはどちらですか？`, own-side selection, Self Mapping and Opponent Mapping from the current Receiver Flow.
- Map Shared Player A / B explicitly and symmetrically to receiver-local Player A / B.
- Allow third-party Import when the receiver main Player is not a Match participant; never auto-map or change main Player.
- Combine Match Preview and both Player mappings into one `試合を確認` screen.
- Use default/neutral avatars before mapping and for pending new Players; use receiver-local avatars after existing mapping; never use sender avatars.
- Present duplicate as a dedicated already-imported state, not a QR read failure.

## Maintained scope

- ECC-M Single QR, Sender / Receiver entry, Scanner and camera permission flow.
- Format v1, `sharedMatchId`, duplicate protection, all-or-nothing transaction, privacy, Demo, Free / Pro and Backup / Restore.
- Normal Match Detail＋success toast after successful Import.
- Decision 028 / 029 remain historical records; Decision 030 supersedes only their affected Receiver scope.

## Implementation result

- Stage 3 now consumes symmetric `bySide.{1,2}` mappings and rejects the legacy self/opponent contract.
- Stage 5B now combines Preview and both Player mappings on `試合を確認`, preserves mappings across Back, uses only neutral/receiver-local avatars, and presents duplicate as a dedicated state.
- Third-party Import is main-Player independent; six disciplines / 18 fixtures and all four existing/new combinations pass.
- Initial revised physical testing confirmed QR A duplicate handling and QR C recognition, but direct retry from the duplicate state failed to restart camera preview. Controller-only retry fix #1 also failed physical retest. Fix #2 routes the action through the complete Receiver close/open product lifecycle. Product Owner physical retry retest #2 confirmed camera preview restart and another QR read with `OK / PASS`.
- Product Owner Final Acceptance confirms the revised symmetric Receiver Flow, Import, duplicate rejection / dedicated UX, retry camera restart, and different-QR scan after retry.

## Boundary

- Final audit, Evidence finalization, commit, push, and GitHub fresh read-back are authorized.
- No further product expansion, Version change, Archive, Upload, TestFlight, App Store Connect, Release, or Release Readiness work.

## STOP

Stop after commit, push, and GitHub fresh read-back. The next Gate is Match Sharing v1 Final Integration / Release Readiness and is not authorized in this task.
