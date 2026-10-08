# CueScore 3言語用語集 Draft（ja / en / zh-Hans）

**Status:** DRAFT Rev.1 / **Glossary Review Pending**（本書の訳語はすべて未確定。確定は Phase P4 の翻訳・競技用語レビュー）。**P4 完了前に「正式完成」と判定しない。**
**Rev.1（2026-10-08）:** 「アプリ内の意味」と「翻訳候補」を区別する表（用語ID GL-01〜GL-08）と、P3 暫定 / P4 正式の状態管理表を追加。既存の表は維持
**Date:** 2026-10-08

## 読み方・ステータス定義

| ステータス | 意味 |
|---|---|
| **EXISTING** | 現行アプリが既にその表記を表示している（現行 `index.html` で確認）。変更しない |
| **EN-PARTIAL** | 英語候補が公開されている WPA 系ルール文書で一部裏付けられた（下記「根拠」参照）が、アプリ内表記としての採用は未確定 |
| **PENDING** | 根拠を確認できていない。**候補**のみ。確定しない（Glossary Review Pending） |
| **PO** | Product Owner / 競技者による確認が必要（ルール定義に関わる） |

**重要:** zh-Hans の競技用語は、今回の調査で中国側の公式団体（中国台球协会等）の用語集を**確認できなかった**。ゆえに zh-Hans 欄は一般的な用法に基づく**候補**であり、全件 PENDING。確認できない訳語を確定として扱わない。

## 根拠（確認できた範囲）

| ID | 内容 | 状態 |
|---|---|---|
| S1 | WPA Rules of Play（2025-09-15版）PDF が公開されている（`hkbilliardsports.org.hk` 掲載コピー）。反則節に "Cue-ball Scratch or off the Table"、"Wrong Ball First"、"No Rail after Contact" 等の見出しが存在することを検索結果で確認 | **本文全体は未読**。用語定義の逐語確認は NOT VERIFIED |
| S2 | WPA系9ボール規則の解説（複数）で "push out"（ブレイク後の最初のショットで宣言して行う、選択肢をオポーネントに与える特別なショット）、"scratch"（キューボール入り）、"foul break" の用法を確認 | 二次情報。公式本文での照合は未実施 |
| S3 | `inning` / `run`（連続得点）の WPA 定義は検索で確認できず | **NOT VERIFIED** |
| S4 | 現行アプリ内の既存表記・公式 Spec（`99`/`100` JPA Dead Ball、`22`/`34` マス割判定、`105`/`106` 等） | 確認済み（repo内） |
| S5 | 中国側（CBSA 等）の公式規則・用語の確認 | **NOT VERIFIED**（検索で該当の公式資料を得られず） |

## 競技名

| 用語 | ja（現行/基準） | en | zh-Hans（候補） | Status | 備考・根拠 |
|---|---|---|---|---|---|
| 9-Ball | `9-Ball` / aria `9-Ball 9ボール` | 9-Ball | 九球（候補: 美式九球） | EXISTING(en/ja) / PENDING(zh) | 競技名は現行UIで英字が主表記。ja の aria のみ「9ボール」併記 |
| 10-Ball | `10-Ball` / aria `10-Ball 10ボール` | 10-Ball | 十球 | EXISTING / PENDING(zh) | 同上 |
| Rotation | `Rotation` / aria `Rotation ローテーション` | Rotation | 轮转（候補） | EXISTING / PENDING(zh) | zh の一般呼称の確認なし。競技名は固有名として英字併記する案もあり |
| JPA 9-Ball | `JPA 9-Ball` / aria `JPA 9-Ball JPA 9ボール` | JPA 9-Ball | JPA 九球（候補） | EXISTING / PENDING(zh) | 「JPA」ルール由来の固有名称。**PO**: 正式名称の確認（JPAの正式英語名の表記）が必要。Dead Ball は `99`/`100` で定義済み |
| 14-1 | `14-1` | 14-1（正式名称候補: 14.1 Continuous / Straight Pool） | 14.1连续（候補） | EXISTING / PENDING | 現行UIは `14-1` のみ。aria は `14-1`。競技の正式英語名の併記要否は **PO** |
| 3-Cushion | `3 Cushion` / aria `3 Cushion 3クッション` | 3 Cushion（候補: Three-Cushion） | 三库（候補） | EXISTING / PENDING | 現行表記 `3 Cushion` を維持するのが最小変更。ハイフン付き表記への変更は表示変更に当たる → **PO** |

