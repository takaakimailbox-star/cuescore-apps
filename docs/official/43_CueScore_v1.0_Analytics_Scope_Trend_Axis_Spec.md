# CueScore v1.0 — Analytics Scope and Trend Axis Specification

## Normal journey

`Player情報 → 競技詳細 → 指標別推移／自己ベスト／対戦相手別成績／全試合 → Match Detail`

- 競技固定の全試合カードは`詳細`のみ表示する。既存`分析`要素はhidden、`aria-hidden=true`、tab順外とする。
- 対戦相手行は非interactiveなsummaryとし、相手名、試合数、勝敗、勝率、直近結果を表示する。

## Trend graph

- 割合指標のY軸は`100% / 75% / 50% / 25% / 0%`を表示する。
- X軸は`M/D`。同日複数試合は`M/D·1`、`M/D·2`のように区別する。
- 有効な各点はkeyboard focus可能で、選択時にX軸文脈と正確な表示値をcalloutへ出す。
- 勝率、シュート率、ブレイクイン率、マス割り率は小数1桁、ファール率は小数2桁。欠損点は0へ変換しない。
- 390×844 portraitで横overflowを生じさせず、popupを閉じた後は同じPlayer／競技詳細へ戻る。

## Compatibility

Match Analysis、Analysis Home、旧Player Analysis、Rival Analysisの実装と既存recordは保持するが、v1通常導線の構成要素には数えない。
