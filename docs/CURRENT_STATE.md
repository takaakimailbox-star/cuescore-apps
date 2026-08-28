# CueScore Apps Current State

## v1.0 Release Candidate Build 16準備（2026年8月28日）

- Build 15の実iPhone動作確認はProduct Owner確認によりPASS。App Store Review、External TestFlight、一般公開は未実施。
- 公開版Settingsではサンプルデータ見出し／card／全操作入口をrenderしない。サンプルデータ実装と通常データ分離は開発検証互換として維持し、Backup／Restore／Data Deleteは変更していない。
- App Store ConnectでBuild 16未使用を確認し、Marketing Version `1.0`／Build Number `16`をRC候補に設定した。
- 全自動テスト`244 pass / 0 fail / 0 skipped`。390×844 Settingsでsample heading／region 0、横overflowなし。native asset一致、Simulator Debug／Releaseとも`BUILD SUCCEEDED`。
- Signed Archive、Validate、TestFlight Internal Only、RC実iPhone確認、App Store metadata／公開用screenshots監査はpending。RC実iPhone PASS前にmetadata監査を開始せず、明示承認前にApp Store Reviewへ提出しない。
- Official 056／057。実装記録：`docs/implementation/CueScore_v1.0_Release_Candidate_Build16_Preparation_2026-08-28.md`。

## Build 15候補：推移可読性・旧Backup migration／個別削除修正（2026年8月28日）

- 全画面推移の軸余白、X／Y tick、grid、line／point、試合日captionを390×844向けに明瞭化。1点中央、label間引き、0／100%／欠損／同値を維持し、横overflowなしを確認した。
- 旧Backup削除不能の直接原因はID不整合ではなく、大容量Restore後の個別削除前に全Player／全MatchをlocalStorageへ再複製する安全退避の容量増幅。個別削除では対象entityだけを退避し、全件削除の全体退避は維持した。
- schema 1／2を現行schema 2へcanonicalizeする共通migrationをReplace／Mergeへ追加。unsafe／unsupportedはtransaction前に停止する。
- Product Owner提供4 fixtureでmigration／round-trip、Player削除、Matchがある3 fixtureのMatch削除、primary最大1、orphan 0、console error 0をPASS。個人データfixtureはrepositoryへ保存していない。
- 全自動テスト`244 pass / 0 fail / 0 skipped`、native asset一致、Chrome 390×844、Simulator Debug／ReleaseをPASS。同一commitからBuild 15 Signed Archive、Validate、`TestFlight (Internal Testing Only)` uploadまでPASS。Apple処理完了後、輸出コンプライアンスを正式回答「上記のアルゴリズムのどれでもない」で保存。既存内部グループ`CueScore Internal Testers`に含まれ、状態は`テスト中`。実iPhone確認のみpending。
- Official 054／055。実装記録：`docs/implementation/CueScore_v1.0_Trends_Backup_Migration_Build15_Implementation_2026-08-28.md`。

## v1.0 相手固定履歴VS行削除・390×844レビュー撮影（2026年8月28日）

- 相手・競技固定履歴ではtitleが相手と競技を明示するため、本文の`Player vs Opponent`行をavatar含め行全体で削除した。通常Player履歴、aggregate、月別履歴、match card、Match Detail、Back／Swipe Backは維持した。
- 全自動テスト`238 pass / 0 fail / 0 skipped`。390×844でVS行0件と横overflowなしを確認した。
- review専用`docs/assets/review-ui/2026-08-28/`へ41 PNGを保存。30枚は390×844寸法検査済み、最終11枚はviewport resetにより731×720の補足画像としてREADMEへ明記した。Home、Player管理、全6競技詳細／推移／入力、Opponent Records／固定履歴、Player履歴、Match Detail、Setup／picker、9-Ball Result、Settings、Backup／Restore、About／法務／Supportを含む。
- 追加5競技Result、全scroll位置、empty/no-data全組合せ、OS picker、削除確定、Sample Data実行確認、全体試合履歴一覧は未撮影としてREADMEと実装記録へ明示した。review setはProduct Owner確認前に正式採用扱いにしない。
- Official 052／053がOfficial 046／047／048／049の`Player vs Opponent`行に関する記述だけを競合範囲で置き換える。
- scoring rules、saved-data schema、Backup／Restore、analytics formula、App Store Review／一般公開／外部TestFlightは変更していない。
- 実装記録：`docs/implementation/CueScore_v1.0_Remove_Opponent_VS_Row_Full_Screenshot_Review_Implementation_2026-08-28.md`。

## TestFlight Build 14 内部配信完了／実iPhone再確認待ち（2026年8月28日）

- 全ページBack修正と正式CueScore App Iconを含む最新sourceを基準に、Marketing Version `1.0`／Build Number `14`を設定したcommit `a9f5eb6bfa860c12067b6938cbce6a3422e332e9`を`origin/main`へpushし、同一sourceからArchiveした。
- Build Number更新前後とも全自動テスト`237 pass / 0 fail / 0 skipped`。native asset整合、iOS Simulator Debug／Release、Signed Release Archive、App Store ValidateをPASSした。
- Xcode Organizerから`TestFlight Internal Only`としてVersion `1.0`／Build `14`をアップロード。輸出コンプライアンスは正式回答「上記のアルゴリズムのどれでもない」で保存した。
- Build 14は既存内部グループ`CueScore Internal Testers`（1名）に含まれ、App Store Connect上の状態は`テスト中`。
- 実iPhoneでの正式App Icon、全ページBack tap／edge Swipe Back、文脈復帰、Safe Area、390×844、長い実データ名、写真、OS picker、通常／サンプル、6競技主要機能は再確認までpendingで、未確認のままPASS扱いにしない。
- App Store Review提出、外部TestFlight、一般公開、価格／配信地域変更は実施していない。Build Number `1`〜`14`は再利用しない。
- 配布記録：`docs/implementation/CueScore_Build14_TestFlight_Distribution_2026-08-28.md`。

## v1.0 全ページBack総監査／iOS App Icon原因修正・自動検証完了／実iPhone再確認待ち（2026年8月27日）

- 実iPhoneで左上Back tapが失効し、edge Swipe Backは戻れる共通原因を確定。edge gestureが左端の`touchstart`直後に`.app`を`pointer-events:none`へ変更し、Back button自身のclick生成をWebKit上で失効させ得ていた。
- Back control自身から始まるtouchはedge trackingを開始しない共通修正を実施。Player／競技／対戦相手／履歴／Match Detailに加え、対戦相手別成績、Player履歴、全画面推移、Player起点分析を同一Back対象・48px基準へ統一した。
- iOS icon不一致はcacheではなく、Asset CatalogにCapacitor初期templateの青いiconが残っていたことが直接原因。正式SSOTを既存`icons/cuescore-app-icon-512.png`のCueScore意匠と確定し、iOS用opaque RGB 1024pxへ同期した。
- 全自動テスト`237 pass / 0 fail / 0 skipped`、source／native-web／iOS copied index一致、Simulator Debug／Releaseとも`BUILD SUCCEEDED`。unsigned verification Archiveを作成し、App bundleの120px AppIconが正式CueScore Cマークであることを確認した。
- 採点、saved-data schema、Backup／Restore、analytics formulaは変更していない。実iPhoneの全Back tap／SwipeとTestFlight icon目視はpendingで、未確認のままPASS扱いにしない。
- Official 050／051。実装記録：`docs/implementation/CueScore_v1.0_Global_Back_Audit_AppIcon_Investigation_Implementation_2026-08-27.md`。

## v1.0 実iPhone UI／Match Detail Back修正完了・自動検証PASS／実iPhone再確認待ち（2026年8月27日）

- Build 12の実iPhone確認で確定した表示差分を修正。対戦相手別成績の選択Player／固定競技を白cardからcompact context headerへ分離し、白cardは対戦相手だけにした。
- 相手固定履歴はsmall avatarのPlayer vs Opponent、aggregate、月別履歴の順を維持し、競技重複表示を削除。match cardは日付／時刻、勝敗、score、race、chevronだけの48px基準へcompact化した。
- Player履歴は競技名／相手名を保持し、大きな競技icon／相手avatarを省いた54px基準の別layoutへcompact化した。相手固定履歴とPlayer履歴を別仕様として実装・テストした。
- 履歴cardから開いたMatch Detailのoriginを保持し、左上Backとedge Swipe Backを同じclose／restore処理へ統一。相手固定履歴／Player履歴の各2経路を回帰test化した。
- 全自動テスト`234 pass / 0 fail / 0 skipped`。source／native-web／iOS copied assets一致、Simulator Debug／Releaseとも`BUILD SUCCEEDED`。
- Marketing Version `1.0`／Build Number `12`のまま。実iPhoneの4 Back経路、Safe Area、gesture体感、390×844、長い実Player名は再確認までpending。追加TestFlight upload、App Store Review、外部配信、一般公開は実施していない。
- Official 048／049がOfficial 046／047を競合範囲で明確化する。実装記録：`docs/implementation/CueScore_v1.0_iPhone_UI_Back_Fix_Implementation_2026-08-27.md`。

## TestFlight Build 12 内部配信完了／実iPhone確認待ち（2026年8月26日）

- v1.0 UI／Navigation Revision commit `dbc3e97`とBuild Number設定commit `42c0d97df1342fb32e4feb67a79dafc9040c37d8`を`origin/main`へpushし、その同一sourceからArchiveした。
- 全自動テスト`232 pass / 0 fail`、Chrome `390×844` UI確認、native asset整合、Simulator Debug／Release、Signed Release Archive、App Store ValidateをPASSした。
- Xcode Organizerから`TestFlight Internal Only`としてVersion `1.0`／Build `12`をアップロード。App Store Connectアップロード日`2026年8月26日 16:27` JST。
- 輸出コンプライアンスは正式回答「上記のアルゴリズムのどれでもない」で保存。Build 12は既存内部グループ`CueScore Internal Testers`（1名）に含まれ、状態は`テスト中`。
- 実iPhone確認はpending。Safe Area、左上Back／Swipe Backの体感応答、Player／競技／相手文脈、全画面推移、対戦相手別成績・固定履歴、Player履歴／一覧、Match Detail、長い実データ名、OS picker等を未確認のままPASS扱いにしない。
- App Store Review提出、外部TestFlight、一般公開、価格／配信地域変更は実施していない。Build Number `1`〜`12`は再利用しない。
- 配布記録：`docs/implementation/CueScore_Build12_TestFlight_Distribution_2026-08-26.md`。

## v1.0 UI／Navigation Revision 実装・自動検証完了／実iPhone確認待ち（2026年8月26日）

- Product Owner採用により、Rotation／14-1／JPAの自己ベストから`1試合最高得点`を除外。競技詳細の個別指標bottom sheetを通常導線から外し、`グラフで見る`から全適用指標を縦に確認するPlayer・競技固定の全画面推移pageへ置換した。算出式とeligible判定は変更していない。
- 対戦相手別成績から4項目summary、sort、競技selectorを撤去し、相手を最新対戦順＋既存ID tie-breakで固定表示。相手固定履歴をPlayer vs Opponent、aggregate、compact月別履歴の順へ変更した。
- Player履歴から期間／詳細／分析buttonを撤去し、card／chevronのMatch Detail入口を維持。Player一覧はsortを撤去し、main、actual match latest usage、既存stable ID順のcompact一段rowへ変更した。
- 全自動テスト`232 pass / 0 fail`。Chrome `390×844`で全画面Trends、固定Opponent Records、固定履歴、横overflowなしを正規操作でPASS。native sync後、iOS Simulator Debug／Releaseとも`BUILD SUCCEEDED`。
- 実装完了時点はMarketing Version `1.0`／Build Number `11`。その後、上記の別配信GateでBuild Number `12`を設定し、Archive／Validate／TestFlight Internal OnlyまでPASSした。実iPhoneのSafe Area、Swipe Back体感、長い実データ名、OS pickerはpendingでありPASS扱いにしない。
- Official 046／047が、競合範囲でOfficial 040／041、042／043、044／045を置換する。実装記録：`docs/implementation/CueScore_v1.0_UI_Navigation_Revision_Implementation_2026-08-26.md`。

