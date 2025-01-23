import Foundation

@objc public class CapacitorServiceWorker: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
