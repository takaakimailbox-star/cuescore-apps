# ショットクロック翻訳 P4承認資料（PO一括承認用）— 2026年10月29日
状態: **資料のみ（承認前）。** 訳文は `CANDIDATE`／P3-PROVISIONAL のまま。`P4-APPROVED` と記録しない。人間の独立レビューは未実施（`P4-REVIEWED` は付与しない）。中国語の競技用語の一次資料は **NOT VERIFIED**。
対象: `i18n-catalog-shotclock-v1.js` の **21キー**（Decision 046 の20語＋Decision 047 の `shotclock.extTime`）。現在の置き場所は主カタログ外（主カタログは全キーに P4-APPROVED 記録が必須: `tests/p4-po-approval.test.mjs`）。

## 1. 既存P4手順（Decision 037／038 と同じ形式）
1. PO が下表を一括で承認（または個別に修正）する。
2. 承認後、別Gateで承認記録 `tests/fixtures/p4/po-approval-shotclock.json`（キーごとに日付・残余リスク・[ja, en, zh-Hans] のハッシュ。方式は既存記録と同一）を作り、21キーを主カタログへ移す。承認後に訳文を変えるとテストが失敗し、再承認が必要になる。
3. この移動は製品コード変更（新Build）を伴う。本資料の作成では製品コードを変更していない。

## 2. 21キー（ja／en／zh-Hans）
残余リスク: R0＝既存の主カタログ語と同一／R1＝標準的だが人間確認なし／R2＝競技用語など一次資料未確認。ハッシュは `sha256(JSON.stringify([ja,en,zh-Hans]))` の先頭16桁（既存記録と同方式）。

| キー | ja | en | zh-Hans | 残余 | ハッシュ | メモ |
|---|---|---|---|---|---|---|
| `shotclock.title` | ショットクロック | Shot Clock | 出杆计时器 | R2 | `24f3c26141281c53` | zh「出杆计时器」はPO指定語。競技一次資料は未確認 |
| `shotclock.supplement` | 残り時間を手動で計ります | Count the time manually | 手动计时 | R1 | `74190b1b20e793c4` | 補足文。「手動」の意味は3言語で一致 |
| `shotclock.baseTime` | 基本時間 | Base time | 基本时间 | R1 | `217ff3180f3b21cd` |  |
| `shotclock.extTime` | 延長時間 | Extension | 延长时间 | R1 | `943ddfde6fb24e15` | Decision 047 新語。「延長時間／Extension／延长时间」 |
| `shotclock.sec` | 秒 | sec | 秒 | R0 | `aee9f6e94c06b231` | 単位。en は sec |
| `shotclock.ready` | 待機中 | Ready | 待机 | R1 | `3eb1e6c72199ab98` | zh「待机」は短さ優先 |
| `shotclock.paused` | 停止中 | Paused | 已暂停 | R1 | `93d9ff28e1c7fbf9` | zh「已暂停」はPO指定語（状態表示のため） |
| `shotclock.expired` | 時間切れ | Time up | 时间到 | R1 | `70da63cfedfe0d4c` | zh「时间到」。競技一次資料は未確認 |
| `shotclock.start` | 開始 | Start | 开始 | R0 | `0b5b092b26756a91` | 既存の Start／开始 と一致 |
| `shotclock.pause` | 一時停止 | Pause | 暂停 | R1 | `32a36b4822ddeacf` | ボタン（動作）。状態語の「停止中／Paused／已暂停」と対 |
| `shotclock.resume` | 再開 | Resume | 继续 | R0 | `d515f8f0cd5d5472` | 既存の 再開／Resume／继续 と一致 |
| `shotclock.reset` | リセット | Reset | 重置 | R0 | `51278cc44a66d2dd` | 既存の リセット／Reset／重置 と一致 |
| `shotclock.extend` | 延長 | Extend | 延长 | R1 | `6fb06d34690cc95d` |  |
| `shotclock.undo` | 取消 | Undo | 撤销 | R1 | `65b95d977303d1d8` | 延長の取消。試合の「戻る」とは別語。zh「撤销」は既存と一致 |
| `shotclock.aria.role` | ショットクロック | Shot clock | 出杆计时器 | R1 | `6ff2bbc9c322c836` | VoiceOver名。実機VoiceOver未検証 |
| `shotclock.aria.left` | 残り{count}秒 | one: {count} second left / other: {count} seconds left | 剩余{count}秒 | R1 | `5282e21c0b426a69` | VoiceOver。en は単数／複数 |
| `shotclock.aria.expired` | 時間切れ | Time up | 时间到 | R1 | `70da63cfedfe0d4c` | VoiceOver |
| `shotclock.aria.extend` | 延長、{sec}秒を追加 | Extend, add {sec} seconds | 延长，增加{sec}秒 | R1 | `81e245be5417f8b5` | VoiceOver。{sec}は追加秒数 |
| `shotclock.aria.undo` | 延長を取り消す | Undo extension | 撤销延长 | R1 | `e81ae5267c2f9159` | VoiceOver。PO指定「Undo −60」系の表現に合わせた |
| `shotclock.aria.reset` | リセット、残り時間を基本時間に戻す | Reset, return to base time | 重置，恢复为基本时间 | R1 | `d72b3f829c149bfb` | VoiceOver |
| `shotclock.aria.extCount` | 延長{count}回 | one: Extended {count} time / other: Extended {count} times | 已延长{count}次 | R1 | `14500f5e43d2240a` | VoiceOver。en は単数／複数 |

## 3. 既存カタログとの整合（機械確認）
- zh-Hans: 「撤销」は主カタログで6回使用（本資料の `shotclock.undo` と一致）、「继续」18回（`shotclock.resume` と一致）、「重置」1回（`shotclock.reset` と一致）。「延长」「待机」「已暂停」「时间到」は主カタログに無く新語。
- en: Reset 4回、Resume 4回、Start 7回で一致。Undo は主カタログに1回。
- ja: リセット1、再開6、開始10で一致。「取消」は主カタログに無く、試合の取り消しは別語（「戻る」）。時計の「取消」は延長の取り消しに限る。
- 3言語の表示幅は Native（iPhone SE 375pt: ja、iPhone 17 402pt: ja／en／zh-Hans）と Chrome（3言語×4延長×全幅）で崩れなし（Build 92）。

## 4. PO判断が必要な点（推奨付き）
| ID | 論点 | 推奨 |
|---|---|---|
| T-1 | zh-Hans の機能名「出杆计时器」（PO指定語）。競技一次資料は未確認 | **維持して R2 付きで承認**。一次資料が得られたら別Gateで見直す |
| T-2 | zh 状態語「待机」「已暂停」「时间到」 | 維持（短く、UI幅に収まる）。R1 |
| T-3 | ja「取消」（延長の取り消し）と試合の「戻る」の使い分け | 維持。延長ボタンの近くにのみ表示される |
| T-4 | VoiceOver名（`shotclock.aria.*`）は実機VoiceOver未検証 | 文言は承認し、実機VoiceOverは NOT VERIFIED のまま記録 |

推奨案: 21キーを**一括承認**（残余 R0／R1／R2 を記録、T-1〜T-4 は推奨どおり）。この承認を P1 採用、実機VoiceOver、`P4-REVIEWED`、U4／U11 へ拡大しない。
