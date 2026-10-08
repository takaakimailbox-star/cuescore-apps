# CueScore Apps — Localization Specification v1.0

**Status:** Adopted / Product Owner adopted specification（Decision 031）/ Implementation NOT STARTED。本書は Implementation 前の仕様であり、runtime 検証・実機検証は未実施（NOT VERIFIED の項目は本文に明記）。**Product Owner が承認した D1〜D10・U10 の仕様化であり、条件付き Implementation 事項（S-B 等）は P1 の検証が効力条件である。**

**Specification date:** 2026-10-09（Official 発行）／ Product Owner 承認: 2026-10-08
**Authority:** Product Owner adopted decision（Decision 031、承認 2026-10-08）
**Governing decision:** `107_CueScore_Localization_Decision.md`（Decision 031）
**Official document number:** 108
**Baseline:** `takaakimailbox-star/cuescore-apps` main `117feddc802b9c0d7eccbdced0d96de84f728bf7`（作成時に fresh fetch で確認、変更なし）
**関連（Official 非登録）:** Glossary Draft（Official 109 は未作成。中国語競技用語・マス割・JPA 正式名称・Dead Ball・Rack・Inning・Run・Rotation・Push Out の未確認訳語は **PENDING**）／ Implementation Phase Plan（Part IV に収録）

> 本書の「MUST / MUST NOT / SHOULD」は RFC 2119 の意味で用いる。要件 ID は `L-<領域>-<番号>`（Part I）、`D-/C-/Q-/V/B-`（Part II）、`AC-`（Part III）、`G-SEP-`（Part IV）。
> **未検証の事項は PASS と記録しない。** 本書は runtime 検証・実機検証・Implementation を実施したことを意味しない。

## 構成

| Part | 内容 | 由来（Phase 0 の作業用 Draft。Official 非登録） |
|---|---|---|
| Part I | Specification（言語・解決・保存・切替・Display/Domain 分離・Catalog・Native・UI・未解決事項） | Phase 0 Rev.2 A |
| Part II | Data / QR Compatibility Contract（クラス A/B/C、V1〜V7） | Phase 0 Rev.2 E |
| Part III | Test Acceptance Criteria（AC-1〜AC-21、静的検査 AC-S1〜S10、FAIL 条件） | Phase 0 Rev.2 F |
| Part IV | Implementation Phase Plan・各 Gate の Regression 条件・Gate 分離 | Phase 0 Rev.2 D |

## 必須項目の所在

| # | 項目 | 所在 |
|---|---|---|
| 1 | 対応言語 | Part I §2 |
| 2 | 言語選択・fallback（U10 を含む） | Part I §3（L-RES-1〜11） |
| 3 | 言語設定の保存 | Part I §4（L-STORE） |
| 4 | `html lang` | Part I §13（L-I18N-8）、§3（L-RES-9） |
| 5 | i18n architecture | Part I §13 |
| 6 | Translation catalog | Part I §13（L-I18N-1,5,6,7）、§15（L-GLOS-1〜6、状態 `P3-PROVISIONAL`→`P4-APPROVED`） |
| 7 | Display Mapper | Part I §7.2（L-MAP） |
| 8 | 保存データ不変 | Part II-1（D-/C-/B-、クラス A/B/C、Control 比較法） |
| 9 | QR 共有互換性 | Part II-2（Q-、V1〜V7、3×3、旧 Build 84） |
| 10 | Player Identity | Part I §7.3（L-ID）、Part II D-2 / C-R4、Part III AC-9 |
| 11 | Match Recording | Part I §6（S-A/S-B/S-C）、Part II §1.2〜1.3（`resultLabel`）、Part III AC-5 |
| 12 | Analytics | Part II D-5 / C-R2、Part III AC-6 |
| 13 | Backup / Restore | Part II D-6、Part III AC-8 |
| 14 | CSV 日本語固定 | Part I §9（L-CSV）、Part II D-8、Part III AC-21 |
| 15 | Demo データ | Part I §9（L-DEMO-1）、Part III AC-21 |
| 16 | Free / Pro | Part I §10（L-PRO）、Part III AC-17 |
| 17 | Paywall | Part I §10（L-PRO-1、L-LEGAL-3） |
| 18 | Native localization | Part I §12（L-NAT）、Part III AC-14 / AC-19 |
| 19 | UI / Accessibility | Part I §14、Part III AC-12 / AC-13 |
| 20 | PWA / Offline | Part I §13（L-I18N-4）、Part III AC-15 |
| 21 | Regression | Part IV（各 Gate の Regression 条件）、Part III §3 |
| 22 | Acceptance Criteria | Part III |
| 23 | STOP 条件 | Part I §6.4、§17（未解決事項ごとの STOP 条件）、Part II-3、Part III §4、Part IV（各 Phase の STOP 条件） |
| 24 | 未解決事項 | Part I §17 |

---

## Part I — Specification

### 1. 目的と範囲

CueScore Apps の**表示言語**を ja / en / zh-Hans の3言語に対応させる。対象は UI 表示文言・アクセシビリティ文言・日時/数値の表示書式・ネイティブ権限文言。

**範囲外（本仕様は変更しない）:** Match schema、Player ID、`registeredPlayerId`、`sharedMatchId`、Match events、scoring logic、analytics calculations、Backup format、QR format、IAP Product ID、Free/Pro entitlement、CSV contract、法務ページ本文、App Store Connect 設定、提供地域。

### 2. 対応言語

| 内部コード（BCP47） | 表示名（自言語表記・固定） | 状態 |
|---|---|---|
| `ja` | 日本語 | 基準言語（現行挙動の正本） |
| `en` | English | 新規 |
| `zh-Hans` | 简体中文 | 新規 |
| `zh-Hant` | 繁體中文 | **今回実装しない**。将来独立追加できる構造とする（§13） |

- L-LANG-1: 言語コードは BCP47 文字列で保持し、`zh` 単独や `zh-CN` を内部コードとして使わない。
- L-LANG-2: 言語名は選択UI上で常に自言語表記。現在言語で翻訳しない（切替先が読めない事故の防止）。

### 3. 言語解決（D1 / D2）

**解決順序（MUST）:**

1. 保存済みユーザー設定（`ja` / `en` / `zh-Hans`。値が `auto` または未保存の場合は次へ）
2. 対応する端末言語
3. 日本語（`ja`）fallback

**L-RES-1（入力）:** 端末言語の候補列は `navigator.languages`（端末の優先言語順）。使えない環境では `[navigator.language]`、それも無ければ空列。評価前に各タグを正規化する: 空白除去、`_` → `-`、大文字小文字を区別しない比較（BCP47 は case-insensitive）。

**L-RES-2（タグ分類表）:** 各タグは次の5分類のいずれかに写像する。

| 分類 | 該当タグ（正規化後・大小無視） | 備考 |
|---|---|---|
| `JA` | `ja`、`ja-*`（`ja-JP` 等） | |
| `EN` | `en`、`en-*`（`en-US`、`en-GB`、`en-AU` 等） | |
| `HANS` | `zh-Hans`、`zh-Hans-*`、**`zh-CN`、`zh-SG`**、**`zh`（地域・文字体系の指定なし）** | 根拠: L-RES-6 |
| `HANT` | `zh-Hant`、`zh-Hant-*`、**`zh-TW`、`zh-HK`、`zh-MO`** | 繁体字。**非対応言語**（D2） |
| `OTHER` | 上記以外すべて（`ko`、`fr`、`yue-*`、`cmn-*`、`wuu-*` など） | 非対応言語（D1）。中国語系の他表記は将来 Gate で再評価 |

- スクリプト（`Hans`/`Hant`）が明示されている場合は**スクリプトを地域より優先**する（例: `zh-Hans-TW` → `HANS`、`zh-Hant-CN` → `HANT`）。
- **L-RES-6（根拠・要再確認）:** 地域のみのタグ（`zh-CN`/`zh-SG` → 簡体、`zh-TW`/`zh-HK`/`zh-MO` → 繁体、`zh` 単独 → 簡体）は、Unicode CLDR の標準的な likely-subtags 規則（`zh → zh-Hans-CN`、`zh-TW → zh-Hant-TW`、`zh-HK → zh-Hant-HK`、`zh-MO → zh-Hant-MO`、`zh-SG → zh-Hans-SG`）に基づく。**この規則は本セッションで一次資料を再取得していない（NOT VERIFIED。P1 で CLDR データまたは実機/Simulator の出力で確認）。**

**L-RES-3（解決アルゴリズム。U10 反映）:** 候補列を**先頭から順に**走査する。

0. **第一要素が繁体字（`HANT`）の場合（U10 RESOLVED）:** 正規化後の候補列の第一要素が `HANT` の場合、後続を評価せず **`ja` を返して終了**する（繁体字が第一優先の端末では、後続の英語・簡体字・日本語を自動選択しない。D2 を優先）。第一要素が `HANT` 以外の場合のみ、以下の手順 1〜5 を適用する。
1. `JA` → `ja` を返して終了。
2. `EN` → `en` を返して終了。
3. `HANS` → **それより前に `HANT` が出現していた場合はスキップ**（繁体字を優先した端末へ簡体字を割り当てない。D2 の趣旨の保護）。出現していなければ `zh-Hans` を返して終了。
4. `HANT`（第一要素以外）/ `OTHER` → 非対応としてスキップし、次のタグへ進む（`HANT` を見たことを記録）。
5. 走査が尽きたら `ja`（D1 / D2）。

**判定結果の例（Part III AC-2 の期待値表として使用）:**

| 端末の優先言語（順） | 解決 | 理由 |
|---|---|---|
| `[]`（取得不可） | `ja` | 候補なし |
| `[ja-JP]` | `ja` | |
| `[en-US]` | `en` | |
| `[zh-Hans-CN]` / `[zh-CN]` / `[zh-SG]` / `[zh]` | `zh-Hans` | HANS |
| `[zh-Hant-TW]` / `[zh-TW]` / `[zh-HK]` / `[zh-MO]` / `[zh-Hant]` | **`ja`** | 繁体字のみ → D2（簡体字へ寄せない） |
| `[ko-KR]` / `[fr-FR]` | `ja` | D1 |
| `[ko-KR, en-US]` | `en` | 非対応をスキップし、対応言語 `en` が存在 |
| `[zh-Hans-CN, en-US]` | `zh-Hans` | 先頭が HANS |
| `[en-US, zh-Hans-CN]` | `en` | 先頭が EN |
| `[ja-JP, zh-Hans-CN]` | `ja` | 先頭が JA |
| `[zh-Hant-TW, en-US]` | **`ja`**（U10 RESOLVED） | 第一要素が HANT → 手順 0。後続の en を選択しない |
| `[zh-TW, en-US]` / `[zh-HK, en-US]` / `[zh-MO, en-US]` | **`ja`** | 同上 |
| `[zh-Hant-TW, ja-JP]` | `ja` | 第一要素が HANT → 手順 0（結果は ja） |
| `[zh-Hant-TW, zh-Hans-CN]` | **`ja`** | 第一要素が HANT → 手順 0。後続の簡体字を選択しない |
| `[zh-Hans-CN, zh-Hant-TW]` | `zh-Hans` | 先頭が HANS（ユーザーが簡体字を優先指定） |
| `[fr-FR, zh-TW, en-GB]` | `en` | |
| `[en-US, zh-Hant-TW]` | `en` | 先頭が EN（繁体字が後続でも先頭を優先） |
| `[ja-JP, zh-Hant-TW]` | `ja` | 先頭が JA |
| `[ko-KR, zh-Hant-TW, en-US]` | `en` | 第一要素は OTHER（HANT ではない）→ 手順 1〜5。HANT をスキップして EN |
| `[ko-KR, zh-Hant-TW, zh-Hans-CN]` | `ja` | 第一要素は OTHER。HANT を記録 → HANS は先行 HANT によりスキップ → 走査終了 |

