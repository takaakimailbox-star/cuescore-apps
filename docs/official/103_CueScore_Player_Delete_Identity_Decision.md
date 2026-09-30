# CueScore Apps — Player Delete / Player Identity Decision

**Status:** Product Owner ADOPTED / Source implementation complete / Commit not started

**Decision date:** 2026-09-30

**Authority:** Product Owner decision following the Player Edit Delete / Player ID / Historical Match Retention investigation

## 1. Decision

Player削除はPlayer registryから対象Playerをhard deleteする。完了済みMatchはimmutable historical recordとして保持し、Player削除だけを理由に削除または書換えしない。

## 2. Player UI

- Registration：Deleteを表示しない。
- Edit：既存の正式Delete actionとconfirmationを表示する。
- Player Detail：Deleteを表示しない。
- 通常Player EditにPlayer UUIDを表示せず、通常accessibility treeにも載せない。
- `player.id`、Match側`registeredPlayerId`、navigation、Backup / Restore、Match Sharing local mapping等の内部identityは維持する。

## 3. Historical record

Player削除後も、完了済みMatchの件数、historical Player name、score、event log、analysis / progress data、Match Detailを保持する。削除Playerのhistorical avatarはneutral defaultを使用し、avatar snapshot用schema追加や既存Match書換えは行わない。

残存PlayerのAnalytics / VSには、削除Playerとの過去Matchを含め続ける。削除Player自身はactive Player一覧、Player Detail、registry起点Analytics、active rankingへ表示しない。

## 4. Identity rule

ID付きrecordは`registeredPlayerId`と現在の`player.id`が完全一致する場合だけ同一人物と判定する。名前fallbackは`registeredPlayerId`を持たないLegacy recordだけに許可する。

旧Playerを削除後、同名の新Playerを登録しても、旧ID付きMatchを新PlayerのHistory / Analytics / VSへ混入させてはならない。この規則をHistory、Analytics、VS、Ranking等のderived pathへ一貫して適用する。

## 5. Delete guards

対象Playerが有効なin-progress matchにparticipantとして参照されている場合は削除を禁止する。完了済みMatchへの参照は削除を妨げない。

利用者向け文言：

`このプレーヤーは中断中の試合で使用されています。試合を終了または破棄してから削除してください。`

## 6. Main Player

Main Playerも削除できる。削除後に別Playerを自動Main化せず、Main 0人を許容する。Main複数人禁止は維持する。

## 7. Backup / Restore and Match Sharing

- 既存`beforeDelete`安全退避を維持する。新しい利用者向け復旧UIは追加しない。
- CueScore Pro Backup / Restore contractは変更しない。
- Imported Match participantを削除してもMatchと`sharedMatchId`を保持し、duplicate protectionを維持する。
- sender local Player IDを使用しない。
- Player削除だけを理由に同じQRを再Import可能にしない。Match自体を削除した場合の現行再Import仕様は変更しない。

## 8. Boundary

本DecisionはPlayer Delete / Player identity / historical derived-data整合に限定する。新schema、historical Match migration、avatar snapshot、Backup / Restore仕様変更、Match Sharing仕様変更を含まない。
