# CueScore Build 79 Product Owner Physical iPhone Acceptance

- Date: 2026-09-26
- Device class: physical iPhone
- Distribution: Internal TestFlight
- Version / Build: `1.1 (79)`
- Source commit: `39e3071f898c7af8499abbfee6f0043307699f6f`
- App Store Connect Build ID: `0b61e6fe-14b6-452a-bc2e-a6b2b02524d2`
- Product Owner result: `ALL PASS / ALL OK`
- Gate: `PRODUCT OWNER ACCEPTED — INTERNAL TESTFLIGHT PASS`

## Physical iPhone checks actually performed

| Check | Result |
| --- | --- |
| TestFlight Version `1.1 (79)` | PASS |
| Cold launch / Home | PASS |
| JPA game-start cumulative Dead display | PASS |
| Normal Dead input and cumulative update | PASS |
| Break scratch plus Dead ball — history display | PASS |
| Break scratch plus Dead ball — same existing visual as normal Dead | PASS |
| Break scratch plus Dead ball — cumulative update | PASS |
| Undo — history restore | PASS |
| Undo — cumulative Dead restore | PASS |

No Product Owner screenshot was supplied for this acceptance. This record is a written Product Owner result, not image Evidence.

## Automated Evidence, not physical-device PASS

The following remain PASS based on existing automated tests but were not stated as performed in this physical iPhone review:

- dry scratch leaves Dead unchanged;
- 9 ball plus scratch/foul is excluded from Dead;
- duplicate suppression;
- Undo then re-entry;
- in-progress save / restore;
- Match History / Match Detail;
- Backup / Restore;
- JPA match completion;
- other five disciplines have no Dead UI.

These items must not be represented as Product Owner physical-device PASS without a later explicit result.

## Existing automated and distribution Evidence

- Dead dedicated: 16 PASS / 0 FAIL.
- JPA / Undo / in-progress / History / Backup focused: 64 PASS / 0 FAIL.
- Full Node regression: 459 PASS / 0 FAIL / 0 SKIPPED.
- Release Simulator Build: PASS.
- Build 79 Apple validation: PASS.
- App Store Connect: `VALID` / `APP_STORE_ELIGIBLE` / `usesNonExemptEncryption=false`.
- Internal TestFlight: `IN_BETA_TESTING`.

These results were not rerun during this documentation-only acceptance task; they are retained from the Build 79 distribution Evidence.

## Gate close and boundary

- Design: COMPLETE.
- Prototype: PASS.
- Product Owner Prototype Review: PASS.
- Implementation: COMPLETE.
- Automated Test: PASS.
- Build / Archive / Upload: PASS.
- Internal TestFlight: PASS.
- Product Owner physical iPhone verification: PASS.

Current state: `Implementation Complete / Build 79 Internal TestFlight / Product Owner Accepted / App Store Update Not Started`.

Public Version 1.0 / Build 78 remains unchanged. App Store Version 1.1, App Review, External TestFlight, Release, metadata, screenshots, App Privacy, CueScore Pro, price, availability, and Build 80 were not created or changed.
