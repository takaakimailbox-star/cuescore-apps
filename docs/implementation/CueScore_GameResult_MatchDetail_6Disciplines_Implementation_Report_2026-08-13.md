# CueScore Game Result / Match Detail 6競技仕様 実装報告

実装日: 2026年8月13日  
対象ブランチ: `codex/cuescore-result-matchdetail-6disciplines`

## 変更概要

- 9-Ball／10-Ball: Game Resultをシュート率／マス割、Match Detailをシュート率／マス割／ファールへ統一。
- Rotation: Game Resultの順序をシュート率／ハイランへ変更。Match Detailはシュート率／ハイラン／ファール。
- JPA 9-Ball: Game Resultをイニング／セーフティへ変更し、SL、最終取得点、マッチポイント、Race／先取点を維持。Match Detailでは試合結果情報と分析情報を分離。
- Straight Pool（14.1）: Game Resultをアベレージ／ハイラン、Match Detailをアベレージ／ハイラン／ファールへ統一。
- Three Cushion（3C）: Game Result／Match Detailをアベレージ／ハイランとし、ファール項目を表示しない。
- 共通: スコア推移とゲーム履歴を維持し、Player 1実線／Player 2破線を変更していない。

## 変更した主な関数

- `renderOfficialMatchResultV1`
- `openMatchDetailV1`
- `chartSvgV1`
- `gameHistoryV1`

## 文書更新

- Formal Decision 014を追加。
- 6競技表示仕様の後継追補015を追加。
- Official Design Decision Log v1.4へDecision 020を追加。
- `docs/README.md`と`docs/CURRENT_STATE.md`を更新。

## テスト

- `tests/game-result-match-detail-six-disciplines.test.mjs`を追加。
- 既存のGame Result、10-Ball、Match Detail、競技別summary、PWA versionテストを更新。
- 全テスト: 71件成功、失敗0件。

## 互換性

保存データschema、localStorage、Backup、Restore、過去試合、Undo、Game Result保存取消、JPAマッチポイント算出表は変更していない。Service Workerのキャッシュ識別子のみ更新した。

## Product Owner実機確認画面

1. 9-Ball Game Result／Match Detail
2. 10-Ball Game Result／Match Detail（10番マス割）
3. Rotation Game Resultの指標順／Match Detail
4. JPA 9-Ball Game Result（SL、取得点、マッチポイント、イニング、セーフティ）
5. JPA 9-Ball Match Detail（試合結果情報／分析情報の分離とカード重なり）
6. Straight Pool Game Result／Match Detail
7. Three Cushion Game Result／Match Detail（ファール非表示）
8. 6競技のスコア推移、Player 1実線／Player 2破線、ゲーム履歴
9. iPhone縦画面（390px以下）の横スクロール、カード崩れ、下端safe area
