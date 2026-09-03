# CueScore Build 55 Player Editor Actions

Date: 2026-09-03

## 修正内容

- プレーヤー登録／編集／アバター選択の操作footerが、iPhone WebViewで常設Bottom Navigationの下へ押し出される問題を修正。
- プレーヤーeditorとavatar chooserを`100dvh`の全画面ownerに統一し、表示中はBottom Navigationを非表示化。
- 登録画面は`キャンセル／登録`、編集画面は`キャンセル／変更`の2操作を下端へ固定。
- Avatar chooserの`この画像に決定`をsafe area内へ固定し、chooser終了時のbody stateも確実に解除。
- Player、Match、保存schema、競技ルール、分析、履歴、Backup／Restoreは変更していない。

## 検証・配布

- 全Node回帰test: `359 pass / 0 fail / 0 skipped`。
- native web生成、Capacitor iOS同期、Version `1.0`／Build `55`の署名付きRelease Archive／IPA export成功。
- source/archive commit: `42825a7`（UI修正commit `61e6ea5`）。
- `main`へpush済み。
- Xcode `TestFlight Internal Only`で`App 1.0 (55) uploaded`を確認。Upload時刻は2026-09-03 21:07 JST、Delivery UUIDは`33855546-8d97-4c55-b858-c0218f2a45f4`。
- Apple upload受付後の状態は`Uploaded package is processing`。個人APIキーはAppleから401を返したため、保存済みXcode account sessionでuploadを完遂した。
- 実iPhone受入はpending。プレーヤー登録、avatar決定、プレーヤー編集の3導線をBuild 55で確認するまで実機PASS扱いにしない。
- External TestFlight、App Review、審査用build追加、一般公開は行っていない。
