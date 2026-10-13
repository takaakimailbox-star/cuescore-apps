# CueScore i18n P1 — Source Formalization（P1 source＋Settings Unified Design R の正式固定、2026-10-13）

P1（i18n 基盤、日本語不変 Prototype、言語行・言語選択 U9）と Settings Unified Design R（Decision 032 / Official 110・111）の source を GitHub main に正式固定した。Decision 034 / Official 113・114 に基づく。**これは source の正式固定であり、P1 全体の Product Owner Physical Acceptance の宣言ではない。**

## commit（Git 履歴を正本とする）
| 段 | commit | 内容 |
|---|---|---|
| A | `51e470118046c5c48173d09266677a7745c74622`（tree `0d612a1d41dd952d6f858ca41b3e29406aa7bc23`） | P1: i18n core（L-RES 言語解決、U10）、ja／en／zh-Hans catalog、Display Mapper 雛形、Settings 言語行・言語選択（U9）、boot 適用、オフライン登録（sw.js precache・native-web 同期）、対応テスト（22 ファイル: tracked 13＋新規 9）。Physical UI Fix と Restore Fix B を保持 |
| B | `39a61a1d13a3ff4917722c51662b4a2f029183ea`（tree `c28fdd6548d3ecb28a1d3bdff6060ddd8ba2fd98`） | Settings R: 3 カード統一、角丸 20pt、データ管理行の高さ条件、3 言語見出し（`settings.section.appInfo`）、Version 単一定義、小画面スクロール、Legal Navigation、言語行をアプリ情報カード先頭に配置（7 ファイル: 変更 6＋新規テスト 1） |
| C | 本ファイルを含む docs commit | SSOT／handoff／本 Evidence の同期 |
基底 main: `221aaf62c90e20178e2bb94a601b191ec96d3184`（Decision 034 / Official 113・114 発行直後）。

## Source identity
- A の 22 ファイルは、保全済みの P1 最終 worktree と**完全一致**（フル SHA-256、22/22）。B の 7 ファイルは保全済みの Settings R 最終コピーと完全一致。A＋B の main 比差分の sha256 = `931beffa0f7633f0c9f86e8a163a270b0aefb94f4bf055610874959b296b3bcf`（保全済みパッチと完全一致）。
- 最終 `index.html` sha256 = `936f5d10a8f0f0da1439ce2e685f2c1fad5bd91b79dde93165250a1a46be3df1`（実機 Score P1 のビルドと一致）。
- `ios/` 変更 0（AC-19）、S-B flag: `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`、Restore Fix B 保持、Match／Snapshot schema・QR・Backup・Free/Pro・`resultLabel` 日本語 canonical は変更なし。

## Regression（fresh 実測。隔離コピー＋正式 `build-native-web.mjs`。skip・削除・弱体化 0）
| 範囲 | commit A | commit B |
|---|---|---|
| i18n（i18n-foundation、U9） | 24/24 | 24/24 |
| Settings（Build 72/74/75/76、settings-*、Physical UI Fix） | 39/39 | 49/49 |
| Navigation | 34/34 | 34/34 |
| Legal | 11/11 | 11/11 |
| Restore（Restore Fix、Break prompt、Quota） | 41/41 | 41/41 |
| Match Sharing | 122/122 | 122/122 |
| Backup／データ | 7/7 | 7/7 |
| Player Identity | 21/21 | 21/21 |
| Free／Pro | 44/44 | 44/44 |
| PWA／Native | 15/15 | 15/15 |
| **Full Node** | **692/692** | **702/702** |
Native parity: 構築した native-web と `ios/App/App/public` の i18n・index.html・navigation の各ファイルが source とバイト一致（`sw.js` は native-web から設計上除外＝PWA 専用。登録は i18n の offline 登録テストで検証）。`ios/` 差分 0。
C3／C4／C5／C6、T-SW、日本語 DOM 比較、異常終了 runtime は、commit A の 22 ファイルが当該 runtime Evidence の source とフル SHA-256 で一致し、基底の差分が docs／tests のみであること（`8a40a2d..221aaf6` の非 docs／非 tests 差分 0）を根拠に既存 Evidence を再利用した（共通開発基準 §10）。Settings R に対する runtime は再実行していない（Settings 画面・catalog の変更範囲で、focused／Full Node で検証）。

## Decision 034 との対応
| Decision | source 上の状態 |
|---|---|
| D034-1 U9 | 言語行（`言語 / Language`、アプリ情報カード先頭）と言語選択画面（自動／日本語／English／简体中文、「適用して再読み込み」）が commit A・B に含まれる。PO 確認の A／B／C 区分は Official 113 に記録 |
| D034-2 S-B | `LANGUAGE_SWITCH_ALLOWS_SAVED_INTERRUPTED_V1 = false`。記録中・保存済み中断試合がある間は言語変更不可。T-SW の未検証項目（WKWebView・実機 iOS ライフサイクル・PWA reload）は PASS／FAIL にしない |
| D034-3 L-RES-10 | 言語解決コアは Official 108 のまま（単体テスト）。実測は確認済み範囲のみ条件付き受入、未確認は NOT VERIFIED |
| D034-4 P2 | P1 の source が main に固定された。P2 の production 実装は別 Gate |

## AC-SU-9／AC-SU-10（Official 111。AC 表は改変しない）
- AC-SU-9（実機の Safe Area・1 画面・Bottom Navigation 非重なり）: 確認済み範囲を記録。PO 実機確認（2026-10-12、記録の原本は ChatGPT りおん）: Settings（ja／English／简体中文）、About Version 1.2、利用規約・プライバシーポリシー、Back。ja は Screenshot の行高さ実測で独立確認。確認していない画面・状態は PASS にしない。
- AC-SU-10: Decision 033 により Dynamic Type 自動連動は **Deferred（Later）**。PASS ではない（CSS 疑似拡大 36 条件 PASS、実際の iOS Dynamic Type は NOT VERIFIED）。

## NOT VERIFIED
実機 PWA／実機での複数言語構成／他 iOS／Score P1 本体での L-RES-10 直接測定／T-SW の WKWebView・実機 iOS ライフサイクル・PWA reload／C5 の Spot・Pre-break Foul 本番 UI／QR 3×3 言語・Build 84 出荷物との hash 照合／Settings R に対する runtime の再実行／実際の iOS Dynamic Type／**P1 全体の PO Physical Acceptance の明示宣言（未記録。自動記録しない）**。

## 境界
S-B 有効化、P2 実装、Official 仕様変更、新機能、Device Build／install、診断アプリ削除、Archive／Upload、TestFlight、App Store Connect、Release、Build 85、CueScore Apps／Score RC／Score P1 の変更は行っていない。`ios/` は変更していない。
