# CueScore Apps — Localization Design Decision

**Status:** Adopted / Product Owner adopted decision（Decision 031）/ Implementation NOT STARTED。条件付き Implementation 事項（S-B の言語切替許可ほか）は **NOT VERIFIED**（§3.2）。Glossary は Draft（Official 109 未作成）。

**Decision date:** 2026-10-08（Product Owner 承認 D1〜D10・U10）
**Official publication date:** 2026-10-09
**Authority:** Product Owner adopted decision（採番: ChatGPTりおん）
**Decision number:** **Decision 031**（Official Design Decision Log v2.7 に収録）
**Official document number:** **107**（本書）／ 関連 Specification: **108**（`108_CueScore_Localization_Spec.md`）
**Scope:** CueScore Apps の表示言語（ja / en / zh-Hans）
**Baseline:** `takaakimailbox-star/cuescore-apps` main `117feddc802b9c0d7eccbdced0d96de84f728bf7`（作成時に fresh fetch で確認、変更なし）

> 本書の「確定事項」は Product Owner が承認した設計判断であり、「条件付き Implementation 事項」は将来の Implementation Gate で条件を満たした場合にのみ有効になる事項である。両者を §3 で分離して記録する。**未検証の事項を PASS・実証済みとして記録しない。**

---

## 1. Purpose

### 1.1 目的
CueScore Apps は現在、日本語の表示のみを持つ。次の 2 点を目的として、日本語・英語・中国語簡体字の 3 言語表示に対応する。

1. **日本国内の外国人プレーヤーへの対応:** 日本国内で CueScore を使う、日本語以外を母語とするプレーヤーが、母語で記録・閲覧・共有できること。
2. **将来の海外展開を可能にする設計:** 言語層を Domain（保存・共有・計算・識別）から分離し、将来の言語追加（zh-Hant 等）および配信地域の拡大を、保存データ・共有形式を変えずに行える構造にすること。

### 1.2 本 Decision が決めないこと
- 製品の Implementation 開始、Build、TestFlight、App Store Connect の操作、Release（いずれも別 Gate）。
- 海外配信、App Store 掲載言語、スクリーンショット、IAP ローカライズ（D8: 別 Gate。**当面は日本限定配信を維持**）。
- Privacy / Support / Terms の翻訳（D7: 別の法務翻訳・確認 Gate）。
- zh-Hant の実装（D2: 今回対象外）。
- 既存データの migration（本 Decision の対象外）。

## 2. Decision（確定事項）

### 2.1 対応言語
**ja（日本語）／en（英語）／zh-Hans（中国語簡体字）。** 内部コードは BCP47。**zh-Hant（繁体字）は今回の対象外**とし、将来独立して追加できる構造とする。

### 2.2 D1〜D10（Product Owner 承認）

| ID | 決定 |
|---|---|
| **D1** | 端末設定に対応言語が存在しない場合は日本語へ fallback する。 |
| **D2** | 今回 zh-Hant は実装しない。繁体字端末は日本語 fallback。将来 zh-Hant を独立して追加できる設計とする。 |
| **D3** | アプリの設定画面から言語を切替できる。切替後は**ソフトリロード**方式。**試合記録中は言語変更不可。** 進行中試合の保存・中断・再開を壊さない。 |
| **D4** | ユーザー作成・編集済みのカテゴリ名は翻訳しない。**既定 ID かつ未編集の既定名のみ**、表示層で翻訳可能。保存値は変更しない。 |
| **D5** | CSV ヘッダー 29 列は日本語固定。既存 CSV contract を変更しない。Backup JSON の schema・key も変更しない。 |
| **D6** | Demo の選手名等の固有名詞は維持する。画面ラベルのみ翻訳する。Demo 保存データは変更しない。 |
| **D7** | Paywall のユーザー向け文言は 3 言語化する。Privacy / Support / Terms は別の法務翻訳・確認 Gate とし、未確認の法務翻訳を正式版へ混入させない。 |
| **D8** | 当面は日本限定配信を維持する。海外配信、App Store 掲載言語、スクリーンショット、IAP ローカライズ等は別 Gate。ASC 操作は行わない。 |
| **D9** | `AGENTS.md` および共通開発基準を確認し、既存の Git・SSOT・STOP・Evidence ルールを維持する。 |
| **D10** | 将来の Implementation Gate で、`InfoPlist.strings`、ja / en / zh-Hans localization、`knownRegions`、`project.pbxproj`、Camera permission description の必要な変更を許可する方針。**Phase 0 では実装しない。** |

