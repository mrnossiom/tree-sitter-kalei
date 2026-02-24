/**
 * @file Kalei grammar for tree-sitter
 * @author Milo Moisson <milo@wiro.world>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "kalei",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