## TestFlight Build 11 内部配信完了／実iPhone確認待ち（2026年8月26日）

- Back応答改善と対戦相手別成績UIを含むBuild 11候補commit `8236d45a9430c137bc24574822927654896322f9`を`origin/main`へpushし、その同一sourceからArchiveした。
- 全自動テスト`226 pass / 0 fail / 0 skipped`、native asset整合、Simulator Debug／Release、Signed Release Archive、App Store ValidateをPASSした。
- Xcode Organizerから`TestFlight Internal Only`としてVersion `1.0`／Build `11`をアップロード。App Store Connectアップロード日`2026年8月26日 9:14` JST。
- 輸出コンプライアンスは既存正式回答「上記のアルゴリズムのどれでもない」で保存。Build 11は既存内部グループ`CueScore Internal Testers`に含まれ、状態は`テスト中`。
- 実iPhone確認はpending。左上／Swipe Backの体感応答、Player／競技／相手文脈、対戦相手別成績、固定履歴、Match Detail、390×844、長い名前、通常／サンプル等を未確認のままPASS扱いにしない。
- App Store Review提出、外部TestFlight、一般公開、価格／配信地域変更は実施していない。Build Number `1`〜`11`は再利用しない。
- 配布記録：`docs/implementation/CueScore_Build11_TestFlight_Distribution_2026-08-26.md`。

## Build 11候補：Back応答改善・対戦相手別成績UI更新（2026年8月26日）

- Build 10内部配信済みの`origin/main` commit `98653d4fc70547a3c0f900f8cb98bfa581b1962a`を基準に、Marketing Version `1.0`／次の未使用Build Number `11`を設定した。
- Back遅延の直接要因だったedge Swipe Back完了後190ms／最大280msの固定待機を廃止。tap／swipeは同じ標準Back controlを即時実行し、押下中の視覚反応を追加した。
- Player一覧、Player情報、競技詳細、競技固定履歴、Player編集等は保持済みDOMを先に復帰する。入力受付、handler開始、DOM完了、視覚利用可能をruntime内だけで段階計測でき、console／永続ログは追加していない。
- 対戦相手別成績をcompact header、`対戦相手 / 試合 / 勝敗 / 勝率`、既存sort、compact cardへ更新。W／L badge履歴を削除し、相手cardから相手・競技固定履歴、Match Detailへ進む。深いRival Analysisへは進まない。
- 欠損結果は敗戦として補完せず、判定可能試合だけを勝敗と勝率の分母にする。採点、保存schema、Backup／Restore、分析指標定義、通常／サンプル分離は変更していない。
- 全自動テスト`226 pass / 0 fail / 0 skipped`、native sync、iOS Simulator Debug／Releaseとも`BUILD SUCCEEDED`。実iPhone確認はpendingであり、体感Back応答、Swipe Back、390×844表示、長い名前等を未確認のままPASS扱いにしない。
- Official 044／045がBuild 11のNavigation、性能計測、対戦相手別成績UIを定義する。実装記録：`docs/implementation/CueScore_Build11_Back_Latency_Opponent_Records_UI_Implementation_2026-08-26.md`。Archive／Validate／TestFlight Internal Onlyは後続Gateで記録する。

## TestFlight Build 10 内部配信完了／実iPhone確認待ち（2026年8月25日）

- v1分析範囲・推移軸を確定したBuild 10候補commit `b5b786c262214e9c7c03a097fe894fa8ed82f160`を`origin/main`へpushし、その同一sourceからArchiveした。
- 全自動テスト`220 pass / 0 fail / 0 skipped`、native asset整合、Simulator Debug／Release、Signed Release Archive、App Store ValidateをPASSした。
- Xcode Organizerから`TestFlight Internal Only`としてVersion `1.0`／Build `10`をアップロード。App Store Connectへのアップロード日は`2026年8月25日 22:29` JST。
- 輸出コンプライアンスは既存正式回答「上記のアルゴリズムのどれでもない」で保存。Build 10は既存内部グループ`CueScore Internal Testers`に含まれ、状態は`テスト中`。
- 実iPhone確認はpending。通常導線、推移Y/X軸、同日試合識別、point callout、文脈復帰、写真、Swipe Back、3 Cushion、6競技、Backup／Restore、通常／サンプル等を未確認のままPASS扱いにしない。
- App Store Review提出、外部TestFlight、一般公開、価格／配信地域変更は実施していない。Build Number `1`〜`10`は再利用しない。
- 配布記録：`docs/implementation/CueScore_Build10_TestFlight_Distribution_2026-08-25.md`。

## Build 10候補：v1分析範囲・推移軸の明確化 実装完了（2026年8月25日）

- v1通常導線をPlayer情報、競技詳細、主要指標と指標別推移、自己ベスト、簡潔な対戦相手別成績、競技固定の全試合、Match Detailへ限定した。
- 競技固定の試合カードでは`分析`操作を非表示とし、対戦相手一覧から深いRival Analysisへ進むタップ導線を外した。既存のMatch Analysis／Analysis Home／旧Player Analysis／Rival Analysis実装は互換目的で保持し、削除やschema変更はしていない。
- rate推移にY軸`100% / 75% / 50% / 25% / 0%`、X軸の日付（同日複数試合は連番）、各点の正確な値と日付を表示するタップ可能なcalloutを追加。ファール率2桁、その他rate1桁と既存定義を維持した。
- Marketing Version `1.0`／次の未使用Build Number `10`。全自動テスト`220 pass / 0 fail / 0 skipped`、native source／generated／Xcode copied asset整合、Simulator Debug／Releaseとも`BUILD SUCCEEDED`、portrait起動表示をPASSした。Archive／Validate／TestFlight Internal Onlyは後続Gateで記録する。実iPhone確認はpendingで、App Store Review・外部TestFlight・一般公開は対象外。
- Official 042／043がv1分析通常導線と推移グラフ可読性を定義する。実装記録：`docs/implementation/CueScore_Build10_Analytics_Scope_Trend_Axis_Implementation_2026-08-25.md`。

## TestFlight Build 9 内部配信完了／実iPhone確認待ち（2026年8月25日）

- Build 9候補commit `5a0877e840292a976bcdd0affaef1f870c4065ea`を`origin/main`へpushし、local／remote同期とclean状態を確認した。
- 全自動テスト`216 pass / 0 fail / 0 skipped`、native asset整合、iOS Simulator Debug／Release、Signed Release Archive、App Store ValidateをすべてPASSした。
- Xcode Organizerから`TestFlight Internal Only`としてVersion `1.0`／Build `9`をアップロード。Apple処理完了後、輸出コンプライアンスは既存正式回答「上記のアルゴリズムのどれでもない」で保存した。
- Build 9は既存内部グループ`CueScore Internal Testers`に含まれ、App Store Connect上の状態は`テスト中`。Product OwnerはiPhoneのTestFlightからBuild 9へ更新可能。
- 実iPhone確認はpending。指標別推移popup、ファール率の参加rack判定と1rack1count、表示精度、写真、Navigation、3 Cushion、6競技、Backup／Restore、通常／サンプル等を未確認のままPASS扱いにしない。
- App Store Review提出、外部TestFlight、一般公開、価格／配信地域変更は実施していない。Build Number `1`〜`9`は再利用しない。
- 配布記録：`docs/implementation/CueScore_Build9_TestFlight_Distribution_2026-08-25.md`。

## Build 9候補：ファール率・指標別推移ポップアップ 実装／Simulator検証完了（2026年8月25日）

- Product Owner採用により、3 Cushionを除く5競技の`平均ファール/ラック`を`ファール率`へ置換した。`ファール率 = foul_racks / participated_completed_racks × 100`とし、完了・本人の実参加・本人ファールをrack単位で明示判定できるrecordだけをeligibleとする。
- 相手のブレイクランアウト等で本人に実手番がないrack、途中rack、境界または参加証拠のない旧・簡易recordは分母へ入れない。1rack内の複数ファールは分子1。推定せず`—`を維持し、3 Cushionには代替指標を追加しない。
- 競技詳細の独立`推移 / 指標の変化を見る`cardを削除。勝率と対応主要指標の`>`から、その指標だけのbottom-sheet推移popupを直接開く。同一Player／競技詳細を維持し、閉じると同じ文脈へ戻る。
- 勝率・シュート率・ブレイクイン率・マス割り率は小数1桁、ファール率は小数2桁。390×844で横overflowなし、直接popup、title、close後の文脈維持を目視PASSした。
- 全自動テスト`216 pass / 0 fail / 0 skipped`、native source／generated／Xcode copied asset整合、iOS Simulator Debug／Releaseとも`BUILD SUCCEEDED`。Marketing Version `1.0`／Build Number `9`。その後、上記の別配布GateでArchive／Validate／TestFlight Internal OnlyまでPASSした。実iPhone確認はpendingで、App Reviewと一般公開は実施していない。
- Official 040／041が、ファール指標と競技詳細推移UIについてOfficial 038／039を置換する。実装記録：`docs/implementation/CueScore_Build9_Foul_Rate_Metric_Trend_Popup_Implementation_2026-08-25.md`。

## TestFlight Build 8 内部配信完了／実iPhone確認待ち（2026年8月24日）

- Pattern A最終化commit `02401628ee9579eb3c8ac9b5c8244d268ed29dde`とBuild Number 8 commit `b63aca2686b05b1bc5a6489f86a2f5fedc648e4e`を`origin/main`へpushし、Archive sourceとremoteの一致を確認した。
- 全自動テスト`207 pass / 0 fail / 0 skipped`、native asset整合、iOS Simulator Debug／Release、Signed Release Archive、App Store ValidateをすべてPASSした。
- Xcode Organizerから`TestFlight Internal Only`としてVersion `1.0`／Build `8`をアップロード。Apple処理完了後、輸出コンプライアンスは正式回答「上記のアルゴリズムのどれでもない」で保存した。
- Build 8は既存内部グループ`CueScore Internal Testers`に含まれ、App Store Connect上の状態は`テスト中`。Product OwnerはiPhoneのTestFlightからBuild 8へ更新可能。
- 実iPhone確認はpending。Take Photo、写真選択復帰、Navigation／Swipe Back、3 Cushion、ブレイク後rack位置、6競技、通常／サンプル、Backup／Restore等を未確認のままPASS扱いにしない。
- App Store Review提出、外部テスター、一般公開、価格／配信地域等の公開設定変更は実施していない。Build Number `1`〜`8`は再利用しない。
- 配布記録：`docs/implementation/CueScore_Build8_TestFlight_Distribution_2026-08-24.md`。

## Build 8 Pattern A採用：Navigation最終化・配布前Gate PASS（2026年8月24日）

- Product Ownerは現行Player起点を維持するPattern AをBuild 8へ採用した。`分析`ラベル、`対戦相手別の成績`、compactな`詳細／分析`を維持し、Pattern B、独立Analysis Home、タブ、大規模再構成は採用しない。
- Navigation監査で、競技固定全試合から開いたMatch AnalysisのBackだけがPlayer情報へ飛ぶ差分を確認。Player ID、競技ID、Match ID、viewer Player IDをruntime contextで保持し、同じ競技固定全試合へ1階層で戻す最小修正を行った。
- Match Detail→競技固定全試合、Rival Analysis→対戦相手別の成績→競技詳細、競技固定全試合→競技詳細→Player情報の既存契約は維持する。左上BackとSwipe Backは同じ表示中Back controlを使用する。
- Official 036／037がPattern Aの画面構成とラベルをすでに正式化しているため、不要なOfficial文書は追加しない。提案記録は`docs/proposals/CueScore_Player_First_Analytics_Navigation_Proposal_2026-08-24.md`。
- 全自動テスト`207 pass / 0 fail / 0 skipped`、source／generated／Xcode copied indexのSHA-256一致、iOS Simulator Debug／Releaseとも`BUILD SUCCEEDED`。Marketing Version `1.0`／Build Number `8`、Bundle ID、Team、iPhone only、iOS 15.0を実効設定で確認した。その後、上記の別配布GateでArchive／Validate／TestFlight Internal OnlyまでPASSした。実iPhone未確認項目をPASS扱いにしない。

