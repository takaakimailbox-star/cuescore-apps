# 135 CueScore Shot Clock — B4 Manual Three-Button Dock Specification

- Status: Official Release
- Published: 2026-10-27
- Decision: Official 134（Decision 046）／Official Design Decision Log v2.22
- Design System: v2.2（T1〜T4）／UI Components v1.2／用語: 付録A（Official 109は無改変）
- Applies to: Version 1.4候補以降（iPhone縦画面）。公開済みVersion 1.3／Build 88は変更しない

## 1 状態機械

状態: `idle`（待機中）／`running`（計測中）／`paused`（停止中）／`expired`（時間切れ）。保持値: `base`（30/35/40/45/60）、`remain`、`extCount`、延長取消用スナップショット（3秒）。

| 操作 | 前状態 | 結果 |
|---|---|---|
| 開始 | idle／expired | remain=base、running |
| 一時停止 | running | paused（残り固定） |
| 再開 | paused | running |
| 残りが0 | running | expired（0で停止、通知は画面表示のみ） |
| リセット | 全状態 | remain=base、extCount=0。running／pausedは**維持**。expiredはidleへ。取消なし |
| 延長+60 | running／paused | remain+=60、extCount+=1、3秒間取消可 |
| 延長+60 | expired | remain=60、running、extCount+=1、3秒間取消可 |
| 延長+60 | idle | **無効**（操作不可） |
| 延長取消（3秒内） | 延長直後 | ちょうど60秒を減らして延長前の状態へ戻す（延長後に経過した時間は戻さない）。時間切れからの延長を取り消した場合は時間切れへ戻る。延長回数を1減らす。3秒経過後は取消表示を消す |

## 2 計時方式

- running中は絶対時刻 `deadline` を保持し、`remain = max(0, deadline − Date.now())`。`setInterval`は表示更新のみで残り時間を積算しない。
- 一時停止で `remain` を確定、再開で `deadline = now + remain`。
- バックグラウンド／ロックからの復帰（`visibilitychange`／`pageshow`）で `deadline` から再計算する。バックグラウンド中に0を過ぎた場合は復帰時に expired とする。
- 端末時刻の巻き戻しで `remain` が `base + 60×延長回数` を超える場合は、その上限に丸める。

## 3 保存

- 別キー `cueScore.shotClock.v1`（設定: enabled・base／状態: state・remain・extCount）。試合データ・`cueScore.*`の既存キー・Backup対象・QR・統計に含めない。
- アプリ再起動後は**停止状態**（running→paused）で、保存した残り時間とともに復元する。進行中の試合がない場合は復元しない。
- 保存値が不正（型・範囲外）なら既定（OFF、45秒、idle）に戻す。
- OFFのときは、ドックDOM、クロックのタイマ、試合画面へのクラス付与を行わず、試合画面のDOM／配置は**未導入と同一**（読むのは自分のキーの設定値のみ）。
- 保存する試合の識別子は、開始時刻・プレーヤー名・種目から作る短いハッシュのみ（名前を保存しない）。「試合開始」で始めた新しい試合は待機中から始まり、中断試合を再開した場合のみ、同じ試合の停止状態が復元される。
- 試合画面を離れる（戻る・中断・終了）と、計測中のクロックは停止中になり、残り時間を保存する。

## 4 試合画面

- ドック位置: ログ枠の下端（ボール入力・操作ボタン・スコアボードの位置は不変）。
- 3ボタン: 左からリセット、主ボタン（開始／一時停止／再開）、延長+60。各ボタンの高さは**48pt**、押下領域は44pt以上。ボタン間隔はおよそ8〜12pt。残り時間（数字）と状態語（待機中／停止中／時間切れ）を表示し、**色だけに頼らず**語と記号で示す。点滅しない。
- 延長回数バッジと、延長直後3秒の「取消 −60」表示。
- 大きな文字（擬似拡大）: 130%以上で2段、160%以上で補助語省略、数字拡大は1.5倍上限、ログ枠は譲る（ログのデータは保持）。Design System v2.2 T4。
- ログ枠が約1行（320×568のRotation／3 Cushion）または0行（擬似拡大）になる制約は、Official 134 D046-9の条件で許容する。クロックOFFでログ表示は従来どおり戻る。

## 5 試合設定

- 試合設定画面に「ショットクロック」行を1行追加する（ON/OFFトグル、補足「残り時間を手動で計ります」）。ONのとき基本時間（30/35/40/45/60秒）を選ぶ。
- 行の位置は**開始ボタンより上**とし、開始ボタンへ縦スクロールで到達できること（320×568で必須）。

## 6 Official 132／133 との整合（追加行のみ）

Official 133 §3（選択済み種目のアイコン・名前、プレーヤー、Race to／Skill Level／Target points、ルール表示、試合開始）を維持し、設定行1行のみを追加する。§5の「変更しないもの」とAC-H1〜H12は変更しない。

## 7 アクセシビリティ

