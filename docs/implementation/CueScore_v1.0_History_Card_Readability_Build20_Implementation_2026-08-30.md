# CueScore v1.0 — History Card Readability / Build 20 Implementation

- Date: 2026-08-30
- Base commit: `e064195e0a51c1dbdb2638f464ad80538b4d6048`
- Official: 064 / 065
- Marketing Version: 1.0
- Build Number: 20

## Implementation

- 全体履歴の両Player名を均等な可変gridへ変更し、390ptで全角6文字相当まで表示できるfont・avatar・gapへ調整した。7文字以上のellipsis、score、chevron、card tapは維持した。
- 競技固定履歴を上段`M/D HH:mm`／勝敗、下段avatar／相手名／score／chevronの116px 2段cardへ変更した。`vs`、競技名、Race toはcard内から除外し、Match DetailのRace toは維持した。
- 勝敗badgeは既存緑／赤semantic色と薄い背景へ変更した。
- DOM整形をidempotent化し、同じrowのaria-labelと要素移動を繰り返さないようにした。
- PWA cache versionを`2.0-build20-history-card-readability-v3`へ更新した。

## Verification

- Automated tests: `265 pass / 0 fail / 0 skipped`
- 390×844: viewport 390、document 390、横overflowなし
- 全体履歴: 7 tab、6文字相当名ellipsisなし、長い名前ellipsis、3桁score、chevron、card tapを確認
- 競技固定履歴: title、116px 2段、日時／勝敗／avatar／相手名／score／chevron、`vs` 0、競技名 0、Race to 0を確認
- Match Detail: card tap遷移とRace to表示を確認
- Native assets: source／native-web／iOS copiedの`index.html`、`ui-revision-v12.js`、`ui-revision-v12.css` SHA-256一致
- Simulator Debug: `BUILD SUCCEEDED`
- Simulator Release: `BUILD SUCCEEDED`
- 実iPhone: pending

## Distribution Boundary

- App Store Connectの最新使用済み番号はBuild 19。Build 20を未使用の次番号として採番した。
- Signed Release Archive: PASS
- TestFlight Internal Only upload: PASS（App Store Connectアップロード日 `2026-08-30 11:31 JST`）
- Apple processing: 終了
- Export compliance: 「上記のアルゴリズムのどれでもない」で保存
- Internal group: `CI CueScore Internal Testers`（招待数1）
- App Store Connect status: `テスト中`
- 実iPhone: pending
- App Store Review: 未提出
- External TestFlight／一般公開: 未実施

## Cleanup

- 作業用localhostを停止し、viewport overrideを解除した。配信確認用の内蔵ブラウザtabは記録完了後に閉じる。
