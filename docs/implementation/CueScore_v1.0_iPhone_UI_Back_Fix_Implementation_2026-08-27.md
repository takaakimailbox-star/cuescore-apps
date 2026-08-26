# CueScore v1.0 — iPhone UI / Back Fix Implementation Record

Date: 2026-08-27 (JST)
Status: Implementation and automated verification PASS / physical-iPhone recheck pending

## Baseline

- `origin/main` / local: `dabb50b94838705d44cd12535a34ee903f4aded9`
- Marketing Version `1.0` / Build Number `12`
- Build 12 TestFlight内部配信済み。今回の変更は次候補sourceであり、追加uploadは実施していない。

## Implementation

1. Opponent Records — 選択Player／固定競技を白cardから外したsmall avatar付きcompact context headerへ変更。対戦相手cardとUI階層を分離した。
2. Opponent-fixed History — Player vs Opponentから競技icon／textを除外し、small avatarと名前だけへ圧縮。match cardから競技、Opponent avatar／nameをDOM上で除外し、日付／時刻、勝敗、score、race、chevronだけの48px基準layoutへ変更した。
3. Player History — 競技名とOpponent名を保持しつつ、大きな競技iconとOpponent avatarを非表示。54px基準の一行中心layoutへ変更した。
4. Match Detail Back — 履歴card activation時にoriginを保持し、左上Back／edge Swipe Backの双方が呼ぶ`closeFormalMatchDetailV2`で同じhistory rootを復帰する。相手固定／Player履歴を別contextとして保持する。
5. PWA cache — asset更新を確実に反映するため、page／Service Worker／demo asset versionを`2.0-build12-iphone-ui-back-fix-v1`へ同期した。

## Verification

- 専用回帰test: Opponent Records階層、2種類のhistory DOM／CSS契約、tap／keyboard origin保持、共通Back restoreを追加。
- 全自動テスト: `234 pass / 0 fail / 0 skipped`。
- source／`native-web`／`ios/App/App/public`: `index.html`、`ui-revision-v12.js`、`ui-revision-v12.css`のSHA-256一致。
- iOS Simulator Debug: `BUILD SUCCEEDED`。
- iOS Simulator Release: `BUILD SUCCEEDED`。
- 390×844: responsive contract、ellipsis、min-width、別history layout、横幅内gridを自動確認。実iPhoneの表示とgesture体感は再確認までpending。

## Physical-iPhone recheck

1. 相手固定履歴 → Match Detail → 左上`<` → 同じ相手固定履歴。
2. 相手固定履歴 → Match Detail → edge Swipe Back → 同じ相手固定履歴。
3. Player履歴 → Match Detail → 左上`<` → 同じPlayer履歴。
4. Player履歴 → Match Detail → edge Swipe Back → 同じPlayer履歴。
5. 6競技、390×844、長い実Player名、Safe Area、card密度、横overflow。

実iPhone未確認項目をPASS扱いにしない。App Store Review、外部TestFlight、一般公開、追加TestFlight uploadは実施していない。
