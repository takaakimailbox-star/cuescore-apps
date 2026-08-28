# CueScore v1.0 — Opponent-fixed History VS Row Removal Spec

Status: Official Release
Date: 2026-08-28

## UI contract

- 対象：相手IDと競技IDが固定されたPlayer match history。
- Header title：`{Opponent}との{Discipline}試合`を維持する。
- Header直下：`Player vs Opponent`行を生成後に残さず、avatarを含む行全体をDOMから除外する。
- 維持：aggregate、年月heading、compact match cards、勝敗、score、race、chevron、Match Detail。
- Navigation：左上Backとedge Swipe Backは同じ既存Back契約を維持する。
- 非対象：通常のPlayer試合履歴、Match Setup、Game Input、Result、Match Detail、Rival Analysis。

## Acceptance criteria

1. 全6競技の相手固定履歴で`.journey-history-opponent-v11`が0件。
2. 通常Player履歴の表示契約は変更しない。
3. 390×844 portraitで横overflowがない。
4. 全自動テスト、native asset一致、Simulator Debug／ReleaseがPASSする。

## Supersession

Official 046／047／048／049の相手固定履歴`Player vs Opponent`行に関する記述を、本仕様が競合範囲で置き換える。