VoiceOver名称・状態: ショットクロック、残り時間（30・10・5秒のみ読み上げ）、時間切れ、延長ボタン、延長の取消、リセット、延長回数。試合の「戻る」（Undo）とは別操作であることをARIAで明示する。DS-REQ-035（点滅なし）を維持する。

## 8 受入条件

| ID | 条件 |
|---|---|
| AC-SC1 | ショットクロックOFFのとき、試合画面のDOM・配置・動作が未導入と同一 |
| AC-SC2 | ボール入力・ファール・セーフティ・プレーヤー交代・Undo・ラック終了・試合終了のいずれもクロック状態を変えず、クロック操作が得点・勝敗・履歴・統計・ログを変えない |
| AC-SC3 | §1の状態遷移表のとおりに動作する（リセット時の状態保持、延長+60と3秒取消、時間切れからの延長再開を含む） |
| AC-SC4 | deadline方式で、バックグラウンド・ロックから復帰した後の残り時間が実時間に基づく |
| AC-SC5 | アプリ再起動後、停止状態で残り時間が復元される。不正値は既定へ |
| AC-SC6 | 保存schema、QR、Backup／Restore、統計、Free／Pro、IAPが不変（既存テストの回帰なし） |
| AC-SC7 | ja／en／zh-Hansで文字切れがなく、320／375／390／430幅で3ボタンが操作できる |
| AC-SC8 | 擬似文字拡大（100/130/160/200%）で操作でき、ログのデータを削除しない。実機200%は主張しない |
| AC-SC9 | 試合設定の追加行を含め「試合開始」へ到達できる |
| AC-SC10 | 基本時間30/35/40/45/60の選択が保存され、OFFが既定 |
| AC-SC11 | 新規i18nキーが3言語で揃い、20語はCANDIDATEのまま（APPROVEDと表記しない） |
| AC-SC12 | 既存の自動テストを削除・弱体化しない（置換は旧→新の対応表で記録） |

## 9 本仕様が決めていないこと

音・触覚の実装（既定OFFのみ定義）、セット方式、実機Dynamic Type対応、App Storeでのバージョン／ビルド採番。

## 付録A Glossary Addendum（ショットクロック20語、全語 `CANDIDATE`）

状態: **CANDIDATE（P3-PROVISIONAL → P4-AI-VERIFIED → P4-APPROVED の途中）。APPROVED／CONFIRMEDではない。** POの優先候補は★。AI検証は人間の独立レビューではない。zh競技用語の一次資料は`NOT VERIFIED`。
検証（Evidence `phaseA/translation_check.md`）: 既存Glossary（Official 109）と語が衝突しないこと、320幅での表示、3言語の整合を確認する。

| ID | 用途 | 日本語 | English | 简体中文 | 注意 |
|---|---|---|---|---|---|
| SC01 | 設定行／役割名 | ショットクロック | Shot Clock | ★出杆计时器（別案: 击球计时器） | zh一次資料NOT VERIFIED |
| SC02 | 主ボタン（待機・時間切れ） | 開始 | Start | 开始 | 既存語流用 |
| SC03 | 主ボタン（計測中） | 一時停止 | Pause | 暂停 | |
| SC04 | 主ボタン（停止中） | 再開 | Resume | 继续 | 試合の再開とは別概念（ARIAで時計と明示） |
| SC05 | リセット | リセット | Reset | 重置 | |
| SC06 | 延長 | 延長 +60 | Extend +60 | 延长 +60 | |
| SC07 | 延長の取消（3秒） | 取消 −60 | ★Undo −60（別案: Remove +60） | 撤销 −60 | ARIAは「延長の取消」と明示し、試合のUndoと区別 |
| SC08 | 単位 | 秒 | sec | 秒 | |
| SC09 | 状態 | 待機中 | Ready | 待机 | |
| SC10 | 状態 | 停止中 | Paused | ★已暂停（別案: 暂停中） | 主ボタン「暂停」（動作）と区別 |
| SC11 | 状態 | 時間切れ | Time up | 时间到 | |
| SC12 | 設定補足 | 残り時間を手動で計ります | Count the time manually | 手动计时 | 連動しないことを示す |
| SC13 | 基本時間 | 基本時間 | Base time | 基本时间 | |
| SC14 | ARIA 役割名 | ショットクロック | Shot clock | 出杆计时器 | |
| SC15 | ARIA 残り時間 | 残り{n}秒 | {n} seconds left | 剩余{n}秒 | 30・10・5秒のみ |
| SC16 | ARIA 時間切れ | 時間切れ | Time up | 时间到 | |
| SC17 | ARIA 延長 | 延長、60秒を追加 | Extend, add 60 seconds | 延长，增加60秒 | |
| SC18 | ARIA 延長の取消 | 延長を取り消す | Undo extension | 撤销延长 | 試合の「戻る」と別操作 |
| SC19 | ARIA リセット | リセット、残り時間を基本時間に戻す | Reset, return to base time | 重置，恢复为基本时间 | |
| SC20 | ARIA 延長回数 | 延長{n}回 | Extended {n} time(s) | 已延长{n}次 | |
