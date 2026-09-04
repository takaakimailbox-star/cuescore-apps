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
                guard case .verified(let transaction) = update,
                      transaction.productID == Self.proProductID else { continue }
                await transaction.finish()
                guard !Task.isCancelled else { return }
                let isPro = transaction.revocationDate == nil
                await MainActor.run {
                    self?.notifyListeners("entitlementChanged", data: ["verified": true, "isPro": isPro])
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
                guard let product = try await Product.products(for: [Self.proProductID]).first else {
                    call.reject("CueScore Pro is not available in the current storefront.")
                    return
                }
                call.resolve([
                    "productId": product.id,
                    "displayName": product.displayName,
                    "description": product.description,
                    "localizedPrice": product.displayPrice
                ])
            } catch {
                call.reject("Unable to load CueScore Pro.", nil, error)
            }
        }
    }

    @objc func currentEntitlement(_ call: CAPPluginCall) {
        Task { call.resolve(await entitlementPayload()) }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            do {
                guard let product = try await Product.products(for: [Self.proProductID]).first else {
                    call.reject("CueScore Pro is not available in the current storefront.")
                    return
                }
                switch try await product.purchase() {
                case .success(let result):
                    guard case .verified(let transaction) = result,
                          transaction.productID == Self.proProductID else {
                        call.reject("The App Store transaction could not be verified.")
                        return
                    }
                    await transaction.finish()
                    call.resolve(["status": "success", "verified": true, "isPro": transaction.revocationDate == nil])
                case .userCancelled:
                    call.resolve(["status": "cancelled", "verified": false, "isPro": false])
                case .pending:
                    call.resolve(["status": "pending", "verified": false, "isPro": false])
                @unknown default:
                    call.reject("Unknown App Store purchase result.")
                }
            } catch {
                call.reject("Unable to purchase CueScore Pro.", nil, error)
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
}