- **D1/D2 との整合確認（U10 反映）:** (1) 繁体字のみの端末 → `ja`（D2 ✓）。(2) 対応言語が一つも無い端末 → `ja`（D1 ✓）。(3) **繁体字が第一優先の端末は、後続に何があっても `ja`（D2 ✓）**。(4) 繁体字端末を `zh-Hans` へ寄せる経路は存在しない（第一要素が HANT なら手順 0 で終了。第一要素が HANT 以外でも、先行 HANT の後の HANS はスキップ）。(5) 第一要素が繁体字以外の場合は、先行の優先言語解決方針（手順 1〜5）を維持する。(6) **ユーザーの手動選択（保存済み設定）は端末言語に常に優先**する（§3 解決順序 1）。
- **L-RES-7（U10 RESOLVED）:** 端末優先言語の第一要素が `HANT` の場合は `ja`（手順 0）。この規則は**自動解決（`auto`）にのみ適用**され、ユーザーが Settings で手動選択した言語（`ja`/`en`/`zh-Hans`）は常に優先される。第一要素が繁体字以外の端末の挙動は不変。
- **L-RES-8:** 保存済み値が不正（未知値・型違い・読み取り例外）の場合は `auto` として扱い、例外を表に出さない。保存値の修復書込みは行わない。
- **L-RES-5（維持）:** 繁体字端末を `zh-Hans` へ寄せることを MUST NOT（D2）。
- **L-RES-9:** 解決は**起動時に1回**（boot 前に確定）。`auto` の間に端末言語が変わった場合は、次回起動（またはソフトリロード）から反映する。実行中に自動で言語を変えない。
- **L-RES-10（実機確認事項）:** iOS の WKWebView（Capacitor）と PWA（Safari / ホーム画面）が `navigator.languages` に返すタグの実際の形式（`zh-Hans-CN` か `zh-CN` か、繁体字が `zh-Hant-TW` か `zh-TW` か）は**未確認**。本表は双方の表記を網羅するよう設計したが、P1 で Simulator の言語切替と実機で出力を採取して表と突合する（NOT VERIFIED）。
- **L-RES-11（Native との整合）:** iOS ネイティブのバンドル文言（`InfoPlist.strings`）は OS 自身のバンドル言語選択で決まり、上記アルゴリズムは使われない。非対応言語（繁体字端末を含む）では iOS は **`CFBundleDevelopmentRegion`（現在 `en`）** の文言へ fallback する可能性があり、アプリ内 UI は `ja`（D1/D2）・カメラ許可文言は英語、という不一致が起こりうる。→ **U11（P6 で PO 判断）**: `CFBundleDevelopmentRegion` を `ja` にして fallback を揃えるか。D10 が許可する plist / pbxproj 変更の範囲。（iOS の厳密な選択規則は本セッションで未確認 — NOT VERIFIED）


### 4. 言語設定の保存

- L-STORE-1: 言語設定は**独立Key**に保存する。提案名: **`cueScore.language.v1`**（既存の `cueScore.inProgressMatch.v1` と同じ命名系統。確定は Implementation Gate。名前空間は後述の理由で `rotationScoreboard.` を **使わない**。また `CueScoreDemoData.resolveSettingKey` / `activeCueScoreDataKeyV1` による実データ/Demo の Key 切替を**経由しない**（言語は端末設定でありデータ領域に属さない））。
- L-STORE-2: 値は文字列 `"auto" | "ja" | "en" | "zh-Hans"`。未保存 = `"auto"`。
- L-STORE-3: 言語設定を **Match / Player / Category / Season / Backup JSON / QR payload / CSV に混入させない**（MUST NOT）。
- L-STORE-4: 全データ削除・データ復元・Demo切替は言語設定を変更しない（これらは言語Keyを読み書きしない）。
- 根拠（調査済み）: (a) Backup は allow-list（`players / matchRecords / matchCategories / matchSeasons`）で構成され、独立Keyは混入しない。(b) 既存の localStorage 容量監査・一時データ整理は `rotationScoreboard.` 接頭辞のみを走査・削除対象とするため、接頭辞外のKeyは影響を受けない。(c) `activeCueScoreDataKeyV1` による実データ/Demoの名前空間切替は `rotationScoreboard.*` の個別Keyが対象。
- L-STORE-5（確認事項）: Implementation Gate で、全Key列挙・一括削除を行う他経路（Native側の WebView データ消去等）が無いことを再確認し Evidence 化する。

### 5. 設定画面（D3 / §4）

- L-UI-SET-1: Settings に「言語 / Language」行を追加する。ラベルは**日本語・英語の併記**（"言語 / Language"）を基本とし、現在言語に依らず発見できる表記とする（最終表記は既存 Settings の行構造に合わせて Implementation Gate で確認）。
- L-UI-SET-2: 選択肢は 自動 / 日本語 / English / 简体中文。「自動」のみ現在言語で翻訳する（`自動` / `Auto` / `自动`）。
- L-UI-SET-3: 現在の選択を明示（チェックまたは値表示）。「自動」選択時は解決結果を補足表示してよい（SHOULD NOT 過剰装飾）。
- L-UI-SET-4: 既存 Design System v2.1 / UI Components v1.1 の行・値・Chevron コンポーネントを再利用し、新規コンポーネント型を作らない。選択UIの形式（行内シート / 別画面）は **既存Settings suite の遷移パターン**に合わせ、Implementation Gate の P1 Prototype で Product Owner が確認する。
- L-UI-SET-5: Free/Pro による制限を設けない（言語は全員利用可。Entitlement 非接触）。

### 6. 言語切替（D3）

#### 6.1 現行 source で確認した事実（`main@117feddc`）

| # | 事実 | 位置 |
|---|---|---|
| F1 | 進行中試合の snapshot は `cueScore.inProgressMatch.v1`（Demo 時は `CueScoreDemoData.resolveSettingKey` 経由の別Key）。`rotationScoreboard.` 接頭辞の外、**Backup JSON の外**（コード内コメントでも明記） | `index.html` L13309–13316 |
| F2 | snapshot の保存 `persistInProgressMatchV1` は `visibilitychange`（hidden）と `pagehide` で呼ばれ、**`currentGameSessionIdV104` があり、かつ `.app.pro-game-mode` のときだけ書き込む**。live context が無ければ既存 snapshot を**変更せず温存**して return。`gameEnded` または `currentGameRecordSaved` なら snapshot を削除 | L13320–13341, L16250–16251 |
| F3 | 読出し `readInProgressMatchV1` は schemaVersion・必須フィールド・競技種別を検証し、**不正なら snapshot を削除**して null | L13342–13357 |
| F4 | 再開 `restoreInProgressMatchV1` は snapshot の `state` を `restore()` で復元。再開カード（`renderInProgressHomeCardV1`）と競技名・条件文は `IN_PROGRESS_VISUALS_V1` 等から**描画時に生成**（言語は描画時に決まる） | L13359–13455 |
| F5 | アプリ内の「Home へ戻る」（確認ダイアログ → 試合終了）と「ゲームを中断しますか？→ 中断する」は **snapshot を削除（破棄）**する。したがって snapshot が残るのは**アプリのバックグラウンド化・終了時**で、次回起動時に Home の再開カード（中断中の試合）から再開する | L16014–16020, L12530–12538 |
| F6 | Bottom Navigation は match mode（`.pro-game-mode` または proGameScreen 可視）で `hidden`。Settings の Demo 切替には `.app.pro-game-mode` 中の拒否ガード（alert）が既にある | `navigation-shell-phase1.js` L103–107、`index.html` L26553 |
| F7 | `snapshot()` は Domain 状態（スコア、`analysisEventsV60`（`resultLabel` は日本語 canonical）、Player 名、Category/Season 名、反省メモ等）を保存。**表示言語の文字列を意図して保存するフィールドは確認されなかったが、全フィールドの網羅監査は未実施（NOT VERIFIED）**。`rows[].label` は `String(inning)`、`rows[].p1/p2` の要素内容は未確認 | L13187–13226 |
| F8 | 既存テスト `tests/in-progress-match-restore.test.mjs` が再開カード・復元を検証 | tests/ |
| F9 | 用語の衝突: 日本語の「中断」は (i) F5 の破棄操作の文言、(ii)「中断中の試合」（保存 snapshot）の両方に使われる。本仕様では (ii) を **Saved Interrupted Match（SIM）** と呼ぶ。Interrupted Match modal（Physical Accepted の 3 action）は `cueInProgressChoiceV1`（再開／新しい試合／キャンセル） | L8153–8155, L13457–13500 |

#### 6.2 要件

- **L-SW-1:** 切替確定後、設定値を保存し**ソフトリロード**（アプリ全体の再初期化）で全画面へ適用する。DOM全体のライブ再描画・MutationObserver による後追い置換を MUST NOT。
- **L-SW-2（状態モデル）:**

| 状態 | 判定（和集合） | 言語変更 |
|---|---|---|
| **S-A: Live Recording**（試合記録画面で操作中） | `.app.pro-game-mode` ∨ `#proGameScreen` が可視 ∨（`currentGameSessionIdV104` が非 null ∧ ¬`currentGameRecordSaved`）。保存前の結果画面、Break / Push Out / Safety / Foul 等の pending オーバーレイ中を含む | **不可（MUST）** |
| **S-B: SIM（Saved Interrupted Match）** | live context が無い（S-A 非該当）∧ snapshot（Demo 時は解決 Key）が `readInProgressMatchV1` と同等の検証を通る | **可（L-SW-8 の条件付き）** |
| **S-C: 進行中試合なし** | snapshot なし | 可 |

  - S-A の判定は**既存の複数述語の和集合**とし、いずれか1つの見落としで切替可能にならないようにする。
  - 判定は (1) 言語行の描画時、(2) 変更確定時、(3) **`reload` の直前**に再評価する（TOCTOU 対策）。(3) で S-A なら中止して設定値も確定しない。
  - 判定のための snapshot 検証は **read-only**（`readInProgressMatchV1` の「不正なら削除」副作用を、言語行の描画・判定経路から呼ばない。判定用の副作用のない検証関数を用意する）。
- **L-SW-3:** S-A のとき言語行は操作不能（disabled）とし、短い理由を表示する（文言は3言語。例: ja「試合の記録中は言語を変更できません」— 文言は P3 で確定）。
- **L-SW-4:** リロードは snapshot・既存の中断/再開機構に**触れない**。根拠: F2 により live context が無ければ `pagehide` の保存処理は何も書かない。
- **L-SW-5:** 切替の前後で保存データを書き換えない。比較対象と等価性の水準は **本書 Part II §1.6（クラス A/B/C の分類）**に従う。
- **L-SW-6:** リロード後は Settings へ戻る（直前画面の完全復元は要求しない）。
- **L-SW-7:** PWA / Native（Capacitor WebView）双方で同一挙動。Service Worker のキャッシュ更新を要求しない。
- **L-SW-8（S-B で変更を許可する条件。すべて満たすこと）:**
  - **C1:** 言語切替処理は snapshot Key を read（判定用 read-only を除く）/ write / remove しない。
  - **C2:** リロード前後で snapshot の raw 値が **byte-identical**（Demo 時は解決 Key。クラス A）。
  - **C3:** リロード後、Home の再開カードが新言語で描画され、再開で `restoreInProgressMatchV1` が成功し、復元後の状態（`snapshot()` の出力）が切替前の `snapshot.state` と**意味的に等価**（クラス B）。再開後の記録・保存結果が、言語を切り替えなかった場合と同一（クラス A: 確定 Match レコード）。
  - **C4:** snapshot が不正・欠落のときの挙動は現行と同一。言語切替が snapshot の削除・変更の原因にならない（`readInProgressMatchV1` の自己削除は既存挙動であり、言語切替の副作用とは区別する）。
  - **C5:** snapshot の**全フィールド**に表示言語依存の文字列が無いことを P1 で網羅監査して Evidence 化（F7 の補完）。依存が見つかった場合は L-SW-9 を適用。
  - **C6:** `reload` 直前に S-A を再評価し、S-A なら中止（L-SW-2(3)）。
- **L-SW-9（STOP と保守的規則への復帰）:** C1〜C6 のいずれかが P1 の runtime 証明で FAIL した場合、**S-B でも言語変更不可**（SIM が存在する間は不可）へ即時に戻し、P1 を STOP して PO に再判断を求める。**S-B の許可は P1 runtime 証明 PASS を効力発生条件とする**（静的読解だけで無条件には許可しない）。

#### 6.3 必須テスト（P1 Gate）

| ID | 内容 |
|---|---|
| T-SW-1 | S-A の各状況（記録画面、保存前の結果画面、Break 結果 prompt、Push Out 判定、Safety / Foul pending、Dead Ball 入力等）で言語行が disabled、API 直接呼出しでも拒否 |
| T-SW-2 | S-B: 6 競技それぞれで live 試合 → バックグラウンド化で snapshot 作成 → cold start → Home（再開カード）→ 言語切替 → reload → snapshot raw 値が byte-identical → 再開 → 復元状態が等価 → 続行して保存した Match が言語非切替時と同一 |
| T-SW-3 | live context が無い状態の `pagehide` / `visibilitychange` が snapshot を書換・削除しない（reload 中を含む） |
| T-SW-4 | 再開した直後（S-A）に言語変更を試みて拒否される |
| T-SW-5 | Demo モード（`resolveSettingKey`）の snapshot Key で T-SW-2 相当 |
| T-SW-6 | 不正・欠落 snapshot の既存挙動が言語切替の前後で不変 |
| T-SW-7 | TOCTOU: 確定直後〜reload 直前に S-A へ遷移した場合に中止される |
| T-SW-8 | Interrupted Match modal（再開／新しい試合／キャンセル）の 3 action が 3 言語で同一挙動（Physical Accepted の維持） |
| T-SW-9 | 言語切替後も Free/Pro の記録アクセス判定が不変 |
| T-SW-10 | 既存 `in-progress-match-restore.test.mjs` が 3 言語で PASS |

