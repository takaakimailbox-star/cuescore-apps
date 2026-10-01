# CueScore Apps — Player UX Finalization Decision

**Status:** Product Owner ADOPTED / Source implementation complete / Player UX and Interrupted Match modal Physical PASS

**Decision date:** 2026-10-01

**Authority:** Product Owner decision following Version 1.2 (81) Physical RC review

## 1. Player List order

Player一覧の正式順序は、`メインプレーヤー → 最新の完了試合日時が新しい順 → registry上の登録順`とする。

- Main Playerは常に先頭。
- Main以外は、そのPlayerが参加した最新の完了試合日時を使用する。
- 最新試合日時が同じPlayer同士、および完了試合がないPlayer同士は登録順を維持する。
- UUID / Player IDを表示順のtie-breakerへ使用しない。
- Player IDはidentity用途として内部保持する。
- 完了試合が追加された後は、次回Player一覧表示で最新試合順へ移動してよい。

既存Player registry配列の順序をregistration orderとして使用する。新しい`createdAt`等の保存field、migration、schema変更は追加しない。Backup / RestoreはPlayer配列順をそのままround-tripする。

## 2. Delete confirmation

Player Editの削除確認は、WebView system `confirm()`の`Cancel / OK`へ依存しない。CueScoreのDialog contractに従うcustom confirmationを使用し、Actionは`キャンセル / 削除`とする。

本文は次の意味を維持する。

- `「{Player名}」を削除しますか？`
- `このプレーヤーを削除しても、過去の試合履歴は残ります。`

## 3. Player Delete notification

Player削除成功とin-progress participantによる削除BLOCKは、Player範囲の共通Notification Cardで表示する。

- 白〜neutralのsurfaceを使用し、全面の緑／赤背景を使用しない。
- success / blockedは同じstacked layoutを使用する。
- タイトルと本文を縦に配置し、長い日本語を自然に折り返す。
- semantic success / warningは小さいiconまたはaccentへ限定する。
- safe area、390pt幅、accessibility contrast、live-region semanticsを維持する。

## 4. Protected contracts

- Player rowはname / avatar / edit actionを同じPlayer IDのwrapper内で1:1に保持する。blank rowとorphan pencilを生成しない。
- Player Listはactual scroll ownerへ`Bottom Navigation 68px + 18px + safe area`の末尾余白を持つ。
- Player Delete / Identity、historical Match、same-name identity、Legacy fallback、Analytics / VS、Main 0、in-progress protection、Backup / Restore、Match Sharing duplicate protectionを変更しない。
- RegistrationにDeleteなし、EditにDeleteあり、Player DetailにDeleteなし、visible Player UUIDなしを維持する。

## 5. Verification boundary

Player Delete / Identity、Player List Bottom Navigation、row integrity、新sort、custom confirmation、success／blocked Notification CardはProduct Owner physical PASS済み。

## 6. Resume Match modal focus amendment

Product Owner Physical Reviewで、`中断中の試合があります`modalの`中断中の試合を再開`をタップした際にglobal yellow focus outlineが残ることを確認した。このmodalの`中断中の試合を再開`と`新しい試合を始める`だけは、touch／coarse pointerでyellow outlineを表示しない。programmatic initial focusとglobal focus contractは維持し、keyboard focusは既存neutral `#171717`表現を使用する。

本amendmentはsource implementation、automated test、390×844 Visual、native parity、Physical RC refreshをPASSし、Product Owner physical re-test pendingとして扱う。

## 7. Interrupted Match modal Bottom Navigation amendment

Resume focus修正後のPhysical RCで、modalの最下段`キャンセル`が固定Bottom Navigationの背面へ入るlayout findingを確認した。これは処理freezeではなく、modal backdropが意図どおり背景操作を遮断する一方、唯一見えるdismiss actionがNavigation背面へ隠れたことでfreezeのように感じられた状態である。

modalはBottom Navigation 68px、通常余白18px、iOS bottom safe areaを予約し、modal内部は短いviewportまたはDynamic Type時に縦scroll可能とする。modal／backdropはNavigationより前面で操作を所有し、open中のNavigation pointer interactionを無効化する。Navigation自体の位置と高さ、Resume／New Matchのtouch yellow outline 0、keyboard neutral focusは変更しない。

本amendmentはsource implementation、automated test、390×844 Visual、native parity、Release Simulator Build、既存dataを保持したPhysical RC refreshをPASSした。Product Owner physical re-testでも全3action表示、Cancel dismiss、Bottom Navigation overlap 0、Resume／New Match yellow outline 0、close後Home操作をPASSした。

Commit、push、Build 82、Archive、TestFlight、App Store Connect、releaseは本DecisionのImplementation Gateに含めない。

## 8. Implementation outcome / source identity

- Player UXおよびInterrupted Match modalのPhysical AcceptanceはProduct Owner承認済み。
- Accepted Product Source commitは`a0971212b13fa09ace7bbb2b0ab2571a0cd7497b`。
- focused `146/146`、Full Node `596/596`、native parity、Release Simulator BuildをPASSした同一sourceを正本化した。
- Version `1.2`／Build `81`を維持し、Build 82、Archive、Upload、TestFlight、App Store Connect、公開Version 1.1は変更していない。
