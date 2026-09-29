# CueScore Match Sharing v1 — Symmetric Player Mapping Formal Amendment Evidence

- Date: 2026-09-29 JST
- Repository baseline: `003928ad7df2e70596ad7a7a1479cde4b84ff0fa`
- Decision: `SYMMETRIC PLAYER A/B MAPPING + RECEIVER UX REVISION — APPROVED`
- Classification: `B — SAFE WITH LIMITED CHANGES`
- Scope: documentation-only formal amendment
- Product implementation: revised implementation not started
- Formal review: Product Owner / ChatGPT APPROVED
- Commit / push: authorized for this Formal Amendment documentation-only Gate

## Product Owner adopted decisions

1. Receiver Flowから`あなたはどちらですか？`を廃止する。
2. Match Sharing固有のSelf Mapping / Opponent Mapping概念を廃止し、Receiver本人がMatch participantであることを要求しない。
3. Shared Player A / Bをreceiver-local Player A / Bへ対称に明示mappingする。名前一致による自動確定と同一local PlayerのA / B重複指定を禁止する。
4. Match PreviewとA / B mappingをheader `試合を確認`の1画面へ統合する。両方のmapping完了前は`次へ` disabled、完了後enabledとする。
5. Player名を人物として表示するReceiver UIでは原則avatarを名前の左へ置く。mapping前／pending newはdefault avatar、existing mapping後はreceiver-local avatarを使用し、sender avatarを共有、復元、推測しない。
6. Duplicateをscan/read failureから分離し、専用header、body、`他の試合を読み取る`action、Historyへ戻るBackを提供する。

## Source investigation result

現行MatchはPlayer 1 / Player 2の対称構造で、owner、Self、current user、main Playerを保存しない。HistoryとMatch Detailは両sideを直接表示し、Player Detail、Statistics、Analyticsはreceiver-local `registeredPlayerId`から対象sideを判定する。6競技、Backup / Restore、re-share、Free / Pro contractにもSelf / Opponent fieldは存在しない。

変更不要：

- Match storage schema
- schema migration
- Match Sharing Format v1
- Backup schema
- Analytics architecture
- Free / Pro access contract

限定変更が必要：

- Stage 3 mapping input contract
- Stage 5B Receiver state machine / UI
- focused tests / physical E2E
- Official 101 / 102、Decision Log、SSOT

## Third-party Import

Receiver main PlayerがMatch participantでないImportを正式に許容する。

例：

- receiver main Player：貴章
- Shared Match：ゆな vs かいと
- Sharedゆな → localゆな
- Sharedかいと → localかいと

期待結果：

- Matchは通常Matchとして保存される。
- ゆな／かいとのPlayer Detail、Statistics、Analyticsへそれぞれ反映する。
- 貴章には反映しない。
- main Playerは貴章のまま維持する。
- main PlayerをMatchへ自動追加しない。

非永続probeでは現行Stage 3 coreへ上記対応を渡すとImport成功、main Player不変、new Player作成0、re-share logical parity一致を確認した。これは現行`selectedSide / self / opponent`がMatch schema要件ではなく旧UI由来のadapter contractであることを支持する。

## Unified Receiver UI contract

Primary Flow：

`History → 受け取る → Scanner → 試合確認＋Player A / B local mapping → 取り込み内容を確認 → 試合を取り込む → 通常Match Detail＋success toast`

Unified screen headerは`試合を確認`。上部へ競技、日時、Player A / B、score / result、Race / targetを表示し、同じ画面の`この端末のプレーヤー`sectionでA / Bをmappingする。

Mapping rules：

- A / B双方を明示mappingする。
- existing Playerとpending new Playerを許容する。
- 名前一致で自動選択しない。
- 同一local PlayerをA / B両方へmappingしない。
- 既存Player Pickerを再利用する。
- pending new Playerをfinal transaction前に保存しない。
- pending new Playerを自動Primaryにしない。

Final Confirmationは`自分`／`対戦相手`を表示せず、shared Playerとreceiver-local Playerの対応、local avatar、new Player予定を区別する。

## Avatar and privacy

- mapping前：default / neutral avatar＋shared Player name
- existing mapping後：receiver-local avatar＋receiver-local Player name
- pending new：default avatar＋pending Player name

Format v1のMust Omitを維持し、sender avatarをpayloadへ追加しない。

## Dedicated duplicate UX

DuplicateはQR recognition、decode、validation成功後の`sharedMatchId`一致である。

- Header：`この試合はすでに取り込み済みです`
- Body：`同じ試合が試合履歴に保存されています。`
- Primary action：`他の試合を読み取る`
- Back：Historyへ戻る

`QRコードを読み取れませんでした`をDuplicateへ使用しない。non-CueScore、corrupted、unsupported version、invalid schema、oversizeは既存error分類を維持する。

## Stage 3 contract amendment

旧input：

- `selectedSide`
- `self`
- `opponent`

新input：

- `bySide[1]`
- `bySide[2]`

またはproject conventionに合う同等の対称mapping。Implementationではboth mapped、distinct local IDs、existing / pending new、no automatic mappingを検証する。Match構築、semantic read-back、rollback、duplicate final gateは既存contractを維持する。

## Existing Stage 5B Physical E2E

旧Receiver Flowのphysical E2E PASSを無効化しない。QR scan、Preview、Side Selection、Self Mapping、Opponent Mapping、Import transaction、normal Match Detail、duplicate rejectionの機能成立Evidenceとして保持する。

今回のAmendmentはそのUX feedbackに基づく後続Revisionであり、変更後Flowのphysical E2Eは`NOT VERIFIED`である。

## Free / Pro and Demo

維持：

- Match SharingはFree / Pro共通でPro gateなし。
- Free newest 20、Case C Option A、global hidden History count、既存Pro CTA。
- Demo export / import禁止、Receiver Entry非表示、service-level rejection。

## Test impact

Implementation時に最低限追加・更新する：

- A / B direct mapping validation
- existing/existing、new/existing、existing/new、new/new
- same local Player rejection
- third-party Import with unrelated main Player unchanged
- 6競技18 fixture semantic parity
- History / Match Detail / Player Detail / Statistics / Analytics
- re-share、Backup / Restore、duplicate、rollback
- Free 20件、Demo、privacy
- Unified Receiver UI、Back、disabled / enabled state、avatar source
- dedicated duplicate UX
- revised physical iPhone E2E

## Superseded and maintained scope

Superseded：

- own-side selection
- `あなたはどちらですか？`
- Self Mapping
- Opponent Mapping
- duplicate generic read-error presentation

Maintained：

- ECC-M Single QR
- Sender Entry / QR Display
- Receiver Entry / Scanner
- Match Sharing Format v1
- `sharedMatchId` / duplicate protection
- all-or-nothing Import / read-back / rollback
- privacy / Demo / Free / Pro
- Backup / Restore
- normal Match Detail＋success toast

Decision 028 / 029は当時の正式Decision履歴として保持し、Decision 030が該当Receiver範囲だけを後続確定する。

## Gate

`FORMAL DESIGN AMENDMENT PRODUCT OWNER / CHATGPT APPROVED / REVISED IMPLEMENTATION NOT STARTED / REVISED PHYSICAL E2E NOT VERIFIED`

Product source、Prototype、Build、Version、Archive、Upload、TestFlight、App Store Connectは変更していない。
