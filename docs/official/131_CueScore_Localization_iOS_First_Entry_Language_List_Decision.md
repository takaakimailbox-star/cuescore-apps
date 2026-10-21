# 131 CueScore Localization iOS First-Entry Language List Decision

**状態: Adopted / Official。** 2026-10-21にProduct Ownerの明示承認を得て2026-10-21に発行（Decision 044、Official Design Decision Log v2.20）。
**Scope:** Official 108 v1.1の言語解決（Part I §3、L-RES-10、AC-2）について、iOSで観測された `navigator.languages` の形式を**注記**する。resolverの期待値は変更しない。

## 1 番号（fresh確認）

- 直前はDecision 043／Official 130／Decision Log v2.19。本決定は未使用の**Decision 044**、本書は未使用の**Official 131**、Decision Logは**v2.20**。Decision 043／Official 130は再利用しない。
- Official 108（v1.1）、Official 109・130、Decision 001〜043は改変しない。Official 109は発行済みのまま維持する。

## 2 確認済みの事実（観測環境に限定）

観測した環境は次の2つだけであり、他のiOSバージョン・端末・ブラウザについて普遍性を主張しない。

| 環境 | 観測 |
|---|---|
| 実機 iPhone 16e、iOS 26.6.2、Mobile Safari（Evidence 96） | OS優先言語リストが複数でも `navigator.languages` は**先頭1要素のみ**（`["ja"]`、`["en-US"]`、`["zh-CN"]`、`["zh-HK"]`）。後続の対応言語は返らない |
| iOS 26.5 Simulator、WKWebView（Evidence 88） | 同様に先頭1要素のみ、地域付き形式（`ja`、`en-US`、`zh-CN`、`zh-TW`、`zh-HK`、`ko-KR`、`fr-FR`）。16パターン |

- 実機の既存Nativeアプリ（p6iso）は生の `navigator.languages` を公開しないため、表示結果（ja／en／zh-Hans／繁体字先頭→ja）の観測にとどまる（Evidence 96）。ホーム画面スタンドアロンPWAは未観測。
- resolver（`resolveDeviceLanguage`）は、Official 108 §3の期待値表（36ケース、複数要素リスト16件を含む）に対して単体テストでPASSしている。

## 3 Decision

### D044-1 注記の追加

Official 108のPart I §3、U10 RESOLVEDの必須ケース、L-RES-10、AC-2に付随して、次を**注記**として適用する。

> 観測した環境（実機iOS 26.6.2のMobile Safari、iOS 26.5 SimulatorのWKWebView）では、`navigator.languages` はOS優先言語リストの先頭1要素のみを地域付き形式で返す。§3の複数要素の期待値はresolver単体への入力仕様であり、これらの環境では先頭要素だけが入力される。結果として、先頭が未対応言語で後続に対応言語がある端末（例: OS優先言語 ko → zh-Hant → en）は、これらの環境では `ja`（fallback）になる。これは観測に基づく挙動であり、全iOSバージョンでの保証ではない。手動選択（保存済み設定）は常に端末言語より優先する。

### D044-2 期待値と実装は不変

- resolverの複数言語入力に対する期待値（Official 108 §3、U10必須ケース10件を含む）は**変更しない**。
- resolver、保存言語、手動選択の優先、S-A／S-B（S-B＝`false`）、翻訳catalog、production source、Native設定を変更しない。**Nativeブリッジ（全優先言語リストをWebViewへ渡す実装）は追加しない。**

### D044-3 受容

上記の挙動を、観測環境における受容された挙動とする。Build 84は日本語のみであり、日本語表示になることは退行ではない。利用者は設定の言語選択で en／zh-Hans を選べる。

### D044-4 限定の明記

- 観測は1端末・1OS版（実機）とSimulator 1版に限る。将来、別のOS版が複数要素を返すことが観測された場合は、本注記の対象範囲を再確認し、resolverの既存期待値によりそのまま動作することを確認する。
- Nativeブリッジを将来検討する場合は、別のDecisionとNative変更の承認を必要とする。

## 4 受入条件

- AC-U10-1: 単体テストに、観測した先頭1要素形式（Simulator 16パターン、実機Safari 4構成）の期待値表を追加し、resolver実装を変更せずにPASSする。
- AC-U10-2: 既存の複数要素リスト版のテスト（Official 108 §3、U10必須ケース）は削除・弱体化せず維持する。
- AC-U10-3: Evidence 88・96の採取表を参照として保持し、観測環境と非保証範囲を明記する。
- AC-U10-4: Official 108、Official 109・130、翻訳catalog、`i18n-v1.js`、production source、Native設定のバイト不変を回帰テストで確認する。
- AC-U10-5: AC-2の判定には、本注記とAC-U10-1〜4が揃うこと、ならびに既存のresolver単体・Simulator・実機Safariの各Evidenceを区別して用いることを要する。P6全体PASSは本決定では宣言しない。

## 5 不変条件

production source、翻訳catalog、保存データ、Data／QR／Backup、Analytics、Free／Pro、StoreKit、IAP Product ID、Native設定、Version／Build、実機アプリ、Apple Developer、TestFlight、App Store Connect、Releaseを変更・操作しない。P7は開始しない。

## 6 発行

Documentation-onlyと、追加の単体テストだけで発行する。Official Design Decision Log v2.20、SSOT、文書テストを同一変更で同期する。以前のProduct Ownerの承認は方針検討の承認であり、本Decisionの正式発行にはPOの明示承認を要する。
