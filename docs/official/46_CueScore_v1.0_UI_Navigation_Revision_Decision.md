# CueScore v1.0 — UI / Navigation Revision Decision

- Status: Official Decision
- Adopted: 2026-08-26
- Approval: Product Owner
- Supersedes where conflicting: Official 040/041, 042/043, 044/045

## Decision

1. Rotation、14-1、JPA 9-Ballの自己ベストから`1試合最高得点`を除外する。その他の競技へは一般化しない。
2. 対戦相手別成績はPlayer・競技固定とし、summaryとsort controlを廃止する。相手は最新対戦日時の降順、同値は既存Player ID順で表示する。
3. 相手・競技固定履歴はPlayer vs Opponentを先頭、集計を次に置き、試合cardから固定文脈と重複する競技・相手情報を除く。Match Detailはcard／右chevronから開き、Match Analysisを表示しない。
4. Player試合履歴から期間、詳細、分析buttonを廃止する。複数競技・相手を識別できる情報と月別時系列を維持し、card／右chevronからMatch Detailを開く。
5. 競技詳細の個別指標bottom sheetを通常導線から廃止し、`グラフで見る`からPlayer・競技固定の全画面推移pageを開く。適用指標を縦に並べ、データ不足を0で補完しない。
6. Player一覧はsort controlを廃止し、一段compact rowとする。メインPlayer、最終実試合利用日時、既存stable IDの順で自動整列する。
7. 変更画面のBackとedge Swipe Backは同一遷移を使い、Player・競技・相手文脈を保持する。

## Boundary

採点、競技ルール、保存schema、Backup／Restore、指標の算出式とeligible判定、通常／Sample Data分離を変更しない。旧分析実装は互換目的で保持できるが、通常v1導線へ再露出しない。

## Verification Gate

390×844 portrait、横overflow、全自動テスト、source／native資産一致、Simulator Debug／Releaseを確認する。実iPhoneでのみ確認可能なSafe Area、Swipe Back体感、OS pickerは実機確認までpendingとする。