#### 6.4 STOP 条件
snapshot の byte 差異／復元状態の非等価／S-A で言語変更が可能／reload で snapshot が削除・再書込みされる／ja 表示の差分／Interrupted Match modal の挙動変更／Physical Accepted UI の変更。

### 7. Display層 / Domain層の分離

#### 7.1 原則
- L-ARCH-1: **Domain層**（保存・共有・計算・識別）は言語非依存で現行値を維持する。**Display層**（画面に出す文字列）だけが言語依存。
- L-ARCH-2: 保存値の新規 migration（日本語canonical値 → 英語コード等への書換え）は **採用しない**。
- L-ARCH-3: ユーザーが英語・中国語UIで試合を記録しても、保存される domain value は日本語canonical値のまま（翻訳しない）。
- L-ARCH-4: 日本語文字列比較を**無条件に削除しない**。分離方針を次の3種に分類し、1件ずつ特性テスト（characterization test）で既存挙動を固定してから移行する。

| 分類 | 例（調査済み） | 方針 |
|---|---|---|
| (a) Domain値どうしの比較 | `resultLabel === "無得点"`、`['1個','2個以上',…].includes(resultLabel)`、`item.name === "大会"`（既定カテゴリ） | **比較は維持**。ただし散在リテラルを Domain層の名前付き定数（例 `BREAK_RESULT_LABELS`）へ集約し、比較先を Display文言と混同しない。値は変更しない |
| (b) 表示文言（DOM/ラベル）との比較 | `title.textContent === "プレーヤー一覧"`、`textContent.includes("編集")`、`notice.title === "14ボールラック"`、`.analysis-v2-status === "蓄積中"` | **表示文言との比較を廃止**し、状態・ID・`data-*`・コード値での分岐へ置換（挙動同一を特性テストで保証） |
| (c) 描画後DOM書換え（MutationObserver） | Analytics v2 の「蓄積中」強制補正、「…と同じ」文言補正、ui-revision-v12 の `reviseDetail`、日付regex（`（.）`曜日） | 生成元で正しい文言/状態を直接生成し、Observer による**文言**書換えを廃止。DOM構造・表示順の補正のみを行うObserverは対象外（挙動維持） |

- L-ARCH-5: 上記(b)(c)の置換は、**日本語表示のスナップショットが変わらない**（DOM/テキスト同一）ことを P1/P2 の受入条件とする。

#### 7.2 Display Mapper（保存値 → 表示）
- L-MAP-1: 保存された日本語canonical値を表示キーへ写像する純関数群を Display層に置く。入力は保存値（変更しない）、出力は翻訳済み文字列。
- L-MAP-2: **未知値は原文のまま表示**（欠落・将来値・ユーザー値で例外を出さない、推測翻訳しない）。
- L-MAP-3: 初期対象
  - `break_result.resultLabel`: `無得点` / `1個` / `2個以上` / `3個以上` / `スクラッチ` / `イリーガル` / `ブレイク失敗` / `ブレイクファール` / `ファール（ブレイク交代）` / `${n}球イン`（n は数値。正規表現で抽出し数値を保持）。
  - 既定カテゴリ名（§8）。
  - 分析ステータス表示（`好調` / `要調整` / `安定` / `蓄積中` 等）は、生成元で状態コードを持たせ表示のみ翻訳（保存値ではないため migration 不要。算出ロジック・閾値は不変）。
- L-MAP-4: Mapper は保存データを書き換えない（read-only）。

#### 7.3 同一性判定のロケール固定
- L-ID-1: Player名の重複判定・登録Player照合（現行 `toLocaleLowerCase("ja")` / `normalize("NFKC")`）は **UI言語に連動させない**（固定ロケールを維持し、名前付き定数へ集約）。Player ID / `registeredPlayerId` は不変。
- L-ID-2: 表示ソート（Analytics の同順位タイブレーク `localeCompare(..., "ja")` 等）も**言語非依存の固定照合を維持**し、言語切替で順序が変わらないこと（数値・順位の言語間パリティ）を保証する。UI 言語に連動する照合（Intl.Collator 等）の導入は将来の別 Gate で判断する。
- L-ID-3: Player一覧の正式順序（Spec 106: メイン → 最新完了試合日時 → 登録順）は不変。

### 8. カテゴリ名（D4）

- L-CAT-1: ユーザー作成・編集済みカテゴリ名は**翻訳しない**（そのまま表示）。
- L-CAT-2: 既定ID（`category_free` / `category_tournament` / `category_other`）かつ**保存名が既定の日本語名のまま（未編集）**の場合に限り、表示層で翻訳してよい。ID一致 + 名称一致の**両方**を条件とする。
- L-CAT-3: 保存値（`name`）は変更しない。翻訳版名称を保存しない。
- L-CAT-4: 既存の既定カテゴリ自動補完（`大会` / `その他` をユーザーデータへ追加）の挙動・値は変更しない。
- L-CAT-5: 検索・絞り込み・集計・CSV出力は保存名（日本語）を基準とする。表示翻訳は絞り込み条件のキーにならない。
- `category_free` は固定名 `Free`（`locked:true`）で翻訳対象外。表示翻訳が許されるのは `category_tournament`（保存名 `大会`）と `category_other`（保存名 `その他`）のうち、**ID 一致かつ保存名が既定の日本語名のまま**のものだけ。ユーザーが同名のカテゴリを自作した場合（ID が異なる）は翻訳しない。

### 9. CSV / Backup / QR / Demo（D5 / D6）

- L-CSV-1: CSVヘッダー29列は**日本語固定**。既存CSV contractを変更しない（列定義・順序・値・出力ファイル名規則）。
- L-CSV-2: Backup JSON の schema・key・`format`・`schemaVersion` を変更しない。Backup Share Sheet の表示文言（title/text/dialogTitle）は表示文言として翻訳してよいが、ファイル内容・ファイル名規則は不変。
- L-QR-1: QR payload / Envelope / allow-list を変更しない（詳細は 本書 Part II）。
- L-DEMO-1: Demo選手名等の固有名詞は維持する。**画面ラベルのみ**翻訳する。Demo保存データを変更しない。

### 10. Free / Pro・Paywall・法務（D7）

- L-PRO-1: Paywall のユーザー向け文言（`monetization-v1.js` 由来）は3言語化する。**価格は StoreKit の `displayPrice`** を表示し、文言へ固定価格を埋め込まない（現行方針維持）。
- L-PRO-2: IAP Product ID、Entitlement 判定、購入・復元フローは変更しない。言語は Entitlement に影響しない。
- L-LEGAL-1: Privacy / Support / Terms は**別の法務翻訳・確認Gate**。本仕様の策定・登録 Gate および i18n 実装 Gate（P1〜P6）で、未確認の法務翻訳を正式版へ混入させない（MUST NOT）。
- L-LEGAL-2: 法務ページ未翻訳期間中、アプリ内の法務導線（Settings → 法務表示、iframe）は日本語ページを表示する。この間に en / zh-Hans UI から日本語ページが開くことの注記要否は §17-U3（未解決）。
- L-LEGAL-3: Paywall に表示する購入条件等の文言のうち、法的効力・Apple要件に関わるものは、3言語化にあたり Product Owner 確認を必須とする（§17-U4）。

### 11. App Store / 配信（D8）

- L-ASC-1: 当面は日本限定配信を維持する。海外配信、App Store 掲載言語、スクリーンショット、IAPローカライズ、Privacy表記等は**別Gate**。
- L-ASC-2: 本仕様の策定・実装Gateで App Store Connect を操作しない。
- 留意（調査済み）: アプリ内UI言語が増えても、ストア掲載・提供地域は独立。`Info.plist` の言語宣言（`knownRegions`）と ASC のローカライズは別管理。

### 12. Native（D10）

Implementation Gate で許可する方針（今回は実装しない）:

- L-NAT-1: `InfoPlist.strings`（`ja` / `en` / `zh-Hans`）、`knownRegions` への `ja` / `zh-Hans` 追加、`project.pbxproj` の対応変更、`NSCameraUsageDescription` の3言語化。`Info.plist` / `Info-ScoreRC.plist` の両方を対象とする。
- L-NAT-2: Base の `NSCameraUsageDescription` は現在日本語直書き（調査済み、`CFBundleDevelopmentRegion=en`）。実装時に development region との整合（Base文言の言語）を決め、Evidence に残す。
- L-NAT-6: 非対応言語（繁体字端末を含む）では iOS ネイティブ文言が `CFBundleDevelopmentRegion` へ fallback する可能性がある（L-RES-11、U11）。決定は P6。
- L-NAT-3: iOS のカメラ許可ダイアログ、および WebView の `alert/confirm/prompt` のボタン名は **OS言語**で表示され、アプリ内手動言語設定に追随しない。これを仕様上の既知挙動として明記し、混在表示（例: OS=日本語・アプリ=English）を受入テストに含める。`alert/confirm/prompt` を独自モーダルへ置換するか否かは本仕様では決めない（§17-U6）。
- L-NAT-4: Swift側のエラー文言は英語＋`code`。表示は JS が `code` から翻訳する。Swift文言をそのままUIへ出さない。
- L-NAT-5: Bundle ID / Signing / Product ID / Version / Build は変更しない。

### 13. i18n Architecture（Localization Architecture / Source Audit の設計に基づく要約）

- L-I18N-1: 明示的な `t(key, params)`。`ja` catalog を基準とし、`en` / `zh-Hans` catalog を並置。Display Mapper。BCP47 コード。`document.documentElement.lang` を解決言語へ更新。`Intl` による日時・数値書式。
- L-I18N-2: **DOM全体の MutationObserver による文字列後置換方式を採用しない。**
- L-I18N-3: 既存 Design System と画面構造を維持。文言差替えが原因の寸法・トークン変更は行わない（必要な折返し許可・最小幅調整のみ、公式仕様と衝突する場合は Decision 追記）。
- L-I18N-4: 新規 i18n ファイル（core / catalogs / mapper）は、Implementation Gate で **`sw.js` の事前キャッシュ一覧**および **`scripts/build-native-web.mjs` の同期対象**に登録する（PWA offline・native-web sync）。登録漏れを検知するテストを置く。
- L-I18N-5: 補間は名前付きプレースホルダ `{name}`。文を分割して連結する書き方を禁止し、**文単位のテンプレート**とする。複数形は `Intl.PluralRules`（ja/zh-Hans は `other` のみ）。
- L-I18N-6: キー命名 `screen.component.purpose`。共通語は `common.*`、競技用語は `glossary.*`（Glossary Draft に従う。Official 109 は未作成で Draft を維持）。
- L-I18N-7: fallback 連鎖は `選択言語 → ja → キー名`。開発/テストでは欠落キーを失敗として検出し、リリース成果物では欠落 0 を CI 相当のテストで保証する。
- L-I18N-8: `html lang` は `ja` / `en` / `zh-Hans`。zh-Hans で CJK 字形・改行・VoiceOver 言語が正しく選択されること。
- L-I18N-9: 日付の**保存値は ISO のまま**。表示のみ locale 書式（例: ja `2026/10/08（木）`、en `Thu, Oct 8, 2026`、zh-Hans `2026年10月8日 周四` ※書式は P3 で確定）。表示テキストを parse して処理する実装を禁止。
- L-I18N-10: 数字は ASCII 数字を使用し、桁区切り・小数点は locale 書式。値の計算は表示文字列を介さない。

将来 `zh-Hant`: 写像表へ `zh-Hant` を追加し `catalog-zh-Hant` を並置するだけで済む構造とし、共有コード側に言語固有分岐を置かない（L-LANG-1、§3）。

### 14. UI / Accessibility（基準 390×844）

- L-VIS-1: 以下を 3言語で確認する設計とする: Home / Player / Match Setup / Match Recording / Match Result / History / Analytics / Settings / Match Sharing / Backup・Restore / Free・Pro / Dialog・Toast / Accessibility。
- L-VIS-2: horizontal overflow 0 を目標。重要なボタンおよび数値の clipping 禁止。nowrap + ellipsis の固定幅要素は、既知許容リスト（Player名・ユーザー入力値など翻訳対象でないもの）以外で clipping 0。
- L-VIS-3: 既存 Bottom Navigation、Player UI、各 Modal（Interrupted Match modal 等）の **Physical Accepted 仕様を維持**（寸法・clearance・フォーカス・3 action 等）。
- L-A11Y-1: `aria-label` / `alt` / `title` / `placeholder` 等（調査: 188箇所）を翻訳対象とする。
- L-A11Y-2: `lang` 更新により VoiceOver が各言語で読み上げること。言語混在テキスト（ユーザー入力の Player 名など）は元言語のまま。
- L-A11Y-3: 数値・状態の読み上げ文は文単位テンプレートとする。

