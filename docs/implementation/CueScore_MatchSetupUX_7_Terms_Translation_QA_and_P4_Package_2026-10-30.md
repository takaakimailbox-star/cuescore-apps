# 試合設定画面 UI 試験実装の新規翻訳 7 キー QA・P4承認資料（2026年10月30日）

状態: **資料のみ（承認前）。** 訳文は `CANDIDATE`／**P3-PROVISIONAL** のまま。`P4-APPROVED` と記録しない。人間の独立レビューは**未実施**（`P4-REVIEWED` は付与しない）。製品コード・採番・ASC は変更していない（Build 95 は Xcode 27.2 の受付待ちで配布 STOP 継続）。
対象: `i18n-catalog-setupux-v1.js` の **7 キー**（Build 95 候補で使用。主カタログには入っていない）。

## 1. 位置づけと手順（既存P4手順と同形式）
1. PO が §3 の表を承認、または個別に修正する（§6 の判断事項を含む）。
2. 承認後、別 Gate で承認記録（例 `tests/fixtures/p4/po-approval-setupux.json`：キーごとの日付・残余リスク・`[ja, en, zh-Hans]` のハッシュ）を作成し、承認したキーだけを主カタログへ移す。この移動は製品コード変更（新 Build）を伴う。
3. 承認後に訳が変わるとハッシュが不一致になり、再承認が必要。

## 2. 実際の挙動の照合（開始条件との一致）
- 開始条件は `final-ui-build18.js` の `start.disabled = players.length<2 || !selected(1) || !selected(2) || 同一ID`（不変）。理由文はこの結果に合わせて表示する（新コードは disabled を書かない）。
- 理由文の対応（実測：Chrome 全マトリクス、Native 実タッチで確認）:
  | 状態 | 理由行 | キー |
  |---|---|---|
  | 登録 2 人以上・先攻のみ選択済み（対戦相手が未選択） | 表示 | `reason.p2` |
  | 先攻・後攻とも未選択（登録 2 人以上） | 表示 | `reason.both`（現行の操作では到達しない。P1 は主プレーヤーが自動選択されるため） |
  | 先攻が未選択・後攻は選択済み | 表示 | `reason.p1`（同上、到達しない） |
  | 登録プレーヤーが 2 人未満 | **非表示**（既存の案内カードが「追加」を促す） | 該当なし |
  | 同じプレーヤーを両枠に選択 | 表示 | `reason.other` |
- **到達性の確認結果（重要）**: 
  - `reason.other`：選択関数 `selectRegisteredPlayer`（`index.html:11762`）が、もう一方の枠で選択中のプレーヤーを弾く（何も起きない）。入れ替え（swap）は両者を交換するだけ。→ **通常操作では到達しない**（防御的な分岐）。
  - `reason.p1`／`reason.both`：先攻（P1）は主プレーヤーが自動選択され、手動で外せない。→ **現行の操作では到達しにくい**（将来の仕様変更・データ状態への備え）。
  - 実際に表示されるのは、実質 `reason.p2`（対戦相手が未選択）のみ。
- 「同一プレーヤー選択時の案内」は、現行では選択 UI 側で選べない表示（Player1で選択中）が担う（既存の承認済み文言）。新しい案内は実質不要。

## 3. 7 キー（ja／en／zh-Hans）
残余リスク: R0＝既存の主カタログ語と同一／R1＝標準的な文言だが人間確認なし（AI 照合のみ）／R2＝競技用語など一次資料未確認。ハッシュは `sha256(JSON.stringify([ja,en,zh-Hans])).slice(0,16)`（既存方式）。

| キー | ja | en | zh-Hans | 残余 | ハッシュ |
|---|---|---|---|---|---|
| `setupux.reason.both` | プレーヤーを選ぶと試合を開始できます | Select players to start the match | 选择球员后即可开始比赛 | R1 | `d9d1ec071afa783b` |
| `setupux.reason.p1` | 先攻プレーヤーを選ぶと試合を開始できます | Select the first player to start the match | 选择先手球员后即可开始比赛 | R1 | `dfb84fc2cb977df3` |
| `setupux.reason.p2` | 対戦相手を選ぶと試合を開始できます | Select an opponent to start the match | 选择对手后即可开始比赛 | R1 | `8e7119f85b3f68a7` |
| `setupux.reason.other` | 別々のプレーヤーを選ぶと試合を開始できます | Select two different players to start the match | 选择两位不同的球员后即可开始比赛 | R1 | `36c2e25e860c6a17` |
| `setupux.reason.aria` | 試合を開始できない理由 | Why the match cannot start yet | 暂时无法开始比赛的原因 | R1 | `3b379a15378c73c1` |
| `setupux.menu.other` | その他… | Other… | 其他… | R0（既存語＋省略記号） | `082ccd1f29856e5e` |
| `setupux.menu.close` | メニューを閉じる | Close menu | 关闭菜单 | R1 | `c7b96d565366a7ed` |

## 4. QA 結果（キー別）
共通: 既存 Glossary（Official 109）・主カタログの語と照合。先攻／後攻・対戦相手・プレーヤーの語は主カタログに一致（ja 先攻プレーヤー／対戦相手／プレーヤー、en first player／opponent／player、zh 先手球员／对手／球员）。