方針: 競技名タイル（Home の Discipline）は**現行の英字表記を全言語で維持**（EXISTING）。ja の aria-label にのみ日本語読みが併記されているため、en / zh-Hans の aria は各言語の読みを P4 で決定。

## 競技用語

| 用語 | ja（現行/基準） | en（候補） | zh-Hans（候補） | Status | 根拠・備考 |
|---|---|---|---|---|---|
| Break | ブレイク | Break | 开球（候補） | EN-PARTIAL / PENDING(zh) | S2。ブレイク入球率=`ブレイクイン率` は "Break-in rate"（候補・EN未確認） |
| Foul | ファール（現行）／ファウル混在なし（`ファール`） | Foul | 犯规（候補） | EN-PARTIAL / PENDING(zh) | S1/S2。現行は「ファール」（`ファウル` は検出されず） |
| Scratch | スクラッチ | Scratch | 母球落袋（候補） | EN-PARTIAL / PENDING(zh) | S1 "Cue-ball Scratch"、S2。zh は「白球落袋」等の呼称差の可能性 → 確認要 |
| Push Out | プッシュアウト | Push Out | （訳語未確認。「推出」は直訳候補だが競技用語として未確認） | EN-PARTIAL / PENDING(zh) | S2 で英語の用法を確認（宣言必須、相手が選択）。zh は**確定不可** |
| Rack | ラック | Rack | 局（候補。ボール配置の意の「球架」とは区別が必要） | PENDING | アプリ内の「Rack」は**ゲーム単位**（`ラック終了`、`ラック制`、`Rack数`）。英語の "rack" は配置/ラック枠の意もあり、ゲーム単位として自然かは **PO**。zh は「局」/「台」/「架」で意味が異なる |
| Race (to N) | `Race to`（現行は英字のまま：`自分Race to`、`相手Race to`） | Race to | 先胜N局 / 抢N（候補） | EXISTING(ja/en) / PENDING(zh) | 現行UIが既に `Race to` を英字で表示。zh のみ候補を要確認 |
| Inning | イニング／`Inning`（`得点/Inning`、`平均Inning` 混在） | Inning | 回合（候補） | EXISTING(混在) / PENDING | S3 未確認。ja 内で「イニング」と「Inning」が混在している現行表記の統一は **PO**（翻訳外の表記ゆれ） |
| Run / High Run | ハイラン | High Run | 最高连续得分 / 最高单杆（候補） | PENDING | S3 未確認。Rotation/14-1 の連続得点を指す文脈。zh は競技ごとに用法が異なる可能性 |
| Break & Run（マス割） | マス割 / マス割り率（`マス割`・`マス割り`の混在） | Break & Run（候補。ただしアプリ定義は後述の通り厳密） | 清台 / 一杆清台（候補） | PENDING / **PO** | アプリ定義（Decision 22 / 34）: ブレイクした本人が一度も手番を渡さず、ファールなし、ブレイク入球を含む**全対象球**を台上から無くしてラックに勝利。一般の "break and run" と**完全一致するとは限らない** → PO確認必須。ja 内の「マス割」「マス割り」の表記ゆれも別途統一 |
| Safety | セーフティー／セーフティ（混在） | Safety | 防守（候補） | PENDING | ja 内の長音有無の混在は翻訳外の表記ゆれ |
| Miss | ミス | Miss | 失误（候補） | PENDING | |
| Shot rate | シュート率 | Shot rate / Pocket rate（候補） | 进球率（候補） | PENDING | アプリ内の算出定義（Spec 09 / 28 の「ポケット数とミス数から集計」）に照らして P4 で要確認 |
| Average | アベレージ / 平均 | Average | 平均（候補） | PENDING | |
| Target points / Handicap | 目標点 / 持ち点 / SL別目標点 | Target score / Starting points（候補） | 目标分 / 持分（候補） | PENDING / **PO** | `目標点`（Rotation/14-1）と `持ち点`（3C）の使い分けが現行にある。SL（スキルレベル）は略語維持が候補 |
| Dead Ball（JPA） | デッドボール／`デッド` | Dead ball | 死球（候補。一般語と競合の恐れ） | PENDING / **PO** | `99`/`100` で定義（得点としてどちらにも与えられない的球）。zh「死球」は別意味の恐れ。定義文を併記して確認 |
| Draw | 引き分け | Draw | 平局 | PENDING | 低リスク |
| Match | 試合 | Match | 比赛 | PENDING | 低リスク |
| Player | プレーヤー | Player | 球员（候補。台球では「选手」も一般的） | PENDING | |
| Main Player | メインプレーヤー | Main player | 主要球员（候補） | PENDING | Spec 105/106 の用語 |
| Category / Season | 区分 / シーズン | Category / Season | 类别 / 赛季 | PENDING | CSV 本文・ヘッダーは日本語固定（D5）。画面ラベルのみ翻訳 |
| Match Sharing | 試合共有 | Match Sharing | 比赛分享（候補） | PENDING | Spec 101/102 の機能名。QRコードは `QR code` / `二维码` |
| Backup / Restore | バックアップ / データ復元 | Backup / Restore | 备份 / 恢复数据 | PENDING | 低リスク |
| Free / Pro | Free / Pro（CueScore Pro） | Free / Pro（CueScore Pro） | 免费版 / Pro（CueScore Pro） | EXISTING(固有名) / PENDING(zh) | `CueScore Pro` は製品名として全言語で不変 |
| Camera permission | カメラ | Camera | 相机 | PENDING | iOS 標準用語に合わせる |