### 15. 競技用語

3言語の用語は **Glossary Draft（Official 109 未作成。Draft を維持）** に従う。**アプリ内の意味（公式 Spec で定義）と翻訳候補を区別して管理**する。

- **L-GLOS-1（意味と訳の分離）:** 各用語に「アプリ内の意味（出典: repo 内の公式 Spec / Decision）」と「翻訳候補（en / zh-Hans）」を別欄で持つ。アプリ内の意味が公式 Spec で定義されている語（マス割、Dead Ball、ハイラン 等）は、一般的な競技用語の意味と**完全一致するとは限らない**ため、訳語はアプリ内定義に照らして確認する。
- **L-GLOS-2（状態モデル）:**

| 層 | 状態 | 意味 | 許可される使用 |
|---|---|---|---|
| 用語 | `PENDING` | 候補のみ。一次資料・確認者なし | catalog へ確定投入しない |
| 用語 | `CANDIDATE` | 候補に根拠メモがあるが未承認 | P3 の暫定翻訳の元として使用可 |
| 用語 | `CONFIRMED` | 一次資料（または PO/競技者の承認記録）で確定 | catalog の最終値 |
| 文言（キー） | `P3-PROVISIONAL` | P3 で投入した暫定訳 | 開発・テスト・P5 の目視確認に限る。**リリース候補では不可** |
| 文言（キー） | `P4-REVIEWED` | 指名レビュアー（en / zh-Hans）が確認 | |
| 文言（キー） | `P4-APPROVED` | PO 承認 | リリース候補で可 |

- **L-GLOS-3（P3 暫定翻訳の扱い）:** zh-Hans の PENDING 用語を含む文言を P3 で投入する場合は `P3-PROVISIONAL` とし、ルールの意味を断定する表現を避ける。状態は catalog 本体ではなく**レビュー状態 manifest（配布物に含めない記録）**で管理し、キー単位で `P3-PROVISIONAL → P4-REVIEWED → P4-APPROVED` を記録する。
- **L-GLOS-4（P4 前は正式完成としない）:** 用語集に `PENDING` / `CANDIDATE` が残る間、または `P3-PROVISIONAL` のキーが残る間は、**「3言語対応が完成」と判定しない**。P6 の受入に「`P3-PROVISIONAL` 0、glossary `PENDING`/`CANDIDATE` 0」を含める（Part III AC-1）。
- **L-GLOS-5（ルール定義に関わる語）:** Break & Run（マス割）、JPA 9-Ball、Dead Ball、Rack、Inning、Run（High Run）、Rotation、Push Out は、一次資料または PO/競技者の承認記録なしに `CONFIRMED` にしない。一次資料が未確認の場合は `PENDING` を維持する。
- **L-GLOS-6:** ja の表記ゆれ（`イニング`/`Inning`、`マス割`/`マス割り`、`セーフティー`/`セーフティ`）は ja を変更しない（ja は現行不変が受入条件）。en / zh-Hans は用語集キー経由で一貫させる。

### 16. 検証・受入

受入基準は **本書 Part III** に定義する。日本語版の既存動作を Regression 基準とする。詳細な Data / QR 契約は **本書 Part II** に定義する。

### 17. 未解決事項（Product Owner / 設計レビューでの確認が必要）

状態の定義: **RESOLVED** = 本仕様で仕様化済み（U1 の S-B は P1 の runtime 証明が効力条件）。**FACT-CHECKED** = source で事実を確認して解消。**DECISION PENDING** = 新たな仕様判断が必要で、独自決定しない。

| ID | 内容 | 状態 | 扱い |
|---|---|---|---|
| U1 | 「試合記録中」の範囲（中断試合と言語切替） | **RESOLVED** | §6: S-A（記録中）は不可、S-B（Saved Interrupted Match）は条件付きで可。**効力は P1 の runtime 証明 PASS が条件**（L-SW-8/9）。FAIL 時は保守的規則（SIM 存在中も不可）へ復帰 |
| U2 | `zh`（地域なし）の扱い | **RESOLVED** | §3: `HANS`（`zh-Hans`）。根拠の CLDR 規則と iOS が返す実タグは P1 で確認（NOT VERIFIED） |
| U3 | 法務ページ未翻訳期間の en / zh-Hans UI での注記要否 | DECISION PENDING | 未決 |
| U4 | Paywall の法的/Apple 要件に関わる文言の確認プロセス | DECISION PENDING | PO 確認必須。確認者・手順は未決 |
| U5 | 既定カテゴリ名と翻訳対象 | **FACT-CHECKED** | `category_free` は名称 `Free`（`locked:true`、固定名、削除不可）＝固有名で**翻訳しない**。翻訳対象になりうる既定は `category_tournament`（`大会`）と `category_other`（`その他`）のみ（`index.html` L14625–14648）。D4 条件（既定 ID ＋未編集名）を適用 |
| U6 | `alert/confirm/prompt`（80 呼出）の OS ボタン言語依存 | DECISION PENDING | 現行UI変更に当たるため本仕様では決めない。既知挙動として記録 |
| U7 | CSV 本文の日本語（絞り込み条件列など） | **RESOLVED（D5 の解釈）** | D5「既存 CSV contract を変更しない」に従い、ヘッダー29列に加え**本文・出力条件列も現行どおり**（言語非追従）。解釈の変更が必要な場合は Decision への追記による |
| U8 | Backup Share Sheet 文言の翻訳可否 | DECISION PENDING | Backup の schema/key は不変。Share Sheet の `title`/`text`/`dialogTitle` は表示文言だが D5 が明示していない |
| U9 | 言語行の最終ラベル・選択UI形式 | DECISION PENDING（P1 Prototype で PO 確認） | |
| U10 | 混在リスト（先頭が繁体字、後続に対応言語）の扱い | **RESOLVED（PO 承認 D2 優先）** | §3 L-RES-3 手順 0 / L-RES-7: 繁体字が端末の第一優先言語なら `ja`。後続の英語・簡体字を自動選択しない。先頭が繁体字以外なら既存方針。手動選択は常に優先 |
| U11 | `CFBundleDevelopmentRegion`（現在 `en`）を `ja` にして Native fallback をアプリ内 fallback（ja）と揃えるか | DECISION PENDING（P6） | D10 の範囲内の plist/pbxproj 変更。iOS の選択規則は NOT VERIFIED |


**残る Decision Pending の決定時期（Gate 前提条件）:**

| ID | 決定が必要な時点 | 決定者 | 未決のままで進めてよい範囲 |
|---|---|---|---|
| U3 | **P3 の Settings・法務導線サブ Gate（P3-④）の着手前** | PO | P1・P2・P3 の他画面。法務ページ本体は別 Gate |
| U4 | **P3 の Paywall 文言サブ Gate（P3-④）の着手前** | PO | P3 の他画面 |
| U6 | **P3 着手前**（Alert/Confirm/Prompt の文言を P3 で扱うため。決定前は現行のまま） | PO | P1・P2 |
| U8 | **P3-④（Backup / Restore の Share Sheet 文言）の着手前** | PO | P1・P2・P3 の他画面 |
| U9 | **P1 Prototype のレビュー時**（言語行のラベル・選択 UI） | PO | P1 の実装自体は着手可 |
| U11 | **P6 の Native 変更の着手前** | PO | P1〜P5 |
| 付随: 採番の最終確認 | **確認済み**（2026-10-09: Decision 031 / Official 107 / 108 / Decision Log v2.7 の衝突 0 を fresh main で確認して発行） | ChatGPTりおん / PO | 本 Official 文書群 |
| 付随: U1（S-B 許可）の効力 | **P1（runtime 証明）。Official 発行時点では未検証** | 実装 / PO | — |


**未解決事項ごとの STOP 条件（独自判断で解決しない）:**

| ID | 内容 | 現在の状態 | 決定が必要な工程 | 決定責任者 | STOP 条件 |
|---|---|---|---|---|---|
| U3 | 法務ページ未翻訳期間の en / zh-Hans UI での注記要否 | DECISION PENDING | P3 の Settings・法務導線サブ Gate の着手前 | Product Owner | 決定前に法務導線の en / zh-Hans 文言を確定する、または未確認の法務翻訳を正式版へ混入させる場合 |
| U4 | Paywall の法的／Apple 要件文言の確認プロセス | DECISION PENDING | P3 の Paywall 文言サブ Gate の着手前 | Product Owner | 確認プロセス未決のまま購入条件等の 3 言語文言を確定する場合 |
| U6 | `alert/confirm/prompt`（80 呼出）の OS ボタン言語依存への対応 | DECISION PENDING（決定前は現行のまま） | P3 の着手前 | Product Owner | 決定前に独自モーダル化や呼出し文言の変更を行う場合（現行 UI 変更に当たる） |
| U8 | Backup Share Sheet 文言（`title`/`text`/`dialogTitle`）の翻訳可否 | DECISION PENDING | P3 の Backup 文言サブ Gate の着手前 | Product Owner | 決定前に当該文言を翻訳・変更する場合。Backup の schema/key/ファイル名規則は常に不変 |
| U9 | 言語行の最終ラベル・選択 UI 形式 | DECISION PENDING | P1 Prototype の Product Owner 確認時 | Product Owner | Prototype の PO 確認前に言語行 UI を P2 以降の前提として固定する場合 |
| U11 | `CFBundleDevelopmentRegion`（現在 `en`）を `ja` にするか | DECISION PENDING | P6 の Native 変更の着手前（Native 確認事項） | Product Owner | 決定前に `Info.plist` / `Info-ScoreRC.plist` / `project.pbxproj` の development region・`knownRegions` を変更する場合 |

### 18. 変更管理・開発基準（D9）

- **L-GOV-1（D9）:** `AGENTS.md` と共通開発基準（`共通アプリ開発ルール_v1_2026-09-14.md`）の既存の Git・SSOT・STOP・Evidence ルールを維持する。1 Gate = 1 目的、PASS でも Gate 境界で STOP、FAIL は rollback して STOP、BLOCKED は推測せず STOP。仕様の欠落・矛盾は独自に補完せず Decision Pending とする。
- **L-GOV-2:** 製品仕様・UI/UX・Free/Pro・Bundle ID・Product ID・Version・TestFlight・App Store 提出・公開に関わる判断は PO（共通開発基準 §12 / §13）。

- 本仕様の変更は Decision Log への追記を伴う。
- 本書は 2026-10-09 に Official として発行された（Decision 031、Official Design Decision Log v2.7、Official 107）。仕様内容の変更は Decision Log への追記を伴う。

---

## Part II — Data / QR Compatibility Contract

### Part II-1. Data Compatibility Contract

#### 1.1 不変対象（MUST NOT change）

| # | 対象 | 契約 |
|---|---|---|
| D-1 | Match schema（`matchRecords` の構造・Key・型） | 変更なし。言語対応による新規フィールド追加なし |
| D-2 | Player ID / `registeredPlayerId` | 変更なし。生成・採番・参照規則も不変 |
| D-3 | `sharedMatchId` | 変更なし（UUIDv4、QR生成成功後にのみ永続化の既存規則を維持） |
| D-4 | Match events（`analysis.events`） | 型・フィールド・値を変更しない。**event に言語情報を付けない** |
| D-5 | scoring logic / analytics calculations | 変更なし。入力・出力・丸め・閾値・ソート同順位規則を含む |
| D-6 | Backup format | `format` / `appName` / `schemaVersion` / allow-list（`players, matchRecords, matchCategories, matchSeasons`）/ ファイル名規則 `CueScore_Apps_v1.0_Backup_<stamp>.json` を変更しない |
| D-7 | QR format | 本書 Part II-2 |
| D-8 | CSV | ヘッダー29列は**日本語固定**（D5）。列定義・順序・値生成・出力条件も不変 |
| D-9 | IAP Product ID / Free-Pro entitlement | 変更なし |
| D-10 | Category / Season の保存値 | 名前・ID を変更しない。既定カテゴリの自動補完（`大会` / `その他`）は現行のまま |

#### 1.2 保存される日本語 canonical 値（調査で確認済み）

