// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ClaudeStatusMonitor",
    platforms: [
        .macOS(.v12)
    ],
    products: [
        .executable(
            name: "ClaudeStatusMonitor",
            targets: ["ClaudeStatusMonitor"]
        )
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "ClaudeStatusMonitor",
            dependencies: [],
            path: "Sources"
        )
    ]
)
