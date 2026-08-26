# CueScore v1.0 Build 11 — Back Performance and Opponent Records Decision

- Status: Official Decision
- Adopted: 2026-08-26
- Approval: Product Owner

## Decision

1. Player関連画面の左上Backとedge Swipe Backは、同じ戻り先と同じ処理を使用し、入力直後に視覚反応を返す。固定待機時間をNavigation成立条件にしない。
2. 戻り先の画面とscroll／Player／競技／対戦相手の文脈は、可能な場合は保持済みDOMを先に再表示し、非必須の再計算を表示後へ分離する。
3. Back性能は、入力受付、handler開始、DOM切替完了、視覚利用可能の段階に分け、メモリ内だけで測定できるようにする。通常利用時のconsole出力や永続ログは追加しない。
4. 対戦相手別成績は、Playerと競技を固定し、対戦相手数、試合数、勝敗、勝率、sort、compactな相手cardを表示する。
5. 相手cardは、選択相手と競技を固定した試合履歴を開く。そこからはMatch Detailだけへ進み、深いRival Analysisへは進まない。
6. 判定可能な勝敗だけを勝敗・勝率へ使用する。結果欠損を敗戦として補完しない。

## Navigation Contract

`Player情報 → 競技詳細 → 対戦相手別成績 → 相手・競技固定履歴 → Match Detail`の各Backは一階層ずつ逆順に戻る。競技固定全試合、Player編集、Player一覧の既存Back契約も維持する。

## Boundary

競技ルール、採点、保存schema、Backup／Restore、分析指標定義、Match Detail、通常／サンプルデータ分離は変更しない。App Store Review、外部TestFlight、一般公開は本決定に含めない。
