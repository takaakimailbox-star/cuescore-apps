# CueScore Game Result / Match Detail 共通レイアウト 実装報告

実装日: 2026年8月13日  
対象ブランチ: `codex/cuescore-result-matchdetail-6disciplines`

## 変更概要

- Game Resultは保存済みrecord IDを`openMatchResultDetailV5`へ渡し、Match Detailと同じ`openMatchDetailV1`で描画する構造へ変更した。
- 両画面は日時・種目、Player／Avatar／最終スコア、競技条件、競技別Metrics、スコア推移まで同一表示となる。
- Game Resultではゲーム履歴と削除UIを生成せず、終了後3アクションを表示する。Match Detailはゲーム履歴、削除UI、削除説明文を維持する。
- 3Cは両画面とも「イニング／ハイラン／アベレージ」の順とし、ファールを表示しない。

## 変更した主な関数

- `renderOfficialMatchResultV1`: 終了結果を保存し、共通rendererへ移譲。
- `openMatchDetailV1`: 共通上半分、Metrics、スコア推移と、mode別下部を描画。
- `chartSvgV1`: 両画面の共通スコア推移renderer。
- `gameHistoryV1`: Match Detailモードでのみ呼び出す履歴renderer。

## 6競技表示

- 9-Ball／10-Ball: シュート率／マス割／ファール。
- Rotation: シュート率／ハイラン／ファール。
- JPA 9-Ball: SL／Race・先取点／最終取得点／マッチポイント／イニング／セーフティ、およびアベレージ／ハイラン／ファール。
- Straight Pool（14.1）: アベレージ／ハイラン／ファール。
- Three Cushion（3C）: イニング／ハイラン／アベレージ。ファールなし。

## 文書更新

- Formal Decision 016と後継仕様017を追加。
- Official Design Decision Log v1.5へDecision 021を追加。Decision 020は削除せず、後続上書き関係を記録。
- `docs/README.md`と`docs/CURRENT_STATE.md`を更新。

## テスト

- `tests/game-result-match-detail-common-layout.test.mjs`を追加。
- 既存の6競技表示、Game Result、Match Detail、PWA versionテストを更新。
- 全テスト: 81件成功、失敗0件。

## 互換性

保存データschema、localStorage、Backup、Restore、過去試合、Undo、Game Result保存取消、JPAマッチポイント算出表は変更していない。Service Workerのキャッシュ識別子のみ更新した。

## Product Owner実機確認画面

1. 6競技でGame ResultとMatch Detailの上半分・スコア推移が一致すること。
2. Game Resultに履歴・削除がなく、3アクションが表示されること。
3. 「試合へ戻る」で暫定保存が取り消され、試合へ復帰できること。
4. Match Detailに履歴、ポケット履歴、削除UI、削除説明文が残ること。
5. JPAの試合結果情報／分析情報、マッチポイント、Player順が正しいこと。
6. 10-Ballの10番マス割と、3Cの「イニング／ハイラン／アベレージ」順・ファール非表示。
7. Player 1実線／Player 2破線と競技別X・Y軸。
8. iPhone縦画面390px以下の横スクロール、カード崩れ、下端safe area。
