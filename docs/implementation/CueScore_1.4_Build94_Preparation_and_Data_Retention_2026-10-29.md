# CueScore Version 1.4 — Build 94 準備（未採番）と 1.3→1.4 データ保持の検証（2026年10月29日）
状態: 製品コードを main に反映済みだが、**Version／Build 番号は Build 93 のまま（未採番）**。ASC の Build 番号確認、Archive、Upload、TestFlight、App Store 審査・公開は**別Gate**。公開中の Version 1.3（Build 88）は不変。

## 1. 準備した内容
| 項目 | 内容 | 検証 |
|---|---|---|
| ショットクロック21語（Decision 048） | P4承認、6キー修正、主カタログへ移動、暫定カタログ退役（`shotclock-v1.js` は `cueT` で読む） | Node、en／zh-Hans 統合検証141件・レイアウト128件（各言語）PASS。Native（iPhone 17、簡体字中国語）の設定画面に「出杆计时器」「手动计时」「延时时间」が表示 |
| P1比較UIの除去 | `ui-pilot-v1.js／.css`、`i18n-catalog-uipilot-v1.js` と index／sw／build 参照、Pilot テストを削除（退避: Evidence `p1-removed-archive/`、履歴は commit 6093eb3）。Race to 修正・手球フリー表示削除・開始ボタン修正は維持。保存キー `cueScore.uiPilot.v1` は未使用化（残っても無害） | Node、設定画面に比較行なし（Native iPhone 17 の簡体字中国語画面で確認）、開始ボタン回帰 |
| 時計の言語切替 | `matchKey()` を時刻の数字のみに変更（言語で変わる文言を除外）。時計の計算・保存schema・鍵名は不変 | 実Chrome 5/5（ja→ja／en／zh-Hans、en→ja、zh-Hans→en で paused/43 を保持）、静的テスト3件 |
| Export Compliance | `ITSAppUsesNonExemptEncryption=false` を `Info.plist` と `Info-ScoreRC.plist`（表示名以外は同一の契約）に追加。根拠の再確認: 暗号ライブラリ・独自暗号のコードなし（`CryptoKit`／`CommonCrypto`／`crypto.subtle`／独自 encrypt の使用なし）、通信は OS 標準の HTTPS のみ、依存は Capacitor core／filesystem／ios／share のみ。Build 91〜93 の `false` 申告と同じ実態 | plist lint、Node。**ASC がこのキーを受け付けて手動回答を求めなくなることは、次のUploadまで未確認（NOT VERIFIED）** |
| 試合開始ボタン修正 | 維持（sticky） | 開始ボタン回帰を P1除去後に再実行（3言語×4種目×時計ON/OFF×幅320／375／390／430 = 144件 PASS）。Native 実タッチは Build 93 で確認済み |
| ショットクロック仕様 | 変更なし（延長 +25/30/45/60、既定 45秒／+60、残り＋選択秒、取消3秒、棒の再計算、独立動作、保存schema・QR・Backup・IAP） | 統合検証 141件（ja／en／zh-Hans）PASS、既存操作回帰 PASS |

## 2. 1.3（Build 88）→ 1.4 のデータ保持（Simulator リハーサル）
方法: iPhone 17 Simulator（隔離Bundle ID）で、**Build 88（Version 1.3）をビルドして実タッチで試合を開始**（9-Ball、なおき vs さくら、ボール1・3・2を記録、アプリ終了＝中断中）。その上に**同じ Bundle ID で修正版（Version 1.4、シードなし）を上書きインストール**。WKWebView の localStorage（`localstorage.sqlite3`）をキー別に比較。
| 確認 | 結果 |
|---|---|
| 上書きインストール直後のストレージ（12キー: 選手、履歴、設定、`inProgressMatch.v1` など） | **全キー・全値が一致**（ハッシュ比較、差分なし） |
| 起動後のホーム | 中断中の試合の再開カード（9-Ball、なおき vs さくら）が表示 |
| 再開した試合 | 開始時刻 21:16、ボール1・3・2、手番、Race to 5 が更新前と同一 |
| 起動・再開後のストレージ | `inProgressMatch.v1` のみ値が変化（再開時の保存時刻 `savedAt` の更新）。他11キーは一致。新規キーの追加なし（時計は既定OFF） |
- 備考: iOS は更新時にデータコンテナを作り直す（UUIDが変わる）が、内容は引き継がれた。これは Simulator のリハーサルで、**実機の App Store 更新は未検証（NOT VERIFIED）**。ネイティブ側（Swift・capacitor.config・origin）は Build 88 から変更なし。
- 保存schema・QR・Backup・IAP・価格・地域は変更していない。

## 3. 検証結果（最終コード）
Node 全回帰 1225／1225（本記録時点）。実Chrome: 開始ボタン回帰、既存操作回帰（ja）、統合検証（ja）、言語切替の時計。結果は Evidence `cuescore-sc21-p4/data/`。
## 4. 採番Gateで必要な作業（本記録では未実施）
1. Version 1.4／Build 94 の採番（pbxproj、index.html／sw.js のキャッシュ文字列）と pins の更新。
2. ASC で Build 94 の未使用を確認、Archive、内部TestFlightへの Upload（1回）。
3. Export Compliance: `ITSAppUsesNonExemptEncryption` で自動回答されるかを read-back。されない場合は、別途PO承認の単発 PATCH が必要。
4. 実機確認（試合開始、ショットクロック）と、App Store 提出準備（別Gate）。
