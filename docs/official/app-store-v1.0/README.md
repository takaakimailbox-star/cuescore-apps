# CueScore Apps App Store v1.0 Official Documents

- Document owner: CueScore Apps
- Status: Official Release
- Version: 1.0 Revision 2
- Original publication: 2026-08-09
- Revised: 2026-09-20
- Approval: Product Owner Decision `CUESCORE-V1-FINAL-SUBMISSION-FIX-JP-20260920`

## Purpose

This package is the authoritative source for CueScore Apps v1.0 App Store metadata, App Review guidance, and public legal and support pages. Revision 2 aligns the package with Build 77, the adopted Free and Pro boundary, StoreKit 2, and the Japan-only launch decision.

## Official Files

1. `public/CueScore_Privacy_Policy_v1.0_Official.md`
2. `public/CueScore_Terms_of_Use_v1.0_Official.md`
3. `public/CueScore_Support_v1.0_Official.md`
4. `submission/CueScore_App_Store_Description_v1.0_Official.md`
5. `submission/CueScore_App_Store_Keywords_v1.0_Official.md`
6. `submission/CueScore_App_Store_Review_Notes_v1.0_Official.md`
7. `submission/CueScore_Release_Notes_v1.0_Official.md`

## v1.0 Release Scope

Free includes all six disciplines, match creation and completion, saving, player management, and the newest 20 saved records across all disciplines. Records after the newest 20 remain stored and are not deleted.

CueScore Pro is a one-time Non-Consumable purchase. It unlocks all saved history, personal bests, detailed analytics and trends, opponent-specific review, Backup, and Restore. The immutable Product ID is `com.takaakimailboxstar.cuescoreapps.pro`. Verified StoreKit 2 entitlement is the purchase authority.

The v1.0 launch territory is Japan only. The app and CueScore Pro In-App Purchase must both remain Japan only unless a later Product Owner decision expands availability.

## Deferred

- CSV import and export
- Automatic cloud sync
- Match Sharing
- Territories outside Japan

## Public Information

- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Support email: cuescore.apps@gmail.com
- Contact method: Email
- Contact form: Not included in Version 1.0

## Publication Controls

- App Store submission candidate: Version `1.0`, Build `77`
- App Review submission and public release require a separate Product Owner approval.
- StoreKit `Product.displayPrice` is the in-app price authority. Official documents must not hard-code a storefront price.
- Git history preserves the pre-monetization revision of this package.

## Revision History

| Revision | Date | Status | Summary | Approval |
|---|---|---|---|---|
| 1 | 2026-08-09 | Official Release | Initial App Store v1.0 package | CueScore Apps |
| 2 | 2026-09-20 | Official Release | Align Build 77 metadata and public documents with Free and Pro, StoreKit, and Japan-only launch | Product Owner Decision `CUESCORE-V1-FINAL-SUBMISSION-FIX-JP-20260920` |