## Build 8候補 Follow-up：平均ファール/ラック実装・検証完了（2026年8月24日）

- Product Owner採用により、3 Cushionを除く5競技の主要指標を`平均ファール/ラック`へ変更した。計算はeligible recordの総ファール数 ÷ 判定可能な完了ラック総数、表示は小数第2位までとする。
- 9-Ball／10-Ballは完了`rackResults`または`rack_end`、Rotation／JPAは`rack_completed`／`rack_end`と`game_end`最終rack、14-1は明示的な再ラック境界だけを分母とする。途中rackと推定値は数えない。
- 境界証拠のない旧・簡易recordとSample Data v3.1のRotation／14-1／JPA points recordはineligibleで`—`。9-Ball／10-Ball sampleは明示的`rackResults`を利用する。Player／Match／Backup／event schemaは変更しない。
- 3 Cushionでは指標を引き続き非表示。分析Navigationは変更せず、現行Player起点を磨く案の具体化だけをImplementation Recordへ記録する。
- 自動テスト`206 pass / 0 fail / 0 skipped`、native source／generated bundle／Xcode copied asset一致、iOS Simulator Debug／Releaseとも`BUILD SUCCEEDED`。390×844 portraitでRotationの4指標1段と長い表示名、3 Cushionの2指標・該当指標非表示・横overflowなしを目視確認した。
- 正式決定：`docs/official/38_CueScore_v1.0_Build8_Average_Fouls_Per_Rack_Decision.md`。仕様：`docs/official/39_CueScore_v1.0_Build8_Average_Fouls_Per_Rack_Spec.md`。

## Build 8候補：Build 7実iPhoneレビュー修正 実装・Simulator検証完了／実iPhone再確認待ち（2026年8月23日）

- 基準`main`は`3286992b739eaf17f36671214a2433d34d95181b`。Build 7実iPhoneレビューで採用されたPlayer journey、Navigation、写真選択、3 Cushion、ブレイク後履歴位置の修正をBuild 8候補sourceへ実装した。
- Take Photoクラッシュの直接原因はiOS `Info.plist`の`NSCameraUsageDescription`欠落。必須privacy usage descriptionを追加し、既存file input、Photo Library、Choose File、画像圧縮、avatar schemaは変更していない。実iPhone撮影再確認前はPASS扱いにしない。
- 競技詳細から「最近の試合」を削除し、競技アイコン付きTitle、Rival／全試合入口を維持。競技詳細起点の全試合はPlayer／競技固定でselectorを非表示、各カード右端を「詳細」「分析」にcompact化した。
- Backは`競技固定履歴 → 同競技詳細 → Player情報`の1階層単位へ修正。edge Swipe Backは同じBack controlを使用し、指追従／完了／cancel motionを追加した。
- Player削除は閲覧画面からPlayer編集へ移動。写真確定後はavatar chooserを閉じて登録／編集previewへ直接戻す。
- 3 Cushionは`+1／交代／戻る`の1段3列。確定0は`-`、未到達／未確定は空白。Undoと競技ルールは変更していない。
- ブレイク結果close後は現在rack dividerまたは同rack最新行を対象に履歴位置を補正する。
- 当時の平均ファール分母は対象試合数だった。後続Official 038／039で`平均ファール/ラック`へ正式変更した。分析導線再設計は未実装。
- 自動テスト`202 pass / 0 fail / 0 skipped`、iOS Simulator Debug／Releaseともに`BUILD SUCCEEDED`。iPhone 17 SimulatorでPlayer情報、9-Ball詳細、固定履歴、compact操作、1階層Backを確認した。
- 実iPhoneではTake Photo、Photo Library／Choose File復帰、Swipe Back、3 Cushion、ブレイク後rack位置、6競技、Backup／Restore、通常／サンプルを再確認する。Build 8 TestFlight upload、App Review、一般公開は未実施。
- 正式決定：`docs/official/36_CueScore_v1.0_Build8_iPhone_Review_Decision.md`。仕様：`docs/official/37_CueScore_v1.0_Build8_iPhone_Review_Spec.md`。実装記録：`docs/implementation/CueScore_Build8_Candidate_iPhone_Review_Implementation_2026-08-23.md`。

## TestFlight Build 7 内部配信完了／実iPhone確認待ち（2026年8月19日）

- Build 7候補のSimulator UIレビュー修正を含むsource commit `a25c7c692637266f12abcc89e895bc64c65dce24`から、Marketing Version `1.0`／Build Number `7`を作成した。
- Native source／generated bundle／Xcode copied assetsのSHA-256一致を確認。全自動テストは`194 pass / 0 fail / 0 skipped`、iOS Simulator Debug／Releaseはいずれも`BUILD SUCCEEDED`。
- Signed Release ArchiveとApp Store ValidateをPASSし、Xcode Organizerから`TestFlight Internal Only`としてアップロードした。Apple処理完了後、輸出コンプライアンスは「上記のアルゴリズムのどれでもない」で保存した。
- Build 7は既存内部グループ`CueScore Internal Testers`に含まれ、App Store Connect上の状態は「テスト中」。Product OwnerはiPhoneのTestFlightからBuild 7へ更新可能。
- Build 7の実iPhone確認はpending。Player情報／6競技詳細、白背景上の文字、主要指標、最近の調子、自己ベスト、最近の試合、Rival／全試合入口等を未確認のままPASS扱いにしない。
- Build Number `1`〜`7`は再利用しない。次の配布Buildは`8`以上とする。
- App Store Review提出と一般公開は実施していない。価格、配信地域、App Privacy、EUトレーダーステータス、公開用スクリーンショットの最終設定も実施していない。
- 配信記録：`docs/implementation/CueScore_Build7_TestFlight_Distribution_2026-08-19.md`。

## Build 7候補：Simulator UIレビュー修正・再確認完了（2026年8月19日）

- Product Owner採用により、9-Ball／10-BallのPlayer分析用マス割り率を「正式マス割り回数 ÷ 本人がブレイクした全判定可能完了ラック数」へ修正した。通常交代、miss、ファール、break foul、break失敗を分母から除外しない。正式マス割り成功条件は変更していない。
- 完了ラックとbreak ledgerが試合record全体で一致しない場合は率全体をineligibleとし、部分recordから1/1=100%を生成しない。3/4=75%、1/2=50%、1/1=100%、0/4=0%の契約テストを追加した。
- Player Detailを、プロフィールと6競技通算一覧の「プレーヤー情報」と、Player／競技固定の「競技詳細」の2段階へ再構成した。Simulator UIレビュー後、競技詳細は競技別Navigation Title、compact Player＋通算、主要指標1段、折りたたみ推移、自己ベスト最大3件1段、最近の試合3件、Rival／全試合入口へ圧縮した。重複する「今の状態」sectionと画面内戻るlinkは廃止した。
- 白背景のPlayer名・カード本文へ濃色と`-webkit-text-fill-color`を明示し、iOS appearance継承による白抜けを防ぐ。390px portraitで4／3／2指標と3／2／1件の自己ベストを横scrollなしの1段summaryとして表示する。
- 追加修正後の全自動テストは`194 pass / 0 fail / 0 skipped`。Native source／generated bundle／Xcode copied assetのSHA-256一致、iOS Simulator Debug／Releaseの`BUILD SUCCEEDED`を確認した。
- iPhone 17 Simulator（portrait、390px前後）で、プレーヤー情報と9-Ball／10-Ball／Rotation／14-1／JPA 9-Ball／3 Cushionの7画面を再確認した。競技別Title、白背景上の文字、6競技通算、主要指標、折りたたみ推移、自己ベスト、最近の試合、Rival／全試合入口、横overflowなしをPASS。スクリーンショットは`/Users/Ludique/Documents/Codex/CueScore_Build7_UI_Review_Fixes_2026-08-19/`へ保存した。実iPhone確認は未実施であり、PASS扱いにしない。
- 正式決定：`docs/official/34_CueScore_v1.0_Build7_Masuwari_Rate_TwoLevel_Player_UI_Decision.md`。仕様：`docs/official/35_CueScore_v1.0_Build7_Masuwari_Rate_TwoLevel_Player_UI_Spec.md`。
- 実装記録：`docs/implementation/CueScore_Build7_Candidate_Masuwari_Rate_TwoLevel_Player_UI_Implementation_2026-08-19.md`。
- 候補実装完了時点ではMarketing Version `1.0`／Build Number `6`だった。その後、上記の別配信GateでBuild Number `7`を設定し、Archive／Validate／TestFlight内部配信まで完了した。実iPhone確認はpending。App Reviewと一般公開は未実施。

## Build 6 実iPhone報告：マス割り率100%問題の監査完了／仕様判断待ち（2026年8月19日）

- Product Ownerから、Build 6のPlayer Detailで最高マス割り率が実感と合わない100%となり、リンク先試合とも整合しない旨が報告された。この報告範囲だけを記録し、Build 6の他項目を新たにPASS扱いにしない。
- 正式マス割り回数関数ではなく、Player分析用率の分母が通常の`player_switch`を含むラックを除外することが直接原因。監査fixtureで、4ブレイク3マス割りが3/3=100%、2ブレイク1マス割りが1/1=100%、4ブレイク0マス割りが分母0の`—`になることを再現した。
- 詳細eventが完全なrecordでも発生する構造問題。簡易・旧recordは`break_result`不足、サンプルデータは現行common event ledger不足という別の互換性制約も確認した。
- 指定された「石塚 貴章／9-Ball／2026-08-18」の生record JSONはrepositoryおよび提供ファイル内になく、個別rack、実分子・実分母は推測せず未確認とした。
- 推奨案は、record全体の判定材料が完全な場合だけ、正式マス割り回数を「本人がブレイクした全判定可能完了ラック数」で割る方式。現行Official Spec 029/031の分母記載変更を伴うため、Product Owner承認前に実装・Official仕様は変更しない。
- Build Number `7`設定、Archive、Validate、TestFlight upload、App Review提出、一般公開は実施していない。
- 監査記録：`docs/implementation/CueScore_Masuwari_Rate_Deep_Audit_2026-08-19.md`。

## TestFlight Build 6 内部配信完了／実iPhone確認待ち（2026年8月19日）

- Player Detail／Player Analysis統合を含むsource commit `7e54b8ce31aa2dde73568a1b08cdddb73a96fb20`から、Marketing Version `1.0`／Build Number `6`を作成した。
- Native source／generated bundle／Xcode copied assetsのSHA-256一致を確認。全自動テストは`186 pass / 0 fail / 0 skipped`、iOS Simulator Debug／Releaseはいずれも`BUILD SUCCEEDED`。
- Signed Release ArchiveとApp Store ValidateをPASSし、Xcode OrganizerからTestFlight Internal Onlyとしてアップロードした。Apple処理完了後、輸出コンプライアンスは「上記のアルゴリズムのどれでもない」で保存した。
- Build 6は既存内部グループ`CueScore Internal Testers`に含まれ、App Store Connect上の状態は「テスト中」。Product OwnerはiPhoneのTestFlightからBuild 6へ更新可能。
- Build 6の実iPhone確認はpending。統合Player Detail、競技切替、自己ベスト／最近の試合からのMatch Detail遷移、Rival／試合一覧入口、長いPlayer名、欠損表示、通常／サンプル切替等を未確認のままPASS扱いにしない。
- Build Number `1`〜`6`は再利用しない。次の配布Buildは`7`以上とする。
- App Store Review提出と一般公開は実施していない。価格、配信地域、App Privacy、EUトレーダーステータス、公開用スクリーンショットの最終設定も実施していない。
- 配信記録：`docs/implementation/CueScore_Build6_TestFlight_Distribution_2026-08-19.md`。

