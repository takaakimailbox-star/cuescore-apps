# Android システム Back — A案 正式採用記録

- 承認: Product Owner、2026-11-06（A案を正式承認）。承認範囲は **Android システム Back の動作のみ**。
- 位置づけ: Android 専用。iOS／PWA のナビゲーション、`index.html`、保存データ、Free／Pro 境界は無変更。Official Decision 045（ホームは 6 競技タイル＋試合設定の統合）を維持。
- 採番: `docs/official/` の番号体系（最新 138／139）とは衝突させないため、本記録は `docs/android/` に置く。Official Decision Log への正式採番・転記は司令塔（Score）側の SSOT 作業とする。

## 正式動作（上から最初に該当したもの）
1. モーダル（Pro、レース選択、進行中試合の確認、結果確認など）→ そのモーダルだけ閉じる。
2. 画面内の Back ボタンが見えている（試合中の `#proGameBackBtn` を含む、従来どおり）→ それを押す。
3. Players／History／Settings → Home タブへ。
4. ホームで競技を選択中（試合設定）→ 6 競技一覧へ。
5. ホームの 6 競技一覧 → 未処理（OS が最小化）。
- 試合中（`#proGameScreen` 表示中）は 3・4 を行わない。試合データは破棄しない。

## 実装
`android-native-v1.js` の `CueScoreAndroidBackV1` の既定ポリシーを `proposal`（= A案）に変更。`setPolicy("current")` で従来動作へ戻せる（検証・ロールバック用）。判定は DOM の可視状態と `body[data-cue-phase1-tab]` のみで、保存データには触れない。このスクリプトは Android 用 `native-web` ビルドにのみ注入される。

## 受入条件と Evidence
`ANDROID_BACK_UX_PROPOSAL.md` §3、`ANDROID_EMULATOR_EVIDENCE.md` §8.5／§8.6／§10。
