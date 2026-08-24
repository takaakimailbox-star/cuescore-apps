# CueScore v1.0 Build 9 — Foul Rate / Metric Trend Popup Decision

- Status: Official Decision
- Adopted: 2026-08-24
- Published: 2026-08-25
- Approval: Product Owner

## Decision

1. Discipline detail no longer has a standalone `推移 / 指標の変化を見る` card.
2. Each supported metric opens its own trend graph in a modal without leaving the discipline-detail screen.
3. Supported drill-ins are 勝率、シュート率、ブレイクイン率、マス割り率、ファール率. Metrics not present for a discipline are not invented.
4. Replace `平均ファール/ラック` with `ファール率` for 9-Ball, 10-Ball, Rotation, 14-1, and JPA 9-Ball. 3 Cushion has no foul-rate metric.
5. `ファール率 = foul_racks / participated_completed_racks × 100`. A rack counts in the denominator only when completion and the target Player's actual participation are both determinable. A rack counts once in the numerator when that Player commits one or more fouls.
6. Missing or indeterminate history remains `—`; it must not be estimated or converted to zero.
7. Display precision is one decimal for ordinary rate metrics and two decimals for foul rate.

## Supersession

This decision supersedes Official 038 and 039 for the foul metric and discipline-detail trend UI. Those documents remain historical records. All unrelated scoring, navigation, storage, backup, and analytics contracts remain unchanged.
