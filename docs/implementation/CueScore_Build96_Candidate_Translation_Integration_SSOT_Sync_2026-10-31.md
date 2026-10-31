# Version 1.4 / Build 96 候補 — 翻訳案A統合・SSOT同期（2026年10月31日）

状態: 製品実装・テスト済み。Build 96 は**仮番号をASC読取で確定**（ASC の最新は 95、96 は未使用）。**Upload・TestFlight・ASC変更・App Review・一般公開は未実施**。Decision／Official の**正式発行はしていない**（候補の整理のみ）。

## 1. 状態の分離（混同しない）
| 項目 | 状態 | 根拠 |
|---|---|---|
| 設計（Prototype）承認 | PO承認 2026-10-31（縦バランス、9/10-Ball 1〜10＋その他、3 Cushion 7〜40＋その他、外側タップ） | 司令塔指示書 |
| 3項目の製品実装 | PASS（実装 commit `efe66ea`、Node 1241/1241、実Chrome 実座標 3言語×4幅） | `CueScore_Build95_Setup_UI_Balance_NumericMenu_OutsideTap_Implementation_2026-10-31.md` |
| 翻訳案A（7→3キー） | PO承認 2026-10-30、本Gateで製品へ反映 | §2 |
| 実機（iPhone・VoiceOver実音声・キーボード・Dynamic Type） | **NOT VERIFIED** | 未実施 |
| 内部TestFlight配布 | 未実施（別Gate） | — |

## 2. 翻訳案Aの反映
- 主カタログ（ja／en／zh-Hans、各 1385 キー）へ 3 キーを統合: `setupux.reason.p2`（`8e7119f85b3f68a7`）、`setupux.reason.p1`（`dfb84fc2cb977df3`）、`setupux.reason.both`（`d9d1ec071afa783b`）。ハッシュ＝`sha256(JSON.stringify([ja,en,zh-Hans])).slice(0,16)`。承認文言はそのまま（新規翻訳・文言変更なし）。
- 承認記録: `tests/fixtures/p4/po-approval-setupux.json`（status `P4-APPROVED`＝PO承認、残余R1、`humanIndependentReview: NOT PERFORMED`、`P4-REVIEWED` は使わない）。独立した人間の翻訳レビューは**未実施**。
- 整理した4キー: `reason.other`（独立キー削除。待機理由が無い異常状態では**理由を表示しない**安全フォールバック）、`reason.aria`（削除）、`menu.other`（主カタログ「その他」＋「…」）、`menu.close`（未使用のため削除）。暫定カタログ `i18n-catalog-setupux-v1.js` は廃止（index.html／sw.js／native build 一覧から除去）。
- VoiceOver: 理由行の `aria-label` は理由文そのもの、`aria-description` は既存承認語（「対戦相手を選択」／「プレーヤーを選択」）。実音声は NOT VERIFIED。
- テスト: SU-1／SU-2 を統合構成へ書き換え（承認ハッシュを固定＝より厳格）、SU-2b を追加、P4 承認・manifest テストが新記録を数える。弱体化なし。変更表 `tests/fixtures/p2/version-build96-translation-integration-test-change-map.json`。

## 3. Decision 049／Official 140〜142（候補の確認。正式発行なし）
- 既存の docs/official 最大番号は 139、Decision Log は v2.24。140〜142 は**未発行**で、既存SSOTとの衝突はない。
- 正式化候補にできるのは承認済み仕様のみ: (a) 縦バランスの適応、(b) 数値選択の統一ルール（候補の長さにかかわらず高さ上限付きスクロールメニュー、「その他」下端固定、現在値の候補外表示、選択後の自動クローズ）、(c) 外側タップ・Escape・✕・入力中のキャンセル原則（値を反映しない、フォーカス復帰）、(d) 翻訳案A（3キーのP4承認）。
- **正式化しない（取り下げ・未承認）**: 設計書 §「黄色い強調枠の廃止方針」は、PO訂正（撤去対象は「その他」数値入力のフォーカス枠のみ、実装 `9e37a0b`）により**取り下げ**。全画面の黄色撤去・試合中状態表示の中立化は Decision／Official に入れない。
- 正式反映は、PO実機評価後に司令塔が判断する別Gate。

## 4. 保護（不変）
得点・勝敗・ファール、保存schema、中断試合、QR／Backup、Free／Pro・IAP・価格・地域、ショットクロックの計算・操作契約、全画面共通の黄色フォーカス、未選択カード、試合中の黄色状態表示、競技アイコン、ショットクロック色。Build 83 RCA は STOP、セット方式は `S-B=false`、途中終了・勝敗なし履歴保存は対象外。

## 5. Build 96 ローカル Archive（Upload なし）
- 製品 commit `d0993552989348bb5940e14051dbfa0d6fed7725`（以降は本記録のみの docs commit）。ASC 読取で最新は Build 95（VALID）、96 は未使用を確認して確定。
- Archive: `/Users/Ludique/Documents/Codex/2026-10-31/cuescore-build96/archive/CueScore_1.4_96_xcode271.xcarchive`（`DEVELOPER_DIR` に別名展開の Xcode 27.1 を指定、独立 DerivedData、`xcodebuild archive` 成功）。Version 1.4／Build 96、Bundle ID `com.takaakimailboxstar.cuescoreapps`、Team U26DF88PRW、署名検証 OK、DTXcodeBuild 27A9275／iphoneos27.1。Archive 内 `public` は `native-web` とバイト一致。
- 最初の Archive は iOS public コピーに廃止済みの `i18n-catalog-setupux-v1.js`（未参照）が残っていたため `SUPERSEDED_stale_public_…` として記録に残し、削除後に再 Archive（上記）。製品コードは不変。
- Build 95 の Archive（27B52 版・27.1 版）は不変。Upload・TestFlight・ASC 変更・App Review・一般公開は未実施。90534 は製品不具合と断定していない（Apple 側受付の可能性が最有力、確度は中）。
- Evidence: `/Users/Ludique/Documents/Codex/2026-10-31/cuescore-build96/`（xcodebuild ログ、各ブラウザテスト結果、archive_tree_sha256.txt）。