### 2.3 U10（Product Owner 承認。D2 を優先）
**繁体字中国語（`zh-Hant*`・`zh-TW`・`zh-HK`・`zh-MO`）が端末の第一優先言語の場合、CueScore の初期表示は日本語**とする。繁体字が先頭の場合、後続の英語・簡体字を自動選択しない。先頭が繁体字以外の場合は、既存の優先言語解決方針を維持する。**ユーザーの手動言語選択は端末の自動判定より常に優先**する。

| 端末の優先言語（順） | 初期表示 |
|---|---|
| `[zh-Hant-TW, en-US]` / `[zh-TW, en-US]` / `[zh-HK, en-US]` / `[zh-MO, en-US]` | ja |
| `[zh-Hant-TW, zh-Hans-CN]` | ja |
| `[en-US, zh-Hant-TW]` | en |
| `[zh-Hans-CN, zh-Hant-TW]` | zh-Hans |
| `[ja-JP, zh-Hant-TW]` | ja |

詳細な言語解決アルゴリズム・分類表・全ケースの期待値は Official 108 §3 を正本とする。

### 2.4 言語選択の優先順位
1. 保存済みのユーザー設定（手動選択） → 2. 対応する端末言語（§2.3 の規則を含む） → 3. 日本語 fallback。Settings の選択肢は「自動／日本語／English／简体中文」（各言語名は自言語表記）。言語設定は独立 Key に保存し、Match / Player / Category / Season / Backup / QR / CSV へ混入させない。

### 2.5 言語層の原則
- 言語変更は**表示層だけ**に作用する。保存・共有・計算・識別（Domain）は言語に依存しない。
- 保存済みの日本語 canonical 値（`break_result.resultLabel` ほか）を英語・中国語へ書き換えない。表示時のみ Display Mapper で翻訳する。
- 日本語文字列比較を**無条件に削除しない**。Domain 値どうしの比較は維持して定数化し、表示文言との比較・描画後の DOM 文言書換えのみを、特性テストで挙動同一を保証したうえで生成元の状態・ID ベースへ置換する。
- 既存データの migration は行わない。
- DOM 全体を MutationObserver で後から文字列置換する方式は採用しない。明示的な `t(key, params)`、ja catalog を基準とした en / zh-Hans catalog、Display Mapper、日本語 fallback、`html lang` の更新、Intl による書式を採用する。

## 3. 確定事項と条件付き Implementation 事項の区別

### 3.1 確定事項（Product Owner 承認済みの設計判断）
D1〜D10、U10、§2.4・§2.5 の原則、保存データ互換性（§4）、QR 共有互換性（§5）、Free / Pro contract 維持（§6）、日本限定配信の維持（§7）、Gate 分離（§9）。

### 3.2 条件付き Implementation 事項（将来の Gate で条件を満たした場合のみ有効）

| 事項 | 条件 | 現在の状態 |
|---|---|---|
| **S-B: 安全に保存された中断試合（Saved Interrupted Match）がある場合の言語切替の許可** | C1〜C6 を満たし、**T-SW-1〜T-SW-10 の runtime 検証が P1 で PASS** すること | **未検証。** 静的な source 読解のみ実施。runtime 検証は実施していない。**P1 で実証できなければ S-B も切替不可（SIM が存在する間は不可）とし、P1 を STOP する** |
| 言語解決の実機形式 | iOS WKWebView / PWA が返す実際の `navigator.languages` の形式を P1 で採取し、分類表と突合 | **未実測。** CLDR の likely-subtags に基づく写像の一次資料も再取得していない |
| snapshot の表示言語依存の不在 | 進行中試合 snapshot の全フィールドの監査 | **未実施（NOT VERIFIED）** |
| Native fallback の整合（U11） | `CFBundleDevelopmentRegion` の扱いを P6 前に PO が判断 | 未決 |

