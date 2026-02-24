// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterKalei",
    products: [
        .library(name: "TreeSitterKalei", targets: ["TreeSitterKalei"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterKalei",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterKaleiTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterKalei",
            ],
            path: "bindings/swift/TreeSitterKaleiTests"
        )
    ],
    cLanguageStandard: .c11
)
