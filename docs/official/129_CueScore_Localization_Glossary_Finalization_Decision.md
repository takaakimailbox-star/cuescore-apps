# 129 — CueScore Localization Glossary Finalization Decision（Decision 042）

**状態: Adopted / Official。** Product Ownerの明示承認（2026-10-18）に基づき同日発行。

## 1. 番号

- 直前はDecision 041／Official 127・128／Decision Log v2.17。本決定は未使用の**Decision 042**、Decision Log **v2.18**。
- Glossary予約番号の**Official 109**を正本として発行し、本Decisionを**Official 129**とする。既存Officialは改変しない。

## 2. G14／G25の承認

- G14: `アベレージ / Average / 平均得分`。意味は**得点÷完了イニング数**。
- G25: `スポット / Spot / 置球点`。意味は**ボールを置く規定位置**。球を戻す操作は既存のre-spot表現を使用する。
- 現行訳、保存値、計算式、画面表示を変更しない。中国語の競技一次資料不足は`NOT VERIFIED`として残す。

## 3. 決定

### D042-1 状態

G14／G25を`CONFIRMED（PO承認記録、残余リスクあり）`とする。Decision 041の25語とDecision 037の既存11語は変更しない。

### D042-2 Official 109

Official 108／119／120の発行条件を再照合し、38語のID重複0、Glossary `PENDING` 0、`CANDIDATE` 0、catalogとの意味一致、PO承認記録、残余リスク、人間の独立レビュー未実施の記録を確認したためOfficial 109を発行する。

### D042-3 承認境界

確定対象はCueScore内の意味と表示語である。外部競技団体の正式名称・正式訳語、中国語公式競技用語、JPA外部ルールを確認済みとは扱わない。

### D042-4 P6境界

Official 108 AC-1のGlossary条件はPASSへ移行するが、P6全体をPASSにしない。VoiceOver実音声、Pro／StoreKit、Backup Share Sheet実機表示等は別の受入条件として残す。P7を開始しない。

### D042-5 不変条件

catalog、production source、既存日本語表示、保存値、計算式、Match／Snapshot schema、Player Identity、QR／Backup／CSV、Analytics、Free／Pro、IAP Product ID、S-B=`false`、Native設定、Version／Buildを変更しない。Device、Apple Developer、TestFlight、ASC、Releaseを操作しない。

## 4. 発行

Documentation-onlyで発行する。P6最終PASS、Build 84上書き、Device Build/install、P7は別Gateとする。
