# CueScore v1.0 — Global Back / App Icon Specification

- Status: Official Specification
- Adopted: 2026-08-27
- Approval: Product Owner
- Implements: Official Decision 050

## Global Back Contract

- `touchstart`が表示中Back control自身から始まった場合、edge Swipe Back trackingを開始しない。WebKitのclick生成までBack controlをhit-test可能に保つ。
- edge gestureは画面左端のBack control外から開始し、成立時だけ表示中Back controlの`click()`を呼ぶ。
- tapは`cueBackSource="tap"`、swipeは`cueBackSource="swipe"`として同じhandlerへ入り、origin restore処理を分岐させない。
- Player情報、競技詳細、対戦相手別成績、相手固定履歴、Player履歴、Match Detail、全画面推移、Player起点分析を共通対象に含める。
- Settings、Data Management、Records、Player一覧等の既存共通対象を維持する。
- active scoring画面、確認dialog、avatar chooser等は既存の誤操作防止／modal close契約を維持し、無条件のedge exitへ変更しない。

## Hit Area / Layering

- full-screen pageの左上Backは48×48px基準、最低44×44pxとする。
- `touch-action: manipulation`を使用できるが、直接tap中にancestorへ`pointer-events:none`を設定しない。
- header、overlay、transparent layerはBack controlより上でhit-testを奪わない。
- scroll位置によらずheader Backを固定のhandlerへ接続する。

## App Icon SSOT / Generation

- Web manifest: `icons/cuescore-app-icon-192.png`／`icons/cuescore-app-icon-512.png`。
- HTML apple-touch-icon: `icons/cuescore-app-icon-180.png`。
- iOS Asset Catalog source: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`。
- iOS sourceは`icons/cuescore-app-icon-512.png`を1024×1024へ高品質resizeし、alphaを持たないRGB PNGとして保存する。
- Xcode targetの`ASSETCATALOG_COMPILER_APPICON_NAME`は`AppIcon`を維持する。
- Archiveの`Assets.car`／App bundle iconを確認し、TestFlight実iPhoneで正式CueScore iconを目視再確認する。

## Compatibility

Navigation originとicon assetだけを変更する。Player／Match record、localStorage key、Backup payload、計算結果、公開配信設定は変更しない。
