import XCTest
import SwiftTreeSitter
import TreeSitterKalei

final class TreeSitterKaleiTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_kalei())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Kalei grammar")
    }
}