## 4. Data compatibility（変更禁止）

以下は言語対応によって変更しない。

- Match schema、Player ID、`registeredPlayerId`、`sharedMatchId`、Match events
- `break_result.resultLabel` の日本語 canonical 値（`無得点`・`1個`・`2個以上`・`3個以上`・`スクラッチ`・`イリーガル`・`ブレイク失敗`・`ブレイクファール`・`ファール（ブレイク交代）`・`${n}球イン`）
- scoring logic、analytics calculations
- Backup JSON format、QR payload format、CSV contract（ヘッダー 29 列は日本語固定）
- IAP Product ID、Free / Pro entitlement

保存データの比較は**クラス A（byte-identical を要求する Domain データ）／クラス B（意味的同一性を確認する一時・派生状態）／クラス C（言語設定 Key のみ更新可）**に分類し、Control 比較で「既存の正常な書込み」と「言語切替による副作用」を区別する。Domain データの要求水準は緩和しない。言語変更の前後で保存済みデータが（クラス A として）byte-identical であることを受入条件とする。詳細は Official 108 Part II。

## 5. QR sharing compatibility

Match Sharing v1（Official 101 / 102、Decision 028〜030）を維持する: `CSM1:` ＋ Base45、圧縮、整合性検証、`sharedMatchId`、symmetric Player A/B mapping、duplicate protection、atomic import。**QR payload へ言語設定を追加しない。** 送信側と受信側の言語が異なっても同一の Match として扱う。既存の日本語版（Build 84 以前）との双方向互換を維持する。

検証は 7 項目に区別する（V1 Sender payload の byte identity／V2 Receiver 保存結果の semantic identity／V3 Player mapping の正確性／V4 `sharedMatchId` の維持／V5 duplicate protection／V6 analytics 数値の一致／V7 旧 Build 84 との双方向互換）。**Receiver が取込み時に新規生成するローカル ID・時刻を byte-identity 違反として誤判定しない**が、atomic import と historical identity の契約は維持する。3 言語 × 3 言語の 9 組合せを検証対象とする。詳細は Official 108 Part II §2.2。

## 6. Free / Pro contract
言語対応は Free / Pro の境界・Entitlement・Product ID・価格表示（StoreKit `displayPrice`）を変更しない。言語設定は Free / Pro で同一に提供する。Paywall のユーザー向け文言のみ 3 言語化する（D7）。Paywall の法的／Apple 要件に関わる文言の確認プロセスは未決（U4）。

## 7. 日本限定配信の維持（D8）
提供地域は日本限定を維持する。アプリ内の言語対応は App Store の掲載言語・提供地域・スクリーンショット・IAP ローカライズ・Privacy 回答の変更を**伴わない**。それらは別 Gate で判断する。App Store Connect の操作は本 Decision および Implementation Gate P1〜P6 で行わない。

## 8. 中断試合と言語切替（D3 の具体化）

Official 108 §6 で次の状態モデルを定める。

| 状態 | 言語変更 |
|---|---|
| **S-A**: 試合記録画面で操作中（記録中） | **不可** |
| **S-B**: 安全に保存された中断試合（Saved Interrupted Match）がある | **条件付きで可**（§3.2: C1〜C6・T-SW-1〜10 の runtime 検証 PASS が条件。**未検証**） |
| **S-C**: 進行中試合なし | 可 |

静的な source 調査では、live context が無い状態の reload が snapshot を書き換えない構造が確認されたが、**これを runtime 証明済みとは扱わない。** 証明に失敗した場合は S-B も不可へ戻して P1 を STOP する。

## 9. Official と Implementation の Gate 分離

| Gate | 内容 | 本 Decision との関係 |
|---|---|---|
| P0 | Official Specification / Decision | 本書および 108 |
| P1 | i18n 基盤＋日本語不変 Prototype | **別 Gate・未承認・未着手** |
| P2 | 日本語依存ロジックの安全な分離 | 同上 |
| P3 | 画面別 3 言語対応 | 同上 |
| P4 | 翻訳・競技用語レビュー | 同上 |
| P5 | Visual / Accessibility | 同上 |
| P6 | Native / Regression / Build 検証 | 同上 |
| P7 | TestFlight / App Store / Release | 同上 |

