# 128 — CueScore Localization Glossary 25 Terms Approval Spec（Decision 041付随Spec）

**状態: Adopted / Official。** Official 127の付随Spec。Official 107／108／117〜120／125／126を保持し、改変しない。

## 1. 状態規則

- `CONFIRMED`: G14／G25を除く25語。根拠はProduct Ownerの承認記録であり、残余リスクを保持する。
- `PENDING`: G14、G25。Source Audit済みだが追加のPO判断前である。
- 人間の独立レビュー: 未実施。`P4-REVIEWED`等の人間レビュー状態へ読み替えない。
- Official 109: 未発行。Glossary全体のPENDING／CANDIDATEが0になるまで完成版として発行しない。

## 2. 承認済み25語の正本台帳

| ID | 日本語 | 英語 | 簡体字中国語 | CueScore内の意味 | 根拠・残余リスク |
|---|---|---|---|---|---|
| G01 | 9-Ball（種目名） | 9-Ball | 9-Ball | 9ボール種目 | CueScoreの6競技定義。zh一次資料なし。 |
| G02 | 10-Ball（種目名） | 10-Ball | 10-Ball | 10ボール種目 | CueScoreの6競技定義。zh一次資料なし。 |
| G03 | Rotation（種目名） | Rotation | Rotation | 目標点方式のRotation | CueScoreの競技定義。zh一般呼称はNOT VERIFIED。 |
| G04 | JPA 9-Ball（種目名） | JPA 9-Ball | JPA 9-Ball | SL、Race、Match point、Deadを使うJPAルール | CueScore Officialのアプリ内定義。JPA外部一次資料・団体正式名称はNOT VERIFIED。 |
| G05 | 14-1（種目名） | 14-1 | 14-1 | Straight Pool系の14-1種目 | Official 108の6競技。正式英名併記なし。 |
| G06 | 3 Cushion（種目名） | 3 Cushion | 3 Cushion | キャロム3クッション | Official 108の6競技。表記慣行差あり。 |
| G07 | ブレイク | Break | 开球 | ラック最初の一打 | WPA 5.3／7.3（英語）。zh一次資料はNOT VERIFIED。 |
| G08 | ファール | Foul | 犯规 | 反則 | WPA 3.13／7.10（英語）。 |
| G09 | スクラッチ | Scratch | 母球落袋 | 手球が落ちた反則 | WPA 2.17（英語）。zh呼称差はNOT VERIFIED。 |
| G10 | Race to | Race to | Race to | 先取数 | CueScore Official／UI。zh一次資料はNOT VERIFIED。 |
| G11 | セーフティ | Safety | 防守 | 守りの一打 | WPA 2.16（英語）。`安全球`との差はNOT VERIFIED。 |
| G12 | ミス | Miss | 失误 | 入らなかった手動ミス | CueScore入力上の意味、一般語。競技一次資料なし。 |
| G13 | シュート率 | Shot rate | 进球率 | ポケット数÷（ポケット数＋手動ミス） | 現行算出定義。一般規則語ではなくCueScore指標。 |
| G15 | 引き分け | Draw | 平局 | 勝敗が同点 | CueScore結果値、一般語。一次資料なし。 |
| G16 | 試合 | Match | 比赛 | 保存される対戦1件 | Match schema／Official。 |
| G17 | プレーヤー | Player | 球员 | 登録プレーヤー | Player Identity契約。`选手`との差が残る。 |
| G18 | メインプレーヤー | Main player | 主要球员 | アプリの主プレーヤー | Official 105／106、Decision 037。 |
| G19 | 区分／シーズン | Category / Season | 类别 / 赛季 | 試合分類とシーズン | Official 108 D4／D5。 |
| G20 | 試合共有 | Match Sharing | 比赛分享 | QRで試合を渡す機能 | Official 101／102／108。 |
| G21 | バックアップ／データ復元 | Backup / Restore | 备份 / 恢复数据 | ProのJSON書出しと復元 | Official 119／120、Backup契約。 |
| G22 | Free／Pro（CueScore Pro） | Free / Pro | Free / Pro | プラン固有名 | `CueScore Free / CueScore Pro`を固定し、説明だけ翻訳する。 |
| G23 | カメラ | Camera | 相机 | 権限・QR読み取り | Decision 040／Official 125・126。 |
| G24 | ラック（14-1の再配置） | Re-rack | 重新摆放 | 14球または15球の再配置通知 | WPA rerack（英語）、現行catalog。旧候補`重新摆球`との差を保持。 |
| G26 | 手球フリー | Ball in hand | 自由球 | 反則後の手球配置 | WPA 1.6（英語）、現行catalog。中式用語との競合はNOT VERIFIED。 |
| G27 | マッチポイント | Match point | 赛点 | JPA 9-Ballの勝利必要残り点 | CueScore JPA仕様。JPA外部一次資料はNOT VERIFIED。 |

件数は**25**。ID集合にG14／G25を含めない。

## 3. 未承認2語

| ID | 日本語 | 現行候補 | 状態 | 理由 |
|---|---|---|---|---|
| G14 | アベレージ／平均 | `Average / 平均得分` | PENDING | 3競技共通キーの実装上の意味をSource Auditし、追加PO判断を待つ。 |
| G25 | スポット | `Spot / 置球点` | PENDING | 位置（spot）と戻す操作（re-spot）の区別をSource Auditし、追加PO判断を待つ。 |

## 4. catalogとの関係

本Gateではcatalog値を変更しない。§2の訳語はEvidence 84の現行catalog／推奨訳と一致する。単独Glossaryキーのない用語はphrase-levelの承認記録であり、新規キーを追加しない。

## 5. 受入条件

- AC-G25-1: Decision 041／Official 127・128／Decision Log v2.17を発行し、Decision 001〜040と既存Officialを保持する。
- AC-G25-2: 承認IDが25件で、G14／G25を含まない。
- AC-G25-3: §2がEvidence 84の日本語・英語・簡体字中国語・CueScore内意味と一致する。
- AC-G25-4: 一次資料不足と人間の独立レビュー未実施をNOT VERIFIEDとして保持する。
- AC-G25-5: G14／G25はPENDING、Official 109は未発行、Official 108 AC-1は未達のままとする。
- AC-G25-6: catalog、ja表示、production source、Data／QR／Backup、Analytics、Free／Pro、IAP、Native設定を変更しない。
- AC-G25-7: Full Node、P2／P3／P4 focused、AC-S1〜S6、Data／QR保護、`git diff --check`がPASSする。

## 6. NOT VERIFIED

中国語公式競技用語集、JPA団体の正式名称・外部ルール用語、G14／G25の最終訳、人間の独立レビュー、実機表示は本Gateでは確認済みにしない。
