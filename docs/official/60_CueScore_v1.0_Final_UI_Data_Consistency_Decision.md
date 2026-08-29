# CueScore v1.0 — Final UI and Data Consistency Decision

Date: 2026-08-29  
Status: Product Owner adopted

## Decision

- 競技詳細の全画面推移は、各試合単体値ではなく各時点までの累計値を表示する。最新点は同Player／同競技／同eligible条件の主要指標と一致させる。
- 競技固定の全試合は`{競技名}の全試合`をtitleとし、重複する競技名とRace toをcardから除いたcompact rowにする。今回の明示対象は9-Ballで、共有実装は固定競技文脈だけに適用する。
- 14-1の`14ボールラック`案内はBottom Sheetから中央Modalへ変更する。案内内容、OK後の継続、scoring／rerack logicは維持する。
- 新規試合の対戦者候補は登録済みPlayerだけとし、編集不能なplaceholder Playerを廃止する。初回Home表示は維持し、0人／1人時はPlayer追加導線を試合設定内に表示する。

## Boundaries

- aggregate算出式、eligible判定、X／Y軸仕様、勝敗判定、保存schema、Backup／Restore互換性を変更しない。
- 既存placeholder由来historyを削除または別Playerへ推測migrationしない。
- 通常Player履歴、相手固定履歴、Match Detailの正式情報を変更しない。
- App Store Review、External TestFlight、一般公開は対象外とする。