## Build 6候補：Player Detail／Player Analysis統合（2026年8月19日）

- Product Owner承認に基づき、Player DetailとPlayer AnalysisをPlayer固定の単一Player Detailへ統合した。通常導線の独立「プレーヤー分析を見る」は廃止し、プロフィール、通算、競技selector、今の状態、主要指標、最近の調子、折りたたみ式推移、自己ベスト、最近の試合、Rival／試合一覧入口を同一画面に配置した。
- Build 4/5の正式derived metricsとeligible判定を再利用し、欠損を0または推定値で補完しない。自己ベストと最近の試合はMatch Detailへ遷移し、試合一覧から既存Player目線Match Analysisへ進める。
- Player編集、Main Player、avatar、History、Rival Analysis、Single Match Analysis、通常／サンプルデータ、既存schema、Backup／Restore、Undo、競技ルールは維持する。
- 本項目のsource実装は上記の別配信GateでBuild Number `6`を設定し、Archive／Validate／TestFlight内部配信まで完了した。実iPhone確認はpending。App Reviewと一般公開は未実施。
- 実装記録：`docs/implementation/CueScore_Build6_Candidate_Integrated_Player_Detail_Implementation_2026-08-19.md`。

## TestFlight Build 5 内部配信完了／実iPhone確認待ち（2026年8月19日）

- Player起点の分析導線、compact化した分析UI、率自己ベストのeligible判定強化を含むsource commit `f7f7f97bb705619fbebad98f99d4c57643ebe7a4`から、Marketing Version `1.0`／Build Number `5`を作成した。
- Native source／generated bundle／Xcode copied assetsのSHA-256一致を確認。全自動テストは`180 pass / 0 fail / 0 skipped`、iOS Simulator Debug／Releaseはいずれも`BUILD SUCCEEDED`。
- Signed Release ArchiveとApp Store ValidateをPASSし、Xcode OrganizerからTestFlight Internal Onlyとしてアップロードした。Apple処理完了後、輸出コンプライアンスは「上記のアルゴリズムのどれでもない」で保存した。
- 既存内部グループ`CueScore Internal Testers`へBuild 5を追加済み。App Store Connect上の状態は「テスト中」で、Product OwnerはiPhoneのTestFlightからBuild 5へ更新可能。
- Build 5の実iPhone確認はpending。Build 5対象の分析導線、UI、自己ベストリンク等を未確認のままPASS扱いにしない。
- Build Number `1`〜`5`は再利用しない。次の配布Buildは`6`以上とする。
- App Store Review提出と一般公開は実施していない。価格、配信地域、App Privacy、EUトレーダーステータス、公開用スクリーンショットの最終設定も実施していない。
- 配信記録：`docs/implementation/CueScore_Build5_TestFlight_Distribution_2026-08-19.md`。

## Build 5候補：Player起点分析・UI整理・率自己ベスト安全化（2026年8月18日）

- Product OwnerのBuild 4実iPhone確認で、Player分析トップの第一印象「見づらい」と、最高マス割り率100%のリンク先試合不整合が報告された。この2点だけをBuild 4実機確認の事実として記録し、他の分析項目はPASS扱いにしない。
- Homeの独立「分析」入口を廃止し、Player Detailの「プレーヤー分析を見る」と「このプレーヤーの試合履歴」から分析へ進むPlayer起点導線へ変更した。試合一覧の各recordからMatch DetailまたはPlayer目線のMatch Analysisへ進める。viewer Playerはruntime contextで渡し、schemaには保存しない。
- Player selectorを外し、競技selectorを維持。header／状態／主要指標／chartをcompact化し、推移selectorをselectへ変更、自己ベストは先頭2件を視覚的に優先した。Rival AnalysisとSingle Match Analysis本体は維持する。
- 100%問題の構造原因は、正式マス割り数がrecord全体の分子である一方、分母が詳細eventの残る一部rackだけになり得たこと。全完了rackに一意で判定可能なbreak eventが対応しない部分欠損recordを率自己ベストから除外し、分子が分母を超えるrecordも除外する。
- 最高ブレイクイン率もsingle record内の対象break eventが一部だけ詳細化されたrecordを除外する。最高シュート率と最高アベレージは正式分母が確認できるrecordだけを継続利用する。minimum denominatorは未決定で追加していない。
- Native source／generated bundle／Xcode copied assetsのSHA-256一致を確認。全自動テストは`180 pass / 0 fail / 0 skipped`、iOS Simulator Debug／Releaseはいずれも`BUILD SUCCEEDED`。
- 候補実装完了時点ではBuild Number `4`のままだった。その後、上記の別配信GateでBuild Number `5`を設定し、Archive／Validate／TestFlight内部配信まで完了した。App Reviewと一般公開は未実施。
- 正式決定：`docs/official/30_CueScore_v1.0_Build5_Player_Origin_Analytics_Decision.md`。仕様：`docs/official/31_CueScore_v1.0_Build5_Player_Origin_Analytics_Spec.md`。
- 実装・検証記録：`docs/implementation/CueScore_Build5_Candidate_Analytics_Navigation_UI_Masuwari_Fix_2026-08-19.md`。

## TestFlight Build 4 内部配信完了／実iPhone確認待ち（2026年8月18日）

- Product Owner採用の順序「今の状態 → 主要指標 → 推移 → 今回のポイント → 自己ベスト → 詳細分析入口」でPlayer分析トップを再構成した。既存Rival Analysis／Single Match Analysisは削除せず入口を維持した。
- 9-Ball／10-Ball／Rotation／JPA 9-Ballのブレイクイン率は、判定材料の揃う`break_result`だけからderived metricとして算出する。event不足を0として混ぜず、複数球入球も1成功とする。
- 9-Ball／10-BallのPlayer分析用マス割り率は、正式共通判定`rackGameMasuwariCountsV1(record)`を分子にし、本人break・完了・非交代を確認できるeligible rackだけを分母にする。Player Detail等の既存定義は置換していない。
- 平均ファールは既存の「総ファール数 ÷ 対象試合数」を維持。ファール手番率、3Cファール率、Best Game／Rating、旧record推定補完はLaterのまま。
- eligible recordだけを使う競技別自己ベストとMatch Detailリンクを追加した。同率は指標値、記録日時の新しい順、Match ID辞書順で安定選択し、0／欠損を候補にしない。
- 欠損数値は`—`、空状態は「データなし」、比較不成立は「比較できません」とした。Player／Match／Backup／event schema、保存key、Undo、競技ルールは変更していない。
- 全自動テスト175件成功／失敗0。source／generated／Xcode-copied native asset一致、iOS Simulator Debug／Release buildをPASSした。
- Marketing Version `1.0`／Build Number `4`をsource commit `257f707022afe0f4b9b3f119b28e2532259dcb49`から作成した。全自動テスト175件成功／失敗0、source／generated／Xcode-copied native assetのSHA-256は`4fb3e4d935f085485305c530b129b7f7052d940b4493788ff7dcabaaf8a3fbc1`で一致し、iOS Simulator Debug／ReleaseをPASSした。
- Signed Release Archive、App Store Validate、TestFlight upload、Apple処理をPASS。輸出コンプライアンスは「上記のアルゴリズムのどれでもない」で保存し、既存内部グループ`CueScore Internal Testers`へBuild 4を追加した。App Store Connect上の状態は「テスト中」で、Product OwnerはTestFlightから更新可能。
- Build 4の実iPhone確認はpending。分析トップ、競技別指標、自己ベスト、Match Detailリンク、欠損表示、既存詳細分析等を未確認のままPASS扱いにしない。
- Build Number `1`〜`4`は再利用しない。次の配布Buildは`5`以上とする。
- App Store Review提出と一般公開は未承認であり、実施していない。
- 正式決定：`docs/official/28_CueScore_v1.0_Build4_Player_Analytics_Renewal_Decision.md`。仕様：`docs/official/29_CueScore_v1.0_Build4_Player_Analytics_Renewal_Spec.md`。
- 実装記録：`docs/implementation/CueScore_Build4_Candidate_Player_Analytics_Renewal_Implementation_2026-08-18.md`。
- 配信記録：`docs/implementation/CueScore_Build4_TestFlight_Distribution_2026-08-18.md`。

## TestFlight Build 3 実iPhone UI確認／分析指標データ監査（2026年8月18日）

- Product OwnerがTestFlight Build 3を実iPhoneで確認し、Rotation、9-Ball、10-Ball、14-1、JPA 9-Ballの通常ファール／セーフティ後の手動交代と、JPA 9-Ball「デッド」の一番左配置をPASSと報告した。
- 3CはDecision 026／Spec 027および実装上、今回の変更対象外。これはscope確認であり、Build 3での3C完走PASSを意味しない。
- Backup、Offline、全6競技完全完走、全Analytics等は今回の報告から新たにPASS扱いにしていない。
- Build 4候補の分析指標を監査した。現行詳細recordではブレイクイン率、本人breakラックを分母とするマス割り率、3C以外のファール手番率を算出できるが、event不足の旧recordへ一律適用できないため総合判定は△。3Cファール率は×。
- 最大ハイランと1試合最高得点／最多得点は保存値から正確に取得可能。分母を必要とする自己ベストはeligible record限定の条件付き候補とし、不足値を0で補完しない。
- 欠損数値は`—`、空状態は「データなし」、比較不成立は「比較できません」を推奨。分析実装、schema変更、Build 4作成、TestFlight upload、App Review、一般公開は実施していない。
- 詳細記録：`docs/implementation/CueScore_Build3_Physical_iPhone_Analytics_Data_Audit_2026-08-18.md`。

## TestFlight Build 3 内部配信完了（2026年8月18日）

- Post-Build 2の交代操作UI統一を含むsource commit `d3aa729ff68533d4edf82fd8865df08b5894161a`（`build: set TestFlight build number 3`）から、Marketing Version `1.0`／Build `3`を作成した。
- 全自動テスト153件成功／失敗0。source／generated／Xcode-copied native assetのSHA-256は`23ae38c0a98413a7c8ef273a0af7dc888f92d9048a376bc59c14ed987b94bae9`で一致し、iOS Simulator Debug／Release buildをPASSした。
- Signed Release Archive、App Store Validate、TestFlight upload、Apple処理をPASS。アップロードは2026年8月18日13:01 JSTに完了した。
- 輸出コンプライアンスは「上記のアルゴリズムのどれでもない」で保存済み。既存内部グループ`CueScore Internal Testers`へ追加し、App Store Connect上のBuild 3は「テスト中」。
- Build 3のTestFlight実iPhone確認では、今回の交代操作UI変更とJPA「デッド」配置をPASS。Backup、Offline、全6競技完全完走、全Analytics等は今回未確認のためPASS扱いにしない。
- Build Number `1`、`2`、`3`は再利用しない。次の配布Buildは`4`以上とする。
- App Store本審査提出と一般公開は未承認であり、実施していない。
- 詳細記録：`docs/implementation/CueScore_Build3_TestFlight_Distribution_2026-08-18.md`。

## Post-Build 2：交代操作UI統一（2026年8月18日）

