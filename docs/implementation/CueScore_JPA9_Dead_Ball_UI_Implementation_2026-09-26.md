# CueScore JPA 9-Ball Dead Ball UI Implementation Evidence

**Date:** 2026-09-26
**GitHub main read-back:** `70f48670ee84687e41483d06708f394e6ab258d8`
**Local release-close baseline:** `a318a7588093a715913d1e69f10ccf681ccab0c8`（GitHub mainの直接の子、v1.0公開記録だけのdocumentation commit）
**Official:** Decision 99 / Spec 100
**Gate:** `IMPLEMENTATION COMPLETE — TEST / BUILD / VISUAL PASS — PRODUCT OWNER ACCEPTED — UNRELEASED`

## Conclusion

Product Owner承認済みPrototypeをJPA 9-Ballへ実装した。試合累計Deadを`ラック ｜ イニング ｜ デッド`で常時表示し、通常Dead、break scratch／break foul同時入球、通常foul同時入球をUndo-awareな既存eventから導出する。保存schema、Analytics式、他5競技、公開済みVersion 1.0 Build 78は変更していない。

作業開始時のlocal branchはGitHub main `70f4867`の直接の子`a318a75`で、差分はv1.0 App Store公開記録だけだった。製品source差分は0件であり、最新GitHub製品sourceと公開後documentationを両方保持したまま実装した。

## Implementation

- `jpaDeadBallEntriesV1()`は`ball_dead`と`break_result.data.deadBalls`だけを1〜8番へ正規化し、event identity＋球番号で同一event内の重複を除外する。
- summary countはrack-localな`deadBallsV1`ではなく、現在有効な`commonEventsV7`から毎回再計算する。Undoと中断復元後も新しい保存fieldなしで一致する。
- JPA break foulではポケットされた1〜8番を`deadBalls`へ入れ、得点球から除外する。dry scratchは空配列。9番は明示的に除外する。
- live historyとMatch Detailは通常Deadとbreak/foul Deadの両方を共通`jpaDeadBallHtmlV1()`へ渡し、公開Build 78の`CueScoreBallIcon.html(..., {size:"history", state:"used"})`をそのまま使う。
- `DEAD`／`デッド`文字、badge、×印、新しいopacity／filter／saturation／brightness／sizeは追加していない。`B ③ F /`、`③ F`、`B F /`の順序と既存layoutを維持する。
- 9-Ball、10-Ball、Rotation、14-1、3 Cushionではsummaryをhiddenのままにする。

## Required-case verification

| Case | Result |
| --- | --- |
| 通常Dead 1球／複数 | PASS |
| break scratch＋③／複数入球 | PASS |
| 入球なしbreak scratch | PASS / Dead 0 |
| 通常foul＋③ | PASS / Dead 1、Foul flagは非加算 |
| 9番＋scratch | PASS / 9番はDead 0 |
| Undo／Undo後再入力 | PASS |
| 中断保存／復元 | PASS |
| 通常Deadとbreak DeadのHTML visual | PASS / 共通`state="used"` |
| 二重加算防止 | PASS |
| JPA完了、History／Match Detail | PASS |
| Backup／Restore | PASS |
| 他5競技 | PASS / Dead summaryなし |

## Automated tests

- Dead implementation dedicated: `16 pass / 0 fail / 0 skipped`。
- JPA／Dead／Undo／in-progress／History／Match Detail／Backup focused: `58 pass / 0 fail / 0 skipped`。
- 全Node regression: `459 pass / 0 fail / 0 skipped`。
- `git diff --check`: PASS。

最初の全Node実行ではnative copied assetがsource更新前だったため`native-ios-foundation` 1件がFAILした。正式`build-native-web`＋Capacitor sync後、source／`native-web`／`ios/App/App/public`の`index.html` SHA-256がすべて`07d8a0b211865a2dfd0fe59f59aad3637cf1d70662b7f75f181e47050471d226`で一致し、全459件を再実行してPASSした。製品ロジックFAILではない。

## Release Simulator build

- Xcode 27 / iOS Simulator 27.0 SDK / Release: `BUILD SUCCEEDED`。
- Fixed dependency flags: `-skipPackageUpdates`、`-onlyUsePackageVersionsFromResolvedFile`、`-disableAutomaticPackageResolution`。
- `capacitor-swift-pm 8.0.2` / revision `13a39179b3df796f3bb2e70c47ccdd92593f34d2`。
- `ion-ios-filesystem 1.1.2` / revision `0d81e26e828ff9582807e2339112cedf2e0fab85`。
- `Package.resolved` SHA-256: `1e68bbcd65eea223108220becced97a2d9eb05c79aaaa88e6f879078b8a6a0aa`（Build 78固定identityと一致）。
- Artifact identity: `com.takaakimailboxstar.cuescoreapps` / Version `1.0` / Build `78`。Build番号は更新していない。
- Simulator artifact内`.storekit`: 0件。

`App`という共有schemeは存在しないため最初のscheme指定はcommand configuration errorとなり、target-onlyのmanual-order buildはSwiftPM module resolutionで失敗した。既存の共有schemeとBuild 78固定dependency手順へ戻した正式Release Simulator buildはPASSした。これらは最終製品Build failureとして扱わない。

## 390×844 visual audit

- CSS viewport: `390×844`、device scale factor 3。Evidence PNGは`1170×2532`。
- Runtime read-back: `dead=4`、summary visible、history内`state="used"`球4個。
- summaryは`ラック 2 ｜ イニング 3 ｜ デッド 4`を1行で表示し、横overflowなし。
- 通常Dead、break scratch Dead、複数Deadが同じ既存gray `state="used"`球で表示され、通常得点球④は元の色を保持する。
- ball gridと5操作buttonの既存tap areaを縮小していない。
- Evidence: `docs/implementation/evidence/jpa9-dead-ball-ui-implementation-2026-09-26/390x844-jpa-dead-cumulative-and-history.png`。
- PNG SHA-256: `e0604602c5d4d4d85e98a20bee9bf36b3b4f15055b8daa9da0520679d148182f`。

## Boundary

- 保存schema migration: 0。
- Build 79、新Archive、TestFlight Upload、App Store Connect変更、Version 1.1作成: 0。
- 公開済みBuild 78: unchanged。
- Product Owner Acceptance: PASS。Implementation／Test／Visual Evidenceを正式受入。
- commit / push: Acceptance Gateで実施。実装は未配布。
