# CueScore Apps App Review Notes v1.0 Official

- Document owner: CueScore Apps
- Status: Official Release
- Version: 1.0 Revision 2
- Revised: 2026-09-20
- Approval: Product Owner Decision `CUESCORE-V1-FINAL-SUBMISSION-FIX-JP-20260920`

## Purpose

This document is the authoritative text for the App Store Connect App Review Notes field for CueScore Apps Version 1.0 Build 77.

## App Review Notes

CueScore Apps is an iPhone billiards match scoring, history, player management, and analytics app. No CueScore account or sign-in is required.

Core match entry, local history viewing, and basic statistics work offline. In-App Purchase product loading, purchase, and restore require access to the App Store. User-created match and player data is stored locally on the device in Version 1.0. Automatic cloud sync and CSV import or export are not included.

Version 1.0 includes one In-App Purchase:
- Product name: CueScore Pro
- Product ID: com.takaakimailboxstar.cuescoreapps.pro
- Type: Non-Consumable

Free users can use all six match workflows and can view the newest 20 saved matches across all disciplines. Older matches remain stored and are not deleted. CueScore Pro unlocks all saved history, personal bests, detailed analytics and trends, opponent-specific review, Backup, and Restore.

Supported disciplines:
- Rotation
- 9 Ball
- 10 Ball
- JPA 9 Ball
- Straight Pool (14.1)
- Three Cushion (3C)

Suggested free review path:
1. Launch CueScore Apps.
2. Open “プレーヤー” (Players) from the bottom navigation and register two players.
3. Return to “ホーム” (Home), select a discipline, and complete a match.
4. Confirm the saved result in “履歴” (History) and open Match Detail.

Suggested In-App Purchase review path:
1. Open “設定” (Settings).
2. Select “Proを購入・購入を復元” while Free, or “購入・復元について” if the entitlement is already active.
3. Wait for the StoreKit-provided price to load, then select “Proを購入”.
4. After a verified purchase, confirm Settings shows “CueScore Pro ✓” and Backup and Restore are available.
5. Select “購入を復元” to review restore behavior.

The app does not use an external purchase method. Purchase authority and entitlement verification use StoreKit 2. Player photos are optional and are used only for player identification within the app.

Public pages and support contact:
- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Support email: cuescore.apps@gmail.com

## Submission Controls

- Sign-in required: `No`
- Release option: `Manually release this version`
- App availability: Japan only
- App Store version: `1.0`
- Build: `77`
- Initial CueScore Pro In-App Purchase must be included in the same review submission draft as Version 1.0.
- The fixed storefront price is not written in Review Notes. StoreKit and the Apple purchase sheet remain authoritative.

## Revision History

| Revision | Date | Status | Summary | Approval |
|---|---|---|---|---|
| 1 | 2026-08-09 | Official Release | Initial pre-monetization review notes | CueScore Apps |
| 2 | 2026-09-20 | Official Release | Replace Build 21 and no-purchase guidance with Build 77 Free and Pro review paths | Product Owner Decision `CUESCORE-V1-FINAL-SUBMISSION-FIX-JP-20260920` |