- Product Owner採用により、Rotation、9-Ball、10-Ball、14-1、JPA 9-Ballの通常ファール／セーフティ後を、既存Rotation方式の手動交代待ちへ統一した。入力したPlayerを保持し、自動交代せず、「交代」まで通常ゲーム入力をロックする。
- 既存のRotation用交代待ちstate、snapshot／restore、Undo経路を共通利用する。14-1の3ファール成立時の減点・再ラック・次ブレーカー処理は既存競技処理を維持し、3Cは変更していない。
- JPA 9-Ballの「デッド」を表示操作列の一番左へ移した。Dead機能、得点、イベント記録は変更していない。
- 保存／Player／Match／Backup schema、Undo上限、競技ルール、得点、勝敗、Analytics定義は変更していない。
- ソース実装と自動検証は完了。全自動テスト153件成功／失敗0、native asset 3系統一致、iOS Simulator Debug／Release buildをPASS。実iPhoneでの本UI変更確認は未実施。
- TestFlight Build 2は本変更前の版で本変更を含まない。本変更を含むBuild 3はアップロード・内部配信済みで、Product Ownerによる対象UIの実iPhone確認をPASS。Build Number 1／2／3は再利用しない。
- 正式決定：`docs/official/26_CueScore_v1.0_PostBuild2_ManualTurnChange_UI_Unification_Decision.md`。後継仕様：`docs/official/27_CueScore_v1.0_PostBuild2_ManualTurnChange_UI_Unification_Spec.md`。
- 実装記録：`docs/implementation/CueScore_PostBuild2_UI_Unification_Implementation_2026-08-18.md`。

## Step 7B：Native iOS／TestFlight Build 2 内部配信完了（2026年8月17日）

- Native iOS foundation：GO。現行Web assetsと保存schemaを維持するCapacitor 8.0.2薄型iOSコンテナ方式をProduct Ownerが採用し、Xcode projectとnative bridgeを実装済み。
- App identity：Bundle ID `com.takaakimailboxstar.cuescoreapps`、Apple Team `U26DF88PRW`、Marketing Version `1.0`。Build 1の実機確認とBuild 2の内部配信を完了。iOS 15以上、iPhone専用、portrait専用、Automatic Signing。
- Native Backup書き出し、Backup復元、オフライン起動、Player写真、ローカルデータ保持を実iPhoneで確認し、すべてPASS。
- 自動テスト146件成功／失敗0。Debug／Release simulator build、Release Archive、App Store向けValidateをPASS。
- Apple Developer Individual登録、Explicit App ID登録、App Store Connectアプリレコード登録を完了。App Store Connect App IDは`6802027038`、SKUは`cuescore-apps-ios-v1`。
- TestFlight Version 1.0 Build 1のアップロード、Apple処理、輸出コンプライアンス回答、内部グループ配信、実iPhoneインストールを完了。
- TestFlight Build 1スモークテストで、既存Player、写真、試合履歴、オフライン起動、Backup書き出しを再確認し、すべてPASS。TestFlight Build 1：GO / PASS、内部運用：GO。
- TestFlight Version 1.0 Build 2は、修正済みソースcommit `b54649f`から作成した。自動テスト152件成功／失敗0、Release Archive、App Store Validate、アップロード、Apple処理、輸出コンプライアンス回答をPASSした。
- Build 2は既存内部グループ`CueScore Internal Testers`へ配信済みで、App Store Connect上の状態は「テスト中」。Product OwnerはTestFlightから更新し、Main Player保持を実iPhoneで確認してPASS。その他のBuild 2スモーク項目は本記録では未確認。
- 次の配布BuildではBuild Number `1`、`2`、`3`を再利用せず、`4`以上を使用する。
- App Store本審査提出と一般公開は未承認であり、実施していない。Product Ownerの別途明示承認を必須とする。
- 詳細記録：`docs/implementation/CueScore_v1.0_Step7B_Native_iOS_Foundation_2026-08-15.md`、`docs/implementation/CueScore_v1.0_Step7B_Native_iOS_Progress_2026-08-16.md`、`docs/implementation/CueScore_v1.0_TestFlight_Readiness_2026-08-16.md`。

## TestFlight Build 1 追加実戦テスト／Build 2修正候補（2026年8月17日）

- 上記の初回スモークテストPASS後、追加の9-Ball実戦テストで、Main Player消失、試合終了時の端末保存エラー、保持用Game Result表示、マス割0表示の4件が報告された。
- Main Player消失は、新規Playerを非Mainで保存した際に既存Playerを含む全員から`isPrimary`を削除する処理を確認し、Player schemaを変えず対象Playerだけを解除するよう修正した。
- 試合保存は、完了recordと置換対象の中断試合snapshotを一時的に同時保持するためWebKit quota境界で失敗し得る経路を確認した。完了時は中断snapshotを先に解放してrecordを照合保存し、失敗時だけsnapshotを復元する最小修正を行った。保存失敗時に結果画面を保持する既存安全動作は維持する。
- 保存に失敗すると保存済みrecord用の共通rendererへ進めず、保持用結果モーダルが表示されるため、報告されたGame Result差異は保存失敗経路と整合する。Build 1のソース、`native-web`、Xcode同梱`public`は調査時点で同一だったが、アップロード済みArchive本体は残っておらず再抽出確認はできていない。
- マス割はOfficial Decision 022／Spec 023を維持する。提供画像の可視履歴だけでは、ブレーカーが相手へ手番を渡さず1〜9番をすべてなくしたRackを確認できないため、今回の実Matchを正式な1回とは確定していない。保存recordの生JSONは未取得であり、判定実装は変更していない。
- 修正後は自動テスト152件成功／失敗0。native assetを再生成・Xcodeへcopyし、source／generated／copied assetの一致を確認した。Build 2はRelease Archive、App Store Validate、アップロード、内部配信までPASS。実iPhone確認は未実施で、Build Number 1／2は再利用しない。
- 調査記録：`docs/implementation/CueScore_TestFlight_Build1_4Issues_Investigation_2026-08-17.md`。

## FA-IPHONE-003：Resolved / iPhone PASS / Cleanup Complete（2026年8月15日）

- Product Ownerが実iPhone Home Screen PWAで、中断カードの両Player名が起動直後から表示されることを確認した。FA-IPHONE-003は`Resolved / iPhone PASS`。
- 正式修正は、Player関連UIの同期初期化、iOS paint invalidation安全化、Player内部の`24px minmax(0,1fr)`確定grid track、名前spanの`width:0`廃止、`overflow:visible`、`text-overflow:clip`、`-webkit-text-fill-color:currentColor`で構成する。
- Compact Cardの64px高、34px競技アイコン、24px avatar、compact matchup、dividerなし、`vs`、右端`再開 ›`、カード全体タップを維持した。
- 一時診断Settings UI、専用localStorage参照、診断パネル／ログ、query分岐、診断manifest、診断Launcher、Service Worker診断cache、診断専用テストを削除した。診断文字列はユーザー向けUI・実行コード・通常manifest・Service Workerに残していない。
- Cleanup後の正式回帰テストは140件成功／失敗0／スキップ0。390px縦画面、正式Settings、通常manifest、Player名、Compact Card、横overflowなし、Service Workerオフライン再起動を再確認した。
- Player／Match／in-progress schema、50 Undo、Backup JSON、History、Analytics、Main Player、通常／サンプル分離、競技ルールは変更していない。Gate 1〜14はPASS、SeverityはBlocker 0／Critical 0／Major 0／Minor 0／Cosmetic 0。
- PWA Final Acceptanceを再確認した。Product Ownerによる通常版iPhone最終確認後の推奨次工程は`Step 7 — Native iOS Preparation / Xcode Wrapper & Submission Build Planning`。ネイティブ化、TestFlight、App Store提出、Release確定は未実施。

## v1.0 Final RC Step 6：ネイティブ化前Final Acceptance（2026年8月13日）

- 基準main `554e137463279fb5041295a5840bbc5c331d6ddf`でGate 1〜14を再監査し、自動テスト117件成功／失敗0／スキップ0を確認した。
- 390px幅ブラウザでHome、New Match、Settings、9-Ballの開始・進行・完了・Result・完了後Undo・再進行・保存・History・再読込・Analytics、Legal / Supportを確認した。Service Worker取得後にローカルサーバーを停止し、Home、10-Ball試合設定、History、Supportがキャッシュから表示できることも確認した。
- 初回監査では、Settingsのサンプルデータカードに内部名称`Official Demo Data`が利用者向けテキストとして表示される名称不一致をMinor 1件として記録した。Product Ownerは受容せず、独立した軽微修正Stepでカード見出し・確認文・完了通知・データ削除説明を「サンプルデータ」へ統一した。内部識別子、保存領域名、変数名、技術資料上の内部名称は変更していない。
- 軽微修正後の再検証ではBlocker 0、Critical 0、Major 0、Minor 0、Cosmetic 0、自動テスト117件成功／失敗0／スキップ0。Step 6への回帰は確認されず、Product Owner承認により`PWA Final Acceptance: PASS`と確定した。PWA側Acceptanceとしてネイティブ化へ進行可能だが、Release確定、App Store提出、ネイティブ化自体は開始していない。
- Home Screen PWA、iOS Safari固有挙動、safe-area、写真選択、Backupファイル保存／選択、mailto、実機オフライン起動、長時間試合、画面回転抑止、実機6競技完走はProduct Owner実機確認待ち。
- 詳細記録：`docs/implementation/CueScore_v1.0_Final_RC_Step6_Final_Acceptance_2026-08-13.md`。

## v1.0 Final RC：9-Ball / 10-Ball マス割判定修正（2026年8月13日）

- マス割を「ブレーカーが相手へ一度も手番を渡さず、ファールせず、ブレイク入球を含む全対象球をテーブル上からなくしてラックに勝利した場合のみ1回」と正式確定した。
- 9-Ballは1〜9番、10-Ballは1〜10番を対象とし、スポットイベントを反映したラック終了時のテーブル状態で判定する。
- 9番／10番の早期入球によるラック勝利は維持するが、他球が残る場合はマス割に数えない。
- Game Result、Match Detail、Player Detail、Player Analytics、Match Analyticsを共通関数 `rackGameMasuwariCountsV1(record)` へ統一した。
- 球番号単位の履歴が不足する過去recordは、旧 `breakRunOut`／`break_run_out`フラグだけから推測せず0回とする。
- 保存schema、localStorage、Backup／Restore、既存record、ラック勝敗、Race、Undo、保存タイミング、スコア推移、Player情報は変更していない。
- Formal Decision 022、後継仕様023、Official Design Decision Log v1.8 Decision 024を正本とする。

## v1.0 Final RC：6競技 Race to表示統一（2026年8月13日）

- Game Result／Match Detailの試合条件表示を、6競技すべて `Race to X-Y` へ統一した。XはPlayer 1、YはPlayer 2の既存goalを使用する。
- 9-Ball／10-Ballの「最終ラック数」、Rotation／14.1の「目標点」、JPAの「Race／先取点」、3Cの「持ち点」とスラッシュ区切りを、両画面の条件行から廃止した。
- 共通renderer `openMatchDetailV1`で同じ表示を生成する。共通目標しかない旧データは同値を左右へ表示する。
- 競技ルール、勝敗判定、内部goal、JPA SL・マッチポイント、3C持ち点、Metrics、保存schemaは変更していない。
- 正式決定：`docs/official/20_CueScore_v1.0FinalRC_6Disciplines_RaceTo_Display_Decision.md`。後継仕様：`docs/official/21_CueScore_v1.0FinalRC_6Disciplines_RaceTo_Display_Spec.md`。

## v1.0 Final RC：JPA 9-Ball Result / Detail Metrics整理（2026年8月13日）

- JPA 9-Ballの上部にPlayer名、Avatar、SL、Race／先取点、最終取得点、マッチポイントを集約した。
- 下部は「イニング／セーフティ／アベレージ／ハイラン／ファール」の5行をこの順で表示する1枚のMetricsカードとした。
- 下部からSL、Race／先取点、最終取得点、マッチポイントの重複表示と、「試合結果情報」「分析情報」の見出し分離を廃止した。
- Decision 021の共通renderer、Game Result／Match Detailの下部差分、JPAスコア推移、マッチポイント計算、保存互換性は維持する。他5競技は変更しない。
- 正式決定：`docs/official/18_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Decision.md`。後継仕様：`docs/official/19_CueScore_v1.0FinalRC_JPA9_Result_Detail_Metrics_Refinement_Spec.md`。

## v1.0 Final RC：Game Result / Match Detail共通レイアウト（2026年8月13日）

