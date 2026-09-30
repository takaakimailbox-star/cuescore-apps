# CueScore Apps — Player Delete / Player Identity Specification

**Status:** Adopted / Source implementation complete / Native sync and full verification complete

**Specification date:** 2026-09-30

**Governing decision:** `103_CueScore_Player_Delete_Identity_Decision.md`

## 1. Player deletion transaction

1. 対象Playerを現在のregistryからIDで解決する。
2. 有効なin-progress matchが対象IDを参照している場合は、write前に削除を拒否する。
3. 既存confirmationで利用者の確定を得る。
4. 既存`beforeDelete` backupを保存する。
5. Player registryから対象IDだけを除外して保存する。
6. 完了済みMatch collectionは変更しない。
7. 他PlayerをMainへ自動昇格しない。

削除処理は完了済みMatch、`sharedMatchId`、event、score、historical nameを書き換えてはならない。

## 2. Identity resolution

各historical participantについて、次の順序だけを使用する。

1. `registeredPlayerId`が存在する場合：current Player IDとの完全一致だけを採用する。ID不一致時は名前比較へfallbackしない。
2. `registeredPlayerId`が存在しないLegacy recordの場合：正規化したhistorical nameとcurrent Player nameの一致を許可する。

このresolver contractをPlayer History、Player Detail record selection、Statistics、Analytics、progress、opponent / VS、active Player Rankingへ適用する。

## 3. Active and historical surfaces

- Player一覧、Player Detail、Player自身のAnalytics、active rankingの起点はcurrent Player registryとする。
- Match HistoryとMatch Detailは保存済みMatchを起点とし、削除Playerのhistorical nameを保持する。
- 残存Playerの集計は、残存Player側がexact IDまたはLegacy fallbackで一致すれば、相手が削除済みでもそのMatchを含める。
- 削除済みPlayerのavatar lookupが解決できない場合はneutral defaultを表示する。

## 4. UI contract

- Registration modal：Deleteなし。
- Edit modal：既存Delete actionあり。tap targetは44×44pt以上。
- Player Detail：Deleteなし。
- Player Edit：UUID rowなし。通常accessibility treeにもUUIDを生成しない。
- Edit footerの`キャンセル / 変更`、safe area、Bottom Navigationとの非重複を維持する。

## 5. In-progress contract

現在の有効なsessionまたは保存されたin-progress stateで対象Player IDがparticipantとして選択されている場合は削除を禁止する。終了済み、破棄済み、保存済み完了Matchだけの参照は許可する。

## 6. Backup / Restore and Match Sharing

- Backup / RestoreはPlayer IDとMatch participant IDを現行contractのままround-tripする。
- Imported Matchのparticipant削除後も`sharedMatchId`をMatchに保持する。
- duplicate lookupはPlayer registryではなく保存済みMatch collectionの`sharedMatchId`を使用する。
- Player削除はduplicate statusを変えない。

## 7. Acceptance criteria

1. RegistrationにDeleteなし。
2. EditにDeleteあり。
3. Player DetailにDeleteなし。
4. Player ID visible UIなし。
5. internal Player ID維持。
6. Player B削除でPlayer数が1減少。
7. 完了Match 10件不変。
8. historical name維持。
9. deleted avatarはneutral。
10. Match Detail正常。
11. Player A試合数維持。
12. Player A勝敗 / 勝率維持。
13. Player A競技別Analytics維持。
14. Player A VS Player B維持。
15. 削除後に同名新Playerを作成可能。
16. 新同名Playerへ旧ID付きMatchを0件混入。
17. IDなしLegacy recordだけname fallback維持。
18. Main Player削除後はMain 0。
19. 他Playerを自動Main化しない。
20. in-progress participant削除をblock。
21. 完了Match participant削除をallow。
22. Backup round-trip維持。
23. Restore後identity維持。
24. Imported Match participant削除をallow。
25. `sharedMatchId`維持。
26. duplicate rejection維持。
27. 他Player / History / Match Sharing regressionを維持。

## 8. Non-goals

新schema、avatar snapshot migration、historical Match書換え、新しいDelete UI、復旧UI、Backup / Restore仕様変更、Match Sharing identity変更は行わない。
