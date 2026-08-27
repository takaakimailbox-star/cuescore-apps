# CueScore v1.0 — 全ページBack総監査／iOS App Icon不一致 調査・実装記録

- Date: 2026-08-27
- Base: `f3a975989d7c30a852726271599ae83dbcd7cf39` (`origin/main`)
- Scope: Global Back contract、iOS AppIcon、tests、documentation

## Confirmed root causes

### Back tap

共通edge Backは左端64px以内の全`touchstart`で即座に`cue-edge-back-tracking-v3`を付与し、`.app`へ`pointer-events:none`を設定していた。左上Back自体もこの範囲にあるため、実iPhone WebKitでは指を離す前にtap targetがhit-test対象から外れ、生成予定の`click`が失効し得た。edge Swipeはgesture完了時に`backButton.click()`を直接呼ぶため正常に戻れ、報告された「tapは反応しないがSwipeは戻る」と一致する。

画面によって症状差があった理由は、`.app`内の既存画面と、`document.body`直下へ追加されたPlayer journey overlay等でlayer構成が異なるためである。handler未登録やrestore origin欠損を共通原因とは判定していない。

### iOS App Icon

Web/PWAは正式CueScoreの黒いCマークを`icons/cuescore-app-icon-{180,192,512}.png`から参照していた。一方、iOS Asset CatalogはCapacitor native foundation導入時の青い交差線template icon（SHA-256 `29e4777e...`）を`AppIcon-512@2x.png`として保持していた。Xcode targetは正しく`AppIcon`を参照していたため、Archive／TestFlightへ異なるtemplate iconが入る直接原因はAsset Catalog sourceそのものだった。build cacheだけの問題ではない。

## Back inventory / handler audit

| Screen / control | Tap handler / restore | Edge contract |
|---|---|---|
| Match setup `cueMatchSetupBackV3` | home restore | existing common target |
| Records `recordsBackV2` | home restore | existing common target |
| Player list / editor `playerLibraryBackBtn` | home or Player information | existing common target |
| Player information / discipline detail `playerStatsBackBtn` | Player list or information snapshot | existing common target |
| Opponent records / Player history `data-journey-back` | remembered Player／discipline／opponent origin | added to common target |
| Match Detail `recordDetailBackBtn` | remembered opponent-fixed or Player-history origin | existing common target |
| Full-screen trends `pd12-trends-back` | same discipline detail | added to common target |
| Player analysis `data-analysis-back` | current analysis origin | added to common target |
| Settings / Data / filter / rankings / classification / suite | existing parent screen | existing common target |
| active scoring／result confirmation／avatar and confirmation modal | explicit safety or modal-close handler | existing edge block retained |

All audited full-screen Back controls have 44px以上のtarget; shared full-screen controls are normalized to48px. Direct Back touch is now excluded beforeedge tracking changes pointer hit-testing. tap／swipe both continue to call each control’s existing handler.

## Changes

- Added one common selector string for Back pointer source, edge candidate lookup and direct-tap exclusion.
- Added Player journey, full-screen trends and Player analysis Back controls to the common edge target set.
- Added the missing full-screen controls to the 48px shared navigation-control contract.
- Replaced the Capacitor template AppIcon with a 1024×1024 opaque RGB derivative of the adopted 512px CueScore icon.
- Added regression tests for the direct-tap guard, common target coverage, Web／apple-touch／iOS icon references and exact iOS icon hash.

## Verification / pending

- 全自動テスト：`237 pass / 0 fail / 0 skipped`。
- native sync：source／`native-web/index.html`／`ios/App/App/public/index.html` SHA-256 `4de392cf6552bdcb4ddcfbf19b8e69c5b15613a523166031e219f5b71a597642`で一致。
- iOS AppIcon source：1024×1024 opaque RGB PNG、SHA-256 `49b2aa25427930af44eb9f4d90fe00265c0396fe3af6f81e8d05ef7571b072d3`。旧Capacitor template SHA-256 `29e4777e...`とは不一致。
- iOS Simulator Debug／Release：ともに`BUILD SUCCEEDED`。
- unsigned verification Archive：`/private/tmp/CueScoreGlobalBackIcon.xcarchive`、`ARCHIVE SUCCEEDED`。App bundleは`CFBundleIconFiles = AppIcon60x60`を参照し、compiled 120×120 icon（SHA-256 `6cc8d684...`）を展開・目視して正式CueScore Cマークを確認した。署名済み配布ArchiveやTestFlight uploadは本taskでは実施していない。
- Real iPhone direct tap、edge Swipe Back、long-press／first-tap behavior and TestFlight icon remain **pending** until Product Owner verification. They are not marked PASS.
- App Store Review、external TestFlight、public release were not performed.