- Game ResultとMatch Detailは`openMatchDetailV1`を共通rendererとして使用し、日時・種目、Player／Avatar／最終スコア、競技条件、Metrics、スコア推移まで同じ情報構造・順序・デザインとした。
- Game Resultはゲーム履歴と削除UIを生成せず、最下部に「試合へ戻る」「ホームへ戻る」「もう一度対戦する」を表示する。Match Detailはゲーム履歴、削除UI、削除説明文を維持する。
- 両画面のMetricsは、9-Ball／10-Ball＝シュート率・マス割・ファール、Rotation＝シュート率・ハイラン・ファール、JPA／14.1＝アベレージ・ハイラン・ファール、3C＝イニング・ハイラン・アベレージとした。
- Decision 020は履歴として維持し、後続Decision 021が画面責務と3C Metricsを上書きする。
- 保存schema、localStorage、Backup／Restore、過去データ、Undo、保存取消、スコア推移生成、JPAマッチポイント、10-Ballマス割判定は変更していない。
- 正式決定：`docs/official/16_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Decision.md`。後継仕様：`docs/official/17_CueScore_v1.0FinalRC_GameResult_MatchDetail_CommonLayout_Spec.md`。

## v1.0 Final RC：Game Result / Match Detail 6競技正式仕様（2026年8月13日）

- Game Resultの主要2指標を、9-Ball／10-Ball＝シュート率・マス割、Rotation＝シュート率・ハイラン、JPA 9-Ball＝イニング・セーフティ、14.1／3C＝アベレージ・ハイランへ統一した。
- Match Detailは、9-Ball／10-Ball＝シュート率・マス割・ファール、Rotation＝シュート率・ハイラン・ファール、JPA 9-Ball／14.1＝アベレージ・ハイラン・ファール、3C＝アベレージ・ハイランとした。3Cにはファール項目を表示しない。
- JPA Match Detailは、SL、Race／先取点、最終取得点、マッチポイント、イニング、セーフティの試合結果情報と、アベレージ、ハイラン、ファールの分析情報を区別して表示する。
- 9-Ball／10-Ballの共通ラベルを「シュート率」「マス割」「ファール」へ統一した。10-Ballの10番マス割判定は変更していない。
- 保存schema、localStorage、Backup／Restore、過去データ、Undo、結果保存取消、JPAマッチポイント、スコア推移生成は変更していない。
- 正式決定：`docs/official/14_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Decision.md`。後継仕様：`docs/official/15_CueScore_v1.0FinalRC_GameResult_MatchDetail_6Disciplines_Spec.md`。

## v1.0 Final RC：Player1／Player2正式Selection UI統一（2026年8月12日）

- New MatchのPlayer1／Player2選択画面も、管理画面と同じ白基調の正式Player Library外装、正式avatar、検索、追加、Back UIへ統一した。
- 選択画面は行タップで選択し、メインプレーヤー最上位、現在選択中、相手側で選択済みのdisabled、プロフィールメモ、最終使用を表示する。管理用の成績／編集操作は表示しない。
- 6競技は同じPlayer1／Player2選択入口を使用し、旧緑色Player選択UIは現行New Match導線から使用しない。
- 選択ロジック、プレーヤーデータ、保存形式、試合メモ／タグのv1.0非採用状態は変更していない。Official Releaseも変更していない。

## v1.0 Final RC：正式Player Library回帰復旧（2026年8月12日）

- Code Cleanup Phase 1で未参照Legacy関数を削除した際、直後の正式Player Library renderer overrideまで誤って削除され、旧Player1／Player2選択UIが露出する回帰が発生した。
- 正常比較元 `68886dc4bb7180f68477b5aa1079301552532246` から、白基調の正式Player Library描画、検索、並び替え、avatar、メインプレーヤー優先、現在選択中、最終使用、Player Detail／編集／新規追加の導線を復旧した。
- 試合メモ／タグのUI・生成・検索・絞り込み・編集は復活させず、Phase 1 Finalの非採用状態を維持する。
- Phase 2の未使用コード削除はiPhone実機で本修正を確認するまで開始しない。
- Official Releaseは変更していない。

## v1.0 Final RC：試合メモ／タグ非採用・コード整理 Phase 1（2026年8月12日）

- Product Owner決定により、試合メモ／タグはv1.0非採用とし、新規入力・生成・検索・絞り込みUIおよび専用ロジックを削除した。
- 既存record内の `memo`、`matchMemo`、`tags`、`reflection`、`playerReflections` は保存データ互換のため削除・変換しない。旧試合メモ／タグはBackup／RestoreとCSV出力で保持するが、v1.0 UIでは表示・入力・編集・検索・絞り込みを行わない。
- プレーヤープロフィールのメモと、Decision 013で採用済みのプレーヤー別振り返りは別機能として維持する。
- 将来の試合メモ／タグ再検討はLaterとし、v1.0では新しい保存項目やデータ移行を追加しない。
- Official Releaseは変更していない。

## App Store v1.0 RC：Settings法務導線（2026年8月10日）

- Settingsの「利用規約」は同一タブで `terms.html`、「プライバシーポリシー」は同一タブで `privacy.html` を開く。遷移前の一時フラグにより、ブラウザ／PWAの標準「戻る」でSettingsへ復帰できる。
- 公開先は既存のGitHub Pages URLを使用し、Step 4で正式公開URLとして確定した。新しいURLや本文は作成していない。
- Terms／PrivacyのHTML、Official Markdown、表示スクリプト、スタイルはService WorkerのApp Shell対象で、取得済み環境ではオフライン表示できる。
- ライセンス画面、ライセンス文書、OSSライセンス一覧、正式表示URLは現行リポジトリおよび公式文書に存在しない。推測で作成せず、正式資料が確定するまで無効状態を維持する。
- 法務ページ遷移時のService Workerは遷移先URLへレスポンスを保存し、Home用 `index.html` キャッシュを上書きしない。
- 既存正式URL記録：`docs/official/app-store-v1.0/submission/CueScore_App_Store_Public_URLs_v1.0_RC.md`。

## App Store v1.0 RC：JPA 9-Ball マッチポイント20点配分（2026年8月10日）

- ユーザー提供のJPA公式スコアシート `p_scoresheet.pdf` 1ページ上部「敗者獲得点数」表を全SL・全セル目視照合し、SL1〜9の20-0〜12-8配分を実装。
- JPA 9-BallのGame ResultとMatch Detailで、既存の最終取得点直下に「マッチポイント」を表示する。取得点の重複表示は行わない。
- 敗者SLと敗者最終取得点から共通の純粋関数で算出し、画面上のPlayer 1 / Player 2順を維持する。合計は常に20ポイント。
- 同点・未完了・SL欠損・範囲外は推測せず「—」。その他5競技には表示しない。
- 両者のSL・取得点・勝者は既存保存データにあるため、新規保存項目や移行は不要。必要情報を持つ既存履歴とサンプルデータも表示時に再計算する。
- サンプルデータ生成時のJPA SLは先取点から公式対応表で決定し、SLと先取点の整合を保証する。
- 正式決定記録：`docs/official/11_CueScore_v1.0RC_JPA9_MatchPoint_Decision.md`。

Updated: 2026-08-23
Status: Living operational reference

## Step 7B Native iOS Foundation（2026年8月15日）

- `codex/cuescore-step7b-native-ios-foundation` でCapacitor 8.0.2の薄型native containerを生成した。
- Bundle IDは `com.takaakimailboxstar.cuescoreapps`、Apple Teamは `U26DF88PRW`。iOS 15以上、iPhone専用、portrait専用、version 1.0 build 1。
- native assetsは再現可能なcopy工程で `native-web` に生成し、remote `server.url` は使用しない。PWAのService Workerは維持し、Capacitor native runtimeだけ登録を抑止する。
- Web／foundation回帰を拡張し、自動テスト146件PASS／失敗0。Xcode 26.6、iPhone 17 Simulator（iOS 26.5）でDebug／Release build、install、Home cold launchを確認した。
- 1024px正式App Icon（alphaなし）、launch screen、Capacitor／Cordova Privacy ManifestのArchive内同梱を確認した。
- 実iPhoneでBackup書き出し、Backup復元、Player写真、offline、データ保持をPASS。Release Archive、App Store Validate、TestFlight Build 1実機スモークテストもPASS。

## Purpose and Authority

ChatGPTとCodexで共有する現在状態の参照ファイル。Official Releaseを置き換えず、最新の実装状態、採用判断、延期項目を記録する。

1. `docs/official/` のOfficial Releaseが正式仕様。
2. Official Design Decision Logの最新適用判断を優先。
3. 本ファイルは運用上の現在状態であり、正式仕様を新規作成しない。
4. 正式資料と矛盾した場合は推測せずProduct Ownerへ確認する。

## App Store v1.0 RC：Game Result競技別統計2指標（2026年8月10日）

- Product Owner採用済み仕様として、Game Resultのプレーヤーカード下部2指標を競技別に切り替える。
- 9 Ball・10 Ball：シュート率／マス割。マス割は既存のブレイクランアウト成立回数を使用。
- Rotation：ハイラン／シュート率。
- JPA 9 Ball：アベレージ（総得点 ÷ 自分の総イニング数。0点で終了したイニングを含む）／ハイラン。
- Straight Pool（14.1）：アベレージ（総得点 ÷ イニング数）／ハイラン。
- Three Cushion（3C）：アベレージ（総得点 ÷ イニング数）／ハイラン。
- レイアウト、カード寸法、色、余白は変更せず、表示ラベルと計算式のみ切り替える。
- 試合終了時は結果を先に保存してGame Resultを表示する。Game Resultから「試合へ戻る」場合のみ、その保存済み結果を取り消して試合進行の再編集へ戻す。
- Undo反映後のイベントログから完了手番を再計算し、既存データ形式を変更しない。
- 本決定はGame Result表示に対する仕様であり、プレーヤー詳細のJPA 9 Ball「平均イニング」未確定事項は変更しない。
- 正式仕様：`docs/official/08_CueScore_v1.0RC_GameResult_Statistics_Spec.docx`。

## App Store v1.0 Final RC：Game Result Modal復元・スコア推移修正（2026年8月11日）

- Game ResultはBottom Sheetではなく中央Result Modalを使用する。左右16pt相当、最大幅560pt、角丸28pt、Fade＋Scale、背面操作不可とし、Bottom Sheet用Grabberと下端固定構造は使用しない。2026年8月11日のProduct Owner決定により、Game Resultに限り右上Closeを廃止した。
- Game ResultとMatch Detailは同じUndo対応の得点推移生成関数を使用し、保存形式や新規保存項目は変更しない。
- 9 Ball／10 BallはラックをX軸、累積ラック勝利数をY軸とし、`rackResults`、競技別`rackResults`、旧履歴の`rack_end`の順に使用する。入球イベントはラック得点にしない。
- Rotation／JPA 9 Ball／Straight Pool（14.1）／Three Cushion（3C）はイニングをX軸、累積得点をY軸とする。JPAは有効得点、14.1は入球・ブレイク得点と通常／3ファール減点、3Cは`carom_point`または保存済みイニングを反映する。
- 最終点だけ保存スコアへ強制置換する処理を廃止。通常試合はUndo後の有効共通イベント、Official Demo Data v3.1と旧履歴は既存の検証済み保存推移を共通関数内の後方互換経路で使用する。
- JPA 9-Ball Game Resultは中央マッチポイント列の実幅をGridに確保し、左右Player Cardを同幅のまま表示する。Match PointはCardへ重ならず、Player 1→Player 2順の1行表示を維持する。
- Game Result／Match Detailの共通スコア推移は、色だけに依存せずPlayer 1を実線、Player 2を破線で区別し、凡例も同じ線種に統一する。6競技の得点推移生成・X軸・Y軸・保存形式は変更しない。
- PWAキャッシュ版は `2.0-jpa9-result-lines-v1`。Official Release文書は変更していない。

## App Store v1.0 Final RC：Game Result Modal右上Close廃止（2026年8月11日）

