# CueScore Build 76 Settings Scroll Lock

- Decision ID: `CUESCORE-B76-SETTINGS-SCROLL-LOCK-20260919`
- Date: 2026-09-19
- Baseline: `92612531287877320270633efabcb1b2d516d103`
- Version / Build: `1.0 (76)`

## Minimal fix

Build 75で全項目は1画面内に収まったが、Settingsのscroll ownerが`overflow-y:auto`とmomentum scrollを保持していたため、実機では内容がなくても上下スワイプ時に動いた。390×844を含むcompact fit範囲だけ、同じscroll ownerを`overflow-y:hidden`、`overscroll-behavior:none`、`-webkit-overflow-scrolling:auto`へ変更した。

小さい高さでは既存の`overflow-y:auto`を残す。row、section spacing、Privacy／copyright／bottom nav、タップ操作、課金、Pro、保存data、navigationは変更していない。

## Evidence

- 390×844でSettings全項目、Privacy、copyright、bottom navを表示
- 上下スワイプ相当操作の前後で表示位置不変
- Settings focused: `19 pass / 0 fail`
- Full Node: `428 pass / 0 fail / 0 skipped`
- Release Simulator: `BUILD SUCCEEDED`
- Device Archive: `ARCHIVE SUCCEEDED`
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.0 (76)` / `.storekit` 0件
- CSS SHA-256: `24c472291e0e61137e7dd483e88474bafcdead38d2e10011557efc43051dbf9b`（source／iOS copied／Archive一致）
- `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm 8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`

## Distribution

GitHub main／App Store Connect／Internal TestFlight反映は進行中。