| 場所 | 値の例 | 契約 |
|---|---|---|
| `break_result.resultLabel`（`analysis.events` 内、Backup と QR payload に含まれる） | `無得点`、`1個`、`2個以上`、`3個以上`、`スクラッチ`、`イリーガル`、`ブレイク失敗`、`ブレイクファール`、`ファール（ブレイク交代）`、`${n}球イン` | **書込み時も日本語のまま**。英語/中国語UIで記録しても翻訳しない。表示時のみ Display Mapper |
| 既定カテゴリ名 | `大会`、`その他`（ID `category_tournament` / `category_other`）、`category_free` の既定名 | 保存名は日本語のまま。表示のみ D4 条件下で翻訳可 |
| Player 名 / Category 名（ユーザー入力） | 任意文字列 | 翻訳しない。そのまま保存・表示 |
| その他の event フィールド（`reason`、`foulType`、`outcome`、`rackEndReason`、`phase`、`result` 等） | コード値（`carom_miss`、`completed` など英字コード） | 既に言語非依存。変更しない |

> 調査では、`resultLabel` 以外に、自由な日本語表示文字列が保存 event へ入る箇所は確認されなかった（grep と allow-list の範囲）。Implementation Gate の P2 開始時に全 `recordAnalysisEventV60(...)` 呼出し（約 25 箇所）を再監査し Evidence 化する（NOT VERIFIED の補完）。

#### 1.3 書込み契約（Write path）

- C-W1: 言語切替処理は `players / matchRecords / matchCategories / matchSeasons` および関連Key（`statisticsFilter`、`dashboardPlayer`、`vsSelection`、進行中試合Key 等）を **read も write もしない**（言語Key のみ書く）。
- C-W2: 記録・保存・共有・復元・CSV・分析のコードパスは `getLanguage()` / `t()` の戻り値を保存値・計算入力に使わない。`t()` が出力に入るのは Display層のみ。
- C-W3: 新規の保存値 migration を作らない。バージョン番号・`schemaVersion` を上げない。
- C-W4: `break_result.resultLabel` を生成する箇所（現行 `saveBreakResultV61` 相当）は、**言語に関係なく同じ日本語リテラルを生成**する。リテラルの Domain層定数化は許可（値は同一）。
- C-W5: Demo データの保存内容を変更しない。
- C-W6: 進行中試合 snapshot `cueScore.inProgressMatch.v1` は言語切替処理が read / write / remove しない。`pagehide` の保存処理は live context が無ければ何も書かない（現行 source で確認、本書 Part I §6.1 F2）。
- C-W7: **既存の正常な書込み**（Sender の初回共有時 `sharedMatchId` 追記、起動時の分類配列の正規化書込み、不正 snapshot の自己削除 等）は言語切替とは別物として扱う。違反判定は §1.6 の Control 比較法で「言語切替が原因の差分」だけに適用する。

#### 1.4 読取り契約（Read / Display path）

- C-R1: Display Mapper は保存値を入力とする純関数（read-only）。未知値は原文表示。例外を投げない。
- C-R2: 分析・集計・フィルタは**保存値（日本語canonical）**で行い、表示翻訳後の文字列で行わない。
- C-R3: 既存の日本語 Domain 値比較（`resultLabel === "無得点"` 等）は維持し、Domain層の名前付き定数へ集約する（値不変）。表示文言（DOM textContent / 画面ラベル）との比較は廃止（状態/ID分岐へ）。
- C-R4: 同一性判定（Player名重複・登録Player照合）は固定ロケール（現行 `ja` + NFKC）を維持し UI言語に連動しない。
- C-R5: 表示ソートの同順位照合は言語非依存の固定照合を維持。言語切替で順位・並びが変わらない。
- C-R6: 日付の保存値は ISO 文字列のまま。表示だけ locale 書式。表示テキストを parse して処理しない。

#### 1.5 言語設定Key契約

- C-L1: 独立Key（提案 `cueScore.language.v1`）。値は `auto | ja | en | zh-Hans`。
- C-L2: `rotationScoreboard.` 接頭辞を使わない（既存の接頭辞外 Key `cueScore.inProgressMatch.v1` と同じ命名系統。`resolveSettingKey` / `activeCueScoreDataKeyV1` の実データ/Demo 切替を**経由しない**）（既存の容量監査・一時データ整理の走査対象外にするため。調査: 当該処理は接頭辞一致のみを対象とし、削除は `corruptBackup` / `beforeLocalRestore` 等の限定パターン）。
- C-L3: 全データ削除・復元・Demo切替で言語Keyを削除/変更しない。Backup・QR・CSV へ出力しない。
- C-L4: 言語Keyの読み出し失敗・不正値は `auto` 扱い（例外を出さない・修復書込みしない）。

#### 1.6 比較対象の分類と等価性の水準

すべてを一律に byte-identical にするのではなく、**3 クラスに分類**する。**Domain データ（クラス A）の契約は緩和しない。**

| クラス | 定義 | 要求水準 | 対象（調査で確認した範囲） |
|---|---|---|---|
| **A** | 完全 byte-identical を要求する Domain データ | **raw 値の SHA-256 が一致**（言語切替・言語別の表示巡回・再起動で不変） | `players` / `matchRecords` / `matchCategories` / `matchSeasons`（`rotationScoreboard.*`、Demo 時は解決 Key）、確定 Match レコード、Backup JSON の内容、CSV の内容、Sender の QR payload（固定入力時）、**進行中試合 snapshot `cueScore.inProgressMatch.v1`（live context が無い間）**、Entitlement / IAP に関わる保存値 |
| **B** | 意味的同一性を確認する一時状態・派生状態 | **構造化比較で等価**（フィールド単位。ゆらぎ許容項目は事前に列挙し、無制限に許容しない） | 再開後に復元された試合状態（`snapshot()` 出力と切替前 `snapshot.state` の等価）、UI 状態 Key（`statisticsFilter.v53`、`dashboardPlayer.v1`、`vsSelection.v1`）、一時退避 Key（`beforeLocalRestore.*`、`corruptBackup.*`、`beforeDelete*`）、実行時刻に依存する項目（`savedAt`、`checkedAt`、`lastUsed` 等）、Receiver が生成するローカル ID（§2.2） |
| **C** | 言語変更により更新が**許される**設定 | 変更を許可するが**許可リストの 1 Key のみ** | `cueScore.language.v1`（値 `auto/ja/en/zh-Hans`）。**これ以外の Key への書込みは C ではなく不正な副作用として扱う** |

#### 既存の正常動作と、言語切替による不正な副作用の区別（Control 比較法）
現行アプリは起動時に localStorage へ書込む正常動作を持つ（例: `initializeClassificationsV381` が分類配列を毎回書込む、Device ID・設定の初期化、`verifiedLocalStorageWrite`、`readInProgressMatchV1` の不正 snapshot 自己削除、`pagehide` 時の snapshot 更新）。したがって「reload の前後で差分がある」こと自体は違反ではない。**言語切替が原因の差分のみを違反とする**ため、次の手順で比較する。

1. 固定 fixture（Demo＋実形式の代表 Match 群、全 6 競技）と clock / UUID / 乱数の注入を準備する。
2. **Settle**: reload を 1 回行い、起動時の正規化書込みを落ち着かせる。状態 **S0** を取得する（全 `rotationScoreboard.*`・`cueScore.*` Key の raw 値）。
3. **Control**: 言語を変えずに reload → **S1**。`Δc = S1 − S0`（既存の正常動作による差分。クラス A の Key は定常状態で `Δc = ∅` を期待し、非 ∅ なら**既存挙動として記録**して仕様判断に回す）。
4. **Switch**: 言語を切り替えて reload → **S2**。`Δs = S2 − S1`。
5. **判定:** `Δs` は**クラス C の Key のみ**（`cueScore.language.v1`）。クラス A: `Δs = ∅`（byte-identical）。クラス B: 構造化比較で等価。
6. **書込みトラップ（Write-trap）:** `Storage.prototype.setItem/removeItem/clear` を計測し、(a) **切替ハンドラ実行中**（reload 前）に発生した書込みは `cueScore.language.v1` への 1 回のみ、(b) **reload 後の起動時書込み**は Control の起動時書込み（Key と値）と同一、を検証する。切替ハンドラが他 Key を読み書きした場合（判定用 read-only を除く）は FAIL。
7. 言語遷移の全組合せ（`ja→en`、`en→zh-Hans`、`zh-Hans→ja`、`auto→ja` ほか）で繰り返す。

**不変契約（緩和しない）:** 試合記録、Player Identity（Player ID / `registeredPlayerId`）、分析値、既存 Backup / QR 形式は、上の分類によって**要求水準を下げない**。クラス B は「Domain データではない一時・派生状態」だけに限定し、Domain データをクラス B へ移すことを禁止する。

#### 受入条件
- **B-1（言語切替サイクル）:** `ja → en → zh-Hans → ja` で クラス A が byte-identical、クラス B が等価、クラス C は language Key のみ。
- **B-2（言語別の記録）:** 同一入力列を ja / en / zh-Hans で記録 → 確定 Match レコード（`analysis.events` の `resultLabel` を含む）がクラス A として byte-identical（ID・時刻・UUID は注入で固定）。
- **B-3（Backup）:** Backup export JSON の内容が 3 言語で同一（`exportedAt` を固定）。
- **B-4（分析値）:** Analytics の全数値出力が 3 言語で完全一致（表示文字列を除く）。
- **B-5（SIM）:** 本書 Part I §6 の S-B 条件 C2・C3（snapshot byte-identical、再開後の等価）。
- **B-6（表示巡回）:** 各言語で全画面を巡回しても クラス A の Key が不変（表示は read-only）。

#### 1.7 Non-goal（明示）
- 保存値の正規化、既存データの修復、日本語ラベルの統一（`イニング`/`Inning` 等）は行わない。


### Part II-2. QR Compatibility Contract

#### 2.1 不変対象（Match Sharing v1）

| # | 要素 | 契約 |
|---|---|---|
| Q-1 | Prefix / Envelope | `CSM1:` ＋ Base45。Envelope v1、magic `0x43 0x53 0x4D 0x31`、header 10 bytes、圧縮 deflate-raw、**整合性ダイジェスト 32 bytes（`DIGEST_BYTES=32`。アルゴリズムの確認は Implementation Gate で再確認）** — いずれも変更しない |
| Q-2 | Payload 内容 | 現行の allow-list（`match-sharing-adapters-v1.js` の `PLAYER_FIELDS` / `EVENT_SPECS` / analysis summary）を維持。**言語設定・翻訳文字列・表示名を追加しない** |
| Q-3 | `sharedMatchId` | UUIDv4。Sender は QR 生成成功後にのみ永続化。Receiver は大小文字非依存の重複判定 |
| Q-4 | Player A/B symmetric mapping | 現行の対称マッピング・third-party import・Unified Receiver UI を維持 |
| Q-5 | Duplicate protection | `sharedMatchId` 一致でブロック。**言語に依存しない** |
| Q-6 | Atomic import | 取り込みトランザクション（all-or-nothing）を維持 |
| Q-7 | Privacy validator | 禁止キー検査（`FORBIDDEN_KEYS`）・文字列長上限・strict validator を維持。**言語対応で緩めない** |
| Q-8 | エラー code | `NON_CUESCORE`、`UNSUPPORTED_VERSION`、`DUPLICATE`、`DEMO_RECEIVER_REJECTED`、`INVALID_SCHEMA` 等の **code は不変**。変えてよいのは表示文言（code→翻訳キー） |

#### 2.2 言語間互換（検証項目を 7 つに区別）

QR 検証では、**何をどの水準（byte / semantic）で比べるか**を区別する。**Receiver が新規生成するローカル ID・時刻を byte-identity 違反と誤判定しない**（ただし atomic import と historical identity の契約は維持する）。