| キー | 判定 | 根拠・指摘 |
|---|---|---|
| `reason.p2` | **OK（推奨）** | 主カタログ「対戦相手を選択／Select opponent／选择对手」と語が一致。ja「〜を選ぶと試合を開始できます」は自然。en「Select an opponent to start the match」は自然（命令形＋目的）。zh「选择对手后即可开始比赛」は自然。実際に表示される唯一の理由文。 |
| `reason.p1` | OK（到達しにくい） | ja「先攻プレーヤー」は主カタログ p3.cedaf537 と一致。en は主カタログ「Select first player」に冠詞 the を足した文（文として自然）。zh「先手球员」は主カタログと一致。**320 幅の en が最長（利用可能幅 292px に対し 282px、余裕 10px）。** |
| `reason.both` | OK（到達しない） | 語は主カタログと一致。 |
| `reason.other` | **要判断（削除推奨）** | 通常操作で到達しない。ja「別々の」は「別の」の方が自然、zh「两位不同的球员」は自然。**320 幅の ja／en は 1 行に収まらず（利用可能幅 292px と同値）折り返す。** 到達しないため、キー削除（理由は `reason.both` で代用）を推奨。 |
| `reason.aria` | 要改善（VoiceOver） | 理由行の `aria-label` を「試合を開始できない理由: 対戦相手を選ぶと…」と組み立てて使用。**ボタンの動作（押すと選択画面へ進む）が読み上げに含まれない**。§5 参照。 |
| `menu.other` | OK（要整理） | 主カタログ p3.7c2281ce「その他／Other／其他」と同語に省略記号「…」（追加入力へ進む iOS 慣習）。新規キーにせず、主カタログの語＋「…」をコードで組み立てれば新規キー不要（R0）。 |
| `menu.close` | **未使用（削除推奨）** | 製品コードで 1 度も参照されていない（`match-setup-ux-v1.js` に 0 件）。メニュー外タップ・Escape で閉じる。主カタログに「閉じる／Close／关闭」（p3.3da5c185）が既にある。 |

## 5. VoiceOver 文言（実機は NOT VERIFIED）
- 理由行（role=status 内のボタン）: `aria-label` = 「試合を開始できない理由: 対戦相手を選ぶと試合を開始できます」。status は変化時に読み上げられる想定（実機未確認）。
- **指摘**: ボタンとしての動作が伝わらない。修正候補: `aria-label` は理由文そのものにし、動作は `aria-description`／hint（例「ダブルタップで対戦相手を選ぶ」＝既存キー「対戦相手を選択」を再利用）で伝える。→ 新規キーなしで改善可能。
- 無効の開始ボタン: HTML disabled のため VoiceOver は「使用不可」を読む。理由行が隣接するため、理由を探せる。
- メニュー: `role=listbox`／`option`、選択中 `aria-selected`、閉じるは外タップ・Escape（スクリーンリーダーの Escape ジェスチャ相当）。`menu.close` の読み上げは未実装（キー未使用）。

## 6. PO 判断事項と修正案（推奨）
推奨は「7 キー → 3 キー」への整理。新規の承認対象が減り、リスクも下がる。
1. **採用案 A（推奨）**: 承認対象を 3 キー（`reason.p2`、`reason.both`、`reason.p1`）にする。`reason.other` は削除し（到達しない）、`reason.aria` は理由文自体を `aria-label` にして hint に既存キー「対戦相手を選択」を使う、`menu.other` は主カタログ「その他」＋「…」、`menu.close` は削除。これらはコード変更（新 Build）を伴うため、承認後の別 Gate で実施。
2. **採用案 B**: 現行 7 キーをそのまま承認（未使用・未到達のキーも承認対象になる）。
3. **採用案 C**: `reason.p1`／`reason.both` も削除し、`reason.p2` 1 キー＋汎用フォールバックのみとする（最小）。P1 を外せる仕様が将来入る場合は再追加。
4. 個別修正の希望（例: ja `reason.other`「別々の」→「別の」、en `reason.p1` を短縮「Select the first player to start」など）。

## 7. 表示幅（Chrome 実アプリ、理由 1 行の幅を実測）
利用可能幅 = 画面幅 − 28px。

| 言語 | both | p1 | p2 | other |
|---|---|---|---|---|
| ja | 258 | 284 | 245 | 297（320 幅で折返し） |
| en | 235 | 282 | 268 | 322（320 幅で折返し） |
| zh-Hans | 167 | 193 | 167 | 232 |

- 320 幅の利用可能幅は 292px。到達する案内（both／p1／p2）は全言語で 1 行に収まる。最小余裕は en `reason.p1` の 10px（Dynamic Type の拡大時は折り返す可能性。既存の方針どおり実機未確認）。
- 折り返しても、理由行は固定フッター内で縦に伸びるだけで、設定項目は隠れない（フッターはスクロール領域の外）。

## 8. 残余リスクと NOT VERIFIED
- 人間の独立レビュー: 未実施。zh-Hans の自然さは AI 照合のみ（ネイティブレビューなし）。
- 実機 VoiceOver／Dynamic Type: 未確認。
- 理由行の status 読み上げのタイミング（実機）: 未確認。
- 一次資料の確認が必要な競技用語は含まない（R2 なし）。
- 到達しにくいキーの実画面（P1 未選択など）: Chrome の強制表示のみ、Native 実画面は未確認。

## 9. 現在の状態
- P3-PROVISIONAL を維持（`i18n-catalog-setupux-v1.js`、主カタログに未収録。静的テスト SU-2 で固定）。
- PO が正式承認するまで P4-APPROVED へ変更しない。承認記録・主カタログ移動・Official／Glossary 後継の発行は、Build 95 の PO 実機評価と正式採用判断の後。
- Decision 049／Official 140・141 は候補のまま。
