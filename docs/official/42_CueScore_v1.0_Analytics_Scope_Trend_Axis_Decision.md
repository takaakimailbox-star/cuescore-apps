# CueScore v1.0 — Analytics Scope and Trend Axis Decision

- Status: Official Decision
- Adopted: 2026-08-25
- Approval: Product Owner

## Decision

1. v1の通常分析導線は、Player情報、競技詳細、主要指標、指標別推移、自己ベスト、簡潔な対戦相手別成績、競技固定の全試合、Match Detailに限定する。
2. Match Analysis、Analysis Home、旧Player Analysis、深いRival Analysis、高度な分析は通常導線から外し、将来版へ延期する。互換コードと保存済みデータは削除しない。
3. 競技固定の試合一覧にはMatch Detailの操作だけを表示する。
4. 対戦相手別成績は相手名、試合数、勝敗、勝率、対象競技を確認する簡潔な画面とし、深いRival Analysisへの通常遷移を持たない。
5. rate推移グラフはY軸割合、X軸の日付／試合識別、各点の正確な日付と値を表示する。

## Boundary

採点、保存schema、Backup／Restore、指標の算出定義、精度、Match Detailは変更しない。Official 040／041のファール率と指標別popup決定を継承する。