- 各 Gate は独立しており、PASS でも Gate 境界で STOP する（共通開発基準）。
- **本 Decision は設計方針の承認であり、Implementation・Build・TestFlight・App Store Connect・Release を承認しない。**
- Official 発行と P1 開始は別の承認である。

## 10. 用語（Glossary）の位置づけ
競技用語の 3 言語対応表は **Draft を維持**し、Official 109 は本 Decision では作成しない。中国語の競技用語、マス割、JPA の正式名称、Dead Ball、Rack、Inning、Run、Rotation、Push Out の未確認訳語は **PENDING** とし、確定訳語として本 Decision・Official 108 に記載しない。P3 は暫定翻訳（`P3-PROVISIONAL`）、P4 は正式レビュー・承認（`P4-APPROVED`）とし、P4 承認前に翻訳完成と記録しない。

## 11. 未解決事項（Decision Pending）

本 Decision は次の事項を**独自に解決しない**。

| ID | 内容 | 決定が必要な工程 | 決定責任者 |
|---|---|---|---|
| U3 | 法務ページ未翻訳期間の en / zh-Hans UI での注記要否 | P3 の Settings・法務導線サブ Gate の着手前 | Product Owner |
| U4 | Paywall の法的／Apple 要件文言の確認プロセス | P3 の Paywall 文言サブ Gate の着手前 | Product Owner |
| U6 | `alert/confirm/prompt` の OS ボタン言語依存への対応 | P3 着手前（決定前は現行のまま） | Product Owner |
| U8 | Backup Share Sheet 文言の翻訳可否 | P3 の Backup 文言サブ Gate の着手前 | Product Owner |
| U9 | 言語行の最終ラベル・選択 UI 形式 | **P1 Prototype の Product Owner 確認時** | Product Owner |
| U11 | `CFBundleDevelopmentRegion` を `ja` にするか | **P6 前の Native 確認時** | Product Owner |

STOP 条件・各項目の詳細は Official 108 §17 を参照。

## 12. 関連文書

- `108_CueScore_Localization_Spec.md`（Specification。本 Decision の仕様）
- Match Sharing: `101_CueScore_Match_Sharing_v1_Decision.md` / `102_…_Spec.md`、Decision 028〜030
- Player: `103`〜`106`（Official 文書番号 103〜106 と Decision 番号は**別体系**であり、本 Decision の採番に影響しない）
- Free / Pro: `97` / `98`
- Cloud Sync 非表示: `71` / `72`（Cloud Sync の文言は本 Decision の翻訳対象外）
- Backup / Restore: `54` / `55`、`24` / `25`
- 共通開発基準: `共通アプリ開発ルール_v1_2026-09-14.md`

## 13. Evidence basis
- Product Owner 承認（2026-10-08）: D1〜D10、U10。
- Localization Architecture / Source Audit（baseline `117feddc802b9c0d7eccbdced0d96de84f728bf7`）: 日本語 UI 文字列 ユニーク 1,672 件（Cloud Sync 非表示分を除き約 1,340 件）、日本語依存ロジック（保存済み `resultLabel`、日本語文字列比較、MutationObserver による日本語 DOM 書換え、日本語固定ロケール）。
- Phase 0 Rev.2 成果物（Draft）A〜G、G2、G3。
- 既存 Official（98〜106、Decision Log v2.6）に言語仕様を規定する記述が存在しないことを確認。

## 14. 本 Decision の状態

**ADOPTED / OFFICIAL（2026-10-09 発行）。Implementation NOT STARTED。** Decision 031 は、Official Design Decision Log v2.7、Official 107（本書）、Official 108 として発行された。S-B（保存された中断試合での言語切替）の許可、言語解決の実機形式、進行中試合 snapshot の表示言語依存の不在は **NOT VERIFIED**（P1 で検証）。Glossary は Draft（PENDING を含む。Official 109 未作成）。Official 発行と P1 Implementation の開始は別の承認である。
