# CueScore Current UI Deferred / Compatibility Audit — 2026-08-26

|実装|通常UI到達|扱い|撮影判断|
|---|---|---|---|
|Analysis Home|なし|compatibility / legacy|撮影しない|
|旧Player Analysis|なし|compatibility / obsolete normal route|撮影しない|
|Match Analysis|通常の競技固定履歴では非表示|compatibility|通常v1一覧へ入れない|
|Deep Rival Analysis|なし|Deferred|対戦相手別成績から再露出しない|
|legacy renderers|なし、現行rendererのfallback用途|compatibility / potentially obsolete|必要時のみコード監査|

## 方針

- Deferred画面をスクリーンショット目的で通常導線へ戻さない。
- 現行v1.0のPlayer起点導線は、Player情報 → 競技詳細 → 推移／対戦相手別成績／競技固定履歴 → Match Detail。
- compatibility実装の削除、schema変更、再設計はこの監査の対象外。
