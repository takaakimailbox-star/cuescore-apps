# CueScore v1.0 — Break Input Immediate Display Decision

Date: 2026-08-29  
Status: Product Owner adopted

## Decision

- Break Inputを遷移操作後の人工的な待機なしで即時renderする。
- rack開始通知は維持するが、Break Input表示の前提条件または待機理由にしない。
- 対象は現行Break Inputを共有する9-Ball、10-Ball、Rotation、JPA 9-Ballとする。
- Match開始、次rack／game、Break権交代、Undo／再ブレイク復帰を同じ即時表示契約に含める。
- 14-1と3 Cushionは現行どおりBreak Input対象外とする。

## Boundaries

- Break Player、rack/game state、card、入力項目、二重入力防止、保存安全性を維持する。
- scoring rules、break判定、foul／safety／dead、turn change、saved-data schema、analytics formula、Backup／Restore、その他UIは変更しない。
- Build 16は旧RCとして再利用せず、全Gate通過後に次の未使用Build番号でRCを作成する。
