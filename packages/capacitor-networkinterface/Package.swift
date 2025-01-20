// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EslymCapacitorNetworkinterface",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "EslymCapacitorNetworkinterface",
            targets: ["NetworkInterfacePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        .target(
            name: "NetworkInterfacePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/NetworkInterfacePlugin"),
        .testTarget(
            name: "NetworkInterfacePluginTests",
            dependencies: ["NetworkInterfacePlugin"],
            path: "ios/Tests/NetworkInterfacePluginTests")
    ]
)