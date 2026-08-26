# CueScore v1.0 — iPhone UI / Back Fix Decision

- Status: Official Decision
- Adopted: 2026-08-27
- Approval: Product Owner
- Clarifies and supersedes where conflicting: Official 046/047

## Decision

1. 対戦相手別成績の選択Player／固定競技は白い相手cardと同列にせず、一覧上部のcompact context headerとして表示する。白い一覧cardは対戦相手だけに使用する。
2. 相手・競技固定履歴のPlayer vs Opponentは小さいavatarと名前だけのcompact一行とし、固定済み競技icon／textを重複表示しない。
3. 相手固定match cardは日付、時刻、勝敗、score、race／target、chevronだけを残す。競技、相手avatar／name、詳細／分析buttonは表示しない。
4. Player履歴は複数競技・相手を識別できる競技名と相手名を維持しながら、一行中心のcompact cardへ縮小する。相手固定履歴とは別の表示契約とする。
5. 履歴から開くMatch DetailはPlayer／Opponent／Discipline／history originを保持する。左上Backとedge Swipe Backは同じ標準Back controlと同じ復帰処理を使う。

## Boundary

本決定は実iPhoneで確認された表示差分と既存Back仕様違反の修正である。採点、競技ルール、保存schema、Backup／Restore、analytics formula、eligible判定、通常／Sample Data分離を変更しない。App Store Review、外部TestFlight、一般公開は別承認とする。

## Verification Gate

相手固定履歴／Player履歴それぞれについて、Match Detailから左上Backとedge Swipe Backで同じoriginへ戻る4経路を確認する。390×844、長いPlayer名、横overflow、全自動テスト、source／native資産一致、Simulator Debug／Releaseを確認する。実iPhone再確認前の項目はPASS扱いにしない。
