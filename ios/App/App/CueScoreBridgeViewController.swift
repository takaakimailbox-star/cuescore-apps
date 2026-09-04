import Capacitor

@objc(CueScoreBridgeViewController)
final class CueScoreBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(CueScoreStoreKitPlugin())
    }
}
