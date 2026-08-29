# CueScore v1.0 — Final UI and Data Consistency Spec

Date: 2026-08-29  
Status: Official RC addendum

## Cumulative Trends

1. 対象recordを同Player／同競技で抽出し、古い→新しい順へ並べる。
2. point Nは先頭からN件目までを既存aggregate SSOTへ渡して算出する。
3. 最新pointは全対象recordの主要指標aggregateと一致する。
4. eligible外／no-dataは0へ変換せず欠損として扱う。
5. Build 15の軸、tick、grid、point、同日識別、390×844仕様を維持する。

## Discipline-fixed Match History

- titleは`{競技名}の全試合`とする。
- fixed discipline rowは`勝敗、短縮日時、vs、相手avatar、相手名、score、chevron`を1行中心で表示する。
- card内の競技名とRace toを除外する。Race toの保存値とMatch Detail表示は維持する。
- 長い相手名はellipsisとし、score／chevronを押し出さない。

## Straight Pool Rerack Modal

- title `14ボールラック`の案内だけに中央card、背景overlay、Title、Message、OKを適用する。
- pull handleとswipe closeを表示しない。背面操作を遮断する。
- queueは1件ずつ表示し、OK後に既存のゲーム継続処理を実行する。

## Registered-player Match Setup

- 新規試合開始には、有効な登録Player IDを持つ異なる2人を必須とする。
- 0人時は`プレーヤーが登録されていません`と2人登録の案内を画面に1つ表示する。
- 1人時は登録済みPlayerを一方へ反映し、もう一方に`対戦相手を追加`を表示する。
- 2人以上では既存選択UIを使い、同一Player二重選択を禁止する。
- Player追加の保存／キャンセル／Backは試合設定起点へ戻る。初回起動で登録画面へ強制遷移しない。
- placeholderを新規recordへ保存しない。既存record、Backup／Restoreは保持する。

## Acceptance

- 全既存testとBuild 18回帰testがPASSし、0 fail／意図しないskipなし。
- source／native-web／iOS copied assets一致、390×844横overflowなし。
- Simulator Debug／Releaseが`BUILD SUCCEEDED`となるまで次RCへ進めない。
