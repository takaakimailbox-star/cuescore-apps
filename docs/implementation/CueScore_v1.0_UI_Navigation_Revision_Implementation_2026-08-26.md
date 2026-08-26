# CueScore v1.0 UI / Navigation Revision — Implementation Record

- Date: 2026-08-26
- Base remote: `origin/main` `74a66bb7f30cac68b1c2f621ccfbc737804b9a1d`
- Local prerequisite: UI screenshot audit commit `4f387ce9de3aa01d827cdbc9d0f31289620ed596`
- Marketing Version / Build: `1.0` / `11`（配布Buildは作成していない）

## Implemented

- Rotation／14-1／JPAの自己ベストからscore bestを除外。
- 競技詳細へ`グラフで見る`を追加し、全画面・縦scrollの複数graph pageへ統合。個別metric bottom sheet入口を通常UIから撤去。
- 対戦相手別成績のsummary、sort、競技selectorを撤去。最新対戦順＋stable ID tie-breakへ変更。
- 相手固定履歴をPlayer vs Opponent → aggregate → 月別履歴の順へ変更し、固定文脈の重複表示と分析buttonを撤去。
- Player履歴から期間、詳細、分析buttonを撤去し、card／chevronのMatch Detail入口を維持。
- Player一覧からsortを撤去し、main → actual match latest usage → stable IDの自動順序と一段compact rowを採用。
- 新UI資産をPWA cache、native-web、iOS copied publicへ同期。

## Verification

- Automated tests: `232 pass / 0 fail`
- Browser UI automation: Chrome `390×844`, DPR 1, Light — Trends／Opponent Records／History／横overflow PASS
- iOS Simulator Debug: `BUILD SUCCEEDED`
- iOS Simulator Release: `BUILD SUCCEEDED`
- source／native-web／iOS copied assets: 同期後に一致確認
- scoring、schema、Backup／Restore、normal／sample分離: 実装変更なし

## Pending

- 実iPhoneのSafe Area、font rendering、tap／edge Swipe Back体感、長い実データ名、OS pickerは未確認。
- Archive、Validate、TestFlight upload、内部配信、App Review、一般公開は実施していない。