- Product Owner採用決定により、Game Result Modalの右上×を表示しない。
- 試合進行へ戻る正式経路は「試合へ戻る」ボタンだけとし、保存済みの暫定結果を取り消してGame画面へ復帰する既存処理を維持する。
- 「ホームへ戻る」「もう一度対戦する」は維持する。BackdropタップおよびEscapeではGame Resultを閉じない。
- 中央配置、左右余白、最大幅、角丸、Fade＋Scale、背面操作不可は維持する。
- Race Picker、Result以外のModal、Picker、OverlayのClose仕様は変更しない。
- 正式決定記録：`docs/official/13_CueScore_v1.0FinalRC_GameResult_Close_Decision.md`。Decision 019としてOfficial Design Decision Log v1.3へ正式収録した。
- Game Result Close例外は、一般Modal規則を維持したままDesign System v2.1、UI Components v1.1、Official Design Decision Log v1.3へ正式反映済み。既存のv2.0／v1.0／v1.2は履歴として保持する。

## App Store v1.0 RC：Player Analytics競技別統計3指標（2026年8月10日）

- Player Analyticsの統計定義を採用済みGame Result仕様へ統一。
- 9 Ball・10 Ball：シュート率／マス割／平均ファール。
- Rotation：ハイラン／シュート率／平均ファール。
- JPA 9 Ball・Straight Pool（14.1）・Three Cushion（3C）：アベレージ／ハイラン／平均ファール。
- 現在の変化、変化の根拠では既存カード構造を維持し、競技選択時に統計ラベルと値だけを切り替える。
- 成長の推移、グラフ、次のアドバイス、配色、余白は変更していない。
- 正式決定記録：`docs/official/09_CueScore_v1.0RC_Player_Analytics_Discipline_Statistics_Spec.md`。

## v1.0 Final RC：Player Analytics／Match Analytics表示整合（2026年8月12日）

- Product Owner採用により、新規分析機能を追加せず、既存保存データから説明できる範囲で分析表示を整合。
- Player Analyticsは採用済み競技別3指標を維持し、勝率と各指標の方向性を組み合わせて状態を判定する。シュート率・マス割・ハイラン・アベレージは高い方、平均ファールは少ない方を改善として扱う。
- 改善と悪化が混在する場合は「安定」とし、好調／要調整を断定しない。前期間または現在期間が3試合未満の場合は「蓄積中」とする。
- 「現在の変化」は競技別指標の結論、「変化の根拠」は前期間値から現在値への比較として役割を分離。
- Match Analyticsは9 Ball／10 Ball＝シュート率・マス割・ファール、Rotation＝ハイラン・シュート率・ファール、JPA 9 Ball／14.1／3C＝アベレージ・ハイラン・ファールを使用。保存値が存在しない指標は推測コメントを生成しない。
- `punishedRate < 40`だけを理由にファール関連文を「良かった点」へ追加しない。ファール増加・ファール多数は改善側として扱わない。
- 実イベントから算出していなかった固定の「序盤＝互角／中盤＝変化／終盤＝安定」は非表示。試合展開解析はLater。
- 遷移先のない「次のアドバイス」「振り返り」行のChevronを削除。新しい詳細画面・遷移は追加しない。
- 保存形式、既存統計定義、Official Demo Data、試合履歴、Official Releaseは変更していない。

## App Store v1.0 RC：競技別プレーヤー統計4指標（2026年8月10日 再確認）

- Product Owner採用済み仕様として、プレーヤー詳細の4カードを競技タブ別に切り替える実装へ更新。
- Rotation：試合数／ハイラン／シュート成功率／ブレイクイン率。
- 9 Ball・10 Ball：試合数／マス割率／シュート成功率／ブレイクイン率。
- JPA 9 Ball：試合数／シュート成功率／ブレイクイン率／平均イニング。
- Straight Pool（14.1）：試合数／ハイラン／シュート成功率／平均得点/イニング。
- Three Cushion（3C）：試合数／ハイラン／平均得点/イニング／おすすめ持ち点。
- ブレイクイン率は、自分のブレイクのうち「1球以上入球かつファールなし」の割合。スクラッチ、その他ファール、イリーガル、ブレイク失敗は入球があっても失敗として集計。
- 9 Ball／10 Ballのマス割率は、既存のブレイクランアウト判定による成立ラック数 ÷ 対象完了ラック数。既存判定ロジックは変更していない。
- 14.1／3Cの平均得点/イニングは、保存済み対象試合の総得点 ÷ 完了イニング総数。
- JPA 9 Ball平均イニングは、対象試合における自分の完了イニング総数 ÷ 対象試合数。0点で終了した完了イニングも総数に含め、保存済みイベントログから再計算する。
- 3Cおすすめ持ち点はNBA、JPBF、UMB等の公開原典から標準アベレージ対応表の具体値を確認できていないため、推測せず「—」表示。
- 新規保存項目・データ移行なし。既存試合とサンプルデータから表示時に再計算し、通常データとの分離や保存仕様は変更していない。
- Game Result／Player Analyticsの競技別統計とは目的と表示項目を分離し、Player Detail専用の長期プロフィール4指標として維持する。
- 2026年8月10日、最新 `main`、正式文書、現行実装、サンプルデータ互換テストを再照合し、6競技の表示切替と上記算出定義が一致することを確認。
- 正式決定記録：`docs/official/07_CueScore_Official_Design_Decision_Log_v1.2_Official_Release.docx` Decision 017（同内容を含む最新版）。

## App Store v1.0 RC：Navigation UI統一・Player Detail不具合修正（2026年8月10日）

- 戻る、編集、＋、進む、フィルター、並び替えを共通ナビゲーション・トークンへ統一。既存画面の配置は変えず、タップ領域、線幅、背景、Shadow、Padding、Corner Radiusを共通化。
- Player Detailの競技別統計集計で、プレーヤー側取得関数 `side` と同名のローカル変数を初期化式内で参照していたため、Temporal Dead Zoneによる `ReferenceError` が発生していた。
- ローカル変数を `playerSide` へ変更し、対象プレーヤーが試合に存在しない古い／不完全な履歴は安全にスキップする後方互換ガードを追加。
- 既存プレーヤー、試合履歴、サンプルデータの保存形式は変更していない。
- 正式決定記録：`docs/official/10_CueScore_v1.0RC_UI_Unification_PlayerDetail_Bugfix_Decision.md`。

## Repository Baseline

- Repository: `takaakimailbox-star/cuescore-apps`
- Default branch: `main`
- Official index: `docs/README.md`
- App Store v1.0 package: `docs/official/app-store-v1.0/`
- Implementation reports: `docs/implementation/`

## Current Product Direction

- 新機能追加より、安定した公開可能版の完成を優先。
- iPhone縦画面、Safari/Home Screen PWA体験を維持。
- 保存データ互換、バックアップ/復元、オフライン、更新動作を壊さない。

## Current Implementation State

- CueScore AppsはiPhone縦画面向けPWAと、同じWeb assets／保存schemaを使用するCapacitor Native iOSアプリとして実装されている。
- Official Demo Dataは製品上「サンプルデータ」と表示し、通常ユーザーデータと完全分離して扱う。v3.1は登録済み10プレーヤー、全6競技各20試合、合計120試合・3,523件の詳細イベントで再構築済み。
- Native iOSではFilesystem／Share経由のBackup書き出し、検証済みファイルからのBackup復元、プレーヤー写真、オフライン起動、ローカルデータ保持を実iPhoneで確認済み。
- CSV出力およびクラウド同期関連コードは将来再利用のため残しているが、App Store v1.0 release profileでは非提供。
- Native iOS foundation、App Store Connectアプリ登録、TestFlight Build 1内部配信と実機確認は完了。App Store本審査提出と一般公開は開始していない。

## v1.0 Final RC：Restore QuotaExceeded安全修正（2026年8月13日）

- 置換Restore／Merge Restoreは、復元前の現在データを同じlocalStorageへ複製せず、Player、Match History、Category、Seasonのraw値をメモリ上に保持する。
- 復元書込み後は全対象を再読込して期待値と照合する。失敗時はメモリスナップショットからロールバックし、再読込照合が成功した場合のみ「元の状態へ戻しました」と表示する。
- JSON parse失敗、Backup形式不一致、QuotaExceededError、ロールバック検証失敗を区別し、容量不足をBackup破損として案内しない。
- `rotationScoreboard.beforeLocalRestore.*`と`rotationScoreboard.beforeLocalMergeRestore.*`は新規作成しない。既存分は無条件削除せず、従来のRestore専用一時退避に限定した最大5世代の保持処理のみ維持する。
- Backup JSON、保存schema、localStorage正式キー、Player／Match record構造は変更していない。IndexedDB全面移行とStorage層の大規模変更はLaterとする。
- 正式決定：`docs/official/24_CueScore_v1.0FinalRC_Restore_QuotaExceeded_Safety_Decision.md`。正式仕様：`docs/official/25_CueScore_v1.0FinalRC_Restore_QuotaExceeded_Safety_Spec.md`。

## App Store v1.0公開準備

- 2026-08-09付の公式Markdown一式を `docs/official/app-store-v1.0/` に登録。
- 公開文書とApp Store提出資料を分離して管理。
- Privacy Policy / Terms of Use / Support の公開用HTML入口を用意。
- Privacy Policy、Terms of Use、SupportのURLと公開用連絡先は2026-08-13のStep 4で確定済み。TestFlightのApp Review連絡先はApp Store Connectへ入力済み。
- 整合確認結果を `docs/implementation/CueScore_App_Store_v1.0_Consistency_Review_2026-08-09.md` に記録。
- Native iOS化、App Store Connect登録、TestFlight Build 1内部配信と実機確認まで完了。本審査提出と一般公開は未着手。

## App Store v1.0 Final RC Step 4：公開前Legal / Support最終整備（2026年8月13日）

- Privacy Policy、Terms of Use、Supportの正式公開URLを`https://takaakimailbox-star.github.io/cuescore-apps/`配下の各公開ページへ確定した。
- 公開問い合わせ方法はメール、統一表示は`cuescore.apps@gmail.com`とし、`mailto:cuescore.apps@gmail.com`からメール作成へ進める。問い合わせフォームはVersion 1.0では非採用。
- 3ページはOfficial Markdownを正本としてfetchし、raw HTMLを許可しないDOM生成rendererで見出し、段落、箇条書き、太字、インラインコード、区切り線、リンクを通常のWeb文書として表示する。Markdown生表示は廃止した。
- Terms、Privacy、Supportから公開前TODOを削除し、正式Support URLと問い合わせ先へ到達できる状態にした。
- Terms、Privacy、Supportは同じ戻るUIと相互ナビゲーションを使用する。Settings経由は既存履歴でSettingsへ戻り、直接アクセスまたは履歴不成立時はCueScore Appsホームへ戻る。
- Settings子画面の戻るボタンは視覚上の矢印だけを表示し、「設定」「クラウド同期」の文字を表示しない。戻り先を示す`aria-label`は維持する。
- App Store提出、Release確定、スコアリング、保存schema、Backup / Restore等は本Stepでは変更していない。

## v1.0 Release Scope

- 6競技
- プレーヤー管理、メインプレーヤー、アバター／写真
- 試合進行、ブレイク入力、Undo
- 試合履歴、統計・分析、サンプルデータ（内部名称：Official Demo Data）
- オフライン利用、バックアップ／復元

## Deferred / Later

- CSV入出力
- 自動クラウド同期
- 試合共有（Match Sharing）：1台で記録した完了試合を対戦相手のCueScore Appsへ転送し、相手側の履歴・統計・分析へ取り込める機能。v1.0非搭載、v1.1以降候補。転送方式・プレーヤー紐付け・重複防止・編集競合・データ互換を正式設計してから実装する。

## 要確認事項

