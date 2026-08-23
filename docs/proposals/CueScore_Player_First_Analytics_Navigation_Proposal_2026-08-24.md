# CueScore Player-first Analytics Navigation Proposal

- Status: Pattern A Adopted by Product Owner / Implementation tracked separately
- Date: 2026-08-24 (JST)
- Scope: Design proposal only
- Implementation: Not performed

## 1. Baseline

- Start local HEAD: `9b2978fec839bb95501a463c2940d3a4d3316eb4`
- `origin/main`: `3286992b739eaf17f36671214a2433d34d95181b`
- Local `main`: 2 commits ahead of `origin/main`
- Start worktree: clean

## 2. Recommendation

Build 8には**A：最小変更案**を推奨する。

現行Build 8候補は、Player起点、Player情報と競技詳細の2階層、対戦相手／全試合の2入口、Player／競技固定履歴、compactな詳細／分析操作、1階層Backをすでに備えている。v1.0公開前は画面再構成を広げず、入口名、重複、Back contextを限定的に整える方が安定性に適する。

## 3. Current screens and journey

現行分析関連画面：

1. Home
2. Player一覧
3. Player情報
4. 競技詳細
5. 対戦相手別の成績
6. Rival Analysis
7. Player／競技固定の全試合
8. Match Detail
9. Player目線Match Analysis
10. 通常導線から外れた互換用Analysis Home／旧Player Analysis

通常導線：

```text
Home
└─ Player一覧
   └─ Player情報
      └─ 競技詳細
         ├─ 対戦相手別の成績
         │  └─ Rival Analysis
         └─ 競技固定の全試合
            ├─ Match Detail
            └─ Match Analysis
```

## 4. Screen responsibilities

| 画面 | 役割 | 置かないもの |
|---|---|---|
| Home | ゲーム開始とPlayer一覧への入口 | 独立した分析分類 |
| Player一覧 | 知りたいPlayerを選ぶ | 競技や分析種類の選択 |
| Player情報 | Player全体と6競技通算を見る | 個別試合、詳細グラフ |
| 競技詳細 | Player × 競技の主要指標、推移、自己ベストを見る | 最近の試合、Player selector |
| 対戦相手別の成績 | 相手ごとの勝敗・勝率を見る | 長期推移、試合詳細 |
| Rival Analysis | Player × 対戦相手の相性を見る | 他の相手や競技の混在 |
| 全試合 | Player × 競技の試合を高密度で探す | 大きな分析カード |
| Match Detail | 1試合の事実、スコア、履歴を見る | 長期傾向 |
| Match Analysis | Player × 1試合を振り返る | Player／競技全体の傾向 |

この役割分担は適切。主な課題は画面数ではなく、「分析」という分類名と互換実装に残る旧入口の概念的な混在である。

## 5. Entry audit

### Required

- Home → `プレーヤー一覧`
- Player一覧 → 対象Player
- Player情報 → 各競技
- 競技詳細 → `対戦相手別の成績`
- 競技詳細 → `[競技名]の全試合`
- 試合カード → `詳細`
- 試合カード → Player目線Match Analysis
- 対戦相手一覧 → 対象相手のRival Analysis

### Duplicate or hidden compatibility candidates

- 独立Analysis Home
- Player selector付き旧Player Analysis
- `プレーヤー分析を見る`
- 競技詳細の「最近の試合」
- 同じ試合へ進む大きな独立分析ボタン
- Player情報から競技を経由せず開く汎用試合一覧

Build 8候補では多くが通常導線から除外済み。互換コードは即削除せず、通常導線から到達不能な状態を維持する。

### Label candidates

| Current | Candidate |
|---|---|
| ライバル分析 | 対戦相手との比較 |
| 対戦相手分析を見る | 対戦相手別の成績 |
| この試合を分析 | この試合を振り返る |
| 試合カードの`分析` | `振り返り` |
| プレーヤー分析 | 競技詳細、またはPlayer名＋競技名 |

`詳細`と`振り返り`なら、利用者は分析機能の分類を理解せず目的を予測できる。ただしOfficial 036／037ではカード右端を`詳細`／`分析`と確定しているため、変更には後続Official Decisionが必要。

## 6. Pattern A — Minimal refinement

現行Build 8構造を維持し、次だけを候補とする。

- 旧Analysis Homeを通常導線へ露出させない
- Rival関連ラベルを`対戦相手別の成績`へ統一
- Product Owner採用時だけ試合カードの`分析`を`振り返り`へ変更
- Match Detail／Match AnalysisのBackを元の競技固定全試合へ戻す
- Player、競技、Match、viewer Player contextをruntimeで保持
- compactな試合一覧密度を維持

評価：分かりやすさは高い、実装量は小、回帰リスクは低、v1.0適性は最も高い、将来拡張性は中。

## 7. Pattern B — Stronger organization

Player起点を維持し、競技詳細の入口を次の2つとしてさらに明確化する。

```text
競技詳細
├─ 対戦相手から見る
└─ 試合から見る
```

試合一覧ではカード全体をMatch Detail入口とし、右端に`振り返り`だけを置く。Match Detail下部にも`この試合を振り返る`を置き、一覧から直接進む経路とDetail経由の経路を許容する。

評価：分かりやすさは非常に高い、実装量と回帰リスクは中、v1.0適性は条件付き、将来拡張性は高い。

懸念：Match Detail入口追加、カード操作変更、戻り元の複数化により、Build 8で修正済みのNavigationを再び広く変更する。

