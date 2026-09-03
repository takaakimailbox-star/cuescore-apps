# CueScore Build 53 Original Player Trends Restore

Date: 2026-09-03

## 実機報告と原因

- Build 52のPlayer Hub分析タブへ直接置いたselector式グラフは、従来採用していた表示方式と異なっていた。
- Git履歴を監査し、従来仕様は分析タブの「推移」rowから開く専用full-screen pageであることを確認した。

## 修正

- 「プレーヤー情報 → 分析」に「推移／主要指標をグラフで見る」の入口を復元。
- `pd12Trends`専用画面を復元し、競技名付きheader、左上Back、縦scrollを復元。
- 勝率と競技別主要指標を1指標1cardで縦に並べ、保存済み対象試合を古い順に累積集計して描画。
- graph pointの日付／値表示を復元。
- ファール率／ファール平均はmetric order、label、画面から除外したまま維持。
- Build 52の埋め込みselector式Player Hub graphを撤去。
- cache version `2.0-build53-original-trends`、iOS Build 53。

## 検証・配布

- 全Node回帰test: `355 pass / 0 fail / 0 skipped`
- native web生成、Capacitor iOS同期、署名付きRelease Archive、IPA export成功。
- source/archive commit: `cb5e8e9cf7af7914a29a6927928f72076148e070`
- Delivery / Build ID: `3abc24da-d454-43ca-b5e5-9e6c4cc26b2a`
- Apple processing / import: `VALID`
- `usesNonExemptEncryption=false`
- Internal group `CueScore Internal Testers`は全Build自動アクセスで、Build 53の配布対象化をAPIで確認。
- External TestFlight、App Review、審査用build追加、一般公開は行わない。
