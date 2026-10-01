# CueScore Apps 1.2 (81) — Player UX Finalization Evidence

**Date:** 2026-10-01
**GitHub baseline:** `039b966cdcdc2fbdcf20644ff49a0815ef0098e8`
**Gate:** Implementation / Test / Visual / Physical RC refresh
**Distribution:** Not started in this Gate

## Implemented contract

- Player管理一覧を`Main → 最新の完了試合日時 descending → registry index`へ統一した。
- 同順位のPlayerと完了試合がないPlayerはregistry配列上の登録順を維持する。UUID、Player ID、名前、`updatedAt`、`lastUsed`はtie-breakerへ使用しない。
- registry自体は並べ替えず、新しい保存field、migration、schema変更はない。Backup / RestoreのPlayer array orderをregistration orderとして使用する。
- Player Deleteのsystem `confirm()`を廃止し、CueScore custom `alertdialog`の`キャンセル / 削除`へ置換した。
- Player Delete成功／BLOCKをPlayer専用Notification Cardへ統一した。白いneutral surface、Title / Body縦stack、semantic icon、長文wrapを使用し、既存全体toastは変更していない。
- Player row wrapper reorder、row / edit 1:1、blank row 0、orphan pencil 0と、actual scroll ownerの`68px + 18px + safe area`を維持した。
- Player Delete / Identity、historical Match、same-name identity、Analytics / VS、in-progress protection、Match Sharingの保存contractは変更していない。

## Automated verification

- Player UX / Delete / Bottom Navigation dedicated: `26/26 PASS`。
- Player、Player Delete、Match Sharing、Navigation focused: `135/135 PASS`。
- Match Sharing focused: `109/109 PASS`（上記focused内でfresh実行）。
- Full Node: `593/593 PASS`、FAIL `0`、SKIPPED `0`。
- Native foundation: Full Node内でPASS。
- `git diff --check`: PASS。

旧「名前順」固定の2 testsを正式Decisionへ同期した。製品FAILではなく、旧期待値の更新である。

## 390×844 Visual

`outputs/player-ux-finalization/Visual_Audit.json`および8枚のPNGを保存した。

- 11 Players正式順：PASS。
- 試合なし`テストc → テストd → テストe → テストf`：registration order PASS。
- `テストf`へ最新完了Match追加後の移動：PASS。
- final Player bottom `757`、Navigation top `776`、gap `19pt`、edit target `44×56`。
- Delete confirmation：`キャンセル / 削除`、width `320pt`、horizontal overflow 0。
- Success Notification：x `16`、width `358`、height `72.44`、Title / Body overlap 0。
- Blocked Notification：x `16`、width `358`、height `110.13`、本文3行wrap、overlap 0、horizontal overflow 0。
- 大きい緑／赤surfaceは使用していない。
- 既存History監査はfinal Match bottom `753`、Navigation top `776`、gap `23pt`、scroll stableを維持する。

## Native / Simulator

- 正式native sync：source → native-web → Capacitor iOS public。
- `index.html` SHA-256（source / native-web / iOS public / built Simulator）：`85b02db042816ca38fa577ba1e5a4c94f364fba6a2c494dd03a7bc866f3bda3b`。
- `player-library-order-v1.js` SHA-256（同4者）：`99b7d09bff720ee9e47cf67f839886957c01a3691a5df9741343017e04fc463f`。
- Release Simulator Build：PASS。
- Artifact：Bundle ID `com.takaakimailboxstar.cuescoreapps`、Version `1.2`、Build `81`、`.storekit` 0。

## Physical RC refresh

- Device：physical iPhone 16e。
- Display Name：`CueScore RC 1.2`。
- Bundle ID：`com.takaakimailboxstar.cuescoreapps.rc12`。
- Installed identity：Version `1.2`、Build `81`。
- Debug device Build / sign / overwrite install：PASS。
- executable SHA-256：`c0345b3ff720b410bf72c3578da392ba5967bbd016a1e6d7e1d912e0efbb5623`。
- built RC `index.html` SHA-256：`85b02db042816ca38fa577ba1e5a4c94f364fba6a2c494dd03a7bc866f3bda3b`。
- `.storekit` 0。
- uninstallなし。RC LocalStorage database SHA-256は上書き前後とも`948852ef207e003746f00f4fee0286d13a742dcc5b7a646d7dcae8967a139b0e`で一致した。
- 公開`com.takaakimailboxstar.cuescoreapps` containerへ操作していない。

## Status / Boundary

- Player Delete / Identity：Product Owner Physical PASS済み。
- Player List Bottom Navigation：Product Owner Physical PASS済み。
- Player row integrity：Product Owner報告範囲でPhysical PASS済み。
- New sort / custom confirmation / success／blocked Notification Card：Product Owner Physical PASS。
- 後続のResume Match modal yellow focus fixは別Evidence `CueScore_1.2_Build81_Resume_Match_Modal_Focus_Fix_2026-10-01.md`で管理し、Product Owner physical re-test pending。
- commit / pushなし。Build 82、Archive、TestFlight、App Store Connect操作なし。
