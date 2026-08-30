# CueScore Apps — Navigation Architecture Phase 1 / Build 21 Implementation Record

Date: 2026-08-30  
Status: Phase 1 implementation, Internal TestFlight distribution, and Product Owner physical iPhone confirmation PASS

## 1. Adopted scope

- Formalized Product Architecture v2.0, Navigation Architecture Decision/Spec, compact discipline-history Decision/Spec, and Decision Log v2.2 Decision 027.
- Implemented only Phase 1 Navigation Shell plus the separately adopted compact fixed-discipline history card.
- Stopped before Phase 2. App Store Review, external TestFlight, public release, pricing, and territory changes were outside scope and were not performed.

## 2. Implementation

- Added one common Normal Mode bottom navigation with exactly four tabs: `ホーム／プレーヤー／履歴／設定`.
- Added root retap behavior, per-tab runtime snapshot/restore, and cross-tab Match Detail close behavior.
- Hid the navigation shell in Match Mode and preserved the existing Game Result exit-to-Home flow.
- Preserved active-match restore behavior after reload/full termination.
- Changed the Player root title to `プレーヤー` without changing player data behavior.
- Compressed fixed-discipline history cards through padding and row-gap only. Browser measurement at 390×844 was 98px; text, avatar, score, chevron, tap target, and Match Detail Race to remained intact.
- Added the new source assets to the native-web build list, iOS copied bundle, and service-worker cache.

## 3. Compatibility boundary

No change was made to scoring, winner determination, Player ID/Match ID, saved-data schema, Race to, Backup/Restore, analytics formulas, aggregate SSOT, discipline rules, Break Input, or 14-1 rerack behavior. Practice remains deferred and is not displayed as a tab.

## 4. Automated verification

- Baseline before implementation: `265 pass / 0 fail / 0 skipped`.
- Final: `276 pass / 0 fail / 0 skipped`.
- Added navigation-shell and compact-card contract/regression coverage.
- Native build and Capacitor iOS sync completed.
- Source/native-web/iOS copied hashes matched for `index.html`, navigation JS/CSS, and the existing UI JS/CSS assets.

## 5. 390×844 browser verification

- Viewport/document/body width: 390px; horizontal overflow: 0.
- Home, Player root/detail, History, Match Detail, Settings, and Data Management navigation: PASS.
- Cross-tab Match Detail close, Player deep-state restore, selected-tab root retap: PASS.
- Match Mode common navigation hidden: PASS.
- Reload/full-termination proxy restored Home and the active-match resume entry: PASS.
- Fixed-discipline card: 370px wide, 98px high, opponent name retained, `vs` absent, card Race to absent, score and chevron retained: PASS.
- Browser console errors: 0.
- Game Result exit-to-Home is covered by automated regression/contract tests; a destructive manual scoring completion was not performed against the retained browser fixture.

## 6. Native and distribution verification

- Marketing Version: `1.0`.
- Build Number: `21` (Build 20 was the latest previously used number).
- iOS Simulator Debug: `BUILD SUCCEEDED`.
- iOS Simulator Release: `BUILD SUCCEEDED`.
- Signed Release Archive: `ARCHIVE SUCCEEDED`.
- Xcode distribution: `Upload for TestFlight (Internal Testing Only)`; result `App 1.0 (21) uploaded`.
- App Store Connect processing: complete.
- Export compliance: saved as `上記のアルゴリズムのどれでもない`.
- Internal group: `CueScore Internal Testers`, invitation count 1.
- App Store Connect status: `テスト中`.
- Product Owner completed the physical iPhone confirmation and reported `PASS` on 2026-08-30.

## 7. Official records

- `docs/official/07_CueScore_Official_Design_Decision_Log_v2.2_Official_Release.docx`
- `docs/official/66_CueScore_Product_Architecture_v2.0_Navigation_Information_Architecture_Official_Release.md`
- `docs/official/67_CueScore_v1.x_Navigation_Architecture_Decision.md`
- `docs/official/68_CueScore_v1.x_Navigation_Information_Architecture_Spec.md`
- `docs/official/69_CueScore_v1.0_Compact_Discipline_History_Card_Decision.md`
- `docs/official/70_CueScore_v1.0_Compact_Discipline_History_Card_Spec.md`

## 8. Product Owner confirmation

The Product Owner confirmed TestFlight Build 21 on the physical iPhone and reported `PASS` on 2026-08-30. This closes the Phase 1 physical-device gate. Phase 2 and App Store Review remain separate gates and were not started.
