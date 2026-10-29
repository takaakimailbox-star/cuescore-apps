# ショットクロック21語 最終翻訳QAと正式承認（Decision 048）— 2026年10月29日
状態: **P4-APPROVED（21キー、PO委任に基づく条件付き正式承認）。** `P4-REVIEWED` ではない。人間の独立レビューは**未実施**。中国語の競技一次資料は**NOT VERIFIED**。
Decision 048／Official 138（Decision）・139（Spec／Glossary後継）／Decision Log v2.24。承認記録: `tests/fixtures/p4/po-approval-shotclock.json`。

## 1. PO委任の根拠
2026-10-29、POの意思表示（司令塔経由）:「りおんとのあが判断してOKなら、貴章もOKだよ」。これを**品質判断を条件とする承認委任**として記録する。候補21語を無条件に承認したものではない。QAで問題がなければ承認、改善が必要な語は修正してから承認する、という手順で実施した。

## 2. QAの観点と方法
1. 実際のタイマー動作との意味一致（開始／一時停止／再開／リセット／延長／延長の取消／待機／停止中／時間切れ）。
2. 既存の承認済みGlossary（Official 109）・主カタログの語との整合（機械照合）。
3. 競技用語: World Nineball Tour Event Rules §5 Shot-Clock の英語（shot clock／extension／10・5秒の通知）と一致するか。中国語は、中国の台球規程で使われる語（限时出杆／击球限时、延时、超时、读秒）を参考に判断。
4. 自然な英語・中国語、ボタン（動作）と状態語の使い分け。
5. VoiceOver文言: `{count}`／`{sec}` の置換と英語の単数／複数（3言語でプレースホルダー一致を機械確認、不一致0）。
6. 3言語の表示幅（Chrome 実測、下記7章）。
7. 翻訳漏れ・誤訳・意味の逆転（21キー×3言語を目視と機械照合）。

## 3. 競技用語の確認（正直な記録）
- 英語: World Nineball Tour Event Rules §5（matchroompool.com の公開規則）が「shot clock」「extension」と呼び、残り10秒・5秒の通知を定める。本アプリの Shot Clock／Extension／延長の語と一致する。
- 中国語: 次は**二次資料**（検索で得た要約と報道・規程の転載）による確認で、**一次資料（中国台球協会の競技総則の原文）は入手していない = NOT VERIFIED**。
  - 時間制限は「击球限时」「限时出杆」、残り10秒の提醒と5秒の読み上げ（读秒）。
  - 持ち時間の延長は「延时」（1局1回の延時の申請。秒数は大会により30秒／45秒）。
  - 時間超過の反則は「超时」。本アプリは反則を判定しない手動の補助なので、中立の「时间到」を維持する（「超时」は反則の裁定を示唆するため不採用）。
  - 機能名「出杆计时器」は、中国語の報道で出杆時間の計時を指す語の使用例がある。「限时出杆」は規則側の用語で機能名には長い。PO指定語として維持。
- 公式規則の名称とアプリの機能名称は一致しなくてよい前提で、意味・自然さ・画面への適合を総合判断した。

## 4. 21キーの最終QA結果
残余リスク: R0＝既存の主カタログ／Glossary 109 と同一語、R1＝標準的な語だが人間確認なし、R2＝競技用語で一次資料NOT VERIFIED（zh-Hansの 出杆计时器・延时・延时时间・时间到）。ハッシュは `sha256(JSON.stringify([ja,en,zh-Hans]))` の先頭16桁（既存P4と同方式）。

