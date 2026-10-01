# CueScore Apps — Player UX Finalization Specification

**Status:** Adopted / Source implementation complete / Player UX and Interrupted Match modal Physical PASS

**Specification date:** 2026-10-01

**Governing decision:** `105_CueScore_Player_UX_Finalization_Decision.md`

## 1. Formal Player ordering

Player registry配列の各要素について、元の配列indexをregistration indexとして保持する。表示専用のstable sort keyは次の順序だけを使用する。

1. `isPrimary === true`を先頭。
2. current Player identityで解決した保存済み完了Matchの最大`endedAt / playedAt / startedAt`を降順。
3. registration indexを昇順。

Player ID文字列、Player名、`updatedAt`、`lastUsed`を同順位tie-breakerへ使用しない。sortは表示用であり、registry自体を書き換えない。検索／clear後も同じ正式順序へ戻す。

## 2. Registration order persistence

- 新規Playerは現行どおりregistry配列末尾へ追加する。
- Editは同じarray indexのrecordを置換し、登録順を変更しない。
- hard deleteは対象recordだけを除外し、残存Playerの相対順を維持する。
- Backup / RestoreはPlayer配列順を維持する。
- schema追加、migration、新しいregistration-order fieldを禁止する。

## 3. Delete Dialog

- Player EditのDelete tapでcustom `alertdialog`を表示する。
- Titleは`「{Player名}」を削除しますか？`。
- Bodyは`このプレーヤーを削除しても、過去の試合履歴は残ります。`。
- Actionは`キャンセル`と`削除`。`削除`はdestructive semantic stylingを使用する。
- CancelまたはEscapeでwrite 0。Focusを起点へ戻す。
- Deleteの二重実行を防止する。
- Browser / WebView system `confirm()`をPlayer Deleteに使用しない。

## 4. Player Notification Card

Player Delete専用Notification Cardは次を満たす。

- widthは390pt viewportで左右16pt以上を確保。
- surfaceは`color.surface.primary`相当、borderは`color.border.subtle`相当、主要／補助文字はDesign System semantic token相当。
- successは`color.success`、blockedは`color.warning`を小さいicon / accentへ限定する。
- 3-column構造はicon / `minmax(0,1fr)` copy / 44pt Closeとし、copyはTitle＋Bodyのvertical stack。
- 長い本文へ`overflow-wrap`を適用し、title専用の狭いcolumnを作らない。
- successは非ブロッキングstatusとして短時間表示できる。blockedは`role=alert`と明示Closeを持ち、利用者が読めるまで自動消去しない。
- 同時表示は1件。新しいPlayer Delete通知は古いPlayer Delete通知を置換する。
- 既存全アプリtoastの見た目と挙動は変更しない。

表示文言：

- Success title：`プレーヤーを削除しました`
- Success body：`過去の試合履歴は保持されています`
- Block title：`プレーヤーを削除できません`
- Block body：`このプレーヤーは中断中の試合で使用されています。試合を終了または破棄してから削除してください。`

## 5. Row and Bottom Navigation integrity

- `.player-management-row-v1`をreorder単位とする。
- 1 row内に同じPlayer IDの`data-stats-player`と`data-edit-player`を各1個保持する。
- blank row 0、orphan pencil 0、search後も1:1、final Player edit可能。
- Player list real scroll ownerへ`68px + 18px + env(safe-area-inset-bottom)`のclearanceを維持する。

## 6. Acceptance criteria

### Sort

- Main先頭。
- latest completed Match descending。
- 同一timestampはregistry order。
- 試合なしc → d → e → fは同順。
- UUID変更／大小で順序不変。
- 完了試合追加後に対象Playerが最新順へ移動。
- deleted Playerはactive listへ戻らない。
- same-name identity混入0。
- search / clear後も正式順。
- Backup / Restore後もregistry order維持。

### UI / Visual

- Registration Deleteなし、Edit Deleteあり、Detail Deleteなし。
- 0 / 1 / 7 / 12 Playersでrow / edit 1:1、blank 0、orphan 0。
- confirmationは`キャンセル / 削除`。
- success / blocked notificationは390×844およびnarrow viewportでclipping 0、overlap 0、horizontal overflow 0。
- Player最下端とBottom Navigationのclearanceを維持。

### Regression

Player Delete / Identity、Match Sharing、Bottom Navigation、integration、native foundation、Full Node、native parity、Release Simulator BuildをPASSする。Version 1.2 / Build 81を維持し、Build 82、Archive、TestFlight、App Store Connect操作を行わない。

## 7. Resume Match modal focus

- `cueInProgressResumeV1`と`cueInProgressNewV1`はtouch／coarse pointerで`:focus`／`:focus-visible`のyellow outlineとfocus shadowを表示しない。
- 同2ボタンのkeyboard focusはneutral `#171717` outlineを使用する。
- `cueInProgressCancelV1`およびglobal focus contractは変更しない。
- modal open時のResumeへのprogrammatic initial focus、Resume／New Match／Cancelの遷移、48pt action height、Bottom Navigation contractを維持する。
- Player Searchの既存yellow outline suppressionを維持する。

## 8. Interrupted Match modal / Bottom Navigation

- actionはDOM順に`中断中の試合を再開`、`新しい試合を始める`、`キャンセル`の3個。全actionを完全表示またはmodal内部scrollで到達可能にする。
- modal outer insetは`var(--cue-phase1-nav-height, 68px) + 18px + env(safe-area-inset-bottom)`を予約する。
- sheetの`max-height`はdynamic viewport、top／bottom safe area、Navigation高さ、上下余白から算出し、`overflow-y:auto`、touch momentum scrolling、overscroll containmentを持つ。
- modal／backdropはBottom Navigationより前面でpointer interactionを所有する。modal open中はNavigationのpointer interactionを無効化し、close後に解除する。
- Bottom Navigationの位置／68px高さは変更しない。horizontal overflow 0、全action minimum 44pt、dismiss後のHome操作可能を維持する。
- Resume／New Matchのtouch yellow outline 0、keyboard neutral focus、Player Search focus contract、global focus contractを維持する。

## 9. Accepted source identity

- Version 1.2 Player UX Accepted Product Source: `a0971212b13fa09ace7bbb2b0ab2571a0cd7497b`。
- Product Owner Physical Acceptance: Player List／Navigation、row integrity、Player Delete／Identity、sort、confirmation、notifications、Interrupted Match modal `PASS`。
- Automated evidence: focused `146/146`、Full Node `596/596`、native parity、Release Simulator Build `PASS`。
