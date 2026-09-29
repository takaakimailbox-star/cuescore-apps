# CueScore Current Decision

- Decision ID: `CUESCORE-MATCH-SHARING-V1-SYMMETRIC-MAPPING-AMENDMENT-20260929`
- Date: 2026-09-29
- Product Owner / ChatGPT decision: `SYMMETRIC PLAYER A/B MAPPING + RECEIVER UX REVISION — APPROVED`
- Gate: `FORMAL DESIGN AMENDMENT APPROVED / DOCUMENTATION COMMIT-PUSH AUTHORIZED / REVISED IMPLEMENTATION NOT STARTED / STOP`

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

## Boundary

- Documentation-only final audit / commit / push in this Gate.
- Do not edit, stage, commit or discard the existing uncommitted Stage 5B product diff.
- No Stage 3 / Stage 5B implementation, Prototype, Build, Version change, Archive, Upload, TestFlight or App Store Connect work.
- Commit and push only the explicit Formal Amendment documentation paths; keep every Stage 5B product path unstaged and byte-identical.

## STOP

Stop after the approved Formal Amendment documentation is committed, pushed, and fresh-read back. Revised Stage 3 / Stage 5B implementation remains not started.
