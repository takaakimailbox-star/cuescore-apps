# 139 CueScore Shot Clock — 21 Terms P4 Approval Spec（Glossary後継追補）

**状態: Adopted / Official。** Decision 048（Official 138）の仕様。2026-10-29発行。Official 109（Glossary、38語CONFIRMED）は**変更せず保護**し、本書が**ショットクロック用語を追補**する（109＋139＝現行Glossary）。

## 1 承認対象（21キー）
`shotclock.title`、`supplement`、`baseTime`、`extTime`、`sec`、`ready`、`paused`、`expired`、`start`、`pause`、`resume`、`reset`、`extend`、`undo`、`aria.role`、`aria.left`、`aria.expired`、`aria.extend`、`aria.undo`、`aria.reset`、`aria.extCount`。最終の訳文・ハッシュ・残余リスクは`tests/fixtures/p4/po-approval-shotclock.json`と`docs/implementation/CueScore_ShotClock_21_Terms_Final_QA_and_Approval_2026-10-29.md`に記録する（訳文の唯一の正本は主カタログ）。

## 2 Glossary後継（S01〜S12）
`S01`〜`S12`は本書内の台帳IDで、保存schemaやcatalog keyではない。状態は`CONFIRMED（PO委任に基づくP4承認、残余リスクあり）`。

| ID | 日本語 | 英語 | 簡体字中国語 | CueScore内の意味・残余リスク |
|---|---|---|---|---|
| S01 | ショットクロック | Shot Clock | 出杆计时器 | 1ショットの持ち時間を手動で計る補助。反則を自動判定しない。zh一次資料NOT VERIFIED（R2）。 |
| S02 | 基本時間 | Base time | 基本时间 | 30／35／40／45／60秒から選ぶ1ショットの時間（R1）。 |
| S03 | 延長（時間） | Extension | 延时（时间） | 残り時間に加える秒数（＋25／30／45／60）。規則の「extension」「延时」に対応。zh一次資料NOT VERIFIED（R2）。 |
| S04 | 待機中 | Ready | 待机 | 開始前の状態（R1）。 |
| S05 | 停止中 | Paused | 已暂停 | 一時停止された状態（状態語）。PO指定語（R1）。 |
| S06 | 時間切れ | Time up | 时间到 | 残り0秒の状態。反則の裁定ではない（規則の「超时」とは別）。zh一次資料NOT VERIFIED（R2）。 |
| S07 | 開始 | Start | 开始 | 動作ボタン。主カタログの既存語と一致（R0）。 |
| S08 | 一時停止 | Pause | 暂停 | 動作ボタン（S05の状態語と対）（R1）。 |
| S09 | 再開 | Resume | 继续 | 動作ボタン。既存語と一致（R0）。 |
| S10 | リセット | Reset | 重置 | 残り時間を基本時間へ戻す。既存語と一致（R0）。 |
| S11 | 延長 | Extend | 延时 | 延長ボタン（動作）。zh一次資料NOT VERIFIED（R2）。 |
| S12 | 取消 | Undo | 撤销 | 延長の取り消し（3秒以内）。試合の「戻る」とは別。zh「撤销」は主カタログと一致（R1）。 |

## 3 受入基準
- **AC-ST1** 21キーがja／en／zh-Hansの主カタログに存在し、キー集合が一致、プレースホルダー（`{count}`、`{sec}`）が一致する。
- **AC-ST2** 承認記録の各キーのハッシュが、現在の主カタログの[ja, en, zh-Hans]と一致する（承認後の変更は再承認が必要）。
- **AC-ST3** 承認記録は`P4-APPROVED`、承認日2026-10-29、PO委任の根拠、`humanIndependentReview: NOT PERFORMED`、`P4-REVIEWED`未使用、R0／R1／R2を含む。
- **AC-ST4** 暫定カタログ`i18n-catalog-shotclock-v1.js`は存在せず、`shotclock-v1.js`は`cueT`で主カタログを読む。
- **AC-ST5** 重点語: zh「出杆计时器」「已暂停」、en「Undo」「Time up」、en説明「Time each shot manually」、zh延時系の訳が承認記録と一致する。
- **AC-ST6** 3言語で表示幅が崩れない（Chrome実測）。ショットクロックの動作・保存・QR・Backupは不変。
- **AC-ST7** Official 109は変更されていない。
