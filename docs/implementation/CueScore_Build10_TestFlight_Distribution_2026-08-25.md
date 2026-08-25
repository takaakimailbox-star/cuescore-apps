# CueScore Apps — TestFlight Build 10 Internal Distribution Record

Date: 2026-08-25 (JST)  
Status: Internal TestFlight distribution PASS / physical-iPhone verification pending

## Final report

1. **開始時local HEAD** — `8fa7ab5ade357a956be7999288f6e6d789d575cd`。
2. **開始時origin/main** — `8fa7ab5ade357a956be7999288f6e6d789d575cd`。
3. **開始時worktree** — clean、branch `main`、local／remote一致。
4. **採用範囲** — Player情報、競技詳細、主要指標、指標別推移、自己ベスト、簡潔な対戦相手別成績、競技固定の全試合、Match Detail。
5. **延期範囲** — Match Analysis、Analysis Home、旧Player Analysis、深いRival Analysis、高度な分析をv1通常導線から除外。
6. **互換性** — 延期範囲のコードと既存recordは削除せず保持。schema変更なし。
7. **試合カード** — 競技固定の全試合では可視操作を`詳細`だけにし、`分析`はhidden／aria-hidden／tab順外。
8. **対戦相手別成績** — 相手、試合数、勝敗、勝率、直近結果を維持し、深いRivalへの行タップを除外。
9. **Y軸** — 割合指標に`100% / 75% / 50% / 25% / 0%`を表示。
10. **X軸** — `M/D`を表示し、同日複数試合は`M/D·1`、`M/D·2`で識別。
11. **point callout** — 点はfocus可能で、選択時に日付／試合識別と正確な表示値を提示。
12. **表示精度** — 通常rate小数1桁、ファール率小数2桁を維持。欠損を0へ変換しない。
13. **自動テスト** — `220 pass / 0 fail / 0 skipped`。
14. **追加回帰テスト** — `tests/analytics-v1-scope-trend-axis.test.mjs`で範囲、軸、同日識別、callout、互換保持を固定。
15. **native同期** — `scripts/build-native-web.mjs`と`cap sync ios`を完了。
16. **asset整合** — source／`native-web`／Xcode copiedの`index.html`、`analysis-build4.js`、`player-detail-build6.js`が各々SHA-256一致。
17. **index SHA-256** — `f7c5477cae69d8b603f5f4e82de709b4f8d105a9fca21024f622a5752dc7de01`。
18. **analytics SHA-256** — `b66bc1c1aa7c8fd2d840cacc62f2d24240da6809dea3107170f37b35b10b6c37`。
19. **Player Detail SHA-256** — `492996cdd3426717d0eedd67afd971abc9647a7f593ffbd645233ec57b7b7e9d`。
20. **Simulator Debug** — `BUILD SUCCEEDED`。
21. **Simulator Release** — `BUILD SUCCEEDED`。
22. **portrait確認** — iPhone Simulatorで起動し、Homeのportrait表示、6競技、Player／履歴／設定導線に欠け・横overflowがないことを目視PASS。
23. **確定source commit** — `b5b786c262214e9c7c03a097fe894fa8ed82f160`（`feat: finalize v1 analytics scope and trend axes`）。
24. **GitHub push** — 上記commitを`origin/main`へpushし、Archive前にlocal／remote一致を確認。
25. **Build情報** — Marketing Version `1.0`／Build Number `10`。Build `1`〜`10`は再利用しない。
26. **Signed Archive** — PASS。`/Users/Ludique/Library/Developer/Xcode/Archives/2026-08-25/CueScore Build 10.xcarchive`、arm64、Bundle ID `com.takaakimailboxstar.cuescoreapps`。
27. **Validate** — Xcode Organizerで`App 1.0 (10) validated`、全validation checks PASS。
28. **Upload／Apple処理** — Xcode Organizerの`TestFlight Internal Only`で`App 1.0 (10) uploaded`。App Store Connectアップロード日`2026年8月25日 22:29` JST、処理完了。
29. **輸出コンプライアンス／内部グループ** — 既存正式回答「上記のアルゴリズムのどれでもない」を保存。既存`CueScore Internal Testers`にBuild 10が含まれ、状態`テスト中`、グループ表示`10個のビルド`を確認。
30. **停止境界／残件** — 実iPhone確認はpending。App Store Review、外部TestFlight、一般公開、価格／地域変更は未実施。次はProduct OwnerがTestFlight Build 10で通常導線、軸／callout、文脈復帰、既存主要機能を確認する。
