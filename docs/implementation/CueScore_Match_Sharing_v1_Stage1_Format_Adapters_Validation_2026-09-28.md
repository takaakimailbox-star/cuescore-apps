# CueScore Apps — Match Sharing v1 Stage 1 Format / Adapters / Validation Evidence

**Date:** 2026-09-28

**Baseline:** `551aed938f3dbf450473fd7d9031d9131bba28e7`

**Branch:** `codex/race-picker-bottom-navigation`

**Gate:** `STAGE 1 PASS — PRODUCT OWNER / CHATGPT APPROVED`

## 1. Conclusion

Stage 1のpure Format / Adapter / Validation layerを実装し、指定PASS条件を満たした。Stage 2以降、product storage、UI、QR生成、Camera、Backup、Version／Build、commit／pushには進んでいない。

## 2. Architecture

| Module | Responsibility |
|---|---|
| `match-sharing-adapters-v1.js` | production completed Match → Logical v1、traceable compact mapping、逆展開 |
| `match-sharing-validation-v1.js` | Logical schema、UUID v4、6競技、privacy deny-list、size / depth / count limits、Demo eligibility、pure duplicate lookup |
| `match-sharing-format-v1.js` | deterministic JSON、Base45、`CSM1:` envelope、SHA-256 integrity、bounded raw-DEFLATE encode/decode |

Codecはbounded raw-DEFLATEとSHA-256を注入するpure boundaryとした。Stage 1はapp/runtimeへ未接続のため新dependencyを追加せず、Node testではbuilt-in zlib / crypto adapterを使用した。将来のproduct runtime adapter選定・bundle登録は別Gateである。

## 3. Production mapping

対象identifierは`rotation`、`nineBall`、`tenBall`、`jpa9Ball`、`straightPool`、`threeCushion`。保存sourceの`jpa9` objectはJPA固有data containerとして読み、logical `gameType`はproduction identifier `jpa9Ball`を使用する。

Must Preserveは日時、winner/result、match condition、Player表示・metrics、active event、analysis summary、progress、6競技固有data。local Match IDとsender local Player IDはtransportしない。

Must Omitはmemo、reflection、playerReflections、photo/avatar、registeredPlayerId、Category、Season、Pro/IAP/entitlement、device identifier、Backup、Demo metadata、Undo journal/auditである。

## 4. Transport

`CSM1:` + Base45(binary envelope)。Envelopeはmagic、envelope version、compression ID、declared uncompressed length、SHA-256(compressed bytes)、raw-DEFLATE(compact JSON)で構成する。compact field map、game code map、Player field order、event code/detail mapをcodeから追跡可能にした。既知eventへ将来fieldが追加された場合はstring type + full detailsへfallbackし、未知事実を落とさない。

## 5. Validation order and limits

Decode順序はprefix → encoded size → Base45 → envelope/version → declared inflate size → digest → bounded inflate → UTF-8/JSON → logical schema → UUID → game → Players → result → game-specific data。

| Limit | Value | Basis |
|---|---:|---|
| Encoded payload | 5,000 chars | Current 18-fixture max 1,852に対して2.69倍 |
| Envelope | 3,330 bytes | Base45 5,000 charsから逆算したbyte ceiling |
| Compressed body | 3,288 bytes | Envelope header/digest 42 bytesを控除 |
| Inflated body / text | 256 KiB | Current compact max 4,114 bytesに対して63倍超 |
| Object depth | 20 | Current formatを十分上回り、recursive abuseを拒否 |
| Object nodes | 50,000 | Bounded parse後structure walk |
| Array items | 20,000 | Aggregate array abuseを拒否 |
| Events | 10,000 | Current fixture max 65を十分上回る |
| Player name | 100 chars | Transport safety ceiling。receiver UI/local validationは後Stage |

## 6. Fixture and round-trip evidence

Official Demo v3.1 recordsを各競技のevent count順に並べ、Short=min、Medium=lower median index 9、Long=maxを選択した。fixtureはtest inputとしてのみ使用し、Demo mode exportはservice boundaryで拒否する。

- 18/18 production adapter → logical → compact → encode → decode → expand PASS
- 18/18 deterministic re-encode PASS
- 18/18 Must Preserve parity PASS
- 18/18 privacy scan PASS、contamination 0

## 7. Capacity evidence

ECC-M alphanumeric capacity tableによる理論見積り。QR生成はStage 4であり、今回の値をphysical scan PASSとは扱わない。