| # | 検証項目 | 水準 | 内容・合格基準 |
|---|---|---|---|
| **V1** | **Sender 側 QR payload** | **byte-identical** | 同一の確定 Match レコード（同一 `sharedMatchId`）に対し、Sender の UI 言語が ja / en / zh-Hans のいずれでも **payload 文字列（`CSM1:…`）が byte-identical**。`sharedMatchId` は事前に固定（または UUID 注入）。圧縮（deflate）のバイト列が決定論的であること（同一ライブラリ・同一入力）を前提とし、非決定論的なら `sharedMatchId` と圧縮前の compact JSON の byte-identity を代替基準とする。**初回共有時の `sharedMatchId` 永続化（`persistSharedMatchId` による matchRecords への追記）は既存の正常動作**であり、言語による差が無いことのみを確認する |
| **V2** | **Receiver 側の保存結果** | **semantic identity** | 同一 payload を ja / en / zh-Hans の Receiver が取込んだ結果が、**許可リストを除いて byte-identical**。許可リスト（Receiver が取込み時に新規生成する項目。調査で確認: `localMatchId`（`matchIdFactory`）、新規作成 Player の `id`（`playerIdFactory`）とそれを参照する `registeredPlayerId`、`now` / `checkedAt` 由来の時刻、Player の作成・最終使用時刻）。**許可リストは実装時に Control 実験で導出する**: 同一言語で ID/時刻の注入値だけを変えて 2 回取込み、差分が出る項目 = 許可リスト。言語間の差分が許可リストの内側に収まること |
| **V3** | **Player mapping の正確性** | **exact** | Player A/B の対称マッピング（既存 Player への割当 / 新規 Player 作成 / third-party import）が、Receiver 言語に依らず同一の `registeredPlayerId` 参照（注入 ID で比較）になる。同名 Player の重複防止（`DUPLICATE_PLAYER_NAME` 等の code）が言語で変わらない。Player 名はユーザー入力のまま保存（翻訳しない） |
| **V4** | **`sharedMatchId` の維持** | **exact** | 取込み後のレコードの `sharedMatchId` が Sender の値と一致（大文字小文字非依存で重複判定）。再共有（Receiver が再び Sender になる場合）でも同一 `sharedMatchId` を維持 |
| **V5** | **Duplicate protection** | **exact** | 同じ `sharedMatchId` の 2 回目の取込みが `DUPLICATE` で拒否され、保存データが不変（クラス A）。拒否の**判定**は言語に依存せず、**表示文言のみ** Receiver 言語 |
| **V6** | **Analytics numeric parity** | **exact（数値）** | 取込んだ Match を含む全分析数値が、同一 payload を ja Receiver が取込んだ場合と一致（表示文字列を除く）。ja 版 Sender → en Receiver などの 3×3 全組合せ |
| **V7** | **旧 Build 84 との互換性** | **双方向** | (a) 旧 Build 84（日本語のみ）が送った QR を新版（3 言語）が受信できる。(b) 新版（3 言語）が送った QR を旧 Build 84 が受信し、保存・分析結果が新版 Receiver と同一になる（`resultLabel` が日本語 canonical であることが前提）。検証は凍結した Build 84 source（`8783c5e2…` 系）を同一テスト基盤で実行する形を提案（Implementation Gate で具体化） |

- **3×3 マトリクス:** Sender ∈ {ja, en, zh-Hans} × Receiver ∈ {ja, en, zh-Hans} の全 9 組合せで V1〜V6 を検証。最低限 **ja→en、en→zh-Hans、zh-Hans→ja** を含む（指示）。V7 は旧版 × 3 言語。
- **維持される契約（誤判定防止の対象外）:** atomic import（all-or-nothing）、historical identity（Player 削除後も保持される履歴）、`sharedMatchId` による重複防止、privacy validator。これらは言語対応で**緩めない**。
- Q-L3: 受信画面・エラー・Toast・Duplicate 表示・Player mapping 文言は **Receiver の UI 言語**で表示する。`resultLabel` は Mapper で Receiver 言語に表示翻訳する。
- Q-L4: `resultLabel` は送信・保存とも日本語 canonical のまま。**この制約が破れる設計は禁止**。
- Q-L7: QR 画像（SVG）の `aria-label` 等のアクセシビリティ文言は UI 言語で翻訳可。QR の視覚内容（モジュール）は不変。

#### 2.3 Camera / Scanner
- Q-C1: Native Scanner のエラーは英語 `code`／`message`。JS が `code` から翻訳表示し、Swift の英語文言を直接UIへ出さない。
- Q-C2: カメラ権限の拒否/制限 UI（Settings-only action と Back のみ。Build 84 で Physical Accepted）の**構造・挙動**を維持し、文言のみ翻訳。
- Q-C3: カメラ許可のシステムダイアログは OS 言語（アプリ内言語と独立）。

#### 2.4 Receiver 側の既知課題（記録）
- `showToast("…", error.message)` 経路（調査: `index.html` 約 6 箇所）で、検証モジュール由来の英語内部メッセージが表示されうる。Implementation Gate で `code → 翻訳キー` マップに置換し、内部メッセージを直接表示しない。


### Part II-3. 契約違反の例（Gate FAIL条件）
1. 英語UIで記録した試合の `resultLabel` が英語で保存される。
2. 言語切替の前後で、クラス A の Key の SHA-256 が Control 比較（本書 Part II §1.6）に対して変わる／切替ハンドラが language Key 以外へ書込む。
3. QR payload に `lang`/`locale` 等が追加される、または Sender の言語により payload が変わる（V1）。
4. 旧 Build 84 で受信した Match の保存・分析結果が、新版 Receiver と異なる（V7）。
5. 言語Keyが Backup JSON / CSV / QR に現れる。
6. 同名 Player の重複判定がUI言語で変わる。

7. Receiver が生成するローカル ID・時刻の差を理由に FAIL 判定する（許可リスト外の差分のみが違反）。
8. 許可リストを Control 実験なしに手書きで拡張し、Domain データの差分を隠す。
9. 進行中試合 snapshot が言語切替の前後で byte 変化する、または再開後の状態が切替前と非等価。

---

## Part III — Test Acceptance Criteria

**基準:** 日本語版の既存動作を Regression 基準とする。既存テストを壊さない。実装 Gate の開始時に baseline（既存テスト数・Full Node の結果）を fresh に取得する。
**注意:** 本書の発行時点では、テストの実装・実行は行われていない。以下は将来の Gate の受入条件であり、**いずれも未実施・未検証である。**

### 0. 総則

- AC-0.1: 全項目 PASS が P6 完了条件。FAIL / SKIPPED は 0（既存の「FAIL／SKIPPED 0/0」報告基準を踏襲）。
- AC-0.2: **既存テストの移行規則**: 既存 87 ファイルは `index.html` 等をソーステキストとして読み、うち 63 ファイルが日本語リテラルを assert している（調査値）。辞書化により旧 source 文字列 assert が不適切になる場合は、**期待する製品挙動（DOM結果・状態・保存値）を維持したまま**検証対象を「ja catalog の値」「描画結果」へ移行する。期待値の緩和・削除でテストを通すことを禁止。移行は P1〜P3 の該当 Gate 内で行い、移行前後の対応表を Evidence に残す。
- AC-0.3: 時刻・UUID・乱数を注入して決定論的にする（byte-identity 検証に必須）。
- AC-0.4: 本環境の調査では Node が無く既存テストを実行できなかった。実装Gateの環境で baseline を必ず再取得する。

### 1. 受入条件マトリクス（Part III の受入項目すべて）

| ID | 領域 | 受入条件（PASS基準） | 検証方法の方向 | 担当Phase |
|---|---|---|---|---|
| AC-1 | **3言語辞書整合** | ja/en/zh-Hans の**キー集合が完全一致**（欠落0・余剰0）。プレースホルダ名・数が全言語で一致。複数形キーの形式が正しい。値が空・TODO・未確定マーカーでない。禁則違反0。**レビュー状態 manifest により、P3 完了時は全キーが `P3-PROVISIONAL` 以上、P4 完了時（＝リリース候補の条件）は全キー `P4-APPROVED`・glossary `PENDING`/`CANDIDATE` 0**。P4 前は「正式完成」と判定しない（本書 Part I L-GLOS-4） | catalog lint ＋ review manifest 検査（Node） | P1〜P4 |
| AC-2 | **Fallback ・言語解決** | キー欠落時 → `ja` → キー名。**本書 Part I §3 の分類表（JA/EN/HANS/HANT/OTHER）と L-RES-3 のアルゴリズムを全ケース（本書 Part I §3 の期待値表: 空列、`ja-JP`、`en-US`、`zh-Hans-CN`、`zh-CN`、`zh-SG`、`zh`、`zh-Hant-TW`、`zh-TW`、`zh-HK`、`zh-MO`、`zh-Hant`、`ko-KR`、`fr-FR`、混在リスト 8 通り以上）でテスト**。タグ正規化（大小・`_`）、スクリプト優先（`zh-Hans-TW`→HANS、`zh-Hant-CN`→HANT）。**繁体字のみの端末が `zh-Hans` にならない**（D2）。`[zh-Hant-TW, zh-Hans-CN]` → `ja`。保存値不正/読取例外 → auto → 解決。**U10 RESOLVED の期待値（必須ケース）: `[zh-Hant-TW, en-US]`→`ja`、`[zh-TW, en-US]`→`ja`、`[zh-HK, en-US]`→`ja`、`[zh-MO, en-US]`→`ja`、`[zh-Hant-TW, zh-Hans-CN]`→`ja`、`[en-US, zh-Hant-TW]`→`en`、`[zh-Hans-CN, zh-Hant-TW]`→`zh-Hans`、`[ja-JP, zh-Hant-TW]`→`ja`、`[ko-KR, zh-Hant-TW, en-US]`→`en`、`[ko-KR, zh-Hant-TW, zh-Hans-CN]`→`ja`。手動選択（保存済み設定）は端末言語より常に優先**。iOS（Simulator/実機/PWA）が実際に返す `navigator.languages` の採取と表の突合（L-RES-10。NOT VERIFIED の解消） | 単体（`navigator.languages` 注入）＋ Simulator/実機の実測 | P1 |
| AC-3 | **Language persistence** | 設定→再起動→保持。`auto` 時は端末変化に追随。全データ削除/復元/Demo切替/Backup restore で変化しない。言語Keyが Backup / QR / CSV に出ない。`rotationScoreboard.` 外に存在 | 単体＋統合 | P1 |
| AC-4 | **言語切替（D3）** | 設定から3言語＋自動に切替可。確定後ソフトリロード＋全画面が新言語（混在0）。`html lang` が `ja`/`en`/`zh-Hans`。**S-A（記録中）は不可、S-B（Saved Interrupted Match）は L-SW-8 の C1〜C6 を満たす場合に可、S-C は可**（本書 Part I §6）。**T-SW-1〜T-SW-10 が全 PASS**。FAIL 時は L-SW-9 に従い保守的規則へ復帰し STOP。進行中試合・SIM の保存・中断・再開が切替前後で不変 | 統合（DOM）＋Simulator ＋ T-SW 群 | P1/P3 |
| AC-5 | **Match recording** | 6競技（9-Ball/10-Ball/Rotation/JPA 9-Ball/14-1/3 Cushion）で、同一入力列を ja/en/zh-Hans で記録し、保存結果が byte-identical（B-2）。`resultLabel` が日本語canonicalのまま。中断→再開・Undo・Break/Push Out/Foul/Scratch/Dead Ball の挙動が ja と同一 | 決定論的 E2E（clock/UUID 注入） | P2/P3 |
| AC-6 | **Analytics numeric parity** | 同一 fixture で全分析数値（勝率・シュート率・ハイラン・マス割率・平均ファール・アベレージ・トレンド・ランキング・対戦相性・MVP）が3言語で完全一致（B-4）。ステータス（好調/要調整/安定/蓄積中）判定が言語間で同一。ソート順同一。コーチ文は語順・複数形が各言語で文法的に成立（レビュー） | 数値スナップショット比較 | P2/P3 |
| AC-7 | **QR sharing 3×3** | 本書 Part II §2.2 の **V1〜V7 を区別して検証**: V1 Sender payload（byte-identical）／V2 Receiver 保存結果（許可リストを除き identical。許可リストは Control 実験で導出）／V3 Player mapping（exact）／V4 `sharedMatchId` 維持／V5 duplicate protection／V6 analytics 数値一致／V7 旧 Build 84 との双方向互換。9 組合せ（ja→en、en→zh-Hans、zh-Hans→ja を含む）。**Receiver が生成するローカル ID・時刻を byte-identity 違反と判定しない**。atomic import・historical identity・privacy validator は維持。Camera denied/restricted UI の構造不変。エラー code 不変 | ランタイム Sender/Receiver E2E（既存 `match-sharing-*` の拡張）＋凍結 Build 84 | P3/P6 |
| AC-8 | **Backup / Restore** | Backup JSON が3言語で同一（B-3）。形式（`format`/`schemaVersion`/allow-list/ファイル名規則）不変。言語切替前後の Restore が同一結果。Restore QuotaExceeded 安全動作・destructive backup の既存挙動不変。CSV ヘッダー29列が日本語固定・内容不変 | 既存 backup/restore/CSV テストの3言語実行 | P2/P6 |
| AC-9 | **Player Identity** | Player ID / `registeredPlayerId` 不変。同名判定（重複防止・照合）が言語で変化しない。Player 削除の historical identity 保持（Spec 103/104）。Player 一覧順序（Spec 105/106）不変。ユーザー入力名は翻訳されない | 既存 `player-delete-identity` 系ほかの3言語実行 | P2/P3 |
| AC-10 | **Navigation** | 4タブ・Back・Settings suite 遷移・Interrupted Match modal（3 action、focus ring 規則）が3言語で同一挙動。**表示文言への依存（例: `プレーヤー一覧` 比較）が残っていない**（静的検査）。Bottom Navigation clearance（Physical Accepted）不変 | 既存 navigation 系の3言語実行＋静的検査 | P2/P5 |
| AC-11 | **Free / Pro** | Entitlement 判定・Product ID・購入/復元フロー不変。Free制限（`record-access` 等）が言語で変化しない。Paywall 文言が3言語で表示（価格は StoreKit `displayPrice` 由来。文言へ固定価格なし）。法的/Apple要件文言は PO 確認済み（U4） | 既存 free-pro 系＋StoreKit Local の3言語実行 | P3/P6 |
| AC-12 | **UI Visual** | 390×844 で 3言語×全画面（Home/Player/Match Setup/Match Recording/Match Result/History/Analytics/Settings/Match Sharing/Backup・Restore/Free・Pro/Dialog・Toast）: **horizontal overflow 0**、重要ボタン・数値の clipping 0（許可リストを除く）。Design System の寸法・トークン不変（差分0）。ja のスクリーンショットが現行と一致（許容差の定義は事前合意） | 自動計測＋スクリーンショット比較（既存 `scripts/capture-*` 流用）＋PO目視 | P5 |
| AC-13 | **Accessibility** | aria-label/alt/title/placeholder が全て翻訳され、日本語の取り残し0（許可リスト除く）。`lang` 更新で VoiceOver が各言語を読む（Simulator/実機確認）。動的文言（`aria-live` 等）が文単位テンプレート。フォーカス順・Modal の focus 挙動が ja と同一 | 静的検査＋DOM検査＋VoiceOver確認 | P5 |
| AC-14 | **Native permission** | `NSCameraUsageDescription` が `InfoPlist.strings`（ja/en/zh-Hans）で提供され、OS言語に応じて許可ダイアログに表示される（Simulatorの言語切替）。`knownRegions`/`project.pbxproj` が整合。`Info.plist`・`Info-ScoreRC.plist` 両方。Bundle ID/Signing/Version 不変。**OS言語とアプリ内言語が異なる場合の挙動が仕様どおり（OS言語優先）** | Simulator 言語切替＋plist 検査 | P6 |
| AC-15 | **PWA / Offline** | 新規 i18n ファイルが `sw.js` 事前キャッシュ一覧と `build-native-web.mjs` の同期対象に登録（登録漏れ検知テスト）。オフライン起動で3言語とも表示。Service Worker 更新動作（`CUESCORE_VERSION_READY`）不変。manifest・アイコン不変 | 既存 PWA テスト＋登録検知＋オフライン起動確認 | P1/P6 |
| AC-16 | **Saved data identity（クラス A/B/C）** | 本書 Part II §1.6: **クラス A は byte-identical**、クラス B は構造化比較で等価、クラス C は `cueScore.language.v1` のみ。Control 比較法（Settle → Control reload → Switch reload）で「言語切替が原因の差分」だけを判定。Write-trap で切替ハンドラの書込みが language Key 1 回のみ、reload 後の起動時書込みが Control と同一。B-1〜B-6 | SHA-256 / 構造化比較 / Storage 計測 | P1〜P6 |
| AC-17 | **Free / Pro contract 維持** | Entitlement 判定・Product ID・購入/復元・Free の記録制限（`record-access` / `free-pro-record-policy`）・価格は StoreKit `displayPrice` 由来が言語で不変。Pro 状態表示・Paywall 文言のみ 3 言語。**言語は Entitlement に影響しない（言語行は Free/Pro で同一）** | 既存 free-pro 系 ＋ StoreKit Local の 3 言語実行 | P1〜P6 |
| AC-18 | **Cloud Sync 非表示の維持** | `data-release-feature="cloud-sync"` 要素が `hidden` のまま（Spec 72）、`cloudSync:false` 不変。Cloud Sync の文言（調査: ユニーク 333 件）は翻訳対象外であり、i18n 導入で表示されない・新規に露出しない | 既存テスト（`navigation-phase2-6.test.mjs`、`service-worker-activation.test.mjs` が `cloud-sync` を参照。専用の hidden テストの有無は P1 で確認）＋ 静的検査 | P1〜P6 |
| AC-19 | **Native 変更の Gate 分離** | Native（`InfoPlist.strings`・`knownRegions`・`project.pbxproj`・`Info*.plist`）の変更は **P6 以降のみ**。P1〜P5 の差分に `ios/` 配下の変更が含まれない（P0 は文書のみ）。Bundle ID / Signing / Version / Build 不変 | diff 検査 | P1〜P6 |
| AC-20 | **App Store 日本限定の維持** | 全 Gate で ASC・提供地域・掲載言語・スクリーンショット・IAP ローカライズ・Privacy 回答の操作 0。P7 以前に Apple 操作が発生しない（D8） | 操作ログ ＋ Evidence 確認 | P0〜P6 |
| AC-21 | **Category / CSV / Demo（D4 / D5 / D6）** | (D4) ユーザー作成・編集済みカテゴリ名は翻訳されない。`category_tournament` / `category_other` は **ID 一致かつ未編集の既定名のみ**表示翻訳され、保存名は不変。`category_free`（`Free`）は翻訳されない。(D5) CSV ヘッダー 29 列・本文・列順・出力条件列が 3 言語で byte-identical、Backup JSON の schema/key 不変。(D6) Demo の Player 名等の固有名詞とDemo 保存データが不変、画面ラベルのみ翻訳 | 単体＋固定 fixture の出力比較 | P2/P3/P6 |