## アプリ内の意味と翻訳候補の区別（【Rev.1】ルール定義に関わる語）

**原則（Spec A §15 L-GLOS-1/5）:** 「アプリ内の意味」は repo の公式 Spec / Decision が定義する内容。「翻訳候補」はそれとは**独立**で、一般的な競技用語と**完全一致するとは限らない**。一次資料（競技団体の規則）が未確認の語は `PENDING` を維持し、P3 の暫定翻訳（`P3-PROVISIONAL`）に使う場合も確定扱いしない。

| 用語ID | 用語 | アプリ内の意味（出典） | en 候補 | zh-Hans 候補 | 一般用語との差異・リスク | 用語状態 | P3 暫定投入 |
|---|---|---|---|---|---|---|---|
| GL-01 | **マス割**（Break & Run 相当） | 9-Ball / 10-Ball で、**ブレイクした本人が相手へ一度も手番を渡さず、ファールせず、ブレイク入球を含む全対象球を台上から無くして**ラックに勝利した場合のみ 1 回。スポット反映後の全対象球消失で判定。マス割り率 = 正式マス割り回数 ÷ 本人がブレイクした全判定可能完了ラック数 × 100（Decision 22 / Spec 23、Decision 34 / Spec 35） | `Break & Run`（候補） | `清台` / `一杆清台`（候補） | 一般の "break and run" の定義と同一とは限らない（アプリ定義は「全対象球消失」「手番移行なし」「スポット反映後」）。英語で採用するなら定義文（ツールチップ等）の併記要否を PO が判断 | **PENDING**（根拠なし） | 可（PROVISIONAL。意味を断定しない短い表記に限る） |
| GL-02 | **JPA 9-Ball** | 9-Ball の一種で、SL（スキルレベル）・Race・Match Point・Dead Ball 表示・9 番処理を持つ競技（Spec 11 / 99 / 100）。「JPA」の正式名称・綴りは **repo 内の公式文書に記載なし** | `JPA 9-Ball`（現行 UI の英字表記を維持） | `JPA 九球`（候補） | 「JPA」の英語正式名称が未確認のため、説明文への展開（"Japan … Association" 等）は**行わない**。ルール上の固有名として英字のまま扱うのが最小リスク | **PENDING**（JPA の正式名称） | 可（競技名は現行表記のまま。固定表記 G-1） |
| GL-03 | **Dead Ball** | JPA 9-Ball で**得点としてどちらの Player にも与えられない的球**の累計数。ファール / スクラッチという事象自体は加算しない。何も入らないスクラッチは 0、3 番を入れてスクラッチなら 3 番を 1 球加算。**9 番は Dead Ball に含めない**（Decision 99 / Spec 100） | `Dead Ball(s)`（候補） | `死球`（候補。**他の意味と競合する恐れ**） | 一般のプール用語としての "dead ball" の意味は文脈で異なる。zh の「死球」は別の意味に読まれる可能性が高い。定義文併記が望ましい | **PENDING** | 可（PROVISIONAL。数値表示ラベル中心） |
| GL-04a | **Rack（ゲーム単位）** | 9-Ball / 10-Ball 等のラック制で、1 回のラック（1〜9 番または 1〜10 番）を単位とする**ゲーム**。`rack_end`、「ラック終了」「ラック制」「Rack 数」「最終ラック数」（Spec 21 / 23 / `rack_end` event） | `Rack`（候補） | `局`（候補） | 英語の "rack" は「ボール配置の枠／配置」の意もあり、ゲーム単位として自然かは PO / 競技者確認 | **PENDING** | 可（PROVISIONAL） |
| GL-04b | **ラック（14-1 の再ラック）** | 14-1 で 14 球を再配置する操作の通知（`14ボールラック`、`rerack`） | `Re-rack`（候補） | `重新摆球`（候補） | GL-04a と意味が異なる。同一訳語にしない | **PENDING** | 可（PROVISIONAL） |
| GL-05 | **Inning** | プレーヤーごとにカウントされるターン単位（Spec 09 の「自分の総イニング数」の記述による。「1 イニングが何を指すか」の競技別の厳密な定義は repo の Spec で P4 に再確認）。ハイラン＝**1 イニング中の最高得点**、JPA 9-Ball アベレージ＝総得点 ÷ **自分の総イニング数**（0 点のイニングを含む）、14-1・3 Cushion アベレージ＝総得点 ÷ イニング数（Spec 09） | `Inning`（候補。現行 UI も `Inning` を使用） | `回合`（候補） | WPA の定義は未確認（S3）。競技ごとの「1 イニング」の数え方の差を確認する必要あり。ja 内の `イニング`/`Inning` 混在は翻訳外（G-4） | **PENDING** | 可（PROVISIONAL） |
| GL-06 | **Run / High Run（ハイラン）** | `currentRun` / `maxRun`。ハイラン＝1 イニング中の最高得点（Spec 09）。Rotation・JPA 9-Ball・14-1 等の Player 指標 | `High Run`（候補） | `最高连续得分`（候補） / `最高单杆`（候補） | 競技ごとの "run" の意味（連続ポケット数と得点の関係）が異なる可能性。WPA の定義は未確認（S3） | **PENDING** | 可（PROVISIONAL） |
| GL-07 | **Rotation** | Rotation 種目。Player 別の**目標点**を持つ。指標は ハイラン／シュート率／平均ファール（Spec 09 / 21）。ボール得点の細則は repo の Spec を P4 で再確認 | `Rotation`（現行 UI の英字表記を維持） | `轮转`（候補。一般呼称は未確認） | 競技名は固有名として英字のまま G-1 を適用。zh の説明語の採否は PENDING | **PENDING**（zh のみ） | 可（競技名は現行表記のまま） |
| GL-08 | **Push Out** | アプリにはプッシュアウトの入力・判定 UI がある（`pushOutStateV730`、`pushOutDecisionOverlayV730`、Spec 27 ほか）。競技上の手順（ブレイク直後の最初のショットで宣言し、相手が選択）は WPA 系の解説で確認した一般的な内容で、**アプリ内の適用範囲・細則は P4 で repo の Spec に照らして再確認** | `Push Out`（EN-PARTIAL：WPA 系解説で用法を確認、本文逐語は未確認） | （未確認。直訳「推出」は競技用語として未確認） | zh は**確定不可** | **PENDING**（zh）／EN-PARTIAL（en） | 可（en のみ。zh は PROVISIONAL で意味を断定しない） |

