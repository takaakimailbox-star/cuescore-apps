# CueScore Build 75 Settings Spacing Polish

- Decision ID: `CUESCORE-B75-SETTINGS-SPACING-POLISH-20260919`
- Date: 2026-09-19
- Baseline: `0d001743c922ae055791307bf95c88a6434c7576`
- Version / Build: `1.0 (75)`

## Minimal visual change

Build 74の全項目fitを維持し、compact iPhone条件で0pxだったSettings spacerを40pxの固定／制限spacingへ変更した。さらにtitle→Plan、Plan→Data、footer周辺へ小さな固定余白を分配し、Plan／Data Management／CueScore情報／法務の4ブロックを視覚的に分離した。Data row 63px、legal row 44px、plan action 44pxは維持。課金、entitlement、保存data、navigation、bottom navは変更していない。

## Visual and geometry evidence

- Viewport: `390×844`
- Build 74: Privacy bottom `586.5px`、nav top `776px`、余裕`189.5px`、spacer 0px
- Build 75: Privacy bottom `678.5px`、nav top `776px`、余裕`97.5px`、spacer 40px
- Acceptance: `678.5 <= 776 - 60`
- Copyright: top `678.5px`／bottom `699px`、Privacy／bottom navと非重複
- vertical overflowなし、horizontal overflowなし、initial scrollTop 0
- Pro／Free／Unknown表示契約を維持

Build 74とBuild 75を同じ390×844のfixed bottom nav込みで比較し、Build 75ではrowを変えずsection間の窮屈感が軽減したことを確認した。

## Test / build evidence

- Settings focused: `44 pass / 0 fail`
- Full Node: `425 pass / 0 fail / 0 skipped`
- Release Simulator build: `BUILD SUCCEEDED`
- Device Archive: `ARCHIVE SUCCEEDED`
- Archive: `com.takaakimailboxstar.cuescoreapps` / `1.0 (75)` / `.storekit` 0件
- CSS SHA-256: `33164b4c3a350812a44d561d860e7ef71061b1fe698beed368cebb189eeee61a`（source／iOS copied／Archive一致）
- HTML SHA-256: `859cb8362c528b3e1fc2b2670a18a0942c1600df9ed2150175519de897fd4c34`（source／iOS copied／Archive一致）

## Dependency reproducibility

- `ion-ios-filesystem 1.1.2` / `0d81e26e828ff9582807e2339112cedf2e0fab85`
- `capacitor-swift-pm 8.0.2` / `13a39179b3df796f3bb2e70c47ccdd92593f34d2`
- Repository `Package.resolved`とArchive build checkout一致
- Fixed flags: `-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`、`-skipPackageUpdates`

## Distribution

GitHub main／App Store Connect／Internal TestFlight反映は進行中。完了後にBuild ID、processing、encryption、internal groupを追記する。