### 2. 追加の静的検査（Gate横断）

| ID | 検査 | 合格 |
|---|---|---|
| AC-S1 | 許可リスト外の日本語リテラル（`.js`/`.html`。コメント・ja catalog・Domain canonical 定数・Demoデータ・法務ページ・Cloud Sync（非表示、対象外）を除く） | 0 件（P3完了時） |
| AC-S2 | 表示文言（`textContent` / `innerText` / `aria-label` 等）との文字列比較 | 0 件（P2完了時） |
| AC-S3 | MutationObserver による**文言**書換え | 0 件（構造補正のみのObserverは許可リストで管理）（P2完了時） |
| AC-S4 | Domain層以外での `resultLabel` 等 canonical 値のリテラル比較 | 0 件（Domain定数経由） |
| AC-S5 | 保存系コードパスでの `t()` / `getLanguage()` 参照 | 0 件 |
| AC-S6 | `toLocaleLowerCase("ja")` 等の同一性判定ロケールが定数経由 | 全箇所（値不変） |
| AC-S7 | **文書整合**（Official 発行・改訂時）: 本書 Part I〜IV と Official 107 の間の要件ID（L-*、U*、V*、AC-*、GL-*、C1〜C6）の相互参照が解決する／廃止IDが残らない | 参照切れ 0 |
| AC-S8 | **D1〜D10 トレーサビリティ**: 各 D が A の要件と F の AC に 1 つ以上対応し、矛盾する要件が 0 | 対応表の欠落 0 |
| AC-S9 | 言語切替処理（`setLanguage` 系）が `cueScore.language.v1` 以外の Key を書かない（Write-trap） | 0 件 |
| AC-S10 | `ios/` 配下の差分が P6 より前の Gate に含まれない | 0 件 |

### 3. 回帰の最小セット（Gate 内 focused → 拡張の順）

1. 該当 Gate の focused テスト（変更領域）。
2. i18n 横断テスト（AC-1〜AC-3、AC-S1〜S6）。
3. 関連既存テスト（Match Sharing 122 / Player・Navigation・Native 67 / dedicated 13 など、Gate に応じ選択。数値は baseline 再取得で更新）。
4. P6 でのみ Full Node ＋ native foundation ＋ native parity ＋ Simulator Release Build。

### 4. FAIL 判定（即 STOP）

保存データ差分（クラス A）／言語切替ハンドラの language Key 以外への書込み／SIM（保存された中断試合）の snapshot 変化・復元非等価／S-A での言語変更可能／`resultLabel` の翻訳保存／QR payload の言語依存／旧版との非互換／分析数値の変化／ja 表示差分／Physical Accepted UI の変更／Version・Build・Bundle ID・Product ID の変更／法務未確認翻訳の混入。

---

## Part IV — Implementation Phase Plan・Regression・Gate 分離

### 共通ルール（全 Phase）

- 開始時に External GitHub main を fresh fetch し、baseline・dirty worktree・同時Writer（Codex）を確認。
- 読む順序: AGENTS.md → 共通開発基準 → `Development_Orchestrator_SSOT.md` → `CURRENT_STATUS.md` → `CURRENT_DECISION.md` → 直前 `CURRENT_REPORT.md` → 必要なコードのみ。
- テストは focused を先に、変更範囲に応じて拡張。**PASS証拠の再利用**は 対象コード/テスト/fixture hash 一致時のみ、再実行しなかった理由を Report に記載（共通開発基準 §10）。
- 各 Gate 完了時: `CURRENT_STATUS` / `CURRENT_REPORT` 更新、変更ファイル・テスト・未解決・STOP理由を記載（共通開発基準 §8）。
- **全Phase共通の保護対象:** 本書 Part II の全項目（Match schema、Player ID、`registeredPlayerId`、`sharedMatchId`、Match events、scoring、analytics、Backup、QR、CSV、IAP Product ID、Free/Pro、Bundle ID/Signing/Version は PO 承認なしに変更しない）、Physical Accepted の Bottom Navigation / Player UI / Modal。
- Version / Build は P1〜P6 で変更しない。変更は P7 の PO 承認時のみ。
- 日本語表示は全Phaseで Regression 基準（ja の DOM/テキストが現行と一致）。
- **Apple 操作（TestFlight / ASC / App Review / Release）は P7 まで禁止。** commit/push は各 Gate の PO 指示に従う（共通開発基準 §16: Gate PASS 後の commit/push を推奨、ただし Gate 指示を優先）。


### P0 — Official Specification / Decision

| 項目 | 内容 |
|---|---|
| 目的 | 承認済み D1〜D10・U10 の Official Decision（031 / Official 107）と Official Specification（108）の確立 |
| 変更可能範囲 | 文書のみ（`docs/official/`、`docs/README.md`、`docs/CURRENT_*`、Decision Log v2.7）。product source・`ios/`・`sw.js`・`index.html` は変更しない |
| 保護対象 | production source、Apple 全操作、既存 Official 文書（既存 Decision 001〜030 の意味・状態・採番） |
| Test | 文書整合（要件 ID 参照切れ 0、D1〜D10・U10 反映、既存 Official との矛盾 0、番号衝突 0） |
| Evidence | Official 発行時の整合監査 Report（`docs/implementation/CueScore_Localization_Phase0_Official_Release_2026-10-09.md`） |
| STOP条件 | 番号衝突／既存 Decision の改変／Glossary PENDING の確定扱い／未解決事項の誤解消 |
| 次Gateへの移行条件 | Product Owner による P1 Implementation Gate の承認（Official 発行は完了。Official 発行と P1 開始は別の承認） |

### P1 — i18n基盤 ＋ 日本語不変Prototype

| 項目 | 内容 |
|---|---|
| 目的 | i18n 基盤を導入し、**日本語表示が現行と完全一致**することを証明する。en/zh-Hans は一部画面（Settings 言語行＋Home 程度）のProtoのみ |
| 変更可能範囲 | 新規: i18n core・ja/en/zh-Hans catalog・Display Mapper 雛形。既存: `index.html` の boot適用点（`html lang` 更新、`data-i18n` 適用）、Settings の言語行、`sw.js` 事前キャッシュ一覧、`scripts/build-native-web.mjs` の同期対象、i18n用テスト。Home等の限定画面の文言抽出（挙動不変） |
| 保護対象 | 本書 Part II 全項目、ja表示（DOM/テキスト同一）、PWA offline・Service Worker 更新動作、Bottom Navigation / Player UI / Modal の Physical Accepted |
| Test | i18n core 単体（本書 Part I §3 の言語解決表の全ケース、補間、複数形）、**iOS が返す `navigator.languages` の実測採取と表の突合（L-RES-10。Simulator の言語切替＋実機＋PWA）**、ja スナップショット一致、言語Key永続化・不正値、クラス A/B/C の Control 比較（本書 Part II §1.6）と Write-trap、**言語切替と中断試合（T-SW-1〜T-SW-10。S-B 許可の runtime 証明）**、snapshot 全フィールドの表示言語依存監査（C5）、キー欠落/余剰検査、`sw.js`/native-web 登録漏れ検知、既存 Full Node（baseline 比較で退行0） |
| Evidence | baseline テスト結果、ja DOM差分0 のスナップショット、Prototype 画面（390×844、3言語）、変更ファイル一覧 |
| STOP条件 | ja の DOM/テキストに差分が出る／既存テスト退行／保存データ差分（クラス A）／**SIM の snapshot 変化・復元非等価（L-SW-9 により保守的規則へ復帰して STOP）**／PWA offline 退行／`html lang` で字形が崩れる |
| 移行条件 | ja スナップショット差分0、Prototype の PO 確認（U9）、T-SW 全 PASS（S-B の許可が確定。FAIL なら保守的規則）、言語解決表の実測突合、Full Node 退行0 |

