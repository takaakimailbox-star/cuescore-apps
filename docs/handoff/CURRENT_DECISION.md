# CueScore Current Decision

- Decision ID: `CUESCORE-MATCH-SHARING-V1-FORMAL-DOCS-20260927`
- Date: 2026-09-27
- Product Owner instruction: formalize the adopted Match Sharing v1 Design Decision and Specification without starting implementation
- Gate: `FORMAL DOCUMENTATION PREPARED / PRODUCT OWNER APPROVAL REQUIRED / STOP`

## Scope

- Preserve Decision 12 as the historical Later / Deferred registration.
- Create Official 101 Match Sharing v1 Decision and Official 102 Match Sharing v1 Specification.
- Add Decision 028 to the successor Official Design Decision Log v2.3.
- Sync CURRENT_STATE and documentation indexes to Design / Technical Feasibility Complete, Formal Specification Complete, Implementation NOT STARTED.
- Preserve Version 1.1 and all product source.

## Adopted direction

- Match Sharing transfers one completed and finalized match once; it is not synchronization.
- ECC-M Single QR is the v1 Primary transport.
- Sender entry is Match Detail; receiver entry is Match History list.
- Receiver explicitly maps Player A / B to local players.
- UUID v4 `sharedMatchId` is independent from the receiver's new local Match ID and prevents duplicate import.
- The logical Match Sharing Format is independent from the internal saved-record schema.
- Privacy exclusions, Demo separation, pre-write validation, all-or-nothing import, and Backup / Restore continuity are formal requirements.

## Boundary

- Do not implement Match Sharing, UI, QR scanner, product schema, persistence, Backup integration, Version, Build, Archive, Upload, TestFlight, or App Store Connect changes.
- Do not commit or push before Product Owner Formal Documentation Approval.

## STOP

Stop at `READY FOR PRODUCT OWNER FORMAL DOCUMENTATION APPROVAL` with documentation changes uncommitted.
