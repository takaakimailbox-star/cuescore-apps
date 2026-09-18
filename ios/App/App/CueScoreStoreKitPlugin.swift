import Foundation
import Capacitor
import StoreKit

@objc(CueScoreStoreKitPlugin)
public final class CueScoreStoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CueScoreStoreKitPlugin"
    public let jsName = "CueScoreStoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProduct", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "currentEntitlement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    private static let proProductID = "com.takaakimailboxstar.cuescoreapps.pro"
    private var transactionUpdates: Task<Void, Never>?

    @objc override public func load() {
        transactionUpdates = Task { [weak self] in
            for await update in Transaction.updates {
                guard let self else { return }
                await self.emitPurchaseDiagnostic("TRANSACTION_UPDATE_RECEIVED")
                switch update {
                case .verified(let transaction):
                    let productIdMatched = transaction.productID == Self.proProductID
                    await self.emitPurchaseDiagnostic(
                        "TRANSACTION_UPDATE_VERIFIED",
                        ["productIdMatched": productIdMatched]
                    )
                    guard productIdMatched else { continue }
                    await transaction.finish()
                    guard !Task.isCancelled else { return }
                    let isPro = transaction.revocationDate == nil
                    await MainActor.run {
                        self.notifyListeners("entitlementChanged", data: ["verified": true, "isPro": isPro])
                    }
                    let diagnostic = await self.currentEntitlementsDiagnostic()
                    await self.emitPurchaseDiagnostic("TRANSACTION_UPDATE_ENTITLEMENT", diagnostic)
                case .unverified(let transaction, let error):
                    let nsError = error as NSError
                    await self.emitPurchaseDiagnostic(
                        "TRANSACTION_UPDATE_UNVERIFIED",
                        [
                            "productIdMatched": transaction.productID == Self.proProductID,
                            "errorDomain": nsError.domain,
                            "errorCode": nsError.code
                        ]
                    )
                }
            }
        }
    }

    deinit {
        transactionUpdates?.cancel()
    }

    @objc func getProduct(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: [Self.proProductID])
                guard let product = products.first else {
                    call.reject(
                        "CueScore Pro is not available in the current storefront.",
                        "PRODUCTS_EMPTY",
                        nil,
                        [
                            "diagnosticState": "PRODUCTS_EMPTY",
                            "productsCount": products.count
                        ]
                    )
                    return
                }
                var payload: [String: Any] = [
                    "productId": product.id,
                    "displayName": product.displayName,
                    "description": product.description,
                    "localizedPrice": product.displayPrice,
                    "diagnosticState": "PRODUCTS_OK",
                    "productsCount": products.count,
                    "productIdMatched": product.id == Self.proProductID
                ]
                if let storefront = await Storefront.current {
                    payload["storefrontCountryCode"] = storefront.countryCode
                    payload["storefrontId"] = storefront.id
                }
                call.resolve(payload)
            } catch {
                let nsError = error as NSError
                call.reject(
                    "Unable to load CueScore Pro.",
                    "STOREKIT_ERROR",
                    error,
                    [
                        "diagnosticState": "STOREKIT_ERROR",
                        "errorDomain": nsError.domain,
                        "errorCode": nsError.code
                    ]
                )
            }
        }
    }

    @objc func currentEntitlement(_ call: CAPPluginCall) {
        Task {
            let payload = await entitlementPayload()
            let diagnostic = await currentEntitlementsDiagnostic()
            await emitPurchaseDiagnostic("CURRENT_ENTITLEMENTS_RESULT", diagnostic)
            call.resolve(payload)
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            var phase = "P01 PURCHASE_NATIVE_ENTERED"
            await emitPurchaseDiagnostic(phase)
            do {
                phase = "P02 PRODUCT_FETCH_STARTED"
                await emitPurchaseDiagnostic(phase)
                let products = try await Product.products(for: [Self.proProductID])
                let product = products.first
                phase = "P03 PRODUCT_READY"
                await emitPurchaseDiagnostic(
                    phase,
                    [
                        "productsCount": products.count,
                        "productIdMatched": product?.id == Self.proProductID
                    ]
                )
                guard let product else {
                    call.reject(
                        "CueScore Pro is not available in the current storefront.",
                        "PRODUCTS_EMPTY",
                        nil,
                        ["phase": phase, "productsCount": products.count]
                    )
                    return
                }
                phase = "P04 PURCHASE_AWAIT_STARTED"
                await emitPurchaseDiagnostic(phase)
                switch try await product.purchase() {
                case .success(let result):
                    phase = "P05 PURCHASE_RESULT_RETURNED"
                    await emitPurchaseDiagnostic(phase, ["resultStatus": "SUCCESS"])
                    phase = "P06 VERIFICATION_STARTED"
                    await emitPurchaseDiagnostic(phase)
                    guard case .verified(let transaction) = result else {
                        if case .unverified(_, let error) = result {
                            let nsError = error as NSError
                            phase = "P08 UNVERIFIED"
                            await emitPurchaseDiagnostic(
                                phase,
                                ["errorDomain": nsError.domain, "errorCode": nsError.code]
                            )
                        }
                        call.reject("The App Store transaction could not be verified.")
                        return
                    }
                    phase = "P07 VERIFIED"
                    let productIdMatched = transaction.productID == Self.proProductID
                    await emitPurchaseDiagnostic(phase, ["productIdMatched": productIdMatched])
                    guard productIdMatched else {
                        call.reject("The App Store transaction could not be verified.")
                        return
                    }
                    phase = "P09 FINISH_STARTED"
                    await emitPurchaseDiagnostic(phase)
                    await transaction.finish()
                    phase = "P10 FINISH_COMPLETED"
                    await emitPurchaseDiagnostic(phase)
                    phase = "P11 BRIDGE_RESOLVE_STARTED"
                    await emitPurchaseDiagnostic(phase)
                    phase = "P12 NATIVE_SUCCESS_READY"
                    await emitPurchaseDiagnostic(phase)
                    call.resolve(["status": "success", "verified": true, "isPro": transaction.revocationDate == nil])
                case .userCancelled:
                    phase = "P05 PURCHASE_RESULT_RETURNED"
                    await emitPurchaseDiagnostic(phase, ["resultStatus": "USER_CANCELLED"])
                    phase = "P11 BRIDGE_RESOLVE_STARTED"
                    await emitPurchaseDiagnostic(phase, ["resultStatus": "USER_CANCELLED"])
                    call.resolve(["status": "cancelled", "verified": false, "isPro": false])
                case .pending:
                    phase = "P05 PURCHASE_RESULT_RETURNED"
                    await emitPurchaseDiagnostic(phase, ["resultStatus": "PENDING"])
                    phase = "P11 BRIDGE_RESOLVE_STARTED"
                    await emitPurchaseDiagnostic(phase, ["resultStatus": "PENDING"])
                    call.resolve(["status": "pending", "verified": false, "isPro": false])
                @unknown default:
                    phase = "P05 PURCHASE_RESULT_RETURNED"
                    await emitPurchaseDiagnostic(phase, ["resultStatus": "UNKNOWN"])
                    call.reject("Unknown App Store purchase result.")
                }
            } catch {
                let nsError = error as NSError
                let details: [String: Any] = [
                    "phase": phase,
                    "errorDomain": nsError.domain,
                    "errorCode": nsError.code
                ]
                await emitPurchaseDiagnostic("PURCHASE_THROW", details)
                call.reject("Unable to purchase CueScore Pro.", "PURCHASE_ERROR", error, details)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                call.resolve(await entitlementPayload())
            } catch {
                call.reject("Unable to restore App Store purchases.", nil, error)
            }
        }
    }

    private func entitlementPayload() async -> [String: Any] {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  transaction.productID == Self.proProductID,
                  transaction.revocationDate == nil else { continue }
            return ["verified": true, "isPro": true]
        }
        return ["verified": true, "isPro": false]
    }

    private func currentEntitlementsDiagnostic() async -> [String: Any] {
        var matchingVerifiedEntitlement = false
        var revoked = false
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result,
                  transaction.productID == Self.proProductID else { continue }
            matchingVerifiedEntitlement = true
            revoked = transaction.revocationDate != nil
            if !revoked { break }
        }
        return [
            "matchingVerifiedEntitlement": matchingVerifiedEntitlement,
            "revoked": revoked
        ]
    }

    @MainActor
    private func emitPurchaseDiagnostic(_ phase: String, _ details: [String: Any] = [:]) {
        var payload = details
        payload["phase"] = phase
        notifyListeners("purchaseDiagnostic", data: payload)
    }
}
