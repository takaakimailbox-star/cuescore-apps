# CueScore v1.0 Free / Pro Monetization Decision

**Status:** Adopted
**Published:** 2026-09-04
**Approval:** Product Owner approved the v2 implementation instruction.

## Decision

CueScore v1.0 adopts a Free / Pro boundary without blocking match creation, match completion, or record saving. Free uses the newest 20 saved records globally for history, basic statistics, and available Match Detail. Pro uses all saved records and unlocks personal bests, detailed analysis and trends, opponent analysis, Backup, and Restore.

CueScore Pro is a one-time Non-Consumable purchase. Its immutable Product ID is:

`com.takaakimailboxstar.cuescoreapps.pro`

The Product ID must match in source, StoreKit Configuration, and App Store Connect. Entitlement authority is a verified StoreKit 2 transaction; a persistent local boolean is not authoritative.

## Protected contracts

- All six disciplines and the full match workflow remain Free.
- The 21st and later records continue to save; no record is deleted by the Free limit.
- One quiet CueScore Pro screen is reused by every gated entry.
- Existing Match Detail origin restoration and data compatibility remain intact.
- External TestFlight, App Review submission, and public release are separate decisions.
