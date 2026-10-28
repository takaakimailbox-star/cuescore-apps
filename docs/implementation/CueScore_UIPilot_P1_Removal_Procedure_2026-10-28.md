# UI Pilot P1（比較機能）の除去手順 — App Store 提出前の必須確認
状態: Pilot P1 は **未承認**（内部TestFlight Build 90 の比較用）。既定OFFだけを公開安全性の根拠にしない。**Pilot が正式採用されない場合、App Store 提出用の Build には試験UIを含めない。**
## 1つの除去単位
- 削除するファイル: `ui-pilot-v1.js`、`ui-pilot-v1.css`、`i18n-catalog-uipilot-v1.js`。
- 削除する行: `index.html` の上記3ファイルの `<link>`／`<script>` タグ3行、`sw.js` の precache 3行、`scripts/build-native-web.mjs` の3ファイル名。
- 他のファイルは Pilot を参照しない（`tests/ui-pilot-p1.test.mjs` が静的に確認）。Race to 修正（9-Ball／10-Ball の「Race to N」と手球フリーのバッジ）は Pilot とは別で、残す。
- 保存キー `cueScore.uiPilot.v1` は Pilot の表示設定のみ（試合データ・Backup 対象外）。除去後は読み書きされず、残っても影響しない。
- 除去後: 全 Node 回帰、`tests/browser/ui-pilot-p1.mjs` は不要（削除）。index.html／sw.js の digest pin を change map に記録して更新。
## 正式採用する場合
別Gateで Decision／Spec 化（採用範囲＝9-Ball／10-Ball）、比較スイッチと「新／旧」ラベルを除去して P1 を既定表示にする。