## 8. Comparison

| 観点 | A：最小変更 | B：整理強化 |
|---|---|---|
| 迷いにくさ | 高い | 非常に高い |
| 画面追加 | なし | なし |
| コード変更 | ラベル・context確認中心 | 一覧カード・Detail入口・Backも変更 |
| 回帰リスク | 低 | 中 |
| 390px一覧性 | 現状維持 | 維持可能 |
| v1.0向き | ◎ | ○ |
| Build 9以降の拡張 | ○ | ◎ |

## 9. Recommended hierarchy

```text
Home
└─ プレーヤー一覧
   └─ Player情報
      ├─ 9-Ball詳細
      │  ├─ 対戦相手別の成績
      │  │  └─ 対象相手との比較
      │  └─ 9-Ballの全試合
      │     ├─ 試合詳細
      │     └─ 試合の振り返り
      ├─ 10-Ball詳細
      ├─ Rotation詳細
      ├─ 14-1詳細
      ├─ JPA 9-Ball詳細
      └─ 3 Cushion詳細
```

## 10. Back navigation

```text
試合の振り返り
→ 元の競技固定全試合
→ 同じ競技詳細
→ 同じPlayer情報
→ Player一覧
→ Home
```

```text
試合詳細
→ 元の競技固定全試合
→ 同じ競技詳細
```

```text
対象相手との比較
→ 対戦相手別の成績
→ 同じ競技詳細
```

Navigation contract：

- 左上BackとSwipe Backは同じcontrolを使う
- Player IDと競技IDをruntimeで保持する
- Match IDとviewer Player IDを保持する
- 一覧へ戻る際は可能ならscroll位置も保持する
- HomeやPlayer情報へ途中で飛ばない
- 通常Historyから開いた場合は、その通常Historyを戻り先にする

## 11. Text wireframes

### Player information

```text
‹              プレーヤー情報          編集
────────────────────────────────
[Avatar] 石塚 貴章
         メインプレーヤー
         メモ...

競技別通算
────────────────────────────────
[9]  9-Ball       24試合  15勝9敗  63%  ›
[10] 10-Ball      12試合   7勝5敗  58%  ›
[R]  Rotation      8試合   5勝3敗  63%  ›
[14] 14-1          4試合   2勝2敗  50%  ›
[J]  JPA 9-Ball    9試合   6勝3敗  67%  ›
[3C] 3 Cushion     3試合   1勝2敗  33%  ›
```

### Discipline detail

```text
‹                ● 9-Ball 詳細
────────────────────────────────
[Avatar] 石塚 貴章
         9-Ball通算 24試合 15勝9敗 勝率63%

主要指標
────────────────────────────────
  72%       43%       18%       0.40
シュート  ブレイクイン  マス割り  ファール/ラック

[ 推移　指標の変化を見る                 ⌄ ]

自己ベスト
────────────────────────────────
[最高シュート率] [最高マス割り率] [最多マス割り]

見る対象を選ぶ
────────────────────────────────
[ 対戦相手別の成績                      › ]
  相手ごとの勝敗・勝率

[ 9-Ballの全試合                       › ]
  詳細・試合の振り返り
```

### Discipline-fixed match list

```text
‹                9-Ballの全試合
────────────────────────────────
石塚 貴章　9-Ball　24試合

2026/08/23
[Avatar] 石塚 貴章  vs  山田 太郎
Race to 5-5              5 − 3
                         [詳細]
                         [分析]
────────────────────────────────
2026/08/20
[Avatar] 石塚 貴章  vs  佐藤 一郎
Race to 5-5              2 − 5
                         [詳細]
                         [分析]
```

ラベル採用後は右下を`振り返り`にする。カード高を増やさず、1画面の表示件数を維持する。

## 12. Possible Build 8 implementation scope

Product OwnerがAの追加実装を承認した場合の最小範囲：

- `player-detail-build6.js`
- Player journey／history renderer周辺の`index.html`
- Navigation／Player Detail関連テスト
- 後続Official Decision／Spec
- `docs/CURRENT_STATE.md`
- Implementation Record
- Native assets同期
- 全テスト、Simulator Debug／Release、390px portrait、実iPhone確認

分析計算、保存schema、競技ルールは対象外。

## 13. Deferred to Build 9 or later

- `分析`から`振り返り`への全面的な用語統一
- Match Detail内の振り返り入口
- 試合一覧のscroll位置復元強化
- Rival Analysisの表示内容再構成
- `対戦相手から見る`／`試合から見る`への入口再命名
- 互換用Analysis Home／旧rendererの安全なコード削除
- Player Workspaceや3タブ構造
- 高度な分析分類、検索、比較期間切替

## 14. Official documentation impact

Aをラベル変更なしで採用する場合、現行Official 030、034、036／Spec 037とほぼ一致しており、新しい正式変更は不要。

次を変更する場合は後続Official Decision／Specが必要：

- `分析`から`振り返り`への変更
- Match DetailからMatch Analysisへの新入口
- 試合カード全体の責務変更
- Backの戻り元契約追加
- 対戦相手画面の名称・階層変更

## 15. Gate confirmation

本資料は未採用の設計提案である。Product Owner承認前に以下を行わない。

- 分析Navigationの実装
- 画面構成または導線の変更
- 新しいタブUI
- 分析計算またはschemaの変更
- Build Number変更
- commit／push
- TestFlight upload
- App Review提出
- 一般公開
