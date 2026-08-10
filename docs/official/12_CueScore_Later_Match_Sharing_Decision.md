# CueScore Apps — Match Sharing / 試合共有 Later決定

Status: Adopted — Later / Deferred  
Decision date: 2026-08-10  
Authority: Product Owner adopted decision

## Decision

CueScore Appsに「試合共有（Match Sharing）」機能を将来機能として正式登録する。

この機能はApp Store v1.0の実装対象には含めず、v1.1以降の候補としてLater / Deferred扱いとする。v1.0では安定した公開可能版の完成を優先し、試合共有に関するUI・保存形式・転送処理は追加しない。

## Intended use case

2人が対戦し、片方のCueScore Appsだけで試合を記録した場合に、記録した完了試合を相手側のCueScore Appsへ転送し、相手側も同じ試合を自分の試合履歴・統計・分析の対象として保持できるようにする。

例：

- プレーヤーAとプレーヤーBが対戦する。
- プレーヤーBの端末で試合を記録する。
- 試合終了後、プレーヤーBからプレーヤーAへその試合データを共有する。
- プレーヤーAは内容を確認して自分のCueScore Appsへ取り込み、自分の履歴・統計・分析へ反映できる。

## Scope classification

- v1.0: Deferred / 非搭載
- v1.1以降: 実装候補
- 自動クラウド同期とは別機能として扱う。
- 現時点では転送方式を確定しない。

## Items that must be designed before implementation

実装前に少なくとも以下を正式に決定する。

1. 転送方式（QR、共有ファイル、OS共有機能、近距離共有等）。
2. 送信側プレーヤーと受信側の既存プレーヤーをどう紐付けるか。
3. 同一試合の二重取り込みを防ぐ識別方法。
4. 共有後に片方で試合を編集した場合の扱い。
5. 試合IDおよび端末をまたぐ安定識別子の設計。
6. データ形式・バージョン差がある場合の互換性。
7. 通常データとOfficial Demo Data（サンプルデータ）の完全分離。
8. 取り込み前の内容確認とユーザー承認フロー。
9. 不完全・破損・未知バージョンの共有データを安全に拒否する方法。
10. プライバシーおよび共有対象データ範囲。

## v1.0 constraint

本決定は将来機能の登録のみであり、v1.0の既存データ形式、試合履歴、Player Analytics、Player Detail、Game Result、バックアップ／復元、Official Demo Dataには変更を加えない。

v1.0完成前にこの機能を自動で実装対象へ昇格させない。実装開始にはProduct Ownerによる改めての採用判断と、上記未決事項の仕様確定を必要とする。