### P3 暫定翻訳（P3-PROVISIONAL）と P4 正式翻訳の状態管理

| 項目 | P3（画面別 3 言語対応） | P4（翻訳・競技用語レビュー） |
|---|---|---|
| 目的 | 全画面で en / zh-Hans が**表示できる**ことの確認 | 用語と文言を**確定**する |
| 文言の状態 | `P3-PROVISIONAL` | `P4-REVIEWED` → `P4-APPROVED` |
| 用語の状態 | `PENDING` / `CANDIDATE` のまま使用可（確定扱いしない） | `CONFIRMED`（一次資料または承認記録が必須） |
| 状態の保持場所 | レビュー状態 manifest（配布物に含めない記録）。catalog 本体に状態を混ぜない | 同左（更新） |
| リリース候補への可否 | **不可** | 全キー `P4-APPROVED`、glossary `PENDING`/`CANDIDATE` 0 で可 |
| 判定 | 「正式完成」と判定しない | PENDING 0 を満たした場合のみ完成 |

- **P4 完了前に正式完成と判定しない**（L-GLOS-4）。F AC-1 のリリース受入に `P3-PROVISIONAL` 0 を含む。
- 一次資料の確認手順（P4）: (1) WPA Rules of Play の該当節（push out / scratch / foul / inning / run）の逐語確認、(2) 日本側は競技団体の規則（JPA の正式名称を含む）の確認、(3) 中国語は中国側の公式規則・用語集、または中国語話者の競技者による承認記録。

