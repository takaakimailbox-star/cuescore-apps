# CueScore Current UI Screen / State Inventory — 2026-08-26

凡例: `撮影済` / `未撮影` / `OS所有` / `Deferred`

|領域|画面・状態|分類|状態|備考|
|---|---|---|---|---|
|Home|Home / main menu|normal + sample|撮影済|001|
|Player|一覧 / main Player情報|normal + sample|撮影済|002–003|
|Player|編集 / 登録 / avatar / 非main / 削除確認|setup / modal|未撮影|正規導線で追加撮影する|
|Player|custom photo / camera・photo permission|OS / permission|OS所有|実機確認が必要|
|Discipline|9-Ball / 10-Ball / Rotation / 14-1 / JPA / 3C詳細|normal + sample|撮影済|010–060|
|Trend|勝率 / shoot / break-in / masuwari / foul|modal + sample|撮影済|011–015|
|Self Best|populated|normal + sample|撮影済|各競技詳細内|
|Self Best|empty / ineligible `—`|empty|未撮影|通常データ分離で追加|
|Opponent|対戦数順 / 勝率順 / 相手固定履歴|normal + sample|撮影済|070–072|
|History|Player・競技固定 / Match Detail|normal + sample|撮影済|073–074|
|History|empty / one match / long-scroll|empty / normal|未撮影|追加fixtureが必要|
|Setup|6競技Player・race・breaker・固有option|setup|未撮影|競技差を確認する|
|Gameplay|6競技normal / distinct controls|gameplay|未撮影|全競技を別scenarioで撮影する|
|Result|completion / summary / recovery|gameplay + modal|未撮影|完走fixtureが必要|
|Settings|Settings / About / Backup|normal / modal|撮影済|090–092|
|Settings|Restore / chooser / success / failure|modal / OS|未撮影|Restore入口の自動操作は未成立|
|Error|no-data / invalid / permission|empty / error|未撮影|破壊的failureは製造しない|
|Analysis|Analysis Home / old Player Analysis|compatibility|Deferred|通常導線外|
|Analysis|Match Analysis / Rival Analysis|compatibility|Deferred|通常導線外|

## 判定

分析を中心としたBuild 11の通常導線は連続して確認できた。一方、Gameplay・Setup・登録・OS所有UIが残るため、現時点のFull Screenshot Auditは**部分完了**とする。
