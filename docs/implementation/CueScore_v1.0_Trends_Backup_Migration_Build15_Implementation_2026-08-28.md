# CueScore v1.0 — Trends / Backup Migration / Build 15 Implementation

Date: 2026-08-28  
Status: implementation, Archive, Validate and TestFlight internal distribution PASS / physical iPhone confirmation pending

## Direct cause

提供fixtureのPlayer／Match IDと参照はcanonical stringで整合していた。不具合はRestore migration不足そのものではなく、個別削除前の`createDestructiveBackupV132`が全Player／全Matchをもう一度localStorageへ保存する容量増幅だった。約3.9MBのfixtureでは追加世代によりquotaへ到達し、削除書込み前に例外停止した。

## Implementation

- 個別Player削除はdeleted Playerだけ、個別Match削除はdeleted Matchだけを安全退避する。全件削除は全体退避を維持する。
- schema 1／2を現行schema 2へcanonicalizeするmigrationをReplace／Merge共通で追加。Player／Match ID、registered Player reference、重複、必須identityを検証し、unsupported／unsafeは書込み前に停止する。
- 推移chartを208pxへ拡張し、軸余白、11px tick、axis、grid、3px line／point、試合日caption、label間引き、1点中央配置を追加した。

## Product Owner fixture verification

| Fixture | Migration / round-trip | Player delete | Match delete | References / console |
| --- | --- | --- | --- | --- |
| 20260813_1947 (3 Players / 27 Matches) | PASS | 3→2 PASS | 27→26 PASS | orphan 0 / error 0 |
| 20260813_2046 (3 / 27) | PASS | 3→2 PASS | 27→26 PASS | orphan 0 / error 0 |
| 20260816_0712 (2 / 0) | PASS | 2→1 PASS | N/A (0 Match) | orphan 0 / error 0 |
| 20260816_0855 (3 / 1) | PASS | 3→2 PASS | 1→0 PASS | orphan 0 / error 0 |

FixturesはProduct OwnerのDesktop提供ファイルを直接使用し、個人データをGit repositoryへ複製していない。

## Gates

- Automated tests: `244 pass / 0 fail / 0 skipped`.
- Chrome 390×844: axis labels visible, `試合日` caption, overflow 0; opponent VS-row regression PASS.
- source／native-web／iOS copied assets一致。
- Simulator Debug／Release: `BUILD SUCCEEDED`.
- Physical iPhone: pending.
- Signed Release Archive: `/private/tmp/CueScore-Build15.xcarchive`, `ARCHIVE SUCCEEDED`.
- App Store validation: `App 1.0 (15) validated`, all validation checks PASS.
- Xcode distribution: `Upload for TestFlight (Internal Testing Only)`で`App 1.0 (15) uploaded`。
- App Store Connect: Apple処理完了を確認。輸出コンプライアンスは正式回答「上記のアルゴリズムのどれでもない」で保存した。Build 15は既存内部グループ`CueScore Internal Testers`に含まれ、状態は`テスト中`。
