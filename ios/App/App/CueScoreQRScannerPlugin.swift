import AVFoundation
@preconcurrency import Capacitor
import UIKit

@objc(CueScoreQRScannerPlugin)
public final class CueScoreQRScannerPlugin: CAPPlugin, CAPBridgedPlugin, AVCaptureMetadataOutputObjectsDelegate, @unchecked Sendable {
    public let identifier = "CueScoreQRScannerPlugin"
    public let jsName = "CueScoreQRScanner"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorizationStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startScan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopScan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise)
    ]

    private let session = AVCaptureSession()
    private let sessionQueue = DispatchQueue(label: "com.takaakimailboxstar.cuescoreapps.qrscanner")
    private var previewView: UIView?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var configured = false
    private var requestedActive = false
    private var didEmitResult = false

    @objc override public func load() {
        NotificationCenter.default.addObserver(self, selector: #selector(didEnterBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(willEnterForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        sessionQueue.async { [session] in
            if session.isRunning { session.stopRunning() }
        }
    }

    @objc public func authorizationStatus(_ call: CAPPluginCall) {
        let status = Self.permissionName(AVCaptureDevice.authorizationStatus(for: .video))
        call.resolve(["status": status])
    }

    @objc public func requestPermission(_ call: CAPPluginCall) {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        guard status == .notDetermined else {
            call.resolve(["status": Self.permissionName(status)])
            return
        }
        AVCaptureDevice.requestAccess(for: .video) { granted in
            call.resolve(["status": granted ? "authorized" : "denied"])
        }
    }

    @objc public func startScan(_ call: CAPPluginCall) {
        let authorization = AVCaptureDevice.authorizationStatus(for: .video)
        guard authorization == .authorized else {
            call.reject("Camera permission is not authorized.", "CAMERA_NOT_AUTHORIZED")
            return
        }
        guard let rect = previewRect(from: call), rect.width >= 44, rect.height >= 44 else {
            call.reject("A valid camera preview rectangle is required.", "INVALID_PREVIEW_RECT")
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let self else {
                call.reject("Camera scanner is unavailable.", "SCANNER_UNAVAILABLE")
                return
            }
            guard let webView = self.webView,
                  let hostView = webView.superview ?? self.bridge?.viewController?.view else {
                call.reject("Camera preview is unavailable.", "PREVIEW_UNAVAILABLE")
                return
            }
            let hostFrame = webView.convert(rect, to: hostView)
            guard hostFrame.width >= 44, hostFrame.height >= 44 else {
                call.reject("Camera preview coordinates are invalid.", "INVALID_PREVIEW_FRAME")
                return
            }
            self.installPreview(in: hostView, above: webView, frame: hostFrame)
            let previewAttached = self.previewView?.superview != nil
            guard previewAttached else {
                call.reject("Camera preview is unavailable.", "PREVIEW_UNAVAILABLE")
                return
            }
            self.sessionQueue.async { [weak self] in
                guard let self else { return }
                self.requestedActive = true
                self.didEmitResult = false
                do {
                    try self.configureSessionIfNeeded()
                    guard self.requestedActive else {
                        DispatchQueue.main.async {
                            self.removePreview()
                            call.resolve(["active": false])
                        }
                        return
                    }
                    if !self.session.isRunning { self.session.startRunning() }
                    let running = self.session.isRunning
                    DispatchQueue.main.async {
                        if !running {
                            self.removePreview()
                        }
                        running
                            ? call.resolve([
                                "active": true,
                                "authorization": Self.permissionName(AVCaptureDevice.authorizationStatus(for: .video)),
                                "deviceFound": true,
                                "inputAdded": true,
                                "outputAdded": true,
                                "metadataType": "qr",
                                "previewAttached": self.previewView?.superview != nil,
                                "previewWidth": self.previewView?.bounds.width ?? 0,
                                "previewHeight": self.previewView?.bounds.height ?? 0
                            ])
                            : call.reject("Camera capture did not start.", "SESSION_NOT_RUNNING")
                    }
                } catch let error as ScannerError {
                    self.requestedActive = false
                    DispatchQueue.main.async {
                        self.removePreview()
                        call.reject(error.message, error.code)
                    }
                } catch {
                    self.requestedActive = false
                    DispatchQueue.main.async {
                        self.removePreview()
                        call.reject("Camera scanner could not start.", "SCANNER_START_FAILED", error)
                    }
                }
            }
        }
    }

    @objc public func stopScan(_ call: CAPPluginCall) {
        stop(clearRequest: true, removePreview: true) {
            call.resolve(["active": false])
        }
    }

    @objc public func openSettings(_ call: CAPPluginCall) {
        guard let url = URL(string: UIApplication.openSettingsURLString), UIApplication.shared.canOpenURL(url) else {
            call.reject("Settings could not be opened.", "SETTINGS_UNAVAILABLE")
            return
        }
        UIApplication.shared.open(url, options: [:]) { opened in
            opened ? call.resolve(["opened": true]) : call.reject("Settings could not be opened.", "SETTINGS_UNAVAILABLE")
        }
    }

    public func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard requestedActive, !didEmitResult,
              let object = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              object.type == .qr,
              let value = object.stringValue else { return }
        didEmitResult = true
        requestedActive = false
        sessionQueue.async { [weak self] in
            guard let self else { return }
            if self.session.isRunning { self.session.stopRunning() }
        }
        DispatchQueue.main.async { [weak self] in
            self?.notifyListeners("scanResult", data: ["value": value])
        }
    }

    @objc private func didEnterBackground() {
        sessionQueue.async { [weak self] in
            guard let self, self.requestedActive else { return }
            if self.session.isRunning { self.session.stopRunning() }
            DispatchQueue.main.async {
                self.notifyListeners("scannerLifecycle", data: ["state": "paused"])
            }
        }
    }

    @MainActor @objc private func willEnterForeground() {
        guard requestedActive else { return }
        guard AVCaptureDevice.authorizationStatus(for: .video) == .authorized else {
            requestedActive = false
            removePreview()
            notifyListeners("scannerError", data: ["code": "CAMERA_NOT_AUTHORIZED"])
            return
        }
        sessionQueue.async { [weak self] in
            guard let self, self.configured, self.requestedActive, !self.session.isRunning else { return }
            self.session.startRunning()
            DispatchQueue.main.async {
                self.notifyListeners("scannerLifecycle", data: ["state": "resumed"])
            }
        }
    }

    private func configureSessionIfNeeded() throws {
        guard !configured else { return }
        guard let camera = AVCaptureDevice.default(for: .video) else {
            throw ScannerError(code: "CAMERA_UNAVAILABLE", message: "Camera is unavailable on this device.", reason: "noVideoDevice")
        }
        let input: AVCaptureDeviceInput
        do {
            input = try AVCaptureDeviceInput(device: camera)
        } catch {
            throw ScannerError(code: "CAMERA_INPUT_FAILED", message: "Camera input could not be created.", reason: "cannotCreateInput")
        }
        let output = AVCaptureMetadataOutput()
        session.beginConfiguration()
        defer { session.commitConfiguration() }
        let canAddInput = session.canAddInput(input)
        guard canAddInput else { throw ScannerError(code: "CAMERA_INPUT_UNAVAILABLE", message: "Camera scanner could not be configured.", reason: "cannotAddInput") }
        session.addInput(input)
        let canAddOutput = session.canAddOutput(output)
        guard canAddOutput else { throw ScannerError(code: "CAMERA_OUTPUT_UNAVAILABLE", message: "Camera scanner could not be configured.", reason: "cannotAddOutput") }
        session.addOutput(output)
        output.setMetadataObjectsDelegate(self, queue: sessionQueue)
        guard output.availableMetadataObjectTypes.contains(.qr) else {
            throw ScannerError(code: "QR_UNAVAILABLE", message: "QR scanning is unavailable on this device.", reason: "metadataQRUnavailable")
        }
        output.metadataObjectTypes = [.qr]
        configured = true
    }

    @MainActor
    private func installPreview(in hostView: UIView, above webView: UIView, frame: CGRect) {
        removePreview()
        let view = ScannerPreviewView(frame: frame)
        view.backgroundColor = .black
        view.isUserInteractionEnabled = false
        view.isAccessibilityElement = false
        view.accessibilityElementsHidden = true
        view.clipsToBounds = true
        view.layer.borderColor = UIColor.white.withAlphaComponent(0.88).cgColor
        view.layer.borderWidth = 2
        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        if let connection = layer.connection, connection.isVideoOrientationSupported { connection.videoOrientation = .portrait }
        view.previewLayer = layer
        hostView.insertSubview(view, aboveSubview: webView)
        hostView.bringSubviewToFront(view)
        previewView = view
        previewLayer = layer
    }

    @MainActor
    private func removePreview() {
        previewLayer?.removeFromSuperlayer()
        previewLayer = nil
        previewView?.removeFromSuperview()
        previewView = nil
    }

    private func stop(clearRequest: Bool, removePreview: Bool, completion: @escaping () -> Void) {
        sessionQueue.async { [weak self] in
            guard let self else { return }
            if clearRequest { self.requestedActive = false }
            if self.session.isRunning { self.session.stopRunning() }
            DispatchQueue.main.async {
                if removePreview { self.removePreview() }
                completion()
            }
        }
    }

    private func previewRect(from call: CAPPluginCall) -> CGRect? {
        guard let value = call.getObject("previewRect"),
              let x = number(value["x"]), let y = number(value["y"]),
              let width = number(value["width"]), let height = number(value["height"]),
              [x, y, width, height].allSatisfy({ $0.isFinite }) else { return nil }
        return CGRect(x: x, y: y, width: width, height: height)
    }

    private func number(_ value: Any?) -> CGFloat? {
        if let number = value as? NSNumber { return CGFloat(truncating: number) }
        if let double = value as? Double { return CGFloat(double) }
        if let integer = value as? Int { return CGFloat(integer) }
        return nil
    }

    private static func permissionName(_ status: AVAuthorizationStatus) -> String {
        switch status {
        case .notDetermined: return "notDetermined"
        case .authorized: return "authorized"
        case .denied: return "denied"
        case .restricted: return "restricted"
        @unknown default: return "unavailable"
        }
    }

}