- App Store本審査提出時の連絡先・メタデータ最終確認
- 実提出ビルドでの6競技完走（TestFlight Build 1では基本スモークテストまで完了）
- 提出ビルドとPrivacy Policy / Review Notesの最終一致
- App Privacy、年齢制限、カテゴリ、価格・配信地域、公開スクリーンショットの最終設定
- EU向けトレーダーステータスの判断・登録

## Active Decisions

- GitHub上の正式資料と本ファイルをChatGPT/Codexの共通参照に使う。
- v1.0ではバックアップ/復元とプレーヤー写真を採用する。
- v1.0ではCSVと自動クラウド同期をLaterとして扱う。
- App Store v1.0 release profileはCSV・クラウド同期を無効化し、関連UIを表示しない。
- Official Demo Dataはv1.0提出予定範囲に含める。実提出ビルドでの収録と通常ユーザーデータからの分離確認は未実施。
- Official Demo Dataの本番向け表示は「サンプルデータ」を採用し、状態を「通常データ／サンプルデータ」、操作を「準備する／サンプルを見る／通常データへ戻る／初期状態に戻す／削除」とする。
- 試合共有（Match Sharing）はv1.0ではLaterとし、自動クラウド同期とは別の将来機能として扱う。実装開始前にProduct Ownerの再採用判断を必要とする。正式決定記録：`docs/official/12_CueScore_Later_Match_Sharing_Decision.md`。
- Native iOS foundation、実機基本機能、TestFlight Build 1、TestFlight内部運用はGO。Build 2開発はGOだが、本状態同期ではBuild 2を作成しない。
- App Store本審査提出と一般公開は未承認。Product Ownerの明示承認なしに実施しない。

## 新規試合の数値入力上限（2026年8月12日）

- 9-Ball／10-BallのRace toは1〜100、Rotation／Straight Pool（14-1）の目標点は1〜1000、Three Cushion（3C）の持ち点は1〜100の整数とする。
- JPA 9-Ballは既存のSL／Race仕様を維持し、自由入力上限の対象外とする。
- 上限は新規試合の自由入力と試合開始時の検証にのみ適用し、既存recordの読込・History／Match Detail表示・Backup／Restore・保存形式には適用しない。既存値を移行、自動補正、削除しない。

## App Store Public URLs

- Privacy Policy: https://takaakimailbox-star.github.io/cuescore-apps/privacy.html
- Support: https://takaakimailbox-star.github.io/cuescore-apps/support.html
- Terms of Use: https://takaakimailbox-star.github.io/cuescore-apps/terms.html
- 公開問い合わせ先: cuescore.apps@gmail.com
- 問い合わせ方法: メール。問い合わせフォームはVersion 1.0では非採用。
- 2026-08-09にGitHub Pages上の外部表示、Official本文読み込み、3ページ間リンクを確認済み。2026-08-13のStep 4でApp Store提出用の正式URLとして確定した。

## v1.0 RC Verification

- 回帰テスト計画: `docs/implementation/CueScore_App_Store_v1.0_RC_Regression_Test_Plan_2026-08-09.md`
- Service Workerの現行2.0系版番号にテスト期待値を統一。
- FA-IPHONE-001 Homeカード回帰を含む自動テスト125件の全成功（失敗0、スキップ0）をFinal RC整合変更の必須条件とする。

## FA-IPHONE-001：進行中試合の再起動復元（2026年8月14日）

- 進行中試合が存在してもCueScore Apps再起動時はHomeを表示し、6競技カードより上に「中断中の試合」カードを表示する。起動直後の自動復帰は採用しない。
- Home中断カード方式を維持し、Product Owner採用の2段コンパクト横長カードへ変更した。高さ目標は約90〜100pxで、1段目に「中断中の試合」・競技名・競技アイコン、2段目にPlayer 1／2・競技条件・開始時刻・「再開 ›」を表示する。
- 大きな黒い「試合を再開」ボタンは廃止し、カード全体のタップ／クリックまたはキーボード操作でGame画面へ復元する。右側の「再開 ›」は補助導線として表示する。
- 中断中に6競技カードから新規試合へ進む場合は、「中断中の試合を再開」「新しい試合を始める」「キャンセル」の3分岐を表示する。新規開始を明示選択した場合のみ現在領域の中断スナップショットを削除する。
- 進行中状態は専用schema version 1、通常キー`cueScore.inProgressMatch.v1`へ保存する。サンプルデータでは既存resolverによる専用設定キーへ分離し、通常データと混在させない。
- 6競技のPlayer、競技、Race／目標点／持ち点、得点、ラック、手番、ブレイク、イニング、ファール、入力履歴、競技固有状態、イベントログ、直近50状態のUndoを保存対象とする。
- 試合完了・履歴保存、明示的なHome復帰、ブレイク入力中の明示中断で進行中スナップショットを削除する。不正・完了済みスナップショットは復帰しない。
- 完了試合record、Backup JSON、Player、History、Analyticsの保存形式、競技ルール、既存データは変更・移行しない。
- 長いPlayer名は2段目でellipsisとし、accessible nameでは完全名を保持する。カード全体からの再開、「再開 ›」補助導線、新規試合時の3分岐、保存schema・復元ロジックは変更していない。390×844px相当のブラウザ確認後も、実iPhone Home Screen PWAでの再確認までは未完了とする。
- 現在判定：`FA-IPHONE-001: Code Fix Complete / iPhone Re-test Required`。実機再確認前にApp Store提出、Release確定、ネイティブ化へ進まない。

## FA-IPHONE-002：再起動後の中断カード保持とCompact Card v3（2026年8月14日）

- iPhone Home Screen PWAで、Homeに中断カードを表示した状態から完全終了・再起動するとカードが消える事象を確認した。
- 根本原因は、`pagehide`／`visibilitychange`から呼ばれる`persistInProgressMatchV1`が、Homeでは`pro-game-mode`でないことを理由に有効な保存済みsnapshotを削除していたこと。snapshotは終了イベント時に消えていた。
- 終了・再起動・単なるHome表示では既存snapshotを保持し、試合完了、確認付きの明示破棄、新規試合開始の明示選択、不正snapshotの場合だけ削除するようcleanup条件を修正した。`pageshow`でもHomeカードを再描画する。
- カード最終UIは2段・高さ88px。上段は「中断中の試合」・競技アイコン・`YYYY/MM/DD HH:mm`、下段はPlayer 1／2・競技条件・「再開 ›」。開始日時を優先し、取得不能時のみ保存日時へfallbackする。競技名文字は表示しない。
- Player名はellipsis、accessible nameは完全名と競技名・条件・再開操作を保持する。保存キー、schema version 1、Undo 50状態、通常／サンプル分離、Backup JSON、完了試合record、競技ルールは変更していない。
- 最終Severity：修正前はCritical候補、根本原因特定・コード修正・回帰テスト後の残存Severityは0。実iPhone再確認前は`Code Fix Complete / iPhone Re-test Required`とする。
- Product Owner実機再確認により、Home表示→PWA完全終了→Home Screen再起動後も同一カードとsnapshotが保持されることを確認した。`FA-IPHONE-002: Resolved / iPhone PASS`。
- Compact Card v4として高さ64pxの1列カードを採用した。表示は競技アイコン、Player 1 avatar＋名前、`vs`、Player 2 avatar＋名前、`再開 ›`のみとし、日時・競技条件はHomeカードから非表示にした。
- 競技アイコン34pxを左端の区切り付き独立領域に置き、Player avatar 24pxより大きく表示する。既存Player写真／preset avatar／default avatarのresolverを再利用し、新規schemaは追加しない。
- v4 UIは実iPhone再確認待ち。保存・復元、50 Undo、通常／サンプル分離、3分岐、Backup JSON、競技ルールは変更していない。
- Compact Card v4 micro adjustmentとして、競技アイコン右側のdividerを削除し、44px独立領域と余白のみでPlayer領域と区別する。Player 1／`vs`／Player 2は5px間隔の単一対戦ブロックへ統合した。その他仕様は変更していない。
- Compact Card v4のPlayer名初期描画を補正した。snapshot内の完全名を同期的に最優先し、空白／旧不完全snapshotのみ登録Player名へ即時fallbackするため、Player Libraryの後続再描画を待たずHome初回表示とPWA再起動直後から両名を表示する。
- 対戦ブロックは均等3列Gridから内容幅ベースのcompact flexへ変更した。両avatarと`vs`を固定表示し、両Player名へ同じ最大幅とellipsisを適用して、短い名前での不自然な空白と長い名前での片側占有を防止する。カード高64px、競技アイコン34px、avatar 24px、右端「再開 ›」、保存schema・復元・Undo・通常／サンプル分離・Backup JSON・競技ルールは変更していない。

## FA-IPHONE-003：Player Initial Render Delay（2026年8月14日）

- 実iPhone Home Screen PWAで、起動直後の中断カードPlayer名が空白となり画面切替後に表示されること、プレーヤー一覧も初回表示から数秒遅れることを確認した。データ消失はないため初期SeverityはMajor候補とした。
- Player LibraryのlocalStorage読込は同期だが、Player関連UIの初期化が分散していた。中断カードとメインPlayer設定は別々の`requestAnimationFrame`、プレーヤー一覧は画面を開いた時だけ描画され、Home初回表示を完成させる同期初期化経路が存在しなかった。
- `readPlayerLibrary` → プレーヤー一覧描画 → 中断カード描画 → メインPlayer設定を1回の同期初期化へ統合した。起動時と`pageshow`時に同じ処理を実行し、初回表示はtimer、画面切替、secondary refreshを待たない。
- 中断カード名はsnapshot完全名 → 登録Player Library名 → `Player 1`／`Player 2`の同期fallbackを維持した。Compact Card v4のflex、5px間隔、高さ64px、競技アイコン34px、avatar 24px、右端「再開 ›」は変更していない。
- 保存schema、Player schema、Backup JSON、50 Undo、通常／サンプル分離、History、Analytics、競技ルール、Official Releaseは変更していない。コード修正後の残存Blocker／Critical／Majorは0。実iPhone再確認前は`FA-IPHONE-003: Code Fix Complete / Player Initial Render Synchronized / iPhone Re-test Required`とする。

## サンプルデータ v3.1（2026年8月11日）

- 旧サンプル試合を使用せず、安定したPlayer IDを持つ登録済み10プレーヤーだけで決定論的に再生成する。
- 本番収録は120試合。9 Ball、10 Ball、Rotation、JPA 9 Ball、Straight Pool、Three Cushionを各20試合収録する。
- 期間は2025年4月2日〜2026年7月14日。調子、強さ、得意競技、対戦頻度を均一化しない。
- 入球、ミス、手番交代、ブレイク、スクラッチ、ブレイクファール、セーフティ、ファール、ラック結果、マス割り、得点、イニング、勝敗、Undo利用済み最終状態を詳細イベントまたは既存保存項目で保持。
- 120試合は詳細イベント3,523件、JSON約0.68 MiB、localStorage UTF-16概算約1.35 MiB。通常データとの完全分離、初期化時の決定論的復元、存在しないPlayer ID参照なしを自動テストで固定する。
- 詳細イベントを維持した500試合（約3.14 MiB）と1,000試合（約6.10 MiB）は製品へ収録せず、自動テスト／性能テスト専用として生成・集計・JSON直列化／復元を検証する。

## セーフティ成功率（Decision 018）

- 正式定義：セーフティ実行者の直後に行う相手の次手番で、有効な入球が1球も成立しなければ成功。
- 相手のミス、セーフティ返し、ファール、ファールしながらの入球は成功。有効入球が1球以上成立した場合のみ失敗。
- 成功率 ＝ 成功したセーフティ数 ÷ セーフティ実行数 × 100。
- 現行詳細記録の `safety`、相手の次手番イベント、`safety_result` で追跡可能。新しい保存項目は追加しない。根拠がない過去データは推測しない。
- サンプルデータは成功・失敗の双方と判定根拠をイベント順に保持。
- 正式決定記録：`docs/official/07_CueScore_Official_Design_Decision_Log_v1.2_Official_Release.docx` Decision 018。
