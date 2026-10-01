# CueScore Version 1.2 Build 81 — Player List Row Integrity Fix Evidence

- Date: 2026-10-01 JST
- GitHub baseline: `039b966cdcdc2fbdcf20644ff49a0815ef0098e8`
- Build 81 Product Source baseline: `79a031a0a656b3ea486dcf28a0def5a1243576ba`
- Gate result: `IMPLEMENTATION FIX COMPLETE / PHYSICAL RC REFRESH COMPLETE / PRODUCT OWNER RE-TEST REQUIRED`

## Product Owner physical result

- Player List Bottom Navigation overlap re-test: `PASS`。最下部までscroll可能、最後のPlayer全体がNavigationより上、scroll release後の戻りなしをProduct Ownerが確認した。
- New finding: 実Player名のrowsから鉛筆actionが消え、上部に名前なし／鉛筆のみのrowsが並ぶ。Player Delete physical verificationはSTOPした。

## Root cause and scope

- 通常rendererは1つの`.player-management-row-v1`内へ、同じPlayer IDの情報buttonと編集buttonを1組で生成していた。
- Build 12由来の`revisePlayerList()`がnested `[data-stats-player]`だけを並べ替え時にwrapper外へ移動していた。このため元wrapperは鉛筆だけ、移動後の情報buttonは名前だけになった。
- RC storageには7 Playerすべてに名前とIDが存在し、空Playerは0。Bundle ID分岐、RC override、migrationによるdata分裂ではない。
- Bottom Navigation fixはscroll owner／bottom inset／scroll stateだけを変更しており、このrenderer分離はそれ以前から存在した製品共通regression。分類は`B — Build 81以前から存在した別regression`。

## Fix

- `revisePlayerList()`の並べ替え単位をnested情報buttonからdirect childの`.player-management-row-v1`へ変更した。
- 各wrapper内の情報buttonと編集buttonを同じPlayer IDのまま一緒に移動する。
- PWA/cache identityを`2.0-build81-player-list-row-integrity-v1`へ更新し、変更した`ui-revision-v12.js`とsample-dataのapp-shell queryを同期した。独立したNavigation等の既存asset identityは維持した。
- Player Delete、Player identity、schema、storage、Match Sharing、Bottom Navigation geometryは変更していない。

## Automated and visual verification

- Player List / Navigation focused: `20/20 PASS`。
- Player Delete dedicated: `11/11 PASS`。
- Match Sharing focused: `109/109 PASS`。
- Combined focused: `140/140 PASS`。
- Native foundation: `6/6 PASS`。
- Full Node: `584/584 PASS`, FAIL 0, SKIPPED 0（前回583件＋row integrity contract 1件）。
- 390×844 Visual: 0／1／7／12 Playersでrow／info／edit数が一致、blank row 0、orphan control 0。検索後もPlayer ID対応1:1。
- 12 Players: final row／edit bottom `757`、Navigation top `776`、gap `19pt`、edit target `44×56`、scroll release movement 0。
- final edit actionはPlayer IDとPlayer名が一致する`プレーヤー編集`を開く。
- History 12件: final Match bottom `753`、Navigation top `776`、gap `23pt`、scroll stable。
- Home／Player／History／Settings: Bottom Navigationとhorizontal overflowの回帰なし。
- Evidence: `outputs/player-list-bottom-navigation/Visual_Audit.json`、`Player_7_Normal_390x844.png`、`Player_12_Final_390x844.png`、`Player_12_Final_Edit_390x844.png`。

## Native / Simulator / Physical RC

- Formal native sync: source → native-web → iOS public。`index.html` SHA-256は3者とも`4d83373663617faa2824904420ef42f62da703fcaf9df349382b61124c1b12d6`、`ui-revision-v12.js`は`5047cb8bf086521238d0e753331a09d26918ac18f38f0d116a82412c4247b572`。
- Release Simulator Build: `PASS`。Bundle ID `com.takaakimailboxstar.cuescoreapps`、Version `1.2`、Build `81`、built `.storekit` 0。
- Physical RC: BUILD／SIGN／overwrite INSTALL `PASS`。Display Name `CueScore RC 1.2`、Bundle ID `com.takaakimailboxstar.cuescoreapps.rc12`、Version `1.2 (81)`、built `.storekit` 0。
- RC executable SHA-256: `d32acfbdf46477752f15ff7a3a99f523ad15c7415bddba82cea66e7275551f78`。
- uninstallなし。上書き前後のRC LocalStorage database SHA-256は`8c8631ee12a87a29559524cdb79829758bac32a6c99447e5aa34be9fe52d75c0`で一致。
- 保存状態: Player 7（空名0、ID欠落0）、Match 2。`削除テストA`／`削除テストB`を保持。
- 公開版`CueScore Apps`／`com.takaakimailboxstar.cuescoreapps`／`1.2 (81)`は変更していない。

## Boundary

- commit／pushなし。Build 82、Archive、TestFlight、App Store Connect操作なし。
- Product Owner re-testはPhysical RCのPlayer一覧で各名前右側の鉛筆、空白row 0、最後のPlayer編集遷移を確認する。PASS後にPlayer Delete physical verificationを再開する。
