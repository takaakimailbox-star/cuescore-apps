# 109 — CueScore Localization Glossary

**状態: Adopted / Official。** 2026年10月18日発行。Decision 042／Official 129に基づく、CueScore内表示用語の正本。

## 1. 適用範囲と状態

- 対象言語: `ja`／`en`／`zh-Hans`。
- `CONFIRMED`: 38語（既存承認11語＋G01〜G27）。根拠はProduct Ownerの承認記録であり、CueScore内の意味と表示語を確定する。
- `PENDING`: 0。`CANDIDATE`: 0。用語IDの重複: 0。
- 人間の独立レビューは未実施。中国語公式競技用語集、JPA団体の正式名称・外部ルール用語は不足箇所を`NOT VERIFIED`として保持する。
- 本書は外部競技団体の正式名称・正式訳語を確認済みとするものではない。

## 2. 既存承認11語

`C01`〜`C11`は本書内の台帳IDであり、保存schemaやcatalog keyではない。

| ID | 日本語 | 英語 | 簡体字中国語 | CueScore内の意味・残余リスク |
|---|---|---|---|---|
| C01 | マス割 | Break and run | 清台 | ブレイクから相手に手番を渡さずラックを完了。zh一次資料はNOT VERIFIED。 |
| C02 | ラック | Rack | 局 | 1ラックの単位。G24のRe-rackとは別概念。zh一次資料はNOT VERIFIED。 |
| C03 | ハイラン | High run | 最高连续得分 | 連続得点の最高値。中国語公式用語はNOT VERIFIED。 |
| C04 | 先攻／後攻 | First / Second | 先手 / 后手 | 開始順。 |
| C05 | プッシュアウト | Push out | 推出球 | 9-Ball等のPush Out。zh一次資料はNOT VERIFIED。 |
| C06 | イニング | Inning | 回合 | 完了した手番単位。競技別の集計定義は既存Officialに従う。 |
| C07 | 3ファール | 3 consecutive fouls | 连续3次犯规 | 連続3回の反則。 |
| C08 | ファール（ブレイク交代） | Foul (break passes to opponent) | 犯规（交换开球） | ブレイク権を相手へ渡す結果。 |
| C09 | デッド | Dead | 无效球 | JPA 9-BallのDead。JPA外部一次資料はNOT VERIFIED。 |
| C10 | 持ち点 | Target points | 目标分 | 3 Cushionのプレーヤー別目標点。 |
| C11 | オープニングブレイクファール | Opening break foul | 首次开球犯规 | 14-1の初回ブレイク反則。 |

## 3. Glossary 27語

| ID | 日本語 | 英語 | 簡体字中国語 | CueScore内の意味・残余リスク |
|---|---|---|---|---|
| G01 | 9-Ball（種目名） | 9-Ball | 9-Ball | 9ボール種目。zh一次資料なし。 |
| G02 | 10-Ball（種目名） | 10-Ball | 10-Ball | 10ボール種目。zh一次資料なし。 |
| G03 | Rotation（種目名） | Rotation | Rotation | 目標点方式のRotation。zh一般呼称はNOT VERIFIED。 |
| G04 | JPA 9-Ball（種目名） | JPA 9-Ball | JPA 9-Ball | SL、Race、Match point、Deadを使うJPAルール。JPA外部一次資料・団体正式名称はNOT VERIFIED。 |
| G05 | 14-1（種目名） | 14-1 | 14-1 | Straight Pool系の14-1種目。 |
| G06 | 3 Cushion（種目名） | 3 Cushion | 3 Cushion | キャロム3クッション。表記慣行差あり。 |
| G07 | ブレイク | Break | 开球 | ラック最初の一打。zh一次資料はNOT VERIFIED。 |
| G08 | ファール | Foul | 犯规 | 反則。 |
| G09 | スクラッチ | Scratch | 母球落袋 | 手球が落ちた反則。zh呼称差はNOT VERIFIED。 |
| G10 | Race to | Race to | Race to | 先取数。zh一次資料はNOT VERIFIED。 |
| G11 | セーフティ | Safety | 防守 | 守りの一打。中国語の呼称差はNOT VERIFIED。 |
| G12 | ミス | Miss | 失误 | 入らなかった手動ミス。競技一次資料なし。 |
| G13 | シュート率 | Shot rate | 进球率 | ポケット数÷（ポケット数＋手動ミス）。CueScore指標。 |
| G14 | アベレージ | Average | 平均得分 | 得点÷完了イニング数。中国語競技一次資料はNOT VERIFIED。 |
| G15 | 引き分け | Draw | 平局 | 勝敗が同点。 |
| G16 | 試合 | Match | 比赛 | 保存される対戦1件。 |
| G17 | プレーヤー | Player | 球员 | 登録プレーヤー。中国語の呼称差が残る。 |
| G18 | メインプレーヤー | Main player | 主要球员 | アプリの主プレーヤー。 |
| G19 | 区分／シーズン | Category / Season | 类别 / 赛季 | 試合分類とシーズン。 |
| G20 | 試合共有 | Match Sharing | 比赛分享 | QRで試合を渡す機能。 |
| G21 | バックアップ／データ復元 | Backup / Restore | 备份 / 恢复数据 | ProのJSON書出しと復元。 |
| G22 | Free／Pro（CueScore Pro） | Free / Pro | Free / Pro | プラン固有名。製品名は固定し説明だけ翻訳する。 |
| G23 | カメラ | Camera | 相机 | 権限・QR読み取り。 |
| G24 | ラック（14-1の再配置） | Re-rack | 重新摆放 | 14球または15球の再配置通知。C02のRackとは別概念。 |
| G25 | スポット | Spot | 置球点 | ボールを置く規定位置。球を戻す操作は既存のre-spot表現を使用。中国語競技一次資料はNOT VERIFIED。 |
| G26 | 手球フリー | Ball in hand | 自由球 | 反則後の手球配置。中国語用語差はNOT VERIFIED。 |
| G27 | マッチポイント | Match point | 赛点 | JPA 9-Ballの勝利必要残り点。JPA外部一次資料はNOT VERIFIED。 |

## 4. 不変条件

本書の発行でcatalog、production source、保存値、計算式、画面表示、Match／Snapshot schema、Player Identity、QR／Backup／CSV、Analytics、Free／Pro、IAP、Native設定、Version／Buildを変更しない。

## 5. P6との関係

Glossaryの`PENDING`／`CANDIDATE` 0と全catalog keyのP4承認を満たすため、Official 108 AC-1のGlossary条件はPASSとなる。ただしP6全体は、VoiceOver実音声、Pro／StoreKit、Backup Share Sheet実機到達等の未完了を含むため自動PASSとしない。
