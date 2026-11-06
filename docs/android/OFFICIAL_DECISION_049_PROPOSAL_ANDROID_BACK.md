# 【案・未発効】Decision 049 — Android システム Back（A案）の Official 転記案

**状態: DRAFT（司令塔／PO の確認待ち）。** `docs/official/` と Official Decision Log docx は本書で一切変更していない。発行（docx 生成、README 更新、番号の確定）は司令塔の SSOT 作業とする。

## 1 番号（fresh 確認、origin/main `fd5f0cd`）
- 最新の採番: Decision 048（Official 138／139）、Decision Log v2.24、`docs/README.md` も v2.24 を現行と記載。
- 提案: **Decision 049**、決定書 **Official 140**、仕様書 **Official 141**、Decision Log **v2.25**。Decision 001〜048 と Official 107〜139 は改変しない。
- 発行前に、その時点の最新 main で再度「未使用か」を確認すること（並行作業で番号が進む場合がある）。

## 2 Product Owner の承認
2026-11-06、Product Owner が Android システム Back の A案を正式承認（司令塔経由の指示文）。承認範囲は Android システム Back の動作のみ。

## 3 提案する Decision 本文
- **D049-1** Android のシステム Back は次の優先順位で動作する: ①モーダルはそのモーダルだけ閉じる ②画面内の Back ボタンが見えていれば押す（試合中の `#proGameBackBtn` を含む） ③Players／History／Settings → Home タブ ④ホームで競技選択中（試合設定）→ 6 競技一覧 ⑤ホームの 6 競技一覧 → OS が最小化。
- **D049-2** 試合画面の表示中は③④を行わない。試合データを破棄しない。
- **D049-3** iOS／PWA のナビゲーション、`index.html`、保存形式、Free／Pro 境界は変更しない。Decision 045（ホームは 6 競技タイル＋試合設定の統合）を維持する。
- **D049-4** 既定ポリシーは `proposal`。`setPolicy("current")` は検証・ロールバック用に残す。

## 4 根拠と Evidence
`docs/android/ANDROID_BACK_DECISION_A.md`、`ANDROID_BACK_UX_PROPOSAL.md`、`ANDROID_EMULATOR_EVIDENCE.md` §8.5／§10（B0〜B6 は API35／36／16KB で PASS。B7 の扱いは同 §10／§11）。

## 5 残余リスク（偽らない）
実機での確認は未実施（`ANDROID_DEVICE_TEST_PLAN.md` を参照）。予測型 Back アニメーションとの整合は実機未確認。