| Case | Fixture | Events | Logical B | Compact B | Deflate B | Base45 chars | Final chars | QR Ver. | Modules |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 9-Ball Short | sample-match-0667 | 22 | 4812 | 1885 | 701 | 1115 | 1120 | 22 | 105×105 |
| 9-Ball Medium | sample-match-0047 | 34 | 6856 | 2592 | 871 | 1370 | 1375 | 25 | 117×117 |
| 9-Ball Long | sample-match-0765 | 61 | 11040 | 4036 | 1163 | 1808 | 1813 | 29 | 133×133 |
| 10-Ball Short | sample-match-0148 | 19 | 4498 | 1806 | 668 | 1065 | 1070 | 22 | 105×105 |
| 10-Ball Medium | sample-match-0796 | 34 | 6447 | 2464 | 877 | 1379 | 1384 | 25 | 117×117 |
| 10-Ball Long | sample-match-0633 | 65 | 11451 | 4114 | 1189 | 1847 | 1852 | 30 | 137×137 |
| Rotation Short | sample-match-0941 | 16 | 3547 | 1305 | 544 | 879 | 884 | 19 | 93×93 |
| Rotation Medium | sample-match-0138 | 26 | 4556 | 1659 | 693 | 1103 | 1108 | 22 | 105×105 |
| Rotation Long | sample-match-0450 | 40 | 6447 | 2176 | 834 | 1314 | 1319 | 24 | 113×113 |
| JPA 9-Ball Short | sample-match-0213 | 14 | 3201 | 1262 | 599 | 962 | 967 | 20 | 97×97 |
| JPA 9-Ball Medium | sample-match-0706 | 28 | 5048 | 1806 | 770 | 1218 | 1223 | 23 | 109×109 |
| JPA 9-Ball Long | sample-match-0001 | 55 | 8811 | 2786 | 949 | 1487 | 1492 | 26 | 121×121 |
| 14-1 Short | sample-match-0389 | 18 | 3414 | 1397 | 620 | 993 | 998 | 21 | 101×101 |
| 14-1 Medium | sample-match-0545 | 23 | 3907 | 1549 | 691 | 1100 | 1105 | 22 | 105×105 |
| 14-1 Long | sample-match-0127 | 42 | 5959 | 2212 | 864 | 1359 | 1364 | 25 | 117×117 |
| 3C Short | sample-match-0372 | 10 | 2620 | 1208 | 546 | 882 | 887 | 19 | 93×93 |
| 3C Medium | sample-match-0666 | 21 | 3842 | 1555 | 692 | 1101 | 1106 | 22 | 105×105 |
| 3C Long | sample-match-0529 | 28 | 4491 | 1805 | 759 | 1202 | 1207 | 23 | 109×109 |

Rangeはlogical 2,620–11,451 bytes、compact 1,208–4,114 bytes、deflate 544–1,189 bytes、Base45 879–1,847 chars、final 884–1,852 chars、ECC-M Version 19–30。前FeasibilityのVersion 18–30レンジから最大Versionは増えていない。

Machine-readable evidence: `CueScore_Match_Sharing_v1_Stage1_Capacity_Evidence_2026-09-28.json`。

## 8. Negative and security evidence

指定14項目（bad prefix、unknown version、truncated、malformed Base45、digest mismatch、corrupt deflate、oversize compressed、oversize inflated、invalid UUID、invalid game type、missing Player A、missing Player B、invalid result、missing game data）をPASS。加えてencoded payload oversize、depth、array count、event count、privacy contamination、unbounded codec rejectionをPASSした。

ErrorはUI文言ではなく`MatchSharingError.code`で区別する。duplicateはstorageへ触れないpure lookup helperのみで、final save duplicate enforcementは後Stage。

## 9. Regression

- Stage 1 focused: `14/14 PASS`
- Existing Match / Analytics / Demo focused selection: initial `107/108`。失敗1件は現Official 101/102以前の旧文言を固定した`match-sharing-later-decision.test.mjs`で、product failureではなかった。Decision 12維持＋Official 101/102 successionを検証する現contractへ更新した。
- Final full Node: `473/473 PASS / 0 FAIL / 0 SKIPPED`
- `git diff --check`: PASS

## 10. Boundaries

- Product storage write: 0
- UI / CSS / HTML change: 0
- Backup / Restore change: 0
- Camera / Info.plist change: 0
- Dependency addition: 0
- Version / Build change: 0
- Commit / push: 0
- Stage 2+: NOT STARTED
- Final encoded payload physical scan: `NOT VERIFIED`

## 11. Review gate

Stage 1のsource、tests、EvidenceはProduct Owner / ChatGPT Reviewで承認された。approval Gateで1つのreviewable commitとしてGitHub `main`へ正本化し、Stage 2へ進まずSTOPする。

`MATCH SHARING v1 STAGE 1 APPROVED / STAGE 2 NOT STARTED`