| キー | ja | en | zh-Hans | 残余 | ハッシュ | QA | 根拠・メモ |
|---|---|---|---|---|---|---|---|
| `shotclock.title` | ショットクロック | Shot Clock | 出杆计时器 | R2 | `24f3c26141281c53` | PASS | WNT規則の「Shot Clock」と一致（en）。zh「出杆计时器」は中国語メディアで斯诺克の話題に使用例あり（二次資料）。「限时出杆」は規則側の用語で、機能名には長いため不採用。PO指定語を維持。 |
| `shotclock.supplement` | 残り時間を手動で計ります | Time each shot manually | 手动计时 | R1 | `e6d6ee5018e804d9` | **修正** | en「Count the time manually」は何を数えるか曖昧で不自然 → 「Time each shot manually」（各ショットを手動で計る）へ修正。zh「手动计时」は妥当で維持。 変更あり（旧: ja 残り時間を手動で計ります / en Count the time manually / zh 手动计时） |
| `shotclock.baseTime` | 基本時間 | Base time | 基本时间 | R1 | `217ff3180f3b21cd` | PASS | 基本時間30〜60秒。3言語で意味一致。 |
| `shotclock.extTime` | 延長時間 | Extension | 延时时间 | R2 | `dc53a490e54230fb` | **修正** | zh「延长时间」→「延时时间」: 中国の競技規程の「申请延时」に合わせ、基本时间と対の形を維持。 変更あり（旧: ja 延長時間 / en Extension / zh 延长时间） |
| `shotclock.sec` | 秒 | sec | 秒 | R0 | `aee9f6e94c06b231` | PASS | 単位。en は sec（Build 92 で3言語の表示幅確認済み）。 |
| `shotclock.ready` | 待機中 | Ready | 待机 | R1 | `3eb1e6c72199ab98` | PASS | idle状態（待機中／Ready／待机）。操作前の状態語として自然。zh「待机」は短さ優先、「就绪」も可だが維持。 |
| `shotclock.paused` | 停止中 | Paused | 已暂停 | R1 | `93d9ff28e1c7fbf9` | PASS | 状態語（停止中／Paused／已暂停）。ボタン動作語「暂停」と使い分け。PO指定語を維持。 |
| `shotclock.expired` | 時間切れ | Time up | 时间到 | R2 | `70da63cfedfe0d4c` | PASS | 時間切れ／Time up／时间到。アプリは反則を判定しないため、規則の「超时（反則）」ではなく中立の「时间到」を維持。en「Time up」は計時表示で通用（「Time's up」も可）。 |
| `shotclock.start` | 開始 | Start | 开始 | R0 | `0b5b092b26756a91` | PASS | 既存の主カタログ語と一致。 |
| `shotclock.pause` | 一時停止 | Pause | 暂停 | R1 | `32a36b4822ddeacf` | PASS | ボタン（動作）。状態語と対。 |
| `shotclock.resume` | 再開 | Resume | 继续 | R0 | `d515f8f0cd5d5472` | PASS | 既存の再開／Resume／继续と一致。 |
| `shotclock.reset` | リセット | Reset | 重置 | R0 | `51278cc44a66d2dd` | PASS | 既存のリセット／Reset／重置と一致。 |
| `shotclock.extend` | 延長 | Extend | 延时 | R2 | `6ecf13881daac554` | **修正** | zh「延长」→「延时」: 中国の競技規程で、持ち時間の延長は「延时」（例: 1局1回の延时）。ja「延長」、en WNT「extension」と意味一致。 変更あり（旧: ja 延長 / en Extend / zh 延长） |
| `shotclock.undo` | 取消 | Undo | 撤销 | R1 | `65b95d977303d1d8` | PASS | 延長の取り消しのみ（試合の戻る操作とは別）。en Undo は iOS 慣例。zh「撤销」は主カタログと一致。 |
| `shotclock.aria.role` | ショットクロック | Shot clock | 出杆计时器 | R1 | `6ff2bbc9c322c836` | PASS | VoiceOver名。title と同語。 |
| `shotclock.aria.left` | 残り{count}秒 | one: {count} second left / other: {count} seconds left | 剩余{count}秒 | R1 | `5282e21c0b426a69` | PASS | {count}置換とen単数／複数を確認。 |
| `shotclock.aria.expired` | 時間切れ | Time up | 时间到 | R1 | `70da63cfedfe0d4c` | PASS | VoiceOver。 |
| `shotclock.aria.extend` | 延長、{sec}秒を追加 | Extend, add {sec} seconds | 延时，增加{sec}秒 | R1 | `707edfd5555b3f2c` | **修正** | {sec}置換を確認。zh「延长」→「延时」に追従。 変更あり（旧: ja 延長、{sec}秒を追加 / en Extend, add {sec} seconds / zh 延长，增加{sec}秒） |
| `shotclock.aria.undo` | 延長を取り消す | Undo extension | 撤销延时 | R1 | `b9403cf92c376d9a` | **修正** | 延長を取り消す／Undo extension／撤销延时（追従）。 変更あり（旧: ja 延長を取り消す / en Undo extension / zh 撤销延长） |
| `shotclock.aria.reset` | リセット、残り時間を基本時間に戻す | Reset, return to base time | 重置，恢复为基本时间 | R1 | `d72b3f829c149bfb` | PASS | VoiceOver。 |
| `shotclock.aria.extCount` | 延長{count}回 | one: Extended {count} time / other: Extended {count} times | 已延时{count}次 | R1 | `fe29ee20a9867ba0` | **修正** | {count}置換とen単数／複数を確認。zh「延时」に追従。 変更あり（旧: ja 延長{count}回 / en one: Extended {count} time / other: Extended {count} times / zh 已延长{count}次） |

