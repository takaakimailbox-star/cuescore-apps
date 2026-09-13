import XCTest

final class CueScoreStoreKitLocalUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(ja)", "-AppleLocale", "ja_JP"]
        app.launch()
        return app
    }

    private func openProFromSettings(_ app: XCUIApplication) {
        let settings = app.descendants(matching: .any).matching(
            NSPredicate(format: "label == %@", "設定")
        ).firstMatch
        XCTAssertTrue(settings.waitForExistence(timeout: 15))
        settings.tap()

        let backup = app.descendants(matching: .any).matching(
            NSPredicate(format: "label CONTAINS[c] %@", "バックアップ")
        ).firstMatch
        XCTAssertTrue(backup.waitForExistence(timeout: 10))
        backup.tap()
        XCTAssertTrue(app.staticTexts["CueScore Pro"].firstMatch.waitForExistence(timeout: 10))
    }

    func testProGateIsReachableFromSettings() throws {
        let app = launch()
        openProFromSettings(app)
    }
}
