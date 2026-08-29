# CueScore v1.0 — Break Input Immediate Display Spec

Date: 2026-08-29  
Status: Official RC addendum

## Display Contract

1. 対象導線はBreak Playerとrack/game番号を確定する。
2. rack開始通知が必要な導線では通知を表示する。
3. 同じ同期処理内でBreak Input overlayのstate、Player、rack、競技別ball／illegal項目を更新する。
4. `aria-hidden="false"`とvisible stateを即時反映する。
5. Break Input表示のためにtimer、animation完了、Promise、保存または計算完了を待たない。

## Required Paths

- Match開始直後：9-Ball、10-Ball、Rotation、JPA 9-Ball。
- 次rack／game：同4競技、正しいnext Break Playerと次番号。
- Break前ファール等によるBreak権交代。
- Undo復元および14-1 opening rebreakから共通関数へ戻る既存経路。

## Safety and Acceptance

- save操作中は既存guardとdisabled stateで二重入力を拒否する。
- Break Player、rack/game state、入力内容、履歴、Undo、Back tap／edge Swipe Backの契約を維持する。
- 390×844で横overflowを発生させない。
- 全既存testと即時表示回帰testがPASSし、native source／generated／copied assetsが一致すること。
- Simulator Debug／Releaseが`BUILD SUCCEEDED`となるまで次RCを配信しない。