## 5. 修正した語（6キー）と理由
1. `shotclock.supplement` en: 「Count the time manually」→「**Time each shot manually**」。旧訳は何を数えるのか曖昧で、タイマーの説明として不自然。新訳は「各ショットを手動で計る」で、ja「残り時間を手動で計ります」・zh「手动计时」と意味が一致し、文字数もほぼ同じ（24字）。
2. zh「延长」系（`extend`、`extTime`、`aria.extend`、`aria.undo`、`aria.extCount`）: 「延长」→「**延时**」。中国の競技規程では持ち時間の延長を「延时」と呼ぶため、規則に慣れた利用者に通じる語へ。表示幅は同じ2字。「延时时间」は基本时间と対の形を保つ。ja「延長」・en「Extension／Extend」とは意味が一致する。
3. 重点確認の結論: 「出杆计时器」維持、「已暂停」維持（状態語。動作語「暂停」と使い分け）、「Undo」維持（延長の取消に限る、iOS慣例）、「Time up」維持（計時表示で通用。「Time's up」も可だが変更の必要なし）。

## 6. 承認判断
- 21キーすべてで、重大な誤訳・意味の逆転・翻訳漏れ・プレースホルダー不一致はない（機械照合と目視）。上記6キーの修正で、意味不一致は解消した。**STOP条件に該当するキーなし。**
- 21キーを `P4-APPROVED`（R0〜R2を付記、PO委任に基づく条件付き）とし、ハッシュを固定。承認後に訳文を変えるとテストが失敗し、再承認が必要になる。

## 7. 表示幅（変更後の最終文言）
変更した語（en 説明文、zh 延时系）の表示幅を、実Chromeの統合検証（3言語、全基本時間×延長）とレイアウト検証（320×568／375×667、時計の全状態、文字拡大擬似）で確認する。結果は下記および Evidence（`cuescore-sc21-p4/data/`）。

| 検証 | 範囲 | 結果 |
|---|---|---|
| 統合検証 `shotclock-integrated.mjs`（en） | 全基本時間×延長、全状態、レイアウト、ボタン、ARIA | 141件 PASS／NG 0 |
| 統合検証（zh-Hans） | 同上 | 141件 PASS／NG 0 |
| 統合検証（ja、最終コード） | 同上 | 141件 PASS／NG 0 |
| レイアウト検証 `shotclock-layout.mjs`（en） | 320×568／375×667、9-Ball／3 Cushion、時計の全状態、文字拡大擬似100〜200% | 128件 PASS／NG 0 |
| レイアウト検証（zh-Hans） | 同上 | 128件 PASS／NG 0 |
| ARIA・変数置換 | `{count}`／`{sec}`の3言語一致（機械）、実DOMのARIAは統合検証に含む | 不一致0 |
- 実機の Native 表示（en／zh-Hans の新語）と実機 VoiceOver は未検証（NOT VERIFIED）。

