# CueScore v1.0 Free / Pro Monetization Spec

**Status:** Adopted
**Decision:** `97_CueScore_v1.0_Free_Pro_Monetization_Decision.md`

## Entitlement and record policy

`CueScoreEntitlement` is the runtime entitlement SSOT. Native iOS connects it to `CueScoreStoreKit`, which obtains Product data, purchases, current entitlements, transaction updates, and restore results through StoreKit 2. Only verified transactions for `com.takaakimailboxstar.cuescoreapps.pro` unlock Pro.

`CueScoreRecordAccess.getEligibleRecords(records)` is the record-visibility SSOT. Pro returns all saved records. Free stable-sorts the complete saved collection newest-first and returns the first 20 globally, before player or discipline filtering. Basic statistics and Match Detail eligibility use that same collection. Storage writes always use the unfiltered collection.

## Feature boundary

Free includes all match creation and scoring, saving, player management, newest-20 history and details, and basic settings. Pro gates personal bests, detailed analysis and trends, opponent-specific analysis, records older than the newest 20, Backup, and Restore.

All gated entries open the same Pro surface with a source value. A verified successful purchase immediately refreshes the entitlement and replays the originating action. Cancel, pending, product-unavailable, offline, purchase failure, and restore-not-found remain non-destructive.

## Product configuration

- Type: Non-Consumable
- Product ID: `com.takaakimailboxstar.cuescoreapps.pro`
- Price shown in-app: StoreKit `displayPrice` only
- Current pricing direction: JPY 980
- App Store localization, review metadata, and review submission are not inferred when unapproved.
