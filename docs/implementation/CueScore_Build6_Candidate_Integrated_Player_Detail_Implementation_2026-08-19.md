# CueScore Build 6 Candidate — Integrated Player Detail Implementation

更新日：2026-08-19（JST）  
状態：source実装・自動検証完了／配布未承認

## 実装範囲

Player DetailとPlayer Analysisを単一画面へ統合した。既存Player Detail rendererの最終出力だけをBuild 6統合rendererで置き換え、Player選択・編集・削除、競技切替、履歴、Rival、Match Detailの既存runtime contextを維持した。

分析値は`analytics-build4-metrics.js`を再利用し、ブレイクイン率、新マス割り率、平均ファール、自己ベストのeligible契約を変更していない。推移chartも既存Build 4 chart rendererを利用する。

初期表示は自己ベスト3件、最近の試合2件、推移chart非表示。各操作で同一画面内展開し、自己ベストと最近の試合は記録元Match Detailを開く。

## 非変更

Player／Match／Backup／event schema、保存key、Undo、正式競技ルール、既存マス割り判定、Build Numberは変更していない。Archive、Validate、TestFlight upload、App Review、一般公開は実施していない。

## 検証結果

- 全自動テスト：`186 pass / 0 fail / 0 skipped`。
- 新規Build 6統合契約テスト：asset順序、8セクション、6競技指標、既存derived metric再利用、Match Detailリンク、初期3件／2件と展開、390px portraitを確認。
- Native assets：source／`native-web`／Xcode copied `public`の`index.html`、Build 6 JS、Build 6 CSSについてSHA-256一致。
- iOS Simulator Debug：`BUILD SUCCEEDED`。
- iOS Simulator Release：`BUILD SUCCEEDED`。
- `git diff --check`：問題なし。
- Marketing Versionは`1.0`、Build Numberは既存`5`のまま。Build 6は作成していない。
