# 134 CueScore Shot Clock — B4 Manual Three-Button Dock Decision

**状態: Adopted / Official。** 2026-10-27にProduct Ownerの明示承認を得て発行（Decision 046、Official Design Decision Log v2.22）。
**Scope:** 試合画面のショットクロック（手動計測の補助時計）と、試合設定でのON/OFF・基本時間の選択。詳細仕様はOfficial 135。

## 1 番号（fresh確認）

- 直前はDecision 045／Official 133／Decision Log v2.21（main `9a344e5`）。本決定は未使用の**Decision 046**、本書は未使用の**Official 134**、仕様は**Official 135**、Decision Logは**v2.22**。Design Systemは**v2.2**、UI Componentsは**v1.2**を発行する。用語はOfficial 135の付録A（Glossary Addendum）に`CANDIDATE`として置き、**Official 109は改変しない**（理由はD046-10）。
- 語の区別: `docs/official/47` の「Implements: Official Decision 046」は**Official 46**（v1.0 UI Navigation Revision Decision）の旧称であり、Decision Logの番号ではない。Decision Logの**Decision 046は本決定のみ**。
- Decision 001〜045、Official 107〜133は**改変しない**。Design System v2.1／UI Components v1.1／Decision Log v2.21は先行版として保存する。

## 2 背景（確認済みの事実）

- 2026-10-26〜27、ショットクロックのDesign Gate（候補A/B/C）、B案最終調整（B1/B2/B3）、PO方針変更（ボール・ファール等へ連動させない）、B4最終修正Gateを実施。Evidence: `/Users/Ludique/Documents/Codex/2026-10-27/cuescore-shotclock-b4-final-correction/`（PDF 10ページ、600条件のレイアウト検証NG 0、時計OFF時のDOM/全rectハッシュが未導入ビルドと同一）。
- 2026-10-27、司令塔の最終仕様提案に対しProduct Ownerが承認（「ok」）。本チャットの承認指示（【Shot Clock B4 正式承認・実装開始指示】）と本書の内容の対応は、Evidence `phaseA/approval_mapping.md` に記録する。
- **未確認の実機品質は承認済みと扱わない**（実機Dynamic Type、実機200%、実機でのバックグラウンド挙動は NOT VERIFIED）。

## 3 Decision

### D046-1 方式
**B4「手動3ボタン・ログ枠ドック」**。試合画面のログ枠の下端にドックを置き、**開始／一時停止／再開**（1つの主ボタンが状態で変わる）、**リセット**、**延長+60** の3ボタンで、プレーヤーが手動で操作する。

### D046-2 連動ゼロ
ボール入力、ファール、セーフティ、プレーヤー交代、Undo、ラック終了、試合終了と**一切連動しない**（それらでクロックは開始・停止・リセット・延長されず、逆にクロック操作が得点・勝敗・試合履歴・統計・ログ・試合データを変更しない）。

### D046-3 基本時間
通常**45秒**。**30／35／40／45／60秒**から選択する（試合設定）。

### D046-4 リセット
残り時間を基本時間へ戻し、延長回数を0に戻す。**計測中／停止中の状態は維持**する。時間切れ状態は待機へ戻る。**リセットの取消は設けない**。

### D046-5 延長
**+60秒**。**回数制限なし**、延長回数バッジを表示。直後**3秒以内**は取消できる。待機中は延長できない。時間切れからの延長は60秒で計測を再開する。

### D046-6 時間切れ
0秒で停止し、**画面表示のみ**（点滅なし）。**自動ファール・自動採点・自動交代なし**。

### D046-7 既定と範囲
**既定OFF**。音・触覚は**OFF**（本決定では音・触覚の実装を追加しない）。**Free／Pro共通**（課金・IAP・価格・配布地域に影響しない）。

### D046-8 保存
試合データのschema、QR、Backup／Restore、統計は**変更しない**。クロックの設定・状態は試合データと**別のキー**に保存し、Backup・QR・統計の対象に含めない。アプリ再起動後は**停止状態**で復元する。

### D046-9 文字拡大
ログ枠の下端ドックは、320×568で通常（100%）のログが約1行になり（Rotation／3 Cushion）、擬似文字拡大（CSS 130%以上、320幅）ではログ表示が**0行**になる。これを**既知の制約として許容する条件**は、**既存ログのデータを一切削除・変更しない**こと（表示を譲るだけ）、およびクロックをOFFにするとログ表示が従来どおり戻ること。Dynamic Type自動追従は**Decision 033／Official 112のDeferredを変更しない**。擬似拡大の検証は実機200% PASSや全面アクセシビリティ対応を意味しない。

### D046-10 用語
新規20語はOfficial 135の付録Aに`CANDIDATE`として記録する（`APPROVED`／`CONFIRMED`としない）。Official 109は`PENDING`／`CANDIDATE`が0であることをOfficial 108 AC-1とP6の前提としており、内容が固定（SHA固定）されているため、承認前の語を同書へ入れない。P4でPO承認（`P4-APPROVED`）を得た語のみ、後続のOfficial 109 v1.1で`CONFIRMED`として統合する。POの優先候補: zh「出杆计时器」「已暂停」、en延長取消「Undo −60」（ARIAでは「延長の取消」と明示）。

### D046-11 保留
セット方式（set）は**完全保留**。本決定は関与しない。

## 4 影響範囲

- 変更対象: 試合設定画面にショットクロック行（ON/OFF＋基本時間）、試合画面のログ枠下端のドック、新規i18nキー、新規保存キー。
- 維持対象: 試合の計算・記録、ボール入力の位置、操作ボタン、スコアボード、ログのデータ、Home（Official 132／133）、4タブ、Player Identity、Free／Pro、IAP。

## 5 先行記述との関係

| 先行 | 扱い |
|---|---|
| Decision 033／Official 112（Dynamic Type Deferral） | 維持。実機Dynamic Typeは未対応のまま |
| Decision 036／041／Official 117／127（用語承認）、Official 109（Glossary） | 維持。Official 109は無改変。20語はOfficial 135付録AのCANDIDATE、P4経由 |
| Decision 045／Official 132・133（新Home） | 維持。試合設定画面に設定行1行を追加するのみ（Official 135 §6） |
| Design System v2.1／UI Components v1.1 | 後継v2.2／v1.2でショットクロックに限定した追補（T1〜T4） |

## 6 採用時の最終決定

Adopted / Official。Product Ownerの明示承認（2026-10-27、司令塔経由）に基づき発行。

## 7 Current Implementation Status

本Decision発行時点は**Documentation-only**。製品実装は発行後に別commitで行う（Official 135の受入条件に従う）。公開済みVersion 1.3／Build 88、P6正式PASS 31／31、P7未開始、Build 83 RCA STOP、S-B=false、Dynamic Type Deferredは不変。