## 運用ルール（Draft）

- G-1: 競技名・製品名（`CueScore`、`CueScore Pro`、`9-Ball` 等のタイル表記）は**翻訳せず固定**（現行表記維持）。
- G-2: 用語は `glossary.*` キーに一元化し、画面別キーから参照する（P3）。
- G-3: 競技ルール定義に関わる語（Break & Run / Rack / Dead Ball / Push Out / Run / Inning 等）は、**ルール定義文＋根拠付き**で PO / 競技者が確認してから P4 で確定する。
- G-4: 現行 ja 内の表記ゆれ（`イニング`/`Inning`、`マス割`/`マス割り`、`セーフティー`/`セーフティ`、`ファール`）は**今回の翻訳作業の範囲外**であり、ja 表示を変更しない（ja は現行不変が受入条件）。統一する場合は別Decision。
- G-5: 確認できない訳語は catalog へ**確定値として**投入せず、レビュー状態付きで保持（P3 では `P3-PROVISIONAL`）。P4 完了時に PENDING / CANDIDATE 0 と全キー `P4-APPROVED` を要求（Spec A L-GLOS-2〜4）。
- G-6: S1・S3 のとおり、WPA 規則本文の逐語確認は未実施。P4 で WPA Rules of Play の該当節を直接参照して英語欄を確定する。

## 未解決（Glossary 固有）
1. JPA の正式名称（英語）と `JPA 9-Ball` 表記の根拠（**PO**）
2. 14-1 / 3 Cushion の正式英語名併記の要否（**PO**）
3. Rack のゲーム単位としての英語・中国語表現（**PO**）
4. マス割 の英語・中国語対応語と、アプリ独自定義との差の扱い（**PO**）
5. Dead Ball の zh 表現（定義文付きレビュー）
6. 中国側用語の一次資料（CBSA 等）の確認手段