private struct ScannerError: Error {
    let code: String
    let message: String
    let reason: String
}

@MainActor
private final class ScannerPreviewView: UIView {
    private let guideLayer = CAShapeLayer()

    override init(frame: CGRect) {
        super.init(frame: frame)
        guideLayer.fillColor = UIColor.clear.cgColor
        guideLayer.strokeColor = UIColor.white.cgColor
        guideLayer.lineWidth = 3
        guideLayer.lineCap = .square
        layer.addSublayer(guideLayer)
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        guideLayer.fillColor = UIColor.clear.cgColor
        guideLayer.strokeColor = UIColor.white.cgColor
        guideLayer.lineWidth = 3
        guideLayer.lineCap = .square
        layer.addSublayer(guideLayer)
    }

    var previewLayer: AVCaptureVideoPreviewLayer? {
        didSet {
            oldValue?.removeFromSuperlayer()
            if let previewLayer { layer.insertSublayer(previewLayer, at: 0) }
            setNeedsLayout()
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        previewLayer?.frame = bounds
        guideLayer.frame = bounds
        let inset: CGFloat = 12
        let length: CGFloat = 28
        let left = bounds.minX + inset
        let right = bounds.maxX - inset
        let top = bounds.minY + inset
        let bottom = bounds.maxY - inset
        let path = UIBezierPath()
        path.move(to: CGPoint(x: left + length, y: top)); path.addLine(to: CGPoint(x: left, y: top)); path.addLine(to: CGPoint(x: left, y: top + length))
        path.move(to: CGPoint(x: right - length, y: top)); path.addLine(to: CGPoint(x: right, y: top)); path.addLine(to: CGPoint(x: right, y: top + length))
        path.move(to: CGPoint(x: left, y: bottom - length)); path.addLine(to: CGPoint(x: left, y: bottom)); path.addLine(to: CGPoint(x: left + length, y: bottom))
        path.move(to: CGPoint(x: right - length, y: bottom)); path.addLine(to: CGPoint(x: right, y: bottom)); path.addLine(to: CGPoint(x: right, y: bottom - length))
        guideLayer.path = path.cgPath
    }
}
