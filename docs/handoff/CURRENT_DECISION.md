# CueScore Current Decision

- Decision ID: `CUESCORE-MATCH-SHARING-V1-STAGE1-20260928`
- Date: 2026-09-28
- Product Owner instruction: approve, audit, commit and push Match Sharing v1 Stage 1 Format / Adapters / Validation only
- Gate: `STAGE 1 APPROVED / COMMITTED / STAGE 2 NOT STARTED / STOP`

## Scope

- Add pure, DOM/storage-independent modules for production Match → Logical Format v1, compact representation, encode/decode and validation.
- Cover all six production game identifiers, including `jpa9Ball`.
- Verify 18 Official Demo v3.1-derived fixtures, privacy omissions, typed negative cases, bounded inflate and theoretical QR capacity.
- Keep duplicate handling at a pure lookup boundary only.

## Boundary

- No production `sharedMatchId` persistence, Match schema write, import transaction, Player mapping, QR generation, scanner, camera, UI, Backup / Restore, Free access-policy, Version / Build or distribution work.
- No dependency added; Stage 1 exposes an injected bounded raw-DEFLATE / SHA-256 runtime boundary. Product runtime wiring remains a later approved stage.
- Stage 1 audit / test / one reviewable commit / push / fresh read-back are authorized by the approval Gate.

## STOP

Stop at `MATCH SHARING v1 STAGE 1 COMMITTED / STAGE 2 NOT STARTED`. Do not start Stage 2.
