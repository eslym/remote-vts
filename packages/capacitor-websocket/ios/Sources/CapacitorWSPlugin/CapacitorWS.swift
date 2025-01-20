import Foundation

@objc public class CapacitorWS: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