### P2 — 日本語依存ロジックの安全な分離

| 項目 | 内容 |
|---|---|
| 目的 | Display層とDomain層を分離。本書 Part I §7.1 の (a)(b)(c) を**特性テストで挙動固定してから**移行 |
| 変更可能範囲 | Domain 定数集約（値不変）、表示文言比較→状態/ID分岐、MutationObserver の文言書換え→生成元へ統合、`resultLabel` Display Mapper、日付/助数詞/数値フォーマッタ（書式 API のみ・ja出力は現行同一）、同一性判定ロケール定数化（値不変） |
| 保護対象 | 本書 Part II 全項目（特に C-W4、C-R1〜R6）、分析数値、ja表示 |
| Test | 特性テスト（各 JA比較/Observer 1件につき移行前後で同一出力）、Mapper 単体（全 resultLabel パターン・`${n}球イン`・未知値）、analytics 数値パリティ（B-4）、Player Identity（同名判定・登録照合）、Backup/Restore round-trip、`recordAnalysisEventV60` 全呼出しの再監査、`git grep` による「表示文言との比較」「Observer による文言書換え」残存0 の静的検査 |
| Evidence | 日本語依存ロジックの台帳（件数・分類 a/b/c・移行前後対応）、特性テスト結果、静的検査結果 |
| STOP条件 | 分析数値が1つでも変化／保存値が変わる／Observer 統合で ja 表示が変わる／分類不能な依存を検出（→ BLOCKED） |
| 移行条件 | 台帳の全件が処理済み、B-1/B-2/B-4 PASS、ja スナップショット差分0 |

### P3 — 画面別の3言語対応

| 項目 | 内容 |
|---|---|
| 目的 | 全画面の文言を辞書化し en / zh-Hans を表示可能にする（**暫定訳**：最終確定は P4） |
| 変更可能範囲 | 各画面の文言抽出と `t()` 化、aria/alt/title/placeholder、Alert/Confirm/Prompt/Toast 文言、補間の文単位テンプレート化、Paywall 文言（D7）。画面ごとのサブGate: ①Home/Match Setup/Match Recording ②Match Result/Detail/History ③Player ④Backup/Restore/Settings/Free-Pro/Match Sharing ⑤Analytics（コーチ文含む）⑥Navigation/オーバーレイ層の統合・重複排除 |
| 保護対象 | 本書 Part II、法務ページ（未翻訳のまま触らない）、Cloud Sync（非表示。対象外）、Design System |
| Test | 画面別: 3言語 dictionary 整合、ja 差分0、機能スモーク、`git grep` で日本語リテラル残存（許可リスト外）0 |
| Evidence | 画面別 抽出件数と TSV 突合（調査 1,672 件のうち Cloud 除外分との差異説明）、画面スクリーンショット（ja）、キー一覧 |
| STOP条件 | ja 差分発生／分析パリティ崩れ／未分類文言／法務翻訳の混入 |
| 移行条件 | 抽出完了（許可リスト外の日本語リテラル 0）、3言語キー欠落0、ja 回帰 PASS |

### P4 — 翻訳・競技用語レビュー

| 項目 | 内容 |
|---|---|
| 目的 | 暫定訳を確定。Glossary Review Pending を 0 にする |
| 変更可能範囲 | catalog の en / zh-Hans 文言、用語集 |
| 保護対象 | ja catalog（変更しない）、キー構造 |
| Test | 辞書整合（キー・プレースホルダ一致・禁則文字）、用語一貫性 lint（glossary キー経由）、PENDING 0 チェック |
| Evidence | 用語集（確定版、各語の根拠）、レビュー記録（PO / 競技者 / 中国語話者） |
| STOP条件 | ルール定義に関わる語（Break & Run / Rack / Dead Ball / Push Out / Run / Inning）が未確認のまま |
| 移行条件 | 用語集確定、PO 承認。**法務翻訳は別Gate** |

### P5 — Visual / Accessibility

| 項目 | 内容 |
|---|---|
| 目的 | 390×844 で 3言語×全画面の horizontal overflow 0・重要要素の clipping 0、VoiceOver 適合 |
| 変更可能範囲 | 折返し許可・最小幅・省略規則など**文言長対応に限る** CSS 調整（寸法トークン・構造は不変）。公式仕様と衝突する場合は Decision 追記を先に |
| 保護対象 | Physical Accepted の Bottom Navigation / Player UI / Modal、Design System |
| Test | 3言語×全画面（Demoデータ＋実文言）の overflow/clipping 自動計測、スクリーンショット比較、aria-label の言語、`lang` 切替による VoiceOver 言語（Simulator） |
| Evidence | 画面×言語マトリクス、計測結果、許可リスト（ユーザー入力の ellipsis 等） |
| STOP条件 | Physical Accepted レイアウトの変更が必要になる（→ Decision 先行） |
| 移行条件 | overflow 0、clipping 0、PO 目視確認 |

### P6 — Native / Regression / Build検証

| 項目 | 内容 |
|---|---|
| 目的 | Native ローカライズと全回帰、Release 構成の Build 検証（**配布なし**） |
| 変更可能範囲 | D10: `InfoPlist.strings`（ja/en/zh-Hans）、`knownRegions`、`project.pbxproj`、カメラ許可文言（`Info.plist`・`Info-ScoreRC.plist`）。**U11（`CFBundleDevelopmentRegion` を `ja` にして Native fallback をアプリ内 fallback と揃えるか）の PO 決定後に反映**。旧source文字列assertテストの**挙動維持での移行**。Simulator Build（開発承認範囲） |
| 保護対象 | Bundle ID / Signing / Product ID / Version / Build、Score RC の既存データ、`.storekit` の Release 混入禁止 |
| Test | 本書 Part III の全受入基準（AC-1〜AC-21、静的検査 AC-S1〜S10）: 3言語辞書、fallback、永続化、記録、Analytics パリティ、QR 3×3＋旧版互換、Backup/Restore、Player Identity、Navigation、Free/Pro、Visual、Accessibility、Native permission、PWA/Offline、byte identity、Full Node（baseline 比較）、native parity、Simulator |
| Evidence | テスト結果一式、ネイティブ文言スクリーンショット（OS言語×アプリ言語の混在含む）、hash監査 |
| STOP条件 | いずれかの受入基準 FAIL／ネイティブ設定の意図しない変更 |
| 移行条件 | 全受入基準 PASS、PO 承認 |

### P7 — TestFlight / App Store / Release

| 項目 | 内容 |
|---|---|
| 目的 | 配布候補の作成・確認・（承認時）公開 |
| 変更可能範囲 | Version / Build（PO承認）、Archive / Upload、TestFlight、ASC メタデータ（掲載言語・提供地域・スクリーンショット・IAP ローカライズ等は D8 に従い**別Gate**で判断） |
| 保護対象 | 公開 Version、CueScore Pro 設定、価格、提供地域（日本限定は D8 により維持） |
| Test | Release Build hash 監査、TestFlight 実機 Smoke（PO）、実機の Physical RC |
| Evidence | Archive/Upload 記録、ASC read-back、Physical 判定 |
| STOP条件 | 共通開発基準 §13（Apple操作はPO承認必須）に該当する全操作 |
| 移行条件 | PO 明示承認 |

### 別Gate（本計画の外・依存関係）
| Gate | 内容 | 前提となる位置 |
|---|---|---|
| 法務翻訳 | Privacy / Support / Terms の翻訳・確認（D7） | P7 前に完了が望ましいが、P3 以降と並行可。**正式版へ混入させない** |
| App Store 多言語/地域 | 掲載言語・SS・IAPローカライズ・提供地域（D8） | P7 以降の別判断 |
| `alert/confirm/prompt` モーダル化（U6） | OSボタン名のOS言語依存の解消 | P3 以前に要否判断（現行UI変更のため PO） |
| zh-Hant | 繁体字追加 | 全Phase完了後 |


### 各 Gate の Regression 条件

| Gate | 必須（その Gate の合格条件） | Regression（退行0を要求） | 再利用してよい過去PASS（共通開発基準 §10：hash 一致時のみ。理由を Report に記載） |
|---|---|---|---|
| P0 | 文書の整合（AC-S7 / S8） | 該当なし（source 非変更） | — |
| P1 | AC-2、AC-3、AC-4（T-SW 全）、AC-15、AC-16 の基本、ja スナップショット差分0 | 既存 Full Node（baseline 比較）、`in-progress-match-restore`、navigation / settings 系、Match Sharing 全（122 系）、Free/Pro（AC-17）、Cloud Sync 非表示（AC-18） | P1 で触れない領域（QR 暗号・圧縮・Native）の Build 84 PASS は hash 一致時に再利用可 |
| P2 | AC-S2 / S3 / S4 / S6、AC-5 / AC-6 / AC-9 の特性テスト、B-4 | P1 の Regression に加え、analytics 全系、Player delete identity、Backup/Restore round-trip | QR 暗号・Native は再利用可 |
| P3 | 画面別サブGate ごとに AC-1（PROVISIONAL まで）、AC-5〜AC-11 のうち該当画面、AC-S1 | 直前サブGateまでの全 Regression ＋ ja 回帰（画面巡回の DOM 差分0） | 触れていない画面の既存 PASS は hash 一致時のみ |
| P4 | AC-1 の完全版（`P4-APPROVED`、PENDING 0） | catalog 変更のみのため、辞書 lint ＋ ja 回帰 ＋ 3 言語スモーク | 画面ロジックのテストは再利用可（catalog 値以外が不変であることを hash で示す） |
| P5 | AC-12、AC-13 | CSS 変更のため Physical Accepted UI の Visual 回帰（Bottom Navigation / Player UI / Modal）全件、ja スクリーンショット一致 | ロジック系テストは再利用可 |
| P6 | AC-1〜AC-20 全て、Full Node、native foundation、native parity、Simulator Release Build | **全 Regression** | 再利用は原則しない（Release 構成の最終確認 Gate のため） |
| P7 | PO 承認下での配布手順（本計画の範囲外） | Release Build hash 監査 | — |

### Gate 分離チェック表（独立 Gate であることの確認）

| チェック | 内容 | 対応 Gate |
|---|---|---|
| G-SEP-1 | Native 変更（`ios/`）は **P6 以降のみ**。P1〜P5 の差分に含めない（AC-19 / AC-S10） | P1〜P5 / P6 |
| G-SEP-2 | Official 発行（Decision Log v2.7 の発行、`docs/official/` への 107 / 108 の登録）は **P0 の後の別 Gate**。P1 は発行済みの仕様を前提とする | P0→発行Gate→P1 |
| G-SEP-3 | 日本語表示不変は P1 の合格条件であり、P2 以降も全 Gate の Regression 基準 | P1〜P6 |
| G-SEP-4 | 翻訳確定（`P4-APPROVED`）は P4。P3 の文言は PROVISIONAL でリリース候補に不可（AC-1） | P3 / P4 |
| G-SEP-5 | Free/Pro contract は全 Gate で不変（AC-17）。Paywall 文言の 3 言語化は P3 | P1〜P6 |
| G-SEP-6 | Cloud Sync は非表示のまま（AC-18）。翻訳対象外 | P1〜P6 |
| G-SEP-7 | App Store 日本限定（D8）。Apple 操作は P7 まで 0（AC-20） | P0〜P6 |
| G-SEP-8 | 法務翻訳は別 Gate。未確認の法務翻訳を正式版へ混入させない（本書 Part I §10） | 別 Gate |
| G-SEP-9 | `alert/confirm/prompt`（U6）の方針決定は P3 の前。決定前は現行のまま | 決定→P3 |

---

## 本書の状態

**ADOPTED / OFFICIAL（2026-10-09 発行）。Implementation NOT STARTED。** Official 108 は Decision 031、Official 107、Official Design Decision Log v2.7 と併せて発行された。S-B（保存された中断試合での言語切替）の許可、言語解決の実機形式、snapshot の表示言語依存の不在は **NOT VERIFIED**（P1 で検証）。Glossary は Draft（PENDING を含む。Official 109 未作成）。
