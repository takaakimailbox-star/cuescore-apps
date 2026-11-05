# Android システム Back — UX 案と受入条件（PO 判断資料）

状態: **プロトタイプのみ。正式仕様は変更していない**。既定の方針は従来どおり `current`（表示中の画面内 Back ボタンを押す。無ければ最小化）。`proposal` は実行時にだけ選択でき、製品の既定動作・保存データ・iOS/PWA には影響しない。Official Decision 045（ホームは 6 競技タイル＋試合設定の統合）は変更しない。

## 1. 現状（Emulator 実測）
| 画面 | 現行 Back | 問題 |
|---|---|---|
| ホーム（6 競技一覧） | 最小化 | 想定どおり |
| 競技を選択した状態（試合設定） | 最小化 | 競技一覧に戻れない（Decision 045 で `cueMatchSetupBackV3` が削除済み＝押せる Back ボタンが無い） |
| Players／History／Settings タブ | 最小化 | Home に戻らず離脱する |
| Pro オーバーレイ | オーバーレイを閉じる | 良い |

## 2. 提案（`proposal`）
優先順位（上から最初に該当したもの）:
1. **モーダル**（Pro、レース選択、進行中試合の確認、結果確認 など）→ そのモーダルだけ閉じる（既存の Back ボタン選択子に加え、レース選択 `#newMatchRacePickerCloseV1`、進行中確認 `#cueInProgressCancelV1`）。
2. **画面内の Back ボタンが見えている**（現行どおり）→ それを押す。
3. **Players／History／Settings タブ** → Home タブへ。
4. **ホームで競技を選択中** → 競技一覧へ（Home タブ操作と同じ）。
5. **ホームの競技一覧** → 未処理（OS が最小化）。

実装: `android-native-v1.js` の `CueScoreAndroidBackV1.setPolicy("proposal")`（既定 `current`）。判定は DOM の可視状態と `data-phase1-tab`／`body[data-cue-phase1-tab]` のみで、ストレージ・保存形式に触れない。

## 3. 受入条件（PO 承認後の正式化条件）
- [ ] 6 競技すべてで、選択後の Back が競技一覧に戻り、アプリは前面に残る。
- [ ] Players／History／Settings の Back が Home（`cuePhase1Tab=home`）に戻り、アプリは前面に残る。
- [ ] ホーム一覧の Back でアプリが最小化され、プロセスは生存する（データ保持）。
- [ ] Pro オーバーレイの Back がオーバーレイのみ閉じ、最小化しない。
- [ ] 進行中試合の確認／レース選択の Back が各ダイアログを閉じる（実機で追加確認）。
- [ ] 試合中（`#proGameScreen`）の Back は現行どおり（`#proGameBackBtn`）で、誤って試合を破棄しない。
- [ ] iOS／PWA のナビゲーション、`index.html`、保存データ、Free／Pro 境界は無変更。
- [ ] Android 14+ の予測型 Back アニメーションと矛盾しない（Callback は常時有効＝現行実装を維持）。

## 4. Emulator 検証結果
`ANDROID_EMULATOR_EVIDENCE.md` §8 を参照（`mode=back`、実 OS の Back キーで B1〜B6 を確認）。

## 5. PO への選択肢
- A) `proposal` を正式採用（推奨）。
- B) 現行維持（タブ離脱で最小化）。
- C) 一部のみ採用（例: タブ→Home のみ）。

採用する場合の変更は `android-native-v1.js` の既定値の変更と受入条件の実機確認のみ（iOS 変更なし）。
