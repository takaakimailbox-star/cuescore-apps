import StoreKit
import StoreKitTest
import XCTest

@MainActor
final class CueScoreStoreKitLocalTests: XCTestCase {
    private static let productID = "com.takaakimailboxstar.cuescoreapps.pro"

    private func session() throws -> SKTestSession {
        let url = try XCTUnwrap(
            Bundle(for: Self.self).url(forResource: "CueScore", withExtension: "storekit")
        )
        let session = try SKTestSession(contentsOf: url)
        session.resetToDefaultState()
        session.clearTransactions()
        session.disableDialogs = true
        session.storefront = "JPN"
        session.locale = Locale(identifier: "ja_JP")
        return session
    }

    private func hasVerifiedEntitlement() async -> Bool {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  transaction.productID == Self.productID,
                  transaction.productType == .nonConsumable,
                  transaction.revocationDate == nil else { continue }
            return true
        }
        return false
    }

    private func waitForEntitlement(_ expected: Bool, timeout: TimeInterval = 10) async -> Bool {
        let deadline = Date().addingTimeInterval(timeout)
        while Date() < deadline {
            if await hasVerifiedEntitlement() == expected { return true }
            try? await Task.sleep(nanoseconds: 100_000_000)
        }
        return await hasVerifiedEntitlement() == expected
    }

    func testLocalProductPurchaseEntitlementRestartRestoreAndRefund() async throws {
        let store = try session()
        defer {
            store.resetToDefaultState()
            store.clearTransactions()
        }

        let products = try await Product.products(for: [Self.productID])
        let product = try XCTUnwrap(products.first(where: { $0.id == Self.productID }))
        XCTAssertEqual(product.type, .nonConsumable)
        XCTAssertEqual(product.price, 980)
        XCTAssertTrue(product.displayPrice.contains("980"))
        let initiallyEntitled = await hasVerifiedEntitlement()
        XCTAssertFalse(initiallyEntitled)

        let result = try await product.purchase()
        guard case .success(let verification) = result,
              case .verified(let transaction) = verification else {
            return XCTFail("Local StoreKit purchase must return a verified transaction")
        }
        XCTAssertEqual(transaction.productID, Self.productID)
        XCTAssertNil(transaction.revocationDate)
        await transaction.finish()
        let unlockedImmediately = await waitForEntitlement(true)
        XCTAssertTrue(unlockedImmediately, "Verified entitlement must unlock immediately")

        // A fresh entitlement read models a newly created app-side entitlement owner after relaunch.
        let survivesFreshRead = await hasVerifiedEntitlement()
        XCTAssertTrue(survivesFreshRead, "Verified Pro must survive a fresh entitlement read")
        try await AppStore.sync()
        let restored = await waitForEntitlement(true)
        XCTAssertTrue(restored, "Restore must preserve the verified Pro entitlement")

        let testTransaction = try XCTUnwrap(
            store.allTransactions().first(where: { $0.productIdentifier == Self.productID })
        )
        try store.refundTransaction(identifier: testTransaction.identifier)
        let returnedToFree = await waitForEntitlement(false)
        XCTAssertTrue(returnedToFree, "Refund must return the entitlement to Free")
    }

}
