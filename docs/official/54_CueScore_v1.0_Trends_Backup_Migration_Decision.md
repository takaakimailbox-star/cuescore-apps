# CueScore v1.0 — Trends Readability / Backup Migration Decision

Status: Adopted / Official  
Decision date: 2026-08-28

## Decision 054

1. 全画面推移は390×844を基準に、X／Y軸、tick label、grid、plot line／point、試合日captionを常時視認可能にする。
2. Backup schema 1／2はRestore前に現行schema 2のcanonical Player／Match identityへ正規化し、検証完了後だけatomic Restoreへ渡す。未知の将来schemaや安全に変換できないデータは書込み前に停止する。
3. 個別Player／Match削除前の安全退避は、削除対象entityだけを保存する。全データ削除は従来どおり全体退避する。

## Cause and safety

旧BackupのID型や参照自体は有効だった。約3.9MBの復元データに対し、個別削除前に全Player／全MatchをlocalStorageへ再複製する実装が容量上限へ到達し、削除本体が実行されないことが直接原因である。対象entity退避に縮小して削除復旧性を維持し、全データ複製による容量増加だけを除く。

Scoring、analytics formula／eligibility、正式Player削除後の履歴保持、通常／Sample Data分離、App Store Review／External TestFlight／一般公開は変更しない。
